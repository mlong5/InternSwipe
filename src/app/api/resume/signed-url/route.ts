import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { safeErrorMessage } from '@/lib/validation'
import type { ApiResponse } from '@/types'

const SIGNED_URL_EXPIRY_SECONDS = 15 * 60 // 15 minutes

interface SignedUrlResponse {
  signedUrl: string
  expiresIn: number
  filename: string
}

/**
 * GET /api/resume/signed-url?resumeId=<uuid>
 *
 * Generates a signed URL for a resume file stored in Supabase Storage.
 * The URL expires after 15 minutes. Only the resume owner can request it.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<SignedUrlResponse>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const resumeId = request.nextUrl.searchParams.get('resumeId')
    if (!resumeId) {
      return NextResponse.json(
        { data: null, error: 'resumeId query parameter is required' },
        { status: 400 },
      )
    }

    // Verify the resume exists and belongs to the authenticated user
    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId: auth.session.user.id },
    })
    if (!resume) {
      return NextResponse.json(
        { data: null, error: 'Resume not found' },
        { status: 404 },
      )
    }

    // Use the service role client for storage operations so RLS doesn't block
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data, error } = await supabaseAdmin.storage
      .from('resumes')
      .createSignedUrl(resume.storagePath, SIGNED_URL_EXPIRY_SECONDS)

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { data: null, error: 'Unable to generate a download link for this resume. Please try again later.' },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        data: {
          signedUrl: data.signedUrl,
          expiresIn: SIGNED_URL_EXPIRY_SECONDS,
          filename: resume.filename,
        },
        error: null,
      },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ data: null, error: safeErrorMessage(err) }, { status: 500 })
  }
}
