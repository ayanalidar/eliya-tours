'use client'

import { useState } from 'react'
import { ArrowLeft, Train, Search, CalendarDays, Users, MapPin, Clock, Check, TrainFront, TrainTrack } from 'lucide-react'
import { useNav } from '@/lib/router'

const KASHMIR_STATIONS = [
  { code: 'SINA', name: 'Srinagar (SINA)', desc: 'New Udhampur–Baramulla line' },
  { code: 'UHP', name: 'Udhampur (UHP)', desc: 'Last major junction before Kashmir' },
  { code: 'JAT', name: 'Jammu Tawi (JAT)', desc: 'Main railhead for Jammu region' },
  { code: 'QBA', name: 'Banihal (QBA)', desc: 'Northern portal of Pir Panjal tunnel' },
]

const MAJOR_STATIONS = [
  { code: 'NDLS', name: 'New Delhi (NDLS)' },
  { code: 'BCT', name: 'Mumbai Central (BCT)' },
  { code: 'HWH', name: 'Howrah (HWH)' },
  { code: 'SBC', name: 'Bengaluru (SBC)' },
  { code: 'MAS', name: 'Chennai Central (MAS)' },
  { code: 'PUNE', name: 'Pune (PUNE)' },
]

const TRAINS = [
  { name: 'Shri Shakti Express', number: '12527', from: 'NDLS', to: 'SINA', depart: '19:00', arrive: '07:30+1', duration: '12h 30m', classes: ['1A', '2A', '3A', 'SL'], price: 850 },
  { name: 'Jammu Rajdhani', number: '12425', from: 'NDLS', to: 'JAT', depart: '20:40', arrive: '05:45+1', duration: '9h 05m', classes: ['1A', '2A', '3A'], price: 1200 },
  { name: 'Uttar Sampark Kranti', number: '12445', from: 'NDLS', to: 'UHP', depart: '08:35', arrive: '18:20', duration: '9h 45m', classes: ['1A', '2A', '3A', 'SL'], price: 650 },
  { name: 'Hemkunt Express', number: '14609', from: 'NDLS', to: 'JAT', depart: '06:25', arrive: '16:10', duration: '9h 45m', classes: ['2A', '3A', 'SL'], price: 550 },
  { name: 'Jhelum Express', number: '11077', from: 'PUNE', to: 'JAT', depart: '17:20', arrive: '04:30+2', duration: '31h 10m', classes: ['2A', '3A', 'SL'], price: 950 },
  { name: 'Sarvodaya Express', number: '12473', from: 'BCT', to: 'JAT', depart: '11:35', arrive: '14:30+1', duration: '26h 55m', classes: ['2A', '3A', 'SL'], price: 880 },
]

export function RailwayPage() {
  const nav = useNav()
  const [from, setFrom] = useState('NDLS')
  const [to, setTo] = useState('JAT')
  const [date, setDate] = useState('')
  const [classType, setClassType] = useState('3A')
  const [searched, setSearched] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearched(true)
  }

  const filtered = TRAINS.filter(t =>
    (t.from === from && t.to === to) ||
    (t.from === from && (to === 'JAT' || to === 'UHP' || to === 'SINA' || to === 'QBA'))
  )

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="bg-stone-950 text-amber-50 pt-24 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back home
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Train className="w-6 h-6 text-amber-200" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80 font-medium">Eliya Railway Booking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Train to Kashmir</h1>
          <p className="mt-2 text-sm sm:text-base text-stone-300 max-w-xl">The new Udhampur–Srinagar–Baramulla railway line connects Kashmir to the rest of India. Book your train tickets with us — including the iconic Vande Bharat and Shri Shakti Express.</p>
        </div>
      </div>

      {/* Search form */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-4">
        <form onSubmit={handleSearch} className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 sm:p-6 eliya-shadow-soft">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><TrainFront className="w-3 h-3" /> From Station</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
                {MAJOR_STATIONS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><TrainTrack className="w-3 h-3" /> To Station</label>
              <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
                {KASHMIR_STATIONS.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Journey Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><Users className="w-3 h-3" /> Class</label>
              <select value={classType} onChange={(e) => setClassType(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
                <option value="1A">1st AC (1A)</option>
                <option value="2A">2nd AC (2A)</option>
                <option value="3A">3rd AC (3A)</option>
                <option value="SL">Sleeper (SL)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-stone-900 text-amber-50 rounded-xl py-3 text-sm font-semibold hover:bg-stone-700">
            <Search className="w-4 h-4" /> Search Trains
          </button>
        </form>
      </div>

      {/* Results */}
      {searched && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
          <h2 className="text-lg font-semibold text-stone-950 mb-4">Available trains: {from} → {to}</h2>
          {filtered.length === 0 ? (
            <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-6 text-center text-sm text-stone-500">
              No direct trains found for this route. Try Jammu Tawi (JAT) or Udhampur (UHP) as your destination.
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((t) => (
                <div key={t.number} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 grid place-items-center">
                        <Train className="w-5 h-5 text-stone-700" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-stone-950">{t.name}</div>
                        <div className="text-xs text-stone-500">Train #{t.number}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-stone-950">{t.depart}</div>
                        <div className="text-xs text-stone-500">{t.from}</div>
                      </div>
                      <div className="flex items-center gap-1 text-stone-400">
                        <div className="h-px w-8 bg-stone-300" />
                        <Clock className="w-3 h-3" />
                        <div className="h-px w-8 bg-stone-300" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-stone-950">{t.arrive}</div>
                        <div className="text-xs text-stone-500">{t.to}</div>
                      </div>
                      <div className="text-xs text-stone-400">{t.duration}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-semibold tabular-nums text-stone-950">₹{(t.price * (classType === '1A' ? 3 : classType === '2A' ? 2 : 1)).toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-stone-400">{classType} · per person</div>
                      </div>
                      <button onClick={() => nav({ name: 'contact' })} className="bg-stone-900 text-amber-50 rounded-full px-4 py-2 text-xs font-medium hover:bg-stone-700">
                        Book
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-1.5">
                    {t.classes.map((c) => (
                      <span key={c} className={`text-[10px] px-1.5 py-0.5 rounded ${c === classType ? 'bg-amber-100 text-amber-900 font-semibold' : 'bg-stone-100 text-stone-500'}`}>{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 ring-1 ring-amber-200 text-sm text-amber-900 flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Eliya Tours handles railway booking as part of your package. Call <strong>+91 94190 12345</strong> for tatkal bookings and group reservations.</span>
          </div>
        </div>
      )}

      {/* Kashmir railway info */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-lg font-semibold text-stone-950 mb-4">Kashmir railway stations</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {KASHMIR_STATIONS.map((station) => (
            <div key={station.code} className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <h3 className="font-semibold text-stone-950">{station.name}</h3>
              </div>
              <p className="text-xs text-stone-500">{station.desc}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="bg-stone-900 text-amber-50 rounded-2xl p-5">
            <TrainFront className="w-6 h-6 text-amber-200 mb-2" />
            <h3 className="font-semibold text-sm">Vande Bharat Express</h3>
            <p className="text-xs text-amber-200/70 mt-1">Semi-high-speed train connecting Delhi to Kashmir in under 12 hours.</p>
          </div>
          <div className="bg-stone-900 text-amber-50 rounded-2xl p-5">
            <TrainTrack className="w-6 h-6 text-amber-200 mb-2" />
            <h3 className="font-semibold text-sm">Pir Panjal Tunnel</h3>
            <p className="text-xs text-amber-200/70 mt-1">India's longest railway tunnel (11.2 km) through the Pir Panjal range.</p>
          </div>
          <div className="bg-stone-900 text-amber-50 rounded-2xl p-5">
            <Train className="w-6 h-6 text-amber-200 mb-2" />
            <h3 className="font-semibold text-sm">Scenic Route</h3>
            <p className="text-xs text-amber-200/70 mt-1">The Banihal–Baramulla line offers breathtaking views of the Valley.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
