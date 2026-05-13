'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

interface Job {
  id: string
  company: string
  title: string
  location: string
  summary: string
  url: string
  eligibilityStatus: 'ELIGIBLE' | 'NOT_ELIGIBLE'
}

type ToastItem = { id: number; msg: string; variant: 'apply' | 'skip' | 'save' | 'error' }

const SWIPE_THRESHOLD = 80
const SWIPE_EXIT_X = 380

export default function DeckPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [masterResumeId, setMasterResumeId] = useState<string | null>(null)
  const [idx, setIdx] = useState(0)
  const [detailOpen, setDetailOpen] = useState(false)
  const [exitDir, setExitDir] = useState<'left' | 'right' | 'bookmark' | null>(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dragStartX = useRef(0)
  const toastCounter = useRef(0)
  const detailTriggerRef = useRef<HTMLButtonElement>(null)
  const detailCloseRef = useRef<HTMLButtonElement>(null)

  // Move focus into dialog on open; return it to the trigger on close
  useEffect(() => {
    if (detailOpen) {
      requestAnimationFrame(() => detailCloseRef.current?.focus())
    }
  }, [detailOpen])
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const [jobsRes, resumeRes] = await Promise.all([
          fetch('/api/jobs?excludeSwiped=true'),
          fetch('/api/resume'),
        ])
        if (jobsRes.ok) {
          const { data } = await jobsRes.json()
          setJobs(data?.jobs ?? [])
        }
        if (resumeRes.ok) {
          const { data } = await resumeRes.json()
          if (Array.isArray(data) && data.length > 0) {
            const master = data.find((r: { isMaster: boolean; id: string }) => r.isMaster)
            setMasterResumeId(master ? master.id : data[0].id)
          }
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const card = jobs[idx]
  const done = !loading && idx >= jobs.length

  const addToast = useCallback((msg: string, variant: ToastItem['variant']) => {
    const id = ++toastCounter.current
    setToasts(prev => [...prev, { id, msg, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800)
  }, [])

  const commitSwipe = useCallback((dir: 'left' | 'right' | 'bookmark') => {
    if (!card) return

    // Block right-swipe on NOT_ELIGIBLE at UI level
    if (dir === 'right' && card.eligibilityStatus === 'NOT_ELIGIBLE') {
      addToast('Direct apply required — visit the company portal', 'error')
      setDragX(0)
      return
    }

    setExitDir(dir)
    setDragX(0)

    if (dir === 'right') addToast('Applied!', 'apply')
    else if (dir === 'left') addToast('Skipped', 'skip')
    else addToast('Saved for later', 'save') //Where save for later actually occurs

    // Record swipe in DB — bookmark maps to LEFT so the card doesn't reappear next session
    fetch('/api/swipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: card.id, action: dir === 'right' ? 'RIGHT' : dir === 'left' ? 'LEFT' : 'BOOKMARK' }),
    }).catch(() => {})

    // Submit application on right-swipe
    if (dir === 'right') {
      if (masterResumeId) {
        fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: card.id, resumeId: masterResumeId }),
        }).catch(() => {})
      } else {
        addToast('Upload a resume on your profile to apply', 'error')
      }
    }

    setTimeout(() => {
      setExitDir(null)
      setDetailOpen(false)
      setIdx(i => i + 1)
    }, 320)
  }, [card, masterResumeId, addToast])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Escape closes the detail sheet regardless of card state
      if (e.key === 'Escape') {
        if (detailOpen) {
          e.preventDefault()
          handleCloseDetail()
        }
        return
      }

      // All other shortcuts require an active, non-animating card
      if (exitDir || done || !card) return
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        commitSwipe('left')
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        commitSwipe('right')
      } else if (e.key === 'ArrowUp' || e.key === 's' || e.key === 'S' || e.key === ' ') {
        e.preventDefault()
        commitSwipe('bookmark')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [exitDir, done, card, detailOpen, commitSwipe])

  function handleCloseDetail() {
    setDetailOpen(false)
    requestAnimationFrame(() => detailTriggerRef.current?.focus())
  }

  function handleDialogKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Tab') return
    const focusable = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('button, a[href]')
    ).filter(el => !el.hasAttribute('disabled'))
    if (focusable.length === 0) return
    const first = focusable[0]!
    const last = focusable[focusable.length - 1]!
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }

  const onDragStart = (clientX: number) => {
    if (exitDir) return
    dragStartX.current = clientX
    setIsDragging(true)
  }
  const onDragMove = (clientX: number) => {
    if (!isDragging || exitDir) return
    setDragX(clientX - dragStartX.current)
  }
  const onDragEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragX > SWIPE_THRESHOLD) commitSwipe('right')
    else if (dragX < -SWIPE_THRESHOLD) commitSwipe('left')
    else setDragX(0)
  }

  const tx = exitDir
    ? exitDir === 'right' ? SWIPE_EXIT_X : exitDir === 'left' ? -SWIPE_EXIT_X : 0
    : dragX
  const ty = exitDir === 'bookmark' ? -60 : 0
  const rotate = exitDir
    ? exitDir === 'right' ? 18 : exitDir === 'left' ? -18 : 0
    : dragX * 0.06
  const cardOpacity = exitDir ? 0 : 1

  const overlayDir = exitDir ?? (dragX > 30 ? 'right' : dragX < -30 ? 'left' : null)
  const overlayOpacity = exitDir
    ? 1
    : Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono">
        <div className="text-sm text-muted">Loading jobs...</div>
      </div>
    )
  }

  if (done) {
    const noJobsAtAll = jobs.length === 0
    return (
      <div className="min-h-screen flex items-center justify-center px-6 font-mono">
        <div className="text-center max-w-[300px]">
          <h2 className="text-xl font-bold text-ink mb-2">
            {noJobsAtAll ? 'No internships yet' : 'All caught up'}
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            {noJobsAtAll
              ? 'No internships are available right now. Check back soon!'
              : 'You\u2019ve reviewed all current matches. Check back for new listings.'}
          </p>
        </div>
      </div>
    )
  }

  if (!card) return null

  const isEligible = card.eligibilityStatus === 'ELIGIBLE'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 font-mono select-none">

      {/* Job detail bottom sheet */}
      {detailOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 flex items-end justify-center"
          onClick={handleCloseDetail}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`${card.title} at ${card.company} — job details`}
            className="w-full max-w-[400px] bg-white border-t-2 border-ink rounded-t-lg p-5 pb-8"
            onClick={e => e.stopPropagation()}
            onKeyDown={handleDialogKeyDown}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-base font-bold text-ink">{card.title}</h3>
                <p className="text-sm text-muted">{card.company} · {card.location}</p>
              </div>
              <button
                ref={detailCloseRef}
                aria-label="Close job details"
                onClick={handleCloseDetail}
                className="text-faint text-xl leading-none ml-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 border rounded-sm inline-block mb-3 ${isEligible ? 'border-green-600 text-green-700' : 'border-red-400 text-red-600'}`}>
              {isEligible ? 'QUICK APPLY' : 'DIRECT APPLY ONLY'}
            </span>
            <p className="text-xs text-ink leading-relaxed mb-4 max-h-48 overflow-y-auto">
              {card.summary}
            </p>
            {card.url && (
              <a
                href={card.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold underline text-ink"
                onClick={e => e.stopPropagation()}
              >
                View original posting →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Toasts */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none"
      >
        {toasts.map(t => (
          <div
            key={t.id}
            className="px-4 py-2 rounded-full text-xs font-bold tracking-widest text-white shadow-lg"
            style={{
              background:
                t.variant === 'apply' ? '#16a34a' :
                t.variant === 'skip'  ? '#525252' :
                t.variant === 'error' ? '#dc2626' :
                                        '#2563eb',
              animation: 'toast-in 0.22s ease-out',
            }}
          >
            {t.variant === 'apply' ? '✓ ' : t.variant === 'skip' ? '✕ ' : t.variant === 'error' ? '! ' : '☆ '}
            {t.msg}
          </div>
        ))}
      </div>

      <div className="w-full max-w-[400px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-3.5">
          <h2 className="text-lg font-bold text-ink">InternSwipe</h2>
          <span className="text-xs text-faint">{idx + 1} / {jobs.length}</span>
        </div>

        {/* Card */}
        <div
          aria-label={`Job card: ${card.title} at ${card.company}`}
          aria-roledescription="swipeable job card"
          className="relative border border-border rounded-2xl overflow-hidden bg-white cursor-grab active:cursor-grabbing shadow-xl shadow-black/10"
          style={{
            transform: `translateX(${tx}px) translateY(${ty}px) rotate(${rotate}deg)`,
            opacity: cardOpacity,
            transition: isDragging
              ? 'none'
              : 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.32s ease',
            willChange: 'transform, opacity',
            touchAction: 'none',
          }}
          onMouseDown={e => onDragStart(e.clientX)}
          onMouseMove={e => onDragMove(e.clientX)}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={e => e.touches[0] && onDragStart(e.touches[0].clientX)}
          onTouchMove={e => { e.preventDefault(); e.touches[0] && onDragMove(e.touches[0].clientX) }}
          onTouchEnd={onDragEnd}
        >
          {/* Apply overlay (green) */}
          {overlayDir === 'right' && isEligible && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-lg pointer-events-none"
              style={{ background: `rgba(22,163,74,${0.18 + overlayOpacity * 0.22})` }}
            >
              <span
                className="border-[3px] border-green-600 text-green-600 font-bold text-2xl tracking-widest px-4 py-1 rounded rotate-[-12deg]"
                style={{ opacity: overlayOpacity }}
              >
                APPLY
              </span>
            </div>
          )}

          {/* Blocked overlay (red) for NOT_ELIGIBLE right swipe */}
          {overlayDir === 'right' && !isEligible && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-lg pointer-events-none"
              style={{ background: `rgba(220,38,38,${0.18 + overlayOpacity * 0.22})` }}
            >
              <span
                className="border-[3px] border-red-600 text-red-600 font-bold text-2xl tracking-widest px-4 py-1 rounded rotate-[-12deg]"
                style={{ opacity: overlayOpacity }}
              >
                BLOCKED
              </span>
            </div>
          )}

          {/* Skip overlay (gray) */}
          {overlayDir === 'left' && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-lg pointer-events-none"
              style={{ background: `rgba(82,82,82,${0.12 + overlayOpacity * 0.18})` }}
            >
              <span
                className="border-[3px] border-neutral-500 text-neutral-500 font-bold text-2xl tracking-widest px-4 py-1 rounded rotate-[12deg]"
                style={{ opacity: overlayOpacity }}
              >
                SKIP
              </span>
            </div>
          )}

          {/* Accent strip */}
          <div className="h-1 bg-gradient-to-r from-accent to-violet-500" />

          {/* Eligibility tag */}
          <div className="px-4 pt-4 flex justify-between items-start">
            <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 border rounded-sm ${isEligible ? 'border-green-600 text-green-700' : 'border-red-400 text-red-600'}`}>
              {isEligible ? 'QUICK APPLY' : 'DIRECT APPLY ONLY'}
            </span>
          </div>

          {/* Role + company */}
          <div className="px-4 pt-3">
            <h3 className="text-xl font-bold text-ink mb-0.5">{card.title}</h3>
            <p className="text-sm text-muted mb-1.5">{card.company}</p>
            <div className="flex gap-3.5 text-xs text-faint">
              <span>📍 {card.location}</span>
            </div>
          </div>

          {/* Summary preview */}
          <div className="px-4 py-3.5">
            <p className="text-xs text-muted leading-relaxed" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {card.summary}
            </p>
          </div>

          {/* View details toggle */}
          <div className="border-t border-hairline px-4 py-2.5">
            <button
              ref={detailTriggerRef}
              type="button"
              aria-label={`View details for ${card.title} at ${card.company}`}
              aria-haspopup="dialog"
              aria-expanded={detailOpen}
              onClick={e => { e.stopPropagation(); setDetailOpen(true) }}
              className="text-xs font-bold text-muted tracking-wide bg-transparent border-none cursor-pointer font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink rounded"
            >
              ▸ VIEW DETAILS
            </button>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center items-center gap-5 mt-5" role="group" aria-label="Swipe actions">
          <button
            aria-label="Skip this job"
            onClick={() => commitSwipe('left')}
            disabled={!!exitDir}
            className="w-14 h-14 rounded-full border-2 border-ink bg-white flex items-center justify-center text-xl cursor-pointer disabled:opacity-40 transition-all active:scale-90 hover:border-red-500 hover:bg-red-50 hover:text-red-500 hover:shadow-md hover:shadow-red-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
          >
            <span aria-hidden="true">✕</span>
          </button>
          <button
            aria-label="Save for later"
            onClick={() => commitSwipe('bookmark')}
            disabled={!!exitDir}
            className="w-11 h-11 rounded-full border-2 border-border-dark bg-white flex items-center justify-center text-base cursor-pointer disabled:opacity-40 transition-all active:scale-90 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-500 hover:shadow-md hover:shadow-blue-400/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
          >
            <span aria-hidden="true">☆</span>
          </button>
          <button
            aria-label={!isEligible ? 'Direct apply only — visit the company portal' : 'Apply to this job'}
            onClick={() => commitSwipe('right')}
            disabled={!!exitDir || !isEligible}
            className="w-14 h-14 rounded-full border-2 border-ink bg-white text-ink flex items-center justify-center text-xl cursor-pointer disabled:opacity-40 transition-all active:scale-90 hover:border-green-500 hover:bg-green-50 hover:text-green-500 hover:shadow-md hover:shadow-green-500/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
          >
            <span aria-hidden="true">✓</span>
          </button>
        </div>

        <div className="flex justify-center gap-8 mt-2 text-[10px] text-faint font-bold tracking-wide" aria-hidden="true">
          <span className="w-14 text-center">PASS</span>
          <span className="w-11 text-center">SAVE</span>
          <span className="w-14 text-center">{isEligible ? 'APPLY' : 'LOCKED'}</span>
        </div>

        <p className="text-center text-[9px] text-faint mt-3 tracking-wide hidden md:block" aria-hidden="true">
          ← SKIP · → APPLY · ↑ / S SAVE · ESC CLOSE
        </p>
      </div>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  )
}
