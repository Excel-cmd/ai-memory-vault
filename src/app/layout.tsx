import type { Metadata } from 'next'
import './globals.css'
import ToastProvider from '@/components/providers/ToastProvider'

export const metadata: Metadata = {
  title: 'AI Memory Vault',
  description: 'Your intelligent development companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  )
}