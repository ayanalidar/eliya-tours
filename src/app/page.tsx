'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Load the app shell only on the client — prevents all SSR/hydration crashes
const AppShell = dynamic(() => import('@/components/app-shell').then(m => m.AppShell), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen grid place-items-center bg-stone-950">
      <div className="text-amber-50 text-sm animate-pulse">Loading Eliya Tours…</div>
    </div>
  ),
})

export default function Home() {
  return <AppShell />
}
