import React from "react"
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
// @ts-ignore
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Ziren Printing Shop | Professional Printing Services',
  description: 'Quality printing services for all your needs - business cards, banners, flyers, and more. Fast turnaround and competitive prices.',
  // icons: {
  //   icon: [
  //     {
  //       url: '/logo.png',
  //       media: '(prefers-color-scheme: light)',
  //     },
  //     {
  //       url: '/logo.png',
  //       media: '(prefers-color-scheme: dark)',
  //     }
  //   ],
  //   apple: '/logo.png',
  // },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
