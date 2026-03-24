import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { safeErrorMessage } from '@/lib/validation'
import type { ApiResponse } from '@/types'
import type { Application } from '@/generated/prisma'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Application>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const { id } = await params
    const application = await prisma.application.findFirst({
      where: { id, userId: auth.user.id },
      include: {
        job: true,
        resume: true,
        submissionLogs: { orderBy: { attemptNo: 'asc' } },
      },
    })

    if (!application) {
      return NextResponse.json({ data: null, error: 'Application not found' }, { status: 404 })
    }

    return NextResponse.json({ data: application, error: null }, { status: 200 })
  } catch (err) {
    return NextResponse.json({ data: null, error: safeErrorMessage(err) }, { status: 500 })
  }
}
