'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import type { Resume as PrismaResume } from '@/generated/prisma'

type Resume = PrismaResume & { fileSize?: number | null }

const MAX_RESUMES = 5

function formatSize(bytes: number | null | undefined) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function ProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Profile form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [originalEmail, setOriginalEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({})
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState<'saved' | 'confirm-email' | false>(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Resume state
  const [resumes, setResumes] = useState<Resume[]>([])
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingMasterId, setSettingMasterId] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      const currentEmail = user?.email ?? ''
      setEmail(currentEmail)
      setOriginalEmail(currentEmail)

      const [profileRes, resumesRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/resume'),
      ])

      if (profileRes.ok) {
        const { data } = await profileRes.json()
        setName(data?.name ?? '')
        setPhone(data?.phone ?? '')
      }

      if (resumesRes.ok) {
        const { data } = await resumesRes.json()
        setResumes(data ?? [])
      }

      setLoading(false)
    }
    load()
  }, [])

  async function loadResumes() {
    const res = await fetch('/api/resume')
    if (res.ok) {
      const { data } = await res.json()
      setResumes(data ?? [])
    }
  }

  function validate() {
    const e: { name?: string; email?: string; phone?: string } = {}
    if (!name.trim()) e.name = 'Name is required'
    if (!email.trim()) e.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'A valid email address is required'
    if (!phone.trim()) e.phone = 'Phone is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate()) return
    setSaving(true)
    setSaveError(null)
    setSaveSuccess(false)
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      })
      const { error } = await res.json()
      if (error) { setSaveError(error); return }

      const trimmedEmail = email.trim()
      if (trimmedEmail !== originalEmail) {
        const supabase = createSupabaseBrowserClient()
        const { error: emailError } = await supabase.auth.updateUser({ email: trimmedEmail })
        if (emailError) { setSaveError(emailError.message); return }
        setSaveSuccess('confirm-email')
      } else {
        setSaveSuccess('saved')
      }
    } finally {
      setSaving(false)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (resumes.length >= MAX_RESUMES) {
      setUploadError(`You can have at most ${MAX_RESUMES} resumes. Delete one before uploading another.`)
      return
    }
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are accepted')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File must be under 5 MB')
      return
    }

    setUploadError(null) //this is odd to me
    setUploadProgress(0)

    const fd = new FormData()
    fd.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        setUploadProgress(Math.round((ev.loaded / ev.total) * 100))
      }
    }
    xhr.onload = () => {
      setUploadProgress(null)
      if (xhr.status === 201) {
        loadResumes()
      } else {
        try {
          const { error } = JSON.parse(xhr.responseText)
          setUploadError(error ?? 'Upload failed')
        } catch {
          setUploadError('Upload failed')
        }
      }
    }
    xhr.onerror = () => {
      setUploadProgress(null)
      setUploadError('Upload failed')
    }
    xhr.open('POST', '/api/resume')
    xhr.send(fd)
  }

  async function handleSetMaster(id: string) {
    setSettingMasterId(id)
    try {
      const res = await fetch(`/api/resume/${id}`, { method: 'PATCH' })
      if (res.ok) {
        setResumes(prev => prev.map(r => ({ ...r, isMaster: r.id === id })))
      }
    } finally {
      setSettingMasterId(null)
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await fetch(`/api/resume/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== id))
      } else {
        setUploadError('Failed to delete resume. Please try again.')
      }
    } finally {
      setDeletingId(null)
    }
  }

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-muted bg-gray-800 text-gray-300">
        Loading...
      </div>
    )
  }

  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((w) => (w[0] ?? '').toUpperCase())
    .slice(0, 2)
    .join('')

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 font-mono bg-gray-800 text-gray-300">
      <div className="w-full space-y-4">

        <h2 className="text-lg font-bold text-white">​ Profile</h2>

        {/* ── Profile form ── */}
        <div className="border-10 border-gray-800 border-border rounded-md p-5">
          <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-sm font-bold text-gray-300 bg-gray-700 mx-auto mb-4">
            {initials || '?'}
          </div>

          <Input
            label="Name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors(({ name: _, ...rest }) => rest) }}
            error={errors.name}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors(({ email: _, ...rest }) => rest) }}
            error={errors.email}
          />
          <Input
            label="Phone"
            placeholder="+1 (555) 000-0000"
            value={phone}
            onChange={(e) => { setPhone(e.target.value); setErrors(({ phone: _, ...rest }) => rest) }}
            error={errors.phone}
          />

          {saveError && (
            <p className="text-xs text-red-500 mb-3">{saveError}</p>
          )}
          {saveSuccess === 'saved' && (
            <p className="text-xs text-green-600 mb-3">Profile saved.</p>
          )}
          {saveSuccess === 'confirm-email' && (
            <p className="text-xs text-green-600 mb-3">Profile saved. Check your new email to confirm the address change.</p>
          )}

          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'SAVING...' : 'SAVE PROFILE'}
          </Button>
        </div>

        {/* ── Resumes ── */}
        <div className="border-10 border-gray-800 border-border rounded-md p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-white uppercase tracking-widest">Resumes</span>
            <span className="text-[10px] text-gray-400">PDF · 5 MB max · {resumes.length}/{MAX_RESUMES}</span>
          </div>

          {/* Upload button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />

          {uploadProgress !== null ? (
            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-muted mb-1">
                <span>Uploading…</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-hairline rounded-full overflow-hidden">
                <div
                  className="h-full bg-ink transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadProgress !== null || resumes.length >= MAX_RESUMES}
            >
              {resumes.length >= MAX_RESUMES ? 'LIMIT REACHED' : '+ UPLOAD RESUME'}
            </Button>
          )}

          {uploadError && (
            <p className="mt-2 text-xs text-red-500">{uploadError}</p>
          )}

          {/* Resume list */}
          {resumes.length > 0 && (
            <ul className="mt-4 space-y-2">
              {resumes.map((r) => (
                <li
                  key={r.id}
                  className={`border rounded px-3 py-2.5 transition-colors ${r.isMaster ? 'border-ink' : 'border-border'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <div>
                        <div className="text-xs font-bold text-ink truncate">{r.filename}</div>
                        {r.fileSize && (
                          <div className="text-[10px] text-faint">{formatSize(r.fileSize)}</div>
                        )}
                      </div>
                      {r.isMaster && (
                        <span
                          aria-label="Primary resume"
                          className="shrink-0 text-[9px] font-bold tracking-widest border border-ink text-ink px-1.5 py-0.5 rounded-sm"
                        >
                          ★ PRIMARY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {!r.isMaster && (
                        <button
                          aria-label={`Set ${r.filename} as primary resume`}
                          onClick={() => handleSetMaster(r.id)}
                          disabled={settingMasterId === r.id}
                          className="text-[10px] text-muted hover:text-ink transition-colors uppercase tracking-wide disabled:opacity-40 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded"
                        >
                          {settingMasterId === r.id ? '...' : 'Set primary'}
                        </button>
                      )}
                      <button
                        aria-label={`Delete ${r.filename}`}
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="text-[10px] text-muted hover:text-red-500 transition-colors uppercase tracking-wide disabled:opacity-40 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded"
                      >
                        {deletingId === r.id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {resumes.length === 0 && uploadProgress === null && (
            <p className="mt-3 text-[11px] text-faint text-center">No resumes uploaded yet.</p>
          )}
        </div>

        {/* ── Log out ── */}
        <Button onClick={handleLogout}>LOG OUT</Button>

      </div>
    </div>
  )
}
