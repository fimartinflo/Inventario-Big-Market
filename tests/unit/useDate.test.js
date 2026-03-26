import { describe, it, expect } from 'vitest'
import { useDate } from '../../src/composables/useDate'

const { formatDate, formatDateShort, todayISO, firstDayOfMonthISO } = useDate()

describe('formatDate', () => {
  it('formats ISO datetime', () => {
    expect(formatDate('2024-03-15T14:30:00')).toBe('15/03/2024 14:30')
  })

  it('returns empty string for null', () => {
    expect(formatDate(null)).toBe('')
  })

  it('returns empty string for undefined', () => {
    expect(formatDate(undefined)).toBe('')
  })

  it('handles date without time', () => {
    const result = formatDate('2024-01-01')
    expect(result).toMatch(/01\/01\/2024/)
  })
})

describe('formatDateShort', () => {
  it('formats to DD/MM/YYYY', () => {
    expect(formatDateShort('2024-12-31T00:00:00')).toBe('31/12/2024')
  })

  it('returns empty for null', () => {
    expect(formatDateShort(null)).toBe('')
  })
})

describe('todayISO', () => {
  it('returns YYYY-MM-DD format', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('is a valid date', () => {
    const d = new Date(todayISO())
    expect(isNaN(d.getTime())).toBe(false)
  })
})

describe('firstDayOfMonthISO', () => {
  it('returns YYYY-MM-01', () => {
    expect(firstDayOfMonthISO()).toMatch(/^\d{4}-\d{2}-01$/)
  })

  it('starts with same year-month as today', () => {
    const today = todayISO()
    const firstDay = firstDayOfMonthISO()
    expect(firstDay.slice(0, 7)).toBe(today.slice(0, 7))
  })
})
