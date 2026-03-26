const { getDatabase } = require('./db')

/**
 * Crea todas las tablas si no existen (idempotente).
 * Se ejecuta al arrancar la app.
 */
function runMigrations() {
  const db = getDatabase()

  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      category    TEXT NOT NULL,
      barcode     TEXT UNIQUE,
      stock       INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
      price       INTEGER NOT NULL CHECK(price > 0),
      description TEXT DEFAULT '',
      supplier    TEXT DEFAULT '',
      sales_count INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sales (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      sold_at        TEXT NOT NULL DEFAULT (datetime('now')),
      total          INTEGER NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('efectivo','tarjeta','transferencia')),
      card_type      TEXT CHECK(card_type IN ('credito','debito') OR card_type IS NULL),
      cash_received  INTEGER,
      change_amount  INTEGER
    );

    CREATE TABLE IF NOT EXISTS sale_items (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id           INTEGER NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
      product_id        INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name      TEXT NOT NULL,
      price             INTEGER NOT NULL,
      quantity          INTEGER NOT NULL CHECK(quantity > 0),
      subtotal          INTEGER NOT NULL,
      is_variable_price INTEGER NOT NULL DEFAULT 0,
      original_price    INTEGER
    );

    CREATE TABLE IF NOT EXISTS stock_movements (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      delta      INTEGER NOT NULL,
      reason     TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_sales_sold_at       ON sales(sold_at);
    CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id  ON sale_items(sale_id);
    CREATE INDEX IF NOT EXISTS idx_sale_items_prod_id  ON sale_items(product_id);
    CREATE INDEX IF NOT EXISTS idx_products_category   ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_barcode    ON products(barcode);
  `)

  _seedCategories(db)
  console.log('✅ Migraciones aplicadas correctamente')
}

function _seedCategories(db) {
  const defaults = ['Bebidas', 'Lácteos', 'Abarrotes', 'Limpieza', 'Snacks', 'Precio Variable', 'Otros']
  const insert = db.prepare('INSERT OR IGNORE INTO categories (name) VALUES (?)')
  for (const name of defaults) insert.run(name)
}

/**
 * Importa datos desde un backup JSON (formato legacy o nuevo).
 * Se usa tanto para migrar desde localStorage como para restaurar backups.
 */
function importFromJson(jsonData) {
  const db = getDatabase()
  const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData

  const products = data.inventory || data.products || []
  const sales    = data.sales    || []

  let importedProducts = 0
  let importedSales    = 0

  db.transaction(() => {
    const insertProduct = db.prepare(`
      INSERT OR IGNORE INTO products
        (id, name, category, barcode, stock, price, description, supplier, sales_count, created_at)
      VALUES
        (@id, @name, @category, @barcode, @stock, @price, @description, @supplier, @sales_count, @created_at)
    `)

    for (const p of products) {
      insertProduct.run({
        id:          p.id,
        name:        p.name || '',
        category:    p.category || 'Otros',
        barcode:     p.barcode || null,
        stock:       p.stock || 0,
        price:       p.price || 1,
        description: p.description || '',
        supplier:    p.supplier || '',
        sales_count: p.sales || 0,
        created_at:  _legacyDateToISO(p.createdDate) || new Date().toISOString()
      })
      importedProducts++
    }

    const insertSale = db.prepare(`
      INSERT OR IGNORE INTO sales
        (id, sold_at, total, payment_method, card_type, cash_received, change_amount)
      VALUES
        (@id, @sold_at, @total, @payment_method, @card_type, @cash_received, @change_amount)
    `)
    const insertItem = db.prepare(`
      INSERT INTO sale_items
        (sale_id, product_id, product_name, price, quantity, subtotal, is_variable_price, original_price)
      VALUES
        (@sale_id, @product_id, @product_name, @price, @quantity, @subtotal, @is_variable_price, @original_price)
    `)

    for (const s of sales) {
      insertSale.run({
        id:             s.id,
        sold_at:        _legacyDateToISO(s.date) || new Date().toISOString(),
        total:          s.total,
        payment_method: s.paymentMethod,
        card_type:      s.cardType || null,
        cash_received:  s.cashReceived || null,
        change_amount:  s.change || null
      })
      for (const item of (s.items || [])) {
        insertItem.run({
          sale_id:           s.id,
          product_id:        item.productId || null,
          product_name:      item.name,
          price:             item.price,
          quantity:          item.quantity,
          subtotal:          item.subtotal,
          is_variable_price: item.isVariablePrice ? 1 : 0,
          original_price:    item.originalPrice || null
        })
      }
      importedSales++
    }
  })()

  return { importedProducts, importedSales }
}

/** Convierte 'DD/MM/YYYY' a ISO 8601. */
function _legacyDateToISO(dateStr) {
  if (!dateStr) return null
  const parts = dateStr.split('/')
  if (parts.length !== 3) return null
  const [day, month, year] = parts
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00`
}

module.exports = { runMigrations, importFromJson }
