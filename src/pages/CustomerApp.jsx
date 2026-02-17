import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardCopy, Link2, MessageCircle, Scissors, User, Phone, StickyNote } from 'lucide-react'
import { motion } from 'framer-motion'

import { hasSupabaseEnv } from '../services/supabase'
import { useBarbers } from '../hooks/useBarbers'
import { useServices } from '../hooks/useServices'
import { useAppointmentsForDay } from '../hooks/useAppointmentsForDay'
import { createAppointment } from '../services/api'
import { APPOINTMENT_STATUS } from '../utils/constants'
import { formatDateInputValue, isSunday, todayDateInputValue } from '../utils/time'
import { formatTurkishPhone, isValidTurkishPhone } from '../utils/phone'
import { generateTrackingCode } from '../utils/tracking'
import { buildAppointmentIcs, downloadIcs } from '../utils/ics'
import { getWhatsAppUrl } from '../utils/whatsapp'

import { Card } from '../components/ui/Card'
import { Section } from '../components/ui/Section'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Textarea } from '../components/ui/Textarea'
import { SelectGrid } from '../components/booking/SelectGrid'
import { DatePicker } from '../components/booking/DatePicker'
import { SlotGrid } from '../components/booking/SlotGrid'
import { AppointmentLookup } from '../components/booking/AppointmentLookup'
import { AppointmentTracking } from '../components/booking/AppointmentTracking'
import { Toast } from '../components/ui/Toast'
import { ThemeToggle } from '../components/ui/ThemeToggle'

export default function CustomerApp() {
  const [activeView, setActiveView] = useState('new') // 'new' | 'lookup' | 'track'
  const [trackingFromUrl, setTrackingFromUrl] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState(null)
  const [selectedBarberId, setSelectedBarberId] = useState(null)
  const [selectedDate, setSelectedDate] = useState(todayDateInputValue())
  const [selectedTime, setSelectedTime] = useState(null)

  const [form, setForm] = useState({ name: '', phone: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [lastCreated, setLastCreated] = useState(null)

  const servicesState = useServices()
  const barbersState = useBarbers()

  const selectedService = useMemo(
    () => servicesState.data?.find((s) => s.id === selectedServiceId) ?? null,
    [servicesState.data, selectedServiceId]
  )
  const selectedBarber = useMemo(
    () => barbersState.data?.find((b) => b.id === selectedBarberId) ?? null,
    [barbersState.data, selectedBarberId]
  )

  const appointmentsState = useAppointmentsForDay({
    date: selectedDate,
    barberId: selectedBarberId,
    enabled: Boolean(selectedBarberId && selectedDate),
  })

  const isEnvOk = hasSupabaseEnv

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = String(params.get('track') || '').trim()
    if (code) {
      setTrackingFromUrl(code)
      setActiveView('track')
    }
  }, [])

  const canPickSlots =
    isEnvOk &&
    Boolean(selectedServiceId && selectedBarberId && selectedDate) &&
    !isSunday(selectedDate)

  const canSubmit =
    isEnvOk &&
    Boolean(selectedServiceId && selectedBarberId && selectedDate && selectedTime) &&
    form.name.trim().length >= 2 &&
    isValidTurkishPhone(form.phone) &&
    !submitting

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    try {
      const formattedPhone = formatTurkishPhone(form.phone)
      const takip_kodu = generateTrackingCode(10)
      const { data, error } = await createAppointment({
        musteri_adi: form.name.trim(),
        telefon: formattedPhone,
        notlar: form.notes.trim() || null,
        barber_id: selectedBarberId,
        service_id: selectedServiceId,
        tarih: selectedDate,
        saat: selectedTime,
        durum: APPOINTMENT_STATUS.BEKLIYOR,
        takip_kodu,
      })

      if (error) {
        const msg = String(error.message || error)
        const isRls =
          msg.toLowerCase().includes('row-level security') ||
          msg.toLowerCase().includes('violates row-level security') ||
          msg.toLowerCase().includes('rls')
        const isUnique =
          error.code === '23505' || msg.toLowerCase().includes('duplicate key') || msg.toLowerCase().includes('unique')
        if (isUnique) {
          throw new Error('Seçtiğiniz saat az önce doldu. Lütfen farklı bir saat seçin.')
        }
        if (isRls) {
          throw new Error(
            'Randevu oluşturma izni yok. Yönetim oturumu açık olabilir; Supabase’te `003_authenticated_insert_appointments.sql` policy’sini çalıştırın.'
          )
        }
        throw new Error(msg)
      }

      setToast({ type: 'success', title: 'Randevu alındı', message: 'Talebiniz başarıyla oluşturuldu.' })
      setLastCreated({
        id: data?.id,
        takip_kodu: data?.takip_kodu || takip_kodu,
        tarih: selectedDate,
        saat: selectedTime,
        service: selectedService,
        barber: selectedBarber,
      })
      setSelectedTime(null)
      setForm({ name: '', phone: '', notes: '' })
      await appointmentsState.refetch?.()
    } catch (err) {
      setToast({
        type: 'error',
        title: 'İşlem başarısız',
        message: err?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function copyTrackingCode() {
    if (!lastCreated?.takip_kodu) return
    await navigator.clipboard.writeText(lastCreated.takip_kodu)
    setToast({ type: 'success', title: 'Kopyalandı', message: 'Takip kodu panoya kopyalandı.' })
  }

  function addToCalendar() {
    if (!lastCreated?.takip_kodu || !lastCreated?.service) return
    const durationMinutes = Number(lastCreated.service?.sure_dakika || 45)
    const icsText = buildAppointmentIcs({
      trackingCode: lastCreated.takip_kodu,
      date: lastCreated.tarih,
      time: lastCreated.saat,
      durationMinutes,
      serviceName: lastCreated.service?.isim,
      barberName: lastCreated.barber?.isim,
    })
    downloadIcs({
      filename: `kuafor-randevu-${lastCreated.takip_kodu}.ics`,
      icsText,
    })
  }

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        <header className="relative mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-semibold leading-tight">
                  Online <span className="text-accent">Randevu</span>
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-xl">
                  Hizmet ve berber seçin, tarih ve saat belirleyin; randevunuz dakikalar içinde hazır.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-accent dark:text-gray-400 dark:hover:text-accent transition-colors"
                >
                  ← Ana sayfaya dön
                </Link>
              </div>
            </div>

            {!isEnvOk ? (
              <Card className="mt-4">
                <p className="text-sm text-red-200">
                  Supabase bağlantısı için `.env.local` eksik görünüyor. Dev serverı yeniden başlatıp tekrar deneyin.
                </p>
              </Card>
            ) : null}
          </motion.div>
        </header>
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-16">
        <Section
          title={activeView === 'new' ? 'Randevunu Oluştur' : activeView === 'lookup' ? 'Randevu Sorgula' : 'Randevu Takibi'}
          subtitle={
            activeView === 'new'
              ? 'Önce hizmeti ve berberi seç, sonra tarih ve saat belirle.'
              : activeView === 'lookup'
                ? 'Telefon numaran ile daha önce oluşturduğun randevuları görüntüle.'
                : 'Takip kodu ile randevu durumunu görüntüle.'
          }
        >
          <Card className="mb-6 p-2 sm:p-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setActiveView('new')}
                className={[
                  'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  activeView === 'new' ? 'bg-accent text-background' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-white/5 dark:text-text dark:hover:bg-white/10',
                ].join(' ')}
              >
                Yeni Randevu
              </button>
              <button
                type="button"
                onClick={() => setActiveView('lookup')}
                className={[
                  'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  activeView === 'lookup' ? 'bg-accent text-background' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-white/5 dark:text-text dark:hover:bg-white/10',
                ].join(' ')}
              >
                Randevu Sorgula
              </button>
              <button
                type="button"
                onClick={() => setActiveView('track')}
                className={[
                  'rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  activeView === 'track' ? 'bg-accent text-background' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-white/5 dark:text-text dark:hover:bg-white/10',
                ].join(' ')}
              >
                Takip
              </button>
            </div>
          </Card>

          {activeView === 'lookup' ? (
            <Card>
              <AppointmentLookup />
            </Card>
          ) : activeView === 'track' ? (
            <Card>
              <AppointmentTracking initialCode={trackingFromUrl} />
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 space-y-6">
                <Card>
                  <SelectGrid
                    title="Hizmet Seç"
                    icon={<Scissors className="h-5 w-5" />}
                    items={servicesState.data || []}
                    loading={servicesState.loading}
                    error={servicesState.error}
                    selectedId={selectedServiceId}
                    onSelect={(id) => {
                      setSelectedServiceId(id)
                      setSelectedTime(null)
                    }}
                    getItemTitle={(s) => s.isim}
                    getItemSubtitle={(s) => `${Number(s.fiyat).toFixed(0)}₺ • ${s.sure_dakika} dk`}
                  />
                </Card>

                <Card>
                  <SelectGrid
                    title="Berber Seç"
                    icon={<User className="h-5 w-5" />}
                    items={barbersState.data || []}
                    loading={barbersState.loading}
                    error={barbersState.error}
                    selectedId={selectedBarberId}
                    onSelect={(id) => {
                      setSelectedBarberId(id)
                      setSelectedTime(null)
                    }}
                    getItemTitle={(b) => b.isim}
                    getItemSubtitle={(b) => (b.uzmanlik_alani ? b.uzmanlik_alani : '—')}
                  />
                </Card>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <Card>
                  <div className="flex items-center gap-2 mb-4 text-accent">
                    <CalendarDays className="h-5 w-5" />
                    <h3 className="font-semibold">Tarih & Saat</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-4">
                      <DatePicker
                        value={selectedDate}
                        min={todayDateInputValue()}
                        onChange={(v) => {
                          setSelectedDate(v)
                          setSelectedTime(null)
                        }}
                        disabled={!isEnvOk}
                        warning={isSunday(selectedDate) ? 'Pazar günleri kapalı.' : null}
                      />
                    </div>
                    <div className="md:col-span-8">
                      <SlotGrid
                        enabled={canPickSlots}
                        selectedTime={selectedTime}
                        onSelectTime={setSelectedTime}
                        selectedService={selectedService}
                        appointments={appointmentsState.data || []}
                        loading={appointmentsState.loading}
                        error={appointmentsState.error}
                        date={selectedDate}
                      />
                    </div>
                  </div>
                </Card>

                <Card>
                  <form onSubmit={onSubmit} className="space-y-4">
                    <div className="flex items-center gap-2 mb-1 text-accent">
                      <User className="h-5 w-5" />
                      <h3 className="font-semibold">Bilgilerin</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Ad Soyad"
                        icon={<User className="h-4 w-4" />}
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Örn. Tugay Tulgar"
                        disabled={!isEnvOk}
                      />
                      <Input
                        label="Telefon"
                        icon={<Phone className="h-4 w-4" />}
                        value={form.phone}
                        onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                        placeholder="05xx xxx xx xx"
                        disabled={!isEnvOk}
                        hint={
                          form.phone ? (isValidTurkishPhone(form.phone) ? '✓ Uygun' : 'Türkiye formatı (+90 / 05xx) olmalı') : null
                        }
                        hintTone={form.phone && !isValidTurkishPhone(form.phone) ? 'danger' : 'muted'}
                      />
                    </div>

                    <Textarea
                      label="Not (opsiyonel)"
                      icon={<StickyNote className="h-4 w-4" />}
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Örn: Saçım çok uzun, ekstra özen rica ederim…"
                      disabled={!isEnvOk}
                    />

                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
                      <div className="text-sm text-text/70">
                        <div>
                          <span className="text-text/60">Seçim:</span>{' '}
                          <span className="text-text">
                            {selectedService ? selectedService.isim : 'Hizmet yok'} • {selectedBarber ? selectedBarber.isim : 'Berber yok'}
                          </span>
                        </div>
                        <div>
                          <span className="text-text/60">Zaman:</span>{' '}
                          <span className="text-text">
                            {selectedDate ? formatDateInputValue(selectedDate) : '—'} • {selectedTime || '—'}
                          </span>
                        </div>
                      </div>

                      <Button type="submit" disabled={!canSubmit} loading={submitting}>
                        Randevu Oluştur
                      </Button>
                    </div>
                  </form>
                </Card>

                {lastCreated?.takip_kodu ? (
                  <Card>
                    <div className="flex items-center gap-2 mb-3 text-accent">
                      <Link2 className="h-5 w-5" />
                      <h3 className="font-semibold">Randevu Takip Kodu</h3>
                    </div>
                    <p className="text-sm text-text/70">
                      Takip kodun: <span className="text-text font-semibold">{lastCreated.takip_kodu}</span>
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
                      <Button type="button" onClick={copyTrackingCode}>
                        <span className="inline-flex items-center gap-2">
                          <ClipboardCopy className="h-4 w-4" />
                          Takip Kodunu Kopyala
                        </span>
                      </Button>
                      <Button type="button" onClick={addToCalendar}>
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          Takvime Ekle (ICS)
                        </span>
                      </Button>
                      <a
                        href={getWhatsAppUrl('Merhaba, randevum hakkında sorum var.')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-500/20 transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Sorunuz varsa WhatsApp’tan yazın
                      </a>
                    </div>
                    <p className="mt-3 text-xs text-text/60">
                      Not: Yukarıdaki <strong>Takip</strong> sekmesine geçip kodu yapıştırarak arayabilirsin.
                    </p>
                  </Card>
                ) : null}
              </div>
            </div>
          )}
        </Section>
      </main>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}