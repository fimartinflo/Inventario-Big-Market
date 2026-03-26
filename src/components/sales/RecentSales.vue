<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <span class="fw-semibold small">Últimas ventas</span>
      <button class="btn btn-link btn-sm p-0" @click="reload">
        <i class="fas fa-sync-alt" />
      </button>
    </div>

    <div v-if="!recentSales.length" class="text-muted small text-center py-2">Sin ventas aún</div>

    <div v-for="sale in recentSales" :key="sale.id" class="border rounded p-2 mb-2 small">
      <div class="d-flex justify-content-between">
        <span class="text-muted">{{ formatDate(sale.sold_at) }}</span>
        <span class="fw-bold text-success">{{ formatPrice(sale.total) }}</span>
      </div>
      <div class="text-muted">
        {{ sale.items?.length ?? 0 }} ítem(s) · {{ sale.payment_method }}
        <span v-if="sale.card_type"> ({{ sale.card_type }})</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSalesStore } from '../../stores/sales'
import { useFormatPrice } from '../../composables/useFormatPrice'
import { useDate } from '../../composables/useDate'

const salesStore = useSalesStore()
const { recentSales } = storeToRefs(salesStore)
const { formatPrice } = useFormatPrice()
const { formatDate } = useDate()

onMounted(reload)

async function reload() {
  await salesStore.fetchRecent(8)
}
</script>
