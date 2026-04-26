import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { itemCount } = useCart()
  const navigate = useNavigate()

  return (
    <nav className="bg-[#FFF8E7] shadow-md border-b-2 border-[#E8B55F]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-[#C87855] hover:text-[#E09470] transition-colors">
            Momollie
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors">Home</Link>
            <Link to="/products" className="text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors">Products</Link>
            <Link to="/blog" className="text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors">Blog</Link>
            <Link to="/about" className="text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors">About</Link>
            <button
              onClick={() => navigate('/cart')}
              className="relative text-[#6B5B4F] hover:text-[#E8B55F] transition-colors"
              aria-label="View cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C87855] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => navigate('/cart')}
              className="relative text-[#6B5B4F] hover:text-[#E8B55F] transition-colors"
              aria-label="View cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#C87855] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>
            <button className="text-[#6B5B4F] hover:text-[#E8B55F]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-[#F5E6D3]">
            <Link to="/" className="block text-[#6B5B4F] hover:text-[#E8B55F] font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/products" className="block text-[#6B5B4F] hover:text-[#E8B55F] font-medium" onClick={() => setIsMenuOpen(false)}>Products</Link>
            <Link to="/blog" className="block text-[#6B5B4F] hover:text-[#E8B55F] font-medium" onClick={() => setIsMenuOpen(false)}>Blog</Link>
            <Link to="/about" className="block text-[#6B5B4F] hover:text-[#E8B55F] font-medium" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/cart" className="block text-[#6B5B4F] hover:text-[#E8B55F] font-medium" onClick={() => setIsMenuOpen(false)}>
              Cart{itemCount > 0 ? ` (${itemCount})` : ''}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
