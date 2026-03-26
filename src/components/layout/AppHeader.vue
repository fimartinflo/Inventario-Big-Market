<template>
  <nav class="navbar navbar-dark bg-success py-2">
    <div class="container-fluid">
      <span class="navbar-brand fw-bold fs-5">
        <i class="fas fa-store me-2"></i>Big Market
      </span>

      <div class="d-flex gap-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="btn btn-sm"
          :class="activeTab === tab.id ? 'btn-light text-success fw-bold' : 'btn-outline-light'"
          @click="uiStore.setTab(tab.id)"
        >
          <i :class="tab.icon + ' me-1'"></i>{{ tab.label }}
        </button>
      </div>

      <span class="text-white-50 small">v{{ version }}</span>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUiStore } from '../../stores/ui'

const uiStore = useUiStore()
const { activeTab } = storeToRefs(uiStore)

const version = ref('')

const tabs = [
  { id: 'inventory', label: 'Inventario', icon: 'fas fa-boxes' },
  { id: 'sales',     label: 'Ventas',     icon: 'fas fa-cash-register' },
  { id: 'reports',   label: 'Reportes',   icon: 'fas fa-chart-bar' }
]

onMounted(async () => {
  try {
    version.value = await window.electronAPI.app.getVersion()
  } catch {
    version.value = '2.0'
  }
})
</script>
