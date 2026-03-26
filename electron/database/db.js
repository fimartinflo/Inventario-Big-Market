const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

let _db = null

function getDatabase() {
  if (_db) return _db

  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'inventario.db')

  _db = new Database(dbPath)
  _db.pragma('journal_mode = WAL')    // Mejor rendimiento en escrituras concurrentes
  _db.pragma('foreign_keys = ON')     // Integridad referencial

  console.log('📦 Base de datos SQLite en:', dbPath)
  return _db
}

function closeDatabase() {
  if (_db) {
    _db.close()
    _db = null
  }
}

module.exports = { getDatabase, closeDatabase }
