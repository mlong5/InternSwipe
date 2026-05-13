import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { swipeSchema, formatZodError, safeErrorMessage } from '@/lib/validation'
import type { ApiResponse } from '@/types'
import type { SwipeAction } from '@/generated/prisma'

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<SwipeAction>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const parseResult = swipeSchema.safeParse(await request.json())
    if (!parseResult.success) {
      return NextResponse.json({ data: null, error: formatZodError(parseResult.error) }, { status: 400 })
    }

    const { jobId, action } = parseResult.data

    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) {
      return NextResponse.json({ data: null, error: 'Job not found' }, { status: 404 })
    }

    const swipeAction = await prisma.swipeAction.create({
      data: {
        userId: auth.user.id,
        jobId,
        action,
      },
    })

    return NextResponse.json({ data: swipeAction, error: null }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ data: null, error: safeErrorMessage(err) }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<{ deleted: number }>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const body = (await request.json().catch(() => null)) as { jobId?: unknown } | null
    const jobId = body?.jobId
    if (typeof jobId !== 'string' || jobId.length === 0) {
      return NextResponse.json({ data: null, error: 'jobId required' }, { status: 400 })
    }

    const result = await prisma.swipeAction.deleteMany({
      where: { userId: auth.user.id, jobId },
    })

    return NextResponse.json({ data: { deleted: result.count }, error: null }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ data: null, error: safeErrorMessage(err) }, { status: 500 })
  }
}
