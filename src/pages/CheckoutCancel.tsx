import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'

export default function CheckoutCancel() {
  const { openCart } = useCart()

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#3E2C1F] mb-3">Payment cancelled</h1>
          <p className="text-[#6B5B4F] mb-8">
            No worries — your cart is still saved. You can try again whenever you're ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={openCart}
              className="px-8 py-3 bg-[#3E2C1F] text-white rounded-full font-medium hover:bg-[#2D1F15] transition-colors shadow-md"
            >
              Return to Cart
            </button>
            <Link
              to="/products"
              className="px-8 py-3 border border-[#E8B55F] text-[#E8B55F] rounded-full font-medium hover:bg-[#E8B55F] hover:text-white transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
