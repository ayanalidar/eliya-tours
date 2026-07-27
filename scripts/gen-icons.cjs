// Generate PWA icons (192px + 512px) as solid color with a "mountain" mark
// Uses sharp (already in package.json).
const sharp = require('sharp')
const path = require('path')

const svg = (size) => `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#292524"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.18}" fill="url(#bg)"/>
  <!-- Mountain mark -->
  <path d="M ${size*0.2} ${size*0.7} L ${size*0.45} ${size*0.32} L ${size*0.58} ${size*0.5} L ${size*0.68} ${size*0.38} L ${size*0.82} ${size*0.7} Z" fill="#fef3c7" opacity="0.95"/>
  <!-- Snow cap -->
  <path d="M ${size*0.45} ${size*0.32} L ${size*0.4} ${size*0.4} L ${size*0.5} ${size*0.4} Z" fill="#fff" opacity="0.9"/>
  <!-- Sun -->
  <circle cx="${size*0.72}" cy="${size*0.28}" r="${size*0.06}" fill="#fbbf24" opacity="0.9"/>
  <!-- "ET" monogram -->
  <text x="${size*0.5}" y="${size*0.88}" text-anchor="middle" font-family="Georgia, serif" font-size="${size*0.11}" font-weight="700" fill="#fef3c7" opacity="0.85" letter-spacing="2">ELIYA</text>
</svg>`

const outDir = path.join(__dirname, '..', 'public')

Promise.all([
  sharp(Buffer.from(svg(192))).png().toFile(path.join(outDir, 'icon-192.png')),
  sharp(Buffer.from(svg(512))).png().toFile(path.join(outDir, 'icon-512.png')),
  sharp(Buffer.from(svg(192))).png().toFile(path.join(outDir, 'favicon.ico')),
]).then(() => console.log('✅ PWA icons generated'))
.catch((e) => { console.error('❌', e); process.exit(1) })
