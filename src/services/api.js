import { supabase } from './supabase'

/**
 * Hizmetleri listeler.
 */
export async function fetchServices() {
  if (!supabase) return { data: null, error: new Error('Supabase env eksik') }
  return await supabase.from('services').select('id, isim, fiyat, sure_dakika, aciklama').order('isim')
}

/**
 * Aktif berberleri listeler.
 */
export async function fetchBarbers() {
  if (!supabase) return { data: null, error: new Error('Supabase env eksik') }
  return await supabase.from('barbers').select('id, isim, uzmanlik_alani, fotograf_url, aktif_mi').eq('aktif_mi', true).order('isim')
}

/**
 * Bir gün + berber için randevuları listeler.
 * Not: Faz 1 RLS anon SELECT'e izin veriyor.
 */
export async function fetchAppointmentsForDay({ date, barberId }) {
  if (!supabase) return { data: null, error: new Error('Supabase env eksik') }
  return await supabase
    .from('appointments')
    .select('id, saat, durum, service_id, services ( sure_dakika )')
    .eq('tarih', date)
    .eq('barber_id', barberId)
    .neq('durum', 'iptal')
}

/**
 * Randevu oluşturur (durum: bekliyor).
 */
export async function createAppointment(payload) {
  if (!supabase) return { data: null, error: new Error('Supabase env eksik') }
  return await supabase.from('appointments').insert(payload).select('id, takip_kodu').single()
}

/**
 * Telefon numarası ile randevuları listeler.
 * Not: Telefon uygulama tarafında formatlanıp (05xxxxxxxxx) gönderilmelidir.
 */
export async function fetchAppointmentsByPhone({ phone }) {
  if (!supabase) return { data: null, error: new Error('Supabase env eksik') }
  return await supabase
    .from('appointments')
    .select('id, takip_kodu, tarih, saat, durum, notlar, services ( isim, sure_dakika, fiyat ), barbers ( isim )')
    .eq('telefon', phone)
    .neq('durum', 'iptal')
    .order('tarih', { ascending: false })
    .order('saat', { ascending: false })
}

/**
 * Takip kodu ile tek randevu getirir.
 */
export async function fetchAppointmentByTrackingCode({ code }) {
  if (!supabase) return { data: null, error: new Error('Supabase env eksik') }
  return await supabase
    .from('appointments')
    .select(
      'id, takip_kodu, musteri_adi, telefon, tarih, saat, durum, notlar, services ( isim, sure_dakika, fiyat ), barbers ( isim )'
    )
    .eq('takip_kodu', code)
    .maybeSingle()
}

/**
 * Yönetim paneli için: belirli bir günde tüm randevuları listeler (iptal hariç).
 * RLS: authenticated SELECT izni gerektirir.
 */
export async function fetchAppointmentsAdmin({ date, barberId }) {
  if (!supabase) return { data: null, error: new Error('Supabase env eksik') }
  let q = supabase
    .from('appointments')
    .select(
      'id, takip_kodu, musteri_adi, telefon, tarih, saat, durum, notlar, barber_id, service_id, services ( isim, sure_dakika, fiyat ), barbers ( isim )'
    )
    .eq('tarih', date)
    .neq('durum', 'iptal')
    .order('saat', { ascending: true })

  if (barberId) q = q.eq('barber_id', barberId)

  return await q
}

/**
 * Yönetim paneli: randevu durum güncelle.
 */
export async function updateAppointmentStatus({ id, durum }) {
  if (!supabase) return { data: null, error: new Error('Supabase env eksik') }
  return await supabase.from('appointments').update({ durum }).eq('id', id).select('id, durum').single()
}

/**
 * Raporlama: Tarih aralığında onaylı/tamamlanan randevular (ciro ve gruplama için).
 */
export async function fetchAdminStatsAppointments({ startDate, endDate }) {
  if (!supabase) return { data: null, error: new Error('Supabase env eksik') }
  return await supabase
    .from('appointments')
    .select('id, barber_id, service_id, services ( isim, fiyat ), barbers ( isim )')
    .gte('tarih', startDate)
    .lte('tarih', endDate)
    .in('durum', ['onaylandı', 'tamamlandı'])
}

/**
 * Müşteri listesi: Benzersiz (telefon, musteri_adi) – son randevulardan.
 */
export async function fetchAdminCustomerList() {
  if (!supabase) return { data: null, error: new Error('Supabase env eksik') }
  const { data, error } = await supabase
    .from('appointments')
    .select('musteri_adi, telefon, created_at')
    .order('created_at', { ascending: false })
    .limit(500)
  if (error) return { data: null, error }
  const byPhone = new Map()
  for (const row of data || []) {
    if (!row.telefon) continue
    if (!byPhone.has(row.telefon)) byPhone.set(row.telefon, { telefon: row.telefon, musteri_adi: row.musteri_adi })
  }
  return { data: Array.from(byPhone.values()), error: null }
}

/**
 * Bir müşterinin tüm randevu geçmişi (iptal dahil).
 */
export async function fetchAdminAppointmentsByPhone({ phone }) {
  if (!supabase) return { data: null, error: new Error('Supabase env eksik') }
  return await supabase
    .from('appointments')
    .select('id, tarih, saat, durum, notlar, services ( isim, fiyat ), barbers ( isim )')
    .eq('telefon', phone)
    .order('tarih', { ascending: false })
    .order('saat', { ascending: false })
}

