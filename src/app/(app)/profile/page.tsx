'use client'

import { useRouter } from 'next/navigation'
import Chip from '@/components/ui/Chip'
import Button from '@/components/ui/Button'

// Stub — will be replaced with real user data
const STUB_USER = {
  name: 'Jane Doe',
  initials: 'JD',
  school: 'UC Berkeley',
  major: 'CS',
  year: 'Junior',
  skills: ['Python', 'React', 'SQL', 'ML'],
  applied: 1,
  saved: 1,
  total: 3,
}

export default function ProfilePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 font-mono">
      <div className="w-full max-w-[400px]">

        <h2 className="text-lg font-bold text-ink mb-5">Profile</h2>

        <div className="border border-border rounded-md p-5 text-center">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-full border-2 border-ink flex items-center justify-center text-base font-bold text-ink mx-auto mb-3.5">
            {STUB_USER.initials}
          </div>

          <div className="text-lg font-bold text-ink mb-0.5">{STUB_USER.name}</div>
          <div className="text-xs text-muted mb-4">
            {STUB_USER.major} @ {STUB_USER.school} · {STUB_USER.year}
          </div>

          {/* Skills */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {STUB_USER.skills.map((s) => <Chip key={s} label={s} active />)}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8">
            {[
              { n: STUB_USER.applied, l: 'Applied' },
              { n: STUB_USER.saved, l: 'Saved' },
              { n: STUB_USER.total, l: 'Total' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-xl font-bold text-ink">{s.n}</div>
                <div className="text-[10px] text-faint uppercase tracking-wide">{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3.5">
          <Button onClick={() => router.push('/')}>LOG OUT</Button>
        </div>

      </div>
    </div>
  )
}
