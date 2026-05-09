import { useState, useRef } from 'react'
import type { Product, ProductImage } from '@/data/products'
import { uploadProductImage } from '@/lib/productService'
import { categories } from '@/data/products'
import { useLang } from '@/context/LangContext'

export interface ProductFormData {
  name: string
  category: string
  price: string
  description: string
  features: string[]
  materials: string[]
  lengthIn: string
  widthIn: string
  heightIn: string
  weightLb: string
  careInstructions: string[]
  inStock: boolean
  stockQty: string          // '' = no tracking; '0' = out of stock
  etsyUrl: string
  images: ProductImage[]
  videoUrl: string
}

interface ProductFormProps {
  initial?: Product
  onSubmit: (data: ProductFormData) => Promise<void>
  submitLabel: string
}

function parseDimensions(s?: string): { l: string; w: string; h: string } {
  if (!s) return { l: '', w: '', h: '' }
  const nums = s.match(/[\d.]+/g)
  return { l: nums?.[0] ?? '', w: nums?.[1] ?? '', h: nums?.[2] ?? '' }
}

function toFormData(p?: Product): ProductFormData {
  const dim = parseDimensions(p?.dimensions)
  let images: ProductImage[] = []
  if (p?.images?.length) {
    images = p.images
  } else if (p?.image) {
    images = [{ url: p.image, alt: p.name ?? '' }]
  } else {
    images = [{ url: '', alt: '' }]
  }
  return {
    name: p?.name ?? '',
    category: p?.category ?? 'bread-bags',
    price: p?.price?.toString() ?? '',
    description: p?.description ?? '',
    features: p?.features?.length ? p.features : [''],
    materials: p?.materials?.length ? p.materials : [''],
    lengthIn: p?.lengthIn?.toString() ?? dim.l,
    widthIn: p?.widthIn?.toString() ?? dim.w,
    heightIn: p?.heightIn?.toString() ?? dim.h,
    weightLb: p?.weightLb?.toString() ?? '',
    careInstructions: p?.careInstructions?.length ? p.careInstructions : [''],
    inStock: p?.inStock ?? true,
    stockQty: p?.stockQty !== undefined ? String(p.stockQty) : '',
    etsyUrl: p?.etsyUrl ?? '',
    images,
    videoUrl: p?.videoUrl ?? '',
  }
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m?.[1] ?? null
}

function ArrayField({ label, values, onChange, placeholder }: {
  label: string; values: string[]; onChange: (v: string[]) => void; placeholder?: string
}) {
  const add = () => onChange([...values, ''])
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i))
  const update = (i: number, val: string) => onChange(values.map((v, idx) => idx === i ? val : v))
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
            />
            {values.length > 1 && (
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 px-2 text-lg leading-none" title="Remove">×</button>
            )}
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="mt-2 text-sm text-[#E8B55F] hover:text-[#D4A04D] font-medium">
        + Add {label.toLowerCase().replace('*', '').trim()}
      </button>
    </div>
  )
}

function NumericField({ label, value, onChange, placeholder, unit }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; unit?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number" min="0" step="0.01" value={value}
          onChange={(e) => onChange(e.target.value)}
          required placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800 pr-10"
        />
        {unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">{unit}</span>}
      </div>
    </div>
  )
}

export default function ProductForm({ initial, onSubmit, submitLabel }: ProductFormProps) {
  const { t } = useLang()
  const [form, setForm] = useState<ProductFormData>(toFormData(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  // ── Image management ────────────────────────────────────────────────────────

  const updateImage = (i: number, patch: Partial<ProductImage>) =>
    set('images', form.images.map((img, idx) => idx === i ? { ...img, ...patch } : img))

  const addImageSlot = () => set('images', [...form.images, { url: '', alt: '' }])

  const removeImageSlot = (i: number) => set('images', form.images.filter((_, idx) => idx !== i))

  const moveImage = (i: number, dir: -1 | 1) => {
    const next = [...form.images]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    set('images', next)
  }

  const handleImageFile = async (i: number, file: File) => {
    setUploadingIdx(i)
    setError('')
    try {
      const url = await uploadProductImage(file)
      updateImage(i, { url })
    } catch {
      setError(t('form.errUpload'))
    } finally {
      setUploadingIdx(null)
    }
  }

  const handleMultipleFiles = async (files: FileList) => {
    const arr = Array.from(files)
    if (arr.length === 0) return
    // Fill the first empty slot, then append new slots for remaining files
    const updated = [...form.images]
    let insertAt = updated.findIndex((img) => !img.url.trim())
    if (insertAt === -1) insertAt = updated.length

    for (let k = 0; k < arr.length; k++) {
      if (insertAt + k >= updated.length) updated.push({ url: '', alt: '' })
    }
    set('images', updated)

    for (let k = 0; k < arr.length; k++) {
      const idx = insertAt + k
      setUploadingIdx(idx)
      try {
        const url = await uploadProductImage(arr[k])
        setForm((f) => ({
          ...f,
          images: f.images.map((img, ii) => ii === idx ? { ...img, url } : img),
        }))
      } catch {
        setError(t('form.errSomeUploads'))
      }
    }
    setUploadingIdx(null)
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validImages = form.images.filter((img) => img.url.trim())
    if (validImages.length === 0) {
      setError(t('form.errNoImages'))
      return
    }
    if (!form.name || !form.price || !form.description) {
      setError(t('form.errRequiredFields'))
      return
    }
    if (!form.lengthIn || !form.widthIn || !form.heightIn || !form.weightLb) {
      setError(t('form.errDimensions'))
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSubmit({ ...form, images: validImages })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  const ytId = form.videoUrl ? getYouTubeId(form.videoUrl) : null
  const isDirectVideo = form.videoUrl && !ytId && /\.(mp4|webm|mov)(\?|$)/i.test(form.videoUrl)

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.productName')}</label>
        <input
          value={form.name} onChange={(e) => set('name', e.target.value)} required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
        />
      </div>

      {/* Category + In Stock + Stock Qty */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.category')}</label>
          <select
            value={form.category} onChange={(e) => set('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
          >
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.inStock} onChange={(e) => set('inStock', e.target.checked)} className="w-5 h-5 accent-[#E8B55F]" />
            <span className="text-sm font-medium text-gray-700">{t('form.inStock')}</span>
          </label>
        </div>
      </div>

      {/* Stock Quantity */}
      <div className="w-48">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.stockQty')}
          <span className="ml-2 text-xs text-gray-400 font-normal">{t('form.stockQtyHint')}</span>
        </label>
        <input
          type="number" min="0" step="1" value={form.stockQty}
          onChange={(e) => {
            const val = e.target.value
            set('stockQty', val)
            if (val !== '') set('inStock', parseInt(val) > 0)
          }}
          placeholder="e.g. 12"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
        />
      </div>

      {/* Price */}
      <div className="w-48">
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.price')}</label>
        <input
          type="number" min="0" step="0.01" value={form.price}
          onChange={(e) => set('price', e.target.value)} required placeholder="24.99"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{t('form.description')}</label>
        <textarea
          value={form.description} onChange={(e) => set('description', e.target.value)}
          required rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800 resize-y"
        />
      </div>

      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('form.images')}
            <span className="ml-2 text-xs text-gray-400 font-normal">{t('form.imagesHint')}</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="file" accept="image/*" multiple className="hidden"
              id="bulk-image-upload"
              onChange={(e) => { if (e.target.files?.length) handleMultipleFiles(e.target.files); e.target.value = '' }}
            />
            <label
              htmlFor="bulk-image-upload"
              className="cursor-pointer px-3 py-1.5 bg-[#E8B55F] hover:bg-[#D4A04D] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              {t('form.uploadImages')}
            </label>
          </div>
        </div>

        <div className="space-y-3">
          {form.images.map((img, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-3 bg-gray-50">
              <div className="flex items-start gap-3">
                {/* Thumbnail preview */}
                <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 border border-gray-200">
                  {img.url ? (
                    <img src={img.url} alt={img.alt || 'Preview'} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '' }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Inputs */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2">
                    {i === 0 && (
                      <span className="text-xs font-semibold text-[#E8B55F] uppercase tracking-wide">{t('form.primary')}</span>
                    )}
                    {i > 0 && <span className="text-xs text-gray-400">{t('form.imageN', { n: i + 1 })}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => fileRefs.current[i]?.click()}
                      disabled={uploadingIdx === i}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-60 whitespace-nowrap"
                    >
                      {uploadingIdx === i ? t('form.uploading') : t('form.upload')}
                    </button>
                    <input
                      value={img.url}
                      onChange={(e) => updateImage(i, { url: e.target.value })}
                      placeholder={t('form.pasteUrl')}
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800 min-w-0"
                    />
                    <input
                      ref={(el) => { fileRefs.current[i] = el }}
                      type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(i, f) }}
                    />
                  </div>
                  <input
                    value={img.alt}
                    onChange={(e) => updateImage(i, { alt: e.target.value })}
                    placeholder={t('form.altText')}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
                  />
                </div>

                {/* Controls */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Move up">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                  </button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === form.images.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" title="Move down">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {form.images.length > 1 && (
                    <button type="button" onClick={() => removeImageSlot(i)} className="p-1 text-red-400 hover:text-red-600" title="Remove">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addImageSlot} className="mt-3 text-sm text-[#E8B55F] hover:text-[#D4A04D] font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          {t('form.addImage')}
        </button>
      </div>

      {/* Video */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.video')}
          <span className="ml-2 text-xs text-gray-400 font-normal">{t('form.videoHint')}</span>
        </label>
        <input
          type="url"
          value={form.videoUrl}
          onChange={(e) => set('videoUrl', e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
        />
        {ytId && (
          <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 aspect-video max-w-xs">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Video preview"
            />
          </div>
        )}
        {isDirectVideo && (
          <video src={form.videoUrl} controls className="mt-2 rounded-lg border border-gray-200 max-w-xs w-full" />
        )}
      </div>

      {/* Dimensions & Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {t('form.dimensions')}
          <span className="ml-2 text-xs text-gray-400 font-normal">{t('form.dimensionsHint')}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NumericField label={t('form.length')} value={form.lengthIn} onChange={(v) => set('lengthIn', v)} placeholder="14" unit="in" />
          <NumericField label={t('form.width')} value={form.widthIn} onChange={(v) => set('widthIn', v)} placeholder="10" unit="in" />
          <NumericField label={t('form.height')} value={form.heightIn} onChange={(v) => set('heightIn', v)} placeholder="4" unit="in" />
          <NumericField label={t('form.weight')} value={form.weightLb} onChange={(v) => set('weightLb', v)} placeholder="0.5" unit="lb" />
        </div>
      </div>

      <ArrayField label={t('form.features')} values={form.features} onChange={(v) => set('features', v)} placeholder="e.g. 100% plastic-free and biodegradable" />
      <ArrayField label={t('form.materials')} values={form.materials} onChange={(v) => set('materials', v)} placeholder="e.g. Organic cotton" />
      <ArrayField label={t('form.careInstructions')} values={form.careInstructions} onChange={(v) => set('careInstructions', v)} placeholder="e.g. Hand wash in cool water with mild soap" />

      {/* Etsy URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('form.etsyUrl')} <span className="text-gray-400 font-normal">({t('form.etsyUrlHint')})</span>
        </label>
        <input
          type="url" value={form.etsyUrl} onChange={(e) => set('etsyUrl', e.target.value)}
          placeholder="https://dearmomollie.etsy.com/listing/..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit" disabled={saving || uploadingIdx !== null}
          className="bg-[#E8B55F] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#D4A04D] transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
