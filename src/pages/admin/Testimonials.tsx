import { useEffect, useState } from 'react'
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type Testimonial,
} from '@/lib/testimonialService'

function Stars({ rating, onChange }: { rating: number; onChange?: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHover(n)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          disabled={!onChange}
        >
          <svg
            className={`w-6 h-6 transition-colors ${
              n <= (hover || rating) ? 'text-[#E8B55F]' : 'text-gray-200'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

interface FormState {
  name: string
  quote: string
  rating: number
  active: boolean
  order: string
}

function toFormState(t?: Testimonial): FormState {
  return {
    name: t?.name ?? '',
    quote: t?.quote ?? '',
    rating: t?.rating ?? 5,
    active: t?.active ?? true,
    order: t?.order?.toString() ?? '0',
  }
}

function TestimonialForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: Testimonial
  onSave: (data: Omit<Testimonial, 'id' | 'createdAt'>) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<FormState>(toFormState(initial))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: keyof FormState, value: FormState[keyof FormState]) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.quote.trim()) {
      setError('Name and quote are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave({
        name: form.name.trim(),
        quote: form.quote.trim(),
        rating: form.rating,
        active: form.active,
        order: parseInt(form.order) || 0,
      })
    } catch {
      setError('Something went wrong. Try again.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="e.g. Sarah M."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quote *</label>
        <textarea
          value={form.quote}
          onChange={(e) => set('quote', e.target.value)}
          placeholder="Paste the review text here..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800 resize-y"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <Stars rating={form.rating} onChange={(n) => set('rating', n)} />
      </div>

      <div className="flex items-center gap-6">
        <div className="w-28">
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
          <input
            type="number"
            min="0"
            value={form.order}
            onChange={(e) => set('order', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
          />
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => set('active', e.target.checked)}
              className="w-4 h-4 accent-[#E8B55F]"
            />
            <span className="text-sm font-medium text-gray-700">Show on site</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#E8B55F] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#D4A04D] transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : initial ? 'Save Changes' : 'Add Testimonial'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = () =>
    getTestimonials()
      .then(setTestimonials)
      .finally(() => setLoading(false))

  useEffect(() => { load() }, [])

  const handleAdd = async (data: Omit<Testimonial, 'id' | 'createdAt'>) => {
    await createTestimonial(data)
    setAdding(false)
    load()
  }

  const handleEdit = async (id: string, data: Omit<Testimonial, 'id' | 'createdAt'>) => {
    await updateTestimonial(id, data)
    setEditingId(null)
    load()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await deleteTestimonial(id)
    setDeletingId(null)
    load()
  }

  const toggleActive = async (t: Testimonial) => {
    await updateTestimonial(t.id, { active: !t.active })
    load()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold text-gray-800">Testimonials</h1>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="bg-[#E8B55F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#D4A04D] transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Testimonial
          </button>
        )}
      </div>

      {adding && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">New Testimonial</h2>
          <TestimonialForm
            onSave={handleAdd}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      {testimonials.length === 0 && !adding ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-400 mb-4">No testimonials yet.</p>
          <button
            onClick={() => setAdding(true)}
            className="text-[#E8B55F] hover:text-[#D4A04D] text-sm font-medium"
          >
            Add your first testimonial →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              {editingId === t.id ? (
                <div className="p-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-4">Edit Testimonial</h2>
                  <TestimonialForm
                    initial={t}
                    onSave={(data) => handleEdit(t.id, data)}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <div className="p-5 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-semibold text-sm text-gray-800">{t.name}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((n) => (
                          <svg key={n} className={`w-3.5 h-3.5 ${n <= t.rating ? 'text-[#E8B55F]' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {t.active ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">&ldquo;{t.quote}&rdquo;</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(t)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title={t.active ? 'Hide' : 'Show'}
                    >
                      {t.active ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                    <button
                      onClick={() => setEditingId(t.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      disabled={deletingId === t.id}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
