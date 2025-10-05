import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { products, categories } from '@/data/products';

export const metadata: Metadata = {
  title: "Handcrafted Products - Beeswax Bread Bags & Kitchen Accessories | DearMomollie",
  description: "Shop our collection of handmade beeswax bread bags, sustainable kitchen accessories, and eco-friendly storage solutions. Made with organic cotton and pure beeswax.",
  keywords: "handmade kitchen accessories, beeswax bread bags, sustainable storage, eco-friendly products, artisan crafts, organic cotton, plastic-free kitchen",
  openGraph: {
    title: "Handcrafted Beeswax Products - DearMomollie",
    description: "Eco-friendly kitchen accessories handcrafted with love and sustainable materials",
    images: ["/products/large-bread-bag.jpg"],
  },
};

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 text-[#3E2C1F]">Handcrafted with Love</h1>
        <p className="text-xl text-[#6B5B4F] max-w-2xl mx-auto">
          Discover our collection of beeswax bread bags and sustainable kitchen accessories,
          all handmade to help you live more sustainably.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        <button className="px-6 py-2 rounded-full bg-[#E8B55F] text-white hover:bg-[#D4A04D] transition-all shadow-md">
          All Products
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className="px-6 py-2 rounded-full bg-[#F5E6D3] text-[#6B5B4F] hover:bg-[#E8B55F] hover:text-white transition-all shadow-sm"
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
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
                <span className="text-sm text-[#9B8B7E] capitalize">
                  {categories.find(cat => cat.id === product.category)?.name || product.category}
                </span>
                {product.materials.includes('Organic cotton') && (
                  <span className="text-xs bg-[#C9D4C0] text-[#3E2C1F] px-2 py-1 rounded-full font-medium">
                    Organic
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold mt-2 mb-2 text-[#3E2C1F]">{product.name}</h3>
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

      {/* Why Choose Us Section */}
      <section className="mt-16 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl p-8 shadow-lg">
        <h2 className="text-4xl font-bold text-center mb-8 text-[#3E2C1F]">Why Choose DearMomollie?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#E8B55F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-white text-2xl">🐝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">100% Natural</h3>
            <p className="text-[#6B5B4F]">
              Made with pure beeswax and organic cotton, our products are completely natural and biodegradable.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#C87855] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-white text-2xl">🏠</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Handcrafted</h3>
            <p className="text-[#6B5B4F]">
              Each item is lovingly handmade in small batches, ensuring quality and attention to detail.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#A8B89F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <span className="text-white text-2xl">🌱</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Sustainable</h3>
            <p className="text-[#6B5B4F]">
              Help reduce plastic waste while keeping your food fresh with our eco-friendly alternatives.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-16 text-center bg-gradient-to-r from-[#E8C7C7] to-[#D4A5A5] rounded-2xl p-12 shadow-lg">
        <h2 className="text-4xl font-bold mb-4 text-[#3E2C1F]">Ready to Go Plastic-Free?</h2>
        <p className="text-xl text-[#5D4037] mb-8">
          Join thousands of families who have made the switch to sustainable food storage.
        </p>
        <Link
          href="https://dearmomollie.etsy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#B88585] text-white px-8 py-3 rounded-full hover:bg-[#A06B6B] transition-all shadow-md hover:shadow-lg text-lg font-medium inline-block"
        >
          Visit Our Etsy Shop
        </Link>
      </section>
    </div>
  );
} 