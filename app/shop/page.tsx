'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api, Category, ProductListResponse } from '@/lib/api'
import ProductCard from '@/components/ProductCard'

// Flatten category tree to leaf nodes (nodes with no children, or all nodes)
function flattenCategories(categories: Category[]): Category[] {
  const result: Category[] = []
  function walk(cats: Category[]) {
    for (const c of cats) {
      result.push(c)
      if (c.children && c.children.length > 0) {
        walk(c.children)
      }
    }
  }
  walk(categories)
  return result
}

// Inner component that uses useSearchParams — must be wrapped in Suspense
function ShopContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [categories, setCategories] = useState<Category[]>([])
  const [productList, setProductList] = useState<ProductListResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const currentCategory = searchParams.get('category') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  const [searchInput, setSearchInput] = useState(currentSearch)

  // Load categories once
  useEffect(() => {
    api.getCategories().then(r => setCategories(flattenCategories(r.data))).catch(() => {})
  }, [])

  // Load products when filters change
  const loadProducts = useCallback(() => {
    setLoading(true)
    api
      .getProducts({
        category: currentCategory || undefined,
        search: currentSearch || undefined,
        page: currentPage,
      })
      .then(data => setProductList(data))
      .catch(() => setProductList(null))
      .finally(() => setLoading(false))
  }, [currentCategory, currentSearch, currentPage])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v) {
        params.set(k, v)
      } else {
        params.delete(k)
      }
    }
    // Reset to page 1 on filter change (unless explicitly setting page)
    if (!('page' in updates)) {
      params.delete('page')
    }
    router.push(`/shop?${params.toString()}`)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ search: searchInput, page: '' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Shop</h1>
        <p className="text-zinc-400 text-sm mt-1">
          {productList ? `${productList.meta.total} products` : 'Loading...'}
          {currentCategory && ` in "${categories.find(c => c.slug === currentCategory)?.name || currentCategory}"`}
          {currentSearch && ` matching "${currentSearch}"`}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Search
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                Go
              </button>
            </div>
          </form>

          {/* Categories */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Categories
            </label>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => updateParams({ category: '', search: currentSearch })}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    !currentCategory
                      ? 'bg-blue-600 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => updateParams({ category: cat.slug, search: currentSearch })}
                    className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                      currentCategory === cat.slug
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
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
          ) : !productList || productList.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-zinc-600 text-5xl mb-4">🔍</div>
              <p className="text-zinc-400 font-medium">No products found</p>
              <p className="text-zinc-600 text-sm mt-1">Try a different category or search term</p>
              <button
                onClick={() => {
                  setSearchInput('')
                  updateParams({ category: '', search: '' })
                }}
                className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productList.data.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {productList.meta.last_page > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    onClick={() => updateParams({ page: String(currentPage - 1) })}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: productList.meta.last_page }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === productList.meta.last_page || Math.abs(p - currentPage) <= 2)
                    .map((page, idx, arr) => (
                      <>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span key={`ellipsis-${page}`} className="text-zinc-600 px-1">…</span>
                        )}
                        <button
                          key={page}
                          onClick={() => updateParams({ page: String(page) })}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                            page === currentPage
                              ? 'bg-blue-600 text-white'
                              : 'bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          {page}
                        </button>
                      </>
                    ))}

                  <button
                    onClick={() => updateParams({ page: String(currentPage + 1) })}
                    disabled={currentPage >= productList.meta.last_page}
                    className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Suspense boundary required because ShopContent uses useSearchParams
export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="h-8 bg-zinc-800 rounded w-24 mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden animate-pulse">
              <div className="aspect-square bg-zinc-700" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-zinc-700 rounded w-3/4" />
                <div className="h-5 bg-zinc-700 rounded w-1/3 mt-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  )
}
