'use client'

import { Component, ReactNode } from 'react'

// ============================================================
// Error boundary — catches client-side errors and shows them
// instead of the blank "Application error" page
// ============================================================

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log to console for debugging
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen grid place-items-center bg-stone-950 p-4">
          <div className="max-w-md w-full bg-stone-900 ring-1 ring-amber-50/10 rounded-3xl p-6">
            <h1 className="text-lg font-semibold text-amber-50 mb-2">Something went wrong</h1>
            <p className="text-xs text-amber-200/70 mb-4">The app hit an error. Try refreshing.</p>
            <pre className="text-xs text-red-400 bg-stone-950/50 rounded-lg p-3 overflow-auto max-h-40 mb-4">
              {this.state.error?.message || 'Unknown error'}
              {this.state.error?.stack?.slice(0, 500)}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-amber-50 text-stone-900 rounded-xl py-2.5 text-sm font-medium hover:bg-white"
            >
              Refresh page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
