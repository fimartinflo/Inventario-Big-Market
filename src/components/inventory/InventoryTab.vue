<template>
  <div class="container-fluid py-3">
    <!-- Toolbar -->
    <div class="d-flex flex-wrap gap-2 mb-3 align-items-center">
      <input
        v-model="searchQ"
        type="text"
        class="form-control form-control-sm"
        style="max-width: 240px"
        placeholder="Buscar por nombre o código…"
        @input="invStore.setSearch(searchQ)"
      />

      <select
        v-model="filterCat"
        class="form-select form-select-sm"
        style="max-width: 180px"
        @change="invStore.setFilter(filterCat)"
      >
        <option value="">Todas las categorías</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>

      <span class="text-muted small ms-1">{{ filtered.length }} productos</span>

      <button class="btn btn-success btn-sm ms-auto" @click="openAdd">
        <i class="fas fa-plus me-1" />Agregar producto
      </button>

      <button class="btn btn-outline-secondary btn-sm" @click="exportInventory" title="Exportar a Excel">
        <i class="fas fa-file-excel me-1" />Excel
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-success" />
    </div>

    <!-- Table -->
    <ProductTable
      v-else
      :products="filtered"
      @edit="openEdit"
      @adjust-stock="openAdjust"
    />

    <!-- Modals -->
    <ProductForm v-model="showForm" :edit-product="editTarget" />
    <StockAdjustModal v-model="showAdjust" :product="adjustTarget" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useInventoryStore } from '../../stores/inventory'
import { useExport } from '../../composables/useExport'
import ProductTable      from './ProductTable.vue'
import ProductForm       from './ProductForm.vue'
import StockAdjustModal  from './StockAdjustModal.vue'

const invStore = useInventoryStore()
const { filtered, categories, loading } = storeToRefs(invStore)
const { exportInventoryToExcel } = useExport()

const searchQ   = ref('')
const filterCat = ref('')

const showForm    = ref(false)
const editTarget  = ref(null)
const showAdjust  = ref(false)
const adjustTarget = ref(null)

onMounted(async () => {
  await Promise.all([invStore.fetchAll(), invStore.fetchCategories()])
})

function openAdd() {
  editTarget.value = null
  showForm.value   = true
}

function openEdit(product) {
  editTarget.value = product
  showForm.value   = true
}

function openAdjust(product) {
  adjustTarget.value = product
  showAdjust.value   = true
}

function exportInventory() {
  const today = new Date().toISOString().split('T')[0]
  exportInventoryToExcel(invStore.products, `inventario_${today}`)
}
</script>
