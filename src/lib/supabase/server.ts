import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface CookieToSet {
  name: string
  value: string
  options: Record<string, unknown>
}

// Database types are not generated yet. Supabase client is untyped (`Database = any`)
// until `supabase gen types typescript --project-id <id> > src/types/supabase.ts` is run
// and the generated type is passed as the generic: createServerClient<Database>(...)
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The `setAll` method is called from a Server Component where
            // cookies cannot be set. This can be safely ignored when the
            // middleware refreshes the session.
          }
        },
      },
    },
  )
}
