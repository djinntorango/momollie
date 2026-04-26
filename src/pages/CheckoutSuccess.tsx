import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '@/context/CartContext'

export default function CheckoutSuccess() {
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-lg p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-[#3E2C1F] mb-3">Order placed!</h1>
          <p className="text-[#6B5B4F] mb-2 text-lg">Thank you for your purchase.</p>
          <p className="text-[#9B8B7E] mb-8">Check your email for confirmation and shipping updates.</p>
          <Link
            to="/products"
            className="inline-block px-8 py-3 bg-[#E8B55F] text-white rounded-full font-medium hover:bg-[#D4A04D] transition-colors shadow-md"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
