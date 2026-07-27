'use client'

import { Mountain, Users, Route, Leaf } from 'lucide-react'

const stats = [
  { value: '15+', label: 'Years curating Kashmir', icon: Mountain },
  { value: '2,400+', label: 'Guests hosted since 2009', icon: Users },
  { value: '38', label: 'Trails personally walked', icon: Route },
  { value: '100%', label: 'Local guides & hosts', icon: Leaf },
]

export function StorySection() {
  return (
    <section className="relative bg-stone-50 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-12 lg:gap-20 items-center">
          {/* Left — copy */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-stone-900" />
              <span className="text-[11px] uppercase tracking-[0.32em] text-stone-500 font-medium">
                Our story
              </span>
            </div>
            <h2 className="text-balance text-3xl sm:text-5xl font-semibold tracking-tight text-stone-950 leading-[1.1]">
              We are not a website.
              <span className="block italic font-light text-stone-500 mt-1.5">
                We are a family on Nigeen Lake.
              </span>
            </h2>
            <div className="mt-6 space-y-4 text-base sm:text-lg leading-relaxed text-stone-600">
              <p>
                Eliya Tours And Travels began in 2009 with a single cedar houseboat on Nigeen Lake
                and a phone number written on a chalkboard at the Boulevard Road jetty. Guests came
                by word of mouth, slept on the boat, ate Wazwan with our grandmother, and went home
                telling friends.
              </p>
              <p>
                Fifteen years later, we operate across six valleys — Srinagar, Gulmarg, Pahalgam,
                Sonmarg, Yusmarg and Dachigam — but the rule has not changed: every itinerary is
                drafted by someone who lives within an hour of every place you will sleep. No call
                centres, no middlemen, no rented-out trips.
              </p>
              <p>
                What you see on this site is what we walk. Every photo, every trail, every houseboat
                — ours.
              </p>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80"
                  alt="Eliya founder portrait"
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-stone-200"
                />
                <div>
                  <div className="text-sm font-semibold text-stone-950">Tariq Ahmad Bhat</div>
                  <div className="text-xs text-stone-500">Founder · Eliya Tours And Travels</div>
                </div>
              </div>
              <div className="text-xs text-stone-500 italic pl-4 border-l border-stone-300">
                &quot;We don&apos;t sell trips. We invite you to our home.&quot;
              </div>
            </div>
          </div>

          {/* Right — stats card */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="relative rounded-3xl bg-white ring-1 ring-stone-200 p-6 sm:p-7 overflow-hidden group hover:ring-stone-300 transition-all"
              >
                <s.icon
                  className="w-5 h-5 text-stone-400 absolute top-5 right-5 group-hover:text-stone-600 transition-colors"
                  strokeWidth={1.6}
                />
                <div className="text-3xl sm:text-4xl font-semibold text-stone-950 tabular-nums tracking-tight">
                  {s.value}
                </div>
                <div className="mt-2 text-xs sm:text-sm text-stone-500 leading-snug">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
