'use client'

import Link from 'next/link'
import { useCart } from '@/app/contexts/CartContext'
import { useAuth } from '@/app/contexts/AuthContext'

export default function Nav() {
  const { cart } = useCart()
  const { customer, logout } = useAuth()
  const itemCount = cart.item_count

  return (
    <nav className="bg-zinc-900 border-b border-zinc-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">
              Cool<span className="text-blue-400">Boost</span>
            </span>
            <span className="hidden sm:block text-xs text-zinc-400 border border-zinc-600 rounded px-1.5 py-0.5">
              W/M Systems
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-6">
            <Link
              href="/shop"
              className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
            >
              Shop
            </Link>

            {/* Cart */}
            <Link href="/cart" className="relative flex items-center gap-1 text-zinc-300 hover:text-white transition-colors">
              <CartIcon />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {customer ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/account"
                  className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
                >
                  {customer.firstname}
                </Link>
                <button
                  onClick={() => logout()}
                  className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-zinc-300 hover:text-white text-sm font-medium transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.273M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
      />
    </svg>
  )
}
