'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Job {
  id: string
  company: string
  title: string
  location: string | null
  summary: string | null
  url: string | null
}

interface BookmarkItem {
  id: string
  createdAt: string
  job: Job
}

function formatTimestamp(dateStr: string) {
  const d = new Date(dateStr)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm} ${d.toLocaleString('en-US', { month: 'long' })} ${d.getDate()}, ${d.getFullYear()}`
}

export default function SavedPage() {
  const [items, setItems] = useState<BookmarkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unsavingIds, setUnsavingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/bookmarks')
        const payload = await res.json()

        if (!res.ok || payload.error) {
          setError(payload.error ?? 'Could not load saved internships.')
          return
        }

        setItems(Array.isArray(payload.data) ? payload.data : [])
      } catch {
        setError('Could not load saved internships.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleUnsave(itemId: string, jobId: string, title: string, company: string) {
    if (!window.confirm(`Unsave ${title} at ${company}? It will reappear in your swipe deck.`)) return
    setUnsavingIds(prev => new Set(prev).add(itemId))
    try {
      const res = await fetch('/api/swipe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error ?? 'Could not unsave.')
      }
      setItems(prev => prev.filter(i => i.id !== itemId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not unsave.')
    } finally {
      setUnsavingIds(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 font-mono">
      <div className="w-full">
        <h2 className="text-lg font-bold text-ink mb-1">Saved</h2>
        <p className="text-xs text-faint mb-4">
          {loading ? '...' : `${items.length} saved internship${items.length === 1 ? '' : 's'}`}
        </p>

        {loading ? (
          <div className="text-center py-12 text-sm text-faint">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-sm text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-sm text-faint">
            No saved internships yet. Save one from the{' '}
            <Link href="/deck" className="underline text-ink">
              Swipe deck
            </Link>
            .
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="px-3.5 py-3 border border-border rounded-xl bg-card shadow-sm"
                aria-label={`${item.job.title} at ${item.job.company}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-ink truncate">{item.job.title}</h3>
                    <p className="text-xs text-muted truncate">{item.job.company}</p>
                    <p className="text-xs text-faint">📍 {item.job.location ?? 'Remote'}</p>
                  </div>
                  <span className="text-[10px] text-faint shrink-0">
                    {formatTimestamp(item.createdAt)}
                  </span>
                </div>

                {item.job.summary && (
                  <p className="text-xs text-muted mt-2 line-clamp-2">{item.job.summary}</p>
                )}

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
                    onClick={() => handleUnsave(item.id, item.job.id, item.job.title, item.job.company)}
                    disabled={unsavingIds.has(item.id)}
                    aria-label={`Unsave ${item.job.title} at ${item.job.company}`}
                    className="text-[10px] font-bold tracking-widest px-2 py-1 border border-border rounded text-faint hover:border-red-500 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                  >
                    {unsavingIds.has(item.id) ? 'UNSAVING…' : '✕ UNSAVE'}
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
