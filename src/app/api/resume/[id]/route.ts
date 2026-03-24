import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'
import type { Resume } from '@/generated/prisma'

/**
 * PATCH /api/resume/:id
 * Sets this resume as the master (primary) for the user.
 * Clears isMaster on all other resumes in the same transaction.
 */
export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<Resume>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const { id } = await params

    const existing = await prisma.resume.findFirst({
      where: { id, userId: auth.user.id },
    })
    if (!existing) {
      return NextResponse.json({ data: null, error: 'Resume not found' }, { status: 404 })
    }

    const [, resume] = await prisma.$transaction([
      // Clear master on all other resumes for this user
      prisma.resume.updateMany({
        where: { userId: auth.user.id, id: { not: id } },
        data: { isMaster: false },
      }),
      // Set master on the target resume
      prisma.resume.update({
        where: { id },
        data: { isMaster: true },
      }),
    ])

    return NextResponse.json({ data: resume, error: null }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/resume/:id
 * Deletes the resume from Supabase Storage and the database.
 * Only the owner can delete their resume.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const { id } = await params

    const resume = await prisma.resume.findFirst({
      where: { id, userId: auth.user.id },
    })

    if (!resume) {
      return NextResponse.json(
        { data: null, error: 'Resume not found' },
        { status: 404 },
      )
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { error: storageError } = await supabaseAdmin.storage
      .from('resumes')
      .remove([resume.storagePath])

    if (storageError) {
      return NextResponse.json(
        { data: null, error: storageError.message },
        { status: 500 },
      )
    }

    await prisma.resume.delete({ where: { id } })

    return NextResponse.json({ data: null, error: null }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
