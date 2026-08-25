'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api, Product } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

export default function Home() {
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getProducts({ page: 1 })
      .then(res => setFeatured(res.data.slice(0, 8)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-2xl">
            <p className="text-blue-400 text-sm font-semibold uppercase tracking-widest mb-4">
              Water-Methanol Injection
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              More Power.
              <span className="block text-zinc-400">Cooler Temps.</span>
            </h1>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-xl">
              Professional W/M injection kits engineered for South African conditions.
              Boost power output, protect your engine, and run more aggressive timing
              on pump fuel or ethanol.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 py-3 rounded-lg transition-colors"
              >
                Shop Kits
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-semibold px-7 py-3 rounded-lg transition-colors"
              >
                Browse Catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-zinc-900 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
            {[
              {
                title: 'Performance Gains',
                desc: 'Increase power output and reduce knock',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                ),
              },
              {
                title: 'Temp Reduction',
                desc: 'Drop intake temps by 60–120°C',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
                  </svg>
                ),
              },
              {
                title: 'Engine Protection',
                desc: 'Prevent detonation on ethanol & pump fuel',
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                ),
              },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4 px-6 py-6 first:pl-0 last:pr-0">
                <div className="text-blue-400 mt-0.5 shrink-0">{f.icon}</div>
                <div>
                  <div className="text-white font-semibold text-sm">{f.title}</div>
                  <div className="text-zinc-500 text-xs mt-0.5 leading-relaxed">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Products</h2>
            <p className="text-zinc-500 text-sm mt-1">Our most popular kits and components</p>
          </div>
          <Link
            href="/shop"
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
          >
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-zinc-700" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-700 rounded w-3/4" />
                  <div className="h-3 bg-zinc-700 rounded w-1/2" />
                  <div className="h-5 bg-zinc-700 rounded w-1/3 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <p>No products available at the moment.</p>
            <p className="text-sm mt-1">Check back soon or contact us directly.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
