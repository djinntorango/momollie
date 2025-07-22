import Image from 'next/image';

// Mock product data
const products = [
  {
    id: 1,
    name: 'Premium Pet Bed',
    category: 'pets',
    price: 49.99,
    image: '/placeholder-product-1.jpg',
  },
  {
    id: 2,
    name: 'Baby Stroller',
    category: 'baby',
    price: 199.99,
    image: '/placeholder-product-2.jpg',
  },
  {
    id: 3,
    name: 'Pet Food Bowl Set',
    category: 'pets',
    price: 24.99,
    image: '/placeholder-product-3.jpg',
  },
  {
    id: 4,
    name: 'Baby Monitor',
    category: 'baby',
    price: 89.99,
    image: '/placeholder-product-4.jpg',
  },
  {
    id: 5,
    name: 'Pet Grooming Kit',
    category: 'pets',
    price: 34.99,
    image: '/placeholder-product-5.jpg',
  },
  {
    id: 6,
    name: 'Baby Carrier',
    category: 'baby',
    price: 79.99,
    image: '/placeholder-product-6.jpg',
  },
];

export default function ProductsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Our Products</h1>
      
      {/* Category Filters */}
      <div className="flex justify-center gap-4 mb-12">
        <button className="px-6 py-2 rounded-full bg-pink-600 text-white">
          All Products
        </button>
        <button className="px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300">
          Pet Products
        </button>
        <button className="px-6 py-2 rounded-full bg-gray-200 hover:bg-gray-300">
          Baby Products
        </button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-64">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <span className="text-sm text-gray-500 uppercase">
                {product.category}
              </span>
              <h3 className="text-xl font-semibold mt-2 mb-2">{product.name}</h3>
              <p className="text-2xl font-bold text-pink-600">
                ${product.price.toFixed(2)}
              </p>
              <button className="mt-4 w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 