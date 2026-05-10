import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-[#FFF8E7] rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl">🍞</span>
        </div>
        <h1 className="text-6xl font-bold text-[#3E2C1F] mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-[#3E2C1F] mb-4">Page Not Found</h2>
        <p className="text-[#6B5B4F] mb-10 leading-relaxed">
          Looks like this page wandered off. Let's get you back to something fresh out of the oven.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-[#E8B55F] text-white px-8 py-3 rounded-full hover:bg-[#D4A04D] transition-all shadow-md font-medium"
          >
            Go Home
          </Link>
          <Link
            to="/products"
            className="border border-[#E8B55F] text-[#E8B55F] px-8 py-3 rounded-full hover:bg-[#E8B55F] hover:text-white transition-all font-medium"
          >
            Shop Products
          </Link>
        </div>
      </div>
    </div>
  )
}
