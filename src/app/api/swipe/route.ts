import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { swipeSchema } from '@/lib/validation'
import type { ApiResponse } from '@/types'
import type { SwipeAction } from '@/generated/prisma'

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<SwipeAction>>> {
  const parseResult = swipeSchema.safeParse(await request.json())
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

    const { jobId, action } = parseResult.data

    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) {
      return NextResponse.json({ data: null, error: 'Job not found' }, { status: 404 })
    }

    const swipeAction = await prisma.swipeAction.create({
      data: {
        userId: session.user.id,
        jobId,
        action,
      },
    })

    return NextResponse.json({ data: swipeAction, error: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
