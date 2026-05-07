import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'
import { safeErrorMessage } from '@/lib/validation'
import type { ApiResponse } from '@/types'

export async function DELETE(): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    const auth = await requireAuth()
    if (auth.response) return auth.response

    const userId = auth.user.id

    // Deleting the User cascades to Profile, Resume, SwipeAction, Application, and SubmissionLog
    await prisma.user.delete({ where: { id: userId } })

    // Delete the Supabase auth user (service role required)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) {
      return NextResponse.json({ data: null, error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { data: { message: 'Account deleted' }, error: null },
      { status: 200 },
    )
  } catch (err) {
    return NextResponse.json({ data: null, error: safeErrorMessage(err) }, { status: 500 })
  }
}
