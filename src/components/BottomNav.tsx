'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/deck', label: 'SWIPE' },
  { href: '/history', label: 'HISTORY' },
  { href: '/profile', label: 'PROFILE' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-ink flex justify-center">
      <div className="flex w-full max-w-[400px]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 py-3 text-center text-xs font-bold tracking-widest font-mono border-b-[3px] transition-colors
                ${active
                  ? 'text-ink border-ink'
                  : 'text-faint border-transparent'
                }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
