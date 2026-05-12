'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
interface MatchItem {
  id: string
  createdAt: string
  score: number
  job: {
    id: string
    company: string
    title: string
    location: string | null
    summary: string | null
    url: string | null
    eligibilityStatus: 'ELIGIBLE' | 'NOT_ELIGIBLE'
  }
  applicationStatus: 'APPLIED' | 'FAILED' | 'PENDING' | null
}

const STATUS_LABEL: Record<string, string> = {
  APPLIED: 'APPLIED',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
}

const STATUS_COLOR: Record<string, string> = {
  APPLIED: 'text-green-700 border-green-600',
  FAILED: 'text-red-600 border-red-400',
  PENDING: 'text-amber-600 border-amber-500',
}

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? '#16a34a' : score >= 65 ? '#d97706' : '#dc2626'
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
      <span className="text-[10px] font-bold text-ink shrink-0 w-8 text-right">{score}%</span>
    </div>
  )
}

export default function MatchesPage() {
  const [items, setItems] = useState<MatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/matches')
        const payload = await res.json()
        if (!res.ok || payload.error) {
          setError(payload.error ?? 'Could not load matches.')
          return
        }
        setItems(Array.isArray(payload.data) ? payload.data : [])
      } catch {
        setError('Could not load matches.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const avgScore =
    items.length > 0
      ? Math.round(items.reduce((sum, i) => sum + i.score, 0) / items.length)
      : null

  const appliedCount = items.filter(i => i.applicationStatus === 'APPLIED').length

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 font-mono">
      <div className="w-full">
        <h2 className="text-lg font-bold text-ink mb-1">Matches</h2>
        <p className="text-xs text-faint mb-4">
          {loading ? '...' : `${items.length} match${items.length === 1 ? '' : 'es'}`}
        </p>

        {!loading && items.length > 0 && avgScore !== null && (
          <div className="flex gap-2 mb-4">
            {[
              { label: 'Matches', count: items.length },
              { label: 'Avg Score', count: `${avgScore}%` },
              { label: 'Applied', count: appliedCount },
            ].map(s => (
              <div key={s.label} className="flex-1 py-2.5 border border-border rounded text-center">
                <div className="text-xl font-bold text-ink">{s.count}</div>
                <div className="text-[10px] text-faint uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-sm text-faint">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-sm text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-sm text-faint">
            No matches yet. Start swiping on the{' '}
            <Link href="/deck" className="underline text-ink">
              Swipe deck
            </Link>
            .
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map(item => (
              <article
                key={item.id}
                className="px-3.5 py-3 border border-border rounded-md bg-white"
                aria-label={`${item.job.title} at ${item.job.company}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-ink truncate">{item.job.title}</h3>
                    <p className="text-xs text-muted truncate">{item.job.company}</p>
                    <p className="text-xs text-faint">📍 {item.job.location ?? 'Remote'}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {item.applicationStatus && (
                      <span
                        className={`text-[9px] font-bold tracking-widest px-1.5 py-0.5 border rounded-sm ${STATUS_COLOR[item.applicationStatus] ?? ''}`}
                      >
                        {STATUS_LABEL[item.applicationStatus]}
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-bold tracking-widest px-1.5 py-0.5 border rounded-sm ${item.job.eligibilityStatus === 'ELIGIBLE' ? 'border-green-600 text-green-700' : 'border-red-400 text-red-600'}`}
                    >
                      {item.job.eligibilityStatus === 'ELIGIBLE' ? 'QUICK APPLY' : 'DIRECT'}
                    </span>
                  </div>
                </div>

                <ScoreBar score={item.score} />

                {item.job.url && (
                  <a
                    href={item.job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-xs font-bold text-ink underline"
                  >
                    Open listing
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
