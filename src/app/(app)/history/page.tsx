'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Chip from '@/components/ui/Chip'

interface Job {
  id: string
  company: string
  title: string
  location: string | null
}

type HistoryStatus = 'APPLIED' | 'FAILED' | 'PENDING' | 'SKIPPED'

interface HistoryItem {
  id: string
  status: HistoryStatus
  date: string
  job: Job
}

const STATUS_LABEL: Record<HistoryStatus, string> = {
  APPLIED: 'APPLIED',
  FAILED:  'FAILED',
  PENDING: 'PENDING',
  SKIPPED: 'SKIPPED',
}
const STATUS_ICON: Record<HistoryStatus, string> = {
  APPLIED: '✓',
  FAILED:  '✕',
  PENDING: '…',
  SKIPPED: '↩',
}

const FILTERS = [
  { id: 'all',     label: 'All'     },
  { id: 'APPLIED', label: 'Applied' },
  { id: 'FAILED',  label: 'Failed'  },
  { id: 'SKIPPED', label: 'Skipped' },
]

function formatTimestamp(dateStr: string) {
  const d = new Date(dateStr)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm} ${d.toLocaleString('en-US', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`
}

export default function HistoryPage() {
  const [items, setItems]               = useState<HistoryItem[]>([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('all')
  const [masterResumeId, setMasterResumeId] = useState<string | null>(null)
  const [applyingId, setApplyingId]     = useState<string | null>(null)
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [appsRes, swipesRes, resumeRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/swipes'),
          fetch('/api/resume'),
        ])

        const appItems: HistoryItem[] = []
        if (appsRes.ok) {
          const { data } = await appsRes.json()
          if (Array.isArray(data)) {
            data.forEach((a: { id: string; status: string; appliedAt: string; job: Job }) => {
              appItems.push({ id: a.id, status: a.status as HistoryStatus, date: a.appliedAt, job: a.job })
            })
          }
        }

        const skipItems: HistoryItem[] = []
        if (swipesRes.ok) {
          const { data } = await swipesRes.json()
          if (Array.isArray(data)) {
            data
              .filter((s: { action: string }) => s.action === 'LEFT')
              .forEach((s: { id: string; createdAt: string; job: Job }) => {
                skipItems.push({ id: s.id, status: 'SKIPPED', date: s.createdAt, job: s.job })
              })
          }
        }

        if (resumeRes.ok) {
          const { data } = await resumeRes.json()
          if (Array.isArray(data) && data.length > 0) {
            const master = data.find((r: { isMaster: boolean }) => r.isMaster)
            setMasterResumeId(master ? master.id : data[0].id)
          }
        }

        const merged = [...appItems, ...skipItems].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )
        setItems(merged)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleApply(item: HistoryItem) {
    if (!masterResumeId) {
      showToast('Upload a resume on your Profile page first.', false)
      return
    }
    setApplyingId(item.id)
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: item.job.id, resumeId: masterResumeId }),
      })
      const { data, error } = await res.json()
      if (!res.ok || error) {
        showToast(error ?? 'Could not apply. Please try again.', false)
      } else {
        const appId: string = data?.application?.id ?? item.id
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, id: appId, status: 'APPLIED' } : i))
        showToast(`Applied to ${item.job.title}!`, true)
      }
    } catch {
      showToast('Something went wrong. Please try again.', false)
    } finally {
      setApplyingId(null)
    }
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)

  const appliedCount = items.filter(i => i.status === 'APPLIED').length
  const failedCount  = items.filter(i => i.status === 'FAILED').length
  const skippedCount = items.filter(i => i.status === 'SKIPPED').length

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 font-mono">

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full text-xs font-bold tracking-widest text-white shadow-lg pointer-events-none"
          style={{
            background: toast.ok ? '#16a34a' : '#dc2626',
            animation: 'toast-in 0.22s ease-out',
          }}
        >
          {toast.ok ? '✓ ' : '! '}{toast.msg}
        </div>
      )}

      <div className="w-full">

        <h2 className="text-lg font-bold text-ink mb-1">History</h2>
        <p className="text-xs text-faint mb-4">
          {loading ? '...' : `${items.length} reviewed`}
        </p>

        {/* Stats */}
        {!loading && items.length > 0 && (
          <div className="flex gap-2 mb-4">
            {[
              { label: 'Applied',  count: appliedCount  },
              { label: 'Failed',   count: failedCount   },
              { label: 'Skipped',  count: skippedCount  },
            ].map(s => (
              <div key={s.label} className="flex-1 py-2.5 border border-border rounded text-center">
                <div className="text-xl font-bold text-ink">{s.count}</div>
                <div className="text-[10px] text-faint uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {FILTERS.map(f => (
            <Chip key={f.id} label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} />
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-sm text-faint">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-faint">
            {items.length === 0 ? 'No history yet — start swiping.' : 'No items for this filter.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(item => {
              const isSkipped  = item.status === 'SKIPPED'
              const isApplying = applyingId === item.id

              const statusBadge = isSkipped ? (
                <div className="text-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApply(item)}
                    disabled={isApplying}
                    aria-label={`Apply to ${item.job.title} at ${item.job.company}`}
                    className="w-7 h-7 rounded-full border border-border-dark flex items-center justify-center text-sm font-bold mx-auto mb-0.5 cursor-pointer hover:border-ink hover:text-ink transition-colors disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {isApplying ? '…' : '↩'}
                  </button>
                  <div className="text-[9px] text-faint font-bold tracking-wide">
                    {isApplying ? 'APPLYING' : 'APPLY'}
                  </div>
                </div>
              ) : (
                <div className="text-center shrink-0">
                  <div
                    className="w-7 h-7 rounded-full border border-border-dark flex items-center justify-center text-sm font-bold mx-auto mb-0.5"
                    aria-hidden="true"
                  >
                    {STATUS_ICON[item.status]}
                  </div>
                  <div className="text-[9px] text-faint font-bold tracking-wide">{STATUS_LABEL[item.status]}</div>
                </div>
              )

              const jobInfo = (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-ink truncate">{item.job.title}</div>
                  <div className="text-xs text-muted">{item.job.company}</div>
                  <div className="text-xs text-faint">📍 {item.job.location ?? 'Remote'}</div>
                  <div className="text-[10px] text-faint mt-0.5">{formatTimestamp(item.date)}</div>
                </div>
              )

              return isSkipped ? (
                <div
                  key={item.id}
                  className="flex items-center gap-3 px-3.5 py-3 border border-border rounded-md"
                >
                  {jobInfo}
                  {statusBadge}
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={`/history/${item.id}`}
                  className="flex items-center gap-3 px-3.5 py-3 border border-border rounded-md hover:border-ink transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  aria-label={`${item.job.title} at ${item.job.company} — ${STATUS_LABEL[item.status]}`}
                >
                  {jobInfo}
                  {statusBadge}
                </Link>
              )
            })}
          </div>
        )}

      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(-8px) scale(0.95); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
