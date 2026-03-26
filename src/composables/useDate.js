/**
 * Utilidades de formato de fecha para la app.
 * Todas las fechas se guardan en SQLite como ISO 8601 (UTC).
 */
export function useDate() {
  /**
   * Formatea un ISO timestamp a "DD/MM/YYYY HH:mm"
   * @param {string} isoString
   * @returns {string}
   */
  function formatDate(isoString) {
    if (!isoString) return ''
    const d = new Date(isoString)
    if (isNaN(d)) return isoString
    const dd   = String(d.getDate()).padStart(2, '0')
    const mm   = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh   = String(d.getHours()).padStart(2, '0')
    const min  = String(d.getMinutes()).padStart(2, '0')
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`
  }

  /**
   * Formatea solo la fecha: "DD/MM/YYYY"
   */
  function formatDateShort(isoString) {
    if (!isoString) return ''
    const d = new Date(isoString)
    if (isNaN(d)) return isoString
    const dd   = String(d.getDate()).padStart(2, '0')
    const mm   = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  }

  /**
   * Retorna la fecha de hoy en formato YYYY-MM-DD (para inputs type=date).
   */
  function todayISO() {
    return new Date().toISOString().split('T')[0]
  }

  /**
   * Primer día del mes actual en YYYY-MM-DD.
   */
  function firstDayOfMonthISO() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  }

  return { formatDate, formatDateShort, todayISO, firstDayOfMonthISO }
}
