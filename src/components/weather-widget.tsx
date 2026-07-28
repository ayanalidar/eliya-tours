'use client'

import { useEffect, useState } from 'react'
import { Cloud, CloudRain, CloudSnow, CloudSun, Cloudy, Sun, Sunrise, Sunset, Wind, Droplets, Gauge, Loader2, CloudFog, Zap } from 'lucide-react'

// ============================================================
// Weather widget · fetches from /api/weather (Open-Meteo proxy)
// Shows current conditions + 3-day forecast for a destination
// ============================================================

type WeatherData = {
  destination?: string
  current?: {
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    pressure_msl: number
  }
  daily?: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    sunrise: string[]
    sunset: string[]
    uv_index_max: number[]
    precipitation_probability_max: number[]
  }
  error?: string
}

const WMO: Record<number, { label: string; Icon: typeof Sun }> = {
  0: { label: 'Clear sky', Icon: Sun },
  1: { label: 'Mainly clear', Icon: Sun },
  2: { label: 'Partly cloudy', Icon: CloudSun },
  3: { label: 'Overcast', Icon: Cloudy },
  45: { label: 'Fog', Icon: CloudFog },
  48: { label: 'Rime fog', Icon: CloudFog },
  51: { label: 'Light drizzle', Icon: CloudRain },
  53: { label: 'Drizzle', Icon: CloudRain },
  55: { label: 'Heavy drizzle', Icon: CloudRain },
  56: { label: 'Freezing drizzle', Icon: CloudRain },
  57: { label: 'Freezing drizzle', Icon: CloudRain },
  61: { label: 'Light rain', Icon: CloudRain },
  63: { label: 'Rain', Icon: CloudRain },
  65: { label: 'Heavy rain', Icon: CloudRain },
  66: { label: 'Freezing rain', Icon: CloudRain },
  67: { label: 'Freezing rain', Icon: CloudRain },
  71: { label: 'Light snow', Icon: CloudSnow },
  73: { label: 'Snow', Icon: CloudSnow },
  75: { label: 'Heavy snow', Icon: CloudSnow },
  77: { label: 'Snow grains', Icon: CloudSnow },
  80: { label: 'Rain showers', Icon: CloudRain },
  81: { label: 'Rain showers', Icon: CloudRain },
  82: { label: 'Violent showers', Icon: CloudRain },
  85: { label: 'Snow showers', Icon: CloudSnow },
  86: { label: 'Snow showers', Icon: CloudSnow },
  95: { label: 'Thunderstorm', Icon: Zap },
  96: { label: 'Thunderstorm + hail', Icon: Zap },
  99: { label: 'Thunderstorm + hail', Icon: Zap },
}

function wmoInfo(code: number) {
  return WMO[code] || { label: '·', Icon: Cloud }
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch {
    return iso
  }
}

function formatDay(iso: string, idx: number) {
  if (idx === 0) return 'Today'
  if (idx === 1) return 'Tomorrow'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { weekday: 'short' })
  } catch {
    return iso
  }
}

export function WeatherWidget({
  latitude,
  longitude,
  destinationName,
  accent = 'oklch(0.62 0.13 165)',
}: {
  latitude: number
  longitude: number
  destinationName: string
  accent?: string
}) {
  const [data, setData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    fetch(`/api/weather?lat=${latitude}&lon=${longitude}&dest=${encodeURIComponent(destinationName)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        if (d.error) {
          setError(d.error)
        } else {
          setData(d)
          setError(null)
        }
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [latitude, longitude, destinationName])

  if (loading) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-stone-200 p-5 flex items-center gap-3 text-stone-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Fetching live weather for {destinationName}…</span>
      </div>
    )
  }

  if (error || !data?.current) {
    return (
      <div className="rounded-2xl bg-stone-50 ring-1 ring-stone-200 p-5 text-sm text-stone-500">
        Weather data unavailable for {destinationName} right now.
      </div>
    )
  }

  const cur = data.current
  const info = wmoInfo(cur.weather_code)
  const Icon = info.Icon

  return (
    <div
      className="relative rounded-2xl bg-white ring-1 ring-stone-200 overflow-hidden"
      style={{ ['--accent' as string]: accent }}
    >
      {/* Header strip */}
      <div className="flex items-center justify-between px-5 py-3 bg-stone-50 border-b border-stone-200">
        <div className="flex items-center gap-2 text-stone-700">
          <Cloud className="w-4 h-4" />
          <span className="text-xs uppercase tracking-[0.2em] font-medium">
            Live weather · {destinationName}
          </span>
        </div>
        <span className="text-[10px] text-stone-400 tabular-nums">
          Updated {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
        </span>
      </div>

      {/* Current conditions */}
      <div className="p-5 flex items-start gap-5">
        <div
          className="grid place-items-center w-16 h-16 rounded-2xl"
          style={{ backgroundColor: `color-mix(in oklch, ${accent} 12%, white)` }}
        >
          <Icon className="w-8 h-8" style={{ color: accent }} strokeWidth={1.8} />
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-semibold tabular-nums text-stone-950">
              {Math.round(cur.temperature_2m)}°
            </span>
            <span className="text-sm text-stone-500">C</span>
            <span className="ml-2 text-sm font-medium text-stone-700">{info.label}</span>
          </div>
          <div className="mt-1 text-xs text-stone-500">
            Feels like {Math.round(cur.apparent_temperature)}°C
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-stone-600">
              <Droplets className="w-3.5 h-3.5 text-stone-400" />
              <span>{cur.relative_humidity_2m}%</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600">
              <Wind className="w-3.5 h-3.5 text-stone-400" />
              <span>{Math.round(cur.wind_speed_10m)} km/h</span>
            </div>
            <div className="flex items-center gap-1.5 text-stone-600">
              <Gauge className="w-3.5 h-3.5 text-stone-400" />
              <span>{Math.round(cur.pressure_msl)} hPa</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4-day forecast */}
      {data.daily && (
        <div className="px-5 pb-5">
          <div className="grid grid-cols-4 gap-2">
            {data.daily.time.slice(0, 4).map((t, i) => {
              const fi = wmoInfo(data.daily!.weather_code[i])
              const FIcon = fi.Icon
              return (
                <div
                  key={t}
                  className="flex flex-col items-center gap-1 py-3 rounded-xl bg-stone-50"
                >
                  <span className="text-[10px] uppercase tracking-[0.12em] text-stone-500 font-medium">
                    {formatDay(t, i)}
                  </span>
                  <FIcon className="w-5 h-5 text-stone-700" strokeWidth={1.8} />
                  <div className="flex items-baseline gap-1 text-xs">
                    <span className="font-semibold text-stone-950 tabular-nums">
                      {Math.round(data.daily!.temperature_2m_max[i])}°
                    </span>
                    <span className="text-stone-400 tabular-nums">
                      {Math.round(data.daily!.temperature_2m_min[i])}°
                    </span>
                  </div>
                  {data.daily!.precipitation_probability_max[i] > 0 && (
                    <span className="text-[9px] text-blue-500 flex items-center gap-0.5">
                      <CloudRain className="w-2.5 h-2.5" />
                      {data.daily!.precipitation_probability_max[i]}%
                    </span>
                  )}
                </div>
              )
            })}
          </div>

          {/* Sun times */}
          <div className="mt-3 flex items-center justify-between text-xs text-stone-500 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <Sunrise className="w-3.5 h-3.5 text-amber-500" />
              <span>Sunrise {formatTime(data.daily.sunrise[0])}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sunset className="w-3.5 h-3.5 text-orange-500" />
              <span>Sunset {formatTime(data.daily.sunset[0])}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>UV {Math.round(data.daily.uv_index_max[0] || 0)}</span>
            </div>
          </div>
        </div>
      )}

      <div className="px-5 py-2 bg-stone-50 border-t border-stone-100 text-[10px] text-stone-400 text-center">
        Real-time data from Open-Meteo · {destinationName} · {latitude.toFixed(4)}°N, {longitude.toFixed(4)}°E
      </div>
    </div>
  )
}
