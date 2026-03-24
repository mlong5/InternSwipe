import Link from 'next/link'
import Button from '@/components/ui/Button'

const FEATURES = ['Smart Feed', 'Match Scores', 'App Coach', 'Timeline']
const STATS = [
  ['12.4k', 'Students'],
  ['850+', 'Employers'],
  ['94%', 'Match Rate'],
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 font-mono">
      <div className="w-full max-w-[380px] text-center">

        {/* Logo */}
        <div className="w-12 h-12 border-2 border-ink rounded-lg flex items-center justify-center text-base font-bold text-ink mx-auto mb-8" aria-hidden="true">
          IS
        </div>

        <h1 className="text-[32px] font-bold tracking-tight text-ink mb-1">InternSwipe</h1>
        <p className="text-xs text-faint uppercase tracking-widest mb-7">Swipe. Match. Intern.</p>

        {/* Value prop */}
        <div className="border border-dashed border-border rounded-md p-6 mb-7">
          <p className="text-sm text-muted leading-relaxed">
            AI-powered internship matching.<br />
            Swipe through personalized opportunities.<br />
            Get coached on every application.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {FEATURES.map((f) => (
            <span key={f} className="px-3 py-1 border border-border rounded-full text-xs text-muted">
              {f}
            </span>
          ))}
        </div>

        <Link href="/login" aria-label="Get started — create your free account">
          <Button variant="primary">GET STARTED →</Button>
        </Link>

        <p className="text-xs text-faint mt-4">Free for university students</p>

        {/* Stats */}
        <div className="flex justify-around mt-9 pt-4 border-t border-hairline">
          {STATS.map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-lg font-bold text-ink">{n}</div>
              <div className="text-[10px] text-faint uppercase tracking-wide">{l}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
