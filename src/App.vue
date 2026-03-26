<template>
  <div class="d-flex flex-column vh-100">
    <AppHeader />
    <LowStockBanner />

    <main class="flex-grow-1 overflow-auto bg-light">
      <InventoryTab v-show="activeTab === 'inventory'" />
      <SalesTab     v-show="activeTab === 'sales'" />
      <ReportsTab   v-show="activeTab === 'reports'" />
    </main>

    <ToastNotification />
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUiStore } from './stores/ui'
import AppHeader         from './components/layout/AppHeader.vue'
import LowStockBanner    from './components/layout/LowStockBanner.vue'
import ToastNotification from './components/layout/ToastNotification.vue'
import InventoryTab      from './components/inventory/InventoryTab.vue'
import SalesTab          from './components/sales/SalesTab.vue'
import ReportsTab        from './components/reports/ReportsTab.vue'

const { activeTab } = storeToRefs(useUiStore())
</script>
