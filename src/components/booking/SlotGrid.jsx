import { X } from 'lucide-react'
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
    return <p className="text-sm text-gray-600 dark:text-gray-400">Slotları görmek için hizmet + berber seçin.</p>
  }

  if (!selectedService) {
    return <p className="text-sm text-gray-600 dark:text-gray-400">Önce bir hizmet seçin.</p>
  }

  if (loading) return <p className="text-sm text-gray-600 dark:text-gray-400">Dolu saatler kontrol ediliyor…</p>
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
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Süre: <span className="text-gray-900 dark:text-text">{duration} dk</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">Öğle arası 12:00–13:00 kapalı</p>
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
              onClick={() => !busy && onSelectTime?.(slot.label)}
              className={[
                'relative rounded-xl px-3 py-2.5 text-sm border transition-colors min-h-[44px] flex flex-col items-center justify-center gap-0.5',
                busy
                  ? 'border-gray-300 bg-gray-200/80 text-gray-500 cursor-not-allowed dark:border-white/20 dark:bg-white/10 dark:text-gray-500'
                  : '',
                !busy && active
                  ? 'border-accent/60 bg-accent/15 text-text dark:border-accent/60 dark:bg-accent/15'
                  : '',
                !busy && !active
                  ? 'border-gray-200 bg-gray-50 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10'
                  : '',
              ].join(' ')}
            >
              {busy ? (
                <>
                  <span className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                    <X className="h-6 w-6 text-gray-400/50 dark:text-gray-500/50 stroke-[2.5]" />
                  </span>
                  <span className="relative z-10 flex flex-col items-center gap-0.5">
                    <span className="line-through opacity-80">{slot.label}</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
                      Dolu
                    </span>
                  </span>
                </>
              ) : (
                slot.label
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

