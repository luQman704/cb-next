'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/app/contexts/AuthContext'
import { CartProvider } from '@/app/contexts/CartContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  )
}
