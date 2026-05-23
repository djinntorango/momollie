import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct, getProducts } from '@/lib/productService'
import type { Product } from '@/data/products'
import { useCart } from '@/context/CartContext'
import type { CartItemSelection } from '@/context/CartContext'
import SaleCountdown from '@/components/SaleCountdown'

function getYouTubeId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([^&]+)/)
  if (watchMatch) return watchMatch[1]
  const shortMatch = url.match(/youtu\.be\/([^?]+)/)
  if (shortMatch) return shortMatch[1]
  const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/)
  if (embedMatch) return embedMatch[1]
  return null
}

function JsonLd({ product }: { product: Product }) {
  const primaryImage = product.images?.[0]?.url ?? product.image
  const allImages = product.images?.map(img => img.url).filter(Boolean) ?? [product.image]

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: allImages,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Dear Momollie',
    },
    offers: {
      '@type': 'Offer',
      url: product.etsyUrl ?? `https://dearmomollie.com/products/${product.id}`,
      priceCurrency: 'USD',
      price: product.salePercent
        ? (product.price * (1 - product.salePercent / 100)).toFixed(2)
        : product.price.toFixed(2),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
    ...(primaryImage ? { thumbnail: primaryImage } : {}),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [fetching, setFetching] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [saleExpired, setSaleExpired] = useState(false)
  // Bundle slot selections: slotIndex → chosen product
  const [slotSelections, setSlotSelections] = useState<Record<number, Product>>({})
  // Flat products available for bundle slot choices
  const [slotProducts, setSlotProducts] = useState<Record<string, Product>>({})
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const { addItem, openCart } = useCart()

  useEffect(() => {
    if (id) {
      getProduct(id)
        .then(async (p) => {
          if (!p) { setNotFound(true); return }
          setProduct(p)
          const all = await getProducts()
          setRelatedProducts(all.filter((prod) => prod.id !== id))
          if (p.listingType === 'bundle' && p.slots?.length) {
            const allIds = [...new Set(p.slots.flatMap((s) => s.productIds))]
            const map: Record<string, Product> = {}
            all.forEach((prod) => { if (allIds.includes(prod.id)) map[prod.id] = prod })
            setSlotProducts(map)
          }
        })
        .finally(() => setFetching(false))
    }
  }, [id])

  useEffect(() => {
    if (product) {
      document.title = `${product.name} — Dear Momollie`
    }
    return () => { document.title = 'Dear Momollie' }
  }, [product])

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 text-lg mb-4">Product not found.</p>
        <Link to="/products" className="text-amber-600 hover:text-amber-700 font-medium">
          ← Back to Products
        </Link>
      </div>
    )
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ url: product.image, alt: product.name }]

  const salePrice = product.salePercent && !saleExpired
    ? parseFloat((product.price * (1 - product.salePercent / 100)).toFixed(2))
    : null

  const youtubeId = product.videoUrl ? getYouTubeId(product.videoUrl) : null
  const isDirectVideo = product.videoUrl && !youtubeId

  const isBundle = product.listingType === 'bundle'
  const slots = product.slots ?? []
  const allSlotsFilled = !isBundle || slots.every((_, i) => slotSelections[i] !== undefined)

  const handleAddToCart = () => {
    let selections: CartItemSelection[] | undefined
    let cartItemId = product.id
    if (isBundle && slots.length > 0) {
      selections = slots.map((slot, i) => ({
        slotLabel: slot.label,
        productId: slotSelections[i]?.id ?? '',
        productName: slotSelections[i]?.name ?? '',
      }))
      // Unique key per combination so different selections = separate cart line
      cartItemId = product.id + '::' + selections.map((s) => s.productId).join(':')
    }
    addItem({
      cartItemId,
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      salePrice,
      selections,
    })
    openCart()
  }

  return (
    <>
      <JsonLd product={product} />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/products" className="hover:text-amber-600 transition-colors">Products</Link>
          <span>/</span>
          <span className="capitalize">{product.category.replace(/-/g, ' ')}</span>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Images + Video */}
          <div className="space-y-4">
            {/* Main image */}
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              {images[selectedIdx]?.url ? (
                <img
                  src={images[selectedIdx].url}
                  alt={images[selectedIdx].alt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIdx(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === selectedIdx ? 'border-amber-500' : 'border-transparent hover:border-amber-300'
                    }`}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Video */}
            {youtubeId && (
              <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeId}`}
                  title={`${product.name} video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}
            {isDirectVideo && (
              <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                <video
                  src={product.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  title={product.name}
                />
              </div>
            )}

            {/* Customers also viewed */}
            {relatedProducts.length > 0 && (
              <div className="hidden lg:block border-t border-gray-200 pt-6">
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Customers also viewed</h2>
                <div className="grid grid-cols-3 gap-3">
                  {relatedProducts.slice(0, 6).map((p) => {
                    const relSale = p.salePercent
                      ? parseFloat((p.price * (1 - p.salePercent / 100)).toFixed(2))
                      : null
                    return (
                      <Link
                        key={p.id}
                        to={`/products/${p.id}`}
                        className="group"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      >
                        <div className="relative rounded-xl overflow-hidden bg-gray-100 mb-2 aspect-square">
                          <img
                            src={p.images?.[0]?.url ?? p.image}
                            alt={p.images?.[0]?.alt ?? p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          {p.bestSeller && (
                            <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                              Best Seller
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-snug">{p.name}</p>
                        <p className="text-xs font-semibold text-amber-600 mt-0.5">
                          ${(relSale ?? p.price).toFixed(2)}
                          {relSale && <span className="text-gray-400 line-through ml-1 font-normal">${p.price.toFixed(2)}</span>}
                        </p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Product info */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-amber-600 font-medium capitalize mb-1">
                {product.category.replace(/-/g, ' ')}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.displayTitle ?? product.name}</h1>

              <div className="flex items-center gap-3 mb-2">
                {salePrice ? (
                  <>
                    <span className="text-3xl font-bold text-amber-600">${salePrice.toFixed(2)}</span>
                    <span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>
                    {!saleExpired && (
                    <span className="bg-green-100 text-green-700 text-sm font-semibold px-2 py-0.5 rounded">
                      {product.salePercent}% off
                    </span>
                  )}
                  </>
                ) : (
                  <span className="text-3xl font-bold text-amber-600">${product.price.toFixed(2)}</span>
                )}
              </div>
              {salePrice && product.saleEndsAt && product.saleEndsAt > new Date() && (
                <div className="mb-3">
                  <SaleCountdown
                    endsAt={product.saleEndsAt}
                    onExpire={() => setSaleExpired(true)}
                    className="text-sm font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full"
                  />
                </div>
              )}

              {!product.inStock && (
                <span className="inline-block bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  Out of Stock
                </span>
              )}
            </div>

            <p className="text-gray-700 leading-relaxed">{product.description}</p>

            {/* Features */}
            {product.features.length > 0 && (
              <div>
                <h2 className="font-semibold text-gray-900 mb-2">Features</h2>
                <ul className="space-y-1.5">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-green-500 mt-0.5 text-xs shrink-0">❤️</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Bundle slot selectors */}
            {isBundle && slots.length > 0 && (
              <div className="space-y-3">
                <h2 className="font-semibold text-gray-900">Customize Your Bundle</h2>
                {slots.map((slot, i) => {
                  const eligibleProducts = slot.productIds
                    .map((pid) => slotProducts[pid])
                    .filter(Boolean) as Product[]
                  return (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{slot.label}</label>
                      <select
                        value={slotSelections[i]?.id ?? ''}
                        onChange={(e) => {
                          const chosen = eligibleProducts.find((p) => p.id === e.target.value)
                          setSlotSelections((prev) => ({ ...prev, [i]: chosen! }))
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800"
                      >
                        <option value="">— Choose {slot.label} —</option>
                        {eligibleProducts.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  )
                })}
              </div>
            )}

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                disabled={!product.inStock || !allSlotsFilled}
                onClick={handleAddToCart}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors ${
                  product.inStock && allSlotsFilled
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {!product.inStock ? 'Out of Stock' : !allSlotsFilled ? 'Select All Options' : 'Add to Cart'}
              </button>
            </div>

            {/* Materials */}
            {product.materials.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-2">Materials</h2>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((m, i) => (
                    <span key={i} className="bg-amber-50 text-amber-800 text-xs font-medium px-3 py-1 rounded-full border border-amber-200">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Dimensions & Weight */}
            {(product.dimensions || (!isBundle && product.weightLb)) && (
              <div className="pt-4 border-t border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-2">Details</h2>
                <dl className="text-sm text-gray-700 space-y-1">
                  {product.dimensions && (
                    <div className="flex gap-2">
                      <dt className="font-medium text-gray-500 w-24 shrink-0">Dimensions</dt>
                      <dd>{product.dimensions}</dd>
                    </div>
                  )}
                  {!isBundle && product.weightLb && (
                    <div className="flex gap-2">
                      <dt className="font-medium text-gray-500 w-24 shrink-0">Weight</dt>
                      <dd>{product.weightLb} lb</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Care instructions */}
            {product.careInstructions.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h2 className="font-semibold text-gray-900 mb-2">Care Instructions</h2>
                <ul className="space-y-1">
                  {product.careInstructions.map((c, i) => (
                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="shrink-0 text-amber-500">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}
