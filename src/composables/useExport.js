import * as XLSX from 'xlsx'
import { useFormatPrice } from './useFormatPrice'
import { useDate } from './useDate'

const { formatPrice } = useFormatPrice()
const { formatDate }  = useDate()

/**
 * Exporta datos de ventas o inventario a Excel (.xlsx).
 */
export function useExport() {

  /**
   * Exporta un rango de ventas a Excel.
   * @param {Array}  sales     — array de ventas con items[]
   * @param {string} filename  — nombre del archivo (sin extensión)
   */
  function exportSalesToExcel(sales, filename = 'ventas') {
    // Hoja 1: resumen por venta
    const summaryRows = sales.map(s => ({
      'ID':              s.id,
      'Fecha':           formatDate(s.sold_at),
      'Total':           s.total,
      'Método de pago':  s.payment_method,
      'Tipo tarjeta':    s.card_type || '',
      'Efectivo recibido': s.cash_received || '',
      'Vuelto':          s.change_amount || ''
    }))

    // Hoja 2: detalle de ítems
    const itemRows = []
    for (const s of sales) {
      for (const item of (s.items || [])) {
        itemRows.push({
          'ID Venta':   s.id,
          'Fecha':      formatDate(s.sold_at),
          'Producto':   item.product_name,
          'Precio':     item.price,
          'Cantidad':   item.quantity,
          'Subtotal':   item.subtotal
        })
      }
    }

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Ventas')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(itemRows),    'Detalle')
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  /**
   * Exporta el inventario completo a Excel.
   * @param {Array}  products
   * @param {string} filename
   */
  function exportInventoryToExcel(products, filename = 'inventario') {
    const rows = products.map(p => ({
      'ID':          p.id,
      'Nombre':      p.name,
      'Categoría':   p.category,
      'Código barras': p.barcode || '',
      'Stock':       p.stock,
      'Precio':      p.price,
      'Ventas':      p.sales_count,
      'Proveedor':   p.supplier || '',
      'Descripción': p.description || '',
      'Creado':      formatDate(p.created_at)
    }))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Inventario')
    XLSX.writeFile(wb, `${filename}.xlsx`)
  }

  return { exportSalesToExcel, exportInventoryToExcel }
}
