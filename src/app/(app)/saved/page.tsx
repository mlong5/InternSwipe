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
                className="px-3.5 py-3 border border-border rounded-xl bg-white shadow-sm"
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
