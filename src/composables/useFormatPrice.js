/**
 * Formatea y parsea precios en pesos chilenos (enteros).
 */
export function useFormatPrice() {
  /**
   * Formatea un número entero a string de precio chileno.
   * @param {number} value  — precio en pesos (entero)
   * @returns {string}      — ej. "$1.250"
   */
  function formatPrice(value) {
    if (value === null || value === undefined || isNaN(value)) return '$0'
    return '$' + Math.round(value).toLocaleString('es-CL')
  }

  /**
   * Parsea un string de precio a número entero.
   * Acepta: "1250", "$1.250", "1.250", "1,250"
   * @param {string|number} value
   * @returns {number}
   */
  function parsePrice(value) {
    if (typeof value === 'number') return Math.round(value)
    if (!value) return 0
    const cleaned = String(value).replace(/[^0-9]/g, '')
    const num = parseInt(cleaned, 10)
    return isNaN(num) ? 0 : num
  }

  return { formatPrice, parsePrice }
}
