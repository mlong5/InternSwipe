'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = () => {
    router.push('/setup')
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
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-widest font-mono border-b-2 -mb-px transition-colors
                ${tab === t ? 'text-ink border-ink' : 'text-faint border-transparent'}`}
            >
              {t === 'login' ? 'LOG IN' : 'SIGN UP'}
            </button>
          ))}
        </div>

        {/* SSO */}
        <Button onClick={() => {}} className="mb-5">◊ UNIVERSITY SSO</Button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5 text-xs text-faint">
          <div className="flex-1 h-px bg-hairline" />
          OR
          <div className="flex-1 h-px bg-hairline" />
        </div>

        {tab === 'signup' && (
          <Input label="Full Name" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <Input label="Email" placeholder="jane@university.edu" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="mt-2">
          <Button variant="primary" onClick={handleSubmit}>
            {tab === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'} →
          </Button>
        </div>

        {tab === 'login' && (
          <p className="text-xs text-faint text-center mt-4 underline cursor-pointer">Forgot password?</p>
        )}

      </div>
    </div>
  )
}
