'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    setLoading(true)
    try {
      if (tab === 'login') {
        const supabase = createSupabaseBrowserClient()
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
        if (authError) { setError(authError.message); return }
        router.push('/deck')
      } else {
        // Sign up via our API so the Prisma user record is created alongside the auth user
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const { error: apiError } = await res.json()
        if (apiError) { setError(apiError); return }
        // After server-side signup the session cookies are set; sign in client-side to sync them
        const supabase = createSupabaseBrowserClient()
        await supabase.auth.signInWithPassword({ email, password })
        router.push('/setup')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 font-mono">
      <div className="w-full max-w-[380px]">

        <Link href="/" className="text-xs text-faint mb-7 inline-block hover:text-muted">
          ← Back
        </Link>

        <h2 className="text-2xl font-bold text-ink mb-1">InternSwipe</h2>
        <p className="text-sm text-muted mb-7">
          {tab === 'login' ? 'Welcome back' : 'Create account'}
        </p>

        {/* Tabs */}
        <div className="flex mb-6 border-b border-hairline">
          {(['login', 'signup'] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null) }}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest font-mono border-b-2 -mb-px transition-colors
                ${tab === t ? 'text-ink border-ink' : 'text-faint border-transparent'}`}
            >
              {t === 'login' ? 'LOG IN' : 'SIGN UP'}
            </button>
          ))}
        </div>

        {tab === 'signup' && (
          <Input label="Full Name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <Input label="Email" placeholder="jane@university.edu" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && (
          <p className="text-xs text-red-500 mb-3">{error}</p>
        )}

        <div className="mt-2">
          <Button variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '...' : tab === 'login' ? 'LOG IN →' : 'CREATE ACCOUNT →'}
          </Button>
        </div>

        {tab === 'login' && (
          <button
            type="button"
            onClick={async () => {
              if (!email) {
                setError('Please enter your email address first.')
                return
              }
              setLoading(true)
              setError(null)
              try {
                const supabase = createSupabaseBrowserClient()
                const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                  redirectTo: `${window.location.origin}/login`,
                })
                if (resetError) {
                  setError(resetError.message)
                } else {
                  setError(null)
                  alert('Password reset link sent! Check your email.')
                }
              } finally {
                setLoading(false)
              }
            }}
            className="text-xs text-faint text-center mt-4 underline cursor-pointer w-full"
          >
            Forgot password?
          </button>
        )}

      </div>
    </div>
  )
}
