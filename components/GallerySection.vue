<template>
  <section id="gallery" class="relative section-band-a">
    <div class="mx-auto max-w-6xl 2xl:max-w-7xl px-4">
      <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 reveal-on-scroll">
        <h2 class="mb-1 text-3xl font-semibold tracking-tight sm:text-4xl">Floating gallery</h2>
        <span class="section-tag self-end sm:self-auto">Moments</span>
      </div>

    <div class="reveal-on-scroll">
      <div
        ref="viewportRef"
        class="gallery-viewport w-full cursor-grab overflow-hidden pb-6 pt-2 selection:bg-transparent active:cursor-grabbing md:select-none"
        :class="{ 'select-none': pointerDragging }"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerLeave"
      >
        <div ref="trackRef" class="gallery-track flex w-max gap-6 md:gap-8">
        <div
          v-for="item in displayItems"
          :key="item.key"
          class="gallery-print shrink-0"
        >
          <div
            class="gallery-glass-card group relative flex min-w-[250px] flex-col overflow-hidden rounded-2xl border border-nebula/15 bg-white/60 p-3 text-left opacity-100 shadow-sm shadow-slate-950/5 backdrop-blur-md transition-[opacity,filter,box-shadow] duration-300 ease-out group-hover:scale-[1.03] group-hover:opacity-100 group-hover:shadow-md group-hover:shadow-primary-500/15 dark:border-white/10 dark:bg-white/5 dark:shadow-lg dark:shadow-black/25 dark:backdrop-blur-lg dark:group-hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] md:min-w-[260px] md:p-2.5 lg:min-w-[280px] dark:shadow-cyan-950/20"
          >
            <div
              class="relative flex h-[260px] w-full items-center justify-center sm:h-[300px] md:h-[280px] lg:h-[300px]"
            >
              <img
                :src="item.src"
                alt=""
                draggable="false"
                loading="lazy"
                decoding="async"
                class="gallery-strip-img pointer-events-none max-h-full max-w-full object-contain object-center brightness-[1.03] contrast-[1.02] transition-[filter] duration-300 select-none dark:brightness-110"
                @dragstart.prevent
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>

  </section>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue'

const baseImages = [
  '/awards1.jpg',
  '/me1.jpg',
  '/me2.jpg',
  '/me3.jpg',
  '/me4.jpg',
  '/me5.jpg',
  '/me6.jpg'
] as const

const LOOP_SEGMENTS = 3

const displayItems = computed(() => {
  const rows: { src: string; key: string }[] = []
  for (let loop = 0; loop < LOOP_SEGMENTS; loop++) {
    for (let i = 0; i < baseImages.length; i++) {
      rows.push({
        src: baseImages[i],
        key: `g-${loop}-${i}`
      })
    }
  }
  return rows
})

const viewportRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)

const segmentWidth = ref(0)

const pointerDragging = ref(false)
let dragStartX = 0
let dragStartOffset = 0
let activePointerId: number | null = null
let trackOffset = 0

let ro: ResizeObserver | null = null
/* The strip only drifts while on screen; off screen its loop would still cost a frame every refresh */
let io: IntersectionObserver | null = null
let autoScrollRaf = 0
let lastAutoScrollTs = 0

/** Pixels per second — drift right to left */
const AUTO_SCROLL_SPEED = 80

const applyTrackTransform = () => {
  const track = trackRef.value
  if (!track) return
  track.style.transform = `translate3d(${-trackOffset}px, 0, 0)`
}

const measureSegment = () => {
  const track = trackRef.value
  if (!track || track.scrollWidth === 0) return
  segmentWidth.value = track.scrollWidth / LOOP_SEGMENTS
}

const normalizeTrackOffset = () => {
  const w = segmentWidth.value
  if (w <= 0) return

  const margin = w * 0.12
  if (trackOffset < margin) trackOffset += w
  else if (trackOffset > w * 2 - margin) trackOffset -= w
}

const onPointerDown = (e: PointerEvent) => {
  const el = viewportRef.value
  if (!el) return

  pointerDragging.value = true
  dragStartX = e.clientX
  dragStartOffset = trackOffset
  activePointerId = e.pointerId
  try {
    el.setPointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
}

const onPointerMove = (e: PointerEvent) => {
  if (!pointerDragging.value) return
  const dx = e.clientX - dragStartX
  trackOffset = dragStartOffset - dx
  normalizeTrackOffset()
  applyTrackTransform()
}

const releasePointer = (e: PointerEvent) => {
  const el = viewportRef.value
  if (activePointerId !== null && el?.hasPointerCapture(activePointerId)) {
    try {
      el.releasePointerCapture(activePointerId)
    } catch {
      /* ignore */
    }
  }
  activePointerId = null
  pointerDragging.value = false
}

const onPointerUp = (e: PointerEvent) => {
  releasePointer(e)
}

const onPointerLeave = (e: PointerEvent) => {
  if (pointerDragging.value) releasePointer(e)
}

function shouldAutoScroll() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (pointerDragging.value) return false
  return Boolean(trackRef.value && segmentWidth.value > 0)
}

function tickAutoScroll(ts: number) {
  if (!lastAutoScrollTs) lastAutoScrollTs = ts
  const elapsed = Math.min(ts - lastAutoScrollTs, 32)
  lastAutoScrollTs = ts

  if (shouldAutoScroll()) {
    trackOffset += AUTO_SCROLL_SPEED * (elapsed / 1000)
    normalizeTrackOffset()
    applyTrackTransform()
  } else {
    lastAutoScrollTs = 0
  }

  autoScrollRaf = requestAnimationFrame(tickAutoScroll)
}

function startAutoScroll() {
  if (autoScrollRaf) return
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  autoScrollRaf = requestAnimationFrame(tickAutoScroll)
}

function stopAutoScroll() {
  if (autoScrollRaf) cancelAnimationFrame(autoScrollRaf)
  autoScrollRaf = 0
  lastAutoScrollTs = 0
}

onMounted(() => {
  nextTick(() => {
    measureSegment()
    const w = segmentWidth.value
    if (w > 0) {
      trackOffset = w
      applyTrackTransform()
    }

    ro = new ResizeObserver(() => {
      measureSegment()
    })
    if (viewportRef.value) ro.observe(viewportRef.value)

    io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startAutoScroll()
      else stopAutoScroll()
    })
    if (viewportRef.value) io.observe(viewportRef.value)
  })
})

onBeforeUnmount(() => {
  ro?.disconnect()
  ro = null
  io?.disconnect()
  io = null
  stopAutoScroll()
})
</script>

<style scoped>
.gallery-viewport {
  touch-action: pan-y;
}

.gallery-track {
  will-change: transform;
  backface-visibility: hidden;
}

.gallery-glass-card {
  transform-origin: center center;
}

.gallery-strip-img {
  -webkit-user-drag: none;
  user-select: none;
}
</style>
