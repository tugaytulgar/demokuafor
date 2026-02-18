import { useMemo, useState } from 'react'
import { Phone, Search } from 'lucide-react'

import { useAppointmentsByPhone } from '../../hooks/useAppointmentsByPhone'
import { formatDateInputValue } from '../../utils/time'
import { formatTurkishPhone, isValidTurkishPhone } from '../../utils/phone'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Input } from '../ui/Input'

function StatusBadge({ status }) {
  const { label, cls } = useMemo(() => {
    if (status === 'onaylandı') return { label: 'Onaylandı', cls: 'border-emerald-600 bg-emerald-100 text-emerald-900 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-100' }
    if (status === 'tamamlandı') return { label: 'Tamamlandı', cls: 'border-sky-600 bg-sky-100 text-sky-900 dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-100' }
    if (status === 'iptal') return { label: 'İptal', cls: 'border-red-600 bg-red-100 text-red-900 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-100' }
    return { label: 'Bekliyor', cls: 'border-amber-600 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100' }
  }, [status])

  return (
    <span className={['inline-flex items-center rounded-lg border px-2 py-1 text-xs font-medium', cls].join(' ')}>
      {label}
    </span>
  )
}

export function AppointmentLookup() {
  const [phone, setPhone] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const state = useAppointmentsByPhone()

  const canSearch = isValidTurkishPhone(phone) && !state.loading

  async function onSubmit(e) {
    e.preventDefault()
    if (!canSearch) return
    setSubmitted(true)
    const formatted = formatTurkishPhone(phone)
    await state.search(formatted)
  }

  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold">Randevu Sorgula</h3>
            <p className="mt-1 text-sm text-text/70">Telefon numaranı girerek daha önce oluşturduğun randevuları görebilirsin.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
          <Input
            label="Telefon"
            icon={<Phone className="h-4 w-4" />}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="05xx xxx xx xx"
            hint={phone ? (isValidTurkishPhone(phone) ? '✓ Uygun' : 'Türkiye formatı (+90 / 05xx) olmalı') : null}
            hintTone={phone && !isValidTurkishPhone(phone) ? 'danger' : 'muted'}
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

      {submitted && !state.loading && Array.isArray(state.data) && state.data.length === 0 ? (
        <Card>
          <p className="text-sm text-text/70">Bu telefon numarasına ait randevu bulunamadı.</p>
        </Card>
      ) : null}

      {Array.isArray(state.data) && state.data.length > 0 ? (
        <div className="space-y-3">
          {state.data.map((a) => (
            <Card key={a.id} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">
                      {formatDateInputValue(a.tarih)} • {String(a.saat).slice(0, 5)}
                    </p>
                    <StatusBadge status={a.durum} />
                  </div>
                  <p className="mt-1 text-sm text-text/70">
                    {a.services?.isim || 'Hizmet'} • {a.barbers?.isim || 'Berber'}
                  </p>
                  {a.notlar ? <p className="mt-2 text-sm text-text/75">Not: {a.notlar}</p> : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  )
}

