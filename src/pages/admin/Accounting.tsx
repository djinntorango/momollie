import { useEffect, useState, useMemo } from 'react'
import { getOrders } from '@/lib/orderService'
import type { Order } from '@/data/products'

// ── Helpers ────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function fmtDate(d: Date | undefined) {
  if (!d) return '—'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d)
}

function stripeFee(total: number) {
  return Math.round((total * 0.029 + 0.30) * 100) / 100
}

function hasLabelCost(orders: Order[]) {
  return orders.some((o) => o.labelCostUsd != null)
}

function shippingCollected(order: Order) {
  return Math.max(0, order.total - order.subtotal)
}

// ── Date presets ───────────────────────────────────────────────────────────

type Preset = { label: string; from: string; to: string }

function buildPresets(): Preset[] {
  const now = new Date()
  const y = now.getFullYear()
  const pad = (n: number) => String(n).padStart(2, '0')
  const date = (year: number, month: number, day: number) =>
    `${year}-${pad(month)}-${pad(day)}`

  return [
    { label: 'This Year',  from: date(y, 1, 1),    to: date(y, 12, 31) },
    { label: 'Last Year',  from: date(y - 1, 1, 1), to: date(y - 1, 12, 31) },
    { label: 'Q1',         from: date(y, 1, 1),     to: date(y, 3, 31) },
    { label: 'Q2',         from: date(y, 4, 1),     to: date(y, 6, 30) },
    { label: 'Q3',         from: date(y, 7, 1),     to: date(y, 9, 30) },
    { label: 'Q4',         from: date(y, 10, 1),    to: date(y, 12, 31) },
  ]
}

// ── CSV export ─────────────────────────────────────────────────────────────

function exportCsv(rows: Order[], dateFrom: string, dateTo: string) {
  const headers = [
    'Date', 'Order ID', 'Customer', 'Email',
    'Product Subtotal', 'Shipping Collected', 'Gross Total',
    'Refund', 'Net Revenue',
    'Est. Stripe Fee', 'Label Cost (Shippo)', 'Est. Net After All Costs',
    'Status', 'Shipping Tier', 'Tracking Number',
  ]

  const escape = (v: string | number | undefined) => {
    const s = String(v ?? '')
    return `"${s.replace(/"/g, '""')}"`
  }

  const body = rows.map((o) => {
    const refund = o.refundAmount ?? 0
    const net = o.total - refund
    const fee = o.status !== 'cancelled' ? stripeFee(o.total) : 0
    return [
      fmtDate(o.createdAt),
      o.id,
      o.customer.name,
      o.customer.email,
      o.subtotal.toFixed(2),
      shippingCollected(o).toFixed(2),
      o.total.toFixed(2),
      refund > 0 ? refund.toFixed(2) : '',
      net.toFixed(2),
      fee.toFixed(2),
      o.labelCostUsd != null ? o.labelCostUsd.toFixed(2) : '',
      (net - fee - (o.labelCostUsd ?? 0)).toFixed(2),
      o.status,
      o.shippingTier ?? 'standard',
      o.trackingNumber ?? '',
    ].map(escape).join(',')
  })

  const csv = [headers.map(escape).join(','), ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const label = dateFrom && dateTo ? `${dateFrom}_${dateTo}` : 'all'
  a.download = `momollie-accounting-${label}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Summary card ───────────────────────────────────────────────────────────

function Card({ label, value, sub, accent }: {
  label: string; value: string; sub?: string; accent?: boolean
}) {
  return (
    <div className={`rounded-xl p-4 ${accent ? 'bg-[#3E2C1F] text-white' : 'bg-white border border-gray-100'}`}>
      <p className={`text-xs font-medium mb-1 ${accent ? 'text-white/60' : 'text-[#9B8B7E]'}`}>{label}</p>
      <p className={`text-2xl font-bold ${accent ? 'text-white' : 'text-[#3E2C1F]'}`}>{value}</p>
      {sub && <p className={`text-xs mt-0.5 ${accent ? 'text-white/50' : 'text-[#9B8B7E]'}`}>{sub}</p>}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function Accounting() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const presets = useMemo(() => buildPresets(), [])
  const [dateFrom, setDateFrom] = useState(presets[0].from)   // default: this year
  const [dateTo,   setDateTo]   = useState(presets[0].to)
  const [activePreset, setActivePreset] = useState('This Year')
  const [statusFilter, setStatusFilter] = useState<'all' | 'revenue'>('revenue')

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .finally(() => setLoading(false))
  }, [])

  const applyPreset = (p: Preset) => {
    setDateFrom(p.from)
    setDateTo(p.to)
    setActivePreset(p.label)
  }

  const handleDateChange = (field: 'from' | 'to', val: string) => {
    if (field === 'from') setDateFrom(val)
    else setDateTo(val)
    setActivePreset('Custom')
  }

  // Filter orders by date and optionally by revenue-only statuses
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (dateFrom) {
        const from = new Date(dateFrom); from.setHours(0, 0, 0, 0)
        if (!o.createdAt || o.createdAt < from) return false
      }
      if (dateTo) {
        const to = new Date(dateTo); to.setHours(23, 59, 59, 999)
        if (!o.createdAt || o.createdAt > to) return false
      }
      if (statusFilter === 'revenue') {
        return o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered'
      }
      return true
    })
  }, [orders, dateFrom, dateTo, statusFilter])

  // Totals
  const totals = useMemo(() => {
    let gross = 0, refunds = 0, shipping = 0, fees = 0, labelCosts = 0, labelCostKnown = 0
    for (const o of filtered) {
      gross      += o.total
      refunds    += o.refundAmount ?? 0
      shipping   += shippingCollected(o)
      fees       += o.status !== 'cancelled' ? stripeFee(o.total) : 0
      if (o.labelCostUsd != null) { labelCosts += o.labelCostUsd; labelCostKnown++ }
    }
    const net = gross - refunds
    return { gross, refunds, net, shipping, fees, labelCosts, labelCostKnown, netAfterAll: net - fees - labelCosts }
  }, [filtered])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#E8B55F] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#3E2C1F]">Accounting</h1>
          <p className="text-sm text-[#9B8B7E] mt-0.5">{filtered.length} orders · {fmt(totals.gross)} gross</p>
        </div>
        <button
          onClick={() => exportCsv(filtered, dateFrom, dateTo)}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-[#3E2C1F] text-white rounded-lg text-sm font-medium hover:bg-[#2D1F15] transition-colors disabled:opacity-60"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Date controls */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activePreset === p.label
                ? 'bg-[#E8B55F] text-white'
                : 'bg-white border border-gray-200 text-[#6B5B4F] hover:border-[#E8B55F]'
            }`}
          >
            {p.label}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-auto">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => handleDateChange('from', e.target.value)}
            className="px-2 py-1 border border-gray-200 rounded-lg text-xs text-[#3E2C1F] focus:outline-none focus:ring-1 focus:ring-[#E8B55F]"
          />
          <span className="text-xs text-[#9B8B7E]">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => handleDateChange('to', e.target.value)}
            className="px-2 py-1 border border-gray-200 rounded-lg text-xs text-[#3E2C1F] focus:outline-none focus:ring-1 focus:ring-[#E8B55F]"
          />
        </div>
        {/* Status toggle */}
        <div className="flex items-center gap-1 ml-2">
          <button
            onClick={() => setStatusFilter('revenue')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === 'revenue' ? 'bg-[#3E2C1F] text-white' : 'bg-white border border-gray-200 text-[#6B5B4F] hover:border-[#E8B55F]'}`}
          >
            Paid only
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${statusFilter === 'all' ? 'bg-[#3E2C1F] text-white' : 'bg-white border border-gray-200 text-[#6B5B4F] hover:border-[#E8B55F]'}`}
          >
            All statuses
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <Card label="Gross Revenue"      value={fmt(totals.gross)}        sub={`${filtered.length} orders`} />
        <Card label="Refunds Issued"     value={fmt(totals.refunds)}      sub="returned to customers" />
        <Card label="Net Revenue"        value={fmt(totals.net)}          accent />
        <Card label="Shipping Collected" value={fmt(totals.shipping)}     sub="included in gross" />
        <Card label="Est. Stripe Fees"   value={fmt(totals.fees)}         sub="2.9% + $0.30/order" />
        <Card
          label="Shippo Label Costs"
          value={fmt(totals.labelCosts)}
          sub={
            totals.labelCostKnown === filtered.length
              ? 'all orders tracked'
              : totals.labelCostKnown === 0
                ? 'no data yet'
                : `${totals.labelCostKnown} of ${filtered.length} orders`
          }
        />
      </div>

      {/* Partial label cost warning */}
      {hasLabelCost(filtered) && totals.labelCostKnown < filtered.length && (
        <div className="flex items-start gap-2 mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <svg className="w-4 h-4 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            Label costs are only available for orders shipped after this tracking was added ({totals.labelCostKnown} of {filtered.length} orders).
            For older orders, download your Shippo invoices from the Shippo dashboard.
          </span>
        </div>
      )}
      {!hasLabelCost(filtered) && filtered.length > 0 && (
        <div className="flex items-start gap-2 mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <svg className="w-4 h-4 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong>No label costs recorded yet.</strong> Label costs will be captured automatically for all new shipments.
            For existing orders, download your Shippo invoices from the Shippo dashboard.
          </span>
        </div>
      )}

      {/* Transaction table */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-[#9B8B7E]">
          No orders in this date range
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5E6D3] text-[#3E2C1F]">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                  <th className="text-left px-4 py-3 font-semibold">Order</th>
                  <th className="text-left px-4 py-3 font-semibold">Customer</th>
                  <th className="text-right px-4 py-3 font-semibold">Products</th>
                  <th className="text-right px-4 py-3 font-semibold">Shipping</th>
                  <th className="text-right px-4 py-3 font-semibold">Gross</th>
                  <th className="text-right px-4 py-3 font-semibold">Refund</th>
                  <th className="text-right px-4 py-3 font-semibold">Net</th>
                  <th className="text-right px-4 py-3 font-semibold whitespace-nowrap">Est. Stripe</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const refund = o.refundAmount ?? 0
                  const net = o.total - refund
                  const fee = o.status !== 'cancelled' ? stripeFee(o.total) : 0
                  const ship = shippingCollected(o)
                  return (
                    <tr key={o.id} className="border-t border-gray-50 hover:bg-[#FFF8E7] transition-colors">
                      <td className="px-4 py-3 text-[#6B5B4F] whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                      <td className="px-4 py-3 font-mono text-xs text-[#6B5B4F]">{o.id.slice(0, 8).toUpperCase()}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#3E2C1F] text-xs">{o.customer.name}</div>
                        <div className="text-[#9B8B7E] text-xs">{o.customer.email}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-[#3E2C1F]">{fmt(o.subtotal)}</td>
                      <td className="px-4 py-3 text-right text-[#6B5B4F]">{ship > 0 ? fmt(ship) : '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-[#3E2C1F]">{fmt(o.total)}</td>
                      <td className="px-4 py-3 text-right text-red-500">
                        {refund > 0 ? `−${fmt(refund)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#3E2C1F]">{fmt(net)}</td>
                      <td className="px-4 py-3 text-right text-[#9B8B7E] text-xs">
                        {o.status !== 'cancelled' ? `−${fmt(fee)}` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          o.status === 'paid'      ? 'bg-blue-100 text-blue-700' :
                          o.status === 'shipped'   ? 'bg-green-100 text-green-700' :
                          o.status === 'delivered' ? 'bg-gray-100 text-gray-600' :
                          o.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                                                     'bg-yellow-100 text-yellow-700'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
              {/* Footer totals row */}
              <tfoot>
                <tr className="border-t-2 border-[#E8B55F]/40 bg-[#FFF8E7] font-semibold text-[#3E2C1F]">
                  <td colSpan={3} className="px-4 py-3 text-sm">Totals ({filtered.length} orders)</td>
                  <td className="px-4 py-3 text-right">{fmt(totals.gross - totals.shipping)}</td>
                  <td className="px-4 py-3 text-right">{fmt(totals.shipping)}</td>
                  <td className="px-4 py-3 text-right">{fmt(totals.gross)}</td>
                  <td className="px-4 py-3 text-right text-red-500">
                    {totals.refunds > 0 ? `−${fmt(totals.refunds)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">{fmt(totals.net)}</td>
                  <td className="px-4 py-3 text-right text-[#9B8B7E]">−{fmt(totals.fees)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
