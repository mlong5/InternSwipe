'use client'

import { useState, useRef, useCallback } from 'react'

const LISTINGS = [
  { id: 1, company: 'Acme Corp', role: 'Software Engineer Intern', location: 'San Francisco, CA', pay: '$X,XXX/mo', match: 87, deadline: 'Oct 15', tag: 'STRONG MATCH', skills: ['Python', 'SQL', 'APIs'], scores: { technical: 92, experience: 78, gpa: 88, coursework: 84 }, peer: '72% of similar students get interviews' },
  { id: 2, company: 'Widgets Inc', role: 'Product Design Intern', location: 'New York, NY', pay: '$X,XXX/mo', match: 73, deadline: 'Nov 1', tag: 'STRETCH', skills: ['Figma', 'Research', 'Prototyping'], scores: { technical: 65, experience: 70, gpa: 90, coursework: 68 }, peer: '58% of similar students get interviews' },
  { id: 3, company: 'DataCo', role: 'Data Science Intern', location: 'Austin, TX', pay: '$X,XXX/mo', match: 81, deadline: 'Dec 1', tag: 'STRONG MATCH', skills: ['Python', 'ML', 'Statistics'], scores: { technical: 88, experience: 72, gpa: 85, coursework: 90 }, peer: '61% of similar students get interviews' },
  { id: 4, company: 'BuildIt', role: 'Frontend Intern', location: 'Remote', pay: '$X,XXX/mo', match: 79, deadline: 'Oct 28', tag: 'TRENDING', skills: ['React', 'TypeScript', 'CSS'], scores: { technical: 82, experience: 74, gpa: 86, coursework: 78 }, peer: '65% of similar students get interviews' },
  { id: 5, company: 'LearnApp', role: 'ML Engineering Intern', location: 'Pittsburgh, PA', pay: '$X,XXX/mo', match: 68, deadline: 'Nov 15', tag: 'STRETCH', skills: ['Python', 'NLP', 'TensorFlow'], scores: { technical: 74, experience: 60, gpa: 82, coursework: 72 }, peer: '52% of similar students get interviews' },
]

type ToastItem = { id: number; msg: string; variant: 'apply' | 'skip' | 'save' }

const SWIPE_THRESHOLD = 80
const SWIPE_EXIT_X = 380

export default function DeckPage() {
  const [idx, setIdx] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [exitDir, setExitDir] = useState<'left' | 'right' | 'bookmark' | null>(null)
  const [dragX, setDragX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dragStartX = useRef(0)
  const toastCounter = useRef(0)

  const card = LISTINGS[idx]
  const done = idx >= LISTINGS.length

  const addToast = useCallback((msg: string, variant: ToastItem['variant']) => {
    const id = ++toastCounter.current
    setToasts(prev => [...prev, { id, msg, variant }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2800)
  }, [])

  const commitSwipe = useCallback((dir: 'left' | 'right' | 'bookmark') => {
    // Optimistic: update UI immediately, fire-and-forget server call
    setExitDir(dir)
    setDragX(0)

    if (dir === 'right') addToast('Applied!', 'apply')
    else if (dir === 'left') addToast('Skipped', 'skip')
    else addToast('Saved for later', 'save')

    // TODO: server action here — UI already advanced
    setTimeout(() => {
      setExitDir(null)
      setExpanded(false)
      setIdx(i => i + 1)
    }, 320)
  }, [addToast])

  // Drag handlers (mouse + touch)
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

  // Card transform
  const tx = exitDir
    ? exitDir === 'right' ? SWIPE_EXIT_X : exitDir === 'left' ? -SWIPE_EXIT_X : 0
    : dragX
  const ty = exitDir === 'bookmark' ? -60 : 0
  const rotate = exitDir
    ? exitDir === 'right' ? 18 : exitDir === 'left' ? -18 : 0
    : dragX * 0.06
  const cardOpacity = exitDir ? 0 : 1

  // Overlay: show when dragging past 30px or on exit
  const overlayDir = exitDir ?? (dragX > 30 ? 'right' : dragX < -30 ? 'left' : null)
  const overlayOpacity = exitDir
    ? 1
    : Math.min(Math.abs(dragX) / SWIPE_THRESHOLD, 1)

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 font-mono">
        <div className="text-center max-w-[300px]">
          <div className="w-14 h-14 rounded-full border-2 border-ink flex items-center justify-center text-xl mx-auto mb-5">✓</div>
          <h2 className="text-xl font-bold text-ink mb-2">All caught up</h2>
          <p className="text-sm text-muted leading-relaxed">You&apos;ve reviewed all current matches. Check back for new listings.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 font-mono select-none">
      {/* Toasts */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className="px-4 py-2 rounded-full text-xs font-bold tracking-widest text-white shadow-lg"
            style={{
              background:
                t.variant === 'apply' ? '#16a34a' :
                t.variant === 'skip'  ? '#525252' :
                                        '#2563eb',
              animation: 'toast-in 0.22s ease-out',
            }}
          >
            {t.variant === 'apply' ? '✓ ' : t.variant === 'skip' ? '✕ ' : '☆ '}
            {t.msg}
          </div>
        ))}
      </div>

      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-3.5">
          <h2 className="text-lg font-bold text-ink">InternSwipe</h2>
          <span className="text-xs text-faint">{idx + 1} / {LISTINGS.length}</span>
        </div>

        {/* Card */}
        <div
          className="relative border-2 border-ink rounded-lg overflow-hidden bg-white cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${tx}px) translateY(${ty}px) rotate(${rotate}deg)`,
            opacity: cardOpacity,
            transition: isDragging
              ? 'none'
              : 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.32s ease',
            willChange: 'transform, opacity',
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
          {overlayDir === 'right' && (
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

          {/* Tag row */}
          <div className="px-4 pt-4 flex justify-between items-start">
            <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 border border-border-dark rounded-sm">
              {card.tag}
            </span>
            <span className="text-xs text-faint">⏱ {card.deadline}</span>
          </div>

          {/* Role + company */}
          <div className="px-4 pt-3">
            <h3 className="text-xl font-bold text-ink mb-0.5">{card.role}</h3>
            <p className="text-sm text-muted mb-1.5">{card.company}</p>
            <div className="flex gap-3.5 text-xs text-faint">
              <span>📍 {card.location}</span>
              <span>💰 {card.pay}</span>
            </div>
          </div>

          {/* Match score */}
          <div className="px-4 py-3.5 flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full border-[3px] border-ink flex items-center justify-center text-lg font-bold shrink-0">
              {card.match}%
            </div>
            <div>
              <div className="text-xs font-bold mb-0.5">MATCH SCORE</div>
              <div className="text-xs text-faint">Based on profile, skills &amp; peers</div>
            </div>
          </div>

          {/* Skills */}
          <div className="px-4 pb-3.5 flex flex-wrap gap-1.5">
            {card.skills.map((s) => (
              <span key={s} className="px-2.5 py-0.5 border border-border rounded text-xs text-muted">{s}</span>
            ))}
          </div>

          {/* Expandable breakdown */}
          <div className="border-t border-hairline px-4 py-2.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-bold text-muted tracking-wide bg-transparent border-none cursor-pointer font-mono"
            >
              {expanded ? '▾ HIDE' : '▸ SHOW'} BREAKDOWN
            </button>

            {expanded && (
              <div className="mt-3">
                {Object.entries(card.scores).map(([k, v]) => (
                  <div key={k} className="flex items-center gap-2.5 mb-2 text-xs">
                    <span className="w-24 text-muted capitalize">{k}</span>
                    <div className="flex-1 h-1.5 bg-hairline rounded-full overflow-hidden">
                      <div className="h-full bg-ink rounded-full" style={{ width: `${v}%` }} />
                    </div>
                    <span className="w-8 text-right font-bold">{v}%</span>
                  </div>
                ))}
                <div className="mt-2 p-2.5 border border-dashed border-border rounded text-xs text-muted">
                  ★ {card.peer}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center items-center gap-5 mt-5">
          <button
            onClick={() => commitSwipe('left')}
            disabled={!!exitDir}
            className="w-14 h-14 rounded-full border-2 border-ink bg-white flex items-center justify-center text-xl cursor-pointer disabled:opacity-40 transition-transform active:scale-90"
          >
            ✕
          </button>
          <button
            onClick={() => commitSwipe('bookmark')}
            disabled={!!exitDir}
            className="w-11 h-11 rounded-full border-2 border-border-dark bg-white flex items-center justify-center text-base cursor-pointer disabled:opacity-40 transition-transform active:scale-90"
          >
            ☆
          </button>
          <button
            onClick={() => commitSwipe('right')}
            disabled={!!exitDir}
            className="w-14 h-14 rounded-full border-2 border-ink bg-ink text-white flex items-center justify-center text-xl cursor-pointer disabled:opacity-40 transition-transform active:scale-90"
          >
            ✓
          </button>
        </div>

        <div className="flex justify-center gap-8 mt-2 text-[10px] text-faint font-bold tracking-wide">
          <span className="w-14 text-center">PASS</span>
          <span className="w-11 text-center">SAVE</span>
          <span className="w-14 text-center">APPLY</span>
        </div>
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
