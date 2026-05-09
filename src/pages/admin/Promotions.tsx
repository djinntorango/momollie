import { useEffect, useState } from 'react'
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '@/lib/promotionService'
import type { Promotion } from '@/data/products'
import { useLang } from '@/context/LangContext'

const empty = { title: '', message: '', buttonText: '', buttonLink: '', active: true }

export default function Promotions() {
  const { t } = useLang()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getPromotions()
      .then(setPromotions)
      .finally(() => setLoading(false))
  }, [])

  const set = (key: keyof typeof empty, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }))

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.message) { setError(t('promotions.errRequired')); return }
    setSaving(true)
    setError('')
    try {
      const id = await createPromotion(form)
      setPromotions((prev) => [{ id, ...form }, ...prev])
      setForm(empty)
    } catch {
      setError(t('promotions.errFailed'))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (promo: Promotion) => {
    const next = !promo.active
    await updatePromotion(promo.id, { active: next })
    setPromotions((prev) => prev.map((p) => (p.id === promo.id ? { ...p, active: next } : p)))
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('promotions.confirmDelete'))) return
    await deletePromotion(id)
    setPromotions((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('promotions.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">{t('promotions.subtitle')}</p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h2 className="font-semibold text-gray-700 mb-4">{t('promotions.newPromotion')}</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.titleField')}</label>
              <input
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
                placeholder="e.g. Spring Sale!"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.buttonText')}</label>
              <input
                value={form.buttonText}
                onChange={(e) => set('buttonText', e.target.value)}
                placeholder="e.g. Shop Now"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.messageField')}</label>
            <textarea
              value={form.message}
              onChange={(e) => set('message', e.target.value)}
              rows={2}
              placeholder="e.g. Get 20% off all bread bags this weekend only!"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800 resize-none"
            />
          </div>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('promotions.buttonLink')}</label>
              <input
                value={form.buttonLink}
                onChange={(e) => set('buttonLink', e.target.value)}
                placeholder="e.g. /products"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F] text-gray-800"
              />
            </div>
            <label className="flex items-center gap-2 pb-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set('active', e.target.checked)}
                className="w-4 h-4 accent-[#E8B55F]"
              />
              <span className="text-sm font-medium text-gray-700">{t('promotions.activeField')}</span>
            </label>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#E8B55F] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#D4A04D] transition-colors disabled:opacity-50 pb-2"
            >
              {saving ? t('promotions.creating') : t('promotions.create')}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : promotions.length === 0 ? (
        <p className="text-center text-gray-400 py-12">{t('promotions.noPromotions')}</p>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-800">{promo.title}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${promo.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {promo.active ? t('promotions.active') : t('promotions.inactive')}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{promo.message}</p>
                {promo.buttonText && (
                  <p className="text-xs text-gray-400">{t('promotions.buttonLabel')} "{promo.buttonText}" → {promo.buttonLink || t('promotions.noLink')}</p>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <button
                  onClick={() => toggleActive(promo)}
                  className={`text-sm font-medium transition-colors ${promo.active ? 'text-gray-400 hover:text-gray-600' : 'text-green-500 hover:text-green-700'}`}
                >
                  {promo.active ? t('promotions.deactivate') : t('promotions.activate')}
                </button>
                <button
                  onClick={() => handleDelete(promo.id)}
                  className="text-sm font-medium text-red-400 hover:text-red-600 transition-colors"
                >
                  {t('promotions.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
