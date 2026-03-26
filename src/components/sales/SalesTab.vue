<template>
  <div class="container-fluid py-3">
    <div class="row g-3">

      <!-- Left: search + cart -->
      <div class="col-lg-8">
        <div class="card h-100">
          <div class="card-header fw-semibold">
            <i class="fas fa-shopping-cart me-2" />Carrito
          </div>
          <div class="card-body">
            <!-- Search -->
            <div class="mb-3 d-flex gap-2">
              <div class="flex-grow-1">
                <ProductSearch @select="onSelectProduct" />
              </div>
              <button
                v-if="cart.length"
                class="btn btn-outline-danger btn-sm"
                @click="salesStore.clearCart()"
                title="Vaciar carrito"
              >
                <i class="fas fa-trash" />
              </button>
            </div>

            <!-- Cart -->
            <SaleCart />
          </div>
        </div>
      </div>

      <!-- Right: payment + recent -->
      <div class="col-lg-4 d-flex flex-column gap-3">
        <PaymentPanel />

        <div class="card">
          <div class="card-body p-2">
            <RecentSales />
          </div>
        </div>
      </div>
    </div>

    <!-- Variable price modal -->
    <VariablePriceModal
      v-model="showVarPrice"
      :product="varPriceProduct"
      @confirm="addWithCustomPrice"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSalesStore } from '../../stores/sales'
import ProductSearch      from './ProductSearch.vue'
import SaleCart           from './SaleCart.vue'
import PaymentPanel       from './PaymentPanel.vue'
import RecentSales        from './RecentSales.vue'
import VariablePriceModal from './VariablePriceModal.vue'

const salesStore = useSalesStore()
const { cart }   = storeToRefs(salesStore)

const showVarPrice    = ref(false)
const varPriceProduct = ref(null)

function onSelectProduct(product) {
  if (product.stock <= 0) return
  if (product.category === 'Precio Variable') {
    varPriceProduct.value = product
    showVarPrice.value    = true
  } else {
    salesStore.addToCart(product)
  }
}

function addWithCustomPrice(price) {
  if (varPriceProduct.value) {
    salesStore.addToCart(varPriceProduct.value, 1, price)
    varPriceProduct.value = null
  }
}
</script>
