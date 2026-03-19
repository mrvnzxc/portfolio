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
  let lastShootingStarTime = 0

  const resizeCanvas = () => {
    if (!canvas.value) return
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
  }

  const createParticles = (count = 160) => {
    particles.length = 0
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * (canvas.value?.width || window.innerWidth),
        y: Math.random() * (canvas.value?.height || window.innerHeight),
        r: Math.random() * 1.4 + 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.3
      })
    }
  }

  const spawnShootingStar = () => {
    if (!canvas.value) return
    const fromLeft = Math.random() < 0.5
    const speed = Math.random() * 6 + 10

    shootingStars.push({
      x: fromLeft ? -120 : canvas.value.width + 120,
      y: Math.random() * (canvas.value.height * 0.4),
      vx: fromLeft ? speed : -speed,
      vy: speed * (Math.random() * 0.18 + 0.06),
      length: Math.random() * 140 + 100,
      life: 1,
      decay: Math.random() * 0.002 + 0.002
    })
  }

  const draw = (now: number) => {
    if (!canvas.value) return

    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)
    const particleColor = document.body.classList.contains('dark-mode') ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,1)'
    ctx.fillStyle = particleColor

    particles.forEach((particle) => {
      ctx.globalAlpha = particle.alpha
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2)
      ctx.fill()

      particle.x += particle.vx
      particle.y += particle.vy

      if (particle.x < 0 || particle.x > canvas.value!.width || particle.y < 0 || particle.y > canvas.value!.height) {
        particle.x = Math.random() * canvas.value!.width
        particle.y = Math.random() * canvas.value!.height
      }
    })

    if (now - lastShootingStarTime > 3500 && Math.random() > 0.4) {
      spawnShootingStar()
      lastShootingStarTime = now
    }

    ctx.globalAlpha = 1
    shootingStars.forEach((star, index) => {
      const isDark = document.body.classList.contains('dark-mode')
      const gradient = ctx.createLinearGradient(star.x, star.y, star.x - star.vx * 4, star.y - star.vy * 4)
      gradient.addColorStop(0, isDark ? 'rgba(255,255,255,0.95)' : 'rgba(15,23,42,0.9)')
      gradient.addColorStop(1, 'rgba(148,163,184,0)')
      ctx.strokeStyle = gradient
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(star.x, star.y)
      ctx.lineTo(star.x - star.vx * (star.length / 10), star.y - star.vy * (star.length / 10))
      ctx.stroke()

      star.x += star.vx
      star.y += star.vy
      star.life -= star.decay

      if (star.life <= 0 || star.x < -200 || star.x > canvas.value!.width + 200 || star.y > canvas.value!.height + 200) {
        shootingStars.splice(index, 1)
      }
    })

    animationId = requestAnimationFrame(draw)
  }

  resizeCanvas()
  createParticles()
  animationId = requestAnimationFrame(draw)

  window.addEventListener('resize', resizeCanvas)
  onBeforeUnmount(() => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resizeCanvas)
  })
})
</script>
