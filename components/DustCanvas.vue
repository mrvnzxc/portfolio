<template>
  <canvas ref="canvas" id="dust-canvas" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  bandGeometry,
  CORE_T,
  GALAXY_OVERSCAN,
  GALAXY_SEED,
  galaxyShift,
  laneDensity,
  laneOffset,
  seededRandom,
  type BandPoint
} from '~/utils/milkyWay'

const canvas = ref<HTMLCanvasElement | null>(null)

type Star = {
  x: number
  y: number
  /** 0.2 (far) → 1 (near): drives size, brightness, drift and scroll parallax */
  z: number
  r: number
  vx: number
  vy: number
  alpha: number
  twinkleSpeed: number
  twinklePhase: number
  tint: 0 | 1 | 2
}

type ShootingStar = { x: number; y: number; vx: number; vy: number; length: number; life: number; decay: number }

/** A bright star near the band that flashes four diffraction spikes. */
type Sparkle = { x: number; y: number; size: number; tint: 0 | 1 | 2; speed: number; phase: number }

type Galaxy = {
  /** Viewport size the band was laid out for; a resize stretches it until the rebuild lands. */
  width: number
  height: number
  band: (t: number) => BandPoint
  /** Length of the spine in px, to turn px-per-second speeds into steps along it. */
  length: number
  glow: HTMLCanvasElement
  stars: { path: Path2D; fill: string }[]
  sparkles: Sparkle[]
}

/*
 * Things that stream along the band. Each side of the spine mostly flows the opposite way,
 * so the disc reads as turning. Positions are band units (t along it, u across it in
 * half-widths), so they carry over when a resize rebuilds the band.
 */
type Drifter = { t: number; u: number; speed: number; r: number; alpha: number; tint: 0 | 1 | 2; twinkleSpeed: number; twinklePhase: number }
type GasCloud = { t: number; u: number; speed: number; size: number; alpha: number; rgb: string }

/* White, blue-white, warm — rgb triplets for dark mode. Light mode draws ink specks. */
const DARK_TINTS = ['255,255,255', '200,220,255', '255,228,196']
const LIGHT_TINTS = ['20,24,60', '40,52,120', '70,50,110']
/** How far the nearest stars move per scrolled pixel. */
const PARALLAX = 0.14

/** The glow is soft, so it renders at reduced resolution and is upscaled. */
const GLOW_SCALE = 0.5
const GALAXY_ALPHA = 0.9
const GLOW_WARM = '255,222,190'
const GLOW_VIOLET = '170,156,255'
const GLOW_BLUE = '120,176,255'
const BAND_STAR_ALPHAS = [0.2, 0.34, 0.5, 0.72]
const BAND_DUST_ALPHAS = [0.1, 0.18, 0.28]
/** Streaming stars, px per second along the band. */
const DRIFT_SPEED = { min: 8, spread: 20 }
/** Light patches move slower than the stars in front of them. */
const CLOUD_SPEED = { min: 3, spread: 6 }

/** Fades streaming things in and out at the ends of the band, where they wrap around. */
const endFade = (t: number) => Math.max(0, Math.min(1, t / 0.08, (1 - t) / 0.08))

/**
 * A soft round blob to stamp the band with. Stamping a sprite, rotated and scaled each time,
 * instead of building hundreds of gradients also keeps their dither patterns from lining up
 * and adding into a visible grid.
 */
const makeGlowSprite = (rgb: string) => {
  const size = 64
  const mid = size / 2
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const g = sprite.getContext('2d')
  if (!g) return sprite
  const gradient = g.createRadialGradient(mid, mid, 0, mid, mid, mid)
  gradient.addColorStop(0, `rgba(${rgb},1)`)
  gradient.addColorStop(0.45, `rgba(${rgb},0.45)`)
  gradient.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = gradient
  g.fillRect(0, 0, size, size)
  return sprite
}

/** One tinted sparkle: a small halo crossed by two tapered spikes. */
const makeSparkleSprite = (rgb: string) => {
  const size = 128
  const mid = size / 2
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const g = sprite.getContext('2d')
  if (!g) return sprite

  const halo = g.createRadialGradient(mid, mid, 0, mid, mid, mid * 0.4)
  halo.addColorStop(0, 'rgba(255,255,255,1)')
  halo.addColorStop(0.14, `rgba(${rgb},0.8)`)
  halo.addColorStop(0.45, `rgba(${rgb},0.16)`)
  halo.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = halo
  g.beginPath()
  g.arc(mid, mid, mid * 0.4, 0, Math.PI * 2)
  g.fill()

  const spike = g.createRadialGradient(mid, mid, 0, mid, mid, mid)
  spike.addColorStop(0, 'rgba(255,255,255,1)')
  spike.addColorStop(0.3, `rgba(${rgb},0.6)`)
  spike.addColorStop(1, `rgba(${rgb},0)`)
  g.fillStyle = spike
  const thickness = 3
  g.beginPath()
  g.moveTo(0, mid)
  g.lineTo(mid, mid - thickness)
  g.lineTo(size, mid)
  g.lineTo(mid, mid + thickness)
  g.closePath()
  g.moveTo(mid, 0)
  g.lineTo(mid + thickness, mid)
  g.lineTo(mid, size)
  g.lineTo(mid - thickness, mid)
  g.closePath()
  g.fill()
  return sprite
}

onMounted(() => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const stars: Star[] = []
  const shootingStars: ShootingStar[] = []
  let animationId = 0
  let lastShootingStarTime = -2500
  let viewportWidth = window.innerWidth
  let viewportHeight = window.innerHeight
  /* Built on first use in space, so Ground Control visitors never pay for it */
  let galaxy: Galaxy | null = null
  let sparkleSprites: HTMLCanvasElement[] = []
  const glowSprites = new Map<string, HTMLCanvasElement>()
  const drifters: Drifter[] = []
  const clouds: GasCloud[] = []
  let lastFlowTime = 0
  let rebuildTimer = 0

  const glowSprite = (rgb: string) => {
    let sprite = glowSprites.get(rgb)
    if (!sprite) {
      sprite = makeGlowSprite(rgb)
      glowSprites.set(rgb, sprite)
    }
    return sprite
  }

  const resizeCanvas = () => {
    if (!canvas.value) return
    viewportWidth = window.innerWidth
    viewportHeight = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.value.width = Math.floor(viewportWidth * dpr)
    canvas.value.height = Math.floor(viewportHeight * dpr)
    canvas.value.style.width = `${viewportWidth}px`
    canvas.value.style.height = `${viewportHeight}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  /** Keep distribution when the viewport resizes (mobile URL bar, rotation) — do not re-randomize. */
  const remapToViewport = (prevW: number, prevH: number) => {
    if (prevW <= 0 || prevH <= 0) return
    const sx = viewportWidth / prevW
    const sy = viewportHeight / prevH
    stars.forEach((s) => {
      s.x *= sx
      s.y *= sy
    })
    shootingStars.forEach((s) => {
      s.x *= sx
      s.y *= sy
    })
  }

  const createStars = () => {
    const area = viewportWidth * viewportHeight
    const count = Math.max(160, Math.min(420, Math.floor(area / 9000)))
    stars.length = 0
    for (let i = 0; i < count; i += 1) {
      /* Skew toward far stars so the sky has depth: many faint, few bright */
      const z = 0.2 + Math.pow(Math.random(), 2.2) * 0.8
      const tintRoll = Math.random()
      stars.push({
        x: Math.random() * viewportWidth,
        y: Math.random() * viewportHeight,
        z,
        r: 0.45 + z * 1.55,
        vx: (Math.random() - 0.5) * 0.12 * z,
        vy: (Math.random() - 0.5) * 0.12 * z,
        alpha: 0.35 + z * 0.6,
        twinkleSpeed: 0.0006 + Math.random() * 0.0018,
        twinklePhase: Math.random() * Math.PI * 2,
        tint: tintRoll > 0.9 ? 2 : tintRoll > 0.7 ? 1 : 0
      })
    }
  }

  const buildGalaxy = (): Galaxy | null => {
    const rand = seededRandom(GALAXY_SEED)
    /* Sum of three uniforms: close enough to a unit normal, and bounded at ±3 */
    const gauss = () => (rand() + rand() + rand() - 1.5) * 2
    const w = viewportWidth
    const h = viewportHeight
    const band = bandGeometry(w, h)

    const glow = document.createElement('canvas')
    glow.width = Math.ceil(w * GLOW_SCALE)
    glow.height = Math.ceil(h * (1 + GALAXY_OVERSCAN) * GLOW_SCALE)
    const g = glow.getContext('2d')
    if (!g) return null
    g.scale(GLOW_SCALE, GLOW_SCALE)

    /** A soft elliptical blob, stretched along the band's direction. */
    const blob = (p: BandPoint, offset: number, radius: number, stretch: number, rgb: string, alpha: number, tilt = 0) => {
      g.save()
      g.translate(p.x + p.nx * offset, p.y + p.ny * offset)
      g.rotate(p.angle + tilt)
      g.scale(stretch, 1)
      g.globalAlpha = alpha
      g.drawImage(glowSprite(rgb), -radius, -radius, radius * 2, radius * 2)
      g.restore()
    }

    const glowColor = (p: BandPoint, offset: number) => {
      const edge = Math.abs(offset) / p.width
      if (p.core * (1 - edge) > 0.6) return GLOW_WARM
      return edge > 0.55 ? GLOW_BLUE : GLOW_VIOLET
    }

    /* Light adds up: overlapping blobs brighten the spine and fade out at the edges */
    g.globalCompositeOperation = 'lighter'

    for (let i = 0; i < 90; i += 1) {
      const p = band(rand())
      const offset = gauss() * p.width * 0.3
      blob(p, offset, p.width * (0.9 + rand() * 0.8), 1.8, glowColor(p, offset), 0.02 + 0.012 * p.core)
    }

    /* Star clouds: smaller clumps so the band looks mottled, not airbrushed */
    for (let i = 0; i < 200; i += 1) {
      const p = band(rand())
      const offset = gauss() * p.width * 0.4
      blob(p, offset, p.width * (0.12 + rand() * 0.3), 1.4, glowColor(p, offset), 0.025 + 0.02 * p.core)
    }

    /* Galactic bulge */
    for (let i = 0; i < 8; i += 1) {
      const p = band(CORE_T + gauss() * 0.04)
      blob(p, gauss() * p.width * 0.2, p.width * (0.45 + rand() * 0.4), 1.3, GLOW_WARM, 0.022)
    }

    /*
     * Knots of unresolved stars. They stay several pixels wide on purpose: single-pixel
     * specks in this half-size layer turn into a grid pattern when it is upscaled.
     */
    for (let i = 0; i < 500; i += 1) {
      const p = band(rand())
      const offset = gauss() * p.width * 0.35
      blob(p, offset, 4 + rand() * 6, 1.4, rand() < 0.3 ? GLOW_WARM : '235,235,255', 0.03 + rand() * 0.05)
    }

    /* Dust lanes erase the glow, the way real dust hides the stars behind it */
    g.globalCompositeOperation = 'destination-out'

    const laneSteps = 260
    for (let i = 0; i < laneSteps; i += 1) {
      /* Skip some steps so the rift breaks up into patches */
      if (rand() < 0.25) continue
      const t = 0.08 + (i / laneSteps) * 0.89
      const p = band(t)
      const radius = p.width * (0.08 + rand() * 0.12) * (0.75 + 0.45 * p.core)
      const alpha = (0.1 + rand() * 0.22) * laneDensity(t)
      blob(p, laneOffset(t, p.width) + gauss() * p.width * 0.06, radius, 2.2, '0,0,0', alpha)
    }

    /* A thinner branch peels off the main rift through the brightest stretch */
    for (let i = 0; i < 120; i += 1) {
      const progress = i / 120
      const t = 0.36 + progress * 0.42
      const p = band(t)
      const offset = laneOffset(t, p.width) - p.width * 0.4 * Math.pow(progress, 0.8)
      blob(p, offset + gauss() * p.width * 0.03, p.width * (0.05 + rand() * 0.07), 2.4, '0,0,0', (0.1 + rand() * 0.18) * Math.sin(Math.PI * progress))
    }

    /* Loose wisps so the edges of the band fray */
    for (let i = 0; i < 90; i += 1) {
      const p = band(rand())
      blob(p, gauss() * p.width * 0.5, p.width * (0.04 + rand() * 0.1), 2.5 + rand(), '0,0,0', 0.08 + rand() * 0.14, (rand() - 0.5) * 0.5)
    }

    /*
     * Band stars at full resolution, batched into one path per colour so a frame costs a
     * dozen fills. Fewer land inside the rift, since the dust hides them.
     */
    const paths = new Map<string, Path2D>()
    const addStar = (fill: string, x: number, y: number, r: number, square: boolean) => {
      const path = paths.get(fill) ?? new Path2D()
      if (square) {
        path.rect(x, y, r, r)
      } else {
        path.moveTo(x + r, y)
        path.arc(x, y, r, 0, Math.PI * 2)
      }
      paths.set(fill, path)
    }
    const inLane = (t: number, p: BandPoint, offset: number) => Math.abs(offset - laneOffset(t, p.width)) < p.width * 0.09 * laneDensity(t)

    /* Resolved stars */
    const starCount = Math.max(280, Math.min(900, Math.floor((w * h) / 1600)))
    for (let i = 0; i < starCount; i += 1) {
      const t = rand() < 0.3 ? Math.min(1, Math.max(0, CORE_T + gauss() * 0.08)) : rand()
      const p = band(t)
      const offset = gauss() * p.width * 0.4
      if (inLane(t, p, offset) && rand() < 0.75) continue
      const falloff = Math.exp(-((offset / p.width) ** 2))
      const level = Math.min(3, Math.floor(rand() * 2 + falloff * 2))
      const tint = rand() < 0.15 + 0.35 * p.core ? 2 : rand() < 0.25 ? 1 : 0
      const r = 0.35 + rand() ** 3 * 0.85
      addStar(`rgba(${DARK_TINTS[tint]},${BAND_STAR_ALPHAS[level]})`, p.x + p.nx * offset, p.y + p.ny * offset, r, false)
    }

    /* Star dust: faint one-pixel grain packed toward the spine */
    const dustCount = Math.max(600, Math.min(2400, Math.floor((w * h) / 700)))
    for (let i = 0; i < dustCount; i += 1) {
      const t = rand()
      const p = band(t)
      const offset = gauss() * p.width * 0.36
      if (inLane(t, p, offset) && rand() < 0.8) continue
      const falloff = Math.exp(-((offset / p.width) ** 2))
      const level = Math.min(2, Math.floor(rand() * 1.5 + falloff * 1.5))
      addStar(`rgba(${DARK_TINTS[rand() < 0.3 ? 2 : 0]},${BAND_DUST_ALPHAS[level]})`, p.x + p.nx * offset, p.y + p.ny * offset, 0.7 + rand() * 0.4, true)
    }

    const bandStars = [...paths].map(([fill, path]) => ({ path, fill }))

    /* Sparkles: spaced out along the band, never inside a lane, all visible before scrolling */
    const sparkles: Sparkle[] = []
    const sparkleCount = w < 640 ? 4 : 7
    const minGap = Math.hypot(w, h) * 0.12
    for (let tries = 0; tries < 300 && sparkles.length < sparkleCount; tries += 1) {
      const t = 0.12 + rand() * 0.84
      const p = band(t)
      const offset = gauss() * p.width * 0.55
      const x = p.x + p.nx * offset
      const y = p.y + p.ny * offset
      if (Math.abs(offset - laneOffset(t, p.width)) < p.width * 0.12) continue
      if (x < 24 || x > w - 24 || y < 24 || y > h - 24) continue
      if (sparkles.some((s) => Math.hypot(s.x - x, s.y - y) < minGap)) continue
      const tintRoll = rand()
      sparkles.push({
        x,
        y,
        size: 8 + rand() * 8,
        tint: tintRoll > 0.7 ? 2 : tintRoll > 0.35 ? 1 : 0,
        speed: 0.0007 + rand() * 0.0011,
        phase: rand() * Math.PI * 2
      })
    }

    let length = 0
    for (let i = 1, prev = band(0); i <= 64; i += 1) {
      const next = band(i / 64)
      length += Math.hypot(next.x - prev.x, next.y - prev.y)
      prev = next
    }

    return { width: w, height: h, band, length, glow, stars: bandStars, sparkles }
  }

  /** Seeds the stream once; after that it only moves, even across rebuilds. */
  const createFlow = () => {
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 2
    /* Mostly with its own side of the spine, a few against it */
    const direction = (u: number) => (u >= 0 ? 1 : -1) * (Math.random() < 0.85 ? 1 : -1)

    const drifterCount = Math.max(110, Math.min(280, Math.floor((viewportWidth * viewportHeight) / 5500)))
    for (let i = 0; i < drifterCount; i += 1) {
      const u = gauss() * 0.4
      const tintRoll = Math.random()
      drifters.push({
        t: Math.random(),
        u,
        speed: direction(u) * (DRIFT_SPEED.min + Math.random() * DRIFT_SPEED.spread),
        r: 0.4 + Math.random() ** 2 * 0.9,
        alpha: 0.35 + Math.random() * 0.5,
        tint: tintRoll > 0.8 ? 2 : tintRoll > 0.55 ? 1 : 0,
        twinkleSpeed: 0.001 + Math.random() * 0.002,
        twinklePhase: Math.random() * Math.PI * 2
      })
    }
    /* Grouped by tint so a frame sets each colour once */
    drifters.sort((a, b) => a.tint - b.tint)

    const cloudColors = [GLOW_VIOLET, GLOW_VIOLET, GLOW_BLUE, GLOW_WARM, '235,235,255']
    const cloudCount = viewportWidth < 640 ? 10 : 18
    for (let i = 0; i < cloudCount; i += 1) {
      const u = gauss() * 0.3
      clouds.push({
        t: Math.random(),
        u,
        speed: direction(u) * (CLOUD_SPEED.min + Math.random() * CLOUD_SPEED.spread),
        size: 0.25 + Math.random() * 0.25,
        alpha: 0.14 + Math.random() * 0.1,
        rgb: cloudColors[Math.floor(Math.random() * cloudColors.length)]
      })
    }
  }

  const advanceFlow = (now: number) => {
    /* Capped so a long pause (hidden tab) resumes smoothly instead of jumping */
    const elapsed = lastFlowTime ? Math.min(50, now - lastFlowTime) : 0
    lastFlowTime = now
    if (!galaxy || elapsed === 0) return
    const step = elapsed / 1000 / galaxy.length
    drifters.forEach((d) => {
      d.t = wrap(d.t + d.speed * step, 1)
    })
    clouds.forEach((c) => {
      c.t = wrap(c.t + c.speed * step, 1)
    })
  }

  /** Call inside galaxy space, right after the glow layer. */
  const drawFlow = (built: Galaxy, now: number, animate: boolean) => {
    /*
     * Light patches brighten the glow already there ('source-atop'), so they
     * never fill in the dust lanes or light up empty sky.
     */
    ctx.globalCompositeOperation = 'source-atop'
    clouds.forEach((cloud) => {
      const p = built.band(cloud.t)
      const radius = cloud.size * p.width
      ctx.save()
      ctx.translate(p.x + p.nx * cloud.u * p.width, p.y + p.ny * cloud.u * p.width)
      ctx.rotate(p.angle)
      ctx.scale(1.8, 1)
      ctx.globalAlpha = cloud.alpha * endFade(cloud.t)
      ctx.drawImage(glowSprite(cloud.rgb), -radius, -radius, radius * 2, radius * 2)
      ctx.restore()
    })
    ctx.globalCompositeOperation = 'source-over'

    let tint = -1
    drifters.forEach((d) => {
      if (d.tint !== tint) {
        tint = d.tint
        ctx.fillStyle = `rgb(${DARK_TINTS[tint]})`
      }
      const p = built.band(d.t)
      const offset = d.u * p.width
      /* Stars passing through the rift dim behind the dust */
      const veil = Math.min(1, 0.2 + (Math.abs(offset - laneOffset(d.t, p.width)) / p.width) * 8)
      const twinkle = animate ? 0.7 + 0.3 * Math.sin(now * d.twinkleSpeed + d.twinklePhase) : 1
      ctx.globalAlpha = d.alpha * veil * twinkle * endFade(d.t)
      ctx.beginPath()
      ctx.arc(p.x + p.nx * offset, p.y + p.ny * offset, d.r, 0, Math.PI * 2)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  /** Enter the band's coordinates: scrolled by its own tiny parallax, stretched if the viewport changed since it was built. */
  const enterGalaxySpace = (built: Galaxy) => {
    const shift = galaxyShift(window.scrollY, viewportHeight)
    ctx.save()
    ctx.translate(0, shift)
    ctx.scale(viewportWidth / built.width, viewportHeight / built.height)
  }

  const drawGalaxy = (now: number, animate: boolean) => {
    if (!galaxy) galaxy = buildGalaxy()
    if (!galaxy) return
    if (drifters.length === 0) createFlow()
    enterGalaxySpace(galaxy)
    ctx.globalAlpha = GALAXY_ALPHA
    ctx.drawImage(galaxy.glow, 0, 0, galaxy.width, galaxy.height * (1 + GALAXY_OVERSCAN))
    ctx.globalAlpha = 1
    drawFlow(galaxy, now, animate)
    galaxy.stars.forEach(({ path, fill }) => {
      ctx.fillStyle = fill
      ctx.fill(path)
    })
    ctx.restore()
  }

  const drawSparkles = (now: number, animate: boolean) => {
    if (!galaxy) return
    if (sparkleSprites.length === 0) sparkleSprites = DARK_TINTS.map(makeSparkleSprite)
    enterGalaxySpace(galaxy)
    ctx.globalCompositeOperation = 'lighter'
    galaxy.sparkles.forEach((sparkle) => {
      /* Squared wave: mostly a calm glint, briefly flaring at the crest */
      const wave = animate ? 0.5 + 0.5 * Math.sin(now * sparkle.speed + sparkle.phase) : 0.6
      const shine = 0.35 + 0.65 * wave * wave
      const half = sparkle.size * (0.7 + 0.5 * shine)
      ctx.globalAlpha = shine
      ctx.drawImage(sparkleSprites[sparkle.tint], sparkle.x - half, sparkle.y - half, half * 2, half * 2)
    })
    ctx.restore()
  }

  const spawnShootingStar = () => {
    const fromLeft = Math.random() < 0.5
    const speed = Math.random() * 6 + 11

    shootingStars.push({
      x: fromLeft ? -120 : viewportWidth + 120,
      y: Math.random() * (viewportHeight * 0.45),
      vx: fromLeft ? speed : -speed,
      vy: speed * (Math.random() * 0.18 + 0.06),
      length: Math.random() * 180 + 120,
      life: 1,
      decay: Math.random() * 0.002 + 0.002
    })
  }

  const wrap = (value: number, size: number) => ((value % size) + size) % size

  const drawStars = (now: number, animate: boolean) => {
    const isDark = document.body.classList.contains('dark-mode')
    const tints = isDark ? DARK_TINTS : LIGHT_TINTS
    const scrollY = window.scrollY

    stars.forEach((star) => {
      const twinkle = animate ? 0.7 + 0.3 * Math.sin(now * star.twinkleSpeed + star.twinklePhase) : 1
      const alpha = Math.min(1, star.alpha * twinkle * (isDark ? 1.05 : 0.8))
      const y = wrap(star.y - scrollY * star.z * PARALLAX, viewportHeight)

      ctx.fillStyle = `rgba(${tints[star.tint]},${alpha})`
      ctx.beginPath()
      ctx.arc(star.x, y, star.r, 0, Math.PI * 2)
      ctx.fill()

      /* Soft halo on the nearest, brightest stars only */
      if (isDark && star.z > 0.82) {
        ctx.fillStyle = `rgba(${tints[star.tint]},${alpha * 0.12})`
        ctx.beginPath()
        ctx.arc(star.x, y, star.r * 3.2, 0, Math.PI * 2)
        ctx.fill()
      }

      if (animate) {
        star.x = wrap(star.x + star.vx, viewportWidth)
        star.y = wrap(star.y + star.vy, viewportHeight)
      }
    })
  }

  const drawShootingStars = (now: number) => {
    const isDark = document.body.classList.contains('dark-mode')

    if (shootingStars.length === 0 && now - lastShootingStarTime > 2600 && Math.random() > 0.45) {
      spawnShootingStar()
      lastShootingStarTime = now
    }

    for (let index = shootingStars.length - 1; index >= 0; index -= 1) {
      const star = shootingStars[index]
      const tailX = star.x - star.vx * (star.length / 10)
      const tailY = star.y - star.vy * (star.length / 10)
      const gradient = ctx.createLinearGradient(star.x, star.y, tailX, tailY)
      if (isDark) {
        gradient.addColorStop(0, 'rgba(255,255,255,1)')
        gradient.addColorStop(0.35, 'rgba(186,230,253,0.8)')
        gradient.addColorStop(1, 'rgba(165,148,255,0)')
      } else {
        gradient.addColorStop(0, 'rgba(20,24,60,0.9)')
        gradient.addColorStop(0.4, 'rgba(91,69,214,0.45)')
        gradient.addColorStop(1, 'rgba(91,69,214,0)')
      }
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2.2
      ctx.beginPath()
      ctx.moveTo(star.x, star.y)
      ctx.lineTo(tailX, tailY)
      ctx.stroke()

      star.x += star.vx
      star.y += star.vy
      star.life -= star.decay

      if (star.life <= 0 || star.x < -200 || star.x > viewportWidth + 200 || star.y > viewportHeight + 200) {
        shootingStars.splice(index, 1)
      }
    }
  }

  const draw = (now: number) => {
    ctx.clearRect(0, 0, viewportWidth, viewportHeight)
    advanceFlow(now)
    drawGalaxy(now, true)
    drawStars(now, true)
    drawSparkles(now, true)
    drawShootingStars(now)
    animationId = requestAnimationFrame(draw)
  }

  /* Reduced motion: a still sky, redrawn only when something actually changes */
  const drawStill = () => {
    cancelAnimationFrame(animationId)
    animationId = requestAnimationFrame(() => {
      ctx.clearRect(0, 0, viewportWidth, viewportHeight)
      drawGalaxy(0, false)
      drawStars(0, false)
      drawSparkles(0, false)
    })
  }

  const isSpace = () => document.body.classList.contains('dark-mode')
  let running = false

  /* Ground Control (light) hides the canvas, so only animate while in space */
  const syncToTheme = () => {
    if (reducedMotion) {
      if (isSpace()) drawStill()
      return
    }
    if (isSpace() && !running) {
      running = true
      animationId = requestAnimationFrame(draw)
    } else if (!isSpace() && running) {
      running = false
      cancelAnimationFrame(animationId)
    }
  }

  const onScrollStill = () => {
    if (isSpace()) drawStill()
  }

  resizeCanvas()
  createStars()
  syncToTheme()

  const themeObserver = new MutationObserver(syncToTheme)
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  if (reducedMotion) window.addEventListener('scroll', onScrollStill, { passive: true })

  const handleResize = () => {
    const prevW = viewportWidth
    const prevH = viewportHeight
    resizeCanvas()
    remapToViewport(prevW, prevH)
    if (reducedMotion) onScrollStill()
    /* The band stretches meanwhile; relay it out once the resize settles (same seed, same sky) */
    window.clearTimeout(rebuildTimer)
    rebuildTimer = window.setTimeout(() => {
      if (!galaxy) return
      galaxy = buildGalaxy()
      if (reducedMotion) onScrollStill()
    }, 200)
  }

  window.addEventListener('resize', handleResize)
  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    window.clearTimeout(rebuildTimer)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', onScrollStill)
    themeObserver.disconnect()
  })
})
</script>
