import './globals.css'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import type { Metadata } from 'next'
import ClientProviders from '@/components/ClientProviders'

export const metadata: Metadata = {
  title: 'SI CMS: Admin - Blog Management System',
  description: 'A simple and efficient content management system for blog posts',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
} 