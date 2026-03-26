<template>
  <div class="row g-3">
    <!-- Top products -->
    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-header fw-semibold small">Top productos vendidos</div>
        <div class="card-body">
          <canvas ref="topProductsRef" height="200" />
        </div>
      </div>
    </div>

    <!-- By category -->
    <div class="col-md-6">
      <div class="card h-100">
        <div class="card-header fw-semibold small">Ventas por categoría</div>
        <div class="card-body">
          <canvas ref="byCategoryRef" height="200" />
        </div>
      </div>
    </div>

    <!-- Daily totals -->
    <div class="col-12">
      <div class="card">
        <div class="card-header fw-semibold small">Ventas diarias</div>
        <div class="card-body">
          <canvas ref="dailyRef" height="100" />
        </div>
      </div>
    </div>

    <!-- By hour -->
    <div class="col-md-6">
      <div class="card">
        <div class="card-header fw-semibold small">Ventas por hora</div>
        <div class="card-body">
          <canvas ref="byHourRef" height="160" />
        </div>
      </div>
    </div>

    <!-- Payment summary -->
    <div class="col-md-6">
      <div class="card">
        <div class="card-header fw-semibold small">Por método de pago</div>
        <div class="card-body">
          <canvas ref="paymentRef" height="160" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import {
  Chart, BarController, BarElement, LineController, LineElement,
  PointElement, PieController, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend
} from 'chart.js'

Chart.register(
  BarController, BarElement, LineController, LineElement,
  PointElement, PieController, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend
)

const props = defineProps({
  start: { type: String, required: true },
  end:   { type: String, required: true }
})

const topProductsRef = ref(null)
const byCategoryRef  = ref(null)
const dailyRef       = ref(null)
const byHourRef      = ref(null)
const paymentRef     = ref(null)

let charts = {}

async function loadAndRender() {
  const [topProducts, byCategory, dailyTotals, byHour, paymentSummary] = await Promise.all([
    window.electronAPI.reports.topProducts({ start: props.start, end: props.end, limit: 10 }),
    window.electronAPI.reports.byCategory({ start: props.start, end: props.end }),
    window.electronAPI.reports.dailyTotals({ start: props.start, end: props.end }),
    window.electronAPI.reports.byHour({ start: props.start, end: props.end }),
    window.electronAPI.reports.paymentSummary({ start: props.start, end: props.end })
  ])

  destroyCharts()

  // Top products
  charts.top = new Chart(topProductsRef.value, {
    type: 'bar',
    data: {
      labels: topProducts.map(p => p.name),
      datasets: [{ label: 'Unidades', data: topProducts.map(p => p.units_sold), backgroundColor: '#198754' }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  })

  // By category
  charts.cat = new Chart(byCategoryRef.value, {
    type: 'pie',
    data: {
      labels: byCategory.map(c => c.category),
      datasets: [{ data: byCategory.map(c => c.revenue), backgroundColor: COLORS }]
    },
    options: { responsive: true }
  })

  // Daily totals
  charts.daily = new Chart(dailyRef.value, {
    type: 'line',
    data: {
      labels: dailyTotals.map(d => d.date),
      datasets: [{ label: 'Total ($)', data: dailyTotals.map(d => d.total), borderColor: '#0d6efd', tension: 0.3, fill: false }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  })

  // By hour
  const hourData = Array.from({ length: 24 }, (_, h) => {
    const found = byHour.find(r => r.hour === h)
    return found ? found.count : 0
  })
  charts.hour = new Chart(byHourRef.value, {
    type: 'bar',
    data: {
      labels: Array.from({ length: 24 }, (_, h) => `${h}:00`),
      datasets: [{ label: 'Ventas', data: hourData, backgroundColor: '#ffc107' }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  })

  // Payment
  const pmLabels = paymentSummary.map(p => p.card_type ? `${p.payment_method} (${p.card_type})` : p.payment_method)
  charts.pay = new Chart(paymentRef.value, {
    type: 'pie',
    data: {
      labels: pmLabels,
      datasets: [{ data: paymentSummary.map(p => p.total), backgroundColor: COLORS }]
    },
    options: { responsive: true }
  })
}

function destroyCharts() {
  for (const c of Object.values(charts)) c.destroy()
  charts = {}
}

const COLORS = ['#198754','#0d6efd','#ffc107','#dc3545','#6f42c1','#20c997','#fd7e14']

onMounted(loadAndRender)
onBeforeUnmount(destroyCharts)
watch([() => props.start, () => props.end], loadAndRender)
</script>
