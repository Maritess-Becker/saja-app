import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'Saja — Bewusstes Dating für echte Verbindung',
  description:
    'Saja verbindet Menschen für tiefe, bewusste Begegnungen und echte Beziehungen.',
  keywords: ['dating', 'bewusstes dating', 'beziehung', 'verbindung'],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Saja',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: '#3B1F0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-background font-body">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#240E04',
              color: '#FDF5E8',
              fontFamily: 'Outfit, system-ui, sans-serif',
              borderRadius: '12px',
            },
          }}
        />
      </body>
    </html>
  )
}
