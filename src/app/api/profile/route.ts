import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { profileUpdateSchema } from '@/lib/validation'
import type { ApiResponse } from '@/types'
import type { Profile } from '@/generated/prisma'

export async function GET(): Promise<NextResponse<ApiResponse<Profile>>> {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ data: null, error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { data: null, error: 'Profile not found. Please create one first.' },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: profile, error: null }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<Profile>>> {
  const parseResult = profileUpdateSchema.safeParse(await request.json())
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

    const { name, phone, links, preferencesJson } = parseResult.data

    const jsonFields: Record<string, unknown> = {}
    if (links !== undefined) {
      jsonFields.links = links
    }
    if (preferencesJson !== undefined) {
      jsonFields.preferencesJson = preferencesJson
    }

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        name,
        phone: phone ?? null,
        ...jsonFields,
      },
      create: {
        userId: session.user.id,
        name,
        phone: phone ?? null,
        ...jsonFields,
      },
    })

    return NextResponse.json({ data: profile, error: null }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
