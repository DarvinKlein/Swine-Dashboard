import { jsPDF } from 'jspdf'
import { fmtShort, stagesWithDatesFor, statusFor, dayOfGestationFor, parseDateOnly } from './feeding'

export function downloadSwinePdf(swine) {
  const breedDate = parseDateOnly(String(swine.breeding_date).slice(0, 10))
  const stages = stagesWithDatesFor(breedDate)
  const status = statusFor(breedDate)
  const day = dayOfGestationFor(breedDate)

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const marginX = 48
  let y = 56

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.text('Swine calculator', marginX, y)
  y += 22

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(90)
  doc.text('Pregnancy dates and feeding guide for a sow, from breeding to farrowing.', marginX, y)
  y += 26

  doc.setDrawColor(200)
  doc.line(marginX, y, 548, y)
  y += 24

  doc.setTextColor(20)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Swine name', marginX, y)
  doc.text('Breeding date', 320, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.text(swine.swine_name || 'Unnamed', marginX, y)
  doc.text(fmtShort(breedDate), 320, y)
  y += 30

  const milestones = [
    ['Pregnancy check date', fmtShort(swine.pregnant_date)],
    ['Iron shot date', fmtShort(swine.iron_date)],
    ['Labor window', fmtShort(swine.labor_date_start) + ' - ' + fmtShort(swine.labor_date_end)],
    ['Current gestation day', day >= 1 && day <= 118 ? 'Day ' + day : '-'],
    [status.label, status.value]
  ]

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Key dates', marginX, y)
  y += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  milestones.forEach(([label, value]) => {
    doc.setTextColor(90)
    doc.text(label, marginX, y)
    doc.setTextColor(20)
    doc.text(String(value), 320, y)
    y += 18
  })

  y += 12
  doc.setDrawColor(200)
  doc.line(marginX, y, 548, y)
  y += 24

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(20)
  doc.text('Feeding guide', marginX, y)
  y += 18

  doc.setFontSize(10)
  stages.forEach((stage) => {
    if (y > 760) {
      doc.addPage()
      y = 56
    }
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20)
    const title = stage.isCurrent ? stage.label + ' (' + stage.range + ') - current' : stage.label + ' (' + stage.range + ')'
    doc.text(title, marginX, y)
    doc.setFont('helvetica', 'normal')
    doc.text(stage.kg.toFixed(2) + ' kg/day', 460, y)
    y += 14
    doc.setTextColor(90)
    doc.text(stage.note, marginX, y)
    y += 13
    doc.setTextColor(120)
    doc.text(stage.dateRange, marginX, y)
    y += 20
  })

  const fileName = (swine.swine_name ? swine.swine_name.replace(/\s+/g, '_') : 'swine') + '_calculator.pdf'
  doc.save(fileName)
}
