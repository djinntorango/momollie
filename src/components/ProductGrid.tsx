'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/data/products';

type PriceRange = 'all' | 'under20' | '20-40' | '40-60' | 'over60';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange>('all');

  // Filter products by price
  const filteredProducts = products.filter((product) => {
    switch (selectedPriceRange) {
      case 'under20':
        return product.price < 20;
      case '20-40':
        return product.price >= 20 && product.price < 40;
      case '40-60':
        return product.price >= 40 && product.price < 60;
      case 'over60':
        return product.price >= 60;
      case 'all':
      default:
        return true;
    }
  });

  return (
    <>
      {/* Price Filters */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        <button
          onClick={() => setSelectedPriceRange('all')}
          className={`px-6 py-2 rounded-full transition-all shadow-md ${
            selectedPriceRange === 'all'
              ? 'bg-[#E8B55F] text-white'
              : 'bg-[#F5E6D3] text-[#6B5B4F] hover:bg-[#E8B55F] hover:text-white shadow-sm'
          }`}
        >
          All Prices
        </button>
        <button
          onClick={() => setSelectedPriceRange('under20')}
          className={`px-6 py-2 rounded-full transition-all ${
            selectedPriceRange === 'under20'
              ? 'bg-[#E8B55F] text-white shadow-md'
              : 'bg-[#F5E6D3] text-[#6B5B4F] hover:bg-[#E8B55F] hover:text-white shadow-sm'
          }`}
        >
          Under $20
        </button>
        <button
          onClick={() => setSelectedPriceRange('20-40')}
          className={`px-6 py-2 rounded-full transition-all ${
            selectedPriceRange === '20-40'
              ? 'bg-[#E8B55F] text-white shadow-md'
              : 'bg-[#F5E6D3] text-[#6B5B4F] hover:bg-[#E8B55F] hover:text-white shadow-sm'
          }`}
        >
          $20 - $40
        </button>
        <button
          onClick={() => setSelectedPriceRange('40-60')}
          className={`px-6 py-2 rounded-full transition-all ${
            selectedPriceRange === '40-60'
              ? 'bg-[#E8B55F] text-white shadow-md'
              : 'bg-[#F5E6D3] text-[#6B5B4F] hover:bg-[#E8B55F] hover:text-white shadow-sm'
          }`}
        >
          $40 - $60
        </button>
        <button
          onClick={() => setSelectedPriceRange('over60')}
          className={`px-6 py-2 rounded-full transition-all ${
            selectedPriceRange === 'over60'
              ? 'bg-[#E8B55F] text-white shadow-md'
              : 'bg-[#F5E6D3] text-[#6B5B4F] hover:bg-[#E8B55F] hover:text-white shadow-sm'
          }`}
        >
          Over $60
        </button>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-[#3E2C1F] mb-4">No Products Found</h2>
          <p className="text-[#6B5B4F] mb-8">
            No products match this price range. Try adjusting your filter or visit our Etsy shop.
          </p>
          <Link
            href="https://dearmomollie.etsy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#E8B55F] text-white px-8 py-3 rounded-full hover:bg-[#D4A04D] transition-all shadow-md hover:shadow-lg text-lg font-medium inline-block"
          >
            Visit Our Etsy Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="relative h-64">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {!product.inStock && (
                  <div className="absolute top-3 left-3 bg-[#C87855] text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    Out of Stock
                  </div>
                )}
                {product.originalPrice && (
                  <div className="absolute top-3 right-3 bg-[#A8B89F] text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
                    Sale!
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
                  {product.originalPrice && (
                    <span className="text-lg text-[#9B8B7E] line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-2xl font-bold text-[#E8B55F]">
                    ${product.price.toFixed(2)}
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
                  <Link
                    href={product.etsyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex-1 text-center py-2 rounded-full transition-all font-medium ${
                      product.inStock
                        ? 'bg-[#E8B55F] text-white hover:bg-[#D4A04D] shadow-md hover:shadow-lg'
                        : 'bg-[#F5E6D3] text-[#9B8B7E] cursor-not-allowed'
                    }`}
                  >
                    {product.inStock ? 'Buy on Etsy' : 'Out of Stock'}
                  </Link>
                  <button className="px-4 py-2 border-2 border-[#E8B55F] text-[#E8B55F] rounded-full hover:bg-[#FFF8E7] transition-all font-medium">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
