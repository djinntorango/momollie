import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="relative h-96 w-full mb-8 rounded-2xl overflow-hidden">
          <Image
            src="/hero.png"
            alt="DearMomollie handcrafted products"
            fill
            className="object-cover"
          />
        </div>
        <h1 className="text-5xl font-bold text-center mb-6 text-[#3E2C1F]">About DearMomollie</h1>
        <p className="text-xl text-[#6B5B4F] text-center max-w-3xl mx-auto leading-relaxed">
          We&apos;re passionate about creating handcrafted, sustainable solutions for home bakers
          who want to keep their bread fresh naturally—without plastic.
        </p>
      </section>

      {/* Our Story */}
      <section className="mb-16">
        <h2 className="text-4xl font-bold mb-8 text-[#3E2C1F]">Our Story</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#6B5B4F] mb-6 text-lg leading-relaxed">
              DearMomollie was created from a love of homemade bread and a desire to make sustainable
              living accessible to everyone. We believe that the simple act of baking bread at home
              shouldn&apos;t come with a side of plastic waste.
            </p>
            <p className="text-[#6B5B4F] mb-6 text-lg leading-relaxed">
              Every product we make is handcrafted with care, using natural beeswax and quality materials.
              We&apos;re passionate about helping home bakers preserve their creations while reducing their
              environmental footprint.
            </p>
            <p className="text-[#6B5B4F] text-lg leading-relaxed">
              From our hands to your kitchen, each piece is made with attention to detail and a commitment
              to making our customers happy.
            </p>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
            <Image
              src="/bag.png"
              alt="Handcrafted beeswax bread bag"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="mb-16">
        <h2 className="text-4xl font-bold mb-12 text-center text-[#3E2C1F]">What We Believe In</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-[#E8B55F] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <span className="text-white text-3xl">✋</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-[#3E2C1F]">Handcrafted Quality</h3>
            <p className="text-[#6B5B4F] text-center leading-relaxed">
              Every product is handmade by us with careful attention to detail. We take pride in
              creating accessories that are built to last and made with natural materials.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-[#C87855] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <span className="text-white text-3xl">🐝</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-[#3E2C1F]">Natural Ingredients</h3>
            <p className="text-[#6B5B4F] text-center leading-relaxed">
              We use pure beeswax in our products because it&apos;s natural, sustainable, and
              perfect for preserving bread. No synthetic chemicals or plastics—just nature&apos;s best.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-[#A8B89F] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <span className="text-white text-3xl">💚</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-[#3E2C1F]">Customer Happiness</h3>
            <p className="text-[#6B5B4F] text-center leading-relaxed">
              Your satisfaction matters to us. We&apos;re committed to creating products that make
              your life easier and supporting you with care every step of the way.
            </p>
          </div>
        </div>
      </section>

      {/* Our Craft */}
      <section className="mb-16 bg-gradient-to-br from-[#C9D4C0] to-[#A8B89F] rounded-2xl p-12 text-white">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
            <Image
              src="/cover.png"
              alt="Artisan craftsmanship"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-4xl font-bold mb-6">The Art of Handmaking</h2>
            <p className="text-lg mb-6 leading-relaxed">
              We&apos;re passionate about the craft of making things by hand. Each beeswax bread bag
              and kitchen accessory we create is made with traditional techniques and modern
              sustainability in mind.
            </p>
            <p className="text-lg leading-relaxed">
              When you choose DearMomollie, you&apos;re choosing products made with intention, care,
              and a deep respect for both the environment and the art of home baking.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl p-12 shadow-lg">
        <h2 className="text-4xl font-bold mb-6 text-[#3E2C1F]">Join Our Community</h2>
        <p className="text-xl text-[#6B5B4F] mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover our handcrafted collection and experience the difference that natural,
          sustainable products can make in your kitchen.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/products"
            className="bg-[#E8B55F] text-white px-8 py-4 rounded-full hover:bg-[#D4A04D] transition-all shadow-md hover:shadow-lg text-lg font-medium"
          >
            Shop Our Products
          </Link>
          <Link
            href="https://dearmomollie.etsy.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#C87855] text-white px-8 py-4 rounded-full hover:bg-[#B86845] transition-all shadow-md hover:shadow-lg text-lg font-medium"
          >
            Visit Our Etsy Shop
          </Link>
        </div>
      </section>
    </div>
  );
} 