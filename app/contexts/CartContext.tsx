'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { api, Cart } from '@/lib/api'

const EMPTY_CART: Cart = { id: null, items: [], subtotal_ex_tax: 0, subtotal_inc_tax: 0, item_count: 0, currency: 'ZAR' }

interface CartContextValue {
  cart: Cart
  loading: boolean
  addItem: (productId: number, quantity: number) => Promise<void>
  updateItem: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART)
  const [loading, setLoading] = useState(false)

  const refreshCart = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getCart()
      setCart(data)
    } catch {
      // Cross-origin session cookie issue in dev — cart may be empty for guests.
      // This is a known limitation; the cart state is kept locally after each mutation.
      setCart(EMPTY_CART)
    } finally {
      setLoading(false)
    }
  }, [])

  // Hydrate cart on mount
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addItem = useCallback(async (productId: number, quantity: number) => {
    const updated = await api.addToCart(productId, quantity)
    setCart(updated)
  }, [])

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      const updated = await api.removeCartItem(itemId)
      setCart(updated ?? EMPTY_CART)
      return
    }
    const updated = await api.updateCartItem(itemId, quantity)
    setCart(updated)
  }, [])

  const removeItem = useCallback(async (itemId: number) => {
    const updated = await api.removeCartItem(itemId)
    setCart(updated ?? EMPTY_CART)
  }, [])

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
