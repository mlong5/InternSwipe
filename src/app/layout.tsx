import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'InternSwipe',
  description: 'Tinder-style internship discovery and application tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
