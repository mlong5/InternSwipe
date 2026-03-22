import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'
import type { Resume } from '@/generated/prisma'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

/**
 * GET /api/resume
 * Returns all resumes belonging to the authenticated user.
 */
export async function GET(): Promise<NextResponse<ApiResponse<Resume[]>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const resumes = await prisma.resume.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ data: resumes, error: null }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}

/**
 * POST /api/resume
 * Accepts multipart/form-data with a `file` field (PDF, max 5 MB).
 * Uploads the file to Supabase Storage and creates a DB record.
 */
export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<Resume>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { data: null, error: 'A file is required' },
        { status: 400 },
      )
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { data: null, error: 'Only PDF files are accepted' },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { data: null, error: 'File must be under 5 MB' },
        { status: 400 },
      )
    }

    const resumeId = crypto.randomUUID()
    const storagePath = `${auth.user.id}/${resumeId}.pdf`

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const bytes = await file.arrayBuffer()
    const { error: uploadError } = await supabaseAdmin.storage
      .from('resumes')
      .upload(storagePath, bytes, { contentType: 'application/pdf' })

    if (uploadError) {
      return NextResponse.json(
        { data: null, error: uploadError.message },
        { status: 500 },
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resume = await (prisma.resume as any).create({
      data: {
        id: resumeId,
        userId: auth.user.id,
        filename: file.name,
        storagePath,
        fileSize: file.size,
      },
    })

    return NextResponse.json({ data: resume, error: null }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
