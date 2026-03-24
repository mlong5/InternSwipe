'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Job {
  id: string
  company: string
  title: string
  location: string | null
  summary: string
  url: string
  eligibilityStatus: string
}

interface SubmissionLog {
  id: string
  event: string
  message: string | null
  createdAt: string
}

interface Application {
  id: string
  status: string
  appliedAt: string
  job: Job
  submissionLogs: SubmissionLog[]
}

const STATUS_LABEL: Record<string, string> = {
  APPLIED:  'Applied',
  FAILED:   'Failed',
  PENDING:  'Pending',
  SKIPPED:  'Skipped',
}

const STATUS_STYLE: Record<string, string> = {
  APPLIED:  'text-green-700 border-green-600',
  FAILED:   'text-red-600 border-red-400',
  PENDING:  'text-blue-600 border-blue-400',
  SKIPPED:  'text-muted border-border',
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/applications/${params.id}`)
      if (res.ok) {
        const { data } = await res.json()
        setApplication(data)
      } else {
        setNotFound(true)
      }
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm text-muted">
        Loading...
      </div>
    )
  }

  if (notFound || !application) {
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

  const { job, submissionLogs } = application
  const isEligible = job.eligibilityStatus === 'ELIGIBLE'
  const statusStyle = STATUS_STYLE[application.status] ?? 'text-muted border-border'
  const appliedDate = new Date(application.appliedAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 font-mono">
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

        {/* Header card */}
        <div className="border border-border rounded-md p-5">
          <div className="flex items-start justify-between gap-3 mb-1">
            <h1 className="text-lg font-bold text-ink leading-tight">{job.title}</h1>
            <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 border rounded-sm shrink-0 ${statusStyle}`}>
              {STATUS_LABEL[application.status] ?? application.status}
            </span>
          </div>
          <p className="text-sm text-muted">{job.company}</p>
          <p className="text-xs text-faint mt-0.5">📍 {job.location ?? 'Remote'}</p>
          <p className="text-xs text-faint mt-2">Applied {appliedDate}</p>
        </div>

        {/* Application type */}
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
        </div>

        {/* Job description */}
        <div className="border border-border rounded-md p-5">
          <h2 className="text-xs font-bold text-ink uppercase tracking-widest mb-3">Job Description</h2>
          <p className="text-xs text-muted leading-relaxed">{job.summary}</p>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs font-bold underline text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded"
            >
              View original posting →
            </a>
          )}
        </div>

        {/* Activity log */}
        {submissionLogs.length > 0 && (
          <div className="border border-border rounded-md p-5">
            <h2 className="text-xs font-bold text-ink uppercase tracking-widest mb-3">Activity</h2>
            <ol className="space-y-2">
              {submissionLogs.map(log => (
                <li key={log.id} className="flex gap-3 text-xs">
                  <time
                    dateTime={log.createdAt}
                    className="text-faint shrink-0"
                  >
                    {new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </time>
                  <span className="text-muted">{log.message ?? log.event}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {submissionLogs.length === 0 && (
          <div className="border border-border rounded-md p-5">
            <h2 className="text-xs font-bold text-ink uppercase tracking-widest mb-2">Activity</h2>
            <p className="text-[11px] text-faint">No activity logged yet.</p>
          </div>
        )}

      </div>
    </div>
  )
}
