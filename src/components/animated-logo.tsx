'use client'

// ============================================================
// Animated Eliya Tours logo — SVG with glowing mountains,
// shikara boat on water, and animated fairy lights
// ============================================================

export function AnimatedLogo({ className = 'h-10', light = false }: { className?: string; light?: boolean }) {
  const textColor = light ? '#fef3c7' : '#1c1917'

  return (
    <svg viewBox="0 0 240 60" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Mountain gradient */}
        <linearGradient id="eliya-mtn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        {/* Water gradient */}
        <linearGradient id="eliya-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        {/* Glow filter */}
        <filter id="eliya-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sun / moon circle */}
      <circle cx="22" cy="18" r="6" fill="#fde68a" opacity="0.9" filter="url(#eliya-glow)">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </circle>

      {/* Mountains */}
      <path d="M 8 42 L 18 20 L 24 28 L 30 16 L 38 30 L 44 22 L 52 42 Z" fill="url(#eliya-mtn)" filter="url(#eliya-glow)" />
      {/* Snow cap */}
      <path d="M 18 20 L 20 24 L 16 24 Z M 30 16 L 32 20 L 28 20 Z" fill="#fff" opacity="0.9" />

      {/* Water */}
      <rect x="8" y="42" width="44" height="6" rx="1" fill="url(#eliya-water)" opacity="0.8" />
      {/* Water reflection lines */}
      <line x1="12" y1="45" x2="20" y2="45" stroke="#7dd3fc" strokeWidth="0.5" opacity="0.6">
        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
      </line>
      <line x1="28" y1="46" x2="40" y2="46" stroke="#7dd3fc" strokeWidth="0.5" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite" />
      </line>

      {/* Shikara (boat) */}
      <path d="M 16 44 L 44 44 L 40 47 L 20 47 Z" fill="#92400e" />
      <rect x="26" y="40" width="8" height="4" rx="0.5" fill="#b45309" />
      <line x1="30" y1="34" x2="30" y2="40" stroke="#78350f" strokeWidth="0.8" />

      {/* Fairy lights — animated dots */}
      <circle cx="14" cy="14" r="1.2" fill="#fbbf24" filter="url(#eliya-glow)">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0s" />
      </circle>
      <circle cx="38" cy="12" r="1.2" fill="#fde68a" filter="url(#eliya-glow)">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
      </circle>
      <circle cx="50" cy="18" r="1" fill="#fbbf24" filter="url(#eliya-glow)">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.6s" />
      </circle>
      <circle cx="6" cy="20" r="1" fill="#fde68a" filter="url(#eliya-glow)">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.5s" repeatCount="indefinite" begin="0.9s" />
      </circle>

      {/* Text */}
      <text x="60" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="700" fill={textColor} letterSpacing="0.5">
        Eliya Tours
      </text>
      <text x="60" y="38" fontFamily="system-ui, -apple-system, sans-serif" fontSize="8" fontWeight="500" fill={light ? '#fbbf24' : '#78716c'} letterSpacing="2" textTransform="uppercase">
        AND TRAVELS
      </text>
    </svg>
  )
}
