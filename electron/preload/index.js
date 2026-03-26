const { contextBridge, ipcRenderer } = require('electron')

/**
 * Expone un API seguro al renderer via contextBridge.
 * El renderer accede a través de: window.electronAPI.*
 */
contextBridge.exposeInMainWorld('electronAPI', {

  products: {
    getAll:            ()           => ipcRenderer.invoke('products:getAll'),
    getById:           (id)         => ipcRenderer.invoke('products:getById', id),
    create:            (data)       => ipcRenderer.invoke('products:create', data),
    update:            (data)       => ipcRenderer.invoke('products:update', data),
    delete:            (id)         => ipcRenderer.invoke('products:delete', id),
    getLowStock:       ()           => ipcRenderer.invoke('products:getLowStock'),
    getCategories:     ()           => ipcRenderer.invoke('products:getCategories'),
    adjustStock:       (payload)    => ipcRenderer.invoke('products:adjustStock', payload),
    getStockMovements: (productId)  => ipcRenderer.invoke('products:getStockMovements', productId)
  },

  sales: {
    create:         (data)           => ipcRenderer.invoke('sales:create', data),
    getAll:         (opts)           => ipcRenderer.invoke('sales:getAll', opts),
    getRecent:      (count)          => ipcRenderer.invoke('sales:getRecent', count),
    getByDate:      (date)           => ipcRenderer.invoke('sales:getByDate', date),
    getByRange:     (payload)        => ipcRenderer.invoke('sales:getByRange', payload),
    getSummaryToday: ()              => ipcRenderer.invoke('sales:getSummaryToday'),
    deleteByDate:   (date)           => ipcRenderer.invoke('sales:deleteByDate', date)
  },

  reports: {
    topProducts:    (payload) => ipcRenderer.invoke('reports:topProducts', payload),
    byCategory:     (payload) => ipcRenderer.invoke('reports:byCategory', payload),
    byHour:         (payload) => ipcRenderer.invoke('reports:byHour', payload),
    dailyTotals:    (payload) => ipcRenderer.invoke('reports:dailyTotals', payload),
    paymentSummary: (payload) => ipcRenderer.invoke('reports:paymentSummary', payload),
    inventoryValue: ()        => ipcRenderer.invoke('reports:inventoryValue')
  },

  app: {
    importJson:      (json)    => ipcRenderer.invoke('app:importJson', json),
    openFileDialog:  (opts)    => ipcRenderer.invoke('app:openFileDialog', opts),
    saveFileDialog:  (opts)    => ipcRenderer.invoke('app:saveFileDialog', opts),
    getVersion:      ()        => ipcRenderer.invoke('app:getVersion'),
    writeBackup:     (payload) => ipcRenderer.invoke('app:writeBackup', payload)
  }
})
