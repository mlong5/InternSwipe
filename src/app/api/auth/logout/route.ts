import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'

interface LogoutResponse {
  message: string
}

export async function POST(): Promise<NextResponse<ApiResponse<LogoutResponse>>> {
  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { data: { message: 'Logged out successfully' }, error: null },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json(
      { data: null, error: 'Something went wrong. Please try again later.' },
      { status: 500 },
    )
  }
}
