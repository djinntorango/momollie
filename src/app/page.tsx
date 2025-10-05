import Image from "next/image";
import Link from "next/link";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "DearMomollie - Handcrafted Beeswax Bread Bags for Sustainable Living",
  description: "Keep your homemade bread fresh naturally with our handcrafted beeswax bread bags. Eco-friendly, plastic-free storage solutions made with organic cotton and pure beeswax.",
  keywords: "beeswax bread bags, handmade bread storage, eco-friendly kitchen, sustainable living, plastic-free storage, artisan crafts",
  openGraph: {
    title: "DearMomollie - Handcrafted Beeswax Bread Bags",
    description: "Natural bread storage solutions that keep your homemade bread fresh longer",
    images: ["/hero.png"],
  }, 
};

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "DearMomollie",
    "url": "https://momollie.me",
    "logo": "https://dearmomollie.com/hero.png",
    "description": "Handcrafted beeswax bread bags and sustainable kitchen accessories for eco-friendly living",
    "sameAs": [
      "https://dearmomollie.etsy.com"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "availableLanguage": "English"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "DearMomollie Products",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Beeswax Bread Bags",
            "description": "Handcrafted beeswax-lined bread bags for natural food storage"
          }
        }
      ]
    }
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Dear Momollie
              </h1>
              <p className="text-xl text-gray-600 mb-6">
                Handcrafted beeswax bread bags and artisanal kitchen accessories for sustainable living
              </p>
              <p className="text-lg text-gray-500 mb-8">
                Keeping your homemade bread fresh naturally, without plastic
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="bg-amber-600 text-white px-8 py-3 rounded-full hover:bg-amber-700 transition-colors text-center"
                >
                  Shop Our Collection
                </Link>
                <Link
                  href="https://dearmomollie.etsy.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-600 text-white px-8 py-3 rounded-full hover:bg-orange-700 transition-colors text-center"
                >
                  Visit Our Etsy Shop
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-96 w-full">
                <Image
                  src="/hero.png"
                  alt="Handcrafted beeswax bread bags and kitchen accessories"
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

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Our Handcrafted Collection</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover our range of eco-friendly kitchen accessories, designed to help you live more sustainably
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link href="/products?category=bread-bags" className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/beeswax-bread-bag.jpg"
                  alt="Beeswax Bread Bags"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold">Beeswax Bread Bags</h3>
                </div>
              </div>
            </Link>
            <Link href="/products?category=kitchen-accessories" className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/kitchen-accessories.jpg"
                  alt="Kitchen Accessories"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold">Kitchen Accessories</h3>
                </div>
              </div>
            </Link>
            <Link href="/products?category=sustainable-storage" className="group">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="/sustainable-storage.jpg"
                  alt="Sustainable Storage Solutions"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-white text-xl font-bold">Sustainable Storage</h3>
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
          <h2 className="text-3xl font-bold text-center mb-12">Learn & Discover</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/blog-beeswax-benefits.jpg"
                  alt="Beeswax bread storage benefits"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Why Beeswax is Superior for Bread Storage</h3>
                <p className="text-gray-600 mb-4">
                  Discover the natural benefits of beeswax-lined bags for keeping your homemade bread fresh longer...
                </p>
                <Link
                  href="/blog/beeswax-bread-storage-benefits"
                  className="text-amber-600 hover:text-amber-700"
                >
                  Read More →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/blog-home-bakery.jpg"
                  alt="Home bakery tips"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Improving Your Home Bakery Skills</h3>
                <p className="text-gray-600 mb-4">
                  Expert tips and techniques to elevate your home baking and create artisan-quality bread...
                </p>
                <Link
                  href="/blog/home-bakery-skills"
                  className="text-amber-600 hover:text-amber-700"
                >
                  Read More →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/blog-sustainable-kitchen.jpg"
                  alt="Sustainable kitchen solutions"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Sustainable Kitchen Solutions</h3>
                <p className="text-gray-600 mb-4">
                  Simple swaps and eco-friendly practices to make your kitchen more sustainable and plastic-free...
                </p>
                <Link
                  href="/blog/sustainable-kitchen-solutions"
                  className="text-amber-600 hover:text-amber-700"
                >
                  Read More →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
