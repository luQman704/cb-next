'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ProductListItem, formatZAR, getImageUrl } from '@/lib/api'

interface ProductCardProps {
  product: ProductListItem
}

export default function ProductCard({ product }: ProductCardProps) {
  const [imgError, setImgError] = useState(false)
  const imageUrl = getImageUrl(product.cover_image_url)

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden hover:border-blue-500 transition-colors duration-200">
        {/* Image area */}
        <div className="aspect-square bg-zinc-700 relative overflow-hidden">
          {imageUrl && !imgError ? (
            // Using regular <img> to avoid Next.js domain configuration requirements
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-4">
              <span className="text-zinc-500 text-sm text-center leading-tight">{product.name}</span>
            </div>
          )}
          {/* Stock badge */}
          {product.stock_qty <= 0 && (
            <div className="absolute top-2 right-2 bg-red-900 text-red-300 text-xs font-medium px-2 py-0.5 rounded">
              Out of stock
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="text-white text-sm font-medium leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
            {product.name}
          </h3>
          {product.reference && (
            <p className="text-zinc-500 text-xs mt-1">SKU: {product.reference}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-blue-400 font-semibold text-base">
              {formatZAR(product.price_inc_tax)}
            </span>
            {product.stock_qty > 0 && (
              <span className="text-green-500 text-xs">In stock</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
