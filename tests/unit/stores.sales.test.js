import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useSalesStore } from '../../src/stores/sales'

// Mock electronAPI
vi.stubGlobal('window', {
  electronAPI: {
    sales: {
      create:         vi.fn(),
      getRecent:      vi.fn().mockResolvedValue([]),
      getByDate:      vi.fn().mockResolvedValue([]),
      getByRange:     vi.fn().mockResolvedValue([]),
      getSummaryToday: vi.fn().mockResolvedValue([])
    }
  }
})

describe('useSalesStore — cart', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('starts with empty cart', () => {
    const store = useSalesStore()
    expect(store.cart).toHaveLength(0)
    expect(store.cartTotal).toBe(0)
  })

  it('adds product to cart', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'Test', price: 1000 })
    expect(store.cart).toHaveLength(1)
    expect(store.cart[0].quantity).toBe(1)
    expect(store.cart[0].subtotal).toBe(1000)
  })

  it('increments quantity for same product', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'Test', price: 1000 })
    store.addToCart({ id: 1, name: 'Test', price: 1000 })
    expect(store.cart).toHaveLength(1)
    expect(store.cart[0].quantity).toBe(2)
    expect(store.cart[0].subtotal).toBe(2000)
  })

  it('keeps separate items for same product with different price', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'Test', price: 1000 })
    store.addToCart({ id: 1, name: 'Test', price: 1000 }, 1, 500)
    expect(store.cart).toHaveLength(2)
  })

  it('removes item from cart', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 500 })
    store.addToCart({ id: 2, name: 'B', price: 300 })
    store.removeFromCart(0)
    expect(store.cart).toHaveLength(1)
    expect(store.cart[0].name).toBe('B')
  })

  it('updates quantity', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 500 })
    store.updateQty(0, 3)
    expect(store.cart[0].quantity).toBe(3)
    expect(store.cart[0].subtotal).toBe(1500)
  })

  it('removes item when qty updated to 0', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 500 })
    store.updateQty(0, 0)
    expect(store.cart).toHaveLength(0)
  })

  it('computes cartTotal correctly', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 1000 })
    store.addToCart({ id: 2, name: 'B', price: 500 }, 2)
    expect(store.cartTotal).toBe(2000)
  })

  it('clears cart', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 500 })
    store.clearCart()
    expect(store.cart).toHaveLength(0)
    expect(store.cartTotal).toBe(0)
  })

  it('cartIsValid false when empty', () => {
    const store = useSalesStore()
    expect(store.cartIsValid).toBe(false)
  })

  it('cartIsValid false for efectivo with insufficient cash', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 1000 })
    store.paymentMethod = 'efectivo'
    store.cashReceived  = 500
    expect(store.cartIsValid).toBe(false)
  })

  it('cartIsValid true for efectivo with enough cash', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 1000 })
    store.paymentMethod = 'efectivo'
    store.cashReceived  = 1000
    expect(store.cartIsValid).toBe(true)
  })

  it('cartIsValid false for tarjeta without cardType', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 1000 })
    store.paymentMethod = 'tarjeta'
    store.cardType      = null
    expect(store.cartIsValid).toBe(false)
  })

  it('cartIsValid true for transferencia', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 1000 })
    store.paymentMethod = 'transferencia'
    expect(store.cartIsValid).toBe(true)
  })

  it('computes change for efectivo', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 1000 })
    store.paymentMethod = 'efectivo'
    store.cashReceived  = 2000
    expect(store.cartChange).toBe(1000)
  })

  it('cartChange is null for non-efectivo', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 1000 })
    store.paymentMethod = 'transferencia'
    expect(store.cartChange).toBeNull()
  })

  it('marks variable price correctly', () => {
    const store = useSalesStore()
    store.addToCart({ id: 1, name: 'A', price: 1000 }, 1, 500)
    expect(store.cart[0].isVariablePrice).toBe(true)
    expect(store.cart[0].originalPrice).toBe(1000)
    expect(store.cart[0].price).toBe(500)
  })
})
