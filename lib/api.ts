// API client for Cool Boost Systems storefront
// All fetch calls use credentials: 'include' for session cookie (guest cart)
// and Authorization: Bearer {token} if token exists in localStorage
//
// In development, next.config.ts rewrites /api/* → Laravel and /storage/* → Laravel.
// This means cookies are set on localhost (same origin), fixing guest cart sessions.
// In production, set NEXT_PUBLIC_API_URL to the full Laravel API URL.

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('cb_token')
}

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

async function ensureCsrf(): Promise<void> {
  if (getCsrfToken()) return
  await fetch('/sanctum/csrf-cookie', { credentials: 'include' })
}

function buildHeaders(extra: Record<string, string> = {}): HeadersInit {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...extra,
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const csrf = getCsrfToken()
  if (csrf) headers['X-XSRF-TOKEN'] = csrf
  return headers
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isWrite = options.method && options.method !== 'GET'
  if (isWrite) await ensureCsrf()
  const headers = buildHeaders(isWrite ? { 'Content-Type': 'application/json' } : {})

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  })

  if (!res.ok) {
    let errorMsg = `API error ${res.status}`
    try {
      const body = await res.json()
      errorMsg = body.message || errorMsg
    } catch { /* ignore */ }
    throw new Error(errorMsg)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Types matching actual API responses ─────────────────────────────────────

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  parent_id: number | null
  active: boolean
  children?: Category[]
}

/** Returned by GET /api/products (list) */
export interface ProductListItem {
  id: number
  name: string
  slug: string
  reference: string | null
  price_ex_tax: number
  price_inc_tax: number
  active: boolean
  cover_image_url: string | null
  stock_qty: number
}

/** Returned by GET /api/products/{slug} (detail) */
export interface Product {
  id: number
  name: string
  slug: string
  reference: string | null
  price_ex_tax: number
  price_inc_tax: number
  active: boolean
  weight: string | null
  description: string | null
  short_description: string | null
  cover_image_url: string | null
  images: { id: number; url: string; position: number; is_cover: boolean }[]
  categories: { id: number; name: string; slug: string }[]
  stock: { quantity: number; allow_out_of_stock: boolean } | null
  created_at: string
}

export interface ProductListResponse {
  data: ProductListItem[]
  links: { first: string; last: string; prev: string | null; next: string | null }
  meta: { current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null }
}

export interface CartProduct {
  id: number
  name: string
  slug: string
  reference: string | null
  cover_image_url: string | null
}

export interface CartItem {
  id: number
  product: CartProduct
  quantity: number
  unit_price_ex_tax: number
  unit_price_inc_tax: number
  line_total_ex_tax: number
  line_total_inc_tax: number
}

export interface Cart {
  id: number | null
  items: CartItem[]
  subtotal_ex_tax: number
  subtotal_inc_tax: number
  item_count: number
  currency: string
}

export interface ShippingMethod {
  id: number
  name: string
  description: string | null
  delay: string | null
  base_price: number
  active: boolean
}

export interface OrderItem {
  id: number
  product_name: string
  product_reference: string | null
  quantity: number
  unit_price: number
  tax_rate: number
  line_total: number
}

export interface Order {
  id: number
  status: string
  subtotal: number
  tax_amount: number
  shipping_cost: number
  total: number
  payment_method: string | null
  payment_reference: string | null
  ship_firstname: string
  ship_lastname: string
  ship_address1: string
  ship_address2: string | null
  ship_city: string
  ship_postcode: string
  ship_country: string
  ship_phone: string | null
  shipping_method_name: string | null
  items: OrderItem[]
  created_at: string
}

export interface Customer {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string | null
  newsletter: boolean
  created_at: string
}

export interface AuthResponse {
  token: string
  customer: Customer
}

// ─── API methods ─────────────────────────────────────────────────────────────

export const api = {
  // Products
  getProducts(params: { category?: string; search?: string; page?: number } = {}): Promise<ProductListResponse> {
    const qs = new URLSearchParams()
    if (params.category) qs.set('category', params.category)
    if (params.search) qs.set('search', params.search)
    qs.set('page', String(params.page || 1))
    return apiFetch<ProductListResponse>(`/products?${qs}`)
  },

  getProduct(slug: string): Promise<{ data: Product }> {
    return apiFetch<{ data: Product }>(`/products/${slug}`)
  },

  // Categories
  getCategories(): Promise<{ data: Category[] }> {
    return apiFetch<{ data: Category[] }>('/categories')
  },

  // Cart
  getCart(): Promise<Cart> {
    return apiFetch<Cart>('/cart')
  },

  addToCart(productId: number, quantity: number): Promise<Cart> {
    return apiFetch<Cart>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    })
  },

  updateCartItem(itemId: number, quantity: number): Promise<Cart> {
    return apiFetch<Cart>(`/cart/items/${itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity }),
    })
  },

  removeCartItem(itemId: number): Promise<Cart> {
    return apiFetch<Cart>(`/cart/items/${itemId}`, { method: 'DELETE' })
  },

  clearCart(): Promise<void> {
    return apiFetch<void>('/cart', { method: 'DELETE' })
  },

  // Shipping
  getShippingMethods(): Promise<{ data: ShippingMethod[] }> {
    return apiFetch<{ data: ShippingMethod[] }>('/shipping-methods')
  },

  // Checkout
  checkout(payload: {
    shipping: {
      firstname: string; lastname: string; address1: string
      address2?: string; city: string; postcode: string; country: string; phone?: string
    }
    shipping_method_id: number
    payment_method: string
    guest_email?: string
  }): Promise<{ data: Order }> {
    return apiFetch<{ data: Order }>('/checkout', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  // Orders
  getOrders(): Promise<{ data: Order[] }> {
    return apiFetch<{ data: Order[] }>('/orders')
  },

  getOrder(id: number | string): Promise<{ data: Order }> {
    return apiFetch<{ data: Order }>(`/orders/${id}`)
  },

  // Auth
  login(email: string, password: string): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register(data: {
    firstname: string; lastname: string; email: string
    password: string; password_confirmation: string
  }): Promise<AuthResponse> {
    return apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  getMe(): Promise<{ data: Customer }> {
    return apiFetch<{ data: Customer }>('/auth/me')
  },

  logout(): Promise<void> {
    return apiFetch<void>('/auth/logout', { method: 'POST' })
  },
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatZAR(amount: number): string {
  return `R ${Number(amount).toFixed(2)}`
}

export function getImageUrl(path: string | null): string | null {
  if (!path) return null
  // path is like "/storage/products/201.jpg"
  // In dev, /storage/* is proxied through Next.js (same origin, no CORS).
  // In production, NEXT_PUBLIC_MEDIA_URL should point to the Laravel host.
  const base = process.env.NEXT_PUBLIC_MEDIA_URL || ''
  return `${base}${path}`
}
