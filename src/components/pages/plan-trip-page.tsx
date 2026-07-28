'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Send, Loader2, Check, Users, Baby, MapPin, Hotel, Utensils, Mountain, Car, Compass, Camera, Plane, Train } from 'lucide-react'
import { useNav } from '@/lib/router'
import { useApp } from '@/lib/app-context'

type Destination = { id: string; name: string; area: string }
type Hotel = { id: string; name: string; destinationId: string; type: string; priceFrom: number }
type Adventure = { id: string; name: string; category: string; season: string; destinationId: string; priceFrom: number }

const CARS = [
  { name: 'Toyota Innova', capacity: '6+1 seats', price: 3500 },
  { name: 'Mahindra Thar', capacity: '4 seats', price: 4500 },
  { name: 'Jeep Wrangler', capacity: '4 seats', price: 5000 },
  { name: 'Force Urbania', capacity: '12+1 seats', price: 5500 },
  { name: 'Mahindra Scorpio', capacity: '7+1 seats', price: 3200 },
  { name: 'Honda Amaze', capacity: '4+1 seats', price: 2500 },
  { name: 'Toyota Etios', capacity: '4+1 seats', price: 2200 },
  { name: 'Tempo Traveller', capacity: '15+1 seats', price: 6000 },
]

function getCurrentSeason(): string {
  const month = new Date().getMonth() + 1 // 1-12
  if (month >= 3 && month <= 4) return 'Spring'
  if (month >= 5 && month <= 7) return 'Summer'
  if (month >= 8 && month <= 9) return 'Late Summer'
  if (month >= 10 && month <= 11) return 'Autumn'
  return 'Winter'
}

export function PlanTripPage() {
  const nav = useNav()
  const { pushToast } = useApp()
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [quoteRef, setQuoteRef] = useState('')

  const currentSeason = getCurrentSeason()

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    guests: 2,
    children: 0,
    selectedDestinations: [] as string[],
    selectedHotel: '',
    mealPref: 'veg',
    selectedAdventures: [] as string[],
    selectedCar: '',
    wantGuide: false,
    wantPhotographer: false,
    wantFlightTickets: false,
    wantTrainTickets: false,
    dates: '',
    notes: '',
  })

  useEffect(() => {
    Promise.all([
      fetch('/api/destinations').then(r => r.json()),
      fetch('/api/hotels').then(r => r.json()),
      fetch('/api/adventures').then(r => r.json()),
    ]).then(([d, h, a]) => {
      setDestinations((d.destinations || []).map((x: Record<string, unknown>) => ({ id: x.id as string, name: x.name as string, area: x.area as string })))
      setHotels((h.hotels || []).map((x: Record<string, unknown>) => ({ id: x.id as string, name: x.name as string, destinationId: x.destinationId as string, type: x.type as string, priceFrom: x.priceFrom as number })))
      setAdventures((a.adventures || []).map((x: Record<string, unknown>) => ({ id: x.id as string, name: x.name as string, category: x.category as string, season: x.season as string, destinationId: x.destinationId as string, priceFrom: x.priceFrom as number })))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggleDestination = (id: string) => {
    setForm(f => ({
      ...f,
      selectedDestinations: f.selectedDestinations.includes(id)
        ? f.selectedDestinations.filter(d => d !== id)
        : [...f.selectedDestinations, id]
    }))
  }

  const toggleAdventure = (id: string) => {
    setForm(f => ({
      ...f,
      selectedAdventures: f.selectedAdventures.includes(id)
        ? f.selectedAdventures.filter(a => a !== id)
        : [...f.selectedAdventures, id]
    }))
  }

  // Filter adventures by current season
  const seasonalAdventures = adventures.filter(a => {
    const s = a.season.toLowerCase()
    if (currentSeason === 'Winter') return s.includes('dec') || s.includes('jan') || s.includes('feb') || s.includes('jan —') || s.includes('ski') || s.includes('snow') || s.includes('ice')
    if (currentSeason === 'Summer') return s.includes('may') || s.includes('jun') || s.includes('jul') || s.includes('aug') || s.includes('sep')
    if (currentSeason === 'Spring') return s.includes('mar') || s.includes('apr') || s.includes('may')
    if (currentSeason === 'Autumn') return s.includes('oct') || s.includes('nov')
    return true
  })

  const allAdventures = seasonalAdventures.length > 0 ? seasonalAdventures : adventures

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.phone) {
      pushToast({ type: 'error', title: 'Missing details', message: 'Please enter your name and phone number.' })
      return
    }

    setSubmitting(true)
    try {
      const destNames = form.selectedDestinations.map(id => destinations.find(d => d.id === id)?.name).filter(Boolean)
      const hotelName = hotels.find(h => h.id === form.selectedHotel)?.name || 'Not selected'
      const advNames = form.selectedAdventures.map(id => adventures.find(a => a.id === id)?.name).filter(Boolean)
      const carName = CARS.find(c => c.name === form.selectedCar)?.name || 'Not selected'

      const quoteDetails = [
        `Guests: ${form.guests} adults, ${form.children} children`,
        `Destinations: ${destNames.join(', ') || 'Flexible'}`,
        `Hotel: ${hotelName}`,
        `Meal: ${form.mealPref === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}`,
        `Adventures: ${advNames.join(', ') || 'None'}`,
        `Vehicle: ${carName}`,
        `Guide: ${form.wantGuide ? 'Yes' : 'No'}`,
        `Photographer: ${form.wantPhotographer ? 'Yes' : 'No'}`,
        `Flight tickets: ${form.wantFlightTickets ? 'Yes' : 'No'}`,
        `Train tickets: ${form.wantTrainTickets ? 'Yes' : 'No'}`,
        `Dates: ${form.dates || 'Flexible'}`,
      ].join('\n')

      const r = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email || 'not provided',
          phone: form.phone,
          destination: destNames.join(', ') || 'Custom multi-destination',
          dates: form.dates || 'Flexible',
          party: `${form.guests} adults, ${form.children} children`,
          notes: `${quoteDetails}\n\nAdditional: ${form.notes || 'None'}`,
        }),
      })

      if (r.ok) {
        const data = await r.json()
        setQuoteRef(`ELI-Q-${Date.now().toString().slice(-6)}`)
        setSubmitted(true)
        pushToast({ type: 'success', title: 'Quote request sent!', message: 'We will WhatsApp you within 1 hour.' })
      }
    } catch {
      pushToast({ type: 'error', title: 'Failed to send', message: 'Please try again or call us.' })
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-stone-50 pt-24 grid place-items-center p-4">
        <div className="max-w-md w-full bg-white ring-1 ring-stone-200 rounded-3xl p-8 text-center">
          <div className="grid place-items-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-semibold text-stone-950">Quote request submitted!</h1>
          <p className="text-sm text-stone-500 mt-2">Your reference: <span className="font-mono font-semibold text-stone-950">{quoteRef}</span></p>
          <p className="text-sm text-stone-500 mt-2">We will prepare a detailed quote with pricing and WhatsApp you within 1 hour.</p>
          <div className="mt-6 flex flex-col gap-2">
            <a href="https://wa.me/917006734747" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-green-600">
              Chat on WhatsApp
            </a>
            <button onClick={() => nav({ name: 'home' })} className="text-stone-500 hover:text-stone-900 text-sm py-2">Back to home</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="bg-stone-950 text-amber-50 pt-24 pb-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back home
          </button>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Plan Your Trip</h1>
          <p className="mt-2 text-sm sm:text-base text-stone-300">Tell us what you want. We will send you a detailed quote within 1 hour.</p>
          <div className="mt-3 inline-flex items-center gap-2 text-xs bg-amber-50/10 ring-1 ring-amber-50/20 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-amber-200/90">Current season: <strong>{currentSeason}</strong> · Adventures filtered accordingly</span>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        {/* Section 1: Basic Details */}
        <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-stone-950 mb-4 flex items-center gap-2"><Users className="w-4 h-4" /> Basic Details</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-medium block mb-1">Name *</label>
              <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="Your full name" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-medium block mb-1">Phone / WhatsApp *</label>
              <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="+91 ..." />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-medium block mb-1">Email (optional)</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="you@email.com" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-medium block mb-1">Travel dates (optional)</label>
              <input value={form.dates} onChange={e => setForm({...form, dates: e.target.value})} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="e.g. 12-19 Oct 2026" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-medium block mb-1 flex items-center gap-1"><Users className="w-3 h-3" /> Number of Guests</label>
              <input type="number" min="1" max="50" value={form.guests} onChange={e => setForm({...form, guests: Number(e.target.value)})} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.15em] text-stone-500 font-medium block mb-1 flex items-center gap-1"><Baby className="w-3 h-3" /> Number of Children</label>
              <input type="number" min="0" max="20" value={form.children} onChange={e => setForm({...form, children: Number(e.target.value)})} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
            </div>
          </div>
        </div>

        {/* Section 2: Destinations (multi-select) */}
        <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-stone-950 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Select Destinations</h2>
          <p className="text-xs text-stone-500 mb-3">Pick all the places you want to visit. Tap to select/deselect.</p>
          {loading ? <div className="text-sm text-stone-400">Loading destinations...</div> : (
            <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {destinations.map(d => (
                <button key={d.id} type="button" onClick={() => toggleDestination(d.id)}
                  className={`text-left text-xs px-3 py-2.5 rounded-xl ring-1 transition-all ${form.selectedDestinations.includes(d.id) ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-stone-50 text-stone-700 ring-stone-200 hover:ring-stone-400'}`}>
                  <div className="font-medium">{d.name}</div>
                  <div className="text-[10px] opacity-60">{d.area}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Hotel */}
        <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-stone-950 mb-3 flex items-center gap-2"><Hotel className="w-4 h-4" /> Hotel Preference</h2>
          <select value={form.selectedHotel} onChange={e => setForm({...form, selectedHotel: e.target.value})} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
            <option value="">No preference (let us pick)</option>
            {hotels.map(h => <option key={h.id} value={h.id}>{h.name} ({h.type}) · from Rs.{h.priceFrom}/night</option>)}
          </select>
        </div>

        {/* Section 4: Meal Preference */}
        <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-stone-950 mb-3 flex items-center gap-2"><Utensils className="w-4 h-4" /> Meal Preference</h2>
          <div className="flex gap-2">
            {['veg', 'nonveg'].map(m => (
              <button key={m} type="button" onClick={() => setForm({...form, mealPref: m})}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium ring-1 transition-all ${form.mealPref === m ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-stone-50 text-stone-700 ring-stone-200 hover:ring-stone-400'}`}>
                {m === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}
              </button>
            ))}
          </div>
        </div>

        {/* Section 5: Adventures (filtered by season) */}
        <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-stone-950 mb-3 flex items-center gap-2"><Mountain className="w-4 h-4" /> Adventures</h2>
          <p className="text-xs text-stone-500 mb-3">Filtered for <strong>{currentSeason}</strong> season. Tap to select multiple.</p>
          {loading ? <div className="text-sm text-stone-400">Loading adventures...</div> : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {allAdventures.map(a => (
                <button key={a.id} type="button" onClick={() => toggleAdventure(a.id)}
                  className={`text-left text-xs px-3 py-2.5 rounded-xl ring-1 transition-all ${form.selectedAdventures.includes(a.id) ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-stone-50 text-stone-700 ring-stone-200 hover:ring-stone-400'}`}>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-[10px] opacity-60">{a.category} · from Rs.{a.priceFrom}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section 6: Car Selection */}
        <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-stone-950 mb-3 flex items-center gap-2"><Car className="w-4 h-4" /> Vehicle Selection</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {CARS.map(c => (
              <button key={c.name} type="button" onClick={() => setForm({...form, selectedCar: c.name})}
                className={`text-left text-xs px-3 py-2.5 rounded-xl ring-1 transition-all ${form.selectedCar === c.name ? 'bg-stone-900 text-amber-50 ring-stone-900' : 'bg-stone-50 text-stone-700 ring-stone-200 hover:ring-stone-400'}`}>
                <div className="font-medium">{c.name}</div>
                <div className="text-[10px] opacity-60">{c.capacity} · Rs.{c.price}/day</div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 7: Add-ons */}
        <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-stone-950 mb-3">Add-ons</h2>
          <div className="space-y-2">
            {[
              { key: 'wantGuide', label: 'Local Guide', desc: 'Certified local guide for all destinations', Icon: Compass },
              { key: 'wantPhotographer', label: 'Photographer', desc: 'Professional photographer for your trip', Icon: Camera },
              { key: 'wantFlightTickets', label: 'Flight Tickets', desc: 'Book flights to Srinagar/Jammu/Leh', Icon: Plane },
              { key: 'wantTrainTickets', label: 'Train Tickets', desc: 'Book train tickets to Jammu/Srinagar', Icon: Train },
            ].map(item => (
              <label key={item.key} className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 ring-1 ring-stone-200 cursor-pointer hover:ring-stone-300 transition-all">
                <input type="checkbox" checked={form[item.key as keyof typeof form] as boolean} onChange={e => setForm({...form, [item.key]: e.target.checked})} className="w-4 h-4 accent-stone-900" />
                <item.Icon className="w-4 h-4 text-stone-600 shrink-0" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-stone-950">{item.label}</div>
                  <div className="text-[11px] text-stone-500">{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Section 8: Notes */}
        <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-stone-950 mb-3">Additional Notes</h2>
          <textarea rows={3} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400 resize-none" placeholder="Dietary restrictions, accessibility needs, must-see places, budget range..." />
        </div>

        {/* Submit */}
        <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 bg-stone-900 text-amber-50 rounded-2xl py-4 text-base font-semibold hover:bg-stone-700 disabled:opacity-50 transition-all">
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          {submitting ? 'Sending...' : 'Send Me The Quote'}
        </button>
        <p className="text-center text-xs text-stone-400 pb-4">We will prepare a detailed quote with pricing and WhatsApp you within 1 hour.</p>
      </form>
    </div>
  )
}
