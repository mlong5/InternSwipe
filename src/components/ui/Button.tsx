interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}

export default function Button({
  children,
  onClick,
  variant = 'secondary',
  disabled = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const base =
    'w-full py-3 px-6 rounded-lg text-sm font-bold tracking-wide border-2 transition-all cursor-pointer font-mono text-center'
  const variants = {
    primary: 'bg-accent border-accent text-white hover:bg-accent-dark hover:border-accent-dark shadow-sm',
    secondary: 'bg-white text-ink border-border hover:border-ink hover:shadow-sm',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  )
}
