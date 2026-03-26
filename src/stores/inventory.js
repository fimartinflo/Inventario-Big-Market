import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useInventoryStore = defineStore('inventory', () => {
  const products     = ref([])
  const categories   = ref([])
  const searchQuery  = ref('')
  const filterCat    = ref('')
  const loading      = ref(false)

  const filtered = computed(() => {
    let list = products.value
    if (filterCat.value) {
      list = list.filter(p => p.category === filterCat.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q))
      )
    }
    return list
  })

  const lowStock = computed(() => products.value.filter(p => p.stock <= 3))

  async function fetchAll() {
    loading.value = true
    try {
      products.value = await window.electronAPI.products.getAll()
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    categories.value = await window.electronAPI.products.getCategories()
  }

  async function create(data) {
    const created = await window.electronAPI.products.create(data)
    products.value.push(created)
    products.value.sort((a, b) => a.name.localeCompare(b.name))
    return created
  }

  async function update(data) {
    const updated = await window.electronAPI.products.update(data)
    const idx = products.value.findIndex(p => p.id === updated.id)
    if (idx !== -1) products.value[idx] = updated
    return updated
  }

  async function remove(id) {
    await window.electronAPI.products.delete(id)
    products.value = products.value.filter(p => p.id !== id)
  }

  async function adjustStock(id, delta, reason) {
    const updated = await window.electronAPI.products.adjustStock({ id, delta, reason })
    const idx = products.value.findIndex(p => p.id === updated.id)
    if (idx !== -1) products.value[idx] = updated
    return updated
  }

  async function getStockMovements(productId) {
    return window.electronAPI.products.getStockMovements(productId)
  }

  function setSearch(q)   { searchQuery.value = q }
  function setFilter(cat) { filterCat.value = cat }

  return {
    products, categories, searchQuery, filterCat, loading,
    filtered, lowStock,
    fetchAll, fetchCategories, create, update, remove,
    adjustStock, getStockMovements, setSearch, setFilter
  }
})
