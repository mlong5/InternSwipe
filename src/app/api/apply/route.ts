// NOTE: v1 stub — logs apply attempt only. Real ATS automation is out of scope.

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { applySchema } from '@/lib/validation'
import { applyRateLimiter } from '@/lib/rate-limit'
import type { ApiResponse } from '@/types'
import type { Application, SubmissionLog } from '@/generated/prisma'

interface ApplyResponse {
  application: Application
  submissionLog: SubmissionLog
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ApplyResponse>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const parseResult = applySchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json({ data: null, error: parseResult.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }

    const userId = auth.user.id

    // Rate limit: 10 requests per minute per user
    const rateLimitResult = applyRateLimiter.check(userId)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { data: null, error: 'Too many apply requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfterSeconds),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
          },
        },
      )
    }

    const { jobId, resumeId } = parseResult.data

    // Validate that the resume exists and belongs to this user
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    })
    if (!resume) {
      return NextResponse.json(
        { data: null, error: 'Resume not found. Please upload a resume first.' },
        { status: 404 },
      )
    }

    // Validate that the job exists and is eligible
    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) {
      return NextResponse.json({ data: null, error: 'Job not found' }, { status: 404 })
    }
    if (job.eligibilityStatus !== 'ELIGIBLE') {
      // Log the failed attempt before returning
      const failedApplication = await prisma.application.create({
        data: { userId, jobId, resumeId, status: 'FAILED' },
      })
      await prisma.submissionLog.create({
        data: {
          applicationId: failedApplication.id,
          attemptNo: 1,
          result: 'failed',
          errorMessage: 'Job is not eligible for quick-apply',
        },
      })
      return NextResponse.json(
        { data: null, error: 'This job is not eligible for quick-apply' },
        { status: 422 },
      )
    }

    // Block duplicate APPLIED or PENDING applications
    const blockingApplication = await prisma.application.findFirst({
      where: { userId, jobId, status: { in: ['APPLIED', 'PENDING'] } },
    })
    if (blockingApplication) {
      return NextResponse.json(
        { data: null, error: 'You have already applied to this job' },
        { status: 409 },
      )
    }

    // Check for a FAILED application — allow retry
    const failedApplication = await prisma.application.findFirst({
      where: { userId, jobId, status: 'FAILED' },
      include: { submissionLogs: true },
    })

    let application
    let attemptNo: number

    if (failedApplication) {
      // Retry: update the existing FAILED application to APPLIED
      attemptNo = failedApplication.submissionLogs.length + 1
      application = await prisma.application.update({
        where: { id: failedApplication.id },
        data: { status: 'APPLIED', resumeId },
      })
    } else {
      // New application
      attemptNo = 1
      application = await prisma.application.create({
        data: { userId, jobId, resumeId, status: 'APPLIED' },
      })
    }

    const submissionLog = await prisma.submissionLog.create({
      data: {
        applicationId: application.id,
        attemptNo,
        result: 'success',
        errorMessage: null,
      },
    })

    return NextResponse.json(
      { data: { application, submissionLog }, error: null },
      { status: 201 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
