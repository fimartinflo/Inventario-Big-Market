<template>
  <div class="card">
    <div class="card-header fw-semibold small">Exportar datos</div>
    <div class="card-body d-flex flex-wrap gap-2">
      <button class="btn btn-outline-success btn-sm" @click="exportSales" :disabled="exporting">
        <i class="fas fa-file-excel me-1" />Ventas (Excel)
      </button>
      <button class="btn btn-outline-primary btn-sm" @click="exportInventory" :disabled="exporting">
        <i class="fas fa-boxes me-1" />Inventario (Excel)
      </button>
      <button class="btn btn-outline-secondary btn-sm" @click="exportBackup" :disabled="exporting">
        <i class="fas fa-database me-1" />Backup JSON
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useInventoryStore } from '../../stores/inventory'
import { useSalesStore } from '../../stores/sales'
import { useUiStore } from '../../stores/ui'
import { useExport } from '../../composables/useExport'
import { useDate } from '../../composables/useDate'

const props = defineProps({
  start: { type: String, required: true },
  end:   { type: String, required: true }
})

const invStore   = useInventoryStore()
const salesStore = useSalesStore()
const uiStore    = useUiStore()
const { exportSalesToExcel, exportInventoryToExcel } = useExport()
const { todayISO } = useDate()

const exporting = ref(false)

async function exportSales() {
  exporting.value = true
  try {
    const sales = await salesStore.getByRange(props.start, props.end)
    exportSalesToExcel(sales, `ventas_${props.start}_${props.end}`)
    uiStore.notify('Exportación completada', 'success')
  } catch (e) {
    uiStore.notify(e.message || 'Error al exportar', 'danger')
  } finally {
    exporting.value = false
  }
}

async function exportInventory() {
  exportInventoryToExcel(invStore.products, `inventario_${todayISO()}`)
  uiStore.notify('Inventario exportado', 'success')
}

async function exportBackup() {
  exporting.value = true
  try {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      products: invStore.products,
      sales: await salesStore.getByRange('2000-01-01', todayISO())
    }
    const json = JSON.stringify(data, null, 2)
    const result = await window.electronAPI.app.saveFileDialog({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      defaultPath: `backup_${todayISO()}.json`
    })
    if (!result.canceled && result.filePath) {
      // Write via IPC — renderer can't write files directly
      await window.electronAPI.app.writeBackup({ path: result.filePath, data: json })
      uiStore.notify('Backup guardado', 'success')
    }
  } catch (e) {
    uiStore.notify(e.message || 'Error al crear backup', 'danger')
  } finally {
    exporting.value = false
  }
}
</script>
