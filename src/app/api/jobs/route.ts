import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { jobsQuerySchema, formatZodError, safeErrorMessage } from '@/lib/validation'
import type { ApiResponse } from '@/types'
import type { Job } from '@/generated/prisma'

interface PaginatedJobs {
  jobs: Job[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<PaginatedJobs>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const params = Object.fromEntries(request.nextUrl.searchParams)
    const parseResult = jobsQuerySchema.safeParse(params)
    if (!parseResult.success) {
      return NextResponse.json({ data: null, error: formatZodError(parseResult.error) }, { status: 400 })
    }

    const { page, limit, eligibility, company, search, sort, order, excludeSwiped } = parseResult.data

    const where: Record<string, unknown> = {}

    if (excludeSwiped) {
      const swipedActions = await prisma.swipeAction.findMany({
        where: { userId: auth.user.id },
        select: { jobId: true },
      })
      const swipedJobIds = swipedActions.map(s => s.jobId)
      if (swipedJobIds.length > 0) {
        where.id = { notIn: swipedJobIds }
      }
    }

    if (eligibility) {
      where.eligibilityStatus = eligibility
    }

    if (company) {
      where.company = { contains: company, mode: 'insensitive' }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    const sortField =
      sort === 'created_at' ? 'createdAt' : sort === 'company' ? 'company' : 'title'

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { [sortField]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ])

    return NextResponse.json(
      {
        data: {
          jobs,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        error: null,
      },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ data: null, error: safeErrorMessage(err) }, { status: 500 })
  }
}
