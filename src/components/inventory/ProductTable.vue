<template>
  <div class="table-responsive">
    <table class="table table-sm table-hover align-middle mb-0">
      <thead class="table-dark">
        <tr>
          <th>Nombre</th>
          <th>Categoría</th>
          <th>Código</th>
          <th class="text-end">Precio</th>
          <th class="text-center">Stock</th>
          <th>Proveedor</th>
          <th class="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!products.length">
          <td colspan="7" class="text-center text-muted py-4">No hay productos</td>
        </tr>
        <tr
          v-for="product in products"
          :key="product.id"
          :class="{ 'table-warning': product.stock <= 3 }"
        >
          <td class="fw-semibold">{{ product.name }}</td>
          <td><span class="badge bg-secondary">{{ product.category }}</span></td>
          <td class="text-muted small">{{ product.barcode || '—' }}</td>
          <td class="text-end">{{ formatPrice(product.price) }}</td>
          <td class="text-center">
            <span :class="product.stock <= 3 ? 'text-danger fw-bold' : ''">{{ product.stock }}</span>
          </td>
          <td class="small text-muted">{{ product.supplier || '—' }}</td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-primary me-1" title="Editar" @click="$emit('edit', product)">
              <i class="fas fa-edit" />
            </button>
            <button class="btn btn-sm btn-outline-secondary me-1" title="Ajustar stock" @click="$emit('adjust-stock', product)">
              <i class="fas fa-plus-minus" />
            </button>
            <button class="btn btn-sm btn-outline-danger" title="Eliminar" @click="confirmDelete(product)">
              <i class="fas fa-trash" />
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { useInventoryStore } from '../../stores/inventory'
import { useUiStore } from '../../stores/ui'
import { useFormatPrice } from '../../composables/useFormatPrice'

defineProps({ products: { type: Array, default: () => [] } })
defineEmits(['edit', 'adjust-stock'])

const invStore = useInventoryStore()
const uiStore  = useUiStore()
const { formatPrice } = useFormatPrice()

async function confirmDelete(product) {
  if (!confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return
  try {
    await invStore.remove(product.id)
    uiStore.notify('Producto eliminado', 'warning')
  } catch (e) {
    uiStore.notify(e.message || 'Error al eliminar', 'danger')
  }
}
</script>
