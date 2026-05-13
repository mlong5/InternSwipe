'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

const APP_VERSION = '1.2.1'

const SKILLS = [
  'Python', 'JavaScript', 'React', 'SQL', 'Java', 'C++', 'Figma',
  'TypeScript', 'Machine Learning', 'Data Analysis', 'Node.js', 'AWS',
  'Docker', 'Git', 'Product Mgmt', 'Statistics',
]
const INTERESTS = [
  'Software Eng', 'Data Science', 'Product Design', 'Product Mgmt',
  'ML / AI', 'Cloud Infra', 'Cybersecurity', 'Fintech', 'Healthcare',
  'Climate Tech', 'EdTech', 'Robotics',
]

export default function SettingsPage() {
  const router = useRouter()

  // Notification preferences
  const [emailAlerts, setEmailAlerts] = useState(true)

  // Appearance
  const [darkMode, setDarkMode] = useState(false)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      setDarkMode(document.documentElement.classList.contains('dark'))
    }
  }, [])
  function applyTheme(next: boolean) {
    setDarkMode(next)
    if (next) {
      document.documentElement.classList.add('dark')
      try { localStorage.setItem('theme', 'dark') } catch {}
    } else {
      document.documentElement.classList.remove('dark')
      try { localStorage.setItem('theme', 'light') } catch {}
    }
  }

  // Job match preferences
  const [skills, setSkills] = useState<string[]>([])
  const [interests, setInterests] = useState<string[]>([])

  // Preserved profile fields (required by PUT /api/profile schema)
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Account deletion confirmation
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/profile')
      if (res.ok) {
        const { data } = await res.json()
        setProfileName(data?.name ?? '')
        setProfilePhone(data?.phone ?? '')
        const prefs = data?.preferencesJson ?? {}
        setSkills(prefs.skills ?? [])
        setInterests(prefs.interests ?? [])
        setEmailAlerts(prefs.emailAlerts ?? true)
      }
      setLoading(false)
    }
    load()
  }, [])

  function toggleSkill(s: string) {
    setSaved(false)
    setSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])
  }

  function toggleInterest(i: string) {
    setSaved(false)
    setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setSaveError(null)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone || undefined,
          preferencesJson: { skills, interests, emailAlerts },
        }),
      })
      const { error } = await res.json()
      if (error) setSaveError(error)
      else setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteAccount() {
    setDeleting(true)
    setDeleteError(null)
    try {
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' })
      if (!res.ok) {
        const { error } = await res.json()
        setDeleteError(error ?? 'Could not delete account. Please try again.')
        return
      }
      // Sign out client-side session and redirect to landing page
      const supabase = createSupabaseBrowserClient()
      await supabase.auth.signOut()
      router.push('/')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-muted">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 font-mono">
      <div className="w-full space-y-4">

        <h2 className="text-lg font-bold text-ink">Settings</h2>

        {/* ── Notifications ── */}
        <section className="border border-border rounded-md p-5" aria-label="Notification settings">
          <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-4">Notifications</h3>
          <button
            type="button"
            role="switch"
            aria-checked={emailAlerts}
            onClick={() => { setEmailAlerts(v => !v); setSaved(false) }}
            className="w-full flex items-center justify-between text-sm text-ink font-mono cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded"
          >
            <span>Email alerts for new matches</span>
            <span
              aria-hidden="true"
              className={`w-9 h-5 rounded-full border-2 border-ink flex items-center transition-colors ${emailAlerts ? 'bg-ink' : 'bg-card'}`}
            >
              <span className={`w-3.5 h-3.5 rounded-full bg-card border border-ink transition-transform mx-0.5 ${emailAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
            </span>
          </button>
        </section>

        {/* ── Appearance ── */}
        <section className="border border-border rounded-md p-5" aria-label="Appearance settings">
          <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-4">Appearance</h3>
          <button
            type="button"
            role="switch"
            aria-checked={darkMode}
            onClick={() => applyTheme(!darkMode)}
            className="w-full flex items-center justify-between text-sm text-ink font-mono cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded"
          >
            <span>Dark mode</span>
            <span
              aria-hidden="true"
              className={`w-9 h-5 rounded-full border-2 border-ink flex items-center transition-colors ${darkMode ? 'bg-ink' : 'bg-card'}`}
            >
              <span className={`w-3.5 h-3.5 rounded-full bg-card border border-ink transition-transform mx-0.5 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </span>
          </button>
          <p className="text-[11px] text-faint mt-2">Easier on the eyes at night. Applies immediately.</p>
        </section>

        {/* ── Job match preferences ── */}
        <section className="border border-border rounded-md p-5" aria-label="Skills preferences">
          <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-1">Skills</h3>
          <p className="text-[11px] text-faint mb-3">Update your skills to improve job matching.</p>
          <div className="flex flex-wrap gap-1.5">
            {SKILLS.map(s => (
              <Chip key={s} label={s} active={skills.includes(s)} onClick={() => toggleSkill(s)} />
            ))}
          </div>
        </section>

        <section className="border border-border rounded-md p-5" aria-label="Interest preferences">
          <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-1">Interests</h3>
          <p className="text-[11px] text-faint mb-3">Update your areas of interest for better recommendations.</p>
          <div className="flex flex-wrap gap-1.5">
            {INTERESTS.map(i => (
              <Chip key={i} label={i} active={interests.includes(i)} onClick={() => toggleInterest(i)} />
            ))}
          </div>
        </section>

        {saveError && <p role="alert" className="text-xs text-red-500">{saveError}</p>}
        {saved && <p role="status" className="text-xs text-green-600">Settings saved.</p>}

        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'SAVING...' : 'SAVE SETTINGS'}
        </Button>

        {/* ── Account ── */}
        <section className="border border-border rounded-md p-5" aria-label="Account management">
          <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-4">Account</h3>

          {!deleteConfirm ? (
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="w-full text-left text-sm text-red-600 font-mono cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 rounded"
            >
              Delete account →
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-ink leading-relaxed">
                This will permanently delete your account, all applications, and uploaded resumes.
                <strong> This cannot be undone.</strong>
              </p>
              {deleteError && (
                <p role="alert" className="text-xs text-red-500">{deleteError}</p>
              )}
              <div className="flex gap-2">
                <Button
                  onClick={() => { setDeleteConfirm(false); setDeleteError(null) }}
                  disabled={deleting}
                >
                  CANCEL
                </Button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-red-600 text-white text-xs font-bold tracking-widest rounded border-2 border-red-600 cursor-pointer disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 font-mono"
                >
                  {deleting ? 'DELETING...' : 'DELETE MY ACCOUNT'}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ── App info ── */}
        <section className="border border-border rounded-md p-5" aria-label="App information">
          <h3 className="text-xs font-bold text-ink uppercase tracking-widest mb-3">About</h3>
          <dl className="space-y-2">
            <div className="flex justify-between text-xs">
              <dt className="text-faint">App</dt>
              <dd className="text-ink font-bold">InternSwipe</dd>
            </div>
            <div className="flex justify-between text-xs">
              <dt className="text-faint">Version</dt>
              <dd className="text-ink">{APP_VERSION}</dd>
            </div>
            <div className="flex justify-between text-xs">
              <dt className="text-faint">Platform</dt>
              <dd className="text-ink">Web</dd>
            </div>
          </dl>
        </section>

      </div>
    </div>
  )
}
