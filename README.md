# Eliya Tours And Travels — Discover Kashmir & Ladakh

A production-ready travel agency platform built with Next.js 16, TypeScript, Tailwind CSS, Prisma, and the z-ai-web-dev-sdk for the AI guide. Features 21 destinations across Kashmir + Ladakh, 18 adventure sports, 6 seasonal packages, 8 hotels, a full admin CMS, guest portal, online booking, and more.

## Live demo features

- **Cross-fade spotlight hero** with cursor-following spotlight
- **Drag-to-look 360° virtual tour** with teleport hotspots (9 interconnected locations)
- **Horizontal scroll genre timeline** for seasonal packages
- **Circular progress rings** destinations guide
- **AI guide (Tariq)** — LLM-powered, DB-aware, multi-language (EN/HI/UR), with WhatsApp handoff
- **Real-time weather widget** for every destination (Open-Meteo, no API key)
- **Weather alerts** — auto-flags destinations with severe weather incoming
- **Online booking** with promo codes, multi-currency, payment method selection
- **Guest portal** — register, view bookings, track trips
- **Admin CMS** — 12 tabs: dashboard, enquiries, bookings, destinations, adventures, seasons, hotels, pricing, offers, reviews, invoices, itineraries
- **Image upload** (Vercel Blob in prod, local filesystem in dev)
- **PWA installable** — manifest, service worker, offline API caching
- **Multi-currency** — INR, USD, EUR, GBP, AED, SGD, AUD, CAD (live rates)
- **Notifications** — in-app bell + toast system for admins and guests
- **Reviews & ratings** — guest submissions + admin approval + replies
- **Seasonal pricing engine** — per-hotel per-month multiplier sliders
- **Itinerary builder** — day-by-day planner with destination + hotel dropdowns

## Tech stack

- **Framework**: Next.js 16 (App Router) + TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui (New York style)
- **Database**: PostgreSQL (Vercel Postgres / Neon / Supabase)
- **ORM**: Prisma 6
- **AI**: z-ai-web-dev-sdk (glm-4.6 model)
- **Weather**: Open-Meteo (free, no API key)
- **Currency**: open.er-api.com (free, no API key)
- **Image storage**: Vercel Blob (prod) / local filesystem (dev)

## Quick start (local dev)

### Prerequisites

- Node.js 18+ or Bun
- A PostgreSQL database (local, Neon, Supabase, or Vercel Postgres)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/ayanalidar/eliya-tours.git
   cd eliya-tours
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or: npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   - `DATABASE_URL` — your PostgreSQL connection string (e.g. `postgresql://user:pass@host:5432/db?sslmode=require`)
   - `ZAI_API_KEY` — your z-ai API key (for the AI guide)

4. **Create the database schema + seed data**
   ```bash
   bun run db:push
   bun run seed
   ```
   This seeds: 21 destinations, 6 seasons, 8 hotels, 3 admin users, 18 adventure sports, 5 offers, 12 seasonal prices, 5 sample reviews.

5. **Start the dev server**
   ```bash
   bun run dev
   ```
   Open http://localhost:3000

### Demo credentials

**Admin panel** (`/#/admin`):
- `tariq@eliyatours.in` / PIN `901234` (admin role)
- `imran@eliyatours.in` / PIN `567890` (editor role)
- `sales@eliyatours.in` / PIN `111111` (sales role)

**Guest portal** (`/#/guest-portal`):
- Register a new account, or use any existing guest email.

**Promo codes** (use at `/#/booking`):
- `SPRING15` — 15% off
- `COUPLE10` — 10% off
- `GROUP12` — 12% off
- `LADAKH8` — 8% off
- `DIWALI20` — 20% off

## Deploy to Vercel

### Option A: One-click via Vercel dashboard

1. Go to https://vercel.com/new
2. Import the GitHub repo `ayanalidar/eliya-tours`
3. Vercel auto-detects Next.js — keep defaults
4. Add environment variables (see below)
5. Click **Deploy**

### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL
vercel env add ZAI_API_KEY
vercel env add BLOB_READ_WRITE_TOKEN
vercel env add ELIYA_SESSION_SECRET
vercel --prod
```

### Required Vercel environment variables

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Vercel → Storage → New → Postgres (free). Copy the connection string. |
| `ZAI_API_KEY` | Your z-ai dashboard |
| `BLOB_READ_WRITE_TOKEN` | Vercel → Storage → New → Blob (free). Copy the token. |
| `ELIYA_SESSION_SECRET` | Any random string (e.g. run `openssl rand -base64 32`) |

### Post-deploy

The `vercel-build` script automatically runs:
1. `prisma generate` — generates the Prisma client
2. `prisma db push` — creates all tables in your Postgres database
3. `next build` — builds the Next.js app

**First deploy only**: After the first deploy, run the seed scripts to populate the database. You can do this by:
- Adding a temporary deploy hook, OR
- Running locally with `DATABASE_URL` pointing to your Vercel Postgres:
  ```bash
  DATABASE_URL="your-vercel-postgres-url" bun run seed
  ```

## Project structure

```
src/
├── app/
│   ├── api/              # 17 API routes (auth, bookings, chat, etc.)
│   ├── page.tsx          # Hash-based router → renders the right page
│   ├── layout.tsx        # Root layout with AppProvider
│   └── globals.css       # Design tokens + Tailwind
├── components/
│   ├── pages/            # Full-page views (admin, booking, etc.)
│   ├── sections/         # Home page sections (hero, timeline, tour, etc.)
│   ├── ui/               # shadcn/ui components
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   ├── weather-widget.tsx
│   ├── weather-alert.tsx
│   ├── reviews-section.tsx
│   ├── sticky-actions.tsx    # WhatsApp + Call FABs
│   └── utility-bar.tsx       # Currency + language + notifications
├── lib/
│   ├── destinations.ts   # Static fallback data
│   ├── router.ts         # Hash-based router
│   ├── db.ts             # Prisma client
│   ├── notify.ts         # Notification helper
│   └── app-context.tsx   # Global state (currency, lang, notifications)
└── prisma/
    └── schema.prisma     # 17 models

scripts/
├── seed.ts               # Destinations, seasons, hotels, admins
├── seed-adventures.ts    # 18 adventure sports
└── seed-extras.ts        # Offers, seasonal pricing, reviews

public/
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker (offline-first)
├── icon-192.png          # PWA icon
├── icon-512.png          # PWA icon
└── uploads/              # Local image uploads (dev only)
```

## API routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth` | POST/GET/DELETE | — | Admin PIN login/session |
| `/api/guest-auth` | POST/GET/DELETE | — | Guest register/login/session |
| `/api/destinations` | GET/POST/PATCH/DELETE | GET public, writes admin | Destinations CRUD |
| `/api/seasons` | GET/POST/PATCH/DELETE | GET public, writes admin | Seasons CRUD |
| `/api/hotels` | GET/POST/PATCH/DELETE | GET public, writes admin | Hotels CRUD |
| `/api/adventures` | GET/POST/PATCH/DELETE | GET public, writes admin | Adventure sports CRUD |
| `/api/enquiries` | POST/GET/PATCH | POST public, GET/PATCH admin | Plan-my-trip form |
| `/api/bookings` | POST/GET/PATCH | POST public, GET/PATCH admin/guest | Online bookings |
| `/api/reviews` | POST/GET/PATCH/DELETE | POST/GET public, PATCH/DELETE admin | Reviews |
| `/api/offers` | GET/POST/PATCH/DELETE | GET public, writes admin | Promo codes |
| `/api/invoices` | GET/POST/PATCH/DELETE | Admin only | Invoices |
| `/api/itineraries` | GET/POST/PATCH/DELETE | GET public, writes admin | Itinerary templates |
| `/api/seasonal-pricing` | GET/POST/DELETE | GET public, writes admin | Per-month multipliers |
| `/api/notifications` | GET/PATCH/POST | Admin or guest | In-app notifications |
| `/api/currency` | GET | — | Live currency rates |
| `/api/weather` | GET | — | Open-Meteo proxy |
| `/api/chat` | POST | — | AI guide (z-ai-web-dev-sdk) |
| `/api/upload` | POST | Admin only | Image upload (Blob/local) |

## License

© Eliya Tours And Travels. All rights reserved.
