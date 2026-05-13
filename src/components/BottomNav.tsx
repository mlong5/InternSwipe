'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/deck', label: 'SWIPE' },
  { href: '/saved', label: 'SAVED' },
  { href: '/history', label: 'HISTORY' },
  { href: '/profile', label: 'PROFILE' },
  { href: '/settings', label: 'SETTINGS' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t-2 border-ink flex justify-center">
      <div className="flex w-full max-w-[400px]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 py-3 text-center font-bold tracking-widest font-mono border-b-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink
                ${active
                  ? 'text-white border-gray-300 text-[12px]'
                  : 'text-gray-400 border-transparent text-[10px]'
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
