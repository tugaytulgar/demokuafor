import { pad2, timeStrToMinutes } from './time'

function toIcsDateLocal(dateInputValue, timeStr) {
  // dateInputValue: yyyy-mm-dd, timeStr: HH:MM
  const [yyyy, mm, dd] = dateInputValue.split('-')
  const [hh, min] = timeStr.split(':')
  return `${yyyy}${mm}${dd}T${hh}${min}00`
}

function addMinutesToTimeStr(timeStr, addMinutes) {
  const start = timeStrToMinutes(timeStr)
  const end = start + addMinutes
  const h = Math.floor(end / 60)
  const m = end % 60
  return `${pad2(h)}:${pad2(m)}`
}

function escapeIcsText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

/**
 * Basit ICS üretir (Europe/Istanbul).
 */
export function buildAppointmentIcs({
  trackingCode,
  date,
  time,
  durationMinutes,
  serviceName,
  barberName,
}) {
  const dtStart = toIcsDateLocal(date, time)
  const dtEnd = toIcsDateLocal(date, addMinutesToTimeStr(time, durationMinutes))
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z') // YYYYMMDDTHHMMSSZ

  const summary = `Kuaför Randevu${serviceName ? ` - ${serviceName}` : ''}`
  const descriptionLines = [
    barberName ? `Berber: ${barberName}` : null,
    trackingCode ? `Takip Kodu: ${trackingCode}` : null,
  ].filter(Boolean)

  const description = descriptionLines.join('\\n')
  const uid = `${trackingCode || crypto.randomUUID()}@kuafor`

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kuafor//Randevu//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${escapeIcsText(uid)}`,
    `DTSTAMP:${stamp}`,
    `DTSTART;TZID=Europe/Istanbul:${dtStart}`,
    `DTEND;TZID=Europe/Istanbul:${dtEnd}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    description ? `DESCRIPTION:${escapeIcsText(description)}` : null,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

export function downloadIcs({ filename, icsText }) {
  const blob = new Blob([icsText], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

