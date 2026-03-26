<template>
  <div class="modal fade" :class="{ show: modelValue, 'd-block': modelValue }" tabindex="-1" @click.self="close">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <div class="modal-header">
          <h6 class="modal-title">Precio libre — {{ product?.name }}</h6>
          <button type="button" class="btn-close" @click="close" />
        </div>
        <form @submit.prevent="confirm">
          <div class="modal-body">
            <p class="text-muted small mb-2">Precio base: {{ formatPrice(product?.price) }}</p>
            <label class="form-label">Nuevo precio (CLP)</label>
            <input v-model.number="customPrice" ref="inputRef" type="number" class="form-control" min="1" required />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" @click="close">Cancelar</button>
            <button type="submit" class="btn btn-warning btn-sm">Agregar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  <div v-if="modelValue" class="modal-backdrop fade show" />
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useFormatPrice } from '../../composables/useFormatPrice'

const props = defineProps({
  modelValue: Boolean,
  product: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'confirm'])

const { formatPrice } = useFormatPrice()
const customPrice = ref(0)
const inputRef    = ref(null)

watch(() => props.modelValue, (open) => {
  if (open) {
    customPrice.value = props.product?.price ?? 0
    nextTick(() => inputRef.value?.select())
  }
})

function close()   { emit('update:modelValue', false) }
function confirm() {
  if (customPrice.value > 0) {
    emit('confirm', customPrice.value)
    close()
  }
}
</script>
