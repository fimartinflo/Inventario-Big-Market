const { ipcMain } = require('electron')
const { getDatabase } = require('../db')

function registerReportHandlers() {
  const db = () => getDatabase()

  /** GET /reports/top-products — top N productos más vendidos en un rango */
  ipcMain.handle('reports:topProducts', (_, { start, end, limit = 10 }) => {
    return db().prepare(`
      SELECT
        si.product_id,
        si.product_name  AS name,
        p.category,
        SUM(si.quantity) AS units_sold,
        SUM(si.subtotal) AS revenue
      FROM sale_items si
      LEFT JOIN products p ON p.id = si.product_id
      JOIN sales s ON s.id = si.sale_id
      WHERE date(s.sold_at) BETWEEN ? AND ?
      GROUP BY si.product_id, si.product_name
      ORDER BY units_sold DESC
      LIMIT ?
    `).all(start, end, limit)
  })

  /** GET /reports/by-category — ventas agrupadas por categoría */
  ipcMain.handle('reports:byCategory', (_, { start, end }) => {
    return db().prepare(`
      SELECT
        COALESCE(p.category, 'Sin categoría') AS category,
        SUM(si.quantity)                       AS units_sold,
        SUM(si.subtotal)                       AS revenue
      FROM sale_items si
      LEFT JOIN products p ON p.id = si.product_id
      JOIN sales s ON s.id = si.sale_id
      WHERE date(s.sold_at) BETWEEN ? AND ?
      GROUP BY category
      ORDER BY revenue DESC
    `).all(start, end)
  })

  /** GET /reports/by-hour — ventas por hora del día (heatmap) */
  ipcMain.handle('reports:byHour', (_, { start, end }) => {
    return db().prepare(`
      SELECT
        CAST(strftime('%H', sold_at) AS INTEGER) AS hour,
        COUNT(*)                                  AS count,
        SUM(total)                                AS total
      FROM sales
      WHERE date(sold_at) BETWEEN ? AND ?
      GROUP BY hour
      ORDER BY hour ASC
    `).all(start, end)
  })

  /** GET /reports/daily-totals — totales por día en un rango */
  ipcMain.handle('reports:dailyTotals', (_, { start, end }) => {
    return db().prepare(`
      SELECT
        date(sold_at)   AS date,
        COUNT(*)        AS count,
        SUM(total)      AS total
      FROM sales
      WHERE date(sold_at) BETWEEN ? AND ?
      GROUP BY date(sold_at)
      ORDER BY date ASC
    `).all(start, end)
  })

  /** GET /reports/payment-summary — resumen por método de pago */
  ipcMain.handle('reports:paymentSummary', (_, { start, end }) => {
    return db().prepare(`
      SELECT
        payment_method,
        card_type,
        COUNT(*)   AS count,
        SUM(total) AS total
      FROM sales
      WHERE date(sold_at) BETWEEN ? AND ?
      GROUP BY payment_method, card_type
      ORDER BY total DESC
    `).all(start, end)
  })

  /** GET /reports/inventory-value — valor total del inventario */
  ipcMain.handle('reports:inventoryValue', () => {
    return db().prepare(`
      SELECT
        category,
        COUNT(*)          AS product_count,
        SUM(stock)        AS total_stock,
        SUM(stock*price)  AS total_value
      FROM products
      GROUP BY category
      ORDER BY total_value DESC
    `).all()
  })
}

module.exports = { registerReportHandlers }
