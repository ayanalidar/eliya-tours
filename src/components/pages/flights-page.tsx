'use client'

import { useState } from 'react'
import { ArrowLeft, Plane, Search, CalendarDays, Users, MapPin, Clock, Check, ArrowRight, PlaneTakeoff, PlaneLanding } from 'lucide-react'
import { useNav } from '@/lib/router'

const KASHMIR_AIRPORTS = [
  { code: 'SXR', name: 'Srinagar (SXR)', city: 'Srinagar' },
  { code: 'IXJ', name: 'Jammu (IXJ)', city: 'Jammu' },
  { code: 'IXL', name: 'Leh (IXL)', city: 'Leh' },
]

const MAJOR_CITIES = [
  { code: 'DEL', name: 'Delhi (DEL)' },
  { code: 'BOM', name: 'Mumbai (BOM)' },
  { code: 'BLR', name: 'Bengaluru (BLR)' },
  { code: 'MAA', name: 'Chennai (MAA)' },
  { code: 'HYD', name: 'Hyderabad (HYD)' },
  { code: 'CCU', name: 'Kolkata (CCU)' },
  { code: 'AMD', name: 'Ahmedabad (AMD)' },
  { code: 'GOI', name: 'Goa (GOI)' },
]

export function FlightsPage() {
  const nav = useNav()
  const [from, setFrom] = useState('DEL')
  const [to, setTo] = useState('SXR')
  const [date, setDate] = useState('')
  const [travellers, setTravellers] = useState('1 Adult')
  const [searched, setSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
  }

  const swap = () => { const t = from; setFrom(to); setTo(t) }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="bg-stone-950 text-amber-50 pt-24 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back home
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Plane className="w-6 h-6 text-amber-200" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80 font-medium">Eliya Flight Booking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Fly to Kashmir & Ladakh</h1>
          <p className="mt-2 text-sm sm:text-base text-stone-300 max-w-xl">Book flights to Srinagar, Jammu, and Leh with the best fares. We partner with all major airlines serving the region.</p>
        </div>
      </div>

      {/* Search form */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-4">
        <form onSubmit={handleSearch} className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 sm:p-6 eliya-shadow-soft">
          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><PlaneTakeoff className="w-3 h-3" /> From</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
                {[...MAJOR_CITIES, ...KASHMIR_AIRPORTS].map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}
              </select>
            </div>
            <button type="button" onClick={swap} className="hidden sm:grid place-items-center w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 mb-1" aria-label="Swap">
              <ArrowRight className="w-4 h-4" />
            </button>
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><PlaneLanding className="w-3 h-3" /> To</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
                {[...KASHMIR_AIRPORTS, ...MAJOR_CITIES].map((a) => <option key={a.code} value={a.code}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><Users className="w-3 h-3" /> Travellers</label>
              <select value={travellers} onChange={(e) => setTravellers(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
                <option>1 Adult</option><option>2 Adults</option><option>2 Adults, 1 Child</option><option>2 Adults, 2 Children</option><option>4 Adults</option>
              </select>
            </div>
          </div>
          <button type="submit" className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-stone-900 text-amber-50 rounded-xl py-3 text-sm font-semibold hover:bg-stone-700">
            <Search className="w-4 h-4" /> Search Flights
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-lg font-semibold text-stone-950 mb-4">Available flights: {from} → {to}</h2>
          <div className="space-y-3">
            {/* Mock flight results */}
            {[
              { airline: 'IndiGo', flight: '6E-123', depart: '08:00', arrive: '09:30', duration: '1h 30m', price: 4500, stops: 'Non-stop' },
              { airline: 'Air India', flight: 'AI-821', depart: '10:15', arrive: '12:00', duration: '1h 45m', price: 5200, stops: 'Non-stop' },
              { airline: 'SpiceJet', flight: 'SG-815', depart: '14:30', arrive: '16:00', duration: '1h 30m', price: 4200, stops: 'Non-stop' },
              { airline: 'Vistara', flight: 'UK-711', depart: '17:45', arrive: '19:15', duration: '1h 30m', price: 5800, stops: 'Non-stop' },
            ].map((f) => (
              <div key={f.flight} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-stone-100 grid place-items-center">
                    <Plane className="w-5 h-5 text-stone-700" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-stone-950">{f.airline}</div>
                    <div className="text-xs text-stone-500">{f.flight} · {f.stops}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold text-stone-950">{f.depart}</div>
                    <div className="text-xs text-stone-500">{from}</div>
                  </div>
                  <div className="flex items-center gap-1 text-stone-400">
                    <div className="h-px w-8 bg-stone-300" />
                    <Clock className="w-3 h-3" />
                    <div className="h-px w-8 bg-stone-300" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-stone-950">{f.arrive}</div>
                    <div className="text-xs text-stone-500">{to}</div>
                  </div>
                  <div className="text-xs text-stone-400">{f.duration}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-semibold tabular-nums text-stone-950">₹{f.price.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-stone-400">per person</div>
                  </div>
                  <button onClick={() => nav({ name: 'contact' })} className="bg-stone-900 text-amber-50 rounded-full px-4 py-2 text-xs font-medium hover:bg-stone-700">
                    Book
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 ring-1 ring-amber-200 text-sm text-amber-900 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Eliya Tours handles flight booking as part of your package. Call <strong>+91 94190 12345</strong> for the best fares and group discounts.</span>
          </div>
        </div>
      )}

      {/* Info section */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid sm:grid-cols-3 gap-4">
          {KASHMIR_AIRPORTS.map((airport) => (
            <div key={airport.code} className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-stone-950">{airport.name}</h3>
              </div>
              <p className="text-xs text-stone-500">
                {airport.city === 'Srinagar' && 'Main gateway to Kashmir Valley. 30 min from Dal Lake.'}
                {airport.city === 'Jammu' && 'Gateway to Vaishno Devi and Kashmir road trips. 60 km from Katra.'}
                {airport.city === 'Leh' && 'High-altitude airport (3,256 m). Acclimatization required on arrival.'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
