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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 font-mono bg-gray-800 text-gray-300">
      <div className="w-full">
        <h2 className="text-lg font-bold text-white mb-1"> ​ Saved</h2>
        <p className="text-xs text-faint mb-4">
          {loading ? '...' : ` ​  ​ ${items.length} saved internship${items.length === 1 ? '' : 's'}`}
        </p>

        {loading ? (
          <div className="text-center py-12 text-sm text-faint">Loading...</div>
        ) : error ? (
          <div className="text-center py-12 text-sm text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-sm text-faint">
            No saved internships yet. Save one from the{' '}
            <Link href="/deck" className="underline text-white">
              Swipe deck
            </Link>
            .
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map((item) => (
              <article
                key={item.id}
                className="px-3.5 py-3 border border-border rounded-md bg-white"
                aria-label={`${item.job.title} at ${item.job.company}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{item.job.title}</h3>
                    <p className="text-xs text-gray-400 truncate">{item.job.company}</p>
                    <p className="text-xs text-gray-300">📍 {item.job.location ?? 'Remote'}</p>
                  </div>
                  <span className="text-[10px] text-gray-300 shrink-0">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {item.job.summary && (
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.job.summary}</p>
                )}

                {item.job.url && (
                  <a
                    href={item.job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-2 text-xs font-bold text-white underline"
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
