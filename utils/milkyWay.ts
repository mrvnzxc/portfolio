/* The Milky Way band's shape and placement, painted by the Space starfield (DustCanvas). */

/** A point on the band's spine, with its normal and local half-width. */
export type BandPoint = { x: number; y: number; nx: number; ny: number; angle: number; width: number; core: number }

/* A fixed seed keeps the same lanes, clouds and stars across resizes, visits and themes */
export const GALAXY_SEED = 20260926
/** The band is further away than any star, so it barely moves on scroll. */
export const GALAXY_PARALLAX = 0.02
/** Band drawn below the viewport so parallax never reveals its edge (fraction of viewport height). */
export const GALAXY_OVERSCAN = 0.3
/** Where along the band (0 → 1) the bright galactic core sits: behind the hero planet on desktop. */
export const CORE_T = 0.64

/** Small seeded PRNG (mulberry32). */
export const seededRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** The band's typical half-width in px for a viewport. */
export const bandScale = (w: number, h: number) => Math.hypot(w, h) * 0.085

/** How far the band has slid up for the current scroll position (px, ≤ 0). */
export const galaxyShift = (scrollY: number, viewportHeight: number) =>
  Math.max(-viewportHeight * GALAXY_OVERSCAN, -scrollY * GALAXY_PARALLAX)

/**
 * The band's spine: an arc rising from below the fold to the top-right corner.
 * On desktop it bows away from the hero text and puts the core behind the planet.
 */
export const bandGeometry = (w: number, h: number) => {
  const portrait = h > w
  const p0 = portrait ? { x: -0.2 * w, y: 0.86 * h } : { x: 0.02 * w, y: 1.18 * h }
  const p1 = portrait ? { x: 0.55 * w, y: 0.62 * h } : { x: 0.7 * w, y: 0.85 * h }
  const p2 = portrait ? { x: 1.2 * w, y: 0.08 * h } : { x: 1.1 * w, y: -0.1 * h }
  const scale = bandScale(w, h)

  return (t: number): BandPoint => {
    const u = 1 - t
    const x = u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x
    const y = u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y
    const dx = 2 * u * (p1.x - p0.x) + 2 * t * (p2.x - p1.x)
    const dy = 2 * u * (p1.y - p0.y) + 2 * t * (p2.y - p1.y)
    const length = Math.hypot(dx, dy) || 1
    const core = Math.exp(-(((t - CORE_T) / 0.17) ** 2))
    return { x, y, nx: -dy / length, ny: dx / length, angle: Math.atan2(dy, dx), width: scale * (0.75 + 0.35 * core), core }
  }
}

/** Offset of the Great Rift from the spine: it wanders instead of splitting the band evenly. */
export const laneOffset = (t: number, width: number) => width * (0.1 * Math.sin(t * 11 + 0.6) + 0.06 * Math.sin(t * 27 + 2.1))

/** How opaque the rift is along the band: thick in places, nearly gone in others. */
export const laneDensity = (t: number) => Math.min(1, 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(t * 19 + 0.8)) * (0.6 + 0.4 * Math.sin(t * 43 + 2)))
