import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getActivePromotion } from '@/lib/promotionService'
import type { Promotion } from '@/data/products'

export default function PromoPopup() {
  const [promo, setPromo] = useState<Promotion | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    getActivePromotion().then((p) => {
      if (!p) return
      const dismissed = sessionStorage.getItem(`promo-dismissed-${p.id}`)
      if (!dismissed) {
        setPromo(p)
        setVisible(true)
      }
    })
  }, [])

  const dismiss = () => {
    if (promo) sessionStorage.setItem(`promo-dismissed-${promo.id}`, '1')
    setVisible(false)
  }

  if (!visible || !promo) return null

  const isExternal = promo.buttonLink?.startsWith('http')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-fade-in">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <div className="w-12 h-12 bg-[#FFF8E7] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🐝</span>
          </div>
          <h2 className="text-2xl font-bold text-[#3E2C1F] mb-3">{promo.title}</h2>
          <p className="text-[#6B5B4F] mb-6 leading-relaxed">{promo.message}</p>

          {promo.buttonText && promo.buttonLink && (
            <div className="flex gap-3 justify-center">
              {isExternal ? (
                <a
                  href={promo.buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dismiss}
                  className="bg-[#E8B55F] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#D4A04D] transition-colors"
                >
                  {promo.buttonText}
                </a>
              ) : (
                <Link
                  to={promo.buttonLink}
                  onClick={dismiss}
                  className="bg-[#E8B55F] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#D4A04D] transition-colors"
                >
                  {promo.buttonText}
                </Link>
              )}
              <button
                onClick={dismiss}
                className="px-6 py-2.5 rounded-full font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                No thanks
              </button>
            </div>
          )}
          {(!promo.buttonText || !promo.buttonLink) && (
            <button
              onClick={dismiss}
              className="bg-[#E8B55F] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#D4A04D] transition-colors"
            >
              Got it!
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
