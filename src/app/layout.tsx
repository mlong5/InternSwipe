import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InternSwipe',
  description: 'Tinder-style internship discovery and application tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface min-h-screen font-mono flex justify-center md:py-8 xl:py-12">
        <div className="w-full max-w-[400px] min-h-screen bg-white pt-14 md:max-w-[640px] md:min-h-0 md:rounded-2xl md:shadow-2xl md:overflow-hidden md:border md:border-hairline md:self-start xl:max-w-[900px]">
          {children}
        </div>
      </body>
    </html>
  )
}
