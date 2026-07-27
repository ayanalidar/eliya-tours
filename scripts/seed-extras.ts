// Seed sample offers + seasonal pricing + a demo review
import { db } from '../src/lib/db'

async function main() {
  console.log('🌱 Seeding offers...')
  const offers = [
    { title: 'Early Bird Spring', description: '15% off all spring packages booked before March 1', code: 'SPRING15', discountPct: 15, days: 60 },
    { title: 'Honeymoon Special', description: '10% off houseboat stays for couples', code: 'COUPLE10', discountPct: 10, days: 365 },
    { title: 'Group of 6+', description: '12% off for groups of 6 or more', code: 'GROUP12', discountPct: 12, days: 365 },
    { title: 'Last Minute Ladakh', description: '8% off Ladakh trips booked within 14 days of travel', code: 'LADAKH8', discountPct: 8, days: 30 },
    { title: 'Diwali Dhamaka', description: '20% off all autumn packages', code: 'DIWALI20', discountPct: 20, days: 45 },
  ]
  for (const o of offers) {
    const validFrom = new Date()
    const validTo = new Date(Date.now() + o.days * 24 * 60 * 60 * 1000)
    await db.offer.upsert({
      where: { code: o.code },
      update: { title: o.title, description: o.description, discountPct: o.discountPct, validFrom, validTo, active: true },
      create: { title: o.title, description: o.description, code: o.code, discountPct: o.discountPct, validFrom, validTo, active: true },
    })
  }
  console.log(`  ✓ ${offers.length} offers`)

  // Sample seasonal pricing for the Khyber Gulmarg resort
  console.log('🌱 Seeding seasonal pricing (Khyber Gulmarg)...')
  const hotelId = 'khyber-gulmarg'
  // Peak winter (Jan-Feb): 1.6x, shoulder (Mar-Apr): 1.2x, summer (May-Sep): 1.3x, off-season (Nov-Dec): 0.8x
  const monthlyMult: Array<[number, number, string]> = [
    [1, 1.6, 'Peak ski season'],
    [2, 1.6, 'Peak ski season'],
    [3, 1.2, 'Spring shoulder'],
    [4, 1.2, 'Spring shoulder'],
    [5, 1.3, 'Summer meadow'],
    [6, 1.3, 'Summer meadow'],
    [7, 1.4, 'Peak summer'],
    [8, 1.4, 'Peak summer'],
    [9, 1.3, 'Autumn meadow'],
    [10, 1.0, 'Autumn'],
    [11, 0.8, 'Off-season'],
    [12, 1.5, 'Christmas / New Year'],
  ]
  for (const [month, mult, note] of monthlyMult) {
    await db.seasonalPrice.upsert({
      where: { hotelId_month: { hotelId, month } },
      update: { multiplier: mult, note },
      create: { hotelId, month, multiplier: mult, note },
    })
  }
  console.log(`  ✓ 12 monthly multipliers for Khyber`)

  // Sample approved reviews
  console.log('🌱 Seeding sample reviews...')
  const reviews = [
    { destinationId: 'srinagar', guestName: 'Priya & Arjun', guestEmail: 'priya@example.com', rating: 5, title: 'The houseboat exceeded every expectation', body: 'We stayed 3 nights on Nigeen Lake and it was magical. The kahwa ceremony at sunset, the floating market at 5am, the Wazwan dinner — every detail was perfect. Tariq and Imran treated us like family.', tripDate: 'Oct 2025', verified: true, approved: true },
    { destinationId: 'gulmarg', guestName: 'Mark Thompson', guestEmail: 'mark@example.com', rating: 5, title: 'Best powder of my life', body: 'Did 4 days of heli-skiing with Eliya in February. The guides were world-class, the snow was bottomless, and the Khyber was the perfect base. Worth every rupee.', tripDate: 'Feb 2026', verified: true, approved: true },
    { destinationId: 'pahalgam', guestName: 'Sharma family', guestEmail: 'sharma@example.com', rating: 4, title: 'Beautiful but crowded in peak season', body: 'Pahalgam is stunning — Betaab Valley and Aru are magical. The only downside was crowds in July. Eliya did a great job of getting us out early to beat them.', tripDate: 'Jul 2025', verified: true, approved: true },
    { destinationId: 'leh', guestName: 'Hiroshi Tanaka', guestEmail: 'hiroshi@example.com', rating: 5, title: 'Ladakh changed my perspective', body: 'The 10-day Ladakh trip with stops at Hemis, Nubra, and Pangong was a spiritual experience. The acclimatization days were essential. Eliya\'s local team in Leh is fantastic.', tripDate: 'Aug 2025', verified: true, approved: true },
    { destinationId: 'srinagar', guestName: 'Anonymous', guestEmail: 'guest1@example.com', rating: 5, title: 'Autumn in the Mughal gardens', body: 'The chinar trees in Nishat Bagh were at peak gold when we visited in November. The photography was unreal. Eliya timed everything perfectly.', tripDate: 'Nov 2025', verified: true, approved: true },
  ]
  for (const r of reviews) {
    await db.review.create({ data: r })
  }
  console.log(`  ✓ ${reviews.length} reviews`)

  console.log('')
  console.log('✅ Seed complete')
  console.log('')
  console.log('Offer codes (use at checkout):')
  for (const o of offers) console.log(`  ${o.code} → ${o.discountPct}% off`)
}

main()
  .catch((e) => { console.error('❌', e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
