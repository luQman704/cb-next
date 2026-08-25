'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/app/contexts/CartContext'
import { formatZAR, getImageUrl } from '@/lib/api'

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart()
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  async function handleQtyChange(itemId: number, newQty: number) {
    setUpdatingId(itemId)
    try {
      await updateItem(itemId, newQty)
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleRemove(itemId: number) {
    setUpdatingId(itemId)
    try {
      await removeItem(itemId)
    } catch {
      // ignore
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Your Cart</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-xl p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-zinc-700 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-700 rounded w-2/3" />
                  <div className="h-3 bg-zinc-700 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : cart.items.length === 0 ? (
        /* Empty state */
        <div className="text-center py-24">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
          <p className="text-zinc-500 mb-6">
            Add some products to get started.
            {/* Note: guest cart session cookies may not persist across domains in dev */}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Item list */}
          <div className="flex-1 space-y-4">
            {cart.items.map(item => {
              const imageUrl = getImageUrl(item.product.cover_image_url)
              const isUpdating = updatingId === item.id

              return (
                <div
                  key={item.id}
                  className={`bg-zinc-800 border border-zinc-700 rounded-xl p-4 transition-opacity ${isUpdating ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Image */}
                    <Link href={`/shop/${item.product.slug}`} className="shrink-0">
                      <div className="w-20 h-20 bg-zinc-700 rounded-lg overflow-hidden">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-zinc-600 text-xs text-center p-1">{item.product.name}</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/shop/${item.product.slug}`}>
                        <h3 className="text-white font-medium text-sm hover:text-blue-400 transition-colors line-clamp-2">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-zinc-500 text-xs mt-0.5">
                        {formatZAR(item.unit_price_inc_tax)} each
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-2 mt-3">
                        <div className="flex items-center border border-zinc-600 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                            disabled={isUpdating}
                            className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-base leading-none disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-white text-sm py-1 border-x border-zinc-600">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                            disabled={isUpdating}
                            className="px-2.5 py-1 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-base leading-none disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={isUpdating}
                          className="text-zinc-600 hover:text-red-400 text-xs transition-colors disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="text-right shrink-0">
                      <span className="text-blue-400 font-semibold">
                        {formatZAR(item.line_total_inc_tax)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Order summary */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 sticky top-24">
              <h2 className="text-white font-semibold text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal ({cart.item_count} items)</span>
                  <span>{formatZAR(cart.subtotal_inc_tax)}</span>
                </div>
                <div className="flex justify-between text-zinc-500 text-xs">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-zinc-700 pt-3 flex justify-between font-semibold text-white">
                  <span>Total</span>
                  <span className="text-blue-400">{formatZAR(cart.subtotal_inc_tax)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 block w-full bg-blue-600 hover:bg-blue-500 text-white text-center font-semibold py-3 rounded-lg transition-colors"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/shop"
                className="mt-3 block w-full text-center text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
