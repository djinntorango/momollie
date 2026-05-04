import { Link } from 'react-router-dom'
import type { Product } from '@/data/products'
import { useCart } from '@/context/CartContext'

interface ProductCardProps {
  product: Product
  categoryName?: string
  variant?: 'default' | 'compact' | 'featured'
}

export default function ProductCard({ product, categoryName, variant = 'default' }: ProductCardProps) {
  const { addItem, openCart } = useCart()

  const salePrice = product.salePercent
    ? parseFloat((product.price * (1 - product.salePercent / 100)).toFixed(2))
    : null
  const cardClass = variant === 'featured'
    ? 'bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-amber-200'
    : 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'

  const imageHeight = variant === 'compact' ? 'h-48' : variant === 'featured' ? 'h-80' : 'h-64'
  const primaryImage = product.images?.[0]?.url ?? product.image
  const primaryAlt = product.images?.[0]?.alt ?? product.name

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      salePrice,
    })
    openCart()
  }

  return (
    <div className={cardClass}>
      <Link to={`/products/${product.id}`} className="block">
        <div className={`relative ${imageHeight}`}>
          <img src={primaryImage} alt={primaryAlt} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {!product.inStock && <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">Out of Stock</span>}
            {salePrice && <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">{product.salePercent}% Off</span>}
          </div>
          <div className="absolute top-2 right-2">
            {product.materials.includes('Organic cotton') && (
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Organic</span>
            )}
          </div>
        </div>
      </Link>

      <div className="p-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-500 capitalize">{categoryName || product.category.replace('-', ' ')}</span>
          {product.materials.length > 0 && (
            <span className="text-xs text-gray-400">• {product.materials.slice(0, 2).join(', ')}</span>
          )}
        </div>
        <h3 className={`font-semibold mb-2 ${variant === 'featured' ? 'text-2xl' : 'text-xl'} hover:text-amber-600 transition-colors`}>
          <Link to={`/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-2 mb-4">
          {salePrice && <span className="text-lg text-gray-400 line-through">${product.price.toFixed(2)}</span>}
          <span className={`font-bold text-amber-600 ${variant === 'featured' ? 'text-3xl' : 'text-2xl'}`}>
            ${salePrice ? salePrice.toFixed(2) : product.price.toFixed(2)}
          </span>
        </div>

        {variant !== 'compact' && (
          <div className="mb-4">
            <ul className="text-sm text-gray-600 space-y-1">
              {product.features.slice(0, variant === 'featured' ? 3 : 2).map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5 text-xs">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {variant === 'featured' && product.dimensions && (
          <div className="mb-4 text-sm text-gray-500"><strong>Dimensions:</strong> {product.dimensions}</div>
        )}

        <div className="flex gap-2">
          {product.etsyUrl && (
            <a
              href={product.etsyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 text-center py-2 rounded-lg transition-colors ${
                product.inStock ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={(e) => !product.inStock && e.preventDefault()}
            >
              {product.inStock ? 'Buy on Etsy' : 'Out of Stock'}
            </a>
          )}
          {variant !== 'compact' && (
            <button
              disabled={!product.inStock}
              onClick={handleAddToCart}
              className={`px-4 py-2 rounded-lg transition-colors font-medium ${
                product.inStock
                  ? 'border border-amber-600 text-amber-600 hover:bg-amber-50'
                  : 'border border-gray-300 text-gray-400 cursor-not-allowed'
              } ${!product.etsyUrl ? 'flex-1' : ''}`}
            >
              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
          )}
        </div>

        {variant === 'featured' && product.careInstructions.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-sm mb-2">Care Instructions:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              {product.careInstructions.slice(0, 2).map((instruction, index) => (
                <li key={index}>• {instruction}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
