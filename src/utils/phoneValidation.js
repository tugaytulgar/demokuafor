/**
 * Türkiye telefon formatı validasyonu (+90 / 05xx).
 * kuaforrules: Phone numbers must be validated for Turkish format.
 */

/** 05xxxxxxxxx veya +90 5xxxxxxxxx (10 haneli cep) */
const TURKISH_PHONE_REGEX = /^(\+90|0)?\s*5\d{9}$/

/**
 * Telefon numarasını normalize eder (sadece rakamlar).
 * @param {string} value
 * @returns {string}
 */
export function normalizePhone(value) {
  if (!value || typeof value !== 'string') return ''
  return value.replace(/\D/g, '')
}

/**
 * Türk cep telefonu formatında mı kontrol eder (+90 / 05xx).
 * @param {string} value – 05xxxxxxxxx veya +905xxxxxxxxx
 * @returns {boolean}
 */
export function isValidTurkishPhone(value) {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  if (TURKISH_PHONE_REGEX.test(trimmed)) return true
  const normalized = normalizePhone(trimmed)
  return /^5\d{9}$/.test(normalized) || /^05\d{9}$/.test(normalized) || /^905\d{9}$/.test(normalized)
}
