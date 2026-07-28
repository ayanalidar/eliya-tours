'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Calendar, Clock, MapPin, Star, Check, MessageCircle } from 'lucide-react'
import { useNav } from '@/lib/router'
import { safeJsonParse, safeStringArray } from '@/lib/safe-parse'

// ============================================================
// Season detail page
// ============================================================

type Season = {
  id: string
  season: string
  months: string
  title: string
  theme: string
  description: string
  longDescription: string | null
  image: string
  color: string
  priceFrom: number
  duration: string
  isFeatured: boolean
  destinations: string
  itinerary: string
}

export function SeasonPage({ id }: { id: string }) {
  const nav = useNav()
  const [season, setSeason] = useState<Season | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/seasons?id=${encodeURIComponent(id)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.season) setSeason(data.season)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-stone-50"><div className="text-stone-500">Loading {id}…</div></div>
  }
  if (!season) {
    return <div className="min-h-screen grid place-items-center bg-stone-50"><div className="text-center"><p className="text-stone-500">Season not found.</p><button onClick={() => nav({ name: 'seasons' })} className="mt-3 text-stone-950 font-medium underline">Back to seasons</button></div></div>
  }

  const itinerary: Array<{ day: number; title: string; desc: string }> = safeJsonParse(season.itinerary, [])
  const destIds: string[] = safeStringArray(season.destinations)

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-stone-950">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${season.image})` }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${season.color}30, transparent 50%, rgba(0,0,0,0.4))` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />

        <div className="absolute top-5 left-5 right-5 z-20 flex items-center justify-between">
          <button onClick={() => nav({ name: 'seasons' })} className="inline-flex items-center gap-2 text-amber-50 bg-stone-950/50 backdrop-blur-md ring-1 ring-amber-50/20 px-3 py-2 rounded-full text-sm hover:bg-stone-950/70 transition-colors">
            <ArrowLeft className="w-4 h-4" />All seasons
          </button>
          {season.isFeatured && (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] font-medium text-stone-950 bg-amber-50 px-2.5 py-1 rounded-full">
              <Star className="w-3 h-3 fill-current" /> Signature
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 p-6 sm:p-10">
          <div className="mx-auto max-w-5xl">
            <p className="text-[11px] uppercase tracking-[0.22em] font-medium" style={{ color: season.color }}>
              {season.season} · {season.months} · {season.theme}
            </p>
            <h1 className="mt-2 text-4xl sm:text-6xl font-semibold tracking-tight text-amber-50">{season.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-amber-100/85">
              <span className="inline-flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{season.months}</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{season.duration}</span>
              <span className="inline-flex items-center gap-1.5">From <span className="font-semibold">₹{season.priceFrom.toLocaleString('en-IN')}</span>/ person</span>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950 mb-4">About this season</h2>
            <p className="text-base leading-relaxed text-stone-700">{season.longDescription || season.description}</p>

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <>
                <h3 className="mt-10 text-sm uppercase tracking-[0.18em] text-stone-500 font-semibold mb-4">Day-by-day plan</h3>
                <div className="space-y-3">
                  {itinerary.map((d) => (
                    <div key={d.day} className="bg-white ring-1 ring-stone-200 rounded-2xl p-4 flex gap-4">
                      <div className="shrink-0 grid place-items-center w-12 h-12 rounded-full text-amber-50 font-semibold" style={{ backgroundColor: season.color }}>
                        D{d.day}
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-950">{d.title}</h4>
                        <p className="text-sm text-stone-600 mt-0.5">{d.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* CTA */}
            <div className="mt-8 p-5 rounded-2xl text-amber-50" style={{ backgroundColor: season.color }}>
              <p className="text-sm font-medium">Book the {season.title} package</p>
              <p className="text-xs text-amber-50/80 mt-0.5">Starting at ₹{season.priceFrom.toLocaleString('en-IN')} per person · {season.duration}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => nav({ name: 'contact' })} className="inline-flex items-center gap-1.5 bg-amber-50 text-stone-900 rounded-full px-4 py-2 text-sm font-medium hover:bg-white transition-colors">
                  Enquire now <ArrowUpRight className="w-4 h-4" />
                </button>
                <button onClick={() => nav({ name: 'ai-guide' })} className="inline-flex items-center gap-1.5 bg-stone-950/30 ring-1 ring-amber-50/30 text-amber-50 rounded-full px-4 py-2 text-sm font-medium hover:bg-stone-950/50 transition-colors">
                  <MessageCircle className="w-4 h-4" /> Ask Tariq
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
            {/* Included destinations */}
            <div className="bg-white ring-1 ring-stone-200 rounded-2xl p-5">
              <h3 className="text-[11px] uppercase tracking-[0.18em] text-stone-500 font-semibold mb-3">Destinations included</h3>
              <div className="space-y-2">
                {destIds.map((dId) => (
                  <button
                    key={dId}
                    onClick={() => nav({ name: 'destination', id: dId })}
                    className="w-full text-left text-sm text-stone-700 hover:text-stone-950 flex items-center gap-2 capitalize"
                  >
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {dId.replace(/-/g, ' ')}
                    <ArrowUpRight className="w-3 h-3 ml-auto" />
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-stone-950 text-amber-50 rounded-2xl p-5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-amber-200/70">Starting price</p>
              <p className="text-3xl font-semibold mt-1 tabular-nums">₹{season.priceFrom.toLocaleString('en-IN')}</p>
              <p className="text-xs text-amber-200/70 mt-0.5">per person · {season.duration}</p>
              <ul className="mt-4 space-y-1.5 text-xs text-amber-100/85">
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-300" /> All stays + transfers</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-300" /> Local Eliya guide</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-300" /> Permits & entries</li>
                <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-amber-300" /> Wazwan welcome dinner</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
