'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, MapPin, Mountain, CalendarDays, Star, Compass, TrendingUp, ShieldCheck, Check, Hotel } from 'lucide-react'
import { useNav } from '@/lib/router'
import { WeatherWidget } from '@/components/weather-widget'
import { WeatherAlert } from '@/components/weather-alert'
import { CircularProgress } from '@/components/sections/destinations-guide-section'
import { ReviewsSection } from '@/components/reviews-section'
import type { Destination } from '@/lib/destinations'
import { safeStringArray } from '@/lib/safe-parse'

// ============================================================
// Destination detail page
// ============================================================

type Hotel = {
  id: string
  name: string
  type: string
  starRating: number
  description: string
  longDescription: string | null
  image: string
  priceFrom: number
  amenities: string
  rooms: number
}

export function DestinationPage({ id }: { id: string }) {
  const nav = useNav()
  const [dest, setDest] = useState<Destination | null>(null)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    Promise.all([
      fetch(`/api/destinations?id=${encodeURIComponent(id)}`).then((r) => r.json()),
      fetch(`/api/hotels?destinationId=${encodeURIComponent(id)}`).then((r) => r.json()),
    ])
      .then(([dData, hData]) => {
        if (dData.destination) {
          const d = dData.destination
          setDest({
            id: d.id,
            name: d.name,
            region: d.region,
            area: d.area,
            elevation: d.elevation,
            bestSeason: d.bestSeason,
            tagline: d.tagline,
            description: d.description,
            longDescription: d.longDescription,
            image: d.image,
            accent: d.accent,
            latitude: d.latitude,
            longitude: d.longitude,
            stats: {
              rating: d.rating,
              visitors: d.visitors,
              curated: d.curated,
              safety: d.safety,
            },
            highlights: safeStringArray(d.highlights),
          })
        }
        if (hData.hotels) setHotels(hData.hotels)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-stone-50">
        <div className="text-stone-500">Loading {id}…</div>
      </div>
    )
  }

  if (!dest) {
    return (
      <div className="min-h-screen grid place-items-center bg-stone-50">
        <div className="text-center">
          <p className="text-stone-500">Destination not found.</p>
          <button onClick={() => nav({ name: 'destinations' })} className="mt-3 text-stone-950 font-medium underline">
            Back to destinations
          </button>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Rating', value: (dest.stats.rating / 5) * 100, suffix: dest.stats.rating.toFixed(1), accent: 'oklch(0.78 0.16 65)', Icon: Star },
    { label: 'Eliya-curated', value: dest.stats.curated, suffix: `${dest.stats.curated}%`, accent: dest.accent, Icon: Compass },
    { label: 'Trails walked', value: dest.stats.visitors, suffix: `${dest.stats.visitors}%`, accent: 'oklch(0.55 0.15 165)', Icon: TrendingUp },
    { label: 'Safety index', value: dest.stats.safety, suffix: `${dest.stats.safety}%`, accent: 'oklch(0.55 0.12 220)', Icon: ShieldCheck },
  ]

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-stone-950">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${dest.image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

        {/* Back */}
        <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
          <button
            onClick={() => nav({ name: 'destinations' })}
            className="inline-flex items-center gap-2 text-amber-50 bg-stone-950/50 backdrop-blur-md ring-1 ring-amber-50/20 px-3 py-2 rounded-full text-sm hover:bg-stone-950/70 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All destinations
          </button>
          <span className="text-[10px] uppercase tracking-[0.18em] text-amber-50/85 bg-stone-950/50 backdrop-blur-md ring-1 ring-amber-50/20 px-2.5 py-1 rounded-full">
            {dest.area}
          </span>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 sm:p-10">
          <div className="mx-auto max-w-5xl">
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/85 font-medium">
              {dest.tagline}
            </p>
            <h1 className="mt-2 text-4xl sm:text-6xl font-semibold tracking-tight text-amber-50">
              {dest.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-amber-100/85">
              <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{dest.region}</span>
              <span className="inline-flex items-center gap-1.5"><Mountain className="w-3.5 h-3.5" />{dest.elevation}</span>
              <span className="inline-flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" />{dest.bestSeason}</span>
              <span className="inline-flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />{dest.stats.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Weather alert (auto-shown if severe weather incoming) */}
        <div className="mb-6">
          <WeatherAlert
            latitude={dest.latitude}
            longitude={dest.longitude}
            destinationName={dest.name}
          />
        </div>
        {/* Stats rings */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-12">
          {stats.map((s, i) => (
            <div key={s.label} className="flex flex-col items-center bg-white rounded-2xl ring-1 ring-stone-200 p-4">
              <CircularProgress value={s.value} size={84} stroke={6} color={s.accent} delay={i * 120}>
                <div className="text-stone-900 font-semibold text-base tabular-nums leading-none">{s.suffix}</div>
                <div className="text-stone-500 mt-0.5"><s.Icon className="w-3.5 h-3.5" /></div>
              </CircularProgress>
              <div className="mt-2 text-[10px] uppercase tracking-[0.15em] text-stone-500 font-medium text-center">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
          {/* Long description + highlights */}
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950 mb-4">About {dest.name}</h2>
            <p className="text-base leading-relaxed text-stone-700">{dest.longDescription}</p>

            <h3 className="mt-8 text-sm uppercase tracking-[0.18em] text-stone-500 font-semibold mb-3">Signature experiences</h3>
            <ul className="grid sm:grid-cols-2 gap-2">
              {dest.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-stone-700 bg-white ring-1 ring-stone-200 rounded-xl p-3">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: dest.accent }} />
                  <span>{h}</span>
                </li>
              ))}
            </ul>

            {/* Hotels for this destination */}
            <h3 className="mt-10 text-sm uppercase tracking-[0.18em] text-stone-500 font-semibold mb-3 flex items-center gap-2">
              <Hotel className="w-4 h-4" />
              Where to stay in {dest.name}
            </h3>
            {hotels.length === 0 ? (
              <p className="text-sm text-stone-500">No hotels listed for this destination yet.</p>
            ) : (
              <div className="space-y-3">
                {hotels.map((h) => (
                  <div key={h.id} className="bg-white ring-1 ring-stone-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row">
                    <div
                      className="sm:w-40 h-32 sm:h-auto bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url(${h.image})` }}
                    />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-stone-500 font-medium">
                            <span>{h.type}</span>
                            <span className="text-amber-500">{'★'.repeat(h.starRating)}</span>
                          </div>
                          <h4 className="text-base font-semibold text-stone-950 mt-0.5">{h.name}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] uppercase tracking-[0.18em] text-stone-400">From</div>
                          <div className="text-base font-semibold text-stone-950 tabular-nums">₹{h.priceFrom.toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-stone-400">/ night</div>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-stone-600 line-clamp-2">{h.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 p-5 rounded-2xl bg-stone-900 text-amber-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium">Want to visit {dest.name}?</p>
                <p className="text-xs text-amber-200/70 mt-0.5">Get a custom itinerary in 24 hours.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => nav({ name: 'booking' })}
                  className="inline-flex items-center gap-1.5 bg-amber-50 text-stone-900 rounded-full px-4 py-2 text-sm font-medium hover:bg-white transition-colors"
                >
                  Book now
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => nav({ name: 'contact' })}
                  className="inline-flex items-center gap-1.5 bg-stone-800 ring-1 ring-amber-50/20 text-amber-50 rounded-full px-4 py-2 text-sm font-medium hover:bg-stone-700 transition-colors"
                >
                  Plan my trip
                </button>
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-10">
              <ReviewsSection destinationId={dest.id} accent={dest.accent} />
            </div>
          </div>

          {/* Weather sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <WeatherWidget
              latitude={dest.latitude}
              longitude={dest.longitude}
              destinationName={dest.name}
              accent={dest.accent}
            />

            {/* AI guide CTA */}
            <div className="mt-4 p-5 rounded-2xl bg-white ring-1 ring-stone-200">
              <p className="text-sm font-medium text-stone-900">Ask Tariq about {dest.name}</p>
              <p className="text-xs text-stone-500 mt-1">Our AI guide can answer any question or design a custom trip.</p>
              <button
                onClick={() => nav({ name: 'ai-guide' })}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-stone-900 text-amber-50 rounded-xl py-2.5 text-sm font-medium hover:bg-stone-700 transition-colors"
              >
                Chat with Tariq
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
