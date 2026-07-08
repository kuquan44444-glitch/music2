import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MixFlow Social',
  description: 'A modern social networking application',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
