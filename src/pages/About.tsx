import { Link } from 'react-router-dom'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="relative h-96 w-full mb-8 rounded-2xl overflow-hidden">
          <img src="/hero.png" alt="Dear Momollie handcrafted beeswax bread bags made in Denton, Texas" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <h1 className="text-5xl font-bold text-center mb-6 text-[#3E2C1F]">About Dear Momollie</h1>
        <p className="text-xl text-[#6B5B4F] text-center max-w-3xl mx-auto leading-relaxed">
          Handcrafted beeswax bread bags made with love in Denton, Texas — where my passion for
          sewing, baking, and sustainable living all came together in one little bag.
        </p>
      </section>

      {/* Our Story */}
      <section className="mb-16">
        <h2 className="text-4xl font-bold mb-8 text-[#3E2C1F]">Our Story</h2>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#6B5B4F] mb-6 text-lg leading-relaxed">
              Dear Momollie is my story. I grew up learning to sew and bake on my grandmother's
              farm — two skills passed down through her hands that I never imagined would one day
              come together in a business.
            </p>
            <p className="text-[#6B5B4F] mb-6 text-lg leading-relaxed">
              About five years ago I discovered beeswax as a natural way to keep homemade bread
              fresher longer. I started hand-sewing my own bread bags with beeswax linings —
              combining my grandmother's craft traditions with a practical solution for a
              plastic-free kitchen.
            </p>
            <p className="text-[#6B5B4F] mb-6 text-lg leading-relaxed">
              Whenever friends came to visit, they'd leave with a loaf of freshly baked sourdough
              tucked inside one of my bags. It wasn't long before they started asking for bags of
              their own. Word spread the way good bread does — naturally, and with a lot of warmth.
            </p>
            <p className="text-[#6B5B4F] text-lg leading-relaxed">
              What started as a gift became a calling. Based out of Denton, Texas, Dear Momollie
              is my way of sharing that passion with home bakers everywhere — one beeswax bread
              bag at a time.
            </p>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl">
            <img src="/bag.png" alt="Handcrafted beeswax bread bag made in Denton Texas" className="absolute inset-0 w-full h-full object-cover" />
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
              Every bag is cut and sewn by hand, the same way my grandmother taught me.
              No shortcuts, no mass production — just careful, intentional making.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-[#C87855] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <span className="text-white text-3xl">🐝</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-[#3E2C1F]">Natural Ingredients</h3>
            <p className="text-[#6B5B4F] text-center leading-relaxed">
              We use pure beeswax because it works — naturally antimicrobial, breathable, and
              proven across generations to keep bread fresh without plastic or synthetic chemicals.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] p-8 rounded-2xl shadow-lg">
            <div className="w-16 h-16 bg-[#A8B89F] rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
              <span className="text-white text-3xl">🌾</span>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-center text-[#3E2C1F]">Rooted in Tradition</h3>
            <p className="text-[#6B5B4F] text-center leading-relaxed">
              The skills behind every Dear Momollie bag were passed down on a family farm. We
              believe the best things — bread, craft, community — are worth doing the old-fashioned way.
            </p>
          </div>
        </div>
      </section>

      {/* The Craft */}
      <section className="mb-16 bg-gradient-to-br from-[#C9D4C0] to-[#A8B89F] rounded-2xl p-12 text-white">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-xl order-2 md:order-1">
            <img src="/cover.png" alt="Sansui's handcrafted beeswax bread bags" className="absolute inset-0 w-full h-full object-cover" />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-4xl font-bold mb-6">Made in Denton, With Love</h2>
            <p className="text-lg mb-6 leading-relaxed">
              Every Dear Momollie bag starts at my sewing machine in Denton, Texas. I select
              quality organic cotton fabrics, cut each piece by hand, and apply a pure beeswax
              lining designed to protect your bread the natural way.
            </p>
            <p className="text-lg leading-relaxed">
              When you order from Dear Momollie, you're not getting something off a shelf. You're
              getting something made by hand, by someone who genuinely loves both baking and the
              craft of making — and who wants your bread to taste just as good on day four as it
              did fresh from the oven.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl p-12 shadow-lg">
        <h2 className="text-4xl font-bold mb-6 text-[#3E2C1F]">Bake More. Waste Less.</h2>
        <p className="text-xl text-[#6B5B4F] mb-8 max-w-2xl mx-auto leading-relaxed">
          Whether you're a seasoned sourdough baker or just getting started, Dear Momollie's
          handcrafted beeswax bread bags are the sustainable storage solution your kitchen has
          been missing.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/products"
            className="bg-[#E8B55F] text-white px-8 py-4 rounded-full hover:bg-[#D4A04D] transition-all shadow-md hover:shadow-lg text-lg font-medium"
          >
            Shop Our Products
          </Link>
        </div>
      </section>
    </div>
  )
}
