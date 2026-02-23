// NOTE: v1 stub — logs apply attempt only. Real ATS automation is out of scope.

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { applySchema } from '@/lib/validation'
import type { ApiResponse } from '@/types'
import type { Application, SubmissionLog } from '@/generated/prisma'

interface ApplyResponse {
  application: Application
  submissionLog: SubmissionLog
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<ApplyResponse>>> {
  const parseResult = applySchema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json({ data: null, error: parseResult.error.message }, { status: 400 })
  }

  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId, resumeId } = parseResult.data
    const userId = session.user.id

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

    // Check for duplicate application
    const existingApplication = await prisma.application.findFirst({
      where: { userId, jobId, status: 'APPLIED' },
    })
    if (existingApplication) {
      return NextResponse.json(
        { data: null, error: 'You have already applied to this job' },
        { status: 409 },
      )
    }

    // Create application and submission log
    const application = await prisma.application.create({
      data: { userId, jobId, resumeId, status: 'APPLIED' },
    })

    const submissionLog = await prisma.submissionLog.create({
      data: {
        applicationId: application.id,
        attemptNo: 1,
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
