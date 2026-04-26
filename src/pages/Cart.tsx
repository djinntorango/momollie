import { useState } from 'react'
import { Link } from 'react-router-dom'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import { useCart } from '@/context/CartContext'

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async () => {
    setLoading(true)
    setError(null)
    try {
      const createCheckoutSession = httpsCallable<
        { items: Array<{ productId: string; quantity: number }>; origin: string },
        { url: string }
      >(functions(), 'createCheckoutSession')

      const result = await createCheckoutSession({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        origin: window.location.origin,
      })

      window.location.href = result.data.url
    } catch (err) {
      setError('Unable to start checkout. Please try again.')
      console.error('Checkout error:', err)
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-lg p-10">
            <svg className="w-16 h-16 text-[#E8B55F] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h1 className="text-2xl font-bold text-[#3E2C1F] mb-3">Your cart is empty</h1>
            <p className="text-[#9B8B7E] mb-6">Add some products to get started!</p>
            <Link
              to="/products"
              className="inline-block px-8 py-3 bg-[#E8B55F] text-white rounded-full font-medium hover:bg-[#D4A04D] transition-colors shadow-md"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFF8E7]">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-[#3E2C1F] mb-8">Your Cart</h1>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          <ul className="divide-y divide-[#F5E6D3]">
            {items.map((item) => {
              const displayPrice = item.salePrice !== null ? item.salePrice : item.price
              return (
                <li key={item.productId} className="flex gap-4 p-5">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-[#F5E6D3]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://placehold.co/96x96/F5E6D3/6B5B4F?text=Bag'
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#3E2C1F] leading-tight">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-[#E8B55F] text-lg">${displayPrice.toFixed(2)}</span>
                      {item.salePrice !== null && (
                        <span className="text-sm text-[#9B8B7E] line-through">${item.price.toFixed(2)}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-8 h-8 rounded-full border border-[#E8B55F] text-[#E8B55F] flex items-center justify-center hover:bg-[#E8B55F] hover:text-white transition-colors text-lg leading-none"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-medium text-[#3E2C1F]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-[#E8B55F] text-[#E8B55F] flex items-center justify-center hover:bg-[#E8B55F] hover:text-white transition-colors text-lg leading-none"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <span className="text-[#9B8B7E] text-sm">
                        = ${(displayPrice * item.quantity).toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="ml-auto text-[#9B8B7E] hover:text-red-500 transition-colors"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Order summary */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#6B5B4F]">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span className="font-bold text-xl text-[#3E2C1F]">${subtotal.toFixed(2)}</span>
          </div>
          <p className="text-xs text-[#9B8B7E] mb-5">Shipping and taxes calculated at checkout</p>

          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3 bg-[#3E2C1F] text-white rounded-full font-semibold hover:bg-[#2D1F15] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting to checkout…
              </>
            ) : (
              'Proceed to Checkout'
            )}
          </button>

          <div className="flex items-center justify-between mt-4">
            <Link to="/products" className="text-[#E8B55F] hover:text-[#D4A04D] text-sm font-medium transition-colors">
              ← Continue Shopping
            </Link>
            <button
              onClick={clearCart}
              className="text-[#9B8B7E] hover:text-red-500 text-sm transition-colors"
            >
              Clear cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
