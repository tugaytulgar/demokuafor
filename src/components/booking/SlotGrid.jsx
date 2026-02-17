import { buildCandidateSlots, rangesOverlap, timeStrToMinutes } from '../../utils/time'

export function SlotGrid({
  enabled,
  selectedTime,
  onSelectTime,
  selectedService,
  appointments,
  loading,
  error,
}) {
  if (!enabled) {
    return <p className="text-sm text-text/70">Slotları görmek için hizmet + berber seçin.</p>
  }

  if (!selectedService) {
    return <p className="text-sm text-text/70">Önce bir hizmet seçin.</p>
  }

  if (loading) return <p className="text-sm text-text/70">Dolu saatler kontrol ediliyor…</p>
  if (error) return <p className="text-sm text-red-200">Hata: {String(error.message || error)}</p>

  const { slots, duration } = buildCandidateSlots({ durationMinutes: selectedService.sure_dakika })

  const blocked = (appointments || []).map((a) => {
    const start = timeStrToMinutes(a.saat)
    const serviceMinutes =
      a.services && typeof a.services.sure_dakika === 'number' ? a.services.sure_dakika : 45
    const step = 45
    const dur = Math.max(step, Math.ceil(serviceMinutes / step) * step)
    return { start, end: start + dur }
  })

  function isSlotBusy(slot) {
    return blocked.some((b) => rangesOverlap(slot.start, slot.end, b.start, b.end))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-text/70">
          Süre: <span className="text-text">{duration} dk</span>
        </p>
        <p className="text-xs text-text/50">Öğle arası 12:00–13:00 kapalı</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const busy = isSlotBusy(slot)
          const active = selectedTime === slot.label
          return (
            <button
              key={slot.label}
              type="button"
              disabled={busy}
              onClick={() => onSelectTime?.(slot.label)}
              className={[
                'rounded-xl px-3 py-2 text-sm border transition-colors',
                busy ? 'border-white/10 bg-white/5 text-text/30 cursor-not-allowed' : '',
                !busy && active ? 'border-accent/60 bg-accent/15 text-text' : '',
                !busy && !active ? 'border-white/10 bg-white/5 hover:bg-white/10' : '',
              ].join(' ')}
            >
              {slot.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

