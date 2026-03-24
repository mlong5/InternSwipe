'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Job {
  company: string
  title: string
  location: string | null
  summary: string
  url: string | null
  eligibilityStatus: string
}

interface Resume {
  filename: string
  fileSize: number | null
  isMaster: boolean
}

interface SubmissionLog {
  id: string
  attemptNo: number
  result: string
  errorMessage: string | null
  createdAt: string
}

interface Application {
  id: string
  jobId: string
  resumeId: string
  status: string
  appliedAt: string
  job: Job
  resume: Resume
  submissionLogs: SubmissionLog[]
}

const STATUS_LABEL: Record<string, string> = {
  APPLIED: 'Applied',
  FAILED:  'Failed',
  PENDING: 'Pending',
}

const STATUS_STYLE: Record<string, string> = {
  APPLIED: 'text-green-700 border-green-600 bg-green-50',
  FAILED:  'text-red-600  border-red-400  bg-red-50',
  PENDING: 'text-blue-600 border-blue-400 bg-blue-50',
}

const RESULT_STYLE: Record<string, string> = {
  SUCCESS: 'text-green-700',
  FAILED:  'text-red-600',
  ERROR:   'text-red-600',
  PENDING: 'text-blue-600',
}

function formatSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type Toast = { msg: string; variant: 'success' | 'error' }

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()

  const [app, setApp]           = useState<Application | null>(null)
  const [loading, setLoading]   = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const [toast, setToast]       = useState<Toast | null>(null)

  const showToast = useCallback((msg: string, variant: Toast['variant']) => {
    setToast({ msg, variant })
    setTimeout(() => setToast(null), 3000)
  }, [])

  async function loadApp() {
    const res = await fetch(`/api/applications/${params.id}`)
    if (res.ok) {
      const { data } = await res.json()
      setApp(data)
    } else {
      setNotFound(true)
    }
  }

  useEffect(() => {
    loadApp().finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  async function handleRetry() {
    if (!app) return
    setRetrying(true)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: app.jobId, resumeId: app.resumeId }),
      })
      const { error } = await res.json()
      if (!res.ok || error) {
        showToast(error ?? 'Retry failed. Please try again.', 'error')
        return
      }
      // Re-fetch so the updated status + new submission log entry render
      await loadApp()
      showToast('Application re-submitted successfully.', 'success')
    } catch {
      showToast('Something went wrong. Please try again.', 'error')
    } finally {
      setRetrying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-muted">
        Loading...
      </div>
    )
  }

  if (notFound || !app) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 font-mono">
        <p className="text-sm text-muted mb-4">Application not found.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-bold text-ink underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded"
        >
          ← Back to History
        </button>
      </div>
    )
  }

  const { job, resume, submissionLogs } = app
  const isEligible  = job.eligibilityStatus === 'ELIGIBLE'
  const isFailed    = app.status === 'FAILED'
  const statusStyle = STATUS_STYLE[app.status] ?? 'text-muted border-border bg-white'
  const appliedDate = new Date(app.appliedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 font-mono">

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-bold tracking-widest text-white shadow-lg pointer-events-none"
          style={{
            background: toast.variant === 'success' ? '#16a34a' : '#dc2626',
            animation: 'toast-in 0.22s ease-out',
          }}
        >
          {toast.variant === 'success' ? '✓ ' : '! '}{toast.msg}
        </div>
      )}

      <div className="w-full max-w-[400px] space-y-4">

        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-bold text-faint tracking-wide cursor-pointer hover:text-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded"
          aria-label="Back to History"
        >
          ← HISTORY
        </button>

        {/* ── Header ── */}
        <div className="border border-border rounded-md p-5">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-lg font-bold text-ink leading-tight">{job.title}</h1>
            <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 border rounded-sm shrink-0 ${statusStyle}`}>
              {STATUS_LABEL[app.status] ?? app.status}
            </span>
          </div>
          <p className="text-sm text-muted">{job.company}</p>
          <p className="text-xs text-faint mt-0.5">📍 {job.location ?? 'Remote'}</p>
          <div className="mt-3 pt-3 border-t border-hairline flex items-center justify-between text-xs text-faint">
            <span>Applied</span>
            <span className="text-ink font-bold">{appliedDate}</span>
          </div>
        </div>

        {/* ── Retry button — only for FAILED applications ── */}
        {isFailed && (
          <div className="border border-red-200 bg-red-50 rounded-md p-5">
            <p className="text-xs text-red-700 mb-3 leading-relaxed">
              This application failed. You can retry submitting it using the same resume.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              aria-label="Retry this application"
              className="w-full py-2.5 bg-ink text-white text-xs font-bold tracking-widest rounded border-2 border-ink cursor-pointer disabled:opacity-50 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink font-mono"
            >
              {retrying ? 'RETRYING...' : 'RETRY APPLICATION'}
            </button>
          </div>
        )}

        {/* ── Resume used ── */}
        <div className="border border-border rounded-md p-5">
          <h2 className="text-xs font-bold text-ink uppercase tracking-widest mb-3">Resume Used</h2>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm text-ink font-bold truncate">{resume.filename}</p>
              {resume.fileSize && (
                <p className="text-[10px] text-faint mt-0.5">{formatSize(resume.fileSize)}</p>
              )}
            </div>
            {resume.isMaster && (
              <span className="text-[9px] font-bold tracking-widest border border-ink text-ink px-2 py-0.5 rounded-sm shrink-0 ml-3">
                MASTER
              </span>
            )}
          </div>
        </div>

        {/* ── Application type ── */}
        <div className="border border-border rounded-md p-5">
          <h2 className="text-xs font-bold text-ink uppercase tracking-widest mb-2">Application Type</h2>
          <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 border rounded-sm inline-block ${isEligible ? 'border-green-600 text-green-700' : 'border-red-400 text-red-600'}`}>
            {isEligible ? 'QUICK APPLY' : 'DIRECT APPLY ONLY'}
          </span>
          {!isEligible && (
            <p className="text-[11px] text-faint mt-2">
              This role requires applying directly on the company portal.
            </p>
          )}
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs font-bold underline text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded"
            >
              View original posting →
            </a>
          )}
        </div>

        {/* ── Submission log ── */}
        <div className="border border-border rounded-md p-5">
          <h2 className="text-xs font-bold text-ink uppercase tracking-widest mb-3">Submission Log</h2>

          {submissionLogs.length === 0 ? (
            <p className="text-[11px] text-faint">No submission attempts recorded.</p>
          ) : (
            <ol className="space-y-3">
              {submissionLogs.map(log => {
                const resultStyle = RESULT_STYLE[log.result.toUpperCase()] ?? 'text-muted'
                const date = new Date(log.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric',
                })
                return (
                  <li key={log.id} className="border border-hairline rounded p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-faint">
                        Attempt <span className="font-bold text-ink">#{log.attemptNo}</span>
                      </span>
                      <time dateTime={log.createdAt} className="text-faint">{date}</time>
                    </div>
                    <div className={`text-xs font-bold uppercase tracking-wide ${resultStyle}`}>
                      {log.result}
                    </div>
                    {log.errorMessage && (
                      <p className="text-[11px] text-red-500 leading-snug">{log.errorMessage}</p>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </div>

      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  )
}
