import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { safeErrorMessage } from '@/lib/validation'
import { computeKeywordScore } from '@/lib/keywords'
import type { ApiResponse } from '@/types'

interface MatchItem {
  id: string
  createdAt: string
  score: number
  matchedKeywords: string[]
  jobKeywords: string[]
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

export async function GET(): Promise<NextResponse<ApiResponse<MatchItem[]>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const profile = await prisma.profile.findUnique({ where: { userId: auth.user.id } })
    const prefs = profile?.preferencesJson as { skills?: string[]; interests?: string[] } | null
    const userSelections = [...(prefs?.skills ?? []), ...(prefs?.interests ?? [])]

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
            keywords: true,
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

    // Keep only the most recent application status per job (legacy quick-apply records).
    const latestStatusByJob = new Map<string, string>()
    for (const app of applications) {
      if (!latestStatusByJob.has(app.jobId)) {
        latestStatusByJob.set(app.jobId, app.status)
      }
    }

    const items: MatchItem[] = swipes
      .map(s => {
        const appStatus = (latestStatusByJob.get(s.jobId) ?? null) as MatchItem['applicationStatus']
        const { score, jobKeywords, matched } = computeKeywordScore(
          s.job.title,
          s.job.summary,
          userSelections,
          s.job.keywords,
        )
        return {
          id: s.id,
          createdAt: s.createdAt.toISOString(),
          score,
          jobKeywords,
          matchedKeywords: matched,
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
