<template>
  <div class="modal fade" :class="{ show: modelValue, 'd-block': modelValue }" tabindex="-1" @click.self="close">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-boxes me-2"></i>Ajustar stock</h5>
          <button type="button" class="btn-close" @click="close" />
        </div>

        <form @submit.prevent="submit">
          <div class="modal-body">
            <p class="fw-semibold mb-1">{{ product?.name }}</p>
            <p class="text-muted small mb-3">Stock actual: <strong>{{ product?.stock }}</strong></p>

            <div class="mb-3">
              <label class="form-label">Ajuste (positivo para agregar, negativo para restar)</label>
              <input v-model.number="delta" type="number" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Motivo *</label>
              <input v-model="reason" type="text" class="form-control" placeholder="ej. Compra a proveedor" required maxlength="100" />
            </div>

            <div v-if="error" class="alert alert-danger py-2 mb-0">{{ error }}</div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="close">Cancelar</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1" />
              Aplicar ajuste
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-if="modelValue" class="modal-backdrop fade show" />
</template>

<script setup>
import { ref, watch } from 'vue'
import { useInventoryStore } from '../../stores/inventory'
import { useUiStore } from '../../stores/ui'

const props = defineProps({
  modelValue: Boolean,
  product: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue'])

const invStore = useInventoryStore()
const uiStore  = useUiStore()
const delta  = ref(0)
const reason = ref('')
const saving = ref(false)
const error  = ref('')

watch(() => props.modelValue, (open) => {
  if (open) { delta.value = 0; reason.value = ''; error.value = '' }
})

function close() { emit('update:modelValue', false) }

async function submit() {
  error.value = ''
  if (!delta.value)       { error.value = 'Ingresa un ajuste distinto de cero.'; return }
  if (!reason.value.trim()) { error.value = 'El motivo es obligatorio.'; return }
  if (props.product.stock + delta.value < 0) {
    error.value = `No puedes dejar stock negativo (stock actual: ${props.product.stock}).`
    return
  }

  saving.value = true
  try {
    await invStore.adjustStock(props.product.id, delta.value, reason.value)
    uiStore.notify(`Stock ajustado: ${delta.value > 0 ? '+' : ''}${delta.value}`, 'success')
    close()
  } catch (e) {
    error.value = e.message || 'Error al ajustar stock.'
  } finally {
    saving.value = false
  }
}
</script>
