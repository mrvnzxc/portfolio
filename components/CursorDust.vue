<template>
  <canvas ref="canvas" class="cursor-dust" aria-hidden="true"></canvas>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const canvas = ref<HTMLCanvasElement | null>(null)

type Mote = {
  x: number
  y: number
  /** px per ms */
  vx: number
  vy: number
  size: number
  /** 1 → 0 */
  life: number
  /** life lost per ms */
  decay: number
  /** Ground Control only: a few motes are drawn as "+" point marks instead of specks */
  mark: boolean
}

/* Space glows in the scrollbar's cyan; Ground Control drops International Orange specks */
const CYAN_CORE = '224,252,255'
const CYAN = '103,232,249'
const CYAN_EDGE = '34,211,238'
const SIGNAL = 'rgb(255,90,31)'
const MAX_MOTES = 180
/** One mote per this many px of pointer travel */
const SPACING = 5
/** A bigger jump than this is the pointer re-entering the window, not a stroke */
const MAX_STROKE = 240

/** A soft cyan dot with a halo, drawn once and stamped per mote. */
const makeGlow = () => {
  const size = 32
  const mid = size / 2
  const sprite = document.createElement('canvas')
  sprite.width = size
  sprite.height = size
  const g = sprite.getContext('2d')
  if (!g) return sprite
  const gradient = g.createRadialGradient(mid, mid, 0, mid, mid, mid)
  gradient.addColorStop(0, `rgba(${CYAN_CORE},1)`)
  gradient.addColorStop(0.18, `rgba(${CYAN},0.9)`)
  gradient.addColorStop(0.45, `rgba(${CYAN_EDGE},0.22)`)
  gradient.addColorStop(1, `rgba(${CYAN_EDGE},0)`)
  g.fillStyle = gradient
  g.fillRect(0, 0, size, size)
  return sprite
}

onMounted(() => {
  const el = canvas.value
  const ctx = el?.getContext('2d')
  if (!el || !ctx) return
  /* Mouse and trackpad only: no trail under a finger, and none when motion is reduced */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const glow = makeGlow()
  const motes: Mote[] = []
  let width = 0
  let height = 0
  let lastX = Number.NaN
  let lastY = Number.NaN
  /** Travel not yet spent on a mote, so slow movement still sheds the odd one */
  let carry = 0
  let frame = 0
  let running = false
  let lastTime = 0

  const resize = () => {
    width = window.innerWidth
    height = window.innerHeight
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    el.width = Math.floor(width * dpr)
    el.height = Math.floor(height * dpr)
    el.style.width = `${width}px`
    el.style.height = `${height}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const spawn = (x: number, y: number, dx: number, dy: number) => {
    if (motes.length >= MAX_MOTES) motes.shift()
    const angle = Math.random() * Math.PI * 2
    const kick = 0.008 + Math.random() * 0.03
    motes.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      /* Scatter a little, and carry a little of the stroke's direction */
      vx: Math.cos(angle) * kick + dx * 0.0012,
      vy: Math.sin(angle) * kick + dy * 0.0012,
      size: 0.8 + Math.random() ** 2 * 1.8,
      life: 1,
      decay: 1 / (650 + Math.random() * 850),
      mark: Math.random() < 0.12
    })
  }

  const tick = (now: number) => {
    const elapsed = lastTime ? Math.min(50, now - lastTime) : 16
    lastTime = now
    const space = document.documentElement.classList.contains('dark')
    const drag = Math.pow(0.996, elapsed)

    ctx.clearRect(0, 0, width, height)
    ctx.globalCompositeOperation = space ? 'lighter' : 'source-over'
    if (!space) ctx.fillStyle = SIGNAL

    for (let i = motes.length - 1; i >= 0; i -= 1) {
      const m = motes[i]
      m.vx *= drag
      m.vy *= drag
      /* On the drawing board the graphite settles; in space the dust just floats */
      if (!space) m.vy += 0.00003 * elapsed
      m.x += m.vx * elapsed
      m.y += m.vy * elapsed
      m.life -= m.decay * elapsed
      if (m.life <= 0) {
        motes.splice(i, 1)
        continue
      }

      if (space) {
        const s = m.size * 8 * (0.55 + 0.45 * m.life)
        ctx.globalAlpha = m.life
        ctx.drawImage(glow, m.x - s / 2, m.y - s / 2, s, s)
      } else if (m.mark) {
        /* A CAD point mark, like the plotter's registration crosses */
        ctx.globalAlpha = m.life * 0.9
        ctx.fillRect(m.x - 3, m.y - 0.5, 6, 1)
        ctx.fillRect(m.x - 0.5, m.y - 3, 1, 6)
      } else {
        ctx.globalAlpha = m.life * 0.85
        ctx.fillRect(m.x - m.size / 2, m.y - m.size / 2, m.size, m.size)
      }
    }
    ctx.globalAlpha = 1

    /* Sleep once the last mote fades; the next pointer move wakes the loop */
    if (motes.length > 0) {
      frame = requestAnimationFrame(tick)
    } else {
      running = false
      lastTime = 0
    }
  }

  const start = () => {
    if (running) return
    running = true
    frame = requestAnimationFrame(tick)
  }

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    const x = event.clientX
    const y = event.clientY
    const dx = x - lastX
    const dy = y - lastY
    const distance = Math.hypot(dx, dy)
    lastX = x
    lastY = y
    if (!(distance <= MAX_STROKE)) return

    carry += distance
    const count = Math.min(8, Math.floor(carry / SPACING))
    carry = Math.min(SPACING, carry - count * SPACING)
    /* Spread along the stroke so a fast flick leaves a trail, not a clump */
    for (let i = 0; i < count; i += 1) {
      const along = (i + Math.random()) / count
      spawn(x - dx * (1 - along), y - dy * (1 - along), dx, dy)
    }
    if (count > 0) start()
  }

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onPointerMove)
  })
})
</script>

<style scoped>
/* Above page content and modals, never in the way of a click */
.cursor-dust {
  position: fixed;
  inset: 0;
  z-index: 70;
  pointer-events: none;
}
</style>
