import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/data/products';

interface ProductCardProps {
  product: Product;
  categoryName?: string;
  variant?: 'default' | 'compact' | 'featured';
}

export default function ProductCard({
  product,
  categoryName,
  variant = 'default'
}: ProductCardProps) {
  const cardClass = variant === 'compact'
    ? 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'
    : variant === 'featured'
    ? 'bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow border-2 border-amber-200'
    : 'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow';

  const imageHeight = variant === 'compact' ? 'h-48' : variant === 'featured' ? 'h-80' : 'h-64';

  return (
    <div className={cardClass}>
      <div className={`relative ${imageHeight}`}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Status Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!product.inStock && (
            <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Out of Stock
            </span>
          )}
          {product.originalPrice && (
            <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Sale!
            </span>
          )}
        </div>

        {/* Material Badges */}
        <div className="absolute top-2 right-2">
          {product.materials.includes('Organic cotton') && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
              Organic
            </span>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Category and Materials */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-gray-500 capitalize">
            {categoryName || product.category.replace('-', ' ')}
          </span>
          {product.materials.length > 0 && (
            <span className="text-xs text-gray-400">
              • {product.materials.slice(0, 2).join(', ')}
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className={`font-semibold mb-2 ${variant === 'featured' ? 'text-2xl' : 'text-xl'}`}>
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          {product.originalPrice && (
            <span className="text-lg text-gray-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
          <span className={`font-bold text-amber-600 ${variant === 'featured' ? 'text-3xl' : 'text-2xl'}`}>
            ${product.price.toFixed(2)}
          </span>
        </div>

        {/* Features Preview */}
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

        {/* Dimensions (if available) */}
        {variant === 'featured' && product.dimensions && (
          <div className="mb-4 text-sm text-gray-500">
            <strong>Dimensions:</strong> {product.dimensions}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={product.etsyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex-1 text-center py-2 rounded-lg transition-colors ${
              product.inStock
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            onClick={(e) => !product.inStock && e.preventDefault()}
          >
            {product.inStock ? 'Buy on Etsy' : 'Out of Stock'}
          </Link>

          {variant !== 'compact' && (
            <button
              className="px-4 py-2 border border-amber-600 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
              onClick={() => {
                // This could open a modal with more details
                console.log('View details for:', product.name);
              }}
            >
              Details
            </button>
          )}
        </div>

        {/* Care Instructions Preview (featured variant only) */}
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

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.image,
            "brand": {
              "@type": "Brand",
              "name": "DearMomollie"
            },
            "offers": {
              "@type": "Offer",
              "url": product.etsyUrl,
              "priceCurrency": "USD",
              "price": product.price,
              "availability": product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": "DearMomollie"
              }
            },
            "material": product.materials.join(", "),
            "category": categoryName || product.category
          })
        }}
      />
    </div>
  );
}