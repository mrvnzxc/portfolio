<template>
  <div
    ref="rootRef"
    class="warp-loader fixed inset-0 z-[9999] flex flex-col items-center justify-end overflow-hidden"
    :class="{ 'warp-loader--exiting': exiting, 'pointer-events-none': revealDone }"
    :style="rootStyle"
    aria-busy="true"
    aria-label="Loading"
  >
    <!-- Deep space backdrop -->
    <div
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0a1628] to-black"
      aria-hidden="true"
    />
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_45%,rgba(30,58,138,0.22)_0%,transparent_55%)]"
      aria-hidden="true"
    />

    <!-- Starfield + streaks -->
    <div
      class="pointer-events-none absolute inset-0"
      :style="shakeStyle"
      aria-hidden="true"
    >
      <canvas ref="canvasRef" class="absolute inset-0 h-full w-full" />
    </div>

    <!-- Vignette -->
    <div
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_0%,rgba(0,0,0,0.55)_100%)]"
      aria-hidden="true"
    />

    <!-- White flash (arrival) -->
    <div
      class="pointer-events-none absolute inset-0 bg-white transition-opacity duration-150"
      :style="{ opacity: flashOpacity }"
      aria-hidden="true"
    />

    <p
      class="pointer-events-none absolute bottom-[min(28%,200px)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap text-center font-medium tracking-[0.2em] text-sky-200/90 drop-shadow-[0_0_12px_rgba(56,189,248,0.45)] sm:tracking-[0.28em]"
    >
      Entering Hyperspace...
    </p>

    <!-- Spaceship + thruster (winged silhouette — reads as craft, not a single arrow) -->
    <div
      class="pointer-events-none relative z-10 mb-[min(8vh,4rem)] flex flex-col items-center"
      :style="shipLiftStyle"
    >
      <svg
        class="warp-ship-svg relative z-[1] h-[4.25rem] w-[5.5rem] drop-shadow-[0_0_22px_rgba(148,163,184,0.4)] sm:h-[4.75rem] sm:w-24"
        viewBox="0 0 100 108"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="warp-ship-plate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f1f5f9" />
            <stop offset="45%" stop-color="#94a3b8" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
          <linearGradient id="warp-ship-shade" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#64748b" />
            <stop offset="100%" stop-color="#334155" />
          </linearGradient>
          <linearGradient id="warp-cockpit" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.55" />
            <stop offset="100%" stop-color="#0369a1" stop-opacity="0.85" />
          </linearGradient>
        </defs>
        <!-- Rear / engine bulkhead -->
        <path
          fill="url(#warp-ship-shade)"
          d="M 50 96 L 62 90 L 68 78 L 62 68 L 50 72 L 38 68 L 32 78 L 38 90 Z"
        />
        <!-- Port & starboard nacelles -->
        <path
          fill="#334155"
          d="M 24 88 L 18 82 L 22 70 L 32 66 L 36 76 Z M 76 88 L 82 82 L 78 70 L 68 66 L 64 76 Z"
        />
        <!-- Main hull + swept wings -->
        <path
          fill="url(#warp-ship-plate)"
          stroke="rgba(148,163,184,0.55)"
          stroke-width="0.6"
          vector-effect="non-scaling-stroke"
          stroke-linejoin="round"
          d="M 50 4
             L 57 22 L 74 28 L 95 42 L 90 56 L 70 54 L 65 64 L 68 76 L 62 86
             L 50 92 L 38 86 L 32 76 L 35 64 L 30 54 L 10 56 L 5 42 L 26 28 L 43 22 Z"
        />
        <!-- Wing root panels -->
        <path
          fill="#475569"
          fill-opacity="0.92"
          d="M 50 38 L 66 48 L 62 58 L 50 52 L 38 58 L 34 48 Z"
        />
        <!-- Forward fuselage strake -->
        <path fill="#64748b" fill-opacity="0.95" d="M 50 8 L 56 24 L 50 34 L 44 24 Z" />
        <!-- Cockpit canopy -->
        <ellipse cx="50" cy="30" rx="7" ry="10" fill="url(#warp-cockpit)" />
        <ellipse cx="50" cy="28" rx="4" ry="5" fill="rgba(255,255,255,0.22)" />
        <!-- Hull accent lines -->
        <path
          stroke="rgba(226,232,240,0.35)"
          stroke-width="0.5"
          vector-effect="non-scaling-stroke"
          stroke-linecap="round"
          d="M 50 36 L 50 70 M 38 52 L 28 48 M 62 52 L 72 48"
        />
      </svg>
      <div class="thruster-wrap relative -mt-0.5 flex flex-col items-center">
        <div class="thruster-core" :style="thrusterStyle" />
        <div class="thruster-glow" :style="thrusterGlowStyle" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{ complete: [] }>()

/** Minimum time before warp collapse + reveal (ms). */
const MIN_WARP_MS = 3000
/** Post-warp: flash + fade out (ms). */
const ARRIVAL_MS = 900

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const exiting = ref(false)
const revealDone = ref(false)
const overlayOpacity = ref(1)
const flashOpacity = ref(0)

const shakeX = ref(0)
const shakeY = ref(0)

const thrusterFlicker = ref(1)
const thrusterIntensity = ref(0.35)

let rafId = 0
let startPerf = 0
let lastPerf = 0
let flickerAcc = 0

const rootStyle = computed(() => ({
  opacity: overlayOpacity.value,
  transition: exiting.value ? 'opacity 0.75s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
}))

const shakeStyle = computed(() => {
  const blur =
    phaseRef.value >= 3 && phaseRef.value < 4 ? Math.min(2.2, 0.8 + warpAmount.value * 1.4) : 0
  return {
    transform: `translate(${shakeX.value}px, ${shakeY.value}px)`,
    filter: blur > 0.05 ? `blur(${blur}px)` : 'none'
  }
})

const shipLiftStyle = computed(() => {
  const lift = phaseRef.value >= 3 && phaseRef.value < 4 ? -8 - warpAmount.value * 28 : 0
  const scale = phaseRef.value >= 3 && phaseRef.value < 4 ? 1 + warpAmount.value * 0.08 : 1
  return {
    transform: `translateY(${lift}px) scale(${scale})`,
    transition: phaseRef.value === 4 ? 'transform 0.45s ease-out' : 'transform 0.2s ease-out'
  }
})

const thrusterStyle = computed(() => ({
  transform: `scaleY(${thrusterFlicker.value}) scaleX(${0.85 + thrusterIntensity.value * 0.25})`,
  opacity: 0.75 + thrusterIntensity.value * 0.25,
  boxShadow: `0 0 ${12 + thrusterIntensity.value * 28}px ${4 + thrusterIntensity.value * 10}px rgba(56, 189, 248, ${0.45 + thrusterIntensity.value * 0.45})`
}))

const thrusterGlowStyle = computed(() => ({
  opacity: 0.35 + thrusterIntensity.value * 0.5,
  transform: `scale(${0.9 + thrusterIntensity.value * 0.5}, ${1.1 + thrusterFlicker.value * 0.9 + thrusterIntensity.value * 0.6})`
}))

type Star = {
  layer: number
  ang: number
  rad: number
  z: number
  prevPx: number
  prevPy: number
  seed: number
}

const stars: Star[] = []
const layerSpeed = [0.55, 1, 1.65]

let ctx: CanvasRenderingContext2D | null = null
let vw = 0
let vh = 0
let dpr = 1

const phaseRef = ref(1)
const warpAmount = ref(0)

function resize() {
  const c = canvasRef.value
  if (!c || !ctx) return
  vw = window.innerWidth
  vh = window.innerHeight
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  c.width = Math.floor(vw * dpr)
  c.height = Math.floor(vh * dpr)
  c.style.width = `${vw}px`
  c.style.height = `${vh}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
}

function initStars(count: number) {
  stars.length = 0
  for (let i = 0; i < count; i += 1) {
    stars.push({
      layer: i % 3,
      ang: Math.random() * Math.PI * 2,
      rad: 0.04 + Math.random() * 0.42,
      z: 0.08 + Math.random() * 1.15,
      prevPx: 0,
      prevPy: 0,
      seed: Math.random() * Math.PI * 2
    })
  }
}

function project(st: Star, cx: number, cy: number, k: number) {
  const inv = 1 / Math.max(st.z, 0.02)
  const px = cx + Math.cos(st.ang) * st.rad * k * inv
  const py = cy + Math.sin(st.ang) * st.rad * k * inv
  return { px, py, inv }
}

function clamp01(t: number) {
  return Math.min(1, Math.max(0, t))
}

function getPhase(elapsed: number) {
  if (elapsed < 1000) return 1
  if (elapsed < 2000) return 2
  if (elapsed < MIN_WARP_MS) return 3
  return 4
}

function phaseParams(elapsed: number) {
  const p = getPhase(elapsed)
  let drift = 0.12
  let speedBase = 0.045
  let warp = 0
  let thruster = 0.35

  if (p === 1) {
    const u = elapsed / 1000
    drift = 0.1 + u * 0.04
    speedBase = 0.038 + u * 0.02
    thruster = 0.32 + u * 0.12
  } else if (p === 2) {
    const u = (elapsed - 1000) / 1000
    drift = 0.12 + u * 0.06
    speedBase = 0.055 + u * 0.22
    warp = u * 0.35
    thruster = 0.45 + u * 0.38
  } else if (p === 3) {
    const u = (elapsed - 2000) / 1000
    drift = 0.15
    speedBase = 0.28 + u * 1.85
    warp = 0.35 + u * 0.65
    thruster = 0.85 + u * 0.14
  } else {
    const u = clamp01((elapsed - MIN_WARP_MS) / 500)
    drift = 0.08 * (1 - u)
    speedBase = 0.15 * (1 - u)
    warp = (1 - u) * 0.2
    thruster = 0.55 * (1 - u) + 0.2
  }

  return { p, drift, speedBase, warp, thruster }
}

function drawFrame(elapsed: number, dt: number) {
  if (!ctx || !canvasRef.value) return
  const { p, drift, speedBase, warp, thruster } = phaseParams(elapsed)
  phaseRef.value = p
  warpAmount.value = warp
  thrusterIntensity.value = thruster

  const cx = vw * 0.5
  const cy = vh * 0.42
  const k = Math.min(vw, vh) * 0.52

  ctx.clearRect(0, 0, vw, vh)

  const driftPhase = elapsed * 0.00035

  for (let s = 0; s < stars.length; s += 1) {
    const st = stars[s]
    const layerMul = layerSpeed[st.layer]

    const wobble = Math.sin(st.seed + driftPhase) * 0.012 + Math.cos(st.seed * 1.7 + driftPhase * 0.8) * 0.0045
    st.ang += wobble * drift
    st.rad += Math.sin(st.seed * 2.1 + driftPhase) * 0.00025 * drift

    const advance = speedBase * layerMul * (1 + warp * 4.2) * (dt / 16.67)
    st.z -= advance * 0.018

    if (st.z < 0.035) {
      st.z = 0.65 + Math.random() * 0.9
      st.ang = Math.random() * Math.PI * 2
      st.rad = 0.04 + Math.random() * 0.42
      st.prevPx = cx
      st.prevPy = cy
    }

    const { px, py, inv } = project(st, cx, cy, k)
    const size = Math.min(2.4, 0.22 + inv * 0.09)

    if (p >= 3 && warp > 0.25) {
      const streak = Math.min(140, 18 + warp * 220 * layerMul)
      const dx = px - st.prevPx
      const dy = py - st.prevPy
      const len = Math.hypot(dx, dy) || 1
      const ux = (dx / len) * streak
      const uy = (dy / len) * streak
      const x1 = px - ux
      const y1 = py - uy

      const headA = 0.42 + warp * 0.48
      const tailA = 0.06 + warp * 0.14
      ctx.strokeStyle = `rgba(255,255,255,${tailA})`
      ctx.lineWidth = 2.2 + warp * 2.4 * layerMul
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(px, py)
      ctx.stroke()

      ctx.strokeStyle = `rgba(255,255,255,${headA * 0.55})`
      ctx.lineWidth = 1 + warp * 1.2 * layerMul
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(px, py)
      ctx.stroke()

      ctx.fillStyle = `rgba(255,255,255,${0.5 + warp * 0.35})`
      ctx.beginPath()
      ctx.arc(px, py, size * 0.55, 0, Math.PI * 2)
      ctx.fill()
    } else {
      const tw = 0.55 + warp * 0.5
      ctx.fillStyle = `rgba(255,255,255,${0.25 + inv * 0.06 * tw})`
      ctx.beginPath()
      ctx.arc(px, py, size, 0, Math.PI * 2)
      ctx.fill()
    }

    st.prevPx = px
    st.prevPy = py
  }

  if (p === 3 && warp > 0.5) {
    const t = elapsed * 0.09
    shakeX.value = (Math.sin(t * 1.7) + Math.sin(t * 2.3)) * 2.8 * warp
    shakeY.value = (Math.cos(t * 1.5) + Math.sin(t * 2.9)) * 2.2 * warp
  } else if (p === 4) {
    shakeX.value *= 0.85
    shakeY.value *= 0.85
  } else {
    shakeX.value = 0
    shakeY.value = 0
  }
}

function loop(now: number) {
  if (finished) return
  if (!startPerf) startPerf = now
  const elapsed = now - startPerf
  const dt = Math.min(48, Math.max(0, now - lastPerf))
  lastPerf = now

  flickerAcc += dt
  if (flickerAcc > 52) {
    flickerAcc = 0
    thrusterFlicker.value = 0.82 + Math.random() * 0.26
  }

  drawFrame(elapsed, dt)

  if (elapsed >= MIN_WARP_MS) {
    if (!exiting.value) exiting.value = true
    const t = elapsed - MIN_WARP_MS
    if (t <= 130) {
      flashOpacity.value = (t / 130) * 0.88
    } else if (t <= 400) {
      flashOpacity.value = 0.88 * (1 - (t - 130) / 270)
    } else {
      flashOpacity.value = 0
    }

    if (t >= 300) {
      overlayOpacity.value = Math.max(0, 1 - (t - 300) / (ARRIVAL_MS - 300))
    }

    if (t >= ARRIVAL_MS) {
      finishLoader()
      return
    }
  }

  rafId = requestAnimationFrame(loop)
}

let finished = false
function finishLoader() {
  if (finished) return
  finished = true
  revealDone.value = true
  cancelAnimationFrame(rafId)
  flashOpacity.value = 0
  overlayOpacity.value = 0
  document.body.style.overflow = ''
  emit('complete')
}

let onResizeCleanup: (() => void) | null = null

onMounted(() => {
  document.body.style.overflow = 'hidden'
  const c = canvasRef.value
  if (!c) {
    document.body.style.overflow = ''
    revealDone.value = true
    emit('complete')
    return
  }
  ctx = c.getContext('2d', { alpha: true })
  if (!ctx) {
    document.body.style.overflow = ''
    revealDone.value = true
    emit('complete')
    return
  }

  resize()
  const area = vw * vh
  const count = Math.min(680, Math.max(300, Math.floor(area / 2400)))
  initStars(count)

  const onResize = () => resize()
  window.addEventListener('resize', onResize)
  onResizeCleanup = () => {
    window.removeEventListener('resize', onResize)
  }

  lastPerf = performance.now()
  startPerf = 0
  rafId = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  onResizeCleanup?.()
  cancelAnimationFrame(rafId)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.warp-loader {
  -webkit-font-smoothing: antialiased;
}

.thruster-wrap {
  width: 28px;
  height: 48px;
}

.thruster-core {
  width: 10px;
  height: 28px;
  border-radius: 40% 40% 60% 60%;
  background: linear-gradient(
    180deg,
    rgba(125, 211, 252, 0.95) 0%,
    rgba(56, 189, 248, 0.85) 35%,
    rgba(14, 165, 233, 0.5) 70%,
    transparent 100%
  );
  transform-origin: top center;
  transition: box-shadow 0.15s ease, opacity 0.15s ease;
}

.thruster-glow {
  position: absolute;
  top: 4px;
  left: 50%;
  width: 36px;
  height: 44px;
  margin-left: -18px;
  border-radius: 50%;
  background: radial-gradient(
    ellipse 70% 85% at 50% 0%,
    rgba(56, 189, 248, 0.55) 0%,
    rgba(14, 165, 233, 0.2) 45%,
    transparent 72%
  );
  filter: blur(4px);
  transform-origin: top center;
  pointer-events: none;
}
</style>
