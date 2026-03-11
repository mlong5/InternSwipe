'use client'

import { useState } from 'react'

const LISTINGS = [
  { id: 1, company: 'Acme Corp', role: 'Software Engineer Intern', location: 'San Francisco, CA', pay: '$X,XXX/mo', match: 87, deadline: 'Oct 15', tag: 'STRONG MATCH', skills: ['Python', 'SQL', 'APIs'], scores: { technical: 92, experience: 78, gpa: 88, coursework: 84 }, peer: '72% of similar students get interviews' },
  { id: 2, company: 'Widgets Inc', role: 'Product Design Intern', location: 'New York, NY', pay: '$X,XXX/mo', match: 73, deadline: 'Nov 1', tag: 'STRETCH', skills: ['Figma', 'Research', 'Prototyping'], scores: { technical: 65, experience: 70, gpa: 90, coursework: 68 }, peer: '58% of similar students get interviews' },
  { id: 3, company: 'DataCo', role: 'Data Science Intern', location: 'Austin, TX', pay: '$X,XXX/mo', match: 81, deadline: 'Dec 1', tag: 'STRONG MATCH', skills: ['Python', 'ML', 'Statistics'], scores: { technical: 88, experience: 72, gpa: 85, coursework: 90 }, peer: '61% of similar students get interviews' },
  { id: 4, company: 'BuildIt', role: 'Frontend Intern', location: 'Remote', pay: '$X,XXX/mo', match: 79, deadline: 'Oct 28', tag: 'TRENDING', skills: ['React', 'TypeScript', 'CSS'], scores: { technical: 82, experience: 74, gpa: 86, coursework: 78 }, peer: '65% of similar students get interviews' },
  { id: 5, company: 'LearnApp', role: 'ML Engineering Intern', location: 'Pittsburgh, PA', pay: '$X,XXX/mo', match: 68, deadline: 'Nov 15', tag: 'STRETCH', skills: ['Python', 'NLP', 'TensorFlow'], scores: { technical: 74, experience: 60, gpa: 82, coursework: 72 }, peer: '52% of similar students get interviews' },
]

export default function DeckPage() {
  const [idx, setIdx] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [swiping, setSwiping] = useState<'left' | 'right' | 'bookmark' | null>(null)

  const done = idx >= LISTINGS.length
  const card = LISTINGS[idx]

  const handleSwipe = (dir: 'left' | 'right' | 'bookmark') => {
    setSwiping(dir)
    setTimeout(() => {
      setSwiping(null)
      setExpanded(false)
      setIdx((i) => i + 1)
    }, 250)
  }

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

  if (!card) return null

  const cardTransform =
    swiping === 'right' ? 'translateX(60px) rotate(3deg)' :
    swiping === 'left' ? 'translateX(-60px) rotate(-3deg)' :
    swiping === 'bookmark' ? 'translateY(-10px)' : 'none'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 font-mono">
      <div className="w-full max-w-[400px]">

        {/* Header */}
        <div className="flex justify-between items-center mb-3.5">
          <h2 className="text-lg font-bold text-ink">InternSwipe</h2>
          <span className="text-xs text-faint">{idx + 1} / {LISTINGS.length}</span>
        </div>

        {/* Card */}
        <div
          className="border-2 border-ink rounded-lg overflow-hidden bg-white transition-all duration-[250ms]"
          style={{ opacity: swiping ? 0.4 : 1, transform: cardTransform }}
        >
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
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 rounded-full border-2 border-ink bg-white flex items-center justify-center text-xl cursor-pointer"
          >
            ✕
          </button>
          <button
            onClick={() => handleSwipe('bookmark')}
            className="w-11 h-11 rounded-full border-2 border-border-dark bg-white flex items-center justify-center text-base cursor-pointer"
          >
            ☆
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-14 h-14 rounded-full border-2 border-ink bg-ink text-white flex items-center justify-center text-xl cursor-pointer"
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
    </div>
  )
}
