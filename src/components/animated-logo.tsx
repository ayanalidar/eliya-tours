'use client'

// ============================================================
// Chinar leaf logo — animated color-changing SVG
// The Chinar (Platanus orientalis) is the iconic tree of Kashmir
// ============================================================

export function AnimatedLogo({ className = 'h-10', light = false }: { className?: string; light?: boolean }) {
  const textColor = light ? '#fef3c7' : '#1c1917'
  const subColor = light ? '#fbbf24' : '#78716c'

  return (
    <svg viewBox="0 0 260 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="chinar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24">
            <animate attributeName="stop-color" values="#fbbf24;#f97316;#dc2626;#84cc16;#fbbf24" dur="8s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor="#f97316">
            <animate attributeName="stop-color" values="#f97316;#dc2626;#84cc16;#fbbf24;#f97316" dur="8s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#dc2626">
            <animate attributeName="stop-color" values="#dc2626;#84cc16;#fbbf24;#f97316;#dc2626" dur="8s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        <filter id="chinar-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Chinar leaf — stylized 5-lobed leaf */}
      <g filter="url(#chinar-glow)" transform="translate(30, 30)">
        {/* Stem */}
        <line x1="0" y1="22" x2="0" y2="8" stroke="url(#chinar-grad)" strokeWidth="1.5" strokeLinecap="round" />

        {/* Leaf body — 5 pointed lobes radiating from center */}
        <path
          d="M 0 8
             C -4 4, -10 2, -14 4
             C -10 0, -8 -4, -10 -8
             C -6 -4, -3 -6, -2 -10
             C -1 -6, 0 -12, 0 -16
             C 0 -12, 1 -6, 2 -10
             C 3 -6, 6 -4, 10 -8
             C 8 -4, 10 0, 14 4
             C 10 2, 4 4, 0 8 Z"
          fill="url(#chinar-grad)"
          opacity="0.95"
        >
          <animate attributeName="opacity" values="0.85;1;0.85" dur="4s" repeatCount="indefinite" />
        </path>

        {/* Leaf veins */}
        <line x1="0" y1="8" x2="0" y2="-14" stroke="#fff" strokeWidth="0.4" opacity="0.5" />
        <line x1="0" y1="0" x2="-10" y2="-4" stroke="#fff" strokeWidth="0.3" opacity="0.4" />
        <line x1="0" y1="0" x2="10" y2="-4" stroke="#fff" strokeWidth="0.3" opacity="0.4" />
        <line x1="0" y1="4" x2="-8" y2="2" stroke="#fff" strokeWidth="0.3" opacity="0.3" />
        <line x1="0" y1="4" x2="8" y2="2" stroke="#fff" strokeWidth="0.3" opacity="0.3" />

        {/* Small falling leaf particle */}
        <path
          d="M -16 12 C -14 10, -12 11, -12 13 C -13 14, -15 13, -16 12 Z"
          fill="url(#chinar-grad)"
          opacity="0.6"
        >
          <animateTransform attributeName="transform" type="rotate" from="0 -14 12" to="360 -14 12" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Text */}
      <text x="58" y="24" fontFamily="system-ui, -apple-system, sans-serif" fontSize="15" fontWeight="700" fill={textColor} letterSpacing="0.5">
        Eliya Tours
      </text>
      <text x="58" y="36" fontFamily="system-ui, -apple-system, sans-serif" fontSize="7" fontWeight="500" fill={subColor} letterSpacing="1.5">
        AND TRAVELS
      </text>
    </svg>
  )
}
