import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { ApiResponse } from '@/types'
import type { Session } from '@supabase/supabase-js'

type AuthResult =
  | { session: Session; response: null }
  | { session: null; response: NextResponse<ApiResponse<never>> }

/**
 * Validates that the request has an authenticated Supabase session.
 * Returns the session on success, or a 401 JSON response on failure.
 *
 * Usage:
 *   const auth = await requireAuth()
 *   if (auth.response) return auth.response
 *   const userId = auth.session.user.id
 */
export async function requireAuth(): Promise<AuthResult> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return {
      session: null,
      response: NextResponse.json(
        { data: null, error: 'Unauthorized' },
        { status: 401 },
      ),
    }
  }

  return { session, response: null }
}
