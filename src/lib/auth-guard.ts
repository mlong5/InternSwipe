import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { User } from '@supabase/supabase-js'

type AuthResult =
  | { user: User; response: null }
  | { user: null; response: NextResponse<ApiResponse<never>> }

/**
 * Validates the request by calling supabase.auth.getUser(), which re-validates
 * the JWT with the Supabase auth server. More reliable than getSession() which
 * only reads from local cookie storage and can return null for valid sessions.
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 },
      ),
    }
  }

  return { user, response: null }
}
