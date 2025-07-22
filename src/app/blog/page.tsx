import Image from 'next/image';
import Link from 'next/link';

// Mock blog posts
const blogPosts = [
  {
    id: 1,
    title: 'Top 10 Must-Have Pet Products for New Pet Owners',
    excerpt: 'Discover the essential products every new pet owner needs to make their furry friend feel at home.',
    date: 'March 15, 2024',
    category: 'Pets',
    image: '/placeholder-blog-1.jpg',
  },
  {
    id: 2,
    title: 'Baby Safety: Essential Products for Your Nursery',
    excerpt: 'Learn about the must-have safety products to create a secure environment for your little one.',
    date: 'March 10, 2024',
    category: 'Baby',
    image: '/placeholder-blog-2.jpg',
  },
  {
    id: 3,
    title: 'Sustainable Pet Care: Eco-Friendly Products',
    excerpt: 'Explore our selection of environmentally friendly pet products that are good for your pet and the planet.',
    date: 'March 5, 2024',
    category: 'Pets',
    image: '/placeholder-blog-3.jpg',
  },
  {
    id: 4,
    title: 'Baby Development: Choosing the Right Toys',
    excerpt: 'A guide to selecting age-appropriate toys that support your baby\'s growth and development.',
    date: 'February 28, 2024',
    category: 'Baby',
    image: '/placeholder-blog-4.jpg',
  },
];

export default function BlogPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-12">Our Blog</h1>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {blogPosts.map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="relative h-64">
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
                <span className="text-sm text-pink-600">{post.category}</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">{post.title}</h2>
              <p className="text-gray-600 mb-6">{post.excerpt}</p>
              <Link
                href={`/blog/${post.id}`}
                className="text-pink-600 hover:text-pink-700 font-semibold"
              >
                Read More →
              </Link>
            </div>
          </article>
        ))}
      </div>

      {/* Categories Sidebar */}
      <div className="mt-12">
        <h3 className="text-xl font-bold mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-full bg-pink-600 text-white">
            All Posts
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300">
            Pets
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300">
            Baby
          </button>
        </div>
      </div>
    </div>
  );
} 