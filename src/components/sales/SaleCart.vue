<template>
  <div>
    <!-- Empty state -->
    <div v-if="!cart.length" class="text-center text-muted py-4">
      <i class="fas fa-shopping-cart fa-2x mb-2 d-block opacity-25" />
      Agrega productos al carrito
    </div>

    <!-- Items -->
    <div v-else class="table-responsive">
      <table class="table table-sm align-middle mb-0">
        <thead class="table-light">
          <tr>
            <th>Producto</th>
            <th class="text-end" style="width:100px">Precio</th>
            <th class="text-center" style="width:110px">Cant.</th>
            <th class="text-end" style="width:100px">Subtotal</th>
            <th style="width:40px"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in cart" :key="idx">
            <td>
              <span class="fw-semibold">{{ item.name }}</span>
              <span v-if="item.isVariablePrice" class="badge bg-warning text-dark ms-1 small">precio libre</span>
            </td>
            <td class="text-end small">{{ formatPrice(item.price) }}</td>
            <td class="text-center">
              <div class="input-group input-group-sm justify-content-center" style="max-width:100px; margin: 0 auto">
                <button class="btn btn-outline-secondary" @click="decrement(idx)">−</button>
                <input
                  type="number"
                  class="form-control text-center"
                  :value="item.quantity"
                  min="1"
                  @change="salesStore.updateQty(idx, +$event.target.value)"
                />
                <button class="btn btn-outline-secondary" @click="salesStore.updateQty(idx, item.quantity + 1)">+</button>
              </div>
            </td>
            <td class="text-end fw-semibold">{{ formatPrice(item.subtotal) }}</td>
            <td>
              <button class="btn btn-sm btn-outline-danger p-1" @click="salesStore.removeFromCart(idx)">
                <i class="fas fa-times" />
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot class="table-light">
          <tr>
            <td colspan="3" class="text-end fw-bold">TOTAL</td>
            <td class="text-end fw-bold fs-5 text-success">{{ formatPrice(cartTotal) }}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useSalesStore } from '../../stores/sales'
import { useFormatPrice } from '../../composables/useFormatPrice'

const salesStore = useSalesStore()
const { cart, cartTotal } = storeToRefs(salesStore)
const { formatPrice } = useFormatPrice()

function decrement(idx) {
  const item = cart.value[idx]
  salesStore.updateQty(idx, item.quantity - 1)
}
</script>
