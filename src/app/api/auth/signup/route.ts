import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { signupSchema } from '@/lib/validation'
import type { ApiResponse } from '@/types'

interface SignupResponse {
  userId: string
  email: string
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<SignupResponse>>> {
  const parseResult = signupSchema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json({ data: null, error: parseResult.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
  }

  const { email, password } = parseResult.data

  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ data: null, error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json(
        { data: null, error: 'Failed to create user account' },
        { status: 500 },
      )
    }

    await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
      },
    })

    return NextResponse.json(
      { data: { userId: authData.user.id, email }, error: null },
      { status: 201 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
