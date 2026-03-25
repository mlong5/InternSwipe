import { createBrowserClient } from '@supabase/ssr'

// Database types are not generated yet. Supabase client is untyped (`Database = any`)
// until `supabase gen types typescript --project-id <id> > src/types/supabase.ts` is run
// and the generated type is passed as the generic: createBrowserClient<Database>(...)
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
