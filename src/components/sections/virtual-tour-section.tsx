'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Compass, Maximize2, Move, Navigation, X, Info, GripVertical } from 'lucide-react'
import { tourScenes, type TourScene } from '@/lib/destinations'

// ============================================================
// Drag-to-look 360° panorama viewer with teleport hotspots
//
// We project a wide panoramic image into a viewport by translating
// camera yaw (left-right) and pitch (up-down) into background-position
// offsets. Dragging with the pointer (or touch) updates yaw/pitch.
// Hotspots are positioned on the panorama using their (angle, elevation)
// polar coordinates, projected to screen coordinates via the same camera
// transform. Clicking a hotspot teleports to its target scene.
//
// Camera state is owned by an inner <PanoramaStage/> component that is
// remounted (via key={sceneIdx}) when the scene changes · this resets
// the camera without calling setState synchronously inside an effect.
// ============================================================

const FOV_DEG = 75 // horizontal field of view in degrees
const PITCH_LIMIT = 35 // limit vertical look

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function Hotspot({
  hotspot,
  yaw,
  pitch,
  fov,
  onSelect,
}: {
  hotspot: TourScene['hotspots'][number]
  yaw: number
  pitch: number
  fov: number
  onSelect: () => void
}) {
  // Project hotspot (angle, elevation) into viewport-relative position.
  // The hotspot is visible when its angle is within [yaw - fov/2, yaw + fov/2].
  const delta = ((hotspot.angle - yaw + 540) % 360) - 180 // -180..180
  const elevationDelta = hotspot.elevation - pitch
  const halfFov = fov / 2

  if (Math.abs(delta) > halfFov + 8) return null

  const xPct = 50 + (delta / halfFov) * 50
  const yPct = 50 - (elevationDelta / halfFov) * 50 // inverted Y

  // distance-based opacity
  const distance = Math.abs(delta) / halfFov
  const opacity = clamp(1 - distance * 0.6, 0.35, 1)

  return (
    <button
      onPointerDown={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2 group/hp"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        opacity,
      }}
      aria-label={`Teleport to ${hotspot.label}`}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full eliya-pulse-ring bg-amber-300/60" />
      {/* Core */}
      <span className="relative grid place-items-center w-9 h-9 rounded-full bg-amber-50/95 ring-2 ring-amber-300 shadow-[0_4px_16px_rgba(0,0,0,0.4)] group-hover/hp:scale-110 transition-transform">
        <Navigation className="w-4 h-4 text-stone-900" strokeWidth={2.4} />
      </span>
      {/* Label */}
      <span className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.15em] text-amber-50 bg-stone-950/85 backdrop-blur-sm ring-1 ring-amber-50/20 px-2.5 py-1 rounded-full">
        {hotspot.label}
      </span>
    </button>
  )
}

// ============================================================
// Panorama stage · owns the camera state for the current scene.
// Remounted on scene change so the camera resets cleanly.
// ============================================================
function PanoramaStage({
  scene,
  sceneIdx,
  totalScenes,
  isTransitioning,
  onTeleport,
  onDragStart,
  onDragEnd,
  onToggleHelp,
  showHelp,
}: {
  scene: TourScene
  sceneIdx: number
  totalScenes: number
  isTransitioning: boolean
  onTeleport: (targetId: string) => void
  onDragStart: () => void
  onDragEnd: () => void
  onToggleHelp: () => void
  showHelp: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const dragState = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null)

  // Camera state · fresh mount per scene means these reset to defaults automatically.
  // initialYaw is set per-scene so at least one hotspot is in view on load.
  const [yaw, setYaw] = useState(scene.initialYaw)
  const [pitch, setPitch] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // ===== Pointer drag handlers =====
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    onDragStart()
    setIsDragging(true)
    dragState.current = { x: e.clientX, y: e.clientY, yaw, pitch }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || !isDragging) return
    const dx = e.clientX - dragState.current.x
    const dy = e.clientY - dragState.current.y
    // Drag sensitivity: 0.4 degrees per pixel
    const newYaw = (dragState.current.yaw - dx * 0.4 + 360) % 360
    const newPitch = clamp(dragState.current.pitch + dy * 0.3, -PITCH_LIMIT, PITCH_LIMIT)
    setYaw(newYaw)
    setPitch(newPitch)
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false)
    dragState.current = null
    onDragEnd()
    ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
  }

  // ===== Keyboard navigation (bound while this stage is mounted) =====
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setYaw((y) => (y - 6 + 360) % 360)
      else if (e.key === 'ArrowRight') setYaw((y) => (y + 6) % 360)
      else if (e.key === 'ArrowUp') setPitch((p) => clamp(p - 4, -PITCH_LIMIT, PITCH_LIMIT))
      else if (e.key === 'ArrowDown') setPitch((p) => clamp(p + 4, -PITCH_LIMIT, PITCH_LIMIT))
      else if (e.key === 'Escape') onToggleHelp()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onToggleHelp])

  // ===== Background projection =====
  // background-position-x: 0% = yaw 0, 100% = yaw 360.
  // background-position-y: 0% = pitch +90 (up), 100% = pitch -90 (down).
  const bgX = ((yaw - FOV_DEG / 2) / 360) * 100
  const bgY = 50 - (pitch / 90) * 50 // pitch 0 -> 50%, pitch +35 -> ~31%
  // FOV determines how much of the panorama is visible: size = 360/fov * 100%
  const bgSize = (360 / FOV_DEG) * 100

  return (
    <div
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`relative aspect-[16/9] sm:aspect-[2/1] w-full overflow-hidden rounded-3xl bg-stone-950 select-none touch-none ring-1 ring-stone-900/10 eliya-shadow-deep ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Drag grip handle (visible on every device) */}
      <div
        className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none flex flex-col items-center gap-1 transition-opacity duration-300 ${
          isDragging ? 'opacity-90' : 'opacity-40 hover:opacity-80'
        }`}
      >
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-950/55 backdrop-blur-md ring-1 ring-amber-50/15 rounded-full">
          <GripVertical className="w-3.5 h-3.5 text-amber-50" />
          <span className="text-[10px] uppercase tracking-[0.22em] text-amber-50 font-medium">
            {isDragging ? 'Looking around…' : 'Drag to look'}
          </span>
          <GripVertical className="w-3.5 h-3.5 text-amber-50" />
        </div>
        {/* Grip dots row · visual affordance */}
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="w-1 h-1 rounded-full bg-amber-50/40" />
          ))}
        </div>
      </div>
      {/* The panorama layer. */}
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url(${scene.panorama})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${bgSize}% auto`,
          backgroundPosition: `${bgX}% ${bgY}%`,
          // Slight scale to avoid edge seams during drag
          transform: `scale(1.04)`,
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)',
        }}
      />

      {/* Hotspots */}
      {scene.hotspots.map((hp) => (
        <Hotspot
          key={hp.id}
          hotspot={hp}
          yaw={yaw}
          pitch={pitch}
          fov={FOV_DEG}
          onSelect={() => onTeleport(hp.targetScene)}
        />
      ))}

      {/* ===== HUD: top bar ===== */}
      <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-start justify-between pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-full bg-stone-950/70 backdrop-blur-md ring-1 ring-amber-50/20 text-amber-50">
            <Compass
              className="w-5 h-5"
              style={{ transform: `rotate(${-yaw}deg)`, transition: 'transform 0.1s' }}
            />
          </div>
          <div className="text-amber-50">
            <div className="text-[10px] uppercase tracking-[0.22em] text-amber-200/80">
              Scene {String(sceneIdx + 1).padStart(2, '0')} / {String(totalScenes).padStart(2, '0')}
            </div>
            <div className="text-sm font-semibold mt-0.5">{scene.name}</div>
          </div>
        </div>

        <div className="hidden sm:flex flex-col items-end gap-1 text-amber-50/80 text-[10px] uppercase tracking-[0.18em] tabular-nums">
          <span className="bg-stone-950/70 backdrop-blur-md ring-1 ring-amber-50/15 px-2.5 py-1 rounded-full">
            Yaw {Math.round(yaw)}°
          </span>
          <span className="bg-stone-950/70 backdrop-blur-md ring-1 ring-amber-50/15 px-2.5 py-1 rounded-full">
            Pitch {Math.round(pitch)}°
          </span>
        </div>
      </div>

      {/* ===== HUD: bottom bar · scene description + scene picker ===== */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pointer-events-none">
        {/* description */}
        <div className="max-w-xl text-amber-50 pointer-events-auto">
          <p className="text-sm leading-relaxed text-stone-200/95 bg-stone-950/55 backdrop-blur-md ring-1 ring-amber-50/15 px-4 py-3 rounded-2xl">
            {scene.description}
          </p>
        </div>
      </div>

      {/* Drag cue when idle */}
      {!isDragging && !showHelp && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <div className="px-4 py-2 bg-stone-950/40 backdrop-blur-sm ring-1 ring-amber-50/20 rounded-full text-amber-50 text-[11px] uppercase tracking-[0.22em] flex items-center gap-2 animate-pulse">
            <Move className="w-3.5 h-3.5" />
            Drag to look
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Section · owns scene + transition state, mounts PanoramaStage
// with a key so camera resets cleanly on teleport.
// ============================================================
export function VirtualTourSection() {
  const [sceneIdx, setSceneIdx] = useState(0)
  const [showHelp, setShowHelp] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const scene = tourScenes[sceneIdx]

  // Fade out → switch scene → fade in. setTimeout is fine here because
  // we are scheduling a side-effect, not synchronously updating state.
  useEffect(() => {
    if (!isTransitioning) return
    const t = setTimeout(() => setIsTransitioning(false), 600)
    return () => clearTimeout(t)
  }, [isTransitioning])

  const teleportTo = useCallback(
    (targetId: string) => {
      const idx = tourScenes.findIndex((s) => s.id === targetId)
      if (idx === -1 || idx === sceneIdx) return
      setIsTransitioning(true)
      // small delay so the fade-out reads as intentional
      window.setTimeout(() => setSceneIdx(idx), 250)
    },
    [sceneIdx]
  )

  return (
    <section id="tour" className="relative bg-stone-100 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-10 bg-stone-900" />
              <span className="text-[11px] uppercase tracking-[0.32em] text-stone-500 font-medium">
                Walk before you walk · the Eliya 360° tour
              </span>
            </div>
            <h2 className="text-balance text-3xl sm:text-5xl font-semibold tracking-tight text-stone-950 leading-[1.1]">
              Drag to look around.
              <span className="italic font-light text-stone-500"> Teleport between nine locations.</span>
            </h2>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-stone-600">
              Stand on the deck of a Dal Lake houseboat at dawn. Look right · there&apos;s Nishat Garden.
              Look left · the old city bazaar. Click a glowing pin to teleport to the next scene.
              Nine interconnected locations across the Kashmir Valley.
            </p>
          </div>

          {/* Help / hide control */}
          <button
            onClick={() => setShowHelp((s) => !s)}
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-stone-950 ring-1 ring-stone-300 hover:ring-stone-400 rounded-full px-4 py-2 transition-colors"
          >
            <Info className="w-4 h-4" />
            {showHelp ? 'Hide' : 'Show'} controls
          </button>
        </div>

        {/* ===== Viewer (remounts on scene change) ===== */}
        <div className="mt-10 relative">
          <PanoramaStage
            key={sceneIdx}
            scene={scene}
            sceneIdx={sceneIdx}
            totalScenes={tourScenes.length}
            isTransitioning={isTransitioning}
            onTeleport={teleportTo}
            onDragStart={() => setShowHelp(false)}
            onDragEnd={() => {}}
            onToggleHelp={() => setShowHelp(false)}
            showHelp={showHelp}
          />

          {/* ===== Help overlay (dismissible) ===== */}
          {showHelp && (
            <div className="absolute inset-0 z-40 grid place-items-center bg-stone-950/55 backdrop-blur-sm p-6">
              <div className="max-w-md w-full bg-stone-50 rounded-3xl p-6 shadow-2xl relative">
                <button
                  onClick={() => setShowHelp(false)}
                  aria-label="Close help"
                  className="absolute top-3 right-3 grid place-items-center w-8 h-8 rounded-full hover:bg-stone-200 text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-2 mb-4">
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-stone-900 text-amber-50">
                    <Move className="w-4 h-4" />
                  </span>
                  <h3 className="text-lg font-semibold tracking-tight text-stone-950">
                    How to explore
                  </h3>
                </div>
                <ul className="space-y-3 text-sm text-stone-700">
                  <li className="flex items-start gap-3">
                    <span className="grid place-items-center w-6 h-6 rounded-full bg-stone-200 text-[11px] font-semibold text-stone-700 shrink-0">1</span>
                    <span>
                      <span className="font-medium text-stone-900">Click and drag</span> anywhere on the panorama to look around in any direction.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid place-items-center w-6 h-6 rounded-full bg-stone-200 text-[11px] font-semibold text-stone-700 shrink-0">2</span>
                    <span>
                      <span className="font-medium text-stone-900">Tap a glowing pin</span> to teleport to the connected scene · there are nine locations across the Valley.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="grid place-items-center w-6 h-6 rounded-full bg-stone-200 text-[11px] font-semibold text-stone-700 shrink-0">3</span>
                    <span>
                      <span className="font-medium text-stone-900">Use arrow keys</span> ← → ↑ ↓ for precise camera control. Or pick a scene from the bottom strip.
                    </span>
                  </li>
                </ul>
                <button
                  onClick={() => setShowHelp(false)}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-stone-900 text-amber-50 rounded-full py-3 text-sm font-medium hover:bg-stone-700 transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  Start exploring
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ===== Scene overview strip ===== */}
        <div className="mt-8 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-2">
          {tourScenes.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => teleportTo(s.id)}
              className={`group relative aspect-[4/3] rounded-xl overflow-hidden ring-1 transition-all ${
                idx === sceneIdx
                  ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-stone-100'
                  : 'ring-stone-300 hover:ring-stone-500'
              }`}
            >
              <img src={s.panorama} alt={s.name} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-transparent to-transparent" />
              <div className="absolute bottom-1.5 left-2 right-2 text-left">
                <div className="text-[10px] uppercase tracking-[0.15em] text-amber-200/80 font-medium">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div className="text-[11px] font-medium text-amber-50 line-clamp-1 leading-tight">
                  {s.name.split('·')[0].trim()}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
