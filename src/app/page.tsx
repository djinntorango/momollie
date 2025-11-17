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
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero.png"
            alt="Handcrafted beeswax bread bags and kitchen accessories"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Gradient Overlay - lighter to show image, darker at bottom for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFBF5]/40 via-[#FFF8E7]/50 to-[#F5E6D3]/75 z-10"></div>

        {/* Content */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight drop-shadow-md">
              Dear Momollie
            </h1>
            <p className="text-2xl md:text-3xl text-black mb-6 leading-relaxed drop-shadow-md font-semibold">
              Your home for beeswax bread bags and bread-making essentials
            </p>
            <p className="text-lg md:text-xl text-[#3E2C1F] mb-8 drop-shadow-md font-medium">
              Handcrafted accessories to keep your homemade bread fresh and your kitchen plastic-free
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/products"
                className="bg-[#E8B55F] text-white px-6 py-3 rounded-full hover:bg-[#D4A04D] transition-all shadow-md hover:shadow-lg text-center font-medium whitespace-nowrap"
              >
                Shop Our Collection
              </Link>
              <Link
                href="https://dearmomollie.etsy.com"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#C87855] text-white px-6 py-3 rounded-full hover:bg-[#B86845] transition-all shadow-md hover:shadow-lg text-center font-medium whitespace-nowrap"
              >
                Visit Our Etsy Shop
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-[#3E2C1F]">Our Handcrafted Collection</h2>
          <p className="text-center text-[#6B5B4F] mb-8 max-w-2xl mx-auto text-lg">
            Discover our range of eco-friendly kitchen accessories, designed to help you live more sustainably
          </p>
          <div className="text-center">
            <Link
              href="/products"
              className="inline-block bg-[#E8B55F] text-white px-8 py-4 rounded-full hover:bg-[#D4A04D] transition-all shadow-md hover:shadow-lg text-lg font-medium"
            >
              Browse All Products
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl shadow-md">
              <div className="w-16 h-16 bg-[#E8B55F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-white text-3xl">🥖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Beeswax Bread Bags</h3>
              <p className="text-[#6B5B4F]">
                Keep your homemade bread fresh naturally with our handcrafted beeswax-lined bags
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl shadow-md">
              <div className="w-16 h-16 bg-[#C87855] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-white text-3xl">🍴</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Kitchen Accessories</h3>
              <p className="text-[#6B5B4F]">
                Handmade sustainable tools and accessories for the eco-conscious home baker
              </p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl shadow-md">
              <div className="w-16 h-16 bg-[#A8B89F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <span className="text-white text-3xl">🌿</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Sustainable Storage</h3>
              <p className="text-[#6B5B4F]">
                Plastic-free storage solutions for a healthier kitchen and planet
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#3E2C1F]">Learn & Discover</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image
                  src="/bag.png"
                  alt="Beeswax bread storage benefits"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Why Beeswax is Superior for Bread Storage</h3>
                <p className="text-[#6B5B4F] mb-4">
                  Discover the natural benefits of beeswax-lined bags for keeping your homemade bread fresh longer...
                </p>
                <Link
                  href="/blog/beeswax-bread-storage-benefits"
                  className="text-[#E8B55F] hover:text-[#D4A04D] font-medium"
                >
                  Read More →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image
                  src="/bake.png"
                  alt="Home bakery tips"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Improving Your Home Bakery Skills</h3>
                <p className="text-[#6B5B4F] mb-4">
                  Expert tips and techniques to elevate your home baking and create artisan-quality bread...
                </p>
                <Link
                  href="/blog/home-bakery-skills"
                  className="text-[#E8B55F] hover:text-[#D4A04D] font-medium"
                >
                  Read More →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image
                  src="/blog-sustainable-kitchen.jpg"
                  alt="Sustainable kitchen solutions"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Sustainable Kitchen Solutions</h3>
                <p className="text-[#6B5B4F] mb-4">
                  Simple swaps and eco-friendly practices to make your kitchen more sustainable and plastic-free...
                </p>
                <Link
                  href="/blog/sustainable-kitchen-solutions"
                  className="text-[#E8B55F] hover:text-[#D4A04D] font-medium"
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
