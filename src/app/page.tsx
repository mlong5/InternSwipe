import Link from 'next/link'

import Button from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 pt-20 pb-10 font-mono">
      <div className="flex-1 flex flex-col justify-center items-center text-center w-full max-w-sm">

        <p className="text-[11px] text-faint uppercase tracking-[0.25em] mb-5">
          InternSwipe
        </p>

        <h1 className="text-[40px] font-bold tracking-tight text-ink leading-[1.05] mb-6">
          Swipe.<br />
          Match.<br />
          Intern.
        </h1>

        <p className="text-sm text-muted leading-relaxed mb-12 max-w-xs">
          AI-powered internship matching for university students. One swipe to apply, coached on every step.
        </p>

        <Link href="/login" className="block w-full" aria-label="Get started — create your free account">
          <Button variant="primary">GET STARTED →</Button>
        </Link>

        <p className="text-xs text-faint mt-4">
          Free for university students
        </p>

      </div>

      <p className="text-[11px] text-faint text-center tracking-widest uppercase mt-10">
        Built for students, by students
      </p>

    </div>
  )
}
