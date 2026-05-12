import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { safeErrorMessage } from '@/lib/validation'
import type { ApiResponse } from '@/types'

export interface MatchItem {
  id: string
  createdAt: string
  score: number
  job: {
    id: string
    company: string
    title: string
    location: string | null
    summary: string | null
    url: string | null
    eligibilityStatus: 'ELIGIBLE' | 'NOT_ELIGIBLE'
  }
  applicationStatus: 'APPLIED' | 'FAILED' | 'PENDING' | null
}

function computeScore(
  eligibilityStatus: string,
  applicationStatus: string | null,
  jobId: string,
): number {
  // Deterministic jitter (0–10) so the same job always shows the same score
  const jitter = jobId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 11
  let score = 55
  if (eligibilityStatus === 'ELIGIBLE') score += 20
  if (applicationStatus === 'APPLIED') score += 15
  else if (applicationStatus === 'PENDING') score += 8
  else if (applicationStatus === 'FAILED') score -= 10
  return Math.min(100, Math.max(0, score + jitter))
}

export async function GET(): Promise<NextResponse<ApiResponse<MatchItem[]>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const swipes = await prisma.swipeAction.findMany({
      where: { userId: auth.user.id, action: 'RIGHT' },
      include: {
        job: {
          select: {
            id: true,
            company: true,
            title: true,
            location: true,
            summary: true,
            url: true,
            eligibilityStatus: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const jobIds = swipes.map(s => s.jobId)
    const applications = jobIds.length > 0
      ? await prisma.application.findMany({
          where: { userId: auth.user.id, jobId: { in: jobIds } },
          select: { jobId: true, status: true },
          orderBy: { appliedAt: 'desc' },
        })
      : []

    // Keep only the most recent application status per job
    const latestStatusByJob = new Map<string, string>()
    for (const app of applications) {
      if (!latestStatusByJob.has(app.jobId)) {
        latestStatusByJob.set(app.jobId, app.status)
      }
    }

    const items: MatchItem[] = swipes
      .map(s => {
        const appStatus = (latestStatusByJob.get(s.jobId) ?? null) as MatchItem['applicationStatus']
        return {
          id: s.id,
          createdAt: s.createdAt.toISOString(),
          score: computeScore(s.job.eligibilityStatus, appStatus, s.job.id),
          job: {
            id: s.job.id,
            company: s.job.company,
            title: s.job.title,
            location: s.job.location,
            summary: s.job.summary,
            url: s.job.url,
            eligibilityStatus: s.job.eligibilityStatus as 'ELIGIBLE' | 'NOT_ELIGIBLE',
          },
          applicationStatus: appStatus,
        }
      })
      .sort((a, b) => b.score - a.score)

    return NextResponse.json({ data: items, error: null }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ data: null, error: safeErrorMessage(err) }, { status: 500 })
  }
}
