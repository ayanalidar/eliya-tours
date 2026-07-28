'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Plane, Train, Search, CalendarDays, Users, MapPin, Clock, Check, ArrowRight, PlaneTakeoff, PlaneLanding, TrainFront, Ticket, Loader2, User, Mail, Phone, X } from 'lucide-react'
import { useNav } from '@/lib/router'
import { useApp } from '@/lib/app-context'

type Tab = 'flights' | 'trains'
type BookingStep = 'search' | 'results' | 'passenger' | 'confirm'

type FlightResult = {
  airline: string
  flight: string
  depart: string
  arrive: string
  duration: string
  price: number
  stops: string
  fromCode: string
  toCode: string
}

type TrainResult = {
  name: string
  number: string
  depart: string
  arrive: string
  duration: string
  classes: string[]
  price: number
  fromCode: string
  toCode: string
}

const FLIGHT_AIRPORTS = [
  { code: 'DEL', name: 'Delhi (DEL)' },
  { code: 'BOM', name: 'Mumbai (BOM)' },
  { code: 'BLR', name: 'Bengaluru (BLR)' },
  { code: 'MAA', name: 'Chennai (MAA)' },
  { code: 'HYD', name: 'Hyderabad (HYD)' },
  { code: 'CCU', name: 'Kolkata (CCU)' },
  { code: 'SXR', name: 'Srinagar (SXR)' },
  { code: 'IXJ', name: 'Jammu (IXJ)' },
  { code: 'IXL', name: 'Leh (IXL)' },
]

const TRAIN_STATIONS = [
  { code: 'NDLS', name: 'New Delhi (NDLS)' },
  { code: 'BCT', name: 'Mumbai Central (BCT)' },
  { code: 'HWH', name: 'Howrah (HWH)' },
  { code: 'SBC', name: 'Bengaluru (SBC)' },
  { code: 'JAT', name: 'Jammu Tawi (JAT)' },
  { code: 'UHP', name: 'Udhampur (UHP)' },
  { code: 'SINA', name: 'Srinagar (SINA)' },
]

export function TicketsPage() {
  const nav = useNav()
  const { pushToast } = useApp()
  const [tab, setTab] = useState<Tab>('flights')
  const [step, setStep] = useState<BookingStep>('search')
  const [loading, setLoading] = useState(false)

  // Form state
  const [from, setFrom] = useState('DEL')
  const [to, setTo] = useState('SXR')
  const [date, setDate] = useState('')
  const [passengers, setPassengers] = useState('1 Adult')
  const [classType, setClassType] = useState('3A')

  // Results
  const [results, setResults] = useState<FlightResult[] | TrainResult[]>([])
  const [selectedItem, setSelectedItem] = useState<FlightResult | TrainResult | null>(null)

  // Passenger form
  const [paxForm, setPaxForm] = useState({ name: '', email: '', phone: '' })
  const [confirmed, setConfirmed] = useState(false)

  const swap = () => { const t = from; setFrom(to); setTo(t) }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStep('results')

    // Simulate API call delay
    await new Promise(r => setTimeout(r, 800))

    if (tab === 'flights') {
      // Generate realistic mock flight data
      const airlines = [
        { name: 'IndiGo', code: '6E', basePrice: 4200 },
        { name: 'Air India', code: 'AI', basePrice: 5200 },
        { name: 'SpiceJet', code: 'SG', basePrice: 3900 },
        { name: 'Vistara', code: 'UK', basePrice: 5800 },
        { name: 'Akasa Air', code: 'QP', basePrice: 4600 },
      ]
      const times = ['08:00', '10:15', '12:30', '14:45', '17:00', '19:30']
      const flightResults: FlightResult[] = airlines.map((a, i) => {
        const dur = 90 + Math.floor(Math.random() * 60)
        const depMin = parseInt(times[i].split(':')[0]) * 60 + parseInt(times[i].split(':')[1])
        const arrMin = depMin + dur
        const arrH = Math.floor(arrMin / 60) % 24
        const arrM = arrMin % 60
        return {
          airline: a.name,
          flight: `${a.code}-${100 + i * 23}`,
          depart: times[i],
          arrive: `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`,
          duration: `${Math.floor(dur / 60)}h ${dur % 60}m`,
          price: a.basePrice + Math.floor(Math.random() * 500),
          stops: Math.random() > 0.7 ? '1 stop' : 'Non-stop',
          fromCode: from,
          toCode: to,
        }
      })
      setResults(flightResults.sort((a, b) => a.price - b.price))
    } else {
      // Generate realistic mock train data
      const trains: TrainResult[] = [
        { name: 'Shri Shakti Express', number: '12527', depart: '19:00', arrive: '07:30', duration: '12h 30m', classes: ['1A', '2A', '3A', 'SL'], price: 850, fromCode: from, toCode: to },
        { name: 'Jammu Rajdhani', number: '12425', depart: '20:40', arrive: '05:45', duration: '9h 05m', classes: ['1A', '2A', '3A'], price: 1200, fromCode: from, toCode: to },
        { name: 'Uttar Sampark Kranti', number: '12445', depart: '08:35', arrive: '18:20', duration: '9h 45m', classes: ['1A', '2A', '3A', 'SL'], price: 650, fromCode: from, toCode: to },
        { name: 'Hemkunt Express', number: '14609', depart: '06:25', arrive: '16:10', duration: '9h 45m', classes: ['2A', '3A', 'SL'], price: 550, fromCode: from, toCode: to },
        { name: 'Vande Bharat Express', number: '22439', depart: '06:00', arrive: '14:00', duration: '8h 00m', classes: ['CC', 'EC'], price: 1600, fromCode: from, toCode: to },
      ]
      setResults(trains)
    }

    setLoading(false)
  }

  const selectItem = (item: FlightResult | TrainResult) => {
    setSelectedItem(item)
    setStep('passenger')
  }

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Submit booking to the enquiries API (as a ticket booking request)
    const isFlight = tab === 'flights'
    const item = selectedItem as FlightResult | TrainResult
    const itemName = isFlight ? `${(item as FlightResult).airline} ${(item as FlightResult).flight}` : `${(item as TrainResult).name} (#${(item as TrainResult).number})`
    const price = isFlight ? (item as FlightResult).price : (item as TrainResult).price * (classType === '1A' ? 3 : classType === '2A' ? 2 : 1)

    await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: paxForm.name,
        email: paxForm.email,
        phone: paxForm.phone,
        destination: `${isFlight ? 'Flight' : 'Train'}: ${from} → ${to}`,
        dates: date || 'Flexible',
        party: `${passengers} · ${itemName} · ${isFlight ? '' : classType + ' · '}₹${price}`,
        notes: `Ticket booking request via Eliya Tickets page. ${isFlight ? 'Flight' : 'Train'}: ${itemName}, ${from}→${to}, Depart: ${item.depart}, Arrive: ${item.arrive}`,
      }),
    })

    setLoading(false)
    setConfirmed(true)
    pushToast({ type: 'success', title: 'Booking request submitted!', message: 'We will confirm via WhatsApp within 1 hour.' })
  }

  const reset = () => {
    setStep('search')
    setResults([])
    setSelectedItem(null)
    setConfirmed(false)
    setPaxForm({ name: '', email: '', phone: '' })
  }

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="bg-stone-950 text-amber-50 pt-24 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav({ name: 'home' })} className="inline-flex items-center gap-2 text-amber-50/85 hover:text-amber-50 text-sm mb-6">
            <ArrowLeft className="w-4 h-4" /> Back home
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Ticket className="w-6 h-6 text-amber-200" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-amber-200/80 font-medium">Eliya Ticket Booking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Book Flights & Trains</h1>
          <p className="mt-2 text-sm sm:text-base text-stone-300 max-w-xl">Fly to Srinagar, Jammu, or Leh · or take the scenic train through the Pir Panjal tunnel. We handle all bookings.</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-4">
        <div className="flex gap-1 p-1 bg-white ring-1 ring-stone-200 rounded-2xl w-fit">
          <button
            onClick={() => { setTab('flights'); reset() }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'flights' ? 'bg-stone-900 text-amber-50' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            <Plane className="w-4 h-4" /> Flights
          </button>
          <button
            onClick={() => { setTab('trains'); reset() }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === 'trains' ? 'bg-stone-900 text-amber-50' : 'text-stone-600 hover:bg-stone-100'}`}
          >
            <Train className="w-4 h-4" /> Trains
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        {/* STEP 1: Search */}
        {step === 'search' && (
          <form onSubmit={handleSearch} className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 sm:p-6 eliya-shadow-soft">
            <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1">
                  {tab === 'flights' ? <PlaneTakeoff className="w-3 h-3" /> : <TrainFront className="w-3 h-3" />}
                  From
                </label>
                <select value={from} onChange={(e) => setFrom(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
                  {(tab === 'flights' ? FLIGHT_AIRPORTS : TRAIN_STATIONS).map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>
              <button type="button" onClick={swap} className="hidden sm:grid place-items-center w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 mb-1" aria-label="Swap">
                <ArrowRight className="w-4 h-4" />
              </button>
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1">
                  {tab === 'flights' ? <PlaneLanding className="w-3 h-3" /> : <TrainFront className="w-3 h-3" />}
                  To
                </label>
                <select value={to} onChange={(e) => setTo(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
                  {(tab === 'flights' ? FLIGHT_AIRPORTS : TRAIN_STATIONS).map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><Users className="w-3 h-3" /> {tab === 'flights' ? 'Passengers' : 'Class'}</label>
                {tab === 'flights' ? (
                  <select value={passengers} onChange={(e) => setPassengers(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
                    <option>1 Adult</option><option>2 Adults</option><option>2 Adults, 1 Child</option><option>4 Adults</option>
                  </select>
                ) : (
                  <select value={classType} onChange={(e) => setClassType(e.target.value)} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400">
                    <option value="1A">1st AC (1A)</option><option value="2A">2nd AC (2A)</option><option value="3A">3rd AC (3A)</option><option value="SL">Sleeper (SL)</option><option value="CC">Chair Car (CC)</option>
                  </select>
                )}
              </div>
            </div>
            <button type="submit" className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-stone-900 text-amber-50 rounded-xl py-3 text-sm font-semibold hover:bg-stone-700">
              <Search className="w-4 h-4" /> Search {tab === 'flights' ? 'Flights' : 'Trains'}
            </button>
          </form>
        )}

        {/* STEP 2: Results */}
        {step === 'results' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-stone-950">
                {loading ? 'Searching…' : `${results.length} ${tab === 'flights' ? 'flights' : 'trains'} found`}
              </h2>
              <button onClick={reset} className="text-xs text-stone-500 hover:text-stone-900">← New search</button>
            </div>

            {loading ? (
              <div className="grid place-items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                <p className="text-sm text-stone-500 mt-3">Fetching live availability…</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tab === 'flights' ? (
                  (results as FlightResult[]).map((f) => (
                    <div key={f.flight} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 hover:ring-stone-300 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-stone-100 grid place-items-center shrink-0">
                          <Plane className="w-5 h-5 text-stone-700" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-stone-950">{f.airline}</div>
                          <div className="text-xs text-stone-500">{f.flight} · {f.stops}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-stone-950">{f.depart}</div>
                          <div className="text-xs text-stone-500">{f.fromCode}</div>
                        </div>
                        <div className="flex items-center gap-1 text-stone-400">
                          <div className="h-px w-6 bg-stone-300" />
                          <Clock className="w-3 h-3" />
                          <div className="h-px w-6 bg-stone-300" />
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-stone-950">{f.arrive}</div>
                          <div className="text-xs text-stone-500">{f.toCode}</div>
                        </div>
                        <div className="text-xs text-stone-400 hidden sm:block">{f.duration}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-lg font-semibold tabular-nums text-stone-950">₹{f.price.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-stone-400">per person</div>
                        </div>
                        <button onClick={() => selectItem(f)} className="bg-stone-900 text-amber-50 rounded-full px-4 py-2 text-xs font-medium hover:bg-stone-700 whitespace-nowrap">
                          Select
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  (results as TrainResult[]).map((t) => (
                    <div key={t.number} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4 hover:ring-stone-300 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-stone-100 grid place-items-center shrink-0">
                            <Train className="w-5 h-5 text-stone-700" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-stone-950">{t.name}</div>
                            <div className="text-xs text-stone-500">#{t.number}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-stone-950">{t.depart}</div>
                            <div className="text-xs text-stone-500">{t.fromCode}</div>
                          </div>
                          <div className="flex items-center gap-1 text-stone-400">
                            <div className="h-px w-6 bg-stone-300" />
                            <Clock className="w-3 h-3" />
                            <div className="h-px w-6 bg-stone-300" />
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-stone-950">{t.arrive}</div>
                            <div className="text-xs text-stone-500">{t.toCode}</div>
                          </div>
                          <div className="text-xs text-stone-400 hidden sm:block">{t.duration}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-lg font-semibold tabular-nums text-stone-950">₹{(t.price * (classType === '1A' ? 3 : classType === '2A' ? 2 : classType === 'CC' ? 1.5 : 1)).toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-stone-400">{classType}</div>
                          </div>
                          <button onClick={() => selectItem(t)} className="bg-stone-900 text-amber-50 rounded-full px-4 py-2 text-xs font-medium hover:bg-stone-700 whitespace-nowrap">
                            Select
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex gap-1.5">
                        {t.classes.map((c) => (
                          <span key={c} className={`text-[10px] px-1.5 py-0.5 rounded ${c === classType ? 'bg-amber-100 text-amber-900 font-semibold' : 'bg-stone-100 text-stone-500'}`}>{c}</span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: Passenger details */}
        {step === 'passenger' && selectedItem && !confirmed && (
          <div>
            <button onClick={() => setStep('results')} className="text-xs text-stone-500 hover:text-stone-900 mb-4">← Back to results</button>
            <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 mb-4">
              <h3 className="text-sm font-semibold text-stone-950 mb-3">Booking summary</h3>
              {tab === 'flights' ? (
                <div className="text-sm text-stone-600 space-y-1">
                  <div className="font-medium text-stone-950">{(selectedItem as FlightResult).airline} {(selectedItem as FlightResult).flight}</div>
                  <div>{(selectedItem as FlightResult).fromCode} → {(selectedItem as FlightResult).toCode} · {(selectedItem as FlightResult).depart} - {(selectedItem as FlightResult).arrive}</div>
                  <div>{(selectedItem as FlightResult).duration} · {(selectedItem as FlightResult).stops}</div>
                  <div className="text-lg font-semibold text-stone-950 mt-2">₹{(selectedItem as FlightResult).price.toLocaleString('en-IN')} <span className="text-xs font-normal text-stone-400">per person</span></div>
                </div>
              ) : (
                <div className="text-sm text-stone-600 space-y-1">
                  <div className="font-medium text-stone-950">{(selectedItem as TrainResult).name} #{(selectedItem as TrainResult).number}</div>
                  <div>{(selectedItem as TrainResult).fromCode} → {(selectedItem as TrainResult).toCode} · {(selectedItem as TrainResult).depart} - {(selectedItem as TrainResult).arrive}</div>
                  <div>{(selectedItem as TrainResult).duration} · Class: {classType}</div>
                  <div className="text-lg font-semibold text-stone-950 mt-2">₹{((selectedItem as TrainResult).price * (classType === '1A' ? 3 : classType === '2A' ? 2 : classType === 'CC' ? 1.5 : 1)).toLocaleString('en-IN')} <span className="text-xs font-normal text-stone-400">per person</span></div>
                </div>
              )}
            </div>

            <form onSubmit={submitBooking} className="bg-white ring-1 ring-stone-200 rounded-2xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-stone-950">Passenger details</h3>
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><User className="w-3 h-3" /> Full name *</label>
                <input required value={paxForm.name} onChange={(e) => setPaxForm({ ...paxForm, name: e.target.value })} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="As per ID proof" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><Mail className="w-3 h-3" /> Email *</label>
                <input required type="email" value={paxForm.email} onChange={(e) => setPaxForm({ ...paxForm, email: e.target.value })} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="you@email.com" />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-medium block mb-1.5 flex items-center gap-1"><Phone className="w-3 h-3" /> WhatsApp / Phone *</label>
                <input required type="tel" value={paxForm.phone} onChange={(e) => setPaxForm({ ...paxForm, phone: e.target.value })} className="w-full bg-stone-50 ring-1 ring-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400" placeholder="+91 ..." />
              </div>
              <button type="submit" disabled={loading} className="w-full inline-flex items-center justify-center gap-2 bg-stone-900 text-amber-50 rounded-xl py-3 text-sm font-semibold hover:bg-stone-700 disabled:opacity-50">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {loading ? 'Submitting…' : 'Confirm booking request'}
              </button>
              <p className="text-[11px] text-stone-400 text-center">We'll confirm availability and payment via WhatsApp within 1 hour.</p>
            </form>
          </div>
        )}

        {/* STEP 4: Confirmation */}
        {confirmed && (
          <div className="max-w-md mx-auto bg-white ring-1 ring-stone-200 rounded-3xl p-8 text-center mt-8">
            <div className="grid place-items-center w-16 h-16 rounded-full bg-green-100 text-green-600 mx-auto mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold text-stone-950">Booking request submitted!</h2>
            <p className="text-sm text-stone-500 mt-2">We've received your {tab === 'flights' ? 'flight' : 'train'} booking request. Our team will confirm availability and arrange payment via WhatsApp within 1 hour.</p>
            <div className="mt-6 flex flex-col gap-2">
              <a href="https://wa.me/917006734747" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-green-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-green-600">
                Chat on WhatsApp
              </a>
              <button onClick={reset} className="text-stone-500 hover:text-stone-900 text-sm py-2">Book another ticket</button>
              <button onClick={() => nav({ name: 'home' })} className="text-stone-500 hover:text-stone-900 text-sm py-2">Back to home</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
