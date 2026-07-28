'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/lib/router'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { StickyActions } from '@/components/sticky-actions'
import { SpotlightHero } from '@/components/sections/spotlight-hero'
import { StorySection } from '@/components/sections/story-section'
import { DestinationsSection } from '@/components/sections/destinations-section'
import { GenreTimelineSection } from '@/components/sections/genre-timeline-section'
import { VirtualTourSection } from '@/components/sections/virtual-tour-section'
import { DestinationsGuideSection } from '@/components/sections/destinations-guide-section'
import { ContactSection } from '@/components/sections/contact-section'
import { AIGuidePage } from '@/components/pages/ai-guide-page'
import { DestinationsPage } from '@/components/pages/destinations-page'
import { DestinationPage } from '@/components/pages/destination-page'
import { SeasonsPage } from '@/components/pages/seasons-page'
import { SeasonPage } from '@/components/pages/season-page'
import { HotelsPage } from '@/components/pages/hotels-page'
import { ContactPage } from '@/components/pages/contact-page'
import { AdminPage } from '@/components/pages/admin-page'
import { AdventuresPage } from '@/components/pages/adventures-page'
import { AdventurePage } from '@/components/pages/adventure-page'
import { BookingPage } from '@/components/pages/booking-page'
import { GuestPortalPage } from '@/components/pages/guest-portal-page'
import { OffersPage } from '@/components/pages/offers-page'

// Loading shell shown during SSR + first client paint
function LoadingShell() {
  return (
    <div className="min-h-screen grid place-items-center bg-stone-950">
      <div className="text-center">
        <div className="text-amber-50 text-sm animate-pulse mb-2">Eliya Tours</div>
        <div className="text-amber-200/60 text-xs">Loading…</div>
      </div>
    </div>
  )
}

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  // Show loading shell during SSR and first client paint
  // This prevents all hydration crashes from window.location.hash access
  if (!mounted) {
    return <LoadingShell />
  }

  return <AppContent />
}

function AppContent() {
  const { route } = useRouter()

  // ----- Standalone full-page routes (no header/footer) -----
  if (route.name === 'ai-guide') {
    return (
      <>
        <AIGuidePage />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'admin') {
    return <AdminPage />
  }
  if (route.name === 'guest-portal') {
    return (
      <>
        <GuestPortalPage />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'booking') {
    return (
      <>
        <SiteHeader />
        <BookingPage preselectedPackageId={route.packageId} />
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
        <DestinationsPage />
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'destination') {
    return (
      <>
        <SiteHeader />
        <DestinationPage id={route.id} />
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'adventures') {
    return (
      <>
        <SiteHeader />
        <AdventuresPage />
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'adventure') {
    return (
      <>
        <SiteHeader />
        <AdventurePage id={route.id} />
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'seasons') {
    return (
      <>
        <SiteHeader />
        <SeasonsPage />
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'season') {
    return (
      <>
        <SiteHeader />
        <SeasonPage id={route.id} />
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'hotels') {
    return (
      <>
        <SiteHeader />
        <HotelsPage />
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'contact') {
    return (
      <>
        <SiteHeader />
        <ContactPage />
        <SiteFooter />
        <StickyActions />
      </>
    )
  }
  if (route.name === 'offers') {
    return (
      <>
        <SiteHeader />
        <OffersPage />
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
        <VirtualTourSection />
        <DestinationsGuideSection />
        <ContactSection />
      </main>
      <SiteFooter />
      <StickyActions />
    </div>
  )
}
