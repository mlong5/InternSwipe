interface ChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

export default function Chip({ label, active = false, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-block px-3 py-1 rounded-full text-xs font-mono cursor-pointer select-none border transition-colors
        ${active
          ? 'bg-ink text-white border-ink font-bold'
          : 'bg-white text-muted border-border'
        }`}
    >
      {label}
    </button>
  )
}
