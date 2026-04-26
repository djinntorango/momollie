import { useEffect, useState } from 'react'
import { getProducts } from '@/lib/productService'
import type { Product } from '@/data/products'
import ProductGrid from '@/components/ProductGrid'

export default function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-[#3E2C1F]">Handcrafted with Love</h1>
        <p className="text-xl text-[#6B5B4F] max-w-2xl mx-auto">Discover our collection of beeswax bread bags and sustainable kitchen accessories, all handmade to help you live more sustainably.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
            <p className="text-[#6B5B4F]">Loading products...</p>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-[#6B5B4F] mb-4">Could not load products right now. Please try again later.</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}

      <section className="mt-16 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl p-8 shadow-lg">
        <h2 className="text-4xl font-bold text-center mb-8 text-[#3E2C1F]">Why Choose DearMomollie?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#E8B55F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"><span className="text-white text-2xl">🐝</span></div>
            <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Natural Beeswax</h3>
            <p className="text-[#6B5B4F]">Made with beeswax and quality materials to help keep your bread fresh naturally.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#C87855] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"><span className="text-white text-2xl">🏠</span></div>
            <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Handcrafted</h3>
            <p className="text-[#6B5B4F]">Each item is lovingly handmade in small batches, ensuring quality and attention to detail.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#A8B89F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"><span className="text-white text-2xl">🌱</span></div>
            <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Sustainable</h3>
            <p className="text-[#6B5B4F]">A plastic-free alternative to help keep your homemade bread fresh and reduce waste.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
