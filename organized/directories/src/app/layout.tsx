import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clutch Admin - Enterprise Management Platform',
  description: 'The world\'s most beautiful and powerful all-in-one enterprise platform for Clutch employees.',
  keywords: 'clutch, admin, dashboard, enterprise, management, hr, finance, crm, marketing',
  authors: [{ name: 'Clutch Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  icons: {
    icon: '/assets/LogoRed.svg',
    shortcut: '/assets/LogoRed.svg',
    apple: '/assets/LogoRed.svg',
  },
  openGraph: {
    title: 'Clutch Admin - Enterprise Management Platform',
    description: 'The world\'s most beautiful and powerful all-in-one enterprise platform for Clutch employees.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/assets/LogoRed.svg',
        width: 1200,
        height: 630,
        alt: 'Clutch Admin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clutch Admin - Enterprise Management Platform',
    description: 'The world\'s most beautiful and powerful all-in-one enterprise platform for Clutch employees.',
    images: ['/assets/LogoRed.svg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/LogoRed.svg" />
        <link rel="shortcut icon" href="/assets/LogoRed.svg" />
        <link rel="apple-touch-icon" href="/assets/LogoRed.svg" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
