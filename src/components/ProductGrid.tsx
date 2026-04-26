import { useState } from 'react'
import type { Product } from '@/data/products';
import { useCart } from '@/context/CartContext'

type SortOrder = 'default' | 'low-to-high' | 'high-to-low';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const { addItem, openCart } = useCart()

  // Sort products by price
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOrder) {
      case 'low-to-high':
        return a.price - b.price;
      case 'high-to-low':
        return b.price - a.price;
      case 'default':
      default:
        return 0; // Keep original order
    }
  });

  const handleAddToCart = (product: Product) => {
    const salePrice = product.salePercent
      ? parseFloat((product.price * (1 - product.salePercent / 100)).toFixed(2))
      : null
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      salePrice,
    })
    openCart()
  }

  return (
    <>
      {/* Sort Options */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap items-center">
        <span className="text-[#6B5B4F] font-medium">Sort by Price:</span>
        <button
          onClick={() => setSortOrder('default')}
          className={`px-6 py-2 rounded-full transition-all ${
            sortOrder === 'default'
              ? 'bg-[#E8B55F] text-white shadow-md'
              : 'bg-[#F5E6D3] text-[#6B5B4F] hover:bg-[#E8B55F] hover:text-white shadow-sm'
          }`}
        >
          Featured
        </button>
        <button
          onClick={() => setSortOrder('low-to-high')}
          className={`px-6 py-2 rounded-full transition-all ${
            sortOrder === 'low-to-high'
              ? 'bg-[#E8B55F] text-white shadow-md'
              : 'bg-[#F5E6D3] text-[#6B5B4F] hover:bg-[#E8B55F] hover:text-white shadow-sm'
          }`}
        >
          Low to High
        </button>
        <button
          onClick={() => setSortOrder('high-to-low')}
          className={`px-6 py-2 rounded-full transition-all ${
            sortOrder === 'high-to-low'
              ? 'bg-[#E8B55F] text-white shadow-md'
              : 'bg-[#F5E6D3] text-[#6B5B4F] hover:bg-[#E8B55F] hover:text-white shadow-sm'
          }`}
        >
          High to Low
        </button>
      </div>

      {/* Product Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-[#3E2C1F] mb-4">No Products Available</h2>
          <p className="text-[#6B5B4F] mb-8">
            Our products are being updated. Please check back soon or visit our Etsy shop directly.
          </p>
          <a
            href="https://dearmomollie.etsy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#E8B55F] text-white px-8 py-3 rounded-full hover:bg-[#D4A04D] transition-all shadow-md hover:shadow-lg text-lg font-medium inline-block"
          >
            Visit Our Etsy Shop
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProducts.map((product) => {
            const salePrice = product.salePercent
              ? (product.price * (1 - product.salePercent / 100)).toFixed(2)
              : null

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="relative h-64">
                  <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                  {!product.inStock && (
                    <div className="absolute top-3 left-3 bg-[#C87855] text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                      Out of Stock
                    </div>
                  )}
                  {product.salePercent && (
                    <div className="absolute top-3 right-3 bg-[#A8B89F] text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                      {product.salePercent}% Off
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    {product.materials.includes('Organic cotton') && (
                      <span className="text-xs bg-[#C9D4C0] text-[#3E2C1F] px-2 py-1 rounded-full font-medium">
                        Organic
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold mt-2 mb-2 text-[#3E2C1F]">
                    {product.name}
                  </h3>
                  <p className="text-[#6B5B4F] mb-4 text-sm line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    {salePrice && (
                      <span className="text-lg text-[#9B8B7E] line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                    <span className="text-2xl font-bold text-[#E8B55F]">
                      ${salePrice ?? product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Features Preview */}
                  <div className="mb-4">
                    <ul className="text-sm text-[#6B5B4F]">
                      {product.features.slice(0, 2).map((feature, index) => (
                        <li key={index} className="flex items-center gap-1">
                          <span className="text-[#A8B89F]">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    {product.etsyUrl && (
                      <a
                        href={product.etsyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 block text-center py-2 rounded-full transition-all font-medium ${
                          product.inStock
                            ? 'bg-[#E8B55F] text-white hover:bg-[#D4A04D] shadow-md hover:shadow-lg'
                            : 'bg-[#F5E6D3] text-[#9B8B7E] cursor-not-allowed'
                        }`}
                        onClick={(e) => !product.inStock && e.preventDefault()}
                      >
                        {product.inStock ? 'Buy on Etsy' : 'Out of Stock'}
                      </a>
                    )}
                    <button
                      disabled={!product.inStock}
                      onClick={() => handleAddToCart(product)}
                      className={`py-2 rounded-full transition-all font-medium ${
                        product.inStock
                          ? 'border border-[#E8B55F] text-[#E8B55F] hover:bg-[#E8B55F] hover:text-white'
                          : 'border border-[#F5E6D3] text-[#9B8B7E] cursor-not-allowed'
                      } ${product.etsyUrl ? 'px-4' : 'flex-1'}`}
                    >
                      {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  );
}
