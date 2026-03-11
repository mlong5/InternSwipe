'use client'

import { useState } from 'react'
import Chip from '@/components/ui/Chip'

// Stub data — will be replaced with API data in Week 2
const STUB_HISTORY = [
  { id: 1, company: 'Acme Corp', role: 'Software Engineer Intern', location: 'San Francisco, CA', match: 87, action: 'right', date: '3/1/2026' },
  { id: 2, company: 'Widgets Inc', role: 'Product Design Intern', location: 'New York, NY', match: 73, action: 'left', date: '3/1/2026' },
  { id: 3, company: 'DataCo', role: 'Data Science Intern', location: 'Austin, TX', match: 81, action: 'bookmark', date: '3/2/2026' },
]

const ACTION_LABEL: Record<string, string> = { right: 'APPLIED', left: 'PASSED', bookmark: 'SAVED' }
const ACTION_ICON: Record<string, string> = { right: '✓', left: '✕', bookmark: '☆' }

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'right', label: 'Applied' },
  { id: 'bookmark', label: 'Saved' },
  { id: 'left', label: 'Passed' },
]

export default function HistoryPage() {
  const [filter, setFilter] = useState('all')
  const history = STUB_HISTORY
  const filtered = filter === 'all' ? history : history.filter((h) => h.action === filter)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-4 font-mono">
      <div className="w-full max-w-[400px]">

        <h2 className="text-lg font-bold text-ink mb-1">History</h2>
        <p className="text-xs text-faint mb-4">{history.length} reviewed</p>

        {/* Stats */}
        {history.length > 0 && (
          <div className="flex gap-2 mb-4">
            {[
              { label: 'Applied', count: history.filter((h) => h.action === 'right').length },
              { label: 'Saved', count: history.filter((h) => h.action === 'bookmark').length },
              { label: 'Passed', count: history.filter((h) => h.action === 'left').length },
            ].map((s) => (
              <div key={s.label} className="flex-1 py-2.5 border border-border rounded text-center">
                <div className="text-xl font-bold text-ink">{s.count}</div>
                <div className="text-[10px] text-faint uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {FILTERS.map((f) => (
            <Chip key={f.id} label={f.label} active={filter === f.id} onClick={() => setFilter(f.id)} />
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-faint">
            {history.length === 0 ? 'No history yet — start swiping.' : 'No items for this filter.'}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((item, i) => (
              <div key={`${item.id}-${i}`} className="flex items-center gap-3 px-3.5 py-3 border border-border rounded-md">
                {/* Match circle */}
                <div className="w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center text-xs font-bold shrink-0">
                  {item.match}%
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-ink truncate">{item.role}</div>
                  <div className="text-xs text-muted">{item.company}</div>
                  <div className="text-xs text-faint">📍 {item.location}</div>
                </div>
                {/* Action badge */}
                <div className="text-center shrink-0">
                  <div className="w-7 h-7 rounded-full border border-border-dark flex items-center justify-center text-sm font-bold mx-auto mb-0.5">
                    {ACTION_ICON[item.action]}
                  </div>
                  <div className="text-[9px] text-faint font-bold tracking-wide">{ACTION_LABEL[item.action]}</div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
