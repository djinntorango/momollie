
export default function MomongoPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Meet Momongo
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              The AI-powered ecommerce automation platform that streamlines your business across multiple marketplaces
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gray-400 text-white px-8 py-3 rounded-full cursor-not-allowed">
                Coming Soon
              </button>
              <button className="border-2 border-gray-500 text-gray-600 px-8 py-3 rounded-full cursor-not-allowed">
                Join Waitlist - Coming Soon
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Powerful Automation for Modern Sellers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Etsy Management */}
            <div className="text-center">
              <div className="bg-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Etsy Listing Management</h3>
              <p className="text-gray-700">
                Automatically optimize your Etsy listings with AI-powered descriptions, tags, and pricing strategies that drive more sales.
              </p>
            </div>

            {/* Amazon Management */}
            <div className="text-center">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Amazon Optimization</h3>
              <p className="text-gray-700">
                Maximize your Amazon presence with intelligent keyword research, competitor analysis, and automated listing updates.
              </p>
            </div>

            {/* Alibaba Suppliers */}
            <div className="text-center">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Alibaba Supplier Management</h3>
              <p className="text-gray-700">
                Streamline your supply chain with intelligent supplier matching, price monitoring, and automated communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">How Momongo Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="flex items-start">
                  <div className="bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">1</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Connect Your Stores</h3>
                    <p className="text-gray-700">Link your Etsy, Amazon, and supplier accounts to Momongo&apos;s unified dashboard.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">2</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">AI Analysis</h3>
                    <p className="text-gray-700">Our AI analyzes your products, competitors, and market trends to identify opportunities.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 mt-1 text-sm font-bold">3</div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Automated Optimization</h3>
                    <p className="text-gray-700">Momongo automatically updates listings, manages inventory, and optimizes pricing for maximum profit.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative h-96">
              <div className="bg-gradient-to-br from-pink-200 to-purple-200 rounded-lg h-full flex items-center justify-center">
                <p className="text-gray-700 text-lg font-medium">Dashboard Preview Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Momongo?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">24/7</div>
              <h3 className="text-xl font-semibold mb-2">Automation</h3>
              <p className="text-gray-700">Your business runs around the clock, even while you sleep.</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">3x</div>
              <h3 className="text-xl font-semibold mb-2">Faster Growth</h3>
              <p className="text-gray-700">Scale your business faster with AI-powered insights.</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">50%</div>
              <h3 className="text-xl font-semibold mb-2">Time Saved</h3>
              <p className="text-gray-700">Focus on strategy while we handle the repetitive tasks.</p>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-600 mb-2">∞</div>
              <h3 className="text-xl font-semibold mb-2">Scalability</h3>
              <p className="text-gray-700">Manage unlimited products across multiple platforms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-600 to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Ecommerce Business?</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Join thousands of sellers who are already using AI to automate and scale their online businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-pink-600 px-8 py-3 rounded-full font-semibold cursor-not-allowed opacity-75">
              Get Early Access - Coming Soon
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold cursor-not-allowed opacity-75">
              Watch Demo - Coming Soon
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}