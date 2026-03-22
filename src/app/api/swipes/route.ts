import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

export async function GET(): Promise<NextResponse<ApiResponse<unknown>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const swipes = await prisma.swipeAction.findMany({
      where: { userId: auth.user.id },
      include: { job: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: swipes, error: null }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
