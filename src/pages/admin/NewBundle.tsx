import { Link, useNavigate } from 'react-router-dom'
import { createProduct } from '@/lib/productService'
import BundleForm, { type BundleFormData } from './BundleForm'
import { useLang } from '@/context/LangContext'

export default function NewBundle() {
  const navigate = useNavigate()
  const { t } = useLang()

  const handleSubmit = async (data: BundleFormData) => {
    const weightLb = data.weightLb > 0 ? data.weightLb : undefined
    const validImages = data.images.filter(img => img.url.trim())
    await createProduct({
      name: data.name,
      category: 'bundles',
      price: parseFloat(data.price),
      description: data.description,
      features: data.features.filter(Boolean),
      materials: [],
      careInstructions: [],
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

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/listings" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
          {t('newProduct.back')}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-semibold text-gray-800">New Bundle Listing</h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <BundleForm onSubmit={handleSubmit} submitLabel="Create Bundle" />
      </div>
    </div>
  )
}
