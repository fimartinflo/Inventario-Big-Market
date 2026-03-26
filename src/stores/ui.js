import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const activeTab       = ref('inventory')   // 'inventory' | 'sales' | 'reports'
  const notification    = ref(null)          // { message, type, id }
  let   _notifTimer     = null

  function setTab(tab) {
    activeTab.value = tab
  }

  /**
   * Muestra una notificación toast.
   * @param {string} message
   * @param {'success'|'info'|'warning'|'danger'} type
   * @param {number} duration ms
   */
  function notify(message, type = 'success', duration = 3000) {
    if (_notifTimer) clearTimeout(_notifTimer)
    notification.value = { message, type, id: Date.now() }
    if (duration > 0) {
      _notifTimer = setTimeout(() => { notification.value = null }, duration)
    }
  }

  function dismissNotification() {
    if (_notifTimer) clearTimeout(_notifTimer)
    notification.value = null
  }

  return { activeTab, notification, setTab, notify, dismissNotification }
})
