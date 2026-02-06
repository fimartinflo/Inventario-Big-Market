const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Para depuración
  log: (message) => console.log('[Electron]', message),
  
  // Para manejar archivos (opcional, para futuras expansiones)
  showDialog: (options) => ipcRenderer.invoke('show-dialog', options)
});

// Agregar un listener para cuando la página esté lista
window.addEventListener('DOMContentLoaded', () => {
  console.log('✅ Página cargada en el renderer process');
  
  // Verificar si estamos en Electron
  const isElectron = typeof window !== 'undefined' && 
    window.process && 
    window.process.type === 'renderer';

  if (isElectron && window.electronAPI) {
    console.log('🚀 Ejecutando en Electron con API disponible');
    
    // Obtener versión de la app
    window.electronAPI.getVersion().then(version => {
      console.log(`📱 Versión de la app: ${version}`);
    }).catch(err => {
      console.log('ℹ️ No se pudo obtener la versión de la app:', err);
    });
  } else {
    console.log('🌐 Ejecutando en navegador web');
  }
});