'use client'

import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import { companyInfo } from '@/lib/destinations'
import { useNav } from '@/lib/router'
import { AnimatedLogo } from '@/components/animated-logo'

export function SiteFooter() {
  const nav = useNav()
  return (
    <footer className="bg-stone-950 text-stone-300 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid gap-10 lg:gap-16 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          {/* Brand */}
          <div>
            <AnimatedLogo className="h-10 w-auto mb-4" light={true} />
            <p className="text-sm leading-relaxed text-stone-400 max-w-xs">
              A family-owned Kashmir travel house, run by CEO {companyInfo.ceo} from {companyInfo.ceoAddress} since {companyInfo.founded}. We curate journeys, not itineraries. Every route is walked, every guide is local, every houseboat is owned by someone we know by name.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-stone-500">{companyInfo.license}</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-4">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => nav({ name: 'home' })} className="text-stone-300 hover:text-amber-50 transition-colors">Home</button></li>
              <li><button onClick={() => nav({ name: 'destinations' })} className="text-stone-300 hover:text-amber-50 transition-colors">Destinations</button></li>
              <li><button onClick={() => nav({ name: 'adventures' })} className="text-stone-300 hover:text-amber-50 transition-colors">Adventure sports</button></li>
              <li><button onClick={() => nav({ name: 'seasons' })} className="text-stone-300 hover:text-amber-50 transition-colors">Seasons</button></li>
              <li><button onClick={() => nav({ name: 'hotels' })} className="text-stone-300 hover:text-amber-50 transition-colors">Hotels</button></li>
              <li><button onClick={() => nav({ name: 'offers' })} className="text-stone-300 hover:text-amber-50 transition-colors">Offers</button></li>
              <li><button onClick={() => nav({ name: 'ai-guide' })} className="text-stone-300 hover:text-amber-50 transition-colors">AI Guide</button></li>
              <li><button onClick={() => nav({ name: 'booking' })} className="text-stone-300 hover:text-amber-50 transition-colors">Book now</button></li>
              <li><button onClick={() => nav({ name: 'guest-portal' })} className="text-stone-300 hover:text-amber-50 transition-colors">Guest portal</button></li>
              <li><button onClick={() => nav({ name: 'contact' })} className="text-stone-300 hover:text-amber-50 transition-colors">Contact</button></li>
              <li><button onClick={() => nav({ name: 'admin' })} className="text-stone-500 hover:text-amber-50 transition-colors text-xs">Admin login</button></li>
            </ul>
          </div>

          {/* Seasons */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-4">By Season</h4>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => nav({ name: 'season', id: 'spring' })} className="text-stone-300 hover:text-amber-50 transition-colors">Spring · Blossom</button></li>
              <li><button onClick={() => nav({ name: 'season', id: 'summer' })} className="text-stone-300 hover:text-amber-50 transition-colors">Summer · Alpine</button></li>
              <li><button onClick={() => nav({ name: 'season', id: 'monsoon' })} className="text-stone-300 hover:text-amber-50 transition-colors">Saffron Harvest</button></li>
              <li><button onClick={() => nav({ name: 'season', id: 'autumn' })} className="text-stone-300 hover:text-amber-50 transition-colors">Autumn · Chinar Gold</button></li>
              <li><button onClick={() => nav({ name: 'season', id: 'winter' })} className="text-stone-300 hover:text-amber-50 transition-colors">Winter · Powder</button></li>
              <li><button onClick={() => nav({ name: 'season', id: 'houseboat' })} className="text-stone-300 hover:text-amber-50 transition-colors">Year-round · Houseboats</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-4">Get in touch</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href={`tel:${companyInfo.phone}`} className="flex items-start gap-3 text-stone-300 hover:text-amber-50 transition-colors">
                  <Phone className="w-4 h-4 mt-0.5 text-amber-200/70 shrink-0" />
                  <span>{companyInfo.phone}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${companyInfo.phone2}`} className="flex items-start gap-3 text-stone-300 hover:text-amber-50 transition-colors">
                  <Phone className="w-4 h-4 mt-0.5 text-amber-200/70 shrink-0" />
                  <span>{companyInfo.phone2}</span>
                </a>
              </li>
              <li>
                <a href={`https://wa.me/${companyInfo.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-stone-300 hover:text-amber-50 transition-colors">
                  <MessageCircle className="w-4 h-4 mt-0.5 text-amber-200/70 shrink-0" />
                  <span>WhatsApp · {companyInfo.phone}</span>
                </a>
              </li>
              <li>
                <a href={`mailto:${companyInfo.email}`} className="flex items-start gap-3 text-stone-300 hover:text-amber-50 transition-colors">
                  <Mail className="w-4 h-4 mt-0.5 text-amber-200/70 shrink-0" />
                  <span>{companyInfo.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-stone-400">
                <MapPin className="w-4 h-4 mt-0.5 text-amber-200/70 shrink-0" />
                <span>{companyInfo.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} {companyInfo.name}. All rights reserved · Curated in Srinagar, Kashmir.
          </p>
          <p className="text-xs text-stone-500">
            Travel responsibly · Support local guides · Leave no trace
          </p>
        </div>
      </div>
    </footer>
  )
}
