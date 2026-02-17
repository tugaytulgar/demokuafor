import { normalizePhone, isValidTurkishPhone as _isValid } from './phoneValidation'

export function isValidTurkishPhone(value) {
  return _isValid(value)
}

/**
 * Telefona tek bir format verir: 05xxxxxxxxx (11 hane)
 * - +90 / 90 prefix'ini kaldırır
 * - başında 0 yoksa ekler
 */
export function formatTurkishPhone(value) {
  const digits = normalizePhone(value)
  if (!digits) return ''
  let d = digits
  if (d.startsWith('90')) d = d.slice(2)
  if (d.startsWith('5')) d = `0${d}`
  return d
}

