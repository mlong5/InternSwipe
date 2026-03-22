'use client'

import { useState, useEffect } from 'react'
import Chip from '@/components/ui/Chip'

interface Job {
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

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function load() {
      try {
        const [appsRes, swipesRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/swipes'),
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

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)

  const appliedCount = items.filter(i => i.status === 'APPLIED').length
  const failedCount  = items.filter(i => i.status === 'FAILED').length
  const skippedCount = items.filter(i => i.status === 'SKIPPED').length

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 font-mono">
      <div className="w-full max-w-[400px]">

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
            {filtered.map(item => (
              <div key={item.id} className="flex items-center gap-3 px-3.5 py-3 border border-border rounded-md">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-ink truncate">{item.job.title}</div>
                  <div className="text-xs text-muted">{item.job.company}</div>
                  <div className="text-xs text-faint">📍 {item.job.location ?? 'Remote'}</div>
                </div>
                <div className="text-center shrink-0">
                  <div className="w-7 h-7 rounded-full border border-border-dark flex items-center justify-center text-sm font-bold mx-auto mb-0.5">
                    {STATUS_ICON[item.status]}
                  </div>
                  <div className="text-[9px] text-faint font-bold tracking-wide">{STATUS_LABEL[item.status]}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
