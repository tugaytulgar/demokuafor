/**
 * SMS altyapısı – Netgsm / MutluCell entegrasyonu için hazırlık.
 * API anahtarını .env.local içinde tanımlayın (örn. VITE_NETGSM_* veya backend'de).
 * Şu an sadece şablonlar ve arayüz; gerçek gönderim backend veya Edge Function ile yapılmalı.
 */

/** Şablon tipleri */
export const SMS_TEMPLATE = {
  ONAY: 'onay',
  HATIRLATMA: 'hatirlatma',
  IPTAL: 'iptal',
}

/**
 * SMS metni şablonları. Placeholder'lar: {musteri_adi}, {tarih}, {saat}, {takip_kodu}, {hizmet}
 * @param {string} type - 'onay' | 'hatirlatma' | 'iptal'
 * @param {object} vars - { musteri_adi, tarih, saat, takip_kodu, hizmet }
 * @returns {string} Gönderime hazır mesaj
 */
export function getSmsTemplate(type, vars = {}) {
  const {
    musteri_adi = 'Müşteri',
    tarih = '',
    saat = '',
    takip_kodu = '',
    hizmet = 'Randevu',
  } = vars

  const templates = {
    [SMS_TEMPLATE.ONAY]:
      `${musteri_adi}, randevunuz onaylandı: ${tarih} ${saat}. Takip: ${takip_kodu}. Sorularınız için bizi arayın.`,
    [SMS_TEMPLATE.HATIRLATMA]:
      `Hatırlatma: Yarın ${tarih} saat ${saat} randevunuz var (${hizmet}). Takip: ${takip_kodu}.`,
    [SMS_TEMPLATE.IPTAL]:
      `${musteri_adi}, ${tarih} ${saat} tarihli randevunuz iptal edilmiştir. Yeni randevu için bizi arayın.`,
  }

  return templates[type] || ''
}

/**
 * Türkiye telefon numarasını SMS/API formatına çevirir (90XXXXXXXXX, başında 0 yok).
 * @param {string} phone - 05xxxxxxxxx veya +90 5xx
 * @returns {string}
 */
export function normalizePhoneForSms(phone) {
  if (!phone || typeof phone !== 'string') return ''
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('90') && digits.length >= 12) return digits
  if (digits.startsWith('0') && digits.length >= 10) return '9' + digits
  if (digits.length >= 10) return '90' + digits
  return ''
}

/**
 * SMS gönderimi – placeholder. Gerçek gönderim Netgsm/MutluCell API veya Supabase Edge Function ile yapılmalı.
 * Bu fonksiyon şu an sadece log atar; production'da backend'e istek atın.
 * @param {object} opts - { phone: string, message: string }
 * @returns {Promise<{ success: boolean, error?: string }>}
 */
export async function sendSms({ phone, message }) {
  const normalized = normalizePhoneForSms(phone)
  if (!normalized) {
    return { success: false, error: 'Geçersiz telefon numarası' }
  }
  if (!message || !message.trim()) {
    return { success: false, error: 'Mesaj boş' }
  }

  // TODO: Netgsm / MutluCell API çağrısı (env'den api key)
  // Örnek: const res = await fetch(NETGSM_URL, { method: 'POST', body: ... })
  if (import.meta.env.DEV) {
    console.debug('[smsService] sendSms (mock)', { phone: normalized, messageLength: message.length })
  }

  return { success: true }
}
