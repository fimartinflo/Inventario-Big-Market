const { ipcMain } = require('electron')
const { getDatabase } = require('../db')

function registerProductHandlers() {
  const db = () => getDatabase()

  /** GET /products — todos los productos */
  ipcMain.handle('products:getAll', () => {
    return db().prepare('SELECT * FROM products ORDER BY name ASC').all()
  })

  /** GET /products/:id */
  ipcMain.handle('products:getById', (_, id) => {
    return db().prepare('SELECT * FROM products WHERE id = ?').get(id) || null
  })

  /** POST /products */
  ipcMain.handle('products:create', (_, product) => {
    const stmt = db().prepare(`
      INSERT INTO products (name, category, barcode, stock, price, description, supplier)
      VALUES (@name, @category, @barcode, @stock, @price, @description, @supplier)
    `)
    const result = stmt.run({
      name:        product.name.trim(),
      category:    product.category,
      barcode:     product.barcode?.trim() || null,
      stock:       product.stock,
      price:       product.price,
      description: product.description?.trim() || '',
      supplier:    product.supplier?.trim() || ''
    })
    return db().prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)
  })

  /** PUT /products/:id */
  ipcMain.handle('products:update', (_, product) => {
    db().prepare(`
      UPDATE products
      SET name=@name, category=@category, barcode=@barcode,
          stock=@stock, price=@price, description=@description, supplier=@supplier
      WHERE id=@id
    `).run({
      id:          product.id,
      name:        product.name.trim(),
      category:    product.category,
      barcode:     product.barcode?.trim() || null,
      stock:       product.stock,
      price:       product.price,
      description: product.description?.trim() || '',
      supplier:    product.supplier?.trim() || ''
    })
    return db().prepare('SELECT * FROM products WHERE id = ?').get(product.id)
  })

  /** DELETE /products/:id */
  ipcMain.handle('products:delete', (_, id) => {
    db().prepare('DELETE FROM products WHERE id = ?').run(id)
    return { success: true }
  })

  /** GET /products/low-stock */
  ipcMain.handle('products:getLowStock', () => {
    return db().prepare('SELECT * FROM products WHERE stock <= 3 ORDER BY stock ASC').all()
  })

  /** GET /products/categories */
  ipcMain.handle('products:getCategories', () => {
    return db().prepare('SELECT name FROM categories ORDER BY name ASC').all().map(r => r.name)
  })

  /** PATCH /products/:id/stock — ajuste manual de stock */
  ipcMain.handle('products:adjustStock', (_, { id, delta, reason }) => {
    db().transaction(() => {
      db().prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(delta, id)
      db().prepare('INSERT INTO stock_movements (product_id, delta, reason) VALUES (?, ?, ?)').run(id, delta, reason)
    })()
    return db().prepare('SELECT * FROM products WHERE id = ?').get(id)
  })

  /** GET /products/stock-movements/:id */
  ipcMain.handle('products:getStockMovements', (_, productId) => {
    return db().prepare(
      'SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT 50'
    ).all(productId)
  })
}

module.exports = { registerProductHandlers }
