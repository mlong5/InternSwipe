import { createBrowserClient } from '@supabase/ssr'

// TODO: Replace with generated Supabase Database types
// once `supabase gen types typescript` has been run against the project.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
