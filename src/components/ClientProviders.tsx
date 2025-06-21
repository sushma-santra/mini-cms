'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'react-hot-toast'

interface ClientProvidersProps {
  children: ReactNode
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <>
      <AuthProvider>
        {children}
      </AuthProvider>
      <Toaster position="top-right" />
    </>
  )
} 