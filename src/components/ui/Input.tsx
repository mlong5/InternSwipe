interface InputProps {
  label: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  readOnly?: boolean
  error?: string | undefined
}

export default function Input({ label, placeholder, value, onChange, type = 'text', readOnly, error }: InputProps) {
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
        readOnly={readOnly}
        className={`w-full px-3 py-2.5 rounded border bg-white text-ink text-sm font-mono outline-none focus:border-ink ${
          error ? 'border-red-400' : 'border-border'
        } ${readOnly ? 'opacity-60 cursor-default' : ''}`}
      />
      {error && (
        <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
      )}
    </div>
  )
}
