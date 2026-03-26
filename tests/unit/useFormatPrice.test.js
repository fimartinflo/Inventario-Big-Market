import { describe, it, expect } from 'vitest'
import { useFormatPrice } from '../../src/composables/useFormatPrice'

const { formatPrice, parsePrice } = useFormatPrice()

describe('formatPrice', () => {
  it('formats zero', () => {
    expect(formatPrice(0)).toBe('$0')
  })

  it('formats integer', () => {
    expect(formatPrice(1250)).toBe('$1.250')
  })

  it('formats large number', () => {
    expect(formatPrice(1000000)).toBe('$1.000.000')
  })

  it('rounds floats', () => {
    expect(formatPrice(1250.9)).toBe('$1.251')
  })

  it('handles null', () => {
    expect(formatPrice(null)).toBe('$0')
  })

  it('handles undefined', () => {
    expect(formatPrice(undefined)).toBe('$0')
  })

  it('handles NaN', () => {
    expect(formatPrice(NaN)).toBe('$0')
  })
})

describe('parsePrice', () => {
  it('parses plain integer string', () => {
    expect(parsePrice('1250')).toBe(1250)
  })

  it('parses formatted Chilean price', () => {
    expect(parsePrice('$1.250')).toBe(1250)
  })

  it('parses price with dots', () => {
    expect(parsePrice('1.000.000')).toBe(1000000)
  })

  it('returns 0 for empty string', () => {
    expect(parsePrice('')).toBe(0)
  })

  it('returns 0 for null', () => {
    expect(parsePrice(null)).toBe(0)
  })

  it('passthrough for number input', () => {
    expect(parsePrice(999)).toBe(999)
  })

  it('rounds float input', () => {
    expect(parsePrice(99.9)).toBe(100)
  })

  it('returns 0 for non-numeric string', () => {
    expect(parsePrice('abc')).toBe(0)
  })
})
