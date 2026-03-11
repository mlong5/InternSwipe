interface InputProps {
  label: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}

export default function Input({ label, placeholder, value, onChange, type = 'text' }: InputProps) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-muted uppercase tracking-widest mb-1 font-mono">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2.5 rounded border border-border bg-white text-ink text-sm font-mono outline-none focus:border-ink"
      />
    </div>
  )
}
