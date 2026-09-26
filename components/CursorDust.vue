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
/** Dust under a fingertip is drawn larger, or it vanishes on a small screen */
const TOUCH_SCALE = 1.6

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

  const spawn = (x: number, y: number, dx: number, dy: number, burst = false, scale = 1) => {
    if (motes.length >= MAX_MOTES) motes.shift()
    const angle = Math.random() * Math.PI * 2
    /* A tap's burst flies out further than dust shed along a stroke */
    const kick = burst ? 0.03 + Math.random() * 0.05 : 0.008 + Math.random() * 0.03
    motes.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      /* Scatter a little, and carry a little of the stroke's direction */
      vx: Math.cos(angle) * kick + dx * 0.0012,
      vy: Math.sin(angle) * kick + dy * 0.0012,
      size: (0.8 + Math.random() ** 2 * 1.8) * scale,
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

  /** Sheds dust along the stroke from the last point to this one */
  const trail = (x: number, y: number, scale = 1) => {
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
      spawn(x - dx * (1 - along), y - dy * (1 - along), dx, dy, false, scale)
    }
    if (count > 0) start()
  }

  /* Mouse and pen. A finger is handled by the touch events below instead. */
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') trail(event.clientX, event.clientY)
  }

  /*
   * Touch: once a drag turns into a scroll, the browser stops sending pointer events, but
   * touch events keep coming, so the trail follows the finger for the whole swipe.
   */
  const onTouchStart = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (!touch) return
    lastX = touch.clientX
    lastY = touch.clientY
    carry = 0
    /* A tap puffs a little dust where the finger lands */
    for (let i = 0; i < 8; i += 1) spawn(touch.clientX, touch.clientY, 0, 0, true, TOUCH_SCALE)
    start()
  }
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0]
    if (touch) trail(touch.clientX, touch.clientY, TOUCH_SCALE)
  }
  const onTouchEnd = () => {
    lastX = Number.NaN
    lastY = Number.NaN
  }

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  window.addEventListener('touchend', onTouchEnd, { passive: true })
  window.addEventListener('touchcancel', onTouchEnd, { passive: true })
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', resize)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('touchend', onTouchEnd)
    window.removeEventListener('touchcancel', onTouchEnd)
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
