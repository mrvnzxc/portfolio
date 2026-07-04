<template>
  <section id="gallery" class="relative section-band-b-first border-t border-slate-200/70 dark:border-slate-800">
    <div class="mx-auto max-w-6xl px-4">
      <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 reveal-on-scroll">
        <h2 class="mb-1 text-3xl font-semibold tracking-tight sm:text-4xl">Floating gallery</h2>
        <span class="self-end text-right text-xs sm:self-auto sm:text-left sm:text-sm font-semibold uppercase tracking-wide text-primary-600">Moments</span>
      </div>

    <div class="reveal-on-scroll">
      <div
        ref="viewportRef"
        class="gallery-viewport w-full cursor-grab overflow-hidden pb-6 pt-2 selection:bg-transparent active:cursor-grabbing md:select-none"
        :class="{ 'select-none': pointerDragging }"
        @mouseenter="autoScrollPaused = true"
        @mouseleave="autoScrollPaused = false"
        @touchstart.passive="autoScrollPaused = true"
        @touchend.passive="autoScrollPaused = false"
        @touchcancel.passive="autoScrollPaused = false"
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
          class="shrink-0"
        >
          <button
            type="button"
            :data-gallery-index="item.logicalIndex"
            class="gallery-glass-card group relative flex min-w-[250px] cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 text-left opacity-100 shadow-sm shadow-slate-950/5 outline-none backdrop-blur-md transition-[opacity,filter,box-shadow] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 group-hover:scale-[1.03] group-hover:opacity-100 group-hover:shadow-md group-hover:shadow-primary-500/15 dark:border-white/10 dark:bg-white/5 dark:shadow-lg dark:shadow-black/25 dark:backdrop-blur-lg dark:focus-visible:ring-offset-slate-950 dark:group-hover:shadow-[0_0_20px_rgba(0,255,255,0.3)] md:min-w-[260px] md:p-2.5 lg:min-w-[280px] dark:shadow-cyan-950/20"
            @click="onCardActivate(item.logicalIndex)"
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
          </button>
        </div>
      </div>
    </div>
    </div>
    </div>

    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 px-4 backdrop-blur-xl"
        role="dialog"
        aria-modal="true"
        aria-label="Image gallery"
        @click.self="closeLightbox"
      >
        <button
          type="button"
          class="absolute right-4 top-4 z-[62] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/15 hover:shadow-[0_0_24px_rgba(34,211,238,0.35)]"
          aria-label="Close gallery"
          @click="closeLightbox"
        >
          <Icon icon="ph:x" class="h-5 w-5" />
        </button>
        <button
          type="button"
          class="absolute left-2 top-1/2 z-[62] inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/15 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] sm:left-6 md:h-14 md:w-14"
          aria-label="Previous image"
          @click.stop="stepLightbox(-1)"
        >
          <Icon icon="ph:caret-left" class="h-7 w-7 md:h-8 md:w-8" />
        </button>
        <button
          type="button"
          class="absolute right-2 top-1/2 z-[62] inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/15 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] sm:right-6 md:h-14 md:w-14"
          aria-label="Next image"
          @click.stop="stepLightbox(1)"
        >
          <Icon icon="ph:caret-right" class="h-7 w-7 md:h-8 md:w-8" />
        </button>
        <div class="flex max-h-[min(90vh,900px)] max-w-[min(95vw,1200px)] items-center justify-center p-4">
          <img
            :src="baseImages[lightboxIndex]"
            alt="Gallery preview"
            class="max-h-[min(85vh,860px)] max-w-full object-contain object-center"
          />
        </div>
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
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
  const rows: { src: string; key: string; logicalIndex: number }[] = []
  for (let loop = 0; loop < LOOP_SEGMENTS; loop++) {
    for (let i = 0; i < baseImages.length; i++) {
      rows.push({
        src: baseImages[i],
        key: `g-${loop}-${i}`,
        logicalIndex: i
      })
    }
  }
  return rows
})

const viewportRef = ref<HTMLElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)

const segmentWidth = ref(0)

const pointerDragging = ref(false)
const dragMoved = ref(false)
const suppressClick = ref(false)
let dragStartX = 0
let dragStartOffset = 0
let activePointerId: number | null = null
let pressedLogicalIndex: number | null = null
let trackOffset = 0

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)
const autoScrollPaused = ref(false)

let ro: ResizeObserver | null = null
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

const getCardLogicalIndex = (target: EventTarget | null): number | null => {
  if (!(target instanceof Element)) return null
  const card = target.closest('[data-gallery-index]')
  if (!card) return null
  const value = card.getAttribute('data-gallery-index')
  if (value == null || value === '') return null
  const index = Number(value)
  return Number.isFinite(index) ? index : null
}

const onPointerDown = (e: PointerEvent) => {
  const el = viewportRef.value
  if (!el) return

  pressedLogicalIndex = getCardLogicalIndex(e.target)
  pointerDragging.value = true
  dragMoved.value = false
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
  if (Math.abs(dx) > 6) dragMoved.value = true
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
  const shouldOpen =
    pointerDragging.value &&
    !dragMoved.value &&
    pressedLogicalIndex !== null &&
    !suppressClick.value

  if (pointerDragging.value && dragMoved.value) {
    suppressClick.value = true
    queueMicrotask(() => {
      suppressClick.value = false
      dragMoved.value = false
    })
  } else {
    if (shouldOpen) onCardActivate(pressedLogicalIndex!)
    dragMoved.value = false
  }

  pressedLogicalIndex = null
  releasePointer(e)
}

const onPointerLeave = (e: PointerEvent) => {
  if (pointerDragging.value) releasePointer(e)
}

const onCardActivate = (logicalIndex: number) => {
  if (suppressClick.value) return
  lightboxIndex.value = logicalIndex
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
}

const stepLightbox = (delta: number) => {
  const n = baseImages.length
  lightboxIndex.value = (lightboxIndex.value + delta + n) % n
}

const onKeydown = (e: KeyboardEvent) => {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    closeLightbox()
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    stepLightbox(-1)
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    stepLightbox(1)
  }
}

function shouldAutoScroll() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  if (lightboxOpen.value || pointerDragging.value || autoScrollPaused.value) return false
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

const lockBody = (lock: boolean) => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = lock ? 'hidden' : ''
}

watch(lightboxOpen, (open) => {
  lockBody(open)
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)

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

    startAutoScroll()
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  ro?.disconnect()
  ro = null
  lockBody(false)
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
