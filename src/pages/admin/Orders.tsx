import React, { useEffect, useState, useCallback } from 'react'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import { getOrders, updateOrder, updateOrderAddress } from '@/lib/orderService'
import type { Order } from '@/data/products'

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-green-100 text-green-800',
  delivered: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-800',
}

function formatDate(d: Date | undefined): string {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
}

interface CreateLabelResult {
  labelUrl: string
  trackingNumber: string
  trackingUrl: string
  rateCost: number
}

interface LabelPreview {
  orderId: string
  serviceLevel: string
  carrier: string
  amountUsd: number
  estimatedDays: number | null
}

interface BulkLabelPreviewItem extends LabelPreview {
  customerName: string
}

function BulkLabelPreviewModal({
  items,
  onConfirm,
  onCancel,
  purchasing,
}: {
  items: BulkLabelPreviewItem[]
  onConfirm: () => void
  onCancel: () => void
  purchasing: boolean
}) {
  const total = items.reduce((s, i) => s + i.amountUsd, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-[#3E2C1F] mb-1">Purchase {items.length} Shipping Labels</h2>
        <p className="text-sm text-[#9B8B7E] mb-4">Review costs before charging your Shippo account</p>

        <div className="overflow-y-auto flex-1 space-y-2 mb-4">
          {items.map((item) => (
            <div key={item.orderId} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#3E2C1F] truncate">{item.customerName}</p>
                <p className="text-xs text-[#9B8B7E]">
                  #{item.orderId.slice(0, 8).toUpperCase()} · {item.serviceLevel}
                  {item.estimatedDays !== null ? ` · ${item.estimatedDays}d` : ''}
                </p>
              </div>
              <span className="text-sm font-semibold text-[#3E2C1F] ml-4 flex-shrink-0">${item.amountUsd.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center py-3 border-t border-gray-200 mb-4">
          <span className="font-semibold text-[#3E2C1F]">Total</span>
          <span className="text-xl font-bold text-[#3E2C1F]">${total.toFixed(2)}</span>
        </div>

        <p className="text-xs text-[#9B8B7E] mb-4">
          Charged to your Shippo account balance.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={purchasing}
            className="flex-1 px-4 py-2 border border-gray-200 text-[#3E2C1F] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={purchasing}
            className="flex-1 px-4 py-2 bg-[#E8B55F] text-white rounded-lg text-sm font-medium hover:bg-[#D4A04D] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {purchasing ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Purchasing…
              </>
            ) : `Purchase ${items.length} Labels — $${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

function LabelPreviewModal({
  preview,
  onConfirm,
  onCancel,
  purchasing,
}: {
  preview: LabelPreview
  onConfirm: () => void
  onCancel: () => void
  purchasing: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-[#3E2C1F] mb-1">Purchase Shipping Label</h2>
        <p className="text-sm text-[#9B8B7E] mb-5">
          Order #{preview.orderId.slice(0, 8).toUpperCase()}
        </p>

        <div className="bg-[#FFF8E7] border border-[#E8B55F]/40 rounded-xl p-4 mb-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#6B5B4F]">Service</span>
            <span className="text-sm font-semibold text-[#3E2C1F]">{preview.serviceLevel}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#6B5B4F]">Carrier</span>
            <span className="text-sm font-semibold text-[#3E2C1F]">{preview.carrier}</span>
          </div>
          {preview.estimatedDays !== null && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#6B5B4F]">Est. delivery</span>
              <span className="text-sm font-semibold text-[#3E2C1F]">
                {preview.estimatedDays} business day{preview.estimatedDays !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center pt-2 border-t border-[#E8B55F]/30">
            <span className="text-sm font-semibold text-[#3E2C1F]">Label cost</span>
            <span className="text-xl font-bold text-[#3E2C1F]">${preview.amountUsd.toFixed(2)}</span>
          </div>
        </div>

        <p className="text-xs text-[#9B8B7E] mb-5">
          This amount will be charged to your Shippo account balance.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={purchasing}
            className="flex-1 px-4 py-2 border border-gray-200 text-[#3E2C1F] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={purchasing}
            className="flex-1 px-4 py-2 bg-[#E8B55F] text-white rounded-lg text-sm font-medium hover:bg-[#D4A04D] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {purchasing ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Purchasing…
              </>
            ) : `Purchase — $${preview.amountUsd.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

type VerifyResult = Record<string, { isValid: boolean; issues: string[] }>

interface RefundResult {
  refundId: string
  refundAmount: number
  status: string
  isFullRefund: boolean
}

interface RefundModalProps {
  order: Order
  onClose: () => void
  onRefunded: (orderId: string, refundAmount: number, isFullRefund: boolean) => void
}

function RefundModal({ order, onClose, onRefunded }: RefundModalProps) {
  const [amount, setAmount] = useState(order.total.toFixed(2))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isFullRefund = parseFloat(amount) >= order.total

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dollars = parseFloat(amount)
    if (isNaN(dollars) || dollars <= 0) {
      setError('Enter a valid amount')
      return
    }
    if (dollars > order.total) {
      setError(`Cannot exceed order total ($${order.total.toFixed(2)})`)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const fn = httpsCallable<{ orderId: string; amountCents?: number }, RefundResult>(
        functions(), 'createRefund'
      )
      const amountCents = Math.round(dollars * 100)
      const result = await fn({ orderId: order.id, amountCents })
      onRefunded(order.id, result.data.refundAmount, result.data.isFullRefund)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-[#3E2C1F] mb-1">Issue Refund</h2>
        <p className="text-sm text-[#9B8B7E] mb-4">
          {order.customer?.name ?? '—'} · Order #{order.id.slice(0, 8).toUpperCase()}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#3E2C1F] mb-1">
              Refund amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B8B7E]">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={order.total}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F]"
                autoFocus
              />
            </div>
            <p className="mt-1 text-xs text-[#9B8B7E]">
              Order total: ${order.total.toFixed(2)}
              {order.refundAmount ? ` · Already refunded: $${order.refundAmount.toFixed(2)}` : ''}
            </p>
          </div>

          <div className={`text-xs px-3 py-2 rounded-lg ${isFullRefund ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
            {isFullRefund ? 'Full refund — order will be marked Cancelled' : 'Partial refund — order status unchanged'}
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-[#3E2C1F] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing…
                </>
              ) : `Refund $${parseFloat(amount) > 0 ? parseFloat(amount).toFixed(2) : '—'}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface SendNoteModalProps {
  order: Order
  onClose: () => void
}

function SendNoteModal({ order, onClose }: SendNoteModalProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const fn = httpsCallable<{ orderId: string; subject: string; message: string }, { success: boolean }>(
        functions(), 'sendOrderNote'
      )
      await fn({ orderId: order.id, subject: subject.trim(), message: message.trim() })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#E8B55F]'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-[#3E2C1F] mb-1">Send Note to Customer</h2>
        <p className="text-sm text-[#9B8B7E] mb-4">
          {order.customer?.name ?? '—'} · {order.customer?.email ?? '—'} · Order #{order.id.slice(0, 8).toUpperCase()}
        </p>

        {sent ? (
          <div className="text-center py-6">
            <svg className="w-10 h-10 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm font-medium text-[#3E2C1F] mb-1">Note sent!</p>
            <p className="text-xs text-[#9B8B7E] mb-4">
              {order.customer.name} will receive your message from hello@momollie.me
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#3E2C1F] text-white rounded-lg text-sm font-medium hover:bg-[#2D1F15]"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6B5B4F] mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={`About your order #${order.id.slice(0, 8).toUpperCase()}`}
                required
                className={inp}
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B5B4F] mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here…"
                required
                rows={6}
                className={inp + ' resize-none'}
              />
              <p className="mt-1 text-xs text-[#9B8B7E]">
                Sent from hello@momollie.me — customer can reply directly to you.
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-200 text-[#3E2C1F] rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-[#3E2C1F] text-white rounded-lg text-sm font-medium hover:bg-[#2D1F15] transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending…
                  </>
                ) : 'Send Note'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  const copy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={copy}
      title={copied ? 'Copied!' : 'Copy email'}
      className="inline-flex items-center gap-1 text-[#9B8B7E] text-xs hover:text-[#3E2C1F] transition-colors group"
    >
      <span className="group-hover:underline">{email}</span>
      {copied ? (
        <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  )
}


function AddressStatusBadge({ order }: { order: Order }) {
  if (order.addressVerified === true) {
    return (
      <span title="Address verified" className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-green-100 text-green-600 flex-shrink-0">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </span>
    )
  }
  if (order.addressVerified === false) {
    const hasIssues = order.addressIssues && order.addressIssues.length > 0
    return (
      <span
        title={hasIssues ? order.addressIssues!.join('; ') : 'Address invalid'}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-100 text-red-600 flex-shrink-0"
      >
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    )
  }
  return null
}

interface AddressValidationResult {
  isValid: boolean
  messages: Array<{ text: string; type: string; code?: string; source?: string }>
  suggested?: { street1: string; street2?: string; city: string; state: string; zip: string }
}

interface EditAddressFormProps {
  order: Order
  labelError?: string
  onSave: (orderId: string, customer: Order['customer']) => Promise<void>
  onCancel: () => void
}

function EditAddressForm({ order, labelError, onSave, onCancel }: EditAddressFormProps) {
  const [fields, setFields] = useState({
    name: order.customer?.name ?? '',
    line1: order.customer?.address.line1 ?? '',
    line2: order.customer?.address.line2 ?? '',
    city: order.customer?.address.city ?? '',
    state: order.customer?.address.state ?? '',
    zip: order.customer?.address.zip ?? '',
    country: order.customer?.address.country ?? 'US',
  })
  const [saving, setSaving] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validation, setValidation] = useState<AddressValidationResult | null>(null)

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [k]: e.target.value }))
    setValidation(null)
  }

  const handleValidate = async () => {
    setValidating(true)
    setValidation(null)
    try {
      const fn = httpsCallable<object, AddressValidationResult>(functions(), 'validateAddress')
      const result = await fn({
        name: fields.name, line1: fields.line1, line2: fields.line2 || undefined,
        city: fields.city, state: fields.state, zip: fields.zip, country: fields.country,
      })
      setValidation(result.data)
    } catch (err) {
      setValidation({
        isValid: false,
        messages: [{ text: err instanceof Error ? err.message : String(err), type: 'error' }],
      })
    } finally {
      setValidating(false)
    }
  }

  const applySuggestion = () => {
    if (!validation?.suggested) return
    const s = validation.suggested
    setFields((prev) => ({
      ...prev,
      line1: s.street1,
      line2: s.street2 ?? '',
      city: s.city,
      state: s.state,
      zip: s.zip,
    }))
    setValidation(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const customer: Order['customer'] = {
      name: fields.name,
      email: order.customer?.email ?? '',
      address: {
        line1: fields.line1,
        ...(fields.line2 ? { line2: fields.line2 } : {}),
        city: fields.city,
        state: fields.state,
        zip: fields.zip,
        country: fields.country,
      },
    }
    await onSave(order.id, customer)
    setSaving(false)
  }

  const inp = 'w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#E8B55F]'

  const suggestionDiffers = validation?.suggested && (
    validation.suggested.street1 !== fields.line1 ||
    validation.suggested.city !== fields.city ||
    validation.suggested.state !== fields.state ||
    validation.suggested.zip !== fields.zip
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-1.5 mt-1">
      {labelError && (
        <div className="flex items-start gap-1.5 px-2.5 py-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <span>{labelError}</span>
        </div>
      )}

      <input className={inp} placeholder="Full name" value={fields.name} onChange={set('name')} required />
      <input className={inp} placeholder="Address line 1" value={fields.line1} onChange={set('line1')} required />
      <input className={inp} placeholder="Address line 2 (optional)" value={fields.line2} onChange={set('line2')} />
      <div className="grid grid-cols-3 gap-1.5">
        <input className={inp} placeholder="City" value={fields.city} onChange={set('city')} required />
        <input className={inp} placeholder="State" value={fields.state} onChange={set('state')} required />
        <input className={inp} placeholder="ZIP" value={fields.zip} onChange={set('zip')} required />
      </div>
      <input className={inp} placeholder="Country" value={fields.country} onChange={set('country')} required />

      {/* USPS suggestion */}
      {validation && (
        <div className={`px-2.5 py-2 rounded text-xs border ${validation.isValid ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
          {validation.isValid ? (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              Address verified by USPS
            </span>
          ) : (
            <div className="space-y-1">
              {validation.messages.map((m, i) => <p key={i}>{m.text}</p>)}
            </div>
          )}
          {suggestionDiffers && (
            <div className="mt-2 pt-2 border-t border-amber-300">
              <p className="font-medium mb-1">USPS suggestion:</p>
              <p>{validation.suggested!.street1}{validation.suggested!.street2 ? `, ${validation.suggested!.street2}` : ''}</p>
              <p>{validation.suggested!.city}, {validation.suggested!.state} {validation.suggested!.zip}</p>
              <button
                type="button"
                onClick={applySuggestion}
                className="mt-1.5 px-2.5 py-1 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700"
              >
                Use this address
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-1.5 pt-0.5 flex-wrap">
        <button
          type="button"
          onClick={handleValidate}
          disabled={validating}
          className="px-3 py-1 border border-[#E8B55F] text-[#3E2C1F] rounded text-xs font-medium hover:bg-[#FFF8E7] disabled:opacity-60 flex items-center gap-1"
        >
          {validating ? (
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {validating ? 'Checking…' : 'Check with USPS'}
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-3 py-1 bg-[#3E2C1F] text-white rounded text-xs font-medium hover:bg-[#2D1F15] disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 border border-gray-200 text-[#6B5B4F] rounded text-xs hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [refundOrder, setRefundOrder] = useState<Order | null>(null)
  const [sendNoteOrder, setSendNoteOrder] = useState<Order | null>(null)

  // Single-order actions
  const [labelLoading, setLabelLoading] = useState<string | null>(null)
  const [labelErrors, setLabelErrors] = useState<Record<string, string>>({})
  const [deliveredLoading, setDeliveredLoading] = useState<string | null>(null)

  // Label preview modal
  const [labelPreview, setLabelPreview] = useState<LabelPreview | null>(null)
  const [labelPurchasing, setLabelPurchasing] = useState(false)

  // Bulk label preview modal
  const [bulkPreviews, setBulkPreviews] = useState<BulkLabelPreviewItem[] | null>(null)
  const [bulkPreviewLoading, setBulkPreviewLoading] = useState(false)
  const [bulkPurchasing, setBulkPurchasing] = useState(false)

  // Multi-select
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Bulk label creation
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; errors: string[] } | null>(null)

  // PDF merge
  const [mergingLabels, setMergingLabels] = useState(false)

  // Address verification
  const [verifyLoading, setVerifyLoading] = useState(false)

  // Address editing
  const [editAddressId, setEditAddressId] = useState<string | null>(null)

  // Filters & pagination
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 25

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false))
  }, [])

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1) }, [statusFilter, dateFrom, dateTo])

  // ── Filtered & paginated orders ───────────────────────────────────────────

  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false
    if (dateFrom) {
      const from = new Date(dateFrom)
      from.setHours(0, 0, 0, 0)
      if (!o.createdAt || o.createdAt < from) return false
    }
    if (dateTo) {
      const to = new Date(dateTo)
      to.setHours(23, 59, 59, 999)
      if (!o.createdAt || o.createdAt > to) return false
    }
    return true
  })

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginatedOrders = filteredOrders.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // ── Selection helpers ──────────────────────────────────────────────────────

  const selectedArray = orders.filter((o) => selectedIds.has(o.id))
  const selectedLabelable = selectedArray.filter(
    (o) => o.status === 'paid' || o.status === 'pending'
  )
  const selectedWithLabels = selectedArray.filter((o) => !!o.shippoLabelUrl)
  const allSelected =
    paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedIds.has(o.id))
  const someSelected = selectedIds.size > 0

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev)
        paginatedOrders.forEach((o) => next.delete(o.id))
        return next
      })
    } else {
      setSelectedIds((prev) => new Set([...prev, ...paginatedOrders.map((o) => o.id)]))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Order state updater ────────────────────────────────────────────────────

  const patchOrder = useCallback((id: string, patch: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))
  }, [])

  // ── Refund ────────────────────────────────────────────────────────────────

  const handleRefunded = useCallback((orderId: string, refundAmount: number, isFullRefund: boolean) => {
    patchOrder(orderId, {
      refundAmount,
      refundedAt: new Date(),
      ...(isFullRefund ? { status: 'cancelled' } : {}),
    })
  }, [patchOrder])

  // ── Single label (two-step: preview → confirm → purchase) ────────────────

  const handleCreateLabel = async (order: Order) => {
    setLabelLoading(order.id)
    setLabelErrors((prev) => { const next = { ...prev }; delete next[order.id]; return next })
    try {
      const previewFn = httpsCallable<{ orderId: string }, Omit<LabelPreview, 'orderId'>>(
        functions(), 'previewShippingLabel'
      )
      const result = await previewFn({ orderId: order.id })
      setLabelPreview({ orderId: order.id, ...result.data })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setLabelErrors((prev) => ({ ...prev, [order.id]: msg }))
      setExpandedId(order.id)
      setEditAddressId(order.id)
    } finally {
      setLabelLoading(null)
    }
  }

  const handleConfirmLabel = async () => {
    if (!labelPreview) return
    const orderId = labelPreview.orderId
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    setLabelPurchasing(true)
    try {
      const fn = httpsCallable<{ orderId: string }, CreateLabelResult>(
        functions(), 'createShippingLabel'
      )
      const result = await fn({ orderId })
      const { labelUrl, trackingNumber, trackingUrl } = result.data
      if (!labelUrl) throw new Error('Label created but no URL returned')
      const labelPatch = {
        status: 'shipped' as const, shippoLabelUrl: labelUrl,
        trackingNumber, trackingCarrier: 'USPS', trackingUrl, shippedAt: new Date(),
      }
      patchOrder(orderId, labelPatch)
      await updateOrder(orderId, labelPatch)
      setLabelPreview(null)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setLabelErrors((prev) => ({ ...prev, [orderId]: msg }))
      setExpandedId(orderId)
      setEditAddressId(orderId)
      setLabelPreview(null)
    } finally {
      setLabelPurchasing(false)
    }
  }

  // ── Bulk labels ────────────────────────────────────────────────────────────

  const handleBulkCreateLabels = async () => {
    const targets = selectedLabelable
    if (targets.length === 0) return

    // Step 1: preview all orders in parallel
    setBulkPreviewLoading(true)
    const previewFn = httpsCallable<{ orderId: string }, Omit<LabelPreview, 'orderId'>>(
      functions(), 'previewShippingLabel'
    )
    const previews: BulkLabelPreviewItem[] = []
    const previewErrors: string[] = []

    await Promise.all(targets.map(async (order) => {
      try {
        const result = await previewFn({ orderId: order.id })
        previews.push({
          orderId: order.id,
          customerName: order.customer?.name ?? `#${order.id.slice(0, 8).toUpperCase()}`,
          ...result.data,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        previewErrors.push(`Order ${order.id.slice(0, 8).toUpperCase()}: ${msg}`)
        setLabelErrors((prev) => ({ ...prev, [order.id]: msg }))
      }
    }))

    setBulkPreviewLoading(false)

    if (previews.length === 0) return
    // Sort to match selection order
    previews.sort((a, b) => {
      const ai = targets.findIndex((o) => o.id === a.orderId)
      const bi = targets.findIndex((o) => o.id === b.orderId)
      return ai - bi
    })
    setBulkPreviews(previews)
  }

  const handleBulkConfirm = async () => {
    if (!bulkPreviews) return
    setBulkPurchasing(true)
    setBulkProgress({ current: 0, total: bulkPreviews.length, errors: [] })

    const fn = httpsCallable<{ orderId: string }, CreateLabelResult>(
      functions(), 'createShippingLabel'
    )
    const errors: string[] = []

    for (let i = 0; i < bulkPreviews.length; i++) {
      const { orderId } = bulkPreviews[i]
      setBulkProgress({ current: i + 1, total: bulkPreviews.length, errors })
      try {
        const result = await fn({ orderId })
        const { labelUrl, trackingNumber, trackingUrl } = result.data
        const labelPatch = {
          status: 'shipped' as const, shippoLabelUrl: labelUrl,
          trackingNumber, trackingCarrier: 'USPS', trackingUrl, shippedAt: new Date(),
        }
        patchOrder(orderId, labelPatch)
        await updateOrder(orderId, labelPatch)
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`Order ${orderId.slice(0, 8)}: ${msg}`)
        setLabelErrors((prev) => ({ ...prev, [orderId]: msg }))
      }
    }

    setBulkPreviews(null)
    setBulkPurchasing(false)
    setBulkProgress({ current: bulkPreviews.length, total: bulkPreviews.length, errors })
    setTimeout(() => setBulkProgress(null), errors.length ? 8000 : 3000)
    // Keep selection so the "Print X Labels" button is immediately available
  }

  // ── Print selected labels ─────────────────────────────────────────────────

  const handlePrintSelected = async () => {
    const labelUrls = selectedArray
      .map((o) => o.shippoLabelUrl)
      .filter((u): u is string => !!u)
    if (labelUrls.length === 0) return
    setMergingLabels(true)
    try {
      const fn = httpsCallable<{ labelUrls: string[] }, { pdf: string }>(
        functions(), 'mergeLabelsPdf'
      )
      const result = await fn({ labelUrls })
      const binary = atob(result.data.pdf)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const blob = new Blob([bytes], { type: 'application/pdf' })
      window.open(URL.createObjectURL(blob), '_blank')
    } catch (err) {
      alert(`Failed to merge labels: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setMergingLabels(false)
    }
  }

  // ── Address verification ───────────────────────────────────────────────────

  const handleVerifyAddresses = async (orderIds: string[]) => {
    if (orderIds.length === 0) return
    setVerifyLoading(true)
    try {
      const fn = httpsCallable<{ orderIds: string[] }, VerifyResult>(
        functions(), 'verifyOrderAddresses'
      )
      const result = await fn({ orderIds })
      for (const [id, data] of Object.entries(result.data)) {
        patchOrder(id, { addressVerified: data.isValid, addressIssues: data.issues })
      }
    } catch (err) {
      alert(`Verification failed: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setVerifyLoading(false)
    }
  }

  // ── Save address edit ─────────────────────────────────────────────────────

  const handleSaveAddress = async (orderId: string, customer: Order['customer']) => {
    await updateOrderAddress(orderId, customer)
    patchOrder(orderId, { customer, addressVerified: undefined, addressIssues: undefined })
    setLabelErrors((prev) => { const next = { ...prev }; delete next[orderId]; return next })
    setEditAddressId(null)
  }

  // ── Mark delivered ─────────────────────────────────────────────────────────

  const handleMarkDelivered = async (order: Order) => {
    setDeliveredLoading(order.id)
    try {
      await updateOrder(order.id, { status: 'delivered' })
      patchOrder(order.id, { status: 'delivered' })
    } catch (err) {
      alert(`Failed to update order: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setDeliveredLoading(null)
    }
  }

  // ── Derived counts ─────────────────────────────────────────────────────────

  const unverifiedIds = orders
    .filter((o) => (o.status === 'paid' || o.status === 'pending') && o.addressVerified === undefined)
    .map((o) => o.id)

  const selectedUnverifiedIds = selectedArray
    .filter((o) => o.addressVerified === undefined)
    .map((o) => o.id)

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {refundOrder && (
        <RefundModal
          order={refundOrder}
          onClose={() => setRefundOrder(null)}
          onRefunded={handleRefunded}
        />
      )}
      {sendNoteOrder && (
        <SendNoteModal
          order={sendNoteOrder}
          onClose={() => setSendNoteOrder(null)}
        />
      )}
      {labelPreview && (
        <LabelPreviewModal
          preview={labelPreview}
          onConfirm={handleConfirmLabel}
          onCancel={() => setLabelPreview(null)}
          purchasing={labelPurchasing}
        />
      )}
      {bulkPreviews && (
        <BulkLabelPreviewModal
          items={bulkPreviews}
          onConfirm={handleBulkConfirm}
          onCancel={() => setBulkPreviews(null)}
          purchasing={bulkPurchasing}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-[#3E2C1F]">Orders</h1>
        {unverifiedIds.length > 0 && (
          <button
            onClick={() => handleVerifyAddresses(unverifiedIds)}
            disabled={verifyLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8B55F] text-[#3E2C1F] rounded-lg text-sm font-medium hover:bg-[#FFF8E7] transition-colors disabled:opacity-60"
          >
            {verifyLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            Verify All Addresses ({unverifiedIds.length})
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Status pills */}
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-[#3E2C1F] text-white'
                  : 'bg-white border border-gray-200 text-[#6B5B4F] hover:border-[#E8B55F]'
              }`}
            >
              {s === 'all' ? 'All' : s}
              {s !== 'all' && (
                <span className="ml-1 opacity-60">
                  ({orders.filter((o) => o.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-2 py-1 border border-gray-200 rounded-lg text-xs text-[#3E2C1F] focus:outline-none focus:ring-1 focus:ring-[#E8B55F]"
          />
          <span className="text-xs text-[#9B8B7E]">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-2 py-1 border border-gray-200 rounded-lg text-xs text-[#3E2C1F] focus:outline-none focus:ring-1 focus:ring-[#E8B55F]"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo('') }}
              className="text-xs text-[#9B8B7E] hover:text-[#3E2C1F] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Bulk progress banner */}
      {bulkProgress && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-center gap-3 ${
          bulkProgress.errors.length > 0 ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {bulkProgress.current < bulkProgress.total ? (
            <>
              <svg className="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Creating labels… {bulkProgress.current} of {bulkProgress.total}
            </>
          ) : (
            <>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {bulkProgress.total - bulkProgress.errors.length} of {bulkProgress.total} labels created.
              {bulkProgress.errors.length > 0 && (
                <span className="ml-1">Failures: {bulkProgress.errors.join(' · ')}</span>
              )}
            </>
          )}
        </div>
      )}

      {/* Bulk action bar */}
      {someSelected && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-[#3E2C1F] text-white rounded-xl flex-wrap">
          <span className="text-sm font-medium flex-1">
            {selectedIds.size} order{selectedIds.size !== 1 ? 's' : ''} selected
          </span>

          {selectedUnverifiedIds.length > 0 && (
            <button
              onClick={() => handleVerifyAddresses(selectedUnverifiedIds)}
              disabled={verifyLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verify Addresses
            </button>
          )}

          {selectedLabelable.length > 0 && (
            <button
              onClick={handleBulkCreateLabels}
              disabled={bulkPreviewLoading || (!!bulkProgress && bulkProgress.current < bulkProgress.total)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8B55F] hover:bg-[#D4A04D] rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
            >
              {bulkPreviewLoading ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              )}
              {bulkPreviewLoading ? 'Getting rates…' : `Create ${selectedLabelable.length} Label${selectedLabelable.length !== 1 ? 's' : ''}`}
            </button>
          )}

          {selectedWithLabels.length > 0 && (
            <button
              onClick={handlePrintSelected}
              disabled={mergingLabels}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors disabled:opacity-60"
            >
              {mergingLabels ? (
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
              )}
              Print {selectedWithLabels.length} Label{selectedWithLabels.length !== 1 ? 's' : ''}
            </button>
          )}

          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-12 text-center">
          <svg className="w-12 h-12 text-[#E8B55F] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-[#6B5B4F] text-lg">
            {orders.length === 0 ? 'No orders yet' : 'No orders match the current filters'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5E6D3] text-[#3E2C1F]">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 accent-[#E8B55F] cursor-pointer"
                    title="Select all labelable orders"
                  />
                </th>
                <th className="text-left px-4 py-3 font-semibold">Order ID</th>
                <th className="text-left px-4 py-3 font-semibold">Date</th>
                <th className="text-left px-4 py-3 font-semibold">Customer</th>
                <th className="text-left px-4 py-3 font-semibold">Items</th>
                <th className="text-left px-4 py-3 font-semibold">Total</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
                <th className="text-left px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const isExpanded = expandedId === order.id
                const isLabelable = order.status === 'paid' || order.status === 'pending' ||
                  (order.status === 'shipped' && !order.shippoLabelUrl)
                const isSelected = selectedIds.has(order.id)

                return (
                  <React.Fragment key={order.id}>
                    <tr
                      className={`border-t border-gray-100 cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-50' : 'hover:bg-[#FFF8E7]'
                      }`}
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(order.id)}
                          className="w-4 h-4 accent-[#E8B55F] cursor-pointer"
                        />
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-[#6B5B4F]">
                        {order.id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 text-[#6B5B4F]">{formatDate(order.createdAt)}</td>

                      {/* Customer + address badge */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <AddressStatusBadge order={order} />
                          <div>
                            <div className="font-medium text-[#3E2C1F]">{order.customer?.name ?? <span className="text-[#9B8B7E] italic text-xs">Pending</span>}</div>
                            {order.customer?.email && <CopyEmailButton email={order.customer.email} />}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-[#6B5B4F]">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} item
                        {order.items.reduce((s, i) => s + i.quantity, 0) !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[#3E2C1F]">${order.total.toFixed(2)}</div>
                        {order.refundAmount != null && (
                          <div className="text-xs text-red-500 font-medium">
                            −${order.refundAmount.toFixed(2)} refund
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold capitalize ${STATUS_COLORS[order.status]}`}>
                          {order.status}
                        </span>
                      </td>

                      {/* Row actions */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-wrap gap-2">
                          {isLabelable && (
                            <button
                              onClick={() => handleCreateLabel(order)}
                              disabled={labelLoading === order.id}
                              title={order.addressVerified === false ? 'Address failed verification — label may be rejected' : undefined}
                              className={`px-3 py-1.5 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-60 flex items-center gap-1.5 ${
                                order.addressVerified === false
                                  ? 'bg-amber-600 hover:bg-amber-700'
                                  : 'bg-[#3E2C1F] hover:bg-[#2D1F15]'
                              }`}
                            >
                              {labelLoading === order.id ? (
                                <>
                                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                  </svg>
                                  Creating…
                                </>
                              ) : 'Create Label'}
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            order.shippoLabelUrl ? (
                              <a
                                href={order.shippoLabelUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-[#E8B55F] text-white rounded-lg text-xs font-medium hover:bg-[#D4A04D] transition-colors"
                              >
                                Print Label
                              </a>
                            ) : (
                              <span className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-xs">
                                Label pending
                              </span>
                            )
                          )}
                          {order.status === 'shipped' && (
                            <button
                              onClick={() => handleMarkDelivered(order)}
                              disabled={deliveredLoading === order.id}
                              className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
                            >
                              {deliveredLoading === order.id ? 'Updating…' : 'Mark Delivered'}
                            </button>
                          )}
                          {order.stripePaymentIntentId && order.status !== 'cancelled' && !order.refundId && (
                            <button
                              onClick={() => setRefundOrder(order)}
                              className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors"
                            >
                              Refund
                            </button>
                          )}
                          {order.customer?.email && (
                            <button
                              onClick={() => setSendNoteOrder(order)}
                              className="px-3 py-1.5 border border-[#E8B55F] text-[#3E2C1F] rounded-lg text-xs font-medium hover:bg-[#FFF8E7] transition-colors flex items-center gap-1"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Send Note
                            </button>
                          )}
                        </div>
                        {labelErrors[order.id] && editAddressId !== order.id && (
                          <div className="mt-1.5 flex items-start gap-1 text-xs text-red-600 max-w-xs">
                            <svg className="w-3.5 h-3.5 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                            <span>{labelErrors[order.id]}</span>
                          </div>
                        )}
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr className="border-t border-gray-100 bg-[#FFF8E7]">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Shipping address */}
                            <div>
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h4 className="font-semibold text-[#3E2C1F]">Shipping Address</h4>
                                {order.addressVerified === true && editAddressId !== order.id && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    USPS Verified
                                  </span>
                                )}
                                {order.addressVerified === false && editAddressId !== order.id && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                    </svg>
                                    Unverified
                                  </span>
                                )}
                                {order.addressVerified === undefined && editAddressId !== order.id && (
                                  <button
                                    onClick={() => handleVerifyAddresses([order.id])}
                                    disabled={verifyLoading}
                                    className="text-xs text-[#E8B55F] hover:text-[#D4A04D] font-medium transition-colors disabled:opacity-60"
                                  >
                                    Verify address
                                  </button>
                                )}
                                {editAddressId !== order.id ? (
                                  <button
                                    onClick={() => setEditAddressId(order.id)}
                                    className="ml-auto text-xs text-[#9B8B7E] hover:text-[#3E2C1F] font-medium transition-colors flex items-center gap-1"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                  </button>
                                ) : (
                                  <span className="ml-auto text-xs text-[#9B8B7E]">Editing…</span>
                                )}
                              </div>

                              {editAddressId === order.id ? (
                                <EditAddressForm
                                  order={order}
                                  labelError={labelErrors[order.id]}
                                  onSave={handleSaveAddress}
                                  onCancel={() => setEditAddressId(null)}
                                />
                              ) : (
                                <>
                                  <div className="text-sm text-[#6B5B4F] space-y-0.5">
                                    {order.customer ? (
                                      <>
                                        <p>{order.customer.name}</p>
                                        <p>{order.customer.address.line1}</p>
                                        {order.customer.address.line2 && <p>{order.customer.address.line2}</p>}
                                        <p>{order.customer.address.city}, {order.customer.address.state} {order.customer.address.zip}</p>
                                        <p>{order.customer.address.country}</p>
                                      </>
                                    ) : (
                                      <p className="italic text-[#9B8B7E]">Address not yet collected</p>
                                    )}
                                  </div>
                                  {order.addressIssues && order.addressIssues.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                      {order.addressIssues.map((issue, i) => (
                                        <li key={i} className="flex items-start gap-1.5 text-xs text-red-600">
                                          <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                                          </svg>
                                          {issue}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Items */}
                            <div>
                              <h4 className="font-semibold text-[#3E2C1F] mb-2">Items</h4>
                              <ul className="text-sm text-[#6B5B4F] space-y-1">
                                {order.items.map((item, idx) => (
                                  <li key={idx} className="flex justify-between gap-4">
                                    <span className="flex-1">{item.name} × {item.quantity}</span>
                                    <span className="font-medium text-[#3E2C1F]">
                                      ${((item.salePrice ?? item.price) * item.quantity).toFixed(2)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Tracking */}
                            {order.trackingNumber && (
                              <div className="md:col-span-2">
                                <h4 className="font-semibold text-[#3E2C1F] mb-2">Tracking</h4>
                                <div className="text-sm text-[#6B5B4F]">
                                  <p>
                                    Carrier: {order.trackingCarrier ?? '—'} &nbsp;|&nbsp; Tracking:{' '}
                                    {order.trackingUrl ? (
                                      <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-[#E8B55F] underline">
                                        {order.trackingNumber}
                                      </a>
                                    ) : order.trackingNumber}
                                  </p>
                                  {order.shippedAt && <p>Shipped: {formatDate(order.shippedAt)}</p>}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
              <p className="text-xs text-[#9B8B7E]">
                {((safePage - 1) * PAGE_SIZE) + 1}–{Math.min(safePage * PAGE_SIZE, filteredOrders.length)} of {filteredOrders.length} orders
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-2.5 py-1 rounded text-xs text-[#6B5B4F] border border-gray-200 hover:border-[#E8B55F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                  .reduce<(number | '…')[]>((acc, p, i, arr) => {
                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) =>
                    p === '…' ? (
                      <span key={`ellipsis-${i}`} className="px-1 text-xs text-[#9B8B7E]">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                          safePage === p
                            ? 'bg-[#3E2C1F] text-white'
                            : 'text-[#6B5B4F] border border-gray-200 hover:border-[#E8B55F]'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="px-2.5 py-1 rounded text-xs text-[#6B5B4F] border border-gray-200 hover:border-[#E8B55F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
