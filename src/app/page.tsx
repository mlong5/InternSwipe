import Link from 'next/link'
import Button from '@/components/ui/Button'

const FEATURES = ['Smart Feed', 'Match Scores', 'App Coach', 'Timeline']
const VALUES = ['Built for students', 'AI-powered matching', 'One-swipe applications']

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 font-mono">
      <div className="w-full text-center">

        {/* Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-violet-600 flex items-center justify-center text-white text-lg font-bold mx-auto mb-8 shadow-lg shadow-accent/30" aria-hidden="true">
          IS
        </div>

        <h1 className="text-[32px] font-bold tracking-tight text-ink mb-1">InternSwipe</h1>
        <p className="text-xs text-faint uppercase tracking-widest mb-7">Swipe. Match. Intern.</p>

        {/* Value prop */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-violet-50 border border-indigo-100 p-6 mb-7">
          <p className="text-sm text-muted leading-relaxed">
            AI-powered internship matching.<br />
            Swipe through personalized opportunities.<br />
            Get coached on every application.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {FEATURES.map((f, i) => (
            <span key={f} className={`px-3 py-1.5 rounded-full text-xs font-bold border ${i === 0 ? 'bg-accent text-white border-accent' : 'bg-white border-border text-muted'}`}>
              {f}
            </span>
          ))}
        </div>

        <Link href="/login" aria-label="Get started — create your free account">
          <Button variant="primary">GET STARTED →</Button>
        </Link>

        <p className="text-xs text-faint mt-4">Free for university students</p>

        <p className="text-xs text-faint mt-9 pt-4 border-t border-hairline">
          Built for students, by students.
        </p>

      </div>
    </div>
  )
}
