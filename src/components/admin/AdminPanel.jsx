import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, CalendarDays, ClipboardCopy, LogOut, Phone, RefreshCw, Shield, User, Users, BarChart2 } from 'lucide-react'

import { supabase } from '../../services/supabase'
import { useAuthSession } from '../../hooks/useAuthSession'
import { useAdminAppointments } from '../../hooks/useAdminAppointments'
import { useBarbers } from '../../hooks/useBarbers'
import {
  updateAppointmentStatus,
  fetchAdminStatsAppointments,
  fetchAdminCustomerList,
  fetchAdminAppointmentsByPhone,
} from '../../services/api'
import { APPOINTMENT_STATUS } from '../../utils/constants'
import { formatDateInputValue, todayDateInputValue } from '../../utils/time'
import { buildAppointmentIcs, downloadIcs } from '../../utils/ics'

import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { DatePicker } from '../booking/DatePicker'
import { Input } from '../ui/Input'
import { Toast } from '../ui/Toast'

function StatusPill({ status }) {
  const cls =
    status === 'onaylandı'
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100'
      : status === 'tamamlandı'
        ? 'border-sky-400/30 bg-sky-400/10 text-sky-100'
        : status === 'iptal'
          ? 'border-red-400/30 bg-red-400/10 text-red-100'
          : 'border-amber-400/30 bg-amber-400/10 text-amber-100'

  return (
    <span className={['inline-flex items-center rounded-lg border px-2 py-1 text-xs', cls].join(' ')}>
      {status}
    </span>
  )
}

export function AdminPanel() {
  const { loading: authLoading, session } = useAuthSession()
  const [toast, setToast] = useState(null)

  const [login, setLogin] = useState({ email: '', password: '' })
  const [loggingIn, setLoggingIn] = useState(false)

  const [adminTab, setAdminTab] = useState('randevular') // 'randevular' | 'raporlar' | 'musteriler'
  const [date, setDate] = useState(todayDateInputValue())
  const [barberId, setBarberId] = useState('')
  const [notifyEnabled, setNotifyEnabled] = useState(true)
  const [lastInsertPulse, setLastInsertPulse] = useState(0)
  const notifyEnabledRef = useRef(notifyEnabled)
  notifyEnabledRef.current = notifyEnabled

  // Raporlar
  const [reportRange, setReportRange] = useState('hafta') // 'gun' | 'hafta' | 'ay'
  const [statsData, setStatsData] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState(null)

  // Müşteriler
  const [customerList, setCustomerList] = useState(null)
  const [customerListLoading, setCustomerListLoading] = useState(false)
  const [selectedPhone, setSelectedPhone] = useState(null)
  const [customerHistory, setCustomerHistory] = useState(null)
  const [customerHistoryLoading, setCustomerHistoryLoading] = useState(false)

  const barbers = useBarbers()
  const appointments = useAdminAppointments({ date, barberId: barberId || null, enabled: Boolean(session?.user) })
  const knownIdsRef = useRef(new Set())
  const initialLoadDoneRef = useRef(false)
  const refetchRef = useRef(null)

  refetchRef.current = appointments.refetch

  const nextAppointment = useMemo(() => {
    const list = appointments.data || []
    const now = new Date()
    const todayStr = todayDateInputValue()
    if (date !== todayStr) return list[0] || null

    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const parse = (t) => {
      const [h, m] = String(t).slice(0, 5).split(':').map(Number)
      return h * 60 + m
    }
    return list.find((a) => parse(a.saat) >= currentMinutes) || list[0] || null
  }, [appointments.data, date])

  useEffect(() => {
    if (!supabase || !session?.user) return
    const channel = supabase
      .channel('admin-appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        (payload) => {
          refetchRef.current?.()
          if (!notifyEnabledRef.current) return
          if (payload.eventType === 'INSERT') {
            setLastInsertPulse(Date.now())
            setToast({ type: 'success', title: 'Yeni randevu', message: 'Yeni bir randevu kaydı geldi.' })
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') console.debug('[Admin] Realtime appointments subscribed')
        if (status === 'CHANNEL_ERROR') console.warn('[Admin] Realtime error – appointments tablosu publication’da olmayabilir.')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session?.user])

  // Raporlar: tarih aralığına göre istatistik yükle
  useEffect(() => {
    if (!session?.user || adminTab !== 'raporlar') return
    const today = new Date()
    const yyyy = (d) => d.getFullYear()
    const mm = (d) => String(d.getMonth() + 1).padStart(2, '0')
    const dd = (d) => String(d.getDate()).padStart(2, '0')
    const toStr = (d) => `${yyyy(d)}-${mm(d)}-${dd(d)}`
    let startDate, endDate
    endDate = toStr(today)
    if (reportRange === 'gun') {
      startDate = endDate
    } else if (reportRange === 'hafta') {
      const start = new Date(today)
      start.setDate(start.getDate() - 6)
      startDate = toStr(start)
    } else {
      startDate = `${yyyy(today)}-${mm(today)}-01`
    }
    setStatsLoading(true)
    setStatsError(null)
    fetchAdminStatsAppointments({ startDate, endDate })
      .then((res) => {
        if (res.error) throw res.error
        const list = res.data || []
        const toplamCiro = list.reduce((sum, a) => sum + (Number(a.services?.fiyat) || 0), 0)
        const barberCount = {}
        const serviceCount = {}
        list.forEach((a) => {
          const b = a.barbers?.isim || '—'
          barberCount[b] = (barberCount[b] || 0) + 1
          const s = a.services?.isim || '—'
          serviceCount[s] = (serviceCount[s] || 0) + 1
        })
        const topBarber = Object.entries(barberCount).sort((a, b) => b[1] - a[1])[0]
        const topService = Object.entries(serviceCount).sort((a, b) => b[1] - a[1])[0]
        setStatsData({ toplamCiro, topBarber, topService, count: list.length })
      })
      .catch((err) => setStatsError(err?.message || String(err)))
      .finally(() => setStatsLoading(false))
  }, [session?.user, adminTab, reportRange])

  // Müşteriler: liste yükle
  useEffect(() => {
    if (!session?.user || adminTab !== 'musteriler') return
    setCustomerListLoading(true)
    fetchAdminCustomerList()
      .then((res) => {
        if (res.error) throw res.error
        setCustomerList(res.data || [])
      })
      .catch(() => setCustomerList([]))
      .finally(() => setCustomerListLoading(false))
  }, [session?.user, adminTab])

  // Müşteri geçmişi: telefon seçilince yükle
  useEffect(() => {
    if (!selectedPhone) {
      setCustomerHistory(null)
      return
    }
    setCustomerHistoryLoading(true)
    setCustomerHistory(null)
    fetchAdminAppointmentsByPhone({ phone: selectedPhone })
      .then((res) => {
        if (res.error) throw res.error
        setCustomerHistory(res.data || [])
      })
      .catch(() => setCustomerHistory([]))
      .finally(() => setCustomerHistoryLoading(false))
  }, [selectedPhone])

  // Realtime bazen tetiklenmeyebiliyor; periyodik yenileme ile yeni randevular kesin düşsün
  useEffect(() => {
    if (!session?.user) return
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refetchRef.current?.()
      }
    }, 15000)
    return () => clearInterval(interval)
  }, [session?.user])

  useEffect(() => {
    knownIdsRef.current = new Set()
    initialLoadDoneRef.current = false
  }, [date, barberId])

  // Refetch sonrası yeni gelen randevuları tespit et; ses + toast tetikle (Realtime gelmese bile)
  useEffect(() => {
    const data = appointments.data
    if (!Array.isArray(data)) return

    const currentIds = new Set(data.map((a) => a.id))

    if (!initialLoadDoneRef.current) {
      knownIdsRef.current = currentIds
      initialLoadDoneRef.current = true
      return
    }

    const known = knownIdsRef.current
    const hasNew = data.some((a) => !known.has(a.id))
    if (hasNew && notifyEnabledRef.current) {
      data.forEach((a) => known.add(a.id))
      setLastInsertPulse(Date.now())
      setToast({ type: 'success', title: 'Yeni randevu', message: 'Yeni bir randevu kaydı geldi.' })
    } else {
      data.forEach((a) => known.add(a.id))
    }
  }, [appointments.data])

  // "Yeni randevu geldi" bandı 5 saniye sonra kendiliğinden kalkar
  useEffect(() => {
    if (!lastInsertPulse) return
    const t = setTimeout(() => setLastInsertPulse(0), 5000)
    return () => clearTimeout(t)
  }, [lastInsertPulse])

  async function onLogin(e) {
    e.preventDefault()
    if (!supabase) return
    setLoggingIn(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: login.email.trim(),
        password: login.password,
      })
      if (error) throw new Error(error.message)
      setToast({ type: 'success', title: 'Giriş başarılı', message: 'Yönetim paneline hoş geldiniz.' })
    } catch (err) {
      setToast({ type: 'error', title: 'Giriş başarısız', message: err?.message || 'Hata oluştu.' })
    } finally {
      setLoggingIn(false)
    }
  }

  async function onLogout() {
    if (!supabase) return
    await supabase.auth.signOut()
  }

  async function setStatus(id, durum) {
    try {
      const { error } = await updateAppointmentStatus({ id, durum })
      if (error) throw new Error(error.message)
      setToast({ type: 'success', title: 'Güncellendi', message: `Durum: ${durum}` })
      await appointments.refetch?.()
    } catch (err) {
      setToast({
        type: 'error',
        title: 'Güncelleme başarısız',
        message:
          err?.message ||
          'RLS izinleri eksik olabilir. Supabase SQL Editor’da 002_admin_rls.sql dosyasını çalıştırın.',
      })
    }
  }

  function downloadIcsFor(a) {
    const durationMinutes = Number(a.services?.sure_dakika || 45)
    const icsText = buildAppointmentIcs({
      trackingCode: a.takip_kodu,
      date: a.tarih,
      time: String(a.saat).slice(0, 5),
      durationMinutes,
      serviceName: a.services?.isim,
      barberName: a.barbers?.isim,
    })
    downloadIcs({
      filename: `kuafor-randevu-${a.takip_kodu || a.id}.ics`,
      icsText,
    })
  }

  if (authLoading) {
    return <p className="text-sm text-text/70">Yükleniyor…</p>
  }

  if (!session?.user) {
    return (
      <>
        <div className="flex items-center gap-2 mb-4 text-accent">
          <Shield className="h-5 w-5" />
          <h3 className="font-semibold">Yönetim Girişi</h3>
        </div>
        <form onSubmit={onLogin} className="space-y-4">
          <Input
            label="E-posta"
            icon={<User className="h-4 w-4" />}
            value={login.email}
            onChange={(e) => setLogin((p) => ({ ...p, email: e.target.value }))}
            placeholder="admin@domain.com"
            type="email"
          />
          <Input
            label="Şifre"
            icon={<Shield className="h-4 w-4" />}
            value={login.password}
            onChange={(e) => setLogin((p) => ({ ...p, password: e.target.value }))}
            placeholder="••••••••"
            type="password"
          />
          <Button type="submit" disabled={loggingIn} loading={loggingIn}>
            Giriş Yap
          </Button>
          <p className="text-xs text-text/60">
            Not: Bu ekran Supabase Auth kullanır. İlk admin kullanıcıyı Supabase Dashboard → Authentication → Users’den
            ekleyebilirsin.
          </p>
        </form>
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 text-accent">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Canlı Dashboard</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setNotifyEnabled((p) => !p)}
            className={[
              'rounded-xl border px-3 py-2 text-xs transition-colors',
              notifyEnabled ? 'border-accent/30 bg-accent/10 text-text' : 'border-white/10 bg-white/5 text-text/70',
            ].join(' ')}
            title="Bildirimleri aç/kapat"
          >
            Bildirim: {notifyEnabled ? 'Açık' : 'Kapalı'}
          </button>
          <span className="text-xs text-text/60">{session.user.email}</span>
          <Button type="button" onClick={onLogout}>
            <span className="inline-flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              Çıkış
            </span>
          </Button>
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex gap-2 border-b border-white/10 mb-4">
        {[
          { id: 'randevular', label: 'Randevular', icon: CalendarDays },
          { id: 'raporlar', label: 'Raporlar', icon: BarChart2 },
          { id: 'musteriler', label: 'Müşteriler', icon: Users },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setAdminTab(id)}
            className={[
              'flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-3 text-sm font-medium transition-colors',
              adminTab === id
                ? 'border-accent text-accent bg-accent/5'
                : 'border-transparent text-text/70 hover:text-text hover:bg-white/5',
            ].join(' ')}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {adminTab === 'randevular' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <Card className="lg:col-span-4">
          <div className="flex items-center gap-2 mb-4 text-accent">
            <CalendarDays className="h-5 w-5" />
            <h4 className="font-semibold">Tarih</h4>
          </div>
          <DatePicker value={date} min={todayDateInputValue()} onChange={setDate} />

          <div className="mt-4">
            <label className="block">
              <span className="text-sm text-text/70">Berber filtresi</span>
              <select
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 outline-none"
              >
                <option value="">Tümü</option>
                {(barbers.data || []).map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.isim}
                  </option>
                ))}
              </select>
            </label>
            {barbers.loading ? <p className="mt-2 text-xs text-text/60">Berberler yükleniyor…</p> : null}
          </div>

          <div className="mt-5">
            <p className="text-sm text-text/70">Sıradaki müşteri</p>
            {nextAppointment ? (
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {String(nextAppointment.saat).slice(0, 5)} • {nextAppointment.musteri_adi}
                    </p>
                    <p className="mt-1 text-sm text-text/70">
                      {nextAppointment.services?.isim || 'Hizmet'} • {nextAppointment.barbers?.isim || 'Berber'}
                    </p>
                  </div>
                  <StatusPill status={nextAppointment.durum} />
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-text/60">Kayıt yok.</p>
            )}
          </div>
        </Card>

        <Card className="lg:col-span-8">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h4 className="font-semibold">Randevular</h4>
              <p className="text-sm text-text/70">{formatDateInputValue(date)}</p>
            </div>
            <div className="flex items-center gap-2">
              {appointments.loading ? <p className="text-sm text-text/60">Yükleniyor…</p> : null}
              <button
                type="button"
                onClick={() => appointments.refetch?.()}
                disabled={appointments.loading}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 disabled:opacity-50"
                title="Listeyi yenile"
              >
                <RefreshCw className="h-4 w-4" />
                Yenile
              </button>
            </div>
          </div>

          {lastInsertPulse ? (
            <div
              key={lastInsertPulse}
              className="mb-4 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm"
            >
              <span className="font-semibold text-accent">Yeni randevu geldi.</span>{' '}
              <span className="text-text/70">Liste güncellendi.</span>
            </div>
          ) : null}

          {appointments.error ? (
            <p className="text-sm text-red-200">
              Hata: {String(appointments.error.message || appointments.error)} (RLS policy eksik olabilir)
            </p>
          ) : null}

          {Array.isArray(appointments.data) && appointments.data.length === 0 ? (
            <p className="text-sm text-text/60">Bu tarihte randevu yok.</p>
          ) : null}

          <div className="space-y-3">
            {(appointments.data || []).map((a) => (
              <div key={a.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {String(a.saat).slice(0, 5)} • {a.musteri_adi}
                      </p>
                      <StatusPill status={a.durum} />
                    </div>
                    <p className="mt-1 text-sm text-text/70">
                      {a.services?.isim || 'Hizmet'} • {a.barbers?.isim || 'Berber'}
                    </p>
                    {a.notlar ? <p className="mt-2 text-sm text-text/75">Not: {a.notlar}</p> : null}
                    <p className="mt-2 text-xs text-text/60">
                      Tel: {a.telefon} • Takip: <span className="text-text">{a.takip_kodu || '—'}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                      onClick={() => setStatus(a.id, APPOINTMENT_STATUS.BEKLIYOR)}
                    >
                      bekliyor
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                      onClick={() => setStatus(a.id, APPOINTMENT_STATUS.ONAYLANDI)}
                    >
                      onayla
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                      onClick={() => setStatus(a.id, APPOINTMENT_STATUS.TAMAMLANDI)}
                    >
                      tamamla
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                      onClick={() => setStatus(a.id, APPOINTMENT_STATUS.IPTAL)}
                    >
                      iptal
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                      onClick={() => downloadIcsFor(a)}
                    >
                      ICS
                    </button>
                    <a
                      href={`tel:${a.telefon}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      Ara
                    </a>
                    {a.takip_kodu ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10"
                        onClick={async () => {
                          await navigator.clipboard.writeText(a.takip_kodu)
                          setToast({ type: 'success', title: 'Kopyalandı', message: 'Takip kodu panoya kopyalandı.' })
                        }}
                      >
                        <ClipboardCopy className="h-3.5 w-3.5" />
                        Takip Kodu
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      )}

      {adminTab === 'raporlar' && (
        <Card>
          <div className="flex items-center gap-2 mb-4 text-accent">
            <BarChart2 className="h-5 w-5" />
            <h4 className="font-semibold">Raporlar</h4>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {['gun', 'hafta', 'ay'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReportRange(r)}
                className={[
                  'rounded-xl border px-4 py-2 text-sm',
                  reportRange === r ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 bg-white/5 text-text/80 hover:bg-white/10',
                ].join(' ')}
              >
                {r === 'gun' ? 'Bugün' : r === 'hafta' ? 'Bu hafta' : 'Bu ay'}
              </button>
            ))}
          </div>
          {statsLoading && <p className="text-sm text-text/60">Yükleniyor…</p>}
          {statsError && <p className="text-sm text-red-200">Hata: {statsError}</p>}
          {!statsLoading && !statsError && statsData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-text/60 uppercase tracking-wider">Ciro (tahmini)</p>
                <p className="mt-1 text-2xl font-semibold text-accent">
                  ₺{Number(statsData.toplamCiro).toLocaleString('tr-TR')}
                </p>
                <p className="text-xs text-text/60 mt-1">{statsData.count} randevu</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-text/60 uppercase tracking-wider">En çok randevu (berber)</p>
                <p className="mt-1 text-lg font-semibold text-text">
                  {statsData.topBarber ? `${statsData.topBarber[0]} (${statsData.topBarber[1]})` : '—'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs text-text/60 uppercase tracking-wider">En çok tercih (hizmet)</p>
                <p className="mt-1 text-lg font-semibold text-text">
                  {statsData.topService ? `${statsData.topService[0]} (${statsData.topService[1]})` : '—'}
                </p>
              </div>
            </div>
          )}
          {!statsLoading && !statsError && !statsData && adminTab === 'raporlar' && (
            <p className="text-sm text-text/60">Bu aralıkta onaylı/tamamlanan randevu yok.</p>
          )}
        </Card>
      )}

      {adminTab === 'musteriler' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-4 text-accent">
              <Users className="h-5 w-5" />
              <h4 className="font-semibold">Müşteri listesi</h4>
            </div>
            {customerListLoading && <p className="text-sm text-text/60">Yükleniyor…</p>}
            {!customerListLoading && (!customerList || customerList.length === 0) && (
              <p className="text-sm text-text/60">Henüz müşteri kaydı yok.</p>
            )}
            <div className="max-h-[60vh] overflow-y-auto space-y-2">
              {(customerList || []).map((c) => (
                <button
                  key={c.telefon}
                  type="button"
                  onClick={() => setSelectedPhone(c.telefon)}
                  className={[
                    'w-full text-left rounded-xl border px-4 py-3 transition-colors',
                    selectedPhone === c.telefon ? 'border-accent bg-accent/10 text-accent' : 'border-white/10 bg-white/5 hover:bg-white/10 text-text',
                  ].join(' ')}
                >
                  <p className="font-medium">{c.musteri_adi || '—'}</p>
                  <p className="text-sm text-text/70">{c.telefon}</p>
                </button>
              ))}
            </div>
          </Card>
          <Card className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-4 text-accent">
              <CalendarDays className="h-5 w-5" />
              <h4 className="font-semibold">Randevu geçmişi</h4>
            </div>
            {!selectedPhone && <p className="text-sm text-text/60">Listeden bir müşteri seçin.</p>}
            {selectedPhone && customerHistoryLoading && <p className="text-sm text-text/60">Yükleniyor…</p>}
            {selectedPhone && !customerHistoryLoading && Array.isArray(customerHistory) && (
              <>
                {customerHistory.length === 0 ? (
                  <p className="text-sm text-text/60">Bu müşteriye ait randevu bulunamadı.</p>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                    {customerHistory.map((a) => (
                      <div key={a.id} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold">
                            {a.tarih} • {String(a.saat).slice(0, 5)}
                          </p>
                          <StatusPill status={a.durum} />
                        </div>
                        <p className="mt-1 text-sm text-text/70">
                          {a.services?.isim || '—'} • {a.barbers?.isim || '—'}
                          {a.services?.fiyat != null ? ` • ₺${Number(a.services.fiyat).toLocaleString('tr-TR')}` : ''}
                        </p>
                        {a.notlar ? <p className="mt-2 text-sm text-text/75">Not: {a.notlar}</p> : null}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  )
}

