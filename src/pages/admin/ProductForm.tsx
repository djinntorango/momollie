import { useState, useRef } from 'react'
import type { Product } from '@/data/products'
import { uploadProductImage } from '@/lib/productService'
import { categories } from '@/data/products'

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
  etsyUrl: string
  image: string
}

interface ProductFormProps {
  initial?: Product
  onSubmit: (data: ProductFormData) => Promise<void>
  submitLabel: string
}

/** Best-effort parse of legacy "14 x 10 x 4" dimension strings */
function parseDimensions(s?: string): { l: string; w: string; h: string } {
  if (!s) return { l: '', w: '', h: '' }
  const nums = s.match(/[\d.]+/g)
  return {
    l: nums?.[0] ?? '',
    w: nums?.[1] ?? '',
    h: nums?.[2] ?? '',
  }
}

function toFormData(p?: Product): ProductFormData {
  const dim = parseDimensions(p?.dimensions)
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
    etsyUrl: p?.etsyUrl ?? '',
    image: p?.image ?? '',
  }
}

function ArrayField({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  placeholder?: string
}) {
  const add = () => onChange([...values, ''])
  const remove = (i: number) => onChange(values.filter((_, idx) => idx !== i))
  const update = (i: number, val: string) =>
    onChange(values.map((v, idx) => (idx === i ? val : v)))

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
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-red-400 hover:text-red-600 px-2 text-lg leading-none"
                title="Remove"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-2 text-sm text-[#E8B55F] hover:text-[#D4A04D] font-medium"
      >
        + Add {label.toLowerCase().replace('*', '').trim()}
      </button>
    </div>
  )
}

function NumericField({
  label,
  value,
  onChange,
  placeholder,
  unit,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  unit?: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800 pr-10"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

export default function ProductForm({ initial, onSubmit, submitLabel }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>(toFormData(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>(initial?.image ?? '')
  const fileRef = useRef<HTMLInputElement>(null)

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleImageFile = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const url = await uploadProductImage(file)
      set('image', url)
      setImagePreview(url)
    } catch {
      setError('Image upload failed. Check Firebase Storage rules.')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.description || !form.image) {
      setError('Name, price, description, and image are required.')
      return
    }
    if (!form.lengthIn || !form.widthIn || !form.heightIn || !form.weightLb) {
      setError('Length, width, height, and weight are all required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
        />
      </div>

      {/* Category + In Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            value={form.category}
            onChange={(e) => set('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end pb-1">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => set('inStock', e.target.checked)}
              className="w-5 h-5 accent-[#E8B55F]"
            />
            <span className="text-sm font-medium text-gray-700">In Stock</span>
          </label>
        </div>
      </div>

      {/* Price */}
      <div className="w-48">
        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={form.price}
          onChange={(e) => set('price', e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
          placeholder="24.99"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          required
          rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800 resize-y"
        />
      </div>

      {/* Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Image *</label>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            <span className="text-gray-400 text-sm">or paste a URL below</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageFile(file)
            }}
          />
          <input
            value={form.image}
            onChange={(e) => {
              set('image', e.target.value)
              setImagePreview(e.target.value)
            }}
            placeholder="https://... or /products/my-image.jpg"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
          />
          {imagePreview && (
            <div className="relative w-48 h-36 rounded-lg overflow-hidden border border-gray-200">
              <img
                src={imagePreview}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImagePreview('')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dimensions & Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Dimensions &amp; Weight *
          <span className="ml-2 text-xs text-gray-400 font-normal">Used to calculate shipping rates</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <NumericField
            label="Length"
            value={form.lengthIn}
            onChange={(v) => set('lengthIn', v)}
            placeholder="14"
            unit="in"
          />
          <NumericField
            label="Width"
            value={form.widthIn}
            onChange={(v) => set('widthIn', v)}
            placeholder="10"
            unit="in"
          />
          <NumericField
            label="Height"
            value={form.heightIn}
            onChange={(v) => set('heightIn', v)}
            placeholder="4"
            unit="in"
          />
          <NumericField
            label="Weight"
            value={form.weightLb}
            onChange={(v) => set('weightLb', v)}
            placeholder="0.5"
            unit="lb"
          />
        </div>
      </div>

      {/* Features */}
      <ArrayField
        label="Features *"
        values={form.features}
        onChange={(v) => set('features', v)}
        placeholder="e.g. 100% plastic-free and biodegradable"
      />

      {/* Materials */}
      <ArrayField
        label="Materials *"
        values={form.materials}
        onChange={(v) => set('materials', v)}
        placeholder="e.g. Organic cotton"
      />

      {/* Care Instructions */}
      <ArrayField
        label="Care Instructions *"
        values={form.careInstructions}
        onChange={(v) => set('careInstructions', v)}
        placeholder="e.g. Hand wash in cool water with mild soap"
      />

      {/* Etsy URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Etsy Listing URL <span className="text-gray-400 font-normal">(optional — shows &quot;Buy on Etsy&quot; button)</span>
        </label>
        <input
          type="url"
          value={form.etsyUrl}
          onChange={(e) => set('etsyUrl', e.target.value)}
          placeholder="https://dearmomollie.etsy.com/listing/..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-[#E8B55F] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#D4A04D] transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
