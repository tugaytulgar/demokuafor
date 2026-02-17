/**
 * WhatsApp iş numarasına yönlendirme (wa.me).
 * .env.local içinde VITE_WHATSAPP_NUMBER=905321234567 şeklinde tanımlayın (başında 90, 0 yok).
 */

const DEFAULT_NUMBER = '905321234567'

/** Ortamdan WhatsApp numarası (sadece rakam, 90 ile başlar). */
export function getWhatsAppNumber() {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER
  if (!raw || typeof raw !== 'string') return DEFAULT_NUMBER
  const digits = raw.replace(/\D/g, '')
  if (digits.length >= 10) return digits.startsWith('90') ? digits : '90' + digits
  return DEFAULT_NUMBER
}

/**
 * wa.me linki – sorunuz varsa WhatsApp'tan yazın.
 * @param {string} [prefill] - Önceden doldurulacak mesaj (opsiyonel)
 * @returns {string} URL
 */
export function getWhatsAppUrl(prefill = '') {
  const num = getWhatsAppNumber()
  const base = `https://wa.me/${num}`
  if (!prefill || !prefill.trim()) return base
  return `${base}?text=${encodeURIComponent(prefill.trim())}`
}
