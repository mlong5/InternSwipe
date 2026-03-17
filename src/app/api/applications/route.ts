import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'
import type { Application } from '@/generated/prisma'

export async function GET(): Promise<NextResponse<ApiResponse<Application[]>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const applications = await prisma.application.findMany({
      where: { userId: auth.session.user.id },
      include: {
        job: true,
        submissionLogs: true,
      },
      orderBy: { appliedAt: 'desc' },
    })

    return NextResponse.json({ data: applications, error: null }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
