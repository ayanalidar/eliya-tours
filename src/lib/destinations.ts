// ============================================================
// Eliya Tours And Travels — Kashmir destination & itinerary data
// ============================================================

export type Destination = {
  id: string
  name: string
  region: string
  area: string // broader grouping: "Kashmir Valley", "Pir Panjal", "Ladakh"
  elevation: string // metres above sea level
  bestSeason: string
  tagline: string
  description: string
  longDescription: string
  image: string
  accent: string // CSS color
  latitude: number
  longitude: number
  stats: {
    rating: number // 0-5
    visitors: number // percentage of capacity
    curated: number // percentage of routes curated by Eliya
    safety: number // percentage safety index
  }
  highlights: string[]
}

export const destinations: Destination[] = [
  {
    id: 'srinagar',
    name: 'Srinagar',
    region: 'Srinagar',
    area: 'Kashmir Valley',
    elevation: '1,585 m',
    bestSeason: 'Apr — Oct',
    tagline: 'The Venice of the East',
    description:
      'Drift along Dal Lake on a hand-carved shikara, sleep on a cedar houseboat, and lose yourself in the symmetry of Mughal gardens laid out by emperors four centuries ago.',
    longDescription:
      'Srinagar is the summer capital of Jammu & Kashmir and the gateway to every Eliya itinerary. The city wraps around Dal Lake and Nigeen Lake, with the Zabarwan Hills rising to the east. Our guests stay on traditional houseboats moored on Nigeen Lake — quieter than Dal, with the same Himalayan reflections. Mornings begin with a floating-vegetable-market shikara ride; afternoons are for the Mughal gardens of Shalimar, Nishat and Chashme Shahi; evenings end with kahwa on the prow of the boat as the sun sets behind the Pir Panjal range.',
    image:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1600&q=80',
    accent: 'oklch(0.62 0.13 165)',
    latitude: 34.0837,
    longitude: 74.7973,
    stats: { rating: 4.9, visitors: 78, curated: 96, safety: 92 },
    highlights: [
      'Sunrise shikara on Dal Lake',
      'Overnight cedar houseboat stay',
      'Mughal gardens: Shalimar, Nishat, Chashme Shahi',
      'Old Srinagar bazaar & Shah-e-Hamdan shrine',
    ],
  },
  {
    id: 'gulmarg',
    name: 'Gulmarg',
    region: 'Baramulla',
    area: 'Pir Panjal Range',
    elevation: '2,650 m',
    bestSeason: 'Dec — Mar (ski) / May — Sep (meadow)',
    tagline: 'The Meadow of Flowers',
    description:
      'In winter, the highest gondola in the world drops you into chest-deep Himalayan powder. In summer, the same meadow bursts into a carpet of alpine wildflowers.',
    longDescription:
      'Gulmarg sits at 2,650 m in the Pir Panjal range, a 90-minute drive from Srinagar. The Gulmarg Gondola — the second-highest cable car in the world — climbs to Apharwat Peak at 4,390 m, serving some of the longest, steepest and driest powder runs on the planet. Eliya partners with certified guides from the Indian Institute of Skiing and Mountaineering for every off-piste day. In summer the snow recedes to reveal a rolling meadow dotted with ponies, the 18-hole Gulmarg Golf Club (the highest green golf course in the world), and a network of day hikes to Khilanmarg and Alpather Lake.',
    image:
      'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1600&q=80',
    accent: 'oklch(0.72 0.17 65)',
    latitude: 34.0480,
    longitude: 74.3805,
    stats: { rating: 4.8, visitors: 65, curated: 91, safety: 88 },
    highlights: [
      'Gondola to Apharwat Peak (4,390 m)',
      'Off-piste powder skiing with certified guides',
      'Summer wildflower meadows',
      'Highest green golf course in the world',
    ],
  },
  {
    id: 'pahalgam',
    name: 'Pahalgam',
    region: 'Anantnag',
    area: 'Lidder Valley',
    elevation: '2,240 m',
    bestSeason: 'Apr — Nov',
    tagline: 'The Valley of Shepherds',
    description:
      'Pine forests, glacial rivers and the start of the Amarnath trail. Pahalgam is where Kashmir slows down — pony rides to Aru, white-water on the Lidder, evenings by a campfire.',
    longDescription:
      'Pahalgam — "the village of shepherds" — sits at the confluence of the Lidder River and Sheshnag Lake streams, 95 km from Srinagar. It is the base for the annual Amarnath Yatra pilgrimage and for treks into the Great Himalayan Range. Eliya offers guided day hikes to Aru Valley, Betaab Valley and Chandanwari, plus overnight pack-pony expeditions to Kolahoi Glacier. The Lidder runs cold and clear through town — trout fishing permits and tackle are arranged by our local team.',
    image:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=80',
    accent: 'oklch(0.42 0.08 145)',
    latitude: 34.0167,
    longitude: 75.3167,
    stats: { rating: 4.7, visitors: 58, curated: 89, safety: 90 },
    highlights: [
      'Day hike to Aru & Betaab Valley',
      'Trout fishing on the Lidder River',
      'Kolahoi Glacier pony expedition',
      'Campfire nights under Milky Way',
    ],
  },
  {
    id: 'sonmarg',
    name: 'Sonmarg',
    region: 'Ganderbal',
    area: 'Kashmir Valley',
    elevation: '2,800 m',
    bestSeason: 'May — Oct',
    tagline: 'The Meadow of Gold',
    description:
      'The last town on the Srinagar–Ladakh road. From here, the road climbs toward Zoji La — gateway to Ladakh — and the Thajiwas Glacier spills right down into the meadow.',
    longDescription:
      'Sonmarg sits at 2,800 m, three hours northeast of Srinagar on the Sindh River. The meadow earns its name — "meadow of gold" — from the late-summer wildflowers that turn the slopes amber. Thajiwas Glacier is reachable on foot or by pony from town; for the more adventurous, the three-day trek to Vishansar, Krishansar and Gangabal Lakes begins at nearby Nichinai Pass. Sonmarg is also where Eliya stages the start of the trans-Himalayan journey to Ladakh.',
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80',
    accent: 'oklch(0.82 0.14 80)',
    latitude: 34.3001,
    longitude: 75.2905,
    stats: { rating: 4.8, visitors: 52, curated: 87, safety: 86 },
    highlights: [
      'Pony trek to Thajiwas Glacier',
      'Three-day alpine lakes trek (Vishansar–Krishansar)',
      'Gateway to Zoji La & Ladakh',
      'Sindh River white-water rafting',
    ],
  },
  {
    id: 'yusmarg',
    name: 'Yusmarg',
    region: 'Badgam',
    area: 'Pir Panjal Range',
    elevation: '2,396 m',
    bestSeason: 'May — Oct',
    tagline: 'The Hidden Meadow',
    description:
      'The Kashmir that locals keep to themselves. A quiet alpine meadow ringed by pine forest, with day hikes to Doodh Ganga and the frozen lake of Nilnag.',
    longDescription:
      'Yusmarg — "the meadow of Jesus" — is the off-the-radar counterpart to Gulmarg and Pahalgam. Just 47 km from Srinagar but with a fraction of the crowds, it remains a quiet grazing meadow surrounded by dense pine. Eliya brings guests here for the silence: a day walk along the Doodh Ganga ("river of milk") to a cascading waterfall, or a pony trek to the sapphire Nilnag Lake at 4,000 m. There are no hotels here — only a small Eliya-managed eco-camp with six canvas tents and a cedar-fire kitchen.',
    image:
      'https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=1600&q=80',
    accent: 'oklch(0.32 0.06 165)',
    latitude: 33.8333,
    longitude: 74.5833,
    stats: { rating: 4.9, visitors: 28, curated: 95, safety: 94 },
    highlights: [
      'Private eco-camp (six tents only)',
      'Doodh Ganga waterfall hike',
      'Nilnag Lake pony trek',
      'Stargazing with telescope on clear nights',
    ],
  },
  {
    id: 'dachigam',
    name: 'Dachigam',
    region: 'Harwan',
    area: 'Zabarwan Range',
    elevation: '1,700 – 4,300 m',
    bestSeason: 'Mar — Nov',
    tagline: 'The Last Refuge of the Hangul',
    description:
      'A 141 km² national park protecting the only viable population of the Kashmir stag — the hangul. Dawn walks with park rangers, leopard tracks, black bear and over 150 bird species.',
    longDescription:
      'Dachigam National Park, just 22 km from Srinagar, is the most accessible wilderness experience on the Eliya roster. The park climbs from 1,700 m at the entrance to over 4,300 m in the alpine upper reaches, hosting the critically endangered hangul (Kashmir stag), Himalayan black bear, leopard, and over 150 bird species including the Himalayan monal. Eliya holds permits for guided dawn walks accompanied by park rangers — the only way to enter the core zone. The lower Dagwan Valley trail follows a trout stream through pine and cedar; the upper Tarsar trail requires a two-day trek with overnight camp.',
    image:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=80',
    accent: 'oklch(0.55 0.15 145)',
    latitude: 34.1333,
    longitude: 75.0333,
    stats: { rating: 4.7, visitors: 22, curated: 92, safety: 91 },
    highlights: [
      'Ranger-led dawn hangul safari',
      'Himalayan monal & black bear sightings',
      'Lower Dagwan Valley trout trail',
      'Two-day Tarsar alpine lake trek',
    ],
  },
]

// ============================================================
// Genre timeline — seasonal / thematic tours across the year
// ============================================================

export type GenreEra = {
  id: string
  season: string
  months: string
  title: string
  theme: string
  description: string
  destinations: string[]
  image: string
  color: string
  priceFrom: number
  duration: string
  isFeatured?: boolean
}

export const genreTimeline: GenreEra[] = [
  {
    id: 'spring',
    season: 'Spring',
    months: 'Mar — Apr',
    title: 'Blossom & Tulip Season',
    theme: 'Mughal Gardens Awakening',
    description:
      'The Indira Gandhi Memorial Tulip Garden opens in late March with 1.5 million blooms across 70 varieties — the largest tulip garden in Asia. The almond trees of Badamwari bloom pink against the snowmelt-fed streams, and Shalimar and Nishat gardens reopen their terraced water channels for the season.',
    destinations: ['Srinagar', 'Achabal', 'Verinag'],
    image:
      'https://images.unsplash.com/photo-1513415564515-763d91423bdd?auto=format&fit=crop&w=1200&q=80',
    color: 'oklch(0.78 0.16 350)',
    priceFrom: 24500,
    duration: '5 nights',
  },
  {
    id: 'summer',
    season: 'Summer',
    months: 'May — Jul',
    title: 'Alpine Meadows & Glacial Lakes',
    theme: 'High-Altitude Trekking',
    description:
      'Snow recedes from the high passes and the great Kashmir treks open — the three-day Vishansar–Krishansar–Gangabal circuit, the Tarsar–Marsar twin-lakes trek, and day hikes to Thajiwas and Apharwat. Temperatures in the valley hold at a perfect 24°C.',
    destinations: ['Sonmarg', 'Pahalgam', 'Yusmarg'],
    image:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    color: 'oklch(0.55 0.15 165)',
    priceFrom: 38900,
    duration: '7 nights',
    isFeatured: true,
  },
  {
    id: 'monsoon',
    season: 'Late Summer',
    months: 'Aug — Sep',
    title: 'Saffron Harvest in Pampore',
    theme: 'Cultural & Culinary',
    description:
      'The purple crocus fields of Pampore bloom for only three weeks in late October — but the harvest rituals, kahwa-making workshops, and saffron-picking walks begin in August with the harvest preparation. Pair with the apple harvest of Shopian and the walnut groves of Anantnag.',
    destinations: ['Pampore', 'Shopian', 'Srinagar'],
    image:
      'https://images.unsplash.com/photo-1499678329028-101435549a4e?auto=format&fit=crop&w=1200&q=80',
    color: 'oklch(0.72 0.17 65)',
    priceFrom: 29500,
    duration: '6 nights',
  },
  {
    id: 'autumn',
    season: 'Autumn',
    months: 'Oct — Nov',
    title: 'Chinar Gold & Mughal Gardens',
    theme: 'Photography & Heritage',
    description:
      'The chinar trees — brought to Kashmir by the Mughals — turn the colour of burnished copper. Nishat and Shalimar gardens become a photographer\'s dream, with falling leaves drifting across the stone water channels. The harvest season brings fresh apples, walnuts and the year\'s saffron to market.',
    destinations: ['Srinagar', 'Dachigam', 'Aru'],
    image:
      'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
    color: 'oklch(0.62 0.18 40)',
    priceFrom: 32500,
    duration: '6 nights',
  },
  {
    id: 'winter',
    season: 'Winter',
    months: 'Dec — Feb',
    title: 'Heli-Ski & Frozen Waterfalls',
    theme: 'Powder & Adventure',
    description:
      'Gulmarg receives 14+ metres of snow annually. Eliya\'s heli-ski packages drop you onto untracked faces in the Pir Panjal, with day trips to the frozen waterfalls of Drung and the snow-shoe trails of Tangmarg. Evenings are spent around wood stoves in cedar cabins.',
    destinations: ['Gulmarg', 'Tangmarg', 'Drung'],
    image:
      'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=1200&q=80',
    color: 'oklch(0.85 0.03 240)',
    priceFrom: 64500,
    duration: '7 nights',
    isFeatured: true,
  },
  {
    id: 'houseboat',
    season: 'Year-Round',
    months: 'Any month',
    title: 'Houseboat Heritage Stay',
    theme: 'Slow Living',
    description:
      'A two-night stay on a hand-carved cedar houseboat on Nigeen Lake — the quieter, deeper sister of Dal. Includes a private shikara, kahwa ceremonies, a Wazwan dinner cooked on board, and a dawn visit to the floating vegetable market.',
    destinations: ['Srinagar'],
    image:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80',
    color: 'oklch(0.45 0.10 200)',
    priceFrom: 18900,
    duration: '2 nights',
  },
]

// ============================================================
// 3D Virtual tour scenes — interconnected with teleport hotspots
// ============================================================

export type TourScene = {
  id: string
  name: string
  panorama: string
  description: string
  // Initial camera yaw (degrees, 0-360) — set so at least one hotspot
  // is visible when the scene loads.
  initialYaw: number
  hotspots: {
    id: string
    targetScene: string
    angle: number // 0-360 degrees around
    elevation: number // -90 to 90, 0 = horizon
    label: string
  }[]
}

export const tourScenes: TourScene[] = [
  {
    id: 'dal-lake',
    name: 'Dal Lake — Houseboat Deck',
    panorama:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2400&q=85',
    description:
      'Dawn over Dal Lake. The Pir Panjal range catches the first light while shikaras glide silently across the water.',
    initialYaw: 110,
    hotspots: [
      { id: 'to-mughal', targetScene: 'mughal-gardens', angle: 110, elevation: -5, label: 'Walk to Nishat Garden' },
      { id: 'to-gulmarg', targetScene: 'gulmarg-meadow', angle: 240, elevation: 8, label: 'Drive to Gulmarg' },
      { id: 'to-old-city', targetScene: 'old-city', angle: 30, elevation: -2, label: 'Old Srinagar bazaar' },
    ],
  },
  {
    id: 'mughal-gardens',
    name: 'Nishat Bagh — Mughal Terrace',
    panorama:
      'https://images.unsplash.com/photo-1539635278303-d4002c07eae3?auto=format&fit=crop&w=2400&q=85',
    description:
      'The twelve terraced levels of Nishat Bagh cascade down to Dal Lake. Built in 1633 by Asaf Khan, brother of Empress Nur Jahan.',
    initialYaw: 320,
    hotspots: [
      { id: 'to-dal', targetScene: 'dal-lake', angle: 320, elevation: -10, label: 'Return to houseboat' },
      { id: 'to-shalimar', targetScene: 'shalimar', angle: 90, elevation: 0, label: 'Walk to Shalimar' },
      { id: 'to-pahalgam', targetScene: 'pahalgam-pine', angle: 180, elevation: 5, label: 'Drive to Pahalgam' },
    ],
  },
  {
    id: 'shalimar',
    name: 'Shalimar Bagh — Central Channel',
    panorama:
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=2400&q=85',
    description:
      'The royal garden of Jahangir, built in 1619. The central water channel flows with mountain snowmelt beneath chinar trees planted four centuries ago.',
    initialYaw: 270,
    hotspots: [
      { id: 'to-nishat', targetScene: 'mughal-gardens', angle: 270, elevation: 0, label: 'Walk to Nishat' },
      { id: 'to-dal', targetScene: 'dal-lake', angle: 350, elevation: -8, label: 'Back to houseboat' },
    ],
  },
  {
    id: 'gulmarg-meadow',
    name: 'Gulmarg — Alpine Meadow',
    panorama:
      'https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&w=2400&q=85',
    description:
      'The Gulmarg bowl in summer — wildflowers stretch to the base of Apharwat Peak, where the gondola climbs to 4,390 m.',
    initialYaw: 150,
    hotspots: [
      { id: 'to-dal', targetScene: 'dal-lake', angle: 90, elevation: 0, label: 'Return to Srinagar' },
      { id: 'to-pahalgam', targetScene: 'pahalgam-pine', angle: 150, elevation: 3, label: 'Drive to Pahalgam' },
      { id: 'to-sonmarg', targetScene: 'sonmarg-thajiwas', angle: 30, elevation: 10, label: 'Drive to Sonmarg' },
    ],
  },
  {
    id: 'pahalgam-pine',
    name: 'Pahalgam — Lidder Riverbank',
    panorama:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2400&q=85',
    description:
      'The Lidder rushes through pine forest below the town of Pahalgam. Across the river, the trail to Aru Valley disappears into the trees.',
    initialYaw: 270,
    hotspots: [
      { id: 'to-aroo', targetScene: 'aru-valley', angle: 270, elevation: 8, label: 'Trek to Aru Valley' },
      { id: 'to-dal', targetScene: 'dal-lake', angle: 100, elevation: 0, label: 'Return to Srinagar' },
      { id: 'to-gulmarg', targetScene: 'gulmarg-meadow', angle: 220, elevation: 5, label: 'Drive to Gulmarg' },
    ],
  },
  {
    id: 'aru-valley',
    name: 'Aru Valley — Pine Glade',
    panorama:
      'https://images.unsplash.com/photo-1473773508845-188df298d2d1?auto=format&fit=crop&w=2400&q=85',
    description:
      'Aru — the last motorable village before the Great Himalayan Range. Ponies graze in the glade; the trail to Kolahoi Glacier begins at the far end of the meadow.',
    initialYaw: 90,
    hotspots: [
      { id: 'to-pahalgam', targetScene: 'pahalgam-pine', angle: 90, elevation: -3, label: 'Return to Pahalgam' },
    ],
  },
  {
    id: 'sonmarg-thajiwas',
    name: 'Sonmarg — Thajiwas Glacier',
    panorama:
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=2400&q=85',
    description:
      'Thajiwas Glacier spills into the Sonmarg meadow at 3,000 m. Even in midsummer, the ice remains — a 90-minute pony ride from town.',
    initialYaw: 220,
    hotspots: [
      { id: 'to-dal', targetScene: 'dal-lake', angle: 220, elevation: 0, label: 'Return to Srinagar' },
      { id: 'to-gulmarg', targetScene: 'gulmarg-meadow', angle: 200, elevation: 8, label: 'Drive to Gulmarg' },
    ],
  },
  {
    id: 'old-city',
    name: 'Old Srinagar — Zaina Kadal Bazaar',
    panorama:
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=2400&q=85',
    description:
      'The narrow lanes of old Srinagar — pashmina weavers, copper smiths, saffron vendors and bakeries turning out fresh kulcha. The Shah-e-Hamdan shrine rises above the Jhelum.',
    initialYaw: 180,
    hotspots: [
      { id: 'to-dal', targetScene: 'dal-lake', angle: 180, elevation: 0, label: 'Return to Dal Lake' },
      { id: 'to-pampore', targetScene: 'pampore-saffron', angle: 220, elevation: -5, label: 'Drive to Pampore' },
    ],
  },
  {
    id: 'pampore-saffron',
    name: 'Pampore — Saffron Fields',
    panorama:
      'https://images.unsplash.com/photo-1499678329028-101435549a4e?auto=format&fit=crop&w=2400&q=85',
    description:
      'The saffron fields of Pampore — the only place in India where Crocus sativus grows. The harvest begins in late October and lasts three weeks.',
    initialYaw: 60,
    hotspots: [
      { id: 'to-old-city', targetScene: 'old-city', angle: 60, elevation: 0, label: 'Return to Old City' },
      { id: 'to-dal', targetScene: 'dal-lake', angle: 30, elevation: 0, label: 'Return to Dal Lake' },
    ],
  },
]

// ============================================================
// Site navigation
// ============================================================

export const navLinks = [
  { label: 'Hero', href: '#hero' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Seasons', href: '#seasons' },
  { label: 'Virtual Tour', href: '#tour' },
  { label: 'Guide', href: '#guide' },
  { label: 'Contact', href: '#contact' },
]

export const companyInfo = {
  name: 'Eliya Tours And Travels',
  tagline: 'Curated Kashmir journeys since 2009',
  founded: 2009,
  phone: '+91 94190 12345',
  whatsapp: '+91 94190 12345',
  email: 'hello@eliyatours.in',
  address: 'Boulevard Road, Nigeen Lake, Srinagar, Jammu & Kashmir 190003',
  license: 'J&K Tourism Reg. No. KT-1903-ELIYA',
}
