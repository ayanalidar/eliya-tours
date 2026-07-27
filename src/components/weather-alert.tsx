'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CloudSnow, CloudRain, Wind, Sun, X } from 'lucide-react'

// ============================================================
// Weather alert — checks destination's forecast and shows a
// warning banner if severe weather is expected in next 4 days
// ============================================================

type Alert = {
  level: 'warning' | 'watch' | 'info'
  message: string
  Icon: typeof CloudSnow
}

function analyzeWeather(daily: {
  weather_code: number[]
  precipitation_probability_max: number[]
  wind_speed_10m_max?: number[]
}): Alert | null {
  const alerts: Alert[] = []
  const codes = daily.weather_code || []
  const precip = daily.precipitation_probability_max || []

  for (let i = 0; i < Math.min(codes.length, 4); i++) {
    const c = codes[i]
    const p = precip[i] || 0

    // Heavy snow
    if ([71, 73, 75, 85, 86].includes(c)) {
      alerts.push({
        level: 'warning',
        message: `Heavy snow expected ${i === 0 ? 'today' : i === 1 ? 'tomorrow' : `in ${i} days`}. Road closures possible — check with us before travelling.`,
        Icon: CloudSnow,
      })
    }
    // Heavy rain
    else if ([65, 67, 82, 95, 96, 99].includes(c)) {
      alerts.push({
        level: 'warning',
        message: `Heavy rain/thunderstorm expected ${i === 0 ? 'today' : i === 1 ? 'tomorrow' : `in ${i} days`}. Outdoor activities may be rescheduled.`,
        Icon: CloudRain,
      })
    }
    // High precipitation probability (>80%)
    else if (p > 80 && [51, 53, 55, 56, 57, 61, 63, 80, 81].includes(c)) {
      alerts.push({
        level: 'watch',
        message: `${p}% chance of rain ${i === 0 ? 'today' : i === 1 ? 'tomorrow' : `in ${i} days`}. Pack a rain shell.`,
        Icon: CloudRain,
      })
    }
  }

  // Return the most severe
  if (alerts.some((a) => a.level === 'warning')) return alerts.find((a) => a.level === 'warning')!
  if (alerts.length > 0) return alerts[0]
  return null
}

export function WeatherAlert({ latitude, longitude, destinationName }: { latitude: number; longitude: number; destinationName: string }) {
  const [alert, setAlert] = useState<Alert | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    fetch(`/api/weather?lat=${latitude}&lon=${longitude}&dest=${encodeURIComponent(destinationName)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.daily) {
          setAlert(analyzeWeather(data.daily))
        }
      })
      .catch(() => {})
  }, [latitude, longitude, destinationName])

  if (!alert || dismissed) return null

  const colors = {
    warning: 'bg-amber-50 ring-amber-200 text-amber-900',
    watch: 'bg-blue-50 ring-blue-200 text-blue-900',
    info: 'bg-stone-50 ring-stone-200 text-stone-700',
  }[alert.level]

  return (
    <div className={`rounded-2xl ring-1 p-4 flex items-start gap-3 ${colors}`}>
      <alert.Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div className="flex-1 text-sm">
        <div className="font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          Weather alert · {destinationName}
        </div>
        <p className="mt-1 text-xs opacity-90">{alert.message}</p>
      </div>
      <button onClick={() => setDismissed(true)} className="opacity-50 hover:opacity-100" aria-label="Dismiss">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
