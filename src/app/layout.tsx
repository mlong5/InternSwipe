import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InternSwipe',
  description: 'Tinder-style internship discovery and application tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface min-h-screen font-mono flex justify-center">
        <div className="w-full max-w-[400px] min-h-screen bg-white pt-14">
          {children}
        </div>
      </body>
    </html>
  )
}
