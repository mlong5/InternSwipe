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
  }
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
  const [unmatchingIds, setUnmatchingIds] = useState<Set<string>>(new Set())

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

  async function handleUnmatch(matchId: string, jobId: string, title: string, company: string) {
    if (!window.confirm(`Unmatch with ${title} at ${company}? It will reappear in your swipe deck.`)) return
    setUnmatchingIds(prev => new Set(prev).add(matchId))
    try {
      const res = await fetch('/api/swipe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error ?? 'Could not unmatch.')
      }
      setItems(prev => prev.filter(i => i.id !== matchId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not unmatch.')
    } finally {
      setUnmatchingIds(prev => {
        const next = new Set(prev)
        next.delete(matchId)
        return next
      })
    }
  }

  const avgScore =
    items.length > 0
      ? Math.round(items.reduce((sum, i) => sum + i.score, 0) / items.length)
      : null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 font-mono">
      <div className="w-full">
        <h2 className="text-lg font-bold text-ink mb-1">Matches</h2>
        <p className="text-[10px] text-faint mb-2 leading-relaxed">
          Score is based on how many of your skills (set in Profile) appear in the job description. Add more skills to improve accuracy.
        </p>
        <p className="text-xs text-faint mb-4">
          {loading ? '...' : `${items.length} match${items.length === 1 ? '' : 'es'}`}
        </p>

        {!loading && items.length > 0 && avgScore !== null && (
          <div className="flex gap-2 mb-4">
            {[
              { label: 'Matches', count: items.length },
              { label: 'Avg Score', count: `${avgScore}%` },
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
                className="px-3.5 py-3 border border-border rounded-xl bg-card shadow-sm"
                aria-label={`${item.job.title} at ${item.job.company}`}
              >
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-ink truncate">{item.job.title}</h3>
                  <p className="text-xs text-muted truncate">{item.job.company}</p>
                  <p className="text-xs text-faint">📍 {item.job.location ?? 'Remote'}</p>
                </div>

                <ScoreBar score={item.score} />

                <div className="mt-2 flex items-center justify-between gap-3">
                  {item.job.url ? (
                    <a
                      href={item.job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-ink underline"
                    >
                      Open listing
                    </a>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    onClick={() => handleUnmatch(item.id, item.job.id, item.job.title, item.job.company)}
                    disabled={unmatchingIds.has(item.id)}
                    aria-label={`Unmatch with ${item.job.title} at ${item.job.company}`}
                    className="text-[10px] font-bold tracking-widest px-2 py-1 border border-border rounded text-faint hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                  >
                    {unmatchingIds.has(item.id) ? 'UNMATCHING…' : '✕ UNMATCH'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
