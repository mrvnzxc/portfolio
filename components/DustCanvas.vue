<template>
  <canvas ref="canvas" id="dust-canvas" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

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

/* White, blue-white, warm — rgb triplets for dark mode. Light mode draws ink specks. */
const DARK_TINTS = ['255,255,255', '200,220,255', '255,228,196']
const LIGHT_TINTS = ['20,24,60', '40,52,120', '70,50,110']
/** How far the nearest stars move per scrolled pixel. */
const PARALLAX = 0.14

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
    drawStars(now, true)
    drawShootingStars(now)
    animationId = requestAnimationFrame(draw)
  }

  /* Reduced motion: a still sky, redrawn only when something actually changes */
  const drawStill = () => {
    cancelAnimationFrame(animationId)
    animationId = requestAnimationFrame(() => {
      ctx.clearRect(0, 0, viewportWidth, viewportHeight)
      drawStars(0, false)
    })
  }

  resizeCanvas()
  createStars()

  let themeObserver: MutationObserver | null = null
  if (reducedMotion) {
    drawStill()
    window.addEventListener('scroll', drawStill, { passive: true })
    themeObserver = new MutationObserver(drawStill)
    themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  } else {
    animationId = requestAnimationFrame(draw)
  }

  const handleResize = () => {
    const prevW = viewportWidth
    const prevH = viewportHeight
    resizeCanvas()
    remapToViewport(prevW, prevH)
    if (reducedMotion) drawStill()
  }

  window.addEventListener('resize', handleResize)
  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('scroll', drawStill)
    themeObserver?.disconnect()
  })
})
</script>
