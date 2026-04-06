<template>
  <section id="gallery" class="relative section-band-b-first border-t border-slate-200/70 dark:border-slate-800">
    <div class="mx-auto max-w-6xl px-4">
      <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 reveal-on-scroll">
        <h2 class="mb-1 text-3xl font-semibold tracking-tight sm:text-4xl">Floating gallery</h2>
        <span class="self-end text-right text-xs sm:self-auto sm:text-left sm:text-sm font-semibold uppercase tracking-wide text-primary-600">Moments</span>
      </div>

    <div class="reveal-on-scroll relative">
      <button
        type="button"
        class="absolute left-1 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-300/80 bg-white/90 p-2.5 text-slate-700 shadow-md shadow-slate-900/10 backdrop-blur-sm transition hover:border-primary-400/50 hover:bg-white hover:text-primary-700 sm:left-2 sm:flex md:p-3 dark:border-white/15 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:border-cyan-400/40 dark:hover:bg-slate-800"
        aria-label="Scroll gallery left"
        @click="scrollGalleryStrip(-1)"
      >
        <Icon icon="ph:caret-left" class="h-6 w-6 md:h-7 md:w-7" />
      </button>
      <button
        type="button"
        class="absolute right-1 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full border border-slate-300/80 bg-white/90 p-2.5 text-slate-700 shadow-md shadow-slate-900/10 backdrop-blur-sm transition hover:border-primary-400/50 hover:bg-white hover:text-primary-700 sm:right-2 sm:flex md:p-3 dark:border-white/15 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:border-cyan-400/40 dark:hover:bg-slate-800"
        aria-label="Scroll gallery right"
        @click="scrollGalleryStrip(1)"
      >
        <Icon icon="ph:caret-right" class="h-6 w-6 md:h-7 md:w-7" />
      </button>
      <div
        ref="scrollerRef"
        class="gallery-x-scroll w-full cursor-grab touch-pan-x overflow-x-auto scroll-smooth pb-6 pt-2 selection:bg-transparent active:cursor-grabbing md:select-none"
        :class="{ 'select-none': pointerDragging }"
        @scroll.passive="onScrollerScroll"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @pointerleave="onPointerLeave"
      >
        <div class="mx-auto flex w-max gap-6 md:gap-8">
        <div
          v-for="(item, idx) in displayItems"
          :key="item.key"
          class="gallery-float-outer shrink-0"
          :style="{ animationDelay: `${(idx % baseImages.length) * 0.12}s` }"
        >
          <button
            type="button"
            :ref="(el) => setCardRef(el, idx)"
            class="gallery-glass-card group relative flex min-w-[250px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 text-left shadow-sm shadow-slate-950/5 outline-none backdrop-blur-md transition-[transform,opacity,filter,box-shadow] duration-300 ease-out focus-visible:ring-2 focus-visible:ring-cyan-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:border-white/10 dark:bg-white/5 dark:shadow-lg dark:shadow-black/25 dark:backdrop-blur-lg dark:focus-visible:ring-offset-slate-950 md:min-w-[260px] md:p-2.5 lg:min-w-[280px] dark:shadow-cyan-950/20"
            :class="cardStateClass(idx)"
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
                class="gallery-strip-img pointer-events-none max-h-full max-w-full object-contain object-center transition-[filter] duration-300 select-none"
                :class="
                  idx === centeredSlotIndex
                    ? 'brightness-[1.03] contrast-[1.02] dark:brightness-110'
                    : 'brightness-100 contrast-[1.03] dark:brightness-90 dark:contrast-100'
                "
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
  watch,
  type ComponentPublicInstance
} from 'vue'

const baseImages = [
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

const scrollerRef = ref<HTMLElement | null>(null)
const cardRefs = ref<(HTMLElement | null)[]>([])

const setCardRef = (
  el: Element | ComponentPublicInstance | null,
  idx: number
) => {
  const node =
    el instanceof HTMLElement
      ? el
      : el && '$el' in el && el.$el instanceof HTMLElement
        ? el.$el
        : null
  cardRefs.value[idx] = node
}

const segmentWidth = ref(0)
const centeredSlotIndex = ref(-1)

const pointerDragging = ref(false)
const dragMoved = ref(false)
const suppressClick = ref(false)
let dragStartX = 0
let dragStartScroll = 0
let activePointerId: number | null = null

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

let ro: ResizeObserver | null = null
let rafScroll = 0

const cardStateClass = (idx: number) => {
  const isCenter = idx === centeredSlotIndex.value
  return [
    isCenter
      ? 'scale-105 opacity-100 z-[1]'
      : 'scale-100 z-0 opacity-100 dark:opacity-[0.72]',
    'group-hover:scale-[1.06] group-hover:opacity-100 group-hover:shadow-md group-hover:shadow-primary-500/15 dark:group-hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]'
  ]
}

const measureSegment = () => {
  const el = scrollerRef.value
  if (!el || el.scrollWidth === 0) return
  segmentWidth.value = el.scrollWidth / LOOP_SEGMENTS
}

const normalizeInfiniteScroll = () => {
  const el = scrollerRef.value
  const w = segmentWidth.value
  if (!el || w <= 0) return

  const left = el.scrollLeft
  const margin = w * 0.12

  if (left < margin) {
    el.style.scrollBehavior = 'auto'
    el.scrollLeft = left + w
    requestAnimationFrame(() => {
      el.style.scrollBehavior = ''
    })
  } else if (left > w * 2 - margin) {
    el.style.scrollBehavior = 'auto'
    el.scrollLeft = left - w
    requestAnimationFrame(() => {
      el.style.scrollBehavior = ''
    })
  }
}

const updateCenteredCard = () => {
  const scroller = scrollerRef.value
  if (!scroller) return

  const rect = scroller.getBoundingClientRect()
  const mid = rect.left + rect.width / 2

  let best = -1
  let bestDist = Infinity

  cardRefs.value.forEach((el, idx) => {
    if (!el) return
    const cr = el.getBoundingClientRect()
    const c = cr.left + cr.width / 2
    const d = Math.abs(c - mid)
    if (d < bestDist) {
      bestDist = d
      best = idx
    }
  })

  centeredSlotIndex.value = best
}

const onScrollerScroll = () => {
  if (rafScroll) cancelAnimationFrame(rafScroll)
  rafScroll = requestAnimationFrame(() => {
    normalizeInfiniteScroll()
    updateCenteredCard()
    rafScroll = 0
  })
}

const onPointerDown = (e: PointerEvent) => {
  if (e.pointerType === 'touch') return
  const target = e.target as HTMLElement | null
  if (target?.closest('button')) return

  const el = scrollerRef.value
  if (!el) return

  pointerDragging.value = true
  dragMoved.value = false
  dragStartX = e.clientX
  dragStartScroll = el.scrollLeft
  activePointerId = e.pointerId
  try {
    el.setPointerCapture(e.pointerId)
  } catch {
    /* ignore */
  }
}

const onPointerMove = (e: PointerEvent) => {
  if (!pointerDragging.value || e.pointerType === 'touch') return
  const el = scrollerRef.value
  if (!el) return

  const dx = e.clientX - dragStartX
  if (Math.abs(dx) > 6) dragMoved.value = true
  el.scrollLeft = dragStartScroll - dx
}

const releasePointer = (e: PointerEvent) => {
  const el = scrollerRef.value
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
  if (e.pointerType === 'touch') return
  if (pointerDragging.value && dragMoved.value) {
    suppressClick.value = true
    queueMicrotask(() => {
      suppressClick.value = false
      dragMoved.value = false
    })
  } else {
    dragMoved.value = false
  }
  releasePointer(e)
}

const onPointerLeave = (e: PointerEvent) => {
  if (e.pointerType === 'touch') return
  if (pointerDragging.value) releasePointer(e)
}

const onCardActivate = (logicalIndex: number) => {
  if (suppressClick.value) return
  lightboxIndex.value = logicalIndex
  lightboxOpen.value = true
}

const scrollGalleryStrip = (dir: number) => {
  const el = scrollerRef.value
  if (!el) return
  const firstCard = cardRefs.value.find((c) => c != null)
  const gap = 24
  const step = firstCard ? firstCard.offsetWidth + gap : 300
  el.scrollBy({ left: dir * step, behavior: 'smooth' })
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
    const el = scrollerRef.value
    const w = segmentWidth.value
    if (el && w > 0) {
      el.style.scrollBehavior = 'auto'
      el.scrollLeft = w
      requestAnimationFrame(() => {
        el.style.scrollBehavior = ''
        updateCenteredCard()
      })
    }

    ro = new ResizeObserver(() => {
      measureSegment()
      updateCenteredCard()
    })
    if (scrollerRef.value) ro.observe(scrollerRef.value)
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  ro?.disconnect()
  ro = null
  lockBody(false)
  if (rafScroll) cancelAnimationFrame(rafScroll)
})
</script>

<style scoped>
@keyframes gallery-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.gallery-float-outer {
  animation: gallery-float 6.5s ease-in-out infinite;
  will-change: transform;
}

.gallery-glass-card {
  transform-origin: center center;
}

/* Stop the browser’s default image drag (ghost) on desktop so horizontal scroll-drag feels right */
.gallery-strip-img {
  -webkit-user-drag: none;
  user-select: none;
}
</style>
