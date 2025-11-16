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
    image: '/bag.png',
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
        <h1 className="text-5xl font-bold mb-4 text-[#3E2C1F]">Learn & Discover</h1>
        <p className="text-xl text-[#6B5B4F] max-w-2xl mx-auto">
          Explore our collection of articles on sustainable living, artisan craftsmanship,
          and creating a more eco-friendly kitchen and lifestyle.
        </p>
      </div>

      {/* Featured Post */}
      <div className="mb-16">
        <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl overflow-hidden shadow-xl">
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
                <span className="text-sm text-[#9B8B7E]">{blogPosts[0].date}</span>
                <span className="text-sm text-white bg-[#E8B55F] px-3 py-1 rounded-full font-medium shadow-sm">
                  Featured
                </span>
                <span className="text-sm text-[#9B8B7E]">{blogPosts[0].readTime}</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-[#3E2C1F]">{blogPosts[0].title}</h2>
              <p className="text-[#6B5B4F] mb-6 text-lg leading-relaxed">{blogPosts[0].excerpt}</p>
              <Link
                href={`/blog/${blogPosts[0].slug}`}
                className="bg-[#E8B55F] text-white px-6 py-3 rounded-full hover:bg-[#D4A04D] transition-all shadow-md hover:shadow-lg inline-block font-medium"
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
          <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1">
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
                <span className="text-sm text-[#9B8B7E]">{post.date}</span>
                <span className="text-sm text-[#E8B55F] font-medium">{post.category}</span>
              </div>
              <h2 className="text-xl font-bold mb-3 line-clamp-2 text-[#3E2C1F]">{post.title}</h2>
              <p className="text-[#6B5B4F] mb-4 text-sm line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-[#E8B55F] hover:text-[#D4A04D] font-semibold"
                >
                  Read More →
                </Link>
                <span className="text-xs text-[#9B8B7E]">{post.readTime}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Categories Section */}
      <section className="bg-gradient-to-br from-[#C9D4C0] to-[#A8B89F] rounded-2xl p-8 shadow-lg">
        <h3 className="text-3xl font-bold mb-6 text-center text-white">Explore by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#E8B55F] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-white text-xl">🐝</span>
            </div>
            <h4 className="font-semibold mb-2 text-[#3E2C1F]">Sustainable Living</h4>
            <p className="text-sm text-[#6B5B4F]">Eco-friendly tips and practices</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#C87855] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-white text-xl">🥖</span>
            </div>
            <h4 className="font-semibold mb-2 text-[#3E2C1F]">Baking Mastery</h4>
            <p className="text-sm text-[#6B5B4F]">Professional baking techniques</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#8A9B82] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-white text-xl">🌱</span>
            </div>
            <h4 className="font-semibold mb-2 text-[#3E2C1F]">Eco-Living</h4>
            <p className="text-sm text-[#6B5B4F]">Green lifestyle choices</p>
          </div>
          <div className="text-center p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-[#D4A5A5] rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
              <span className="text-white text-xl">🏠</span>
            </div>
            <h4 className="font-semibold mb-2 text-[#3E2C1F]">Artisan Craftsmanship</h4>
            <p className="text-sm text-[#6B5B4F]">Handmade quality and tradition</p>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="mt-16 bg-gradient-to-r from-[#E8B55F] to-[#D4A04D] text-white rounded-2xl p-8 text-center shadow-xl">
        <h3 className="text-3xl font-bold mb-4">Stay Updated</h3>
        <p className="mb-6 max-w-2xl mx-auto text-lg">
          Get the latest tips on sustainable living, home baking, and artisan craftsmanship
          delivered straight to your inbox.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-4 py-3 rounded-full text-[#3E2C1F] shadow-md focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button className="bg-white text-[#E8B55F] px-6 py-3 rounded-full hover:bg-[#FFFBF5] transition-all shadow-md hover:shadow-lg font-semibold">
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
} 