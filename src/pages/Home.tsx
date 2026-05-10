import { Link } from 'react-router-dom'
import Testimonials from '@/components/Testimonials'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[600px] md:min-h-[700px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/hero.png" alt="Handcrafted beeswax bread bags and kitchen accessories" className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFBF5]/40 via-[#FFF8E7]/50 to-[#F5E6D3]/75 z-10"></div>
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight drop-shadow-md">Dear Momollie</h1>
            <p className="text-2xl md:text-3xl text-black mb-6 leading-relaxed drop-shadow-md font-semibold">Your home for beeswax bread bags and bread-making essentials</p>
            <p className="text-lg md:text-xl text-[#3E2C1F] mb-8 drop-shadow-md font-medium">Handcrafted accessories to keep your homemade bread fresh and your kitchen plastic-free</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/products" className="bg-[#E8B55F] text-white px-6 py-3 rounded-full hover:bg-[#D4A04D] transition-all shadow-md hover:shadow-lg text-center font-medium whitespace-nowrap">Shop Our Collection</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-4 text-[#3E2C1F]">Our Handcrafted Collection</h2>
          <p className="text-center text-[#6B5B4F] mb-8 max-w-2xl mx-auto text-lg">Discover our range of eco-friendly kitchen accessories, designed to help you live more sustainably</p>
          <div className="text-center">
            <Link to="/products" className="inline-block bg-[#E8B55F] text-white px-8 py-4 rounded-full hover:bg-[#D4A04D] transition-all shadow-md hover:shadow-lg text-lg font-medium">Browse All Products</Link>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl shadow-md">
              <div className="w-16 h-16 bg-[#E8B55F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><span className="text-white text-3xl">🥖</span></div>
              <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Beeswax Bread Bags</h3>
              <p className="text-[#6B5B4F]">Keep your homemade bread fresh naturally with our handcrafted beeswax-lined bags</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl shadow-md">
              <div className="w-16 h-16 bg-[#C87855] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><span className="text-white text-3xl">🍴</span></div>
              <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Kitchen Accessories</h3>
              <p className="text-[#6B5B4F]">Handmade sustainable tools and accessories for the eco-conscious home baker</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-[#FFF8E7] to-[#F5E6D3] rounded-2xl shadow-md">
              <div className="w-16 h-16 bg-[#A8B89F] rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><span className="text-white text-3xl">🌿</span></div>
              <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Sustainable Storage</h3>
              <p className="text-[#6B5B4F]">Plastic-free storage solutions for a healthier kitchen and planet</p>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Blog Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-[#3E2C1F]">Learn &amp; Discover</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48"><img src="/bake.png" alt="How to store sourdough bread" className="absolute inset-0 w-full h-full object-cover" /></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">How to Store Sourdough Bread: Keep It Fresh for Days</h3>
                <p className="text-[#6B5B4F] mb-4">The secret to maintaining that perfect sourdough crust and pillowy interior lies in proper storage...</p>
                <Link to="/blog/how-to-store-sourdough-bread" className="text-[#E8B55F] hover:text-[#D4A04D] font-medium">Read More →</Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48"><img src="/bag2.jpg" alt="Best bread storage methods compared" className="absolute inset-0 w-full h-full object-cover" /></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Best Bread Storage Methods Compared</h3>
                <p className="text-[#6B5B4F] mb-4">We tested every popular bread storage method to find which one keeps your homemade bread fresh the longest...</p>
                <Link to="/blog/bread-storage-methods-compared" className="text-[#E8B55F] hover:text-[#D4A04D] font-medium">Read More →</Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48"><img src="/blog-sustainable-kitchen.jpg" alt="Plastic-free kitchen swaps for home bakers" className="absolute inset-0 w-full h-full object-cover" /></div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-[#3E2C1F]">Plastic-Free Kitchen Swaps for Home Bakers</h3>
                <p className="text-[#6B5B4F] mb-4">Simple, practical swaps that help you bake sustainably while reducing plastic waste in your kitchen...</p>
                <Link to="/blog/plastic-free-kitchen-swaps" className="text-[#E8B55F] hover:text-[#D4A04D] font-medium">Read More →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
