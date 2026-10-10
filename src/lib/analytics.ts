import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'

export interface GaItem {
  item_id: string
  item_name: string
  price: number
  quantity: number
}

function log(eventName: string, params: Record<string, unknown>) {
  try {
    logEvent(analytics(), eventName, params)
  } catch {
    // Non-critical — never let analytics break the UI
  }
}

export function trackBeginCheckout(valueCents: number, items: GaItem[]) {
  log('begin_checkout', { currency: 'USD', value: valueCents / 100, items })
}

export function trackAddShippingInfo(valueCents: number, shippingTier: string, items: GaItem[]) {
  log('add_shipping_info', { currency: 'USD', value: valueCents / 100, shipping_tier: shippingTier, items })
}

export function trackAddPaymentInfo(valueCents: number, items: GaItem[]) {
  log('add_payment_info', { currency: 'USD', value: valueCents / 100, payment_type: 'card', items })
}

export function trackPurchase(opts: {
  transactionId: string
  valueCents: number
  shippingCents: number
  taxCents: number
  items: GaItem[]
}) {
  log('purchase', {
    transaction_id: opts.transactionId,
    currency: 'USD',
    value: opts.valueCents / 100,
    shipping: opts.shippingCents / 100,
    tax: opts.taxCents / 100,
    items: opts.items,
  })
}

// error_type maps to steps so you can filter in GA4 explorations
export function trackCheckoutError(
  errorType: 'init' | 'shipping_estimate' | 'shipping_finalize' | 'payment',
  errorMessage: string
) {
  log('checkout_error', {
    error_type: errorType,
    error_message: errorMessage.slice(0, 100),
  })
}
