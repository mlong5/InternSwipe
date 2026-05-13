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
  const [applyingId, setApplyingId]     = useState<string | null>(null)
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null)
  const [clearing, setClearing]         = useState(false)

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [appsRes, swipesRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/swipes'),
        ])

        // Track legacy application records by jobId so a RIGHT swipe for the same job doesn't duplicate
        const appItems: HistoryItem[] = []
        const appliedJobIds = new Set<string>()
        if (appsRes.ok) {
          const { data } = await appsRes.json()
          if (Array.isArray(data)) {
            data.forEach((a: { id: string; status: string; appliedAt: string; job: Job }) => {
              appItems.push({ id: a.id, status: a.status as HistoryStatus, date: a.appliedAt, job: a.job })
              appliedJobIds.add(a.job.id)
            })
          }
        }

        const matchItems: HistoryItem[] = []
        const skipItems: HistoryItem[] = []
        if (swipesRes.ok) {
          const { data } = await swipesRes.json()
          if (Array.isArray(data)) {
            data.forEach((s: { id: string; action: string; createdAt: string; job: Job }) => {
              if (s.action === 'LEFT') {
                skipItems.push({ id: s.id, status: 'SKIPPED', date: s.createdAt, job: s.job })
              } else if (s.action === 'RIGHT' && !appliedJobIds.has(s.job.id)) {
                matchItems.push({ id: s.id, status: 'APPLIED', date: s.createdAt, job: s.job })
              }
            })
          }
        }

        const merged = [...appItems, ...matchItems, ...skipItems].sort(
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
    setApplyingId(item.id)
    try {
      // Delete the LEFT swipe that's keeping this job in skipped state, then create a RIGHT swipe.
      // Right-swipe = match under the current flow (auto-apply is reserved for a future release).
      const delRes = await fetch('/api/swipe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: item.job.id }),
      })
      if (!delRes.ok) {
        const payload = await delRes.json().catch(() => null)
        showToast(payload?.error ?? 'Could not match. Please try again.', false)
        return
      }

      const matchRes = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: item.job.id, action: 'RIGHT' }),
      })
      const { data, error } = await matchRes.json()
      if (!matchRes.ok || error) {
        showToast(error ?? 'Could not match. Please try again.', false)
        return
      }

      const swipeId: string = data?.id ?? item.id
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, id: swipeId, status: 'APPLIED', date: data?.createdAt ?? i.date } : i))
      showToast(`Matched with ${item.job.title}!`, true)
    } catch {
      showToast('Something went wrong. Please try again.', false)
    } finally {
      setApplyingId(null)
    }
  }

  async function handleClearHistory() {
    if (!window.confirm('Clear all history? This permanently deletes every match, save, and pass — they will return to your swipe deck. This cannot be undone.')) return
    setClearing(true)
    try {
      const res = await fetch('/api/swipes', { method: 'DELETE' })
      const { error } = await res.json().catch(() => ({ error: null }))
      if (!res.ok || error) {
        showToast(error ?? 'Could not clear history.', false)
        return
      }
      setItems([])
      showToast('History cleared.', true)
    } catch {
      showToast('Could not clear history.', false)
    } finally {
      setClearing(false)
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
                    aria-label={`Match with ${item.job.title} at ${item.job.company}`}
                    className="w-7 h-7 rounded-full border border-border-dark flex items-center justify-center text-sm font-bold mx-auto mb-0.5 cursor-pointer hover:border-ink hover:text-ink transition-colors disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {isApplying ? '…' : '↩'}
                  </button>
                  <div className="text-[9px] text-faint font-bold tracking-wide">
                    {isApplying ? 'MATCHING' : 'MATCH'}
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
                  className="flex items-center gap-3 px-3.5 py-3 border border-border rounded-xl shadow-sm"
                >
                  {jobInfo}
                  {statusBadge}
                </div>
              ) : (
                <Link
                  key={item.id}
                  href={`/history/${item.id}`}
                  className="flex items-center gap-3 px-3.5 py-3 border border-border rounded-xl shadow-sm hover:border-accent hover:shadow-md transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  aria-label={`${item.job.title} at ${item.job.company} — ${STATUS_LABEL[item.status]}`}
                >
                  {jobInfo}
                  {statusBadge}
                </Link>
              )
            })}
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="mt-6 pt-6 border-t border-hairline">
            <button
              type="button"
              onClick={handleClearHistory}
              disabled={clearing}
              aria-label="Clear all history — deletes every match, save, and pass"
              className="w-full py-2.5 text-xs font-bold tracking-widest border-2 border-red-500 text-red-600 rounded transition-colors hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              {clearing ? 'CLEARING…' : '✕  CLEAR HISTORY'}
            </button>
            <p className="text-[10px] text-faint text-center mt-2">
              Deletes all matches, saves, and passes. Jobs return to the swipe deck.
            </p>
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
