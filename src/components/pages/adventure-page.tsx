'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Clock, Users, Mountain, Shield, CalendarDays, Check, ArrowUpRight, MessageCircle } from 'lucide-react'
import { useNav } from '@/lib/router'
import { useApp } from '@/lib/app-context'
import { WeatherWidget } from '@/components/weather-widget'

type Adventure = {
  id: string
  name: string
  category: string
  destinationId: string
  season: string
  description: string
  longDescription: string | null
  image: string
  priceFrom: number
  duration: string
  difficulty: string
  minAge: number
  maxGroup: number
  gear: string[]
  safety: string[]
}

type Destination = { id: string; name: string; latitude: number; longitude: number; accent: string; region: string; elevation: string }

export function AdventurePage({ id }: { id: string }) {
  const nav = useNav()
  const { convertPrice, pushToast } = useApp()
  const [adv, setAdv] = useState<Adventure | null>(null)
  const [dest, setDest] = useState<Destination | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/adventures').then((r) => r.json()),
      fetch('/api/destinations').then((r) => r.json()),
    ])
      .then(([aData, dData]) => {
        const found = (aData.adventures || []).find((a: Adventure & { gear: string; safety: string }) => a.id === id)
        if (found) {
          setAdv({
            ...found,
            gear: JSON.parse(found.gear || '[]'),
            safety: JSON.parse(found.safety || '[]'),
          })
          const d = (dData.destinations || []).find((x: Destination) => x.id === found.destinationId)
          if (d) setDest(d)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen grid place-items-center bg-stone-50"><div className="text-stone-500">Loading…</div></div>
  if (!adv) return (
    <div className="min-h-screen grid place-items-center bg-stone-50">
      <div className="text-center">
        <p className="text-stone-500">Adventure not found.</p>
        <button onClick={() => nav({ name: 'adventures' })} className="mt-3 text-stone-950 font-medium underline">Back to adventures</button>
      </div>
    </div>
  )

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-stone-950">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${adv.image})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

        <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
          <button onClick={() => nav({ name: 'adventures' })} className="inline-flex items-center gap-2 text-amber-50 bg-stone-950/50 backdrop-blur-md ring-1 ring-amber-50/20 px-3 py-2 rounded-full text-sm hover:bg-stone-950/70 transition-colors">
            <ArrowLeft className="w-4 h-4" />All adventures
          </button>
          <span className="inline-flex items-center text-[10px] uppercase tracking-[0.18em] text-amber-50 bg-stone-950/55 backdrop-blur-md ring-1 ring-amber-50/20 px-2.5 py-1 rounded-full">
            {adv.category}
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 sm:p-10">
          <div className="mx-auto max-w-5xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/85 font-medium capitalize">{dest?.name || adv.destinationId.replace(/-/g, ' ')} · {adv.difficulty}</p>
            <h1 className="mt-2 text-4xl sm:text-6xl font-semibold tracking-tight text-amber-50">{adv.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-amber-100/85">
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{adv.season}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{adv.duration}</span>
              <span className="inline-flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Max {adv.maxGroup} people · Min age {adv.minAge}</span>
              <span className="inline-flex items-center gap-1.5"><Mountain className="w-3.5 h-3.5" />{adv.difficulty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950 mb-4">About this adventure</h2>
            <p className="text-base leading-relaxed text-stone-700">{adv.longDescription || adv.description}</p>

            {/* Gear list */}
            <h3 className="mt-8 text-sm uppercase tracking-[0.18em] text-stone-500 font-semibold mb-3">Gear included / required</h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {adv.gear.map((g) => (
                <li key={g} className="flex items-start gap-2 text-sm text-stone-700 bg-white ring-1 ring-stone-200 rounded-xl p-3">
                  <Check className="w-3.5 h-3.5 text-green-600 mt-0.5 shrink-0" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>

            {/* Safety */}
            <h3 className="mt-8 text-sm uppercase tracking-[0.18em] text-stone-500 font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />Safety protocols
            </h3>
            <ul className="space-y-2">
              {adv.safety.map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-stone-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-8 p-5 rounded-2xl bg-stone-900 text-amber-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Ready for {adv.name}?</p>
                <p className="text-xs text-amber-200/70 mt-0.5">Starting at {convertPrice(adv.priceFrom).formatted} per person</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => nav({ name: 'booking', packageId: adv.id })} className="inline-flex items-center gap-1.5 bg-amber-50 text-stone-900 rounded-full px-4 py-2 text-sm font-medium hover:bg-white transition-colors">
                  Book now <ArrowUpRight className="w-4 h-4" />
                </button>
                <button onClick={() => nav({ name: 'ai-guide' })} className="inline-flex items-center gap-1.5 bg-stone-800 ring-1 ring-amber-50/20 text-amber-50 rounded-full px-4 py-2 text-sm font-medium hover:bg-stone-700 transition-colors">
                  <MessageCircle className="w-4 h-4" /> Ask Tariq
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            {/* Pricing */}
            <div className="bg-stone-950 text-amber-50 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-amber-200/70">Starting price</p>
              <p className="text-3xl font-semibold mt-1 tabular-nums">{convertPrice(adv.priceFrom).formatted}</p>
              <p className="text-xs text-amber-200/70 mt-0.5">per person · {adv.duration}</p>
              <div className="mt-4 space-y-1.5 text-xs text-amber-100/85">
                <div className="flex justify-between"><span>Max group size</span><span className="font-medium">{adv.maxGroup}</span></div>
                <div className="flex justify-between"><span>Minimum age</span><span className="font-medium">{adv.minAge}+</span></div>
                <div className="flex justify-between"><span>Difficulty</span><span className="font-medium">{adv.difficulty}</span></div>
                <div className="flex justify-between"><span>Season</span><span className="font-medium">{adv.season}</span></div>
              </div>
            </div>

            {/* Weather for the destination */}
            {dest && (
              <WeatherWidget
                latitude={dest.latitude}
                longitude={dest.longitude}
                destinationName={dest.name}
                accent={dest.accent}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
