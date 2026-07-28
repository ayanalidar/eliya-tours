'use client'

import { useEffect, useState, lazy, Suspense } from 'react'
import { ErrorBoundary } from '@/components/error-boundary'
import { useRouter } from '@/lib/router'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { StickyActions } from '@/components/sticky-actions'
import { SpotlightHero } from '@/components/sections/spotlight-hero'
import { StorySection } from '@/components/sections/story-section'
import { DestinationsSection } from '@/components/sections/destinations-section'
import { GenreTimelineSection } from '@/components/sections/genre-timeline-section'
import { DestinationsGuideSection } from '@/components/sections/destinations-guide-section'
import { ContactSection } from '@/components/sections/contact-section'

// Lazy-load heavy pages — only loaded when navigated to
const VirtualTourSection = lazy(() => import('@/components/sections/virtual-tour-section').then(m => ({ default: m.VirtualTourSection })))
const AIGuidePage = lazy(() => import('@/components/pages/ai-guide-page').then(m => ({ default: m.AIGuidePage })))
const DestinationsPage = lazy(() => import('@/components/pages/destinations-page').then(m => ({ default: m.DestinationsPage })))
const DestinationPage = lazy(() => import('@/components/pages/destination-page').then(m => ({ default: m.DestinationPage })))
const SeasonsPage = lazy(() => import('@/components/pages/seasons-page').then(m => ({ default: m.SeasonsPage })))
const SeasonPage = lazy(() => import('@/components/pages/season-page').then(m => ({ default: m.SeasonPage })))
const HotelsPage = lazy(() => import('@/components/pages/hotels-page').then(m => ({ default: m.HotelsPage })))
const ContactPage = lazy(() => import('@/components/pages/contact-page').then(m => ({ default: m.ContactPage })))
const AdminPage = lazy(() => import('@/components/pages/admin-page').then(m => ({ default: m.AdminPage })))
const AdventuresPage = lazy(() => import('@/components/pages/adventures-page').then(m => ({ default: m.AdventuresPage })))
const AdventurePage = lazy(() => import('@/components/pages/adventure-page').then(m => ({ default: m.AdventurePage })))
const BookingPage = lazy(() => import('@/components/pages/booking-page').then(m => ({ default: m.BookingPage })))
const GuestPortalPage = lazy(() => import('@/components/pages/guest-portal-page').then(m => ({ default: m.GuestPortalPage })))
const OffersPage = lazy(() => import('@/components/pages/offers-page').then(m => ({ default: m.OffersPage })))
const TicketsPage = lazy(() => import('@/components/pages/tickets-page').then(m => ({ default: m.TicketsPage })))
const PlanTripPage = lazy(() => import('@/components/pages/plan-trip-page').then(m => ({ default: m.PlanTripPage })))

function LoadingShell() {
  return (
    <div className="min-h-screen grid place-items-center bg-stone-950">
      <div className="text-center">
        <div className="text-amber-50 text-base font-medium mb-1">Eliya Tours</div>
        <div className="text-amber-200/50 text-xs animate-pulse">Loading...</div>
      </div>
    </div>
  )
}

function PageLoader() {
  return (
    <div className="min-h-[60vh] grid place-items-center bg-stone-50">
      <div className="text-stone-400 text-sm animate-pulse">Loading...</div>
    </div>
  )
}

export function ClientApp() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) {
    return <LoadingShell />
  }

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  )
}

function AppRoutes() {
  const { route } = useRouter()

  // ----- Standalone full-page routes (no header/footer) -----
  if (route.name === 'ai-guide') {
    return (
      <>
        <Suspense fallback={<PageLoader />}><AIGuidePage /></Suspense>
        <StickyActions />
      </>
    )
  }
  if (route.name === 'admin') {
    return <Suspense fallback={<PageLoader />}><AdminPage /></Suspense>
  }
  if (route.name === 'guest-portal') {
    return (
      <>
        <Suspense fallback={<PageLoader />}><GuestPortalPage /></Suspense>
        <StickyActions />
      </>
    )
  }
  if (route.name === 'booking') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><BookingPage preselectedPackageId={route.packageId} /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }

  // ----- Standard routes (with header + footer) -----
  if (route.name === 'destinations') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><DestinationsPage /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'destination') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><DestinationPage id={route.id} /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'adventures') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><AdventuresPage /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'adventure') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><AdventurePage id={route.id} /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'seasons') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><SeasonsPage /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'season') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><SeasonPage id={route.id} /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'hotels') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><HotelsPage /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'tickets') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><TicketsPage /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'contact') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><ContactPage /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'plan-trip') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><PlanTripPage /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'offers') {
    return (
      <>
        <SiteHeader />
        <Suspense fallback={<PageLoader />}><OffersPage /></Suspense>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'not-found') {
    return (
      <>
        <SiteHeader />
        <div className="min-h-[60vh] grid place-items-center bg-stone-50">
          <div className="text-center">
            <p className="text-6xl font-semibold text-stone-300">404</p>
            <p className="mt-3 text-stone-500">Page not found.</p>
            <a href="#/" className="mt-4 inline-block text-stone-950 font-medium underline">Back home</a>
          </div>
        </div>
        <SiteFooter />
        <StickyActions />
      </>
    )
  }

  // ----- Default: home page -----
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <SiteHeader />
      <main className="flex-1">
        <SpotlightHero />
        <StorySection />
        <DestinationsSection />
        <GenreTimelineSection />
        <Suspense fallback={<PageLoader />}><VirtualTourSection /></Suspense>
        <DestinationsGuideSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <StickyActions />
    </div>
  )
}
