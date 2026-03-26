const { ipcMain } = require('electron')
const { getDatabase } = require('../db')

function registerSaleHandlers() {
  const db = () => getDatabase()

  /**
   * POST /sales — registra una venta completa (transacción atómica).
   * Descuenta stock y actualiza sales_count en una sola operación.
   */
  ipcMain.handle('sales:create', (_, saleData) => {
    const { items, paymentMethod, cardType, cashReceived } = saleData

    // Verificar stock antes de la transacción
    for (const item of items) {
      const product = db().prepare('SELECT stock FROM products WHERE id = ?').get(item.productId)
      if (!product || product.stock < item.quantity) {
        throw new Error(`Stock insuficiente para "${item.name}"`)
      }
    }

    const total = items.reduce((sum, item) => sum + item.subtotal, 0)
    const change = paymentMethod === 'efectivo' ? (cashReceived - total) : null

    let savedSale = null

    db().transaction(() => {
      // 1. Insertar cabecera de la venta
      const saleResult = db().prepare(`
        INSERT INTO sales (total, payment_method, card_type, cash_received, change_amount)
        VALUES (@total, @paymentMethod, @cardType, @cashReceived, @change)
      `).run({ total, paymentMethod, cardType: cardType || null, cashReceived: cashReceived || null, change })

      const saleId = saleResult.lastInsertRowid

      // 2. Insertar ítems y actualizar stock
      const insertItem = db().prepare(`
        INSERT INTO sale_items (sale_id, product_id, product_name, price, quantity, subtotal, is_variable_price, original_price)
        VALUES (@saleId, @productId, @productName, @price, @quantity, @subtotal, @isVariablePrice, @originalPrice)
      `)
      const updateStock = db().prepare(
        'UPDATE products SET stock = stock - @qty, sales_count = sales_count + @qty WHERE id = @id'
      )
      const insertMovement = db().prepare(
        'INSERT INTO stock_movements (product_id, delta, reason) VALUES (?, ?, ?)'
      )

      for (const item of items) {
        insertItem.run({
          saleId,
          productId:        item.productId,
          productName:      item.name,
          price:            item.price,
          quantity:         item.quantity,
          subtotal:         item.subtotal,
          isVariablePrice:  item.isVariablePrice ? 1 : 0,
          originalPrice:    item.originalPrice || null
        })
        updateStock.run({ qty: item.quantity, id: item.productId })
        insertMovement.run(item.productId, -item.quantity, `Venta #${saleId}`)
      }

      savedSale = _getSaleWithItems(db(), saleId)
    })()

    return savedSale
  })

  /** GET /sales — historial paginado */
  ipcMain.handle('sales:getAll', (_, { limit = 50, offset = 0 } = {}) => {
    const sales = db().prepare(
      'SELECT * FROM sales ORDER BY sold_at DESC LIMIT ? OFFSET ?'
    ).all(limit, offset)

    return sales.map(s => ({ ...s, items: _getItems(db(), s.id) }))
  })

  /** GET /sales/recent — últimas N ventas */
  ipcMain.handle('sales:getRecent', (_, count = 5) => {
    const sales = db().prepare(
      'SELECT * FROM sales ORDER BY sold_at DESC LIMIT ?'
    ).all(count)
    return sales.map(s => ({ ...s, items: _getItems(db(), s.id) }))
  })

  /** GET /sales/by-date — ventas de un día exacto (YYYY-MM-DD) */
  ipcMain.handle('sales:getByDate', (_, date) => {
    const sales = db().prepare(
      "SELECT * FROM sales WHERE date(sold_at) = ? ORDER BY sold_at ASC"
    ).all(date)
    return sales.map(s => ({ ...s, items: _getItems(db(), s.id) }))
  })

  /** GET /sales/by-range — ventas entre dos fechas (YYYY-MM-DD) */
  ipcMain.handle('sales:getByRange', (_, { start, end }) => {
    const sales = db().prepare(
      "SELECT * FROM sales WHERE date(sold_at) BETWEEN ? AND ? ORDER BY sold_at ASC"
    ).all(start, end)
    return sales.map(s => ({ ...s, items: _getItems(db(), s.id) }))
  })

  /** GET /sales/summary-today — resumen de ventas de hoy por método de pago */
  ipcMain.handle('sales:getSummaryToday', () => {
    const today = new Date().toISOString().split('T')[0]
    return db().prepare(`
      SELECT
        payment_method,
        card_type,
        COUNT(*) as count,
        SUM(total) as total
      FROM sales
      WHERE date(sold_at) = ?
      GROUP BY payment_method, card_type
    `).all(today)
  })

  /** DELETE /sales/by-date — elimina todas las ventas de un día */
  ipcMain.handle('sales:deleteByDate', (_, date) => {
    const result = db().prepare(
      "DELETE FROM sales WHERE date(sold_at) = ?"
    ).run(date)
    return { deleted: result.changes }
  })
}

function _getItems(db, saleId) {
  return db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId)
}

function _getSaleWithItems(db, saleId) {
  const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId)
  if (!sale) return null
  return { ...sale, items: _getItems(db, saleId) }
}

module.exports = { registerSaleHandlers }
