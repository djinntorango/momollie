import { useState, useEffect } from 'react'
import type { PromoCode } from '@/data/products'
import { getPromoCodes, createPromoCode, updatePromoCode, deletePromoCode } from '@/lib/promoCodeService'

const empty = (): Omit<PromoCode, 'id' | 'createdAt' | 'usageCount'> => ({
  code: '',
  type: 'percentage',
  value: 10,
  active: true,
  minOrderSubtotal: 0,
  maxUses: null,
  expiresAt: null,
})

export default function PromoCodes() {
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(empty())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    getPromoCodes()
      .then(setCodes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const reload = () => getPromoCodes().then(setCodes)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.code.trim()) return
    setSaving(true)
    setError(null)
    try {
      await createPromoCode(form)
      await reload()
      setForm(empty())
      setShowForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (code: PromoCode) => {
    try {
      await updatePromoCode(code.id, { active: !code.active })
      setCodes((prev) => prev.map((c) => c.id === code.id ? { ...c, active: !c.active } : c))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePromoCode(id)
      setCodes((prev) => prev.filter((c) => c.id !== id))
      setDeleteConfirm(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  const inp = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F]'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#3E2C1F]">Promo Codes</h1>
        <button
          onClick={() => { setShowForm(true); setForm(empty()) }}
          className="px-4 py-2 bg-[#3E2C1F] text-white rounded-lg text-sm font-medium hover:bg-[#2D1F15] transition-colors"
        >
          + New Code
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <h2 className="text-base font-semibold text-[#3E2C1F] mb-4">New Promo Code</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6B5B4F] mb-1">Code</label>
              <input
                type="text"
                required
                placeholder="SUMMER20"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                className={inp + ' font-mono'}
                autoFocus
              />
              <p className="mt-1 text-xs text-[#9B8B7E]">Stored and matched as uppercase</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B5B4F] mb-1">Discount type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'percentage' | 'fixed' }))}
                className={inp}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B5B4F] mb-1">
                {form.type === 'percentage' ? 'Discount (%)' : 'Discount ($)'}
              </label>
              <input
                type="number"
                required
                min={form.type === 'percentage' ? 1 : 0.01}
                max={form.type === 'percentage' ? 100 : undefined}
                step={form.type === 'percentage' ? 1 : 0.01}
                value={form.value}
                onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))}
                className={inp}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B5B4F] mb-1">
                Min order subtotal ($) <span className="text-[#9B8B7E] font-normal">optional</span>
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={form.minOrderSubtotal}
                onChange={(e) => setForm((f) => ({ ...f, minOrderSubtotal: parseFloat(e.target.value) || 0 }))}
                className={inp}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B5B4F] mb-1">
                Max uses <span className="text-[#9B8B7E] font-normal">leave blank for unlimited</span>
              </label>
              <input
                type="number"
                min={1}
                step={1}
                value={form.maxUses ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value ? parseInt(e.target.value) : null }))}
                placeholder="Unlimited"
                className={inp}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#6B5B4F] mb-1">
                Expires <span className="text-[#9B8B7E] font-normal">optional</span>
              </label>
              <input
                type="date"
                value={form.expiresAt ? form.expiresAt.toISOString().slice(0, 10) : ''}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value ? new Date(e.target.value) : null }))}
                className={inp}
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="active"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
                className="w-4 h-4 accent-[#E8B55F]"
              />
              <label htmlFor="active" className="text-sm text-[#3E2C1F]">Active</label>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex gap-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#3E2C1F] text-white rounded-lg text-sm font-medium hover:bg-[#2D1F15] transition-colors disabled:opacity-60"
              >
                {saving ? 'Creating…' : 'Create Code'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setError(null) }}
                className="px-5 py-2 border border-gray-200 text-[#3E2C1F] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : codes.length === 0 ? (
        <div className="text-center py-16 text-[#9B8B7E]">
          <p className="text-lg mb-1">No promo codes yet</p>
          <p className="text-sm">Click "New Code" to create your first one.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#FAF8F4] border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wide">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wide">Discount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wide">Min Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wide">Uses</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wide">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#9B8B7E] uppercase tracking-wide">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {codes.map((code) => (
                <tr key={code.id} className="border-t border-gray-100 hover:bg-[#FFF8E7] transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-[#3E2C1F]">{code.code}</td>
                  <td className="px-4 py-3 text-[#3E2C1F]">
                    {code.type === 'percentage' ? `${code.value}%` : `$${code.value.toFixed(2)}`} off
                  </td>
                  <td className="px-4 py-3 text-[#6B5B4F]">
                    {code.minOrderSubtotal > 0 ? `$${code.minOrderSubtotal.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-[#6B5B4F]">
                    {code.usageCount}{code.maxUses !== null ? ` / ${code.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-[#6B5B4F]">
                    {code.expiresAt ? code.expiresAt.toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(code)}
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold transition-colors ${
                        code.active
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {code.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {deleteConfirm === code.id ? (
                      <span className="flex items-center justify-end gap-2">
                        <span className="text-xs text-[#9B8B7E]">Delete?</span>
                        <button
                          onClick={() => handleDelete(code.id)}
                          className="text-xs text-red-600 font-medium hover:underline"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-xs text-[#9B8B7E] hover:underline"
                        >
                          No
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(code.id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
