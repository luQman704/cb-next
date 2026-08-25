'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'

export default function RegisterPage() {
  const router = useRouter()
  const { register, customer, loading } = useAuth()

  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && customer) {
      router.replace('/account')
    }
  }, [customer, loading, router])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      setError('Passwords do not match')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await register(form)
      router.push('/account')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-zinc-400 text-sm mt-2">
            Join Cool<span className="text-blue-400">Boost</span> Systems
          </p>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">First name</label>
                <input
                  name="firstname"
                  value={form.firstname}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Last name</label>
                <input
                  name="lastname"
                  value={form.lastname}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email address</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Min 8 characters"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1.5">Confirm password</label>
              <input
                name="password_confirmation"
                type="password"
                autoComplete="new-password"
                value={form.password_confirmation}
                onChange={handleChange}
                required
                placeholder="Repeat password"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
            >
              {submitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-zinc-500 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
