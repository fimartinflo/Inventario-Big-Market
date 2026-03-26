<template>
  <div class="position-relative">
    <input
      ref="inputRef"
      v-model="query"
      type="text"
      class="form-control"
      placeholder="Buscar producto o código de barras…"
      autocomplete="off"
      @input="onInput"
      @keydown.down.prevent="moveDown"
      @keydown.up.prevent="moveUp"
      @keydown.enter.prevent="selectHighlighted"
      @keydown.escape="close"
      @blur="onBlur"
    />

    <ul
      v-if="results.length && open"
      class="dropdown-menu show w-100 shadow-sm"
      style="max-height: 240px; overflow-y: auto"
    >
      <li
        v-for="(p, i) in results"
        :key="p.id"
        class="dropdown-item d-flex justify-content-between align-items-center"
        :class="{ active: i === highlighted }"
        style="cursor: pointer"
        @mousedown.prevent="select(p)"
      >
        <span>
          <span class="fw-semibold">{{ p.name }}</span>
          <span class="text-muted small ms-2">{{ p.category }}</span>
        </span>
        <span class="d-flex gap-2 align-items-center">
          <span class="badge" :class="p.stock > 0 ? 'bg-success' : 'bg-danger'">{{ p.stock }}</span>
          <span class="small fw-bold">{{ formatPrice(p.price) }}</span>
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useInventoryStore } from '../../stores/inventory'
import { useFormatPrice } from '../../composables/useFormatPrice'

const emit = defineEmits(['select'])

const invStore = useInventoryStore()
const { products } = storeToRefs(invStore)
const { formatPrice } = useFormatPrice()

const query       = ref('')
const open        = ref(false)
const highlighted = ref(0)

const results = computed(() => {
  if (!query.value.trim()) return []
  const q = query.value.toLowerCase()
  return products.value
    .filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q))
    )
    .slice(0, 10)
})

function onInput() {
  open.value        = true
  highlighted.value = 0
}

function moveDown() {
  if (highlighted.value < results.value.length - 1) highlighted.value++
}
function moveUp() {
  if (highlighted.value > 0) highlighted.value--
}

function selectHighlighted() {
  if (results.value[highlighted.value]) select(results.value[highlighted.value])
}

function select(product) {
  emit('select', product)
  query.value = ''
  open.value  = false
}

function close()  { open.value = false }
function onBlur() { setTimeout(close, 150) }
</script>
