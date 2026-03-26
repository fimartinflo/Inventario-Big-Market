const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')
const { runMigrations, importFromJson } = require('../database/migrations')
const { registerProductHandlers } = require('../database/handlers/products')
const { registerSaleHandlers }    = require('../database/handlers/sales')
const { registerReportHandlers }  = require('../database/handlers/reports')

const isDev = !app.isPackaged

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width:  1280,
    height: 800,
    minWidth:  900,
    minHeight: 600,
    webPreferences: {
      preload:          path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration:  false
    },
    icon: path.join(__dirname, '../../src/assets/icon.png'),
    show: false
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => mainWindow.show())
}

app.whenReady().then(() => {
  // Run DB migrations before anything else
  runMigrations()

  // Register all IPC handlers
  registerProductHandlers()
  registerSaleHandlers()
  registerReportHandlers()
  registerUtilHandlers()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── Utility handlers ──────────────────────────────────────────────────────────

function registerUtilHandlers() {
  /** Import JSON backup → SQLite */
  ipcMain.handle('app:importJson', async (_, jsonString) => {
    try {
      return importFromJson(jsonString)
    } catch (err) {
      throw new Error(`Error al importar: ${err.message}`)
    }
  })

  /** Open file picker dialog */
  ipcMain.handle('app:openFileDialog', async (_, options) => {
    const result = await dialog.showOpenDialog(mainWindow, options || {
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })
    return result
  })

  /** Save file dialog */
  ipcMain.handle('app:saveFileDialog', async (_, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options || {
      filters: [{ name: 'Excel', extensions: ['xlsx'] }],
      defaultPath: 'exportacion.xlsx'
    })
    return result
  })

  /** Write backup JSON to disk */
  ipcMain.handle('app:writeBackup', async (_, { path: filePath, data }) => {
    fs.writeFileSync(filePath, data, 'utf-8')
    return { success: true }
  })

  /** App version */
  ipcMain.handle('app:getVersion', () => app.getVersion())
}
