'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api, Order, formatZAR } from '@/lib/api'
import { useAuth } from '@/app/contexts/AuthContext'

export default function OrderConfirmationPage() {
  const params = useParams()
  const id = params.id as string
  const { customer } = useAuth()

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Try sessionStorage first (works for guests immediately after checkout)
    const stored = sessionStorage.getItem('cb_last_order')
    if (stored) {
      try {
        const parsed: Order = JSON.parse(stored)
        if (String(parsed.id) === String(id)) {
          setOrder(parsed)
          setLoading(false)
          return
        }
      } catch {
        // ignore parse errors
      }
    }

    // If authenticated, fetch from API
    if (customer) {
      api.getOrder(id)
        .then(o => setOrder(o.data))
        .catch(err => setError(err.message || 'Order not found'))
        .finally(() => setLoading(false))
    } else {
      setError('Order details are not available. Please log in to view your order history.')
      setLoading(false)
    }
  }, [id, customer])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded w-1/2 mb-4" />
        <div className="h-4 bg-zinc-800 rounded w-3/4 mb-8" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-zinc-800 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-white">Order Confirmed!</h1>
        <p className="text-zinc-400 mt-2">Thank you for your purchase.</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700 rounded-xl text-amber-400 text-sm text-center">
          {error}
        </div>
      )}

      {order && (
        <div className="space-y-6">
          {/* Order meta */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Order ID</p>
                <p className="text-white font-semibold">#{order.id}</p>
              </div>
              {order.payment_reference && (
                <div>
                  <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Reference</p>
                  <p className="text-white font-semibold font-mono text-sm">{order.payment_reference}</p>
                </div>
              )}
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Status</p>
                <span className="inline-block bg-blue-500/20 text-blue-400 text-xs font-medium px-2 py-0.5 rounded-full capitalize">
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Total paid</p>
                <p className="text-blue-400 font-bold text-lg">{formatZAR(order.total)}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Payment</p>
                <p className="text-zinc-300 text-sm capitalize">{order.payment_method}</p>
              </div>
              <div>
                <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Date</p>
                <p className="text-zinc-300 text-sm">
                  {new Date(order.created_at).toLocaleDateString('en-ZA', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          {order.items && order.items.length > 0 && (
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Items ordered</h2>
              <div className="space-y-3">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-200 text-sm font-medium">{item.product_name}</p>
                      {item.product_reference && (
                        <p className="text-zinc-600 text-xs font-mono">{item.product_reference}</p>
                      )}
                    </div>
                    <span className="text-zinc-500 text-sm shrink-0">×{item.quantity}</span>
                    <span className="text-zinc-300 text-sm font-medium shrink-0">
                      {formatZAR(item.line_total)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-700 mt-4 pt-3 flex justify-between font-semibold">
                <span className="text-zinc-300">Total</span>
                <span className="text-blue-400">{formatZAR(order.total)}</span>
              </div>
            </div>
          )}

          {/* Shipping address */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
            <h2 className="text-white font-semibold mb-3">Shipping to</h2>
            <address className="text-zinc-400 text-sm not-italic leading-relaxed">
              {order.ship_firstname} {order.ship_lastname}<br />
              {order.ship_address1}<br />
              {order.ship_address2 && <>{order.ship_address2}<br /></>}
              {order.ship_city}, {order.ship_postcode}<br />
              {order.ship_country}
            </address>
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Continue Shopping
        </Link>
        {customer && (
          <Link
            href="/account"
            className="mt-3 block text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            View order history →
          </Link>
        )}
      </div>
    </div>
  )
}
