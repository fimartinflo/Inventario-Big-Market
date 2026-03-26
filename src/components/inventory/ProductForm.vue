<template>
  <!-- Modal Bootstrap 5 -->
  <div class="modal fade" :class="{ show: modelValue, 'd-block': modelValue }" tabindex="-1" @click.self="$emit('update:modelValue', false)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title">
            <i class="fas fa-box me-2"></i>{{ editProduct ? 'Editar producto' : 'Agregar producto' }}
          </h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('update:modelValue', false)" />
        </div>

        <form @submit.prevent="submit">
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-8">
                <label class="form-label fw-semibold">Nombre *</label>
                <input v-model="form.name" type="text" class="form-control" required maxlength="100" />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Categoría *</label>
                <select v-model="form.category" class="form-select" required>
                  <option value="">Seleccionar…</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>

              <div class="col-md-4">
                <label class="form-label fw-semibold">Precio (CLP) *</label>
                <input v-model.number="form.price" type="number" class="form-control" min="1" required />
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Stock inicial</label>
                <input v-model.number="form.stock" type="number" class="form-control" min="0" :disabled="!!editProduct" />
                <div v-if="editProduct" class="form-text">Ajusta el stock desde la tabla</div>
              </div>
              <div class="col-md-4">
                <label class="form-label fw-semibold">Código de barras</label>
                <input v-model="form.barcode" type="text" class="form-control" maxlength="50" />
              </div>

              <div class="col-md-6">
                <label class="form-label fw-semibold">Proveedor</label>
                <input v-model="form.supplier" type="text" class="form-control" maxlength="100" />
              </div>
              <div class="col-md-6">
                <label class="form-label fw-semibold">Descripción</label>
                <input v-model="form.description" type="text" class="form-control" maxlength="200" />
              </div>
            </div>

            <div v-if="error" class="alert alert-danger mt-3 mb-0 py-2">{{ error }}</div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="$emit('update:modelValue', false)">Cancelar</button>
            <button type="submit" class="btn btn-success" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1" />
              {{ editProduct ? 'Guardar cambios' : 'Agregar' }}
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
import { storeToRefs } from 'pinia'
import { useInventoryStore } from '../../stores/inventory'
import { useUiStore } from '../../stores/ui'

const props = defineProps({
  modelValue: Boolean,
  editProduct: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue'])

const invStore  = useInventoryStore()
const uiStore   = useUiStore()
const { categories } = storeToRefs(invStore)

const saving = ref(false)
const error  = ref('')

const blank = () => ({ name: '', category: '', price: '', stock: 0, barcode: '', supplier: '', description: '' })
const form = ref(blank())

watch(() => props.modelValue, (open) => {
  if (open) {
    error.value = ''
    form.value  = props.editProduct
      ? { ...props.editProduct }
      : blank()
  }
})

async function submit() {
  error.value = ''
  if (!form.value.name.trim())  { error.value = 'El nombre es obligatorio.'; return }
  if (!form.value.category)     { error.value = 'Selecciona una categoría.'; return }
  if (form.value.price <= 0)    { error.value = 'El precio debe ser mayor a 0.'; return }

  saving.value = true
  try {
    if (props.editProduct) {
      await invStore.update({ ...form.value, id: props.editProduct.id })
      uiStore.notify('Producto actualizado', 'success')
    } else {
      await invStore.create(form.value)
      uiStore.notify('Producto agregado', 'success')
    }
    emit('update:modelValue', false)
  } catch (e) {
    error.value = e.message || 'Error al guardar el producto.'
  } finally {
    saving.value = false
  }
}
</script>
