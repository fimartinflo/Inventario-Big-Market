const { app, BrowserWindow, Menu, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      enableRemoteModule: false,
      webSecurity: false // Importante para cargar recursos externos
    },
    title: 'Inventario Minimarket - By Felipe Martínez',
    show: false // No mostrar hasta que esté listo
  });

  // SOLUCIÓN: Usar path.resolve para rutas absolutas correctas
  const htmlPath = path.resolve(__dirname, 'src', 'index.html');
  
  console.log('📁 Directorio actual:', __dirname);
  console.log('🔍 Buscando HTML en:', htmlPath);
  console.log('📄 ¿Existe el archivo?:', fs.existsSync(htmlPath) ? 'SÍ ✅' : 'NO ❌');

  // Verificar estructura de carpetas
  console.log('📂 Estructura de carpetas:');
  try {
    const items = fs.readdirSync(__dirname);
    console.log('   -', items.join('\n   - '));
    
    if (fs.existsSync(path.join(__dirname, 'src'))) {
      const srcItems = fs.readdirSync(path.join(__dirname, 'src'));
      console.log('   - src/:', srcItems.join(', '));
    }
  } catch (error) {
    console.log('   Error leyendo directorio:', error.message);
  }

  if (fs.existsSync(htmlPath)) {
    console.log('✅ Cargando HTML...');
    
    // SOLUCIÓN: Usar loadFile con la ruta correcta
    mainWindow.loadFile(htmlPath).then(() => {
      console.log('✅ HTML cargado exitosamente');
      mainWindow.show(); // Mostrar ventana cuando esté lista
    }).catch(error => {
      console.error('❌ Error cargando HTML:', error);
      showErrorPage(error, htmlPath);
    });
  } else {
    console.error('❌ Archivo HTML no encontrado');
    createFallbackHTML();
    showErrorPage(new Error('Archivo no encontrado'), htmlPath);
  }

  // ⚠️ COMENTADO: No abrir DevTools automáticamente
  // mainWindow.webContents.openDevTools();

  createMenu();
}

function showErrorPage(error, htmlPath) {
  const errorHTML = `
    <html>
      <head>
        <title>Error - Inventario Minimarket</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
          }
          .container {
            max-width: 800px;
            margin: 50px auto;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
          }
          h1 { font-size: 2.5em; margin-bottom: 20px; color: #ff6b6b; }
          pre { 
            background: rgba(0,0,0,0.3); 
            padding: 20px; 
            border-radius: 5px; 
            text-align: left; 
            overflow-x: auto;
            font-size: 12px;
          }
          .btn {
            background: #4CAF50;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            font-size: 1.1em;
            cursor: pointer;
            margin: 10px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>⚠️ Error al Cargar la Aplicación</h1>
          <p><strong>Error:</strong> ${error.message}</p>
          <p><strong>Ruta intentada:</strong> ${htmlPath}</p>
          
          <h3>Archivos en el directorio actual:</h3>
          <pre>${getDirectoryStructure()}</pre>
          
          <div>
            <button class="btn" onclick="location.reload()">🔄 Recargar</button>
            <button class="btn" onclick="window.close()">❌ Cerrar</button>
          </div>
        </div>
      </body>
    </html>
  `;
  
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`).then(() => {
    mainWindow.show();
  });
}

function createFallbackHTML() {
  const srcDir = path.join(__dirname, 'src');
  const htmlPath = path.join(srcDir, 'index.html');
  
  // Crear directorio src si no existe
  if (!fs.existsSync(srcDir)) {
    fs.mkdirSync(srcDir, { recursive: true });
    console.log('✅ Directorio src creado');
  }
  
  // Crear archivo HTML básico
  const basicHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inventario Minimarket</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
        }
        .container {
            max-width: 800px;
            margin: 100px auto;
            background: rgba(255,255,255,0.1);
            padding: 40px;
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 2.5em; margin-bottom: 20px; }
        p { font-size: 1.2em; margin-bottom: 30px; }
        .btn {
            background: #4CAF50;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 5px;
            font-size: 1.1em;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 ¡Electron Funcionando!</h1>
        <p>La aplicación Inventario Minimarket se está ejecutando correctamente en Electron.</p>
        <p><strong>Desarrollado por Felipe Martínez</strong></p>
        <p>Ahora puedes reemplazar este archivo con tu HTML completo.</p>
        <button class="btn" onclick="alert('¡Electron está funcionando correctamente!')">
            Probar JavaScript
        </button>
    </div>
    
    <script>
        console.log('✅ Aplicación Electron cargada correctamente');
        // Aquí irá tu código JavaScript original
    </script>
</body>
</html>`;
  
  fs.writeFileSync(htmlPath, basicHTML);
  console.log('✅ Archivo HTML básico creado en:', htmlPath);
}

function getDirectoryStructure() {
  try {
    const items = fs.readdirSync(__dirname, { withFileTypes: true });
    let structure = `📁 ${__dirname}\n\n`;
    
    items.forEach(item => {
      if (item.isDirectory()) {
        structure += `[DIR] ${item.name}/\n`;
        
        // Listar contenido de src si existe
        if (item.name === 'src') {
          const srcPath = path.join(__dirname, 'src');
          try {
            const srcItems = fs.readdirSync(srcPath);
            srcItems.forEach(srcItem => {
              structure += `  📄 ${srcItem}\n`;
            });
          } catch (e) {
            structure += `  (error al leer: ${e.message})\n`;
          }
        }
      } else {
        structure += `[FILE] ${item.name}\n`;
      }
    });
    
    return structure;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

function createMenu() {
  const template = [
    {
      label: 'Archivo',
      submenu: [
        {
          label: 'Recargar',
          accelerator: 'Ctrl+R',
          click: () => {
            mainWindow.reload();
          }
        },
        {
          label: 'Herramientas Desarrollo',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        {
          label: 'Salir',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click() {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Deshacer' },
        { role: 'redo', label: 'Rehacer' },
        { type: 'separator' },
        { role: 'cut', label: 'Cortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Pegar' }
      ]
    },
    {
      label: 'Vista',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Forzar Recarga' },
        { role: 'toggleDevTools', label: 'Herramientas Desarrollo' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom Normal' },
        { role: 'zoomIn', label: 'Acercar' },
        { role: 'zoomOut', label: 'Alejar' }
      ]
    },
    {
      label: 'Ayuda',
      submenu: [
        {
          label: 'Acerca de',
          click() {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de',
              message: 'Inventario Minimarket',
              detail: 'Sistema de gestión de inventario y ventas\nVersión 1.2.5\nDesarrollado por Felipe Martínez'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});