import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getProducts, deleteProduct } from '@/lib/productService'
import type { Product } from '@/data/products'
import { categories } from '@/data/products'

function categoryName(id: string) {
  return categories.find((c) => c.id === id)?.name ?? id
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [fetching, setFetching] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .finally(() => setFetching(false))
  }, [])

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setDeletingId(product.id)
    try {
      await deleteProduct(product.id)
      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch {
      alert('Failed to delete product. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500 text-sm mt-1">
            {products.length} listing{products.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="bg-[#E8B55F] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#D4A04D] transition-colors shadow-sm"
        >
          + New Product
        </Link>
      </div>

      {fetching ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-gray-400 mb-4 text-lg">No products yet.</p>
          <Link
            to="/admin/products/new"
            className="inline-block bg-[#E8B55F] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-[#D4A04D] transition-colors"
          >
            Create your first listing
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-gray-500 font-medium">Product</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Price</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Stock</th>
                <th className="px-4 py-3 text-gray-500 font-medium text-right">Actions</th>
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
                      <span className="font-medium text-gray-800 line-clamp-2">{product.name}</span>
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
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        to={`/admin/products/${product.id}/edit`}
                        className="text-[#E8B55F] hover:text-[#D4A04D] font-medium transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="text-red-400 hover:text-red-600 font-medium transition-colors disabled:opacity-50"
                      >
                        {deletingId === product.id ? 'Deleting...' : 'Delete'}
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
