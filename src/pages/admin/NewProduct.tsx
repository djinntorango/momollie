import { Link, useNavigate } from 'react-router-dom'
import { createProduct } from '@/lib/productService'
import ProductForm, { type ProductFormData } from './ProductForm'
import { useLang } from '@/context/LangContext'

export default function NewProduct() {
  const navigate = useNavigate()
  const { t } = useLang()

  const handleSubmit = async (data: ProductFormData) => {
    const lengthIn = parseFloat(data.lengthIn)
    const widthIn = parseFloat(data.widthIn)
    const heightIn = parseFloat(data.heightIn)
    const weightLb = parseFloat(data.weightLb)
    const validImages = data.images.filter(img => img.url.trim())
    await createProduct({
      name: data.name,
      category: data.category,
      price: parseFloat(data.price),
      description: data.description,
      features: data.features.filter(Boolean),
      materials: data.materials.filter(Boolean),
      dimensions: `${lengthIn}" x ${widthIn}" x ${heightIn}"`,
      lengthIn,
      widthIn,
      heightIn,
      weightLb,
      careInstructions: data.careInstructions.filter(Boolean),
      inStock: data.inStock,
      stockQty: data.stockQty !== '' ? parseInt(data.stockQty) : undefined,
      etsyUrl: data.etsyUrl || undefined,
      image: validImages[0]?.url ?? '',
      images: validImages,
      videoUrl: data.videoUrl || undefined,
      bundledItems: data.bundledItems.length > 0 ? data.bundledItems.filter(b => b.name.trim()) : undefined,
    })
    navigate('/admin/products')
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/products" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
          {t('newProduct.back')}
        </Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-lg font-semibold text-gray-800">{t('newProduct.title')}</h1>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
        <ProductForm onSubmit={handleSubmit} submitLabel={t('newProduct.submit')} />
      </div>
    </div>
  )
}
