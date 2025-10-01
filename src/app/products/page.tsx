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
        <h1 className="text-4xl font-bold mb-4">Handcrafted with Love</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover our collection of beeswax bread bags and sustainable kitchen accessories,
          all handmade to help you live more sustainably.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex justify-center gap-4 mb-12 flex-wrap">
        <button className="px-6 py-2 rounded-full bg-amber-600 text-white">
          All Products
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className="px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-64">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
              {!product.inStock && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                  Out of Stock
                </div>
              )}
              {product.originalPrice && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                  Sale!
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500 capitalize">
                  {categories.find(cat => cat.id === product.category)?.name || product.category}
                </span>
                {product.materials.includes('Organic cotton') && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Organic
                  </span>
                )}
              </div>
              <h3 className="text-xl font-semibold mt-2 mb-2">{product.name}</h3>
              <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center gap-2 mb-4">
                {product.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-2xl font-bold text-amber-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Features Preview */}
              <div className="mb-4">
                <ul className="text-sm text-gray-600">
                  {product.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className="flex items-center gap-1">
                      <span className="text-green-500">✓</span>
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
                  className={`flex-1 text-center py-2 rounded-lg transition-colors ${
                    product.inStock
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.inStock ? 'Buy on Etsy' : 'Out of Stock'}
                </Link>
                <button className="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors">
                  Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Why Choose Us Section */}
      <section className="mt-16 bg-amber-50 rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose DearMomollie?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🐝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">100% Natural</h3>
            <p className="text-gray-600">
              Made with pure beeswax and organic cotton, our products are completely natural and biodegradable.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🏠</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Handcrafted</h3>
            <p className="text-gray-600">
              Each item is lovingly handmade in small batches, ensuring quality and attention to detail.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🌱</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sustainable</h3>
            <p className="text-gray-600">
              Help reduce plastic waste while keeping your food fresh with our eco-friendly alternatives.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="mt-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Go Plastic-Free?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of families who have made the switch to sustainable food storage.
        </p>
        <Link
          href="https://dearmomollie.etsy.com"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-amber-600 text-white px-8 py-3 rounded-full hover:bg-amber-700 transition-colors text-lg"
        >
          Visit Our Etsy Shop
        </Link>
      </section>
    </div>
  );
} 