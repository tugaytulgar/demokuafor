/**
 * İş kuralları sabitleri (kuaforrules).
 * Randevu slotları 45 dk, mesai 09:00–21:00, öğle arası 12:00–13:00.
 */

/** Randevu slot süresi (dakika) */
export const SLOT_DURATION_MINUTES = 45

/** Mesai başlangıç saati (dakika, 00:00'dan itibaren) */
export const WORK_START_MINUTES = 9 * 60 // 09:00

/** Mesai bitiş saati (dakika, 00:00'dan itibaren) – 21:00 dahil değil, son slot 20:15 başlar */
export const WORK_END_MINUTES = 21 * 60 // 21:00

/** Öğle arası başlangıç (dakika) */
export const LUNCH_START_MINUTES = 12 * 60 // 12:00

/** Öğle arası bitiş (dakika) */
export const LUNCH_END_MINUTES = 13 * 60 // 13:00

/** Randevu durumları */
export const APPOINTMENT_STATUS = {
  BEKLIYOR: 'bekliyor',
  ONAYLANDI: 'onaylandı',
  TAMAMLANDI: 'tamamlandı',
  IPTAL: 'iptal',
}
