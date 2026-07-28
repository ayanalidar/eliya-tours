'use client'

import { useEffect, useRef, useState } from 'react'
import { Star, TrendingUp, ShieldCheck, Compass, ArrowUpRight } from 'lucide-react'
import { destinations as fallbackDestinations, type Destination } from '@/lib/destinations'
import { useNav } from '@/lib/router'
import { safeStringArray } from '@/lib/safe-parse'

// ============================================================
// Circular progress ring (animated on first visibility)
// ============================================================
type RingStat = {
  label: string
  value: number // 0-100
  icon: React.ReactNode
  suffix?: string
  accent: string
}

export function CircularProgress({
  value,
  size = 96,
  stroke = 7,
  color,
  delay = 0,
  children,
}: {
  value: number
  size?: number
  stroke?: number
  color: string
  delay?: number
  children?: React.ReactNode
}) {
  const ref = useRef<SVGSVGElement>(null)
  const [visible, setVisible] = useState(false)
  const [animatedValue, setAnimatedValue] = useState(0)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.35 }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const start = performance.now()
    const duration = 1400
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      setAnimatedValue(eased * value)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    const timer = setTimeout(() => {
      raf = requestAnimationFrame(tick)
    }, delay)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [visible, value, delay])

  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (animatedValue / 100) * circumference

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="overflow-visible"
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth={stroke}
      />
      {/* Progress */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))' }}
      />
      {/* Children rendered as foreignObject for HTML inside SVG */}
      <foreignObject x="0" y="0" width={size} height={size}>
        <div className="w-full h-full flex flex-col items-center justify-center text-center">
          {children}
        </div>
      </foreignObject>
    </svg>
  )
}

// ============================================================
// Guide card · a single destination with four rings
// ============================================================
function GuideCard({ destination, index, onOpen }: { destination: Destination; index: number; onOpen: () => void }) {
  // Build four stat rings: rating (out of 5 → %), curated, visitors, safety
  const ratingPct = (destination.stats.rating / 5) * 100
  const stats: RingStat[] = [
    {
      label: 'Rating',
      value: ratingPct,
      icon: <Star className="w-3.5 h-3.5" />,
      accent: 'oklch(0.78 0.16 65)', // saffron
      suffix: destination.stats.rating.toFixed(1),
    },
    {
      label: 'Eliya-curated',
      value: destination.stats.curated,
      icon: <Compass className="w-3.5 h-3.5" />,
      accent: destination.accent,
      suffix: `${destination.stats.curated}%`,
    },
    {
      label: 'Trails walked',
      value: destination.stats.visitors,
      icon: <TrendingUp className="w-3.5 h-3.5" />,
      accent: 'oklch(0.55 0.15 165)',
      suffix: `${destination.stats.visitors}%`,
    },
    {
      label: 'Safety index',
      value: destination.stats.safety,
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      accent: 'oklch(0.55 0.12 220)',
      suffix: `${destination.stats.safety}%`,
    },
  ]

  return (
    <article
      onClick={onOpen}
      className="relative rounded-3xl bg-white ring-1 ring-stone-200/80 eliya-shadow-soft overflow-hidden group hover:ring-stone-300 transition-all cursor-pointer"
      style={{ '--accent': destination.accent } as React.CSSProperties}
    >
      <div className="grid lg:grid-cols-[1.1fr_1fr] gap-0">
        {/* Left: image + meta */}
        <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden">
          <img
            src={destination.image}
            alt={destination.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/60 via-transparent to-transparent" />
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-amber-50 bg-stone-950/55 backdrop-blur-md ring-1 ring-white/15 px-2.5 py-1 rounded-full">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: destination.accent }}
            />
            {destination.region}
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-amber-50">
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-200/85 font-medium">
              {destination.tagline}
            </p>
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
              {destination.name}
            </h3>
          </div>
        </div>

        {/* Right: rings + content */}
        <div className="p-5 sm:p-6 lg:p-7 flex flex-col">
          {/* Stat rings */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-2">
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center">
                <CircularProgress
                  value={stat.value}
                  size={84}
                  stroke={6}
                  color={stat.accent}
                  delay={i * 120}
                >
                  <div className="text-stone-900 font-semibold text-base tabular-nums leading-none">
                    {stat.suffix}
                  </div>
                  <div className="text-stone-500 mt-0.5">{stat.icon}</div>
                </CircularProgress>
                <div className="mt-2 text-[10px] uppercase tracking-[0.15em] text-stone-500 font-medium text-center">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Body */}
          <p className="mt-5 text-sm leading-relaxed text-stone-600">
            {destination.longDescription}
          </p>

          {/* Highlights */}
          <div className="mt-5">
            <h4 className="text-[11px] uppercase tracking-[0.2em] text-stone-500 font-semibold mb-2.5">
              Signature experiences
            </h4>
            <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1.5">
              {destination.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-sm text-stone-700">
                  <span
                    className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: destination.accent }}
                  />
                  <span className="leading-snug">{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Meta + CTA */}
          <div className="mt-6 pt-5 border-t border-stone-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4 text-[11px] text-stone-500">
              <span className="inline-flex items-center gap-1.5">
                Elevation <span className="text-stone-900 font-medium">{destination.elevation}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                Best <span className="text-stone-900 font-medium">{destination.bestSeason}</span>
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onOpen() }}
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:gap-2.5 transition-all"
              style={{ color: destination.accent }}
            >
              Open {destination.name} guide
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Index number watermark */}
      <div className="absolute top-3 right-4 text-stone-200/80 text-xs font-medium tabular-nums z-10 hidden lg:block">
        · {String(index + 1).padStart(2, '0')} ·
      </div>
    </article>
  )
}

// ============================================================
// Section shell
// ============================================================
export function DestinationsGuideSection() {
  const nav = useNav()
  const [destinations, setDestinations] = useState<Destination[]>(fallbackDestinations)

  useEffect(() => {
    fetch('/api/destinations')
      .then((r) => r.json())
      .then((data) => {
        if (data.destinations && data.destinations.length > 0) {
          const mapped: Destination[] = data.destinations.map((d: Record<string, unknown>) => ({
            id: d.id as string,
            name: d.name as string,
            region: d.region as string,
            area: d.area as string,
            elevation: d.elevation as string,
            bestSeason: d.bestSeason as string,
            tagline: d.tagline as string,
            description: d.description as string,
            longDescription: d.longDescription as string,
            image: d.image as string,
            accent: d.accent as string,
            latitude: d.latitude as number,
            longitude: d.longitude as number,
            stats: {
              rating: d.rating as number,
              visitors: d.visitors as number,
              curated: d.curated as number,
              safety: d.safety as number,
            },
            highlights: safeStringArray(d.highlights),
          }))
          setDestinations(mapped)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section id="guide" className="relative bg-stone-100 py-20 sm:py-28">
      {/* Top divider with subtle pattern */}
      <div className="absolute inset-x-0 top-0 h-px bg-stone-200" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="h-px w-10 bg-stone-900" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-stone-500 font-medium">
              The Eliya destinations guide · {destinations.length} destinations
            </span>
          </div>
          <h2 className="text-balance text-3xl sm:text-5xl font-semibold tracking-tight text-stone-950 leading-[1.1]">
            Every destination,
            <span className="italic font-light text-stone-500"> measured honestly.</span>
          </h2>
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-stone-600">
            Each ring is a number we live by · the percentage of trails our team has personally
            walked, the safety index from a decade of operating in the region, and the visitor-load
            we cap so the meadow stays a meadow. No marketing inflation. Just the data we use to
            plan your trip.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 space-y-6">
          {destinations.map((d, i) => (
            <GuideCard
              key={d.id}
              destination={d}
              index={i}
              onOpen={() => nav({ name: 'destination', id: d.id })}
            />
          ))}
        </div>

        {/* Legend / glossary */}
        <div className="mt-12 rounded-2xl bg-white ring-1 ring-stone-200 p-6">
          <h3 className="text-[11px] uppercase tracking-[0.22em] text-stone-500 font-semibold mb-4">
            How to read these rings
          </h3>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-stone-900 font-medium text-sm">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                Rating
              </div>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                Average score from post-trip guest surveys (2022–2025), out of 5.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-stone-900 font-medium text-sm">
                <Compass className="w-3.5 h-3.5" style={{ color: 'oklch(0.42 0.08 145)' }} />
                Eliya-curated
              </div>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                Percentage of routes, stays and experiences owned or directly operated by Eliya ·
                no third-party middlemen.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-stone-900 font-medium text-sm">
                <TrendingUp className="w-3.5 h-3.5" style={{ color: 'oklch(0.55 0.15 165)' }} />
                Trails walked
              </div>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                Share of the destination&apos;s marked trail network that our guides have personally
                logged in the last 24 months.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-stone-900 font-medium text-sm">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'oklch(0.55 0.12 220)' }} />
                Safety index
              </div>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                Composite of medical access, weather-risk monitoring, satellite-comm coverage and
                guide-to-guest ratio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
