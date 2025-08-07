import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Welcome to Momollie
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Premium products for your beloved pets and little ones
              </p>
              <Link
                href="/products"
                className="bg-pink-600 text-white px-8 py-3 rounded-full hover:bg-pink-700 transition-colors"
              >
                Shop Now
              </Link>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-96 w-full">
                <Image
                  src="/hero.png"
                  alt="Pet and baby products"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/products?category=pets" className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder-pets.jpg"
                  alt="Pet Products"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Pet Products</h3>
                </div>
              </div>
            </Link>
            <Link href="/products?category=baby" className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/placeholder-baby.jpg"
                  alt="Baby Products"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Baby Products</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Momongo App Preview */}
      <section className="bg-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Introducing Momongo</h2>
            <p className="text-lg text-gray-600 mb-8">
              Our AI-powered ecommerce automation platform helps you manage listings on Etsy and Amazon, 
              while streamlining your supplier relationships on Alibaba.
            </p>
            <Link
              href="/momongo"
              className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition-colors inline-block"
            >
              Learn More About Momongo
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Latest from Our Blog</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={`/placeholder-blog-${item}.jpg`}
                    alt={`Blog post ${item}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Blog Post Title {item}</h3>
                  <p className="text-gray-600 mb-4">
                    A brief description of the blog post content...
                  </p>
                  <Link
                    href={`/blog/post-${item}`}
                    className="text-pink-600 hover:text-pink-700"
                  >
                    Read More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
