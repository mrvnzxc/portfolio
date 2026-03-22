<template>
  <canvas ref="canvas" id="dust-canvas" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (!canvas.value) return
  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const particles: Array<{ x: number; y: number; r: number; vx: number; vy: number; alpha: number }> = []
  const shootingStars: Array<{ x: number; y: number; vx: number; vy: number; length: number; life: number; decay: number }> = []
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
  const remapParticlesToViewport = (prevW: number, prevH: number) => {
    if (prevW <= 0 || prevH <= 0) return
    const sx = viewportWidth / prevW
    const sy = viewportHeight / prevH
    particles.forEach((p) => {
      p.x *= sx
      p.y *= sy
    })
    shootingStars.forEach((s) => {
      s.x *= sx
      s.y *= sy
    })
  }

  const createParticles = () => {
    const area = viewportWidth * viewportHeight
    const count = Math.max(150, Math.min(390, Math.floor(area / 10000)))
    particles.length = 0
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * viewportWidth,
        y: Math.random() * viewportHeight,
        r: Math.random() * 1.8 + 0.7,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        /* base alpha; draw() boosts light vs dark for visibility */
        alpha: Math.random() * 0.4 + 0.45
      })
    }
  }

  const spawnShootingStar = () => {
    if (!canvas.value) return
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

  const draw = (now: number) => {
    if (!canvas.value) return

    ctx.clearRect(0, 0, viewportWidth, viewportHeight)
    const isDark = document.body.classList.contains('dark-mode')
    /* Light: near-black specks on pale bands; dark: bright white “stardust” */
    ctx.fillStyle = isDark ? 'rgba(255,255,255,0.99)' : 'rgba(15,23,42,0.98)'

    particles.forEach((particle) => {
      const boost = isDark ? 1.22 : 1.35
      ctx.globalAlpha = Math.min(1, particle.alpha * boost)
      const radius = isDark ? particle.r * 1.12 : particle.r * 1.08
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2)
      ctx.fill()

      particle.x += particle.vx
      particle.y += particle.vy

      if (particle.x < 0 || particle.x > viewportWidth || particle.y < 0 || particle.y > viewportHeight) {
        particle.x = Math.random() * viewportWidth
        particle.y = Math.random() * viewportHeight
      }
    })

    if (shootingStars.length === 0 && now - lastShootingStarTime > 2600 && Math.random() > 0.45) {
      spawnShootingStar()
      lastShootingStarTime = now
    }

    ctx.globalAlpha = 1
    shootingStars.forEach((star, index) => {
      const gradient = ctx.createLinearGradient(star.x, star.y, star.x - star.vx * 4, star.y - star.vy * 4)
      if (isDark) {
        gradient.addColorStop(0, 'rgba(255,255,255,1)')
        gradient.addColorStop(0.35, 'rgba(224,242,254,0.85)')
        gradient.addColorStop(1, 'rgba(148,163,184,0)')
      } else {
        gradient.addColorStop(0, 'rgba(15,23,42,0.98)')
        gradient.addColorStop(0.4, 'rgba(30,41,59,0.55)')
        gradient.addColorStop(1, 'rgba(148,163,184,0)')
      }
      ctx.strokeStyle = gradient
      ctx.lineWidth = isDark ? 2.65 : 2.85
      ctx.beginPath()
      ctx.moveTo(star.x, star.y)
      ctx.lineTo(star.x - star.vx * (star.length / 10), star.y - star.vy * (star.length / 10))
      ctx.stroke()

      star.x += star.vx
      star.y += star.vy
      star.life -= star.decay

      if (star.life <= 0 || star.x < -200 || star.x > viewportWidth + 200 || star.y > viewportHeight + 200) {
        shootingStars.splice(index, 1)
      }
    })

    animationId = requestAnimationFrame(draw)
  }

  resizeCanvas()
  createParticles()
  animationId = requestAnimationFrame(draw)

  const handleResize = () => {
    const prevW = viewportWidth
    const prevH = viewportHeight
    resizeCanvas()
    remapParticlesToViewport(prevW, prevH)
  }

  window.addEventListener('resize', handleResize)
  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', handleResize)
  })
})
</script>
