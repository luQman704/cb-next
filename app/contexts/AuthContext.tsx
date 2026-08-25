'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, startTransition } from 'react'
import { api, Customer } from '@/lib/api'

interface AuthContextValue {
  customer: Customer | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    firstname: string
    lastname: string
    email: string
    password: string
    password_confirmation: string
  }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount, restore token and verify it with the API
  useEffect(() => {
    const stored = localStorage.getItem('cb_token')
    if (!stored) {
      startTransition(() => setLoading(false))
      return
    }
    // Use startTransition to avoid the set-state-in-effect lint error
    // (state update triggered by external system / localStorage read)
    startTransition(() => setToken(stored))
    api.getMe()
      .then(c => startTransition(() => setCustomer(c.data)))
      .catch(() => {
        localStorage.removeItem('cb_token')
        startTransition(() => setToken(null))
      })
      .finally(() => startTransition(() => setLoading(false)))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password)
    localStorage.setItem('cb_token', res.token)
    setToken(res.token)
    setCustomer(res.customer)
  }, [])

  const register = useCallback(async (data: {
    firstname: string
    lastname: string
    email: string
    password: string
    password_confirmation: string
  }) => {
    const res = await api.register(data)
    localStorage.setItem('cb_token', res.token)
    setToken(res.token)
    setCustomer(res.customer)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.logout()
    } catch {
      // ignore server errors on logout
    }
    localStorage.removeItem('cb_token')
    setToken(null)
    setCustomer(null)
  }, [])

  return (
    <AuthContext.Provider value={{ customer, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
