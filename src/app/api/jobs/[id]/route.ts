import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'
import type { Job } from '@/generated/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Job>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const { id } = await params
    const job = await prisma.job.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ data: null, error: 'Job not found' }, { status: 404 })
    }
    return NextResponse.json({ data: job, error: null }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
