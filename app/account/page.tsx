'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, Order, formatZAR } from '@/lib/api'
import { useAuth } from '@/app/contexts/AuthContext'

export default function AccountPage() {
  const router = useRouter()
  const { customer, loading, logout } = useAuth()

  const [orders, setOrders] = useState<Order[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  useEffect(() => {
    if (!loading && !customer) {
      router.replace('/login')
    }
  }, [customer, loading, router])

  useEffect(() => {
    if (customer) {
      api.getOrders()
        .then(o => setOrders(o.data))
        .catch(() => setOrders([]))
        .finally(() => setOrdersLoading(false))
    }
  }, [customer])

  async function handleLogout() {
    await logout()
    router.push('/')
  }

  if (loading || !customer) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">My Account</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your orders and account details</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-zinc-500 hover:text-red-400 text-sm transition-colors"
        >
          Sign out
        </button>
      </div>

      {/* Customer info */}
      <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-4">Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Name</p>
            <p className="text-white font-medium">{customer.firstname} {customer.lastname}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Email</p>
            <p className="text-zinc-300">{customer.email}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs uppercase tracking-wide mb-1">Customer ID</p>
            <p className="text-zinc-500 font-mono text-sm">#{customer.id}</p>
          </div>
        </div>
      </div>

      {/* Order history */}
      <div>
        <h2 className="text-white font-semibold text-xl mb-4">Order History</h2>

        {ordersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 bg-zinc-700 rounded w-1/3" />
                  <div className="h-4 bg-zinc-700 rounded w-1/5" />
                </div>
                <div className="h-3 bg-zinc-700 rounded w-1/4 mt-2" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-zinc-800 border border-zinc-700 rounded-xl">
            <p className="text-zinc-400 font-medium">No orders yet</p>
            <p className="text-zinc-600 text-sm mt-1">Your order history will appear here.</p>
            <Link
              href="/shop"
              className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm"
            >
              Start shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <Link
                key={order.id}
                href={`/order-confirmation/${order.id}`}
                className="block bg-zinc-800 border border-zinc-700 hover:border-blue-500 rounded-xl p-5 transition-colors group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-semibold">Order #{order.id}</span>
                      {order.payment_reference && (
                        <span className="text-zinc-500 font-mono text-xs">{order.payment_reference}</span>
                      )}
                    </div>
                    <p className="text-zinc-500 text-xs mt-1">
                      {new Date(order.created_at).toLocaleDateString('en-ZA', {
                        year: 'numeric', month: 'long', day: 'numeric',
                      })}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''} · {order.payment_method}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-blue-400 font-bold">{formatZAR(order.total)}</p>
                    <span className="inline-block mt-1 bg-zinc-700 group-hover:bg-zinc-600 text-zinc-300 text-xs font-medium px-2 py-0.5 rounded-full capitalize transition-colors">
                      {order.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
