'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api, Product, formatZAR, getImageUrl } from '@/lib/api'
import { useCart } from '@/app/contexts/CartContext'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { addItem } = useCart()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [activeImagePath, setActiveImagePath] = useState<string | null>(null)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(null)
    api.getProduct(slug)
      .then(r => {
        setProduct(r.data)
        setActiveImagePath(r.data.cover_image_url)
      })
      .catch(err => setError(err.message || 'Product not found'))
      .finally(() => setLoading(false))
  }, [slug])

  async function handleAddToCart() {
    if (!product) return
    setAdding(true)
    try {
      await addItem(product.id, quantity)
      setAddSuccess(true)
      setTimeout(() => setAddSuccess(false), 2500)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add to cart'
      alert(msg)
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-4 bg-zinc-800 rounded w-56 mb-10 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
          <div>
            <div className="aspect-square bg-zinc-800 rounded-xl" />
            <div className="flex gap-2 mt-3">
              {[1,2,3,4].map(i => <div key={i} className="w-16 h-16 bg-zinc-800 rounded-lg" />)}
            </div>
          </div>
          <div className="space-y-4 pt-2">
            <div className="h-6 bg-zinc-800 rounded w-3/4" />
            <div className="h-10 bg-zinc-800 rounded w-1/2" />
            <div className="h-4 bg-zinc-800 rounded w-1/4" />
            <div className="h-20 bg-zinc-800 rounded mt-6" />
            <div className="h-12 bg-zinc-800 rounded mt-8" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-red-400 text-lg">{error || 'Product not found'}</p>
        <Link href="/shop" className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm">
          ← Back to shop
        </Link>
      </div>
    )
  }

  const mainUrl = getImageUrl(activeImagePath)
  const stockQty = product.stock?.quantity ?? 0
  const inStock = stockQty > 0 || (product.stock?.allow_out_of_stock ?? false)
  const sortedImages = [...product.images].sort((a, b) => a.position - b.position)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-zinc-600 mb-8 flex-wrap">
        <Link href="/" className="hover:text-zinc-400 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-zinc-400 transition-colors">Shop</Link>
        {product.categories.slice(0, 1).map(cat => (
          <span key={cat.id} className="flex items-center gap-2">
            <span>/</span>
            <Link href={`/shop?category=${cat.slug}`} className="hover:text-zinc-400 transition-colors">
              {cat.name}
            </Link>
          </span>
        ))}
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* ── Left column: image gallery ── */}
        <div>
          {/* Main image */}
          <div className="aspect-square bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {mainUrl && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mainUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-10">
                <span className="text-zinc-600 text-sm text-center leading-relaxed">{product.name}</span>
              </div>
            )}
          </div>

          {/* Thumbnails — only shown when there are multiple images */}
          {sortedImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {sortedImages.map(img => {
                const thumbUrl = getImageUrl(img.url)
                const isActive = activeImagePath === img.url
                return (
                  <button
                    key={img.id}
                    onClick={() => { setActiveImagePath(img.url); setImgError(false) }}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      isActive ? 'border-blue-500' : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    {thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-800" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Right column: details ── */}
        <div>
          {/* Category tags */}
          {product.categories.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-4">
              {product.categories.map(cat => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="text-xs text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 px-2.5 py-1 rounded-md transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold text-white leading-tight">{product.name}</h1>

          {/* Price */}
          <div className="mt-5">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-white">{formatZAR(product.price_inc_tax)}</span>
              <span className="text-zinc-500 text-sm">incl. VAT</span>
            </div>
            <p className="text-zinc-600 text-xs mt-0.5">{formatZAR(product.price_ex_tax)} excl. VAT</p>
          </div>

          {/* Stock status + SKU row */}
          <div className="mt-4 flex items-center gap-5">
            {inStock ? (
              <span className="inline-flex items-center gap-1.5 text-green-400 text-sm font-medium">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {stockQty > 0 ? `${stockQty} in stock` : 'Available'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-red-400 text-sm font-medium">
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Out of stock
              </span>
            )}
            {product.reference && (
              <span className="text-zinc-600 text-xs">SKU: <span className="font-mono text-zinc-500">{product.reference}</span></span>
            )}
          </div>

          {/* Short description */}
          {product.short_description && (
            <div
              className="mt-6 text-zinc-400 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}

          {/* Add to cart */}
          {inStock ? (
            <div className="mt-8 space-y-3">
              <div className="flex gap-3">
                {/* Quantity selector */}
                <div className="flex items-center border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-12 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xl leading-none"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={stockQty}
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Math.min(stockQty, parseInt(e.target.value) || 1)))}
                    className="w-14 text-center bg-zinc-900 text-white h-12 text-sm border-x border-zinc-700 focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(q => Math.min(stockQty, q + 1))}
                    className="w-10 h-12 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-xl leading-none"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className={`flex-1 h-12 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    addSuccess
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60 disabled:cursor-not-allowed'
                  }`}
                >
                  {adding ? 'Adding…' : addSuccess ? '✓ Added to cart' : 'Add to Cart'}
                </button>
              </div>

              <Link
                href="/cart"
                className="block text-center text-zinc-600 hover:text-zinc-400 text-xs transition-colors"
              >
                View cart →
              </Link>
            </div>
          ) : (
            <div className="mt-8 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-500">
              This product is currently out of stock. Check back later or{' '}
              <Link href="/shop" className="text-blue-400 hover:text-blue-300">browse alternatives</Link>.
            </div>
          )}

          {/* Specs table */}
          <dl className="mt-8 border-t border-zinc-800 pt-6 text-sm">
            <div className="grid grid-cols-2 gap-y-3">
              {product.reference && (
                <>
                  <dt className="text-zinc-500">SKU</dt>
                  <dd className="font-mono text-zinc-300">{product.reference}</dd>
                </>
              )}
              {product.weight && (
                <>
                  <dt className="text-zinc-500">Weight</dt>
                  <dd className="text-zinc-300">{product.weight} kg</dd>
                </>
              )}
              <dt className="text-zinc-500">Availability</dt>
              <dd className={inStock ? 'text-green-400' : 'text-red-400'}>
                {inStock ? 'In Stock' : 'Out of Stock'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Full description */}
      {product.description && (
        <div className="mt-16 border-t border-zinc-800 pt-10">
          <h2 className="text-white font-bold text-xl mb-6">Description</h2>
          <div
            className="text-zinc-400 text-sm leading-relaxed prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
    </div>
  )
}
