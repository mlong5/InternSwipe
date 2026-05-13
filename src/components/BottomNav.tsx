'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/deck',     label: 'SWIPE',    icon: '⟺' },
  { href: '/saved',    label: 'SAVED',    icon: '☆'  },
  { href: '/matches',  label: 'MATCHES',  icon: '◇'  },
  { href: '/history',  label: 'HISTORY',  icon: '≡'  },
  { href: '/profile',  label: 'PROFILE',  icon: '◯'  },
  { href: '/settings', label: 'SETTINGS', icon: '⊙'  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Main navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-hairline flex justify-center shadow-[0_-1px_12px_rgba(0,0,0,0.06)]">
      <div className="flex w-full max-w-[400px]">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[9px] font-bold tracking-widest font-mono transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-accent
                ${active ? 'text-accent' : 'text-faint'}`}
            >
              <span className={`text-base leading-none ${active ? 'text-accent' : 'text-faint'}`} aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
