import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getProduct, updateProduct } from '@/lib/productService'
import type { Product } from '@/data/products'
import BundleForm, { type BundleFormData } from './BundleForm'
import { useLang } from '@/context/LangContext'

export default function EditBundle() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { t } = useLang()
  const [product, setProduct] = useState<Product | null>(null)
  const [fetching, setFetching] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (id) {
      getProduct(id)
        .then((p) => { if (!p) setNotFound(true); else setProduct(p) })
        .finally(() => setFetching(false))
    }
  }, [id])

  const handleSubmit = async (data: BundleFormData) => {
    const weightLb = data.weightLb > 0 ? data.weightLb : undefined
    const validImages = data.images.filter(img => img.url.trim())
    await updateProduct(id!, {
      name: data.name,
      price: parseFloat(data.price),
      description: data.description,
      features: data.features.filter(Boolean),
      inStock: data.inStock,
      stockQty: data.stockQty !== '' ? parseInt(data.stockQty) : undefined,
      etsyUrl: data.etsyUrl || undefined,
      image: validImages[0]?.url ?? '',
      images: validImages,
      videoUrl: data.videoUrl || undefined,
      weightLb,
      listingType: 'bundle',
      slots: data.slots,
    })
    navigate('/admin/listings')
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="p-8 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Bundle listing not found.</p>
        <Link to="/admin/listings" className="text-[#E8B55F] hover:text-[#D4A04D] font-medium">
          ← Back to Listings
        </Link>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/listings" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
          {t('editProduct.back')}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-semibold text-gray-800 truncate">{product?.name}</h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        {product && <BundleForm initial={product} onSubmit={handleSubmit} submitLabel="Save Bundle" />}
      </div>
    </div>
  )
}
