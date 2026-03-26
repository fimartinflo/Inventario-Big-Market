import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSalesStore = defineStore('sales', () => {
  // ── Cart ──────────────────────────────────────────────────────────────────
  const cart          = ref([])   // [{ productId, name, price, quantity, subtotal, isVariablePrice, originalPrice }]
  const paymentMethod = ref('efectivo')   // 'efectivo' | 'tarjeta' | 'transferencia'
  const cardType      = ref(null)          // 'credito' | 'debito' | null
  const cashReceived  = ref(0)

  const cartTotal   = computed(() => cart.value.reduce((s, i) => s + i.subtotal, 0))
  const cartChange  = computed(() =>
    paymentMethod.value === 'efectivo' ? Math.max(0, cashReceived.value - cartTotal.value) : null
  )
  const cartIsValid = computed(() => {
    if (!cart.value.length) return false
    if (paymentMethod.value === 'tarjeta'   && !cardType.value) return false
    if (paymentMethod.value === 'efectivo'  && cashReceived.value < cartTotal.value) return false
    return true
  })

  function addToCart(product, qty = 1, customPrice = null) {
    const price = customPrice ?? product.price
    const existing = cart.value.find(i => i.productId === product.id && i.price === price)
    if (existing) {
      existing.quantity += qty
      existing.subtotal  = existing.price * existing.quantity
    } else {
      cart.value.push({
        productId:       product.id,
        name:            product.name,
        price,
        quantity:        qty,
        subtotal:        price * qty,
        isVariablePrice: customPrice !== null,
        originalPrice:   customPrice !== null ? product.price : null
      })
    }
  }

  function removeFromCart(index) {
    cart.value.splice(index, 1)
  }

  function updateQty(index, qty) {
    if (qty <= 0) { removeFromCart(index); return }
    const item = cart.value[index]
    item.quantity = qty
    item.subtotal = item.price * qty
  }

  function clearCart() {
    cart.value        = []
    paymentMethod.value = 'efectivo'
    cardType.value      = null
    cashReceived.value  = 0
  }

  // ── Sales history ─────────────────────────────────────────────────────────
  const recentSales  = ref([])
  const processing   = ref(false)

  async function processSale() {
    if (processing.value) return
    processing.value = true
    try {
      const sale = await window.electronAPI.sales.create({
        items:         cart.value,
        paymentMethod: paymentMethod.value,
        cardType:      cardType.value,
        cashReceived:  cashReceived.value
      })
      clearCart()
      // Prepend to recent list
      recentSales.value.unshift(sale)
      if (recentSales.value.length > 10) recentSales.value.pop()
      return sale
    } finally {
      processing.value = false
    }
  }

  async function fetchRecent(count = 5) {
    recentSales.value = await window.electronAPI.sales.getRecent(count)
  }

  async function getByDate(date) {
    return window.electronAPI.sales.getByDate(date)
  }

  async function getByRange(start, end) {
    return window.electronAPI.sales.getByRange({ start, end })
  }

  async function getSummaryToday() {
    return window.electronAPI.sales.getSummaryToday()
  }

  return {
    // cart
    cart, paymentMethod, cardType, cashReceived,
    cartTotal, cartChange, cartIsValid,
    addToCart, removeFromCart, updateQty, clearCart,
    // sales
    recentSales, processing,
    processSale, fetchRecent, getByDate, getByRange, getSummaryToday
  }
})
