// ============================================================
// Hash-based router — keeps the app on a single "/" route
// (per fullstack-dev skill constraint) while giving the feel
// of separate pages.
//
// URLs look like:
//   /#/                    → home
//   /#/destinations         → all destinations
//   /#/destinations/srinagar → destination detail
//   /#/seasons/summer       → season detail
//   /#/hotels               → hotels list
//   /#/hotels/khyber-gulmarg → hotel detail
//   /#/ai-guide             → AI guide chat
//   /#/admin                → admin panel
//   /#/contact              → contact
// ============================================================
'use client'

import { useEffect, useState, useCallback } from 'react'

export type Route =
  | { name: 'home' }
  | { name: 'destinations' }
  | { name: 'destination'; id: string }
  | { name: 'adventures' }
  | { name: 'adventure'; id: string }
  | { name: 'seasons' }
  | { name: 'season'; id: string }
  | { name: 'hotels' }
  | { name: 'hotel'; id: string }
  | { name: 'tickets' }
  | { name: 'ai-guide' }
  | { name: 'admin' }
  | { name: 'contact' }
  | { name: 'booking'; packageId?: string }
  | { name: 'guest-portal' }
  | { name: 'offers' }
  | { name: 'not-found' }

export function parseHash(hash: string): Route {
  // strip leading '#/' or '#'
  const clean = hash.replace(/^#\/?/, '').trim()
  if (!clean) return { name: 'home' }
  const parts = clean.split('/').filter(Boolean)

  if (parts[0] === 'destinations') {
    if (parts[1]) return { name: 'destination', id: decodeURIComponent(parts[1]) }
    return { name: 'destinations' }
  }
  if (parts[0] === 'adventures') {
    if (parts[1]) return { name: 'adventure', id: decodeURIComponent(parts[1]) }
    return { name: 'adventures' }
  }
  if (parts[0] === 'seasons') {
    if (parts[1]) return { name: 'season', id: decodeURIComponent(parts[1]) }
    return { name: 'seasons' }
  }
  if (parts[0] === 'hotels') {
    if (parts[1]) return { name: 'hotel', id: decodeURIComponent(parts[1]) }
    return { name: 'hotels' }
  }
  if (parts[0] === 'tickets') return { name: 'tickets' }
  if (parts[0] === 'flights') return { name: 'tickets' }
  if (parts[0] === 'railway') return { name: 'tickets' }
  if (parts[0] === 'ai-guide') return { name: 'ai-guide' }
  if (parts[0] === 'admin') return { name: 'admin' }
  if (parts[0] === 'contact') return { name: 'contact' }
  if (parts[0] === 'booking') return { name: 'booking', packageId: parts[1] ? decodeURIComponent(parts[1]) : undefined }
  if (parts[0] === 'guest-portal') return { name: 'guest-portal' }
  if (parts[0] === 'offers') return { name: 'offers' }

  return { name: 'not-found' }
}

export function routeToHash(route: Route): string {
  switch (route.name) {
    case 'home': return '#/'
    case 'destinations': return '#/destinations'
    case 'destination': return `#/destinations/${encodeURIComponent(route.id)}`
    case 'adventures': return '#/adventures'
    case 'adventure': return `#/adventures/${encodeURIComponent(route.id)}`
    case 'seasons': return '#/seasons'
    case 'season': return `#/seasons/${encodeURIComponent(route.id)}`
    case 'hotels': return '#/hotels'
    case 'hotel': return `#/hotels/${encodeURIComponent(route.id)}`
    case 'tickets': return '#/tickets'
    case 'ai-guide': return '#/ai-guide'
    case 'admin': return '#/admin'
    case 'contact': return '#/contact'
    case 'booking': return route.packageId ? `#/booking/${encodeURIComponent(route.packageId)}` : '#/booking'
    case 'guest-portal': return '#/guest-portal'
    case 'offers': return '#/offers'
    default: return '#/'
  }
}

export function useRouter() {
  // Start with 'home' route for SSR — will be updated on client mount
  const [route, setRoute] = useState<Route>({ name: 'home' })

  useEffect(() => {
    // Parse hash on mount (client-only, safe here)
    const update = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }
    update()
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])

  const navigate = useCallback((r: Route) => {
    window.location.hash = routeToHash(r)
  }, [])

  return { route, navigate }
}

// Helper hook for link clicks
export function useNav() {
  return useCallback((r: Route) => {
    window.location.hash = routeToHash(r)
  }, [])
}
