import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  AddressElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'
import { useCart } from '@/context/CartContext'
import { saveMarketingConsent } from '@/lib/marketingService'

// Loaded lazily inside the component so Stripe.js isn't injected on every page
let stripePromise: ReturnType<typeof loadStripe> | null = null
function getStripePromise() {
  if (!stripePromise) stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  return stripePromise
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShippingRate {
  amountCents: number
  serviceLevel: string
}

interface ShippingEstimate {
  standard: ShippingRate
  priority: ShippingRate
}

interface AddressValue {
  name: string
  address: {
    line1: string
    line2: string | null
    city: string
    state: string
    postal_code: string
    country: string
  }
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = ['Contact', 'Shipping', 'Payment']
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num = i + 1
        const done = step > num
        const active = step === num
        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  done
                    ? 'bg-[#E8B55F] text-white'
                    : active
                      ? 'bg-[#3E2C1F] text-white'
                      : 'bg-[#F5E6D3] text-[#9B8B7E]'
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  num
                )}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  active ? 'text-[#3E2C1F]' : done ? 'text-[#E8B55F]' : 'text-[#9B8B7E]'
                }`}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-12 sm:w-20 mb-4 mx-1 transition-colors ${
                  step > num ? 'bg-[#E8B55F]' : 'bg-[#F5E6D3]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Inner form (needs Stripe context) ────────────────────────────────────────

interface CheckoutFormProps {
  paymentIntentId: string
  subtotalCents: number
  cartItems: Array<{ productId: string; quantity: number; selections?: { productId: string }[] }>
}

function CheckoutForm({ paymentIntentId, subtotalCents, cartItems }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { clearCart } = useCart()

  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Step 1
  const [email, setEmail] = useState('')
  const [marketingOptIn, setMarketingOptIn] = useState(false)

  // Step 2
  const [address, setAddress] = useState<AddressValue | null>(null)
  const [addressComplete, setAddressComplete] = useState(false)
  const [shippingTier, setShippingTier] = useState<'standard' | 'priority' | null>(null)
  const [estimate, setEstimate] = useState<ShippingEstimate | null>(null)
  const [estimateLoading, setEstimateLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Step 2 → 3 finalization
  const [finalizing, setFinalizing] = useState(false)
  const [finalizeError, setFinalizeError] = useState<string | null>(null)
  const [finalizedTotalCents, setFinalizedTotalCents] = useState<number | null>(null)
  const [finalizedShippingCents, setFinalizedShippingCents] = useState<number | null>(null)
  const [taxCents, setTaxCents] = useState<number | null>(null)
  const [taxError, setTaxError] = useState<string | null>(null)

  // Step 3
  const [tosAccepted, setTosAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const fetchEstimate = useCallback(
    (zip: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (!/^\d{5}$/.test(zip)) {
        setEstimate(null)
        setShippingTier(null)
        return
      }
      debounceRef.current = setTimeout(async () => {
        setEstimateLoading(true)
        try {
          const fn = httpsCallable<
            { destinationZip: string; items: Array<{ productId: string; quantity: number; selections?: { productId: string }[] }> },
            ShippingEstimate
          >(functions(), 'getShippingEstimate')
          const result = await fn({ destinationZip: zip, items: cartItems })
          setEstimate(result.data)
          setShippingTier((prev) => prev ?? 'standard')
        } catch {
          setEstimate(null)
        } finally {
          setEstimateLoading(false)
        }
      }, 500)
    },
    [cartItems]
  )

  const handleAddressChange = useCallback(
    (event: { complete: boolean; value: AddressValue }) => {
      setAddressComplete(event.complete)
      setAddress(event.value)
      if (event.complete) {
        fetchEstimate(event.value.address.postal_code)
      } else if (event.value.address.postal_code !== address?.address.postal_code) {
        setEstimate(null)
        setShippingTier(null)
      }
    },
    [address?.address.postal_code, fetchEstimate]
  )

  const selectedRate =
    estimate && shippingTier
      ? shippingTier === 'priority'
        ? estimate.priority
        : estimate.standard
      : null

  const estimatedTotalCents = selectedRate ? subtotalCents + selectedRate.amountCents : subtotalCents
  const displayTotalCents = finalizedTotalCents ?? estimatedTotalCents
  const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`

  const handleContinueToPayment = async () => {
    if (!address || !shippingTier || !estimate) return
    setFinalizing(true)
    setFinalizeError(null)
    try {
      const finalizeFn = httpsCallable<
        { paymentIntentId: string; shippingTier: string; destinationZip: string },
        { totalCents: number; shippingCostCents: number; taxCents: number; taxError: string | null }
      >(functions(), 'finalizePaymentIntent')
      const result = await finalizeFn({
        paymentIntentId,
        shippingTier,
        destinationZip: address.address.postal_code,
      })
      setFinalizedTotalCents(result.data.totalCents)
      setFinalizedShippingCents(result.data.shippingCostCents)
      setTaxCents(result.data.taxCents)
      setTaxError(result.data.taxError ?? null)
      setStep(3)
    } catch (err) {
      setFinalizeError(err instanceof Error ? err.message : 'Unable to calculate totals. Please try again.')
    } finally {
      setFinalizing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements || !finalizedTotalCents || !address) return

    setSubmitting(true)
    setPaymentError(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
          receipt_email: email,

          shipping: {
            name: address.name,
            address: {
              line1: address.address.line1,
              ...(address.address.line2 != null ? { line2: address.address.line2 } : {}),
              city: address.address.city,
              state: address.address.state,
              postal_code: address.address.postal_code,
              country: address.address.country,
            },
          },
        },
        redirect: 'if_required',
      })

      if (error) {
        setPaymentError(error.message ?? 'Payment failed. Please try again.')
        setSubmitting(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        clearCart()
        navigate('/checkout/success')
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setPaymentError(msg)
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <StepIndicator step={step} />

      {/* ── Step 1: Contact ── */}
      <div style={{ display: step === 1 ? 'block' : 'none' }}>
        <h2 className="text-lg font-semibold text-[#3E2C1F] mb-4">Contact</h2>
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && email.includes('@')) {
              e.preventDefault()
              setStep(2)
            }
          }}
          className="w-full px-4 py-3 border border-[#E8B55F]/50 rounded-lg text-[#3E2C1F] placeholder-[#C4B5A8] focus:outline-none focus:ring-2 focus:ring-[#E8B55F] bg-white text-sm"
          autoComplete="email"
          autoFocus
        />
        <label className="flex items-start gap-3 mt-4 cursor-pointer group">
          <input
            type="checkbox"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#E8B55F] flex-shrink-0"
          />
          <span className="text-xs text-[#9B8B7E] group-hover:text-[#6B5B4F] transition-colors leading-relaxed">
            Keep me updated on new products and restocks. No spam — unsubscribe anytime.
          </span>
        </label>
        <button
          type="button"
          onClick={() => {
            if (marketingOptIn) saveMarketingConsent(email).catch(() => {/* non-critical */})
            setStep(2)
          }}
          disabled={!email.includes('@')}
          className="mt-4 w-full py-3 bg-[#3E2C1F] text-white rounded-full font-medium hover:bg-[#2D1F15] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          Continue to shipping
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* ── Step 2: Shipping ── */}
      {/* AddressElement is always mounted so Stripe keeps iframe state; visibility toggled */}
      <div style={{ display: step === 2 ? 'block' : 'none' }}>
        {/* Confirmed email summary */}
        {email && (
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#F5E6D3]">
            <div>
              <p className="text-xs text-[#9B8B7E] uppercase tracking-wide">Contact</p>
              <p className="text-sm text-[#3E2C1F]">{email}</p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs text-[#E8B55F] hover:underline"
            >
              Edit
            </button>
          </div>
        )}

        <h2 className="text-lg font-semibold text-[#3E2C1F] mb-4">Shipping address</h2>
        <AddressElement
          options={{ mode: 'shipping', allowedCountries: ['US'] }}
          onChange={handleAddressChange}
        />

        {/* Shipping method — appears once ZIP is known */}
        {(estimateLoading || estimate) && (
          <div className="mt-5">
            <h3 className="text-base font-semibold text-[#3E2C1F] mb-3">Shipping method</h3>
            {estimateLoading ? (
              <div className="flex items-center gap-2 text-sm text-[#9B8B7E]">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Calculating rates…
              </div>
            ) : estimate ? (
              <div className="space-y-2">
                {(
                  [
                    { tier: 'standard' as const, rate: estimate.standard, label: 'Standard', days: '3–7 business days' },
                    { tier: 'priority' as const, rate: estimate.priority, label: 'Priority', days: '1–3 business days' },
                  ] as const
                ).map(({ tier, rate, label, days }) => (
                  <label
                    key={tier}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      shippingTier === tier
                        ? 'border-[#E8B55F] bg-[#FFF8E7]'
                        : 'border-[#E8B55F]/30 hover:border-[#E8B55F]/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingTier"
                        value={tier}
                        checked={shippingTier === tier}
                        onChange={() => setShippingTier(tier)}
                        className="accent-[#E8B55F]"
                      />
                      <div>
                        <p className="text-sm font-medium text-[#3E2C1F]">
                          {label} — {rate.serviceLevel}
                        </p>
                        <p className="text-xs text-[#9B8B7E]">{days}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#3E2C1F]">{fmt(rate.amountCents)}</span>
                  </label>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {finalizeError && (
          <p className="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {finalizeError}
          </p>
        )}

        <button
          type="button"
          onClick={handleContinueToPayment}
          disabled={!addressComplete || !shippingTier || !estimate || finalizing}
          className="mt-5 w-full py-3 bg-[#3E2C1F] text-white rounded-full font-medium hover:bg-[#2D1F15] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {finalizing ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Calculating total…
            </>
          ) : (
            <>
              Continue to payment
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* ── Step 3: Payment ── */}
      {/* PaymentElement is always mounted; visibility toggled */}
      <div style={{ display: step === 3 ? 'block' : 'none' }}>
        {/* Confirmed contact + shipping summary */}
        <div className="mb-5 pb-4 border-b border-[#F5E6D3] space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-[#9B8B7E] uppercase tracking-wide">Contact</p>
              <p className="text-sm text-[#3E2C1F]">{email}</p>
            </div>
            <button type="button" onClick={() => setStep(1)} className="text-xs text-[#E8B55F] hover:underline">
              Edit
            </button>
          </div>
          {address && (
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#9B8B7E] uppercase tracking-wide">Ship to</p>
                <p className="text-sm text-[#3E2C1F]">
                  {address.address.line1}
                  {address.address.line2 ? `, ${address.address.line2}` : ''},{' '}
                  {address.address.city}, {address.address.state} {address.address.postal_code}
                </p>
                {selectedRate && (
                  <p className="text-xs text-[#9B8B7E] mt-0.5">
                    {shippingTier === 'priority' ? 'Priority' : 'Standard'} — {selectedRate.serviceLevel} · {fmt(selectedRate.amountCents)}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => { setStep(2); setFinalizedTotalCents(null); setTaxCents(null); setFinalizedShippingCents(null) }} className="text-xs text-[#E8B55F] hover:underline flex-shrink-0 ml-4">
                Edit
              </button>
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold text-[#3E2C1F] mb-4">Payment</h2>
        <PaymentElement
          options={{
            defaultValues: { billingDetails: { email } },
          }}
        />

        {/* Order total */}
        <div className="mt-5 border-t border-[#F5E6D3] pt-4 space-y-1.5">
          <div className="flex justify-between text-sm text-[#6B5B4F]">
            <span>Subtotal</span>
            <span>{fmt(subtotalCents)}</span>
          </div>
          {finalizedShippingCents != null && (
            <div className="flex justify-between text-sm text-[#6B5B4F]">
              <span>Shipping</span>
              <span>{fmt(finalizedShippingCents)}</span>
            </div>
          )}
          {taxCents != null && taxCents > 0 && (
            <div className="flex justify-between text-sm text-[#6B5B4F]">
              <span>Tax</span>
              <span>{fmt(taxCents)}</span>
            </div>
          )}
          {taxCents === 0 && !taxError && (
            <div className="flex justify-between text-sm text-[#6B5B4F]">
              <span>Tax</span>
              <span>—</span>
            </div>
          )}
          {taxError && (
            <div className="flex justify-between text-sm text-amber-600">
              <span>Tax</span>
              <span title={taxError}>—</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-[#3E2C1F] text-lg pt-1">
            <span>Total</span>
            <span>{fmt(displayTotalCents)}</span>
          </div>
        </div>

        {paymentError && (
          <p className="mt-4 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {paymentError}
          </p>
        )}

        <label className="flex items-start gap-3 mt-5 cursor-pointer group">
          <input
            type="checkbox"
            checked={tosAccepted}
            onChange={(e) => setTosAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-[#E8B55F] flex-shrink-0"
          />
          <span className="text-xs text-[#9B8B7E] group-hover:text-[#6B5B4F] transition-colors leading-relaxed">
            I agree to the{' '}
            <Link to="/terms" target="_blank" className="text-[#E8B55F] hover:text-[#D4A04D] underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" target="_blank" className="text-[#E8B55F] hover:text-[#D4A04D] underline">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        <button
          type="submit"
          disabled={!stripe || !elements || submitting || !finalizedTotalCents || !tosAccepted}
          className="mt-4 w-full py-4 bg-[#3E2C1F] text-white rounded-full font-semibold text-base hover:bg-[#2D1F15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing…
            </>
          ) : (
            `Pay ${fmt(displayTotalCents)}`
          )}
        </button>

        <p className="mt-3 text-center text-xs text-[#9B8B7E]">
          Secured by Stripe · US shipping only
        </p>
      </div>
    </form>
  )
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export default function Checkout() {
  const { items, subtotal } = useCart()
  const navigate = useNavigate()

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    if (items.length === 0) {
      navigate('/products')
      return
    }

    const createPI = httpsCallable<
      { items: Array<{ productId: string; quantity: number; selections?: { productId: string }[] }> },
      { clientSecret: string; paymentIntentId: string; subtotalCents: number }
    >(functions(), 'createPaymentIntent')

    createPI({
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        ...(i.selections ? { selections: i.selections.map((s) => ({ productId: s.productId })) } : {}),
      })),
    })
      .then((result) => {
        setClientSecret(result.data.clientSecret)
        setPaymentIntentId(result.data.paymentIntentId)
      })
      .catch((err) => {
        setInitError(err?.message ?? 'Unable to initialize checkout. Please try again.')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const elementsOptions = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: 'stripe' as const,
          variables: {
            colorPrimary: '#E8B55F',
            colorText: '#3E2C1F',
            colorTextSecondary: '#6B5B4F',
            colorBackground: '#FFFFFF',
            fontFamily: 'Georgia, serif',
            borderRadius: '8px',
          },
        },
      }
    : undefined

  return (
    <div className="min-h-screen bg-[#FFF8E7] py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-2xl font-bold text-[#3E2C1F]">Dear Momollie</Link>
          <Link to="/products" className="text-sm text-[#6B5B4F] hover:text-[#3E2C1F] transition-colors">
            ← Back to shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Order summary — right on desktop, top on mobile */}
          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-white rounded-2xl border border-[#F5E6D3] p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-[#3E2C1F] mb-4">Order summary</h2>
              <ul className="space-y-3 mb-4">
                {items.map((item) => {
                  const displayPrice = item.salePrice !== null ? item.salePrice : item.price
                  return (
                    <li key={item.productId} className="flex gap-3 items-start">
                      <div className="relative flex-shrink-0">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#F5E6D3]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.currentTarget as HTMLImageElement).src =
                                'https://placehold.co/56x56/F5E6D3/6B5B4F?text=•'
                            }}
                          />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#6B5B4F] text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#3E2C1F] leading-tight">{item.name}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#3E2C1F] flex-shrink-0">
                        ${(displayPrice * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  )
                })}
              </ul>
              <div className="border-t border-[#F5E6D3] pt-3 flex justify-between text-sm">
                <span className="text-[#6B5B4F]">Subtotal</span>
                <span className="font-semibold text-[#3E2C1F]">${subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-[#9B8B7E] mt-2">Shipping calculated from your address</p>
            </div>
          </div>

          {/* Checkout form — left on desktop */}
          <div className="lg:col-span-3 lg:order-1">
            <div className="bg-white rounded-2xl border border-[#F5E6D3] p-6 lg:p-8">
              {initError ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{initError}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-[#E8B55F] text-white rounded-full text-sm font-medium hover:bg-[#D4A04D] transition-colors"
                  >
                    Try again
                  </button>
                </div>
              ) : !clientSecret || !paymentIntentId ? (
                <div className="space-y-4 animate-pulse">
                  <div className="flex gap-3 mb-8">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#F5E6D3]" />
                        <div className="h-3 w-14 bg-[#F5E6D3] rounded" />
                        {i < 3 && <div className="h-px w-12 bg-[#F5E6D3]" />}
                      </div>
                    ))}
                  </div>
                  <div className="h-5 bg-[#F5E6D3] rounded w-1/3" />
                  <div className="h-12 bg-[#F5E6D3] rounded" />
                  <div className="h-12 bg-[#F5E6D3] rounded-full mt-4" />
                </div>
              ) : (
                <Elements stripe={getStripePromise()} options={elementsOptions}>
                  <CheckoutForm
                    paymentIntentId={paymentIntentId}
                    subtotalCents={Math.round(subtotal * 100)}
                    cartItems={items.map((i) => ({
                      productId: i.productId,
                      quantity: i.quantity,
                      ...(i.selections ? { selections: i.selections.map((s) => ({ productId: s.productId })) } : {}),
                    }))}
                  />
                </Elements>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
