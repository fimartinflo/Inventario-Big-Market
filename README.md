# Inventario Big Market (O para cualquier negocio)

Sistema de escritorio desarrollado con Electron para la gestión de inventario y ventas en negocios pequeños y minimarkets.
La aplicación funciona completamente offline y permite administrar productos, stock y movimientos diarios de manera simple y rápida.

---

##  Descripción

Inventario Big Market es una aplicación pensada para negocios de barrio que necesitan:

* Controlar stock de productos
* Registrar ventas
* Consultar reportes básicos
* Operar sin conexión a internet

El sistema fue diseñado para ser liviano, fácil de usar y ejecutarse localmente en Windows.

---

##  Tecnologías utilizadas

* Electron
* Node.js
* JavaScript
* HTML/CSS
* JSON / almacenamiento local

---

##  Estructura del proyecto

```
Inventario/
│
├── src/                # Código fuente principal
├── package.json        # Configuración del proyecto
├── package-lock.json   # Dependencias exactas
└── .gitignore          # Archivos excluidos del repositorio
```

---

##  Instalación y ejecución (modo desarrollo)

### 1) Clonar el repositorio

```bash
git clone https://github.com/fimartinflo/Inventario-Big-Market.git
```

### 2) Entrar al proyecto

```bash
cd Inventario-Big-Market
```

### 3) Instalar dependencias

```bash
npm install
```

### 4) Ejecutar la aplicación

```bash
npm start
```

---

## Generar versión ejecutable (build)

```bash
npm run build
```

El instalador se generará en la carpeta:

```
dist/
```

> Nota: La carpeta `dist/` no se sube a GitHub porque contiene archivos compilados.

---

## Características principales

* Gestión de productos
* Control de stock
* Registro de ventas
* Funcionamiento offline
* Aplicación de escritorio para Windows
* Interfaz simple enfocada en negocios pequeños

---

Archivos excluidos del repositorio

Por buenas prácticas, no se suben:

* `node_modules/`
* `dist/`
* `build/`
* Archivos ejecutables
* Configuraciones locales

Esto mantiene el repositorio liviano y profesional.

---

Estado del proyecto

Versión actual: 1.2.5
El sistema sigue en crecimiento y puede ampliarse con:

* Reportes más avanzados
* Control de usuarios/roles
* Integración con base de datos
* Panel administrativo

---

Autor

Desarrollado por Felipe Martínez como solución real para gestión de inventario en negocios locales.

Proyecto utilizado como práctica profesional y mejora continua en desarrollo de aplicaciones de escritorio con Electron.
