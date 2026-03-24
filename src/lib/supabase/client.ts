import { createBrowserClient } from '@supabase/ssr'

// Untyped client — run `supabase gen types typescript` to generate Database types when schema stabilizes.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
