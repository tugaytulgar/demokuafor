import {
  LUNCH_END_MINUTES,
  LUNCH_START_MINUTES,
  SLOT_DURATION_MINUTES,
  WORK_END_MINUTES,
  WORK_START_MINUTES,
} from './constants'

export function pad2(n) {
  return String(n).padStart(2, '0')
}

export function minutesToTimeStr(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${pad2(h)}:${pad2(m)}`
}

export function timeStrToMinutes(timeStr) {
  const [h, m] = String(timeStr).split(':').map((v) => Number(v))
  return h * 60 + m
}

export function todayDateInputValue() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = pad2(d.getMonth() + 1)
  const dd = pad2(d.getDate())
  return `${yyyy}-${mm}-${dd}`
}

export function formatDateInputValue(value) {
  // yyyy-mm-dd -> dd.mm.yyyy
  if (!value) return ''
  const [yyyy, mm, dd] = value.split('-')
  return `${dd}.${mm}.${yyyy}`
}

export function isSunday(dateInputValue) {
  if (!dateInputValue) return false
  const [yyyy, mm, dd] = dateInputValue.split('-').map((v) => Number(v))
  const d = new Date(yyyy, mm - 1, dd)
  return d.getDay() === 0
}

/**
 * 45 dk slotları üretir (mesai + öğle arası kuralları uygulanır).
 * @param {{durationMinutes:number}} args
 */
export function buildCandidateSlots({ durationMinutes }) {
  const step = SLOT_DURATION_MINUTES
  const duration = Math.max(step, Math.ceil(durationMinutes / step) * step)

  const slots = []
  for (let start = WORK_START_MINUTES; start + duration <= WORK_END_MINUTES; start += step) {
    const end = start + duration

    // Öğle arası ile çakışanları ele
    const overlapsLunch = start < LUNCH_END_MINUTES && end > LUNCH_START_MINUTES
    if (overlapsLunch) continue

    slots.push({ start, end, label: minutesToTimeStr(start) })
  }

  return { slots, duration }
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  // [start, end) mantığı
  return aStart < bEnd && aEnd > bStart
}

