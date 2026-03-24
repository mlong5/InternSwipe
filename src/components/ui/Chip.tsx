import type { KeyboardEvent } from 'react'

interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

export default function Chip({ label, active = false, onClick }: ChipProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`inline-block px-3 py-1 rounded-full text-xs font-mono cursor-pointer select-none border transition-colors
        ${active
          ? 'bg-ink text-white border-ink font-bold'
          : 'bg-white text-muted border-border'
        }`}
    >
      {label}
    </span>
  )
}
