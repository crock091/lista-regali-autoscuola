import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lista Regali Autoscuola',
  description: 'Crea la tua lista regali per la patente e ricevi contributi da amici e parenti',
  icons: {
    icon: '/favicon.jpg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <head>
        <link rel="icon" href="/favicon.jpg" type="image/jpeg" />
        {/* Script Iubenda Cookie Banner */}
        <script 
          type="text/javascript" 
          src="https://embeds.iubenda.com/widgets/58101ae9-a24a-421e-9ef9-74bf193491e5.js"
          async
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  )
}
