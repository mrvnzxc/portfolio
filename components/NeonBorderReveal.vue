<template>
  <div ref="rootRef" class="relative" v-bind="$attrs" :style="rootStyle">
    <div class="relative z-[1]">
      <slot />
    </div>

    <svg
      v-if="isMounted"
      ref="svgRef"
      class="nb-svg-layer pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      :class="{ 'nb-svg-glow': props.glow }"
      :aria-hidden="true"
      role="presentation"
      :viewBox="svgViewBox"
      preserveAspectRatio="none"
    >
      <path
        ref="pathRef"
        class="nb-border-path"
        :d="pathD"
        :stroke="color"
        fill="none"
        stroke-linejoin="round"
        stroke-linecap="round"
        :stroke-width="strokeWidthPx"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'

const props = withDefaults(
  defineProps<{
    color?: string
    duration?: number
    glow?: boolean
  }>(),
  {
    color: '#22d3ee', // Tailwind cyan-400
    duration: 1.5,
    glow: true,
  },
)

const attrs = useAttrs()

const rootRef = ref<HTMLElement | null>(null)
const svgRef = ref<SVGSVGElement | null>(null)
const pathRef = ref<SVGPathElement | null>(null)

const isMounted = ref(false)
const pathD = ref('')
const svgViewBox = ref('0 0 100 100')

const strokeWidthPx = 2
const paddingPx = computed(() => strokeWidthPx / 2)

const rootStyle = computed(() => ({
  ...(typeof attrs.style === 'object' && attrs.style ? (attrs.style as Record<string, string>) : {}),
  '--nb-color': props.color,
  '--nb-duration': `${Math.max(0.05, props.duration)}s`,
  // Support user CSS that might read --nb-glow directly.
  '--nb-glow': props.color,
}))

let observer: IntersectionObserver | null = null
let resizeObserver: ResizeObserver | null = null
let resizeDebounceTimer: number | undefined
let lastSyncedW = 0
let lastSyncedH = 0

let dashLength = 0
let isInView = false
let isAnimating = false
let isComplete = false

let durationMs = 1500
let pulseTimer: number | undefined
let animationEndHandler: ((e: TransitionEvent) => void) | undefined

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const toFixed = (n: number) => (Math.abs(n) < 0.00001 ? '0' : n.toFixed(3))

function buildRoundedRectPath(opts: { w: number; h: number; r: number }) {
  const { w, h, r } = opts
  const pad = paddingPx.value

  const x0 = pad
  const y0 = pad
  const x1 = w - pad
  const y1 = h - pad

  const rr = clamp(r, 0, Math.min(x1 - x0, y1 - y0) / 2)

  if (rr <= 0.01) {
    return `M ${toFixed(x0)} ${toFixed(y0)} L ${toFixed(x1)} ${toFixed(y0)} L ${toFixed(x1)} ${toFixed(
      y1,
    )} L ${toFixed(x0)} ${toFixed(y1)} Z`
  }

  // Single continuous path that traces in clockwise order:
  // top-left -> top-right -> bottom-right -> bottom-left -> back to top-left.
  const startX = x0 + rr
  const startY = y0

  return [
    `M ${toFixed(startX)} ${toFixed(startY)}`,
    `L ${toFixed(x1 - rr)} ${toFixed(y0)}`,
    `A ${toFixed(rr)} ${toFixed(rr)} 0 0 1 ${toFixed(x1)} ${toFixed(y0 + rr)}`,
    `L ${toFixed(x1)} ${toFixed(y1 - rr)}`,
    `A ${toFixed(rr)} ${toFixed(rr)} 0 0 1 ${toFixed(x1 - rr)} ${toFixed(y1)}`,
    `L ${toFixed(x0 + rr)} ${toFixed(y1)}`,
    `A ${toFixed(rr)} ${toFixed(rr)} 0 0 1 ${toFixed(x0)} ${toFixed(y1 - rr)}`,
    `L ${toFixed(x0)} ${toFixed(y0 + rr)}`,
    `A ${toFixed(rr)} ${toFixed(rr)} 0 0 1 ${toFixed(startX)} ${toFixed(startY)}`,
  ].join(' ')
}

function syncPathGeometry(): boolean {
  const rootEl = rootRef.value
  const pathEl = pathRef.value
  const svgEl = svgRef.value
  if (!rootEl || !pathEl || !svgEl) return false

  const rect = rootEl.getBoundingClientRect()
  // If the element is not measurable yet, avoid NaNs.
  if (rect.width <= 0 || rect.height <= 0) return false

  // Skip subpixel / toolbar jitter during scroll (ResizeObserver can fire often on mobile).
  if (
    lastSyncedW > 0 &&
    Math.abs(rect.width - lastSyncedW) < 1 &&
    Math.abs(rect.height - lastSyncedH) < 1
  ) {
    return false
  }
  lastSyncedW = rect.width
  lastSyncedH = rect.height

  const style = window.getComputedStyle(rootEl)
  const borderRadiusPx = parseFloat(style.borderTopLeftRadius || '0') || 0

  durationMs = Math.round(Math.max(0.05, props.duration) * 1000)

  const w = rect.width
  const h = rect.height
  const r = borderRadiusPx

  svgViewBox.value = `0 0 ${w} ${h}`
  pathD.value = buildRoundedRectPath({ w, h, r })

  // Wait for DOM update of `d`, then compute length.
  nextTick(() => {
    const updatedPathEl = pathRef.value
    if (!updatedPathEl) return

    dashLength = updatedPathEl.getTotalLength()
    // Ensure we start hidden (pre-reveal).
    applyHiddenState()
  })

  return true
}

function applyHiddenState() {
  const pathEl = pathRef.value
  const svgEl = svgRef.value
  if (!pathEl || !svgEl) return

  isAnimating = false
  isComplete = false

  if (animationEndHandler) {
    pathEl.removeEventListener('transitionend', animationEndHandler)
    animationEndHandler = undefined
  }

  if (pulseTimer) window.clearTimeout(pulseTimer)
  pulseTimer = undefined

  // Disable transitions while resetting.
  pathEl.style.transition = 'none'
  pathEl.style.strokeDasharray = `${dashLength || 0}`
  pathEl.style.strokeDashoffset = `${dashLength || 0}`

  svgEl.classList.remove('nb-pulse-once')
}

function applyCompleteState() {
  const pathEl = pathRef.value
  const svgEl = svgRef.value
  if (!pathEl || !svgEl) return

  isAnimating = false
  isComplete = true

  pathEl.style.transition = 'none'
  pathEl.style.strokeDasharray = `${dashLength || 0}`
  pathEl.style.strokeDashoffset = '0'
}

function triggerPulseOnce() {
  if (!props.glow) return

  const svgEl = svgRef.value
  if (!svgEl) return

  // Remove then re-add to retrigger animation.
  svgEl.classList.remove('nb-pulse-once')
  // Force a layout pass so the class re-application reliably retriggers animation.
  svgEl.getBoundingClientRect()
  svgEl.classList.add('nb-pulse-once')
}

function play() {
  if (!rootRef.value || !pathRef.value) return
  if (!dashLength) return
  if (isAnimating || isComplete) return

  const pathEl = pathRef.value
  const svgEl = svgRef.value
  if (!pathEl || !svgEl) return

  isInView = true
  isAnimating = true
  isComplete = false

  if (pulseTimer) window.clearTimeout(pulseTimer)
  pulseTimer = undefined

  // Ensure the stroke is hidden before animating.
  pathEl.style.transition = 'none'
  pathEl.style.strokeDasharray = `${dashLength}`
  pathEl.style.strokeDashoffset = `${dashLength}`
  // Force reflow so the next transition starts cleanly.
  pathEl.getBoundingClientRect()

  const easing = 'cubic-bezier(0.4, 0, 0.2, 1)'
  pathEl.style.transition = `stroke-dashoffset ${durationMs}ms ${easing}`

  // Start animation on next frame.
  requestAnimationFrame(() => {
    pathEl.style.strokeDashoffset = '0'
  })

  const reducedMotion = prefersReducedMotion()
  if (reducedMotion) {
    // Jump straight to the completed state without the sweep.
    applyCompleteState()
    triggerPulseOnce()
    isAnimating = false
    return
  }

  // Mark completion. Use rAF-free approach: transition end is more robust than timers.
  if (animationEndHandler) {
    pathEl.removeEventListener('transitionend', animationEndHandler)
  }

  animationEndHandler = (e: TransitionEvent) => {
    if (e.propertyName !== 'stroke-dashoffset') return
    applyCompleteState()
    triggerPulseOnce()
  }

  pathEl.addEventListener('transitionend', animationEndHandler)

  // Safety: if transitionend doesn't fire for any reason, guarantee completion.
  pulseTimer = window.setTimeout(() => {
    applyCompleteState()
    triggerPulseOnce()
  }, durationMs + 60)
}

function reset() {
  if (!isInView) return
  isInView = false
  applyHiddenState()
}

onMounted(() => {
  isMounted.value = true
  if (process.server) return

  nextTick(() => {
    syncPathGeometry()
  })

  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    // Fallback: just show the border immediately.
    isComplete = true
    nextTick(() => applyCompleteState())
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (!entry) return

      const ratio = entry.intersectionRatio || 0
      const shouldPlay = entry.isIntersecting && ratio >= 0.4

      if (shouldPlay) play()
      else if (!entry.isIntersecting) reset()
    },
    { threshold: [0, 0.4, 1] },
  )

  if (rootRef.value) observer.observe(rootRef.value)

  // Keep the SVG path matching border-radius and size.
  if ('ResizeObserver' in window && rootRef.value) {
    const runResizeSync = () => {
      if (isAnimating) return
      if (!syncPathGeometry()) return
      if (isComplete && isInView) nextTick(() => applyCompleteState())
      else nextTick(() => applyHiddenState())
    }

    resizeObserver = new ResizeObserver(() => {
      if (isAnimating) return
      window.clearTimeout(resizeDebounceTimer)
      resizeDebounceTimer = window.setTimeout(() => {
        resizeDebounceTimer = undefined
        runResizeSync()
      }, 120)
    })
    resizeObserver.observe(rootRef.value)
  }
})

onBeforeUnmount(() => {
  window.clearTimeout(resizeDebounceTimer)
  resizeDebounceTimer = undefined
  observer?.disconnect()
  observer = null
  resizeObserver?.disconnect()
  resizeObserver = null
  if (pulseTimer) window.clearTimeout(pulseTimer)
  pulseTimer = undefined

  const pathEl = pathRef.value
  if (pathEl && animationEndHandler) pathEl.removeEventListener('transitionend', animationEndHandler)
  animationEndHandler = undefined
})
</script>

<style scoped>
.nb-svg-layer {
  transform: translateZ(0);
}

.nb-svg-glow {
  filter: drop-shadow(0 0 6px var(--nb-glow)) drop-shadow(0 0 18px var(--nb-glow));
}

@media (max-width: 768px) {
  .nb-svg-glow {
    /* One lighter shadow — fewer filter passes, much cheaper while scrolling. */
    filter: drop-shadow(0 0 5px var(--nb-glow));
  }
}

.nb-border-path {
  stroke-dasharray: 0;
  stroke-dashoffset: 0;
  /* Make sure transitions are always smooth when play() enables them. */
  transition: stroke-dashoffset var(--nb-duration, 1.5s) cubic-bezier(0.4, 0, 0.2, 1);
}

/* Minimal single pulse after the draw completes. */
.nb-pulse-once {
  animation: nbNeonPulse 750ms ease-out 1 both;
}

@keyframes nbNeonPulse {
  0% {
    filter: drop-shadow(0 0 6px var(--nb-glow)) drop-shadow(0 0 14px var(--nb-glow));
    opacity: 1;
  }
  50% {
    filter: drop-shadow(0 0 10px var(--nb-glow)) drop-shadow(0 0 22px var(--nb-glow));
    opacity: 1;
  }
  100% {
    filter: drop-shadow(0 0 7px var(--nb-glow)) drop-shadow(0 0 16px var(--nb-glow));
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .nb-pulse-once {
    /* Avoid animating filter (heavy); quick opacity tick reads as a pulse. */
    animation: nbNeonPulseMobile 500ms ease-out 1 both;
  }
}

@keyframes nbNeonPulseMobile {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.88;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nb-border-path {
    transition: none !important;
  }
  .nb-pulse-once {
    animation: none !important;
  }
}
</style>

