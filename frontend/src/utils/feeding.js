export const stages = [
  { label: 'Grower stage', range: 'Day 1-21', start: 1, end: 21, kg: 1.5, note: 'Grower ration before breeding is confirmed.' },
  { label: 'Gestating stage 1', range: 'Day 22-30', start: 22, end: 30, kg: 1.75, note: 'Early gestation, feed increased slightly.' },
  { label: 'Gestating stage 2', range: 'Day 31-61', start: 31, end: 61, kg: 2.0, note: 'Mid gestation ration.' },
  { label: 'Gestating stage 3', range: 'Day 62-91', start: 62, end: 91, kg: 2.25, note: 'Peak gestation feed level.' },
  { label: 'Gestating stage 4', range: 'Day 92-105', start: 92, end: 105, kg: 2.0, note: 'Feed tapered back ahead of farrowing.' },
  { label: 'Lactating stage 1', range: 'Day 106-109', start: 106, end: 109, kg: 1.75, note: 'Feed around farrowing.' },
  { label: 'Lactating stage 2', range: 'Day 110-114', start: 110, end: 114, kg: 1.0, note: 'Reduced feed through the farrowing window.' }
]

export function addDays(date, days) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function parseDateOnly(value) {
  return new Date(value + 'T00:00:00')
}

export function fmtShort(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function fmtLong(d) {
  if (!d) return '-'
  return new Date(d).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function dayOfGestationFor(breedDate) {
  if (!breedDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const msPerDay = 86400000
  return Math.floor((today - breedDate) / msPerDay) + 1
}

export function statusFor(breedDate) {
  const day = dayOfGestationFor(breedDate)
  if (day === null) return { label: 'Status', value: '-' }
  if (day < 1) return { label: 'Status', value: 'Not bred yet' }
  if (day > 118) return { label: 'Status', value: 'Past labor window' }
  const laborStart = addDays(breedDate, 114)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const msPerDay = 86400000
  const daysToLaborStart = Math.floor((laborStart - today) / msPerDay)
  return {
    label: 'Days until labor window',
    value: daysToLaborStart >= 0 ? daysToLaborStart + ' days' : 'In window'
  }
}

export function currentStageFor(breedDate) {
  const day = dayOfGestationFor(breedDate)
  if (day === null) return null
  return stages.find((s) => day >= s.start && day <= s.end) || null
}

export function stagesWithDatesFor(breedDate) {
  if (!breedDate) return stages.map((s) => ({ ...s, isCurrent: false, dateRange: '' }))
  const day = dayOfGestationFor(breedDate)
  return stages.map((s) => {
    const rangeStart = addDays(breedDate, s.start - 1)
    const rangeEnd = addDays(breedDate, s.end - 1)
    return {
      ...s,
      isCurrent: day >= s.start && day <= s.end,
      dateRange: fmtLong(rangeStart) + ' to ' + fmtLong(rangeEnd)
    }
  })
}
