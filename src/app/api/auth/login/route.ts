import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validation'
import type { ApiResponse } from '@/types'

interface LoginResponse {
  userId: string
  email: string
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ApiResponse<LoginResponse>>> {
  const parseResult = loginSchema.safeParse(await request.json())
  if (!parseResult.success) {
    return NextResponse.json({ data: null, error: parseResult.error.message }, { status: 400 })
  }

  const { email, password } = parseResult.data

  try {
    const supabase = await createSupabaseServerClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      return NextResponse.json({ data: null, error: authError.message }, { status: 401 })
    }

    if (!authData.user) {
      return NextResponse.json({ data: null, error: 'Login failed' }, { status: 401 })
    }

    return NextResponse.json(
      { data: { userId: authData.user.id, email: authData.user.email ?? email }, error: null },
      { status: 200 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    return NextResponse.json({ data: null, error: message }, { status: 500 })
  }
}
