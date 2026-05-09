import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, deleteProduct, updateProduct } from '@/lib/productService'
import type { Product } from '@/data/products'
import { categories } from '@/data/products'
import { useLang } from '@/context/LangContext'

function categoryName(id: string) {
  return categories.find((c) => c.id === id)?.name ?? id
}

function StockBadge({ qty }: { qty: number | undefined }) {
  if (qty === undefined) return null
  if (qty === 0) return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700">0</span>
  if (qty <= 3) return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">{qty}</span>
  return <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold bg-green-100 text-green-700">{qty}</span>
}

export default function AdminProducts() {
  const { t } = useLang()
  const [products, setProducts] = useState<Product[]>([])
  const [fetching, setFetching] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [savingStockId, setSavingStockId] = useState<string | null>(null)
  // draft stock values while user is typing
  const [stockDraft, setStockDraft] = useState<Record<string, string>>({})

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setFetching(false))
  }, [])

  const handleDelete = async (product: Product) => {
    if (!confirm(t('products.confirmDelete', { name: product.name }))) return
    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch {
      alert(t('products.failedDelete'))
    } finally {
      setDeletingId(null)
    }
  }

  const commitStock = async (product: Product, rawVal: string) => {
    const trimmed = rawVal.trim()
    const qty = trimmed === '' ? undefined : Math.max(0, parseInt(trimmed) || 0)
    // no-op if unchanged
    if (qty === product.stockQty) {
      setStockDraft((d) => { const n = { ...d }; delete n[product.id]; return n })
      return
    }
    setSavingStockId(product.id)
    try {
      await updateProduct(product.id, {
        stockQty: qty,
        inStock: qty === undefined ? product.inStock : qty > 0,
      })
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id
            ? { ...p, stockQty: qty, inStock: qty === undefined ? p.inStock : qty > 0 }
            : p
        )
      )
      setStockDraft((d) => { const n = { ...d }; delete n[product.id]; return n })
    } catch {
      alert(t('products.failedStock'))
    } finally {
      setSavingStockId(null)
    }
  }

  const adjustStock = (product: Product, delta: number) => {
    const current = product.stockQty ?? 0
    const next = Math.max(0, current + delta)
    commitStock(product, String(next))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('products.title')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} {products.length !== 1 ? t('products.listings') : t('products.listing')}
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-[#E8B55F] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#D4A04D] transition-colors shadow-sm"
        >
          {t('products.new')}
        </Link>
      </div>

      {fetching ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 mb-4 text-lg">{t('products.noProducts')}</p>
          <Link
            to="/admin/products/new"
            className="inline-block bg-[#E8B55F] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#D4A04D] transition-colors"
          >
            {t('products.createFirst')}
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">{t('products.colProduct')}</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">{t('products.colCategory')}</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">{t('products.colPrice')}</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">{t('products.colInventory')}</th>
                <th className="px-4 py-3 text-gray-500 font-medium text-right">{t('products.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {product.image && (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium text-gray-800 line-clamp-2">{product.name}</span>
                        {product.bundledItems && product.bundledItems.length > 0 && (
                          <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            Bundle · {product.bundledItems.length} items
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 hidden md:table-cell">
                    {categoryName(product.category)}
                  </td>
                  <td className="px-4 py-4 text-gray-700 font-medium">
                    ${product.price.toFixed(2)}
                    {product.salePercent && (
                      <span className="ml-2 text-xs text-green-600 font-medium">{product.salePercent}% off</span>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    {product.stockQty !== undefined ? (
                      // Quantity tracking mode: show +/- controls
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => adjustStock(product, -1)}
                          disabled={savingStockId === product.id || product.stockQty === 0}
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 text-sm leading-none"
                          title={t('products.removeOne')}
                        >−</button>
                        <input
                          type="number" min="0"
                          value={stockDraft[product.id] ?? String(product.stockQty)}
                          onChange={(e) => setStockDraft((d) => ({ ...d, [product.id]: e.target.value }))}
                          onBlur={(e) => commitStock(product, e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                          disabled={savingStockId === product.id}
                          className="w-14 text-center px-1 py-0.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800 disabled:opacity-60"
                        />
                        <button
                          onClick={() => adjustStock(product, 1)}
                          disabled={savingStockId === product.id}
                          className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 text-sm leading-none"
                          title={t('products.addOne')}
                        >+</button>
                        <StockBadge qty={product.stockQty} />
                      </div>
                    ) : (
                      // No quantity tracking: show simple in-stock badge
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {product.inStock ? t('products.inStock') : t('products.outOfStock')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="text-[#E8B55F] hover:text-[#D4A04D] font-medium transition-colors"
                      >
                        {t('products.edit')}
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                      >
                        {deletingId === product.id ? t('products.deleting') : t('products.delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
