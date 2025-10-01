import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - Sustainable Living & Artisan Crafts | DearMomollie',
  description: 'Discover expert tips on sustainable living, home baking, and eco-friendly kitchen solutions. Learn about the benefits of handcrafted, plastic-free lifestyle.',
  keywords: 'sustainable living blog, eco-friendly kitchen, home baking tips, handmade crafts, zero waste lifestyle',
};

const blogPosts = [
  {
    id: 'beeswax-bread-storage-benefits',
    title: 'Why Beeswax is Superior for Bread Storage',
    excerpt: 'Discover the natural benefits of beeswax-lined bags and why they keep your homemade bread fresh 3x longer than plastic storage methods.',
    date: 'March 15, 2024',
    category: 'Sustainable Living',
    image: '/blog-beeswax-benefits.jpg',
    readTime: '5 min read',
    slug: 'beeswax-bread-storage-benefits',
  },
  {
    id: 'home-bakery-skills',
    title: 'Improving Your Home Bakery Skills',
    excerpt: 'Master the art of home baking with expert tips and techniques that will transform your kitchen into a professional bakery.',
    date: 'March 12, 2024',
    category: 'Baking Mastery',
    image: '/blog-home-bakery.jpg',
    readTime: '8 min read',
    slug: 'home-bakery-skills',
  },
  {
    id: 'sustainable-kitchen-solutions',
    title: 'Sustainable Kitchen Solutions',
    excerpt: 'Transform your kitchen with simple eco-friendly swaps that reduce waste, save money, and create a healthier environment for your family.',
    date: 'March 8, 2024',
    category: 'Eco-Living',
    image: '/blog-sustainable-kitchen.jpg',
    readTime: '7 min read',
    slug: 'sustainable-kitchen-solutions',
  },
  {
    id: 'handmade-kitchen-accessories',
    title: 'The Art of Handmade Kitchen Accessories',
    excerpt: 'In a world of mass production, handcrafted kitchen accessories offer a return to quality, sustainability, and the human touch that makes cooking a joy.',
    date: 'March 5, 2024',
    category: 'Artisan Craftsmanship',
    image: '/blog-handmade-accessories.jpg',
    readTime: '6 min read',
    slug: 'handmade-kitchen-accessories',
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Learn & Discover</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Explore our collection of articles on sustainable living, artisan craftsmanship,
          and creating a more eco-friendly kitchen and lifestyle.
        </p>
      </div>

      {/* Featured Post */}
      <div className="mb-16">
        <div className="bg-amber-50 rounded-lg overflow-hidden shadow-lg">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="relative h-64 md:h-full">
                <Image
                  src={blogPosts[0].image}
                  alt={blogPosts[0].title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-1/2 p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-500">{blogPosts[0].date}</span>
                <span className="text-sm text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                  Featured
                </span>
                <span className="text-sm text-gray-500">{blogPosts[0].readTime}</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">{blogPosts[0].title}</h2>
              <p className="text-gray-600 mb-6 text-lg">{blogPosts[0].excerpt}</p>
              <Link
                href={`/blog/${blogPosts[0].slug}`}
                className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors inline-block"
              >
                Read Full Article →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {blogPosts.slice(1).map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-500">{post.date}</span>
                <span className="text-sm text-amber-600">{post.category}</span>
              </div>
              <h2 className="text-xl font-bold mb-3 line-clamp-2">{post.title}</h2>
              <p className="text-gray-600 mb-4 text-sm line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-amber-600 hover:text-amber-700 font-semibold"
                >
                  Read More →
                </Link>
                <span className="text-xs text-gray-400">{post.readTime}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Categories Section */}
      <section className="bg-gray-50 rounded-lg p-8">
        <h3 className="text-2xl font-bold mb-6 text-center">Explore by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">🐝</span>
            </div>
            <h4 className="font-semibold mb-2">Sustainable Living</h4>
            <p className="text-sm text-gray-600">Eco-friendly tips and practices</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">🥖</span>
            </div>
            <h4 className="font-semibold mb-2">Baking Mastery</h4>
            <p className="text-sm text-gray-600">Professional baking techniques</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">🌱</span>
            </div>
            <h4 className="font-semibold mb-2">Eco-Living</h4>
            <p className="text-sm text-gray-600">Green lifestyle choices</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-white text-xl">🏠</span>
            </div>
            <h4 className="font-semibold mb-2">Artisan Craftsmanship</h4>
            <p className="text-sm text-gray-600">Handmade quality and tradition</p>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="mt-16 bg-amber-600 text-white rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
        <p className="mb-6 max-w-2xl mx-auto">
          Get the latest tips on sustainable living, home baking, and artisan craftsmanship
          delivered straight to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-2 rounded-lg text-gray-900"
          />
          <button className="bg-white text-amber-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors font-semibold">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
} 