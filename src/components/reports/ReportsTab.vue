<template>
  <div class="container-fluid py-3">
    <!-- Date range filter -->
    <div class="card mb-3">
      <div class="card-body py-2">
        <div class="d-flex flex-wrap gap-3 align-items-end">
          <div>
            <label class="form-label small fw-semibold mb-1">Desde</label>
            <input v-model="start" type="date" class="form-control form-control-sm" />
          </div>
          <div>
            <label class="form-label small fw-semibold mb-1">Hasta</label>
            <input v-model="end" type="date" class="form-control form-control-sm" />
          </div>

          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary" @click="setRange('today')">Hoy</button>
            <button class="btn btn-sm btn-outline-secondary" @click="setRange('week')">Semana</button>
            <button class="btn btn-sm btn-outline-secondary" @click="setRange('month')">Mes</button>
          </div>

          <button class="btn btn-sm btn-success ms-auto" @click="apply">
            <i class="fas fa-chart-bar me-1" />Actualizar
          </button>
        </div>

        <div v-if="dateError" class="text-danger small mt-1">{{ dateError }}</div>
      </div>
    </div>

    <!-- Export panel -->
    <ExportPanel :start="activeStart" :end="activeEnd" class="mb-3" />

    <!-- Charts -->
    <SalesCharts v-if="activeStart" :start="activeStart" :end="activeEnd" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDate } from '../../composables/useDate'
import SalesCharts from './SalesCharts.vue'
import ExportPanel from './ExportPanel.vue'

const { todayISO, firstDayOfMonthISO } = useDate()

const start = ref(firstDayOfMonthISO())
const end   = ref(todayISO())
const activeStart = ref(firstDayOfMonthISO())
const activeEnd   = ref(todayISO())
const dateError   = ref('')

function setRange(preset) {
  const today = new Date()
  end.value = todayISO()
  if (preset === 'today') {
    start.value = todayISO()
  } else if (preset === 'week') {
    const d = new Date(today)
    d.setDate(d.getDate() - 6)
    start.value = d.toISOString().split('T')[0]
  } else if (preset === 'month') {
    start.value = firstDayOfMonthISO()
  }
}

function apply() {
  dateError.value = ''
  if (!start.value || !end.value) { dateError.value = 'Selecciona ambas fechas.'; return }
  if (start.value > end.value)    { dateError.value = 'La fecha de inicio no puede ser posterior al fin.'; return }
  activeStart.value = start.value
  activeEnd.value   = end.value
}
</script>
