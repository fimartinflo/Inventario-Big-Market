<template>
  <div v-if="lowStock.length" class="alert alert-warning alert-dismissible mb-0 py-2 rounded-0 border-0 border-bottom border-warning">
    <div class="container-fluid d-flex align-items-center gap-2">
      <i class="fas fa-exclamation-triangle text-warning"></i>
      <span class="fw-semibold small">Stock bajo:</span>
      <span class="small">
        {{ lowStock.slice(0, 5).map(p => `${p.name} (${p.stock})`).join(' · ') }}
        <span v-if="lowStock.length > 5">y {{ lowStock.length - 5 }} más…</span>
      </span>
      <button
        type="button"
        class="btn btn-sm btn-outline-warning ms-auto"
        @click="uiStore.setTab('inventory')"
      >
        Ver inventario
      </button>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useInventoryStore } from '../../stores/inventory'
import { useUiStore } from '../../stores/ui'

const { lowStock } = storeToRefs(useInventoryStore())
const uiStore = useUiStore()
</script>
