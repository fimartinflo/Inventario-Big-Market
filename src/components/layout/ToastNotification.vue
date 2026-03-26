<template>
  <Transition name="toast">
    <div
      v-if="notification"
      :key="notification.id"
      class="toast-container position-fixed top-0 end-0 p-3"
      style="z-index: 9999"
    >
      <div
        class="toast show align-items-center text-white border-0"
        :class="`bg-${colorMap[notification.type] ?? 'success'}`"
        role="alert"
      >
        <div class="d-flex">
          <div class="toast-body">
            <i :class="iconMap[notification.type] + ' me-2'"></i>
            {{ notification.message }}
          </div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            @click="uiStore.dismissNotification()"
          />
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useUiStore } from '../../stores/ui'

const uiStore = useUiStore()
const { notification } = storeToRefs(uiStore)

const colorMap = {
  success: 'success',
  info:    'primary',
  warning: 'warning',
  danger:  'danger'
}
const iconMap = {
  success: 'fas fa-check-circle',
  info:    'fas fa-info-circle',
  warning: 'fas fa-exclamation-triangle',
  danger:  'fas fa-times-circle'
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateX(100%); }
</style>
