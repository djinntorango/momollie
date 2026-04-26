import { useEffect, useState } from 'react'
import { getProducts, applyProductSale, removeProductSale } from '@/lib/productService'
import type { Product } from '@/data/products'

export default function Sales() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [percent, setPercent] = useState<string>('10')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setLoading(false))
  }, [])

  const allSelected = products.length > 0 && selected.size === products.length

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set())
    } else {
      setSelected(new Set(products.map((p) => p.id)))
    }
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleApply = async () => {
    const pct = parseFloat(percent)
    if (!pct || pct <= 0 || pct >= 100) return alert('Enter a percentage between 1 and 99.')
    if (selected.size === 0) return alert('Select at least one product.')
    setSaving(true)
    try {
      await applyProductSale([...selected], pct)
      setProducts((prev) =>
        prev.map((p) => (selected.has(p.id) ? { ...p, salePercent: pct } : p))
      )
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (selected.size === 0) return alert('Select at least one product.')
    setSaving(true)
    try {
      await removeProductSale([...selected])
      setProducts((prev) =>
        prev.map((p) => (selected.has(p.id) ? { ...p, salePercent: undefined } : p))
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
        <p className="text-gray-500 text-sm mt-1">Apply percentage discounts to products</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="w-4 h-4 accent-[#E8B55F]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Product</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Price</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Current Sale</th>
                  <th className="px-4 py-3 text-left text-gray-500 font-medium">Sale Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => {
                  const salePrice = product.salePercent
                    ? (product.price * (1 - product.salePercent / 100)).toFixed(2)
                    : null
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => toggle(product.id)}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selected.has(product.id)}
                          onChange={() => toggle(product.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 accent-[#E8B55F]"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {product.image && (
                              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <span className="font-medium text-gray-800">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-4">
                        {product.salePercent ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {product.salePercent}% off
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">None</span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-medium text-green-600">
                        {salePrice ? `$${salePrice}` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Action bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-wrap items-center gap-4">
            <span className="text-sm text-gray-500">
              {selected.size} product{selected.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="number"
                min="1"
                max="99"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
              />
              <span className="text-sm text-gray-500">% off</span>
              <button
                onClick={handleApply}
                disabled={saving || selected.size === 0}
                className="bg-[#E8B55F] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#D4A04D] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Apply Sale'}
              </button>
              <button
                onClick={handleRemove}
                disabled={saving || selected.size === 0}
                className="bg-white border border-red-300 text-red-500 px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Remove Sale
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
