import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { EmbroideryDesign } from '@/data/products'

export interface CartItemSelection {
  slotLabel: string
  productId: string
  productName: string
  embroidery?: CartItemEmbroidery
}

export interface CartItemEmbroidery extends EmbroideryDesign {
  price: number        // add-on fee per item at the time it was added
}

export interface CartItem {
  cartItemId: string   // flat items: productId; bundles: productId + slot hash; embroidered: unique per design
  productId: string
  name: string
  image: string
  price: number
  salePrice: number | null
  quantity: number
  shippingIncluded: boolean
  selections?: CartItemSelection[]
  embroidery?: CartItemEmbroidery
}

/** Embroidery add-on per unit, including any customized bundle slots. */
export function getEmbroideryPrice(item: CartItem): number {
  const slots = (item.selections ?? []).reduce((sum, s) => sum + (s.embroidery?.price ?? 0), 0)
  return (item.embroidery?.price ?? 0) + slots
}

/** Per-unit price including any sale and embroidery add-on. */
export function getUnitPrice(item: CartItem): number {
  const base = item.salePrice !== null ? item.salePrice : item.price
  return base + getEmbroideryPrice(item)
}

interface CartContextValue {
  items: CartItem[]
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, qty: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = 'momollie-cart'

function loadFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartItem[]
    // back-compat: old items may not have cartItemId
    return parsed.map((item) => ({
      ...item,
      cartItemId: item.cartItemId ?? item.productId,
    }))
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadFromStorage())
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // localStorage may be unavailable
    }
  }, [items])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback((incoming: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.cartItemId === incoming.cartItemId)
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === incoming.cartItemId ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...incoming, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId))
  }, [])

  const updateQuantity = useCallback((cartItemId: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => i.cartItemId !== cartItemId))
    } else {
      setItems((prev) =>
        prev.map((i) => (i.cartItemId === cartItemId ? { ...i, quantity: qty } : i))
      )
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  const subtotal = items.reduce((sum, i) => sum + getUnitPrice(i) * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
