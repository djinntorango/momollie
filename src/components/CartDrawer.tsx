import { useNavigate } from 'react-router-dom'
import { useCart } from '@/context/CartContext'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart()
  const navigate = useNavigate()

  const handleCheckout = () => {
    closeCart()
    navigate('/checkout')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F5E6D3]">
          <h2 className="text-xl font-bold text-[#3E2C1F]">Your Cart</h2>
          <button
            onClick={closeCart}
            className="text-[#6B5B4F] hover:text-[#3E2C1F] transition-colors p-1"
            aria-label="Close cart"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-[#E8B55F] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-[#6B5B4F] text-lg font-medium">Your cart is empty</p>
              <p className="text-[#9B8B7E] text-sm mt-1">Add some products to get started!</p>
              <button
                onClick={closeCart}
                className="mt-6 px-6 py-2 bg-[#E8B55F] text-white rounded-full hover:bg-[#D4A04D] transition-colors font-medium"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => {
                const displayPrice = item.salePrice !== null ? item.salePrice : item.price
                return (
                  <li key={item.cartItemId} className="flex gap-4 py-3 border-b border-[#F5E6D3] last:border-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#F5E6D3]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/80x80/F5E6D3/6B5B4F?text=Bag'
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#3E2C1F] text-sm leading-tight">{item.name}</p>
                      {item.selections && item.selections.length > 0 && (
                        <ul className="mt-0.5 space-y-0.5">
                          {item.selections.map((s, i) => (
                            <li key={i} className="text-xs text-[#9B8B7E]">
                              {s.slotLabel}: {s.productName}
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-[#E8B55F]">${displayPrice.toFixed(2)}</span>
                        {item.salePrice !== null && (
                          <span className="text-xs text-[#9B8B7E] line-through">${item.price.toFixed(2)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-7 h-7 rounded-full border border-[#E8B55F] text-[#E8B55F] flex items-center justify-center hover:bg-[#E8B55F] hover:text-white transition-colors text-lg leading-none"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-sm font-medium text-[#3E2C1F]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-7 h-7 rounded-full border border-[#E8B55F] text-[#E8B55F] flex items-center justify-center hover:bg-[#E8B55F] hover:text-white transition-colors text-lg leading-none"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.cartItemId)}
                          className="ml-auto text-[#9B8B7E] hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-[#F5E6D3] bg-[#FFF8E7]">
            <div className="flex justify-between mb-4">
              <span className="font-semibold text-[#3E2C1F]">Subtotal</span>
              <div className="text-right">
                <span className="text-xl font-bold text-[#3E2C1F]">${subtotal.toFixed(2)}</span>
                <p className="text-xs text-[#9B8B7E]">+ shipping at checkout</p>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-[#3E2C1F] text-white rounded-full font-medium hover:bg-[#2D1F15] transition-colors flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  )
}
