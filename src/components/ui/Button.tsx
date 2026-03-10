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
    'w-full py-3 px-6 rounded-md text-sm font-bold tracking-wide border-2 border-ink transition-opacity cursor-pointer font-mono text-center'
  const variants = {
    primary: 'bg-ink text-white',
    secondary: 'bg-white text-ink',
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
