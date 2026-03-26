<template>
  <div class="card border-success">
    <div class="card-header bg-success text-white fw-semibold py-2">
      <i class="fas fa-cash-register me-2" />Pago
    </div>
    <div class="card-body">
      <!-- Payment method -->
      <div class="mb-3">
        <label class="form-label fw-semibold">Método de pago</label>
        <div class="d-flex gap-2 flex-wrap">
          <div
            v-for="m in methods"
            :key="m.value"
            class="form-check form-check-inline"
          >
            <input
              :id="'pm-' + m.value"
              v-model="paymentMethod"
              class="form-check-input"
              type="radio"
              :value="m.value"
            />
            <label class="form-check-label" :for="'pm-' + m.value">
              <i :class="m.icon + ' me-1'" />{{ m.label }}
            </label>
          </div>
        </div>
      </div>

      <!-- Card type -->
      <div v-if="paymentMethod === 'tarjeta'" class="mb-3">
        <label class="form-label fw-semibold">Tipo de tarjeta</label>
        <div class="d-flex gap-3">
          <div class="form-check">
            <input id="ct-credito" v-model="cardType" class="form-check-input" type="radio" value="credito" />
            <label class="form-check-label" for="ct-credito">Crédito</label>
          </div>
          <div class="form-check">
            <input id="ct-debito" v-model="cardType" class="form-check-input" type="radio" value="debito" />
            <label class="form-check-label" for="ct-debito">Débito</label>
          </div>
        </div>
      </div>

      <!-- Cash received -->
      <div v-if="paymentMethod === 'efectivo'" class="mb-3">
        <label class="form-label fw-semibold">Efectivo recibido</label>
        <input
          v-model.number="cashReceived"
          type="number"
          class="form-control"
          min="0"
          placeholder="0"
        />
        <div v-if="cartChange !== null && cartChange >= 0" class="alert alert-info mt-2 py-2 mb-0 fw-bold">
          Vuelto: {{ formatPrice(cartChange) }}
        </div>
        <div v-if="cashReceived > 0 && cashReceived < cartTotal" class="alert alert-warning mt-2 py-2 mb-0">
          Falta: {{ formatPrice(cartTotal - cashReceived) }}
        </div>
      </div>

      <!-- Process button -->
      <button
        class="btn btn-success w-100 fw-bold"
        :disabled="!cartIsValid || processing"
        @click="process"
      >
        <span v-if="processing" class="spinner-border spinner-border-sm me-1" />
        <i v-else class="fas fa-check me-1" />
        Procesar venta · {{ formatPrice(cartTotal) }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSalesStore } from '../../stores/sales'
import { useUiStore } from '../../stores/ui'
import { useFormatPrice } from '../../composables/useFormatPrice'

const salesStore = useSalesStore()
const uiStore    = useUiStore()
const { paymentMethod, cardType, cashReceived, cartTotal, cartChange, cartIsValid, processing } = storeToRefs(salesStore)
const { formatPrice } = useFormatPrice()

const methods = [
  { value: 'efectivo',      label: 'Efectivo',      icon: 'fas fa-money-bill' },
  { value: 'tarjeta',       label: 'Tarjeta',       icon: 'fas fa-credit-card' },
  { value: 'transferencia', label: 'Transferencia', icon: 'fas fa-exchange-alt' }
]

async function process() {
  try {
    await salesStore.processSale()
    uiStore.notify('Venta procesada correctamente', 'success')
  } catch (e) {
    uiStore.notify(e.message || 'Error al procesar la venta', 'danger', 0)
  }
}
</script>
