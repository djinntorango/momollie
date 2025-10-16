'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#FFF8E7] shadow-md border-b-2 border-[#E8B55F]">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-[#C87855] hover:text-[#E09470] transition-colors">
            Momollie
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors">
              Home
            </Link>
            <Link href="/products" className="text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors">
              Products
            </Link>
            <Link href="/blog" className="text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors">
              Blog
            </Link>
            <Link href="/about" className="text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors">
              About
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-[#6B5B4F] hover:text-[#E8B55F]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-[#F5E6D3]">
            <Link
              href="/"
              className="block text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/products"
              className="block text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              href="/blog"
              className="block text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Blog
            </Link>
            <Link
              href="/momongo"
              className="block text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Momongo
            </Link>
            <Link
              href="/about"
              className="block text-[#6B5B4F] hover:text-[#E8B55F] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
} 