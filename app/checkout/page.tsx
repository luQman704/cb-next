'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api, ShippingMethod, formatZAR } from '@/lib/api'
import { useCart } from '@/app/contexts/CartContext'
import { useAuth } from '@/app/contexts/AuthContext'

export default function CheckoutPage() {
  const router = useRouter()
  const { cart, refreshCart } = useCart()
  const { customer } = useAuth()

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([])
  const [selectedShipping, setSelectedShipping] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    firstname: customer?.firstname || '',
    lastname: customer?.lastname || '',
    email: customer?.email || '',
    address1: '',
    address2: '',
    city: '',
    postcode: '',
    country: 'ZA',
    payment_method: 'paypal',
  })

  // Pre-fill name/email when auth state resolves
  useEffect(() => {
    if (customer) {
      setForm(f => ({
        ...f,
        firstname: f.firstname || customer.firstname,
        lastname: f.lastname || customer.lastname,
        email: f.email || customer.email,
      }))
    }
  }, [customer])

  useEffect(() => {
    api.getShippingMethods()
      .then(r => {
        setShippingMethods(r.data)
        if (r.data.length > 0) setSelectedShipping(r.data[0].id)
      })
      .catch(() => {})
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedShipping) {
      setError('Please select a shipping method.')
      return
    }
    setSubmitting(true)
    setError(null)

    const payload = {
      shipping: {
        firstname: form.firstname,
        lastname: form.lastname,
        address1: form.address1,
        address2: form.address2 || undefined,
        city: form.city,
        postcode: form.postcode,
        country: form.country,
      },
      shipping_method_id: selectedShipping,
      payment_method: form.payment_method,
      ...(!customer ? { guest_email: form.email } : {}),
    }

    try {
      const result = await api.checkout(payload)
      const order = result.data
      // Store order in sessionStorage for guest confirmation page
      sessionStorage.setItem('cb_last_order', JSON.stringify(order))
      await refreshCart()
      router.push(`/order-confirmation/${order.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Checkout failed. Please try again.'
      setError(msg)
      setSubmitting(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Nothing to checkout</h1>
        <p className="text-zinc-500 mb-6">Your cart is empty.</p>
        <Link href="/shop" className="text-blue-400 hover:text-blue-300">
          ← Back to shop
        </Link>
      </div>
    )
  }

  const selectedMethod = shippingMethods.find(m => m.id === selectedShipping)
  const shippingCost = selectedMethod?.base_price ?? 0
  const orderTotal = cart.subtotal_inc_tax + shippingCost

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form — right column on lg */}
          <div className="order-2 lg:order-2 space-y-6">
            {/* Contact info */}
            <section className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">First name *</label>
                  <input
                    name="firstname"
                    value={form.firstname}
                    onChange={handleChange}
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Last name *</label>
                  <input
                    name="lastname"
                    value={form.lastname}
                    onChange={handleChange}
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {!customer && (
                <div className="mt-4">
                  <label className="block text-xs text-zinc-400 mb-1.5">Email address *</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="you@example.com"
                  />
                  <p className="text-zinc-600 text-xs mt-1.5">
                    <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link> to use saved addresses
                  </p>
                </div>
              )}
              {customer && (
                <p className="mt-3 text-zinc-500 text-xs">
                  Ordering as <span className="text-zinc-300">{customer.email}</span>
                </p>
              )}
            </section>

            {/* Shipping address */}
            <section className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Address line 1 *</label>
                  <input
                    name="address1"
                    value={form.address1}
                    onChange={handleChange}
                    required
                    placeholder="Street address"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Address line 2</label>
                  <input
                    name="address2"
                    value={form.address2}
                    onChange={handleChange}
                    placeholder="Apartment, suite, unit, etc."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">City *</label>
                    <input
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1.5">Postcode *</label>
                    <input
                      name="postcode"
                      value={form.postcode}
                      onChange={handleChange}
                      required
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5">Country</label>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="ZA">South Africa</option>
                    <option value="ZW">Zimbabwe</option>
                    <option value="MZ">Mozambique</option>
                    <option value="NA">Namibia</option>
                    <option value="BW">Botswana</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Shipping method */}
            <section className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Shipping Method</h2>
              {shippingMethods.length === 0 ? (
                <p className="text-zinc-500 text-sm">Loading shipping options...</p>
              ) : (
                <div className="space-y-3">
                  {shippingMethods.map(method => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedShipping === method.id
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-zinc-700 hover:border-zinc-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping_method"
                        value={method.id}
                        checked={selectedShipping === method.id}
                        onChange={() => setSelectedShipping(method.id)}
                        className="mt-0.5 accent-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm font-medium">{method.name}</span>
                          <span className="text-blue-400 font-semibold text-sm">{formatZAR(method.base_price)}</span>
                        </div>
                        {method.description && (
                          <p className="text-zinc-500 text-xs mt-0.5">{method.description}</p>
                        )}
                        {method.delay && (
                          <p className="text-zinc-400 text-xs mt-0.5">Est. delivery: {method.delay}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </section>

            {/* Payment */}
            <section className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
              <h2 className="text-white font-semibold mb-4">Payment Method</h2>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-blue-500 bg-blue-500/10 cursor-pointer">
                <input
                  type="radio"
                  name="payment_method"
                  value="paypal"
                  checked={form.payment_method === 'paypal'}
                  onChange={handleChange}
                  className="accent-blue-500"
                />
                <div>
                  <span className="text-white text-sm font-medium">PayPal</span>
                  <p className="text-zinc-500 text-xs mt-0.5">You&apos;ll be redirected to PayPal to complete payment</p>
                </div>
              </label>
              <p className="text-zinc-600 text-xs mt-3">
                * For the PoC demo, payment selection is recorded but no gateway redirect occurs.
              </p>
            </section>
          </div>

          {/* Order summary — left column on lg */}
          <div className="order-1 lg:order-1">
            <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6 sticky top-24">
              <h2 className="text-white font-semibold text-lg mb-4">Order Summary</h2>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cart.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-zinc-700 rounded-lg shrink-0 overflow-hidden">
                      {item.product.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`${(process.env.NEXT_PUBLIC_API_URL || 'http://cb-laravel.ddev.site/api').replace('/api', '')}${item.product.cover_image_url}`}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-zinc-300 text-xs font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-zinc-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-zinc-300 text-xs shrink-0">{formatZAR(item.line_total_inc_tax)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-700 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatZAR(cart.subtotal_inc_tax)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Shipping</span>
                  <span>{selectedMethod ? formatZAR(shippingCost) : '—'}</span>
                </div>
                <div className="flex justify-between font-semibold text-white text-base border-t border-zinc-700 pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-blue-400">{formatZAR(orderTotal)}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-900/40 border border-red-700 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !selectedShipping}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {submitting ? 'Placing order...' : 'Place Order'}
              </button>

              <Link
                href="/cart"
                className="mt-3 block text-center text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
              >
                ← Back to cart
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
