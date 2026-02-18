import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ClipboardCopy, Link2, MessageCircle, Search } from 'lucide-react'

import { useAppointmentByTrackingCode } from '../../hooks/useAppointmentByTrackingCode'
import { formatDateInputValue } from '../../utils/time'
import { buildAppointmentIcs, downloadIcs } from '../../utils/ics'
import { getWhatsAppUrl } from '../../utils/whatsapp'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'

function StatusBadge({ status }) {
  const { label, cls } = useMemo(() => {
    if (status === 'onaylandı') return { label: 'Onaylandı', cls: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100' }
    if (status === 'tamamlandı') return { label: 'Tamamlandı', cls: 'border-sky-400/30 bg-sky-400/10 text-sky-100' }
    if (status === 'iptal') return { label: 'İptal', cls: 'border-red-400/30 bg-red-400/10 text-red-100' }
    return { label: 'Bekliyor', cls: 'border-amber-400/30 bg-amber-400/10 text-amber-100' }
  }, [status])

  return (
    <span className={['inline-flex items-center rounded-lg border px-2 py-1 text-xs', cls].join(' ')}>
      {label}
    </span>
  )
}

export function AppointmentTracking({ initialCode }) {
  const [code, setCode] = useState(initialCode || '')
  const [submitted, setSubmitted] = useState(false)
  const state = useAppointmentByTrackingCode()

  const canSearch = Boolean(String(code).trim()) && !state.loading

  useEffect(() => {
    const trimmed = String(initialCode || '').trim()
    if (!trimmed) return
    // İlk açılışta otomatik sorgula
    setSubmitted(true)
    state.search(trimmed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode])

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSearch) return
    setSubmitted(true)
    await state.search(code)
  }

  async function copyTrackingCode() {
    const trackingCode = state.data?.takip_kodu || String(code).trim()
    if (!trackingCode) return
    await navigator.clipboard.writeText(trackingCode)
  }

  function addToCalendar() {
    const a = state.data
    if (!a?.tarih || !a?.saat) return
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
      filename: `kuafor-randevu-${a.takip_kodu || 'takip'}.ics`,
      icsText,
    })
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <h3 className="font-semibold">Takip Kodu ile Sorgula</h3>
          <p className="mt-1 text-sm text-text/70">
            Randevu sonrası verilen takip kodunu gir. Linkte `?track=KOD` varsa otomatik yüklenir.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <Input
            label="Takip Kodu"
            icon={<Link2 className="h-4 w-4" />}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Örn: A2BC3D4EFG"
          />
          <div className="pb-[2px]">
            <Button type="submit" disabled={!canSearch} loading={state.loading}>
              <span className="inline-flex items-center gap-2">
                <Search className="h-4 w-4" />
                Sorgula
              </span>
            </Button>
          </div>
        </div>
      </form>

      {state.error ? (
        <Card>
          <p className="text-sm text-red-200">Hata: {String(state.error.message || state.error)}</p>
        </Card>
      ) : null}

      {submitted && !state.loading && state.data === null && !state.error ? (
        <Card>
          <p className="text-sm text-text/70">Bu takip koduna ait randevu bulunamadı.</p>
        </Card>
      ) : null}

      {state.data ? (
        <Card className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold">
                  {formatDateInputValue(state.data.tarih)} • {String(state.data.saat).slice(0, 5)}
                </p>
                <StatusBadge status={state.data.durum} />
              </div>
              <p className="mt-1 text-sm text-text/70">
                {state.data.services?.isim || 'Hizmet'} • {state.data.barbers?.isim || 'Berber'}
              </p>
              {state.data.notlar ? <p className="mt-2 text-sm text-text/75">Not: {state.data.notlar}</p> : null}
              <p className="mt-3 text-xs text-text/60">
                Takip Kodu: <span className="text-text font-semibold">{state.data.takip_kodu}</span>
              </p>
            </div>
          </div>

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
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-800 hover:bg-emerald-500/25 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Sorunuz varsa WhatsApp’tan yazın
            </a>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

