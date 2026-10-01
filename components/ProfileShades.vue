<template>
  <!-- Mounted when Ground Control first needs it, or in idle time before that, so the images are ready -->
  <div v-if="armed" class="profile-shades" aria-hidden="true">
    <div ref="glassesEl" class="profile-shades__layer">
      <img src="/profile-shades-glasses.webp" alt="" width="287" height="102" class="profile-shades__art" :style="GLASSES_BOX">
    </div>
    <div ref="handEl" class="profile-shades__layer">
      <img src="/profile-shades-hand.webp" alt="" width="255" height="710" class="profile-shades__art" :style="HAND_BOX">
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/*
 * The sun comes out in Ground Control, so the watch hand puts sunglasses on the profile photo;
 * back in Space it takes them off again. One timeline: forward puts them on, reverse takes them off,
 * so switching mid-way just turns around.
 *
 * The glasses are baked from assets/profile-shades/glasses.svg (shadow included): painting the
 * gradient-heavy SVG live cost the first switch about a third of a second of GPU work. The hand is
 * Marvin's own, cut out of assets/profile-shades/source/1.jpg by the two scripts beside it.
 */

/* Where each picture sits on the square photo, in % of its width */
const GLASSES_BOX = { left: '30.56%', top: '23.75%', width: '39.86%' }
const HAND_BOX = { left: '64.86%', top: '25.14%', width: '35.42%' }
/** Where the fingers pinch the glasses: both layers swing around this point */
const PINCH = '68.3% 26.1%'

/** A beat after a theme switch, so the page has swapped before the hand appears */
const SWITCH_DELAY = 0.15
/** After the terminal intro, once the page has faded in */
const ARRIVAL_DELAY = 0.5
/** Most motion a single frame may show; a 30 fps screen still plays at full speed */
const MAX_STEP_MS = 34

const introContentReady = useIntroContentReady()
const armed = ref(false)
const glassesEl = ref<HTMLElement | null>(null)
const handEl = ref<HTMLElement | null>(null)

type Gsap = typeof import('gsap').gsap

onMounted(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const isLight = () => !document.documentElement.classList.contains('dark')
  let timeline: ReturnType<Gsap['timeline']> | null = null
  let gsapLib: Gsap | null = null
  let disposed = false
  let wearing = false
  let delayTimer = 0
  let settleFrame = 0
  let driveFrame = 0
  let cancelIdle = () => {}

  const build = (gsap: Gsap) => {
    const glasses = glassesEl.value
    const hand = handEl.value
    if (!glasses || !hand) return null
    const rig = [glasses, hand]
    return gsap
      .timeline({ paused: true, defaults: { transformOrigin: PINCH } })
      /* Hidden at both ends of the timeline, so nothing peeks in at the edge while it rests */
      .fromTo(rig, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, 0)
      /* Up from below the photo, glasses tipped the way they hang when held by one corner. The hand
         rises first and swings in after, which bends the path into an arc, and slows onto the face. */
      .fromTo(rig, { xPercent: 20 }, { xPercent: 0, duration: 0.7, ease: 'sine.inOut' }, 0)
      .fromTo(rig, { yPercent: 74 }, { yPercent: 0, duration: 0.7, ease: 'sine.out' }, 0)
      .fromTo(glasses, { rotation: -18 }, { rotation: 0, duration: 0.7, ease: 'sine.inOut' }, 0)
      .fromTo(hand, { rotation: -6 }, { rotation: 0, duration: 0.7, ease: 'sine.inOut' }, 0)
      /* Nudge them up the nose */
      .to(rig, { yPercent: -0.8, duration: 0.07, ease: 'power1.out', yoyo: true, repeat: 1 }, 0.7)
      /* Let go, then drop out of frame */
      .to(hand, { rotation: 8, xPercent: 3, yPercent: 2, duration: 0.12, ease: 'power1.out' }, 0.86)
      .to(hand, { rotation: 14, xPercent: 16, yPercent: 76, duration: 0.35, ease: 'power2.in' }, 0.98)
      .set(hand, { autoAlpha: 0 })
  }

  /** Both pictures decoded, so the first frames of the hand don't wait on them */
  const imagesReady = () =>
    Promise.all(
      [glassesEl.value, handEl.value].map((layer) => layer?.querySelector('img')?.decode().catch(() => {}))
    )

  /**
   * Calls `done` once the page draws a few smooth frames in a row (or after `maxWait` ms regardless).
   * A theme switch restyles the whole page; a hand that set off during that stall would skip its rise.
   */
  const whenSmooth = (done: () => void, maxWait = 3000) => {
    const start = performance.now()
    let last = 0
    let smooth = 0
    const tick = (now: number) => {
      smooth = last && now - last < 34 ? smooth + 1 : 0
      last = now
      if (smooth >= 3 || now - start > maxWait) done()
      else settleFrame = requestAnimationFrame(tick)
    }
    settleFrame = requestAnimationFrame(tick)
  }

  /*
   * The timeline is stepped by hand, at most MAX_STEP_MS of motion per frame: if the page stalls
   * mid-way, the hand pauses and carries on instead of leaping to catch up. It heads for whichever
   * end `wearing` says each frame, so switching back mid-way simply turns it around.
   */
  let lastFrame = 0
  const drive = (now: number) => {
    if (!timeline) return
    const step = lastFrame ? Math.min(now - lastFrame, MAX_STEP_MS) / 1000 : 0
    lastFrame = now
    const end = wearing ? timeline.duration() : 0
    const next = wearing ? Math.min(end, timeline.time() + step) : Math.max(end, timeline.time() - step)
    timeline.time(next)
    if (next === end) {
      driveFrame = 0
      lastFrame = 0
    } else {
      driveFrame = requestAnimationFrame(drive)
    }
  }
  const go = () => {
    if (!driveFrame) driveFrame = requestAnimationFrame(drive)
  }

  const apply = async (delay: number) => {
    armed.value = true
    await nextTick()
    gsapLib ??= (await import('gsap')).gsap
    await imagesReady()
    if (disposed) return
    timeline ??= build(gsapLib)
    if (!timeline) return
    window.clearTimeout(delayTimer)
    cancelAnimationFrame(settleFrame)
    if (reducedMotion) {
      timeline.progress(wearing ? 1 : 0)
      return
    }
    /* Already under way: the drive loop turns around by itself */
    if (driveFrame) return
    delayTimer = window.setTimeout(() => whenSmooth(go), delay * 1000)
  }

  const sync = () => {
    if (isLight() === wearing) return
    wearing = isLight()
    /* Before the intro hands off, the arrival watcher below starts it */
    if (introContentReady.value && (wearing || armed.value)) apply(SWITCH_DELAY)
  }

  /* Space visitors fetch the pictures (about 23 KB) in idle time, ready for their first switch */
  const armWhenIdle = () => {
    if (armed.value) return
    const arm = async () => {
      armed.value = true
      await nextTick()
      await imagesReady()
    }
    /* Safari has no requestIdleCallback */
    const whenIdle = window.requestIdleCallback as typeof window.requestIdleCallback | undefined
    if (whenIdle) {
      const handle = whenIdle(arm, { timeout: 4000 })
      cancelIdle = () => window.cancelIdleCallback(handle)
    } else {
      const handle = window.setTimeout(arm, 2000)
      cancelIdle = () => window.clearTimeout(handle)
    }
  }

  const themeObserver = new MutationObserver(sync)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  wearing = isLight()
  /* Arriving in Ground Control: load the pictures while the intro plays */
  if (wearing) armed.value = true
  const stopArrival = watch(
    introContentReady,
    (ready) => {
      if (!ready) return
      if (wearing) apply(ARRIVAL_DELAY)
      else armWhenIdle()
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    disposed = true
    themeObserver.disconnect()
    stopArrival()
    window.clearTimeout(delayTimer)
    cancelIdle()
    cancelAnimationFrame(settleFrame)
    cancelAnimationFrame(driveFrame)
    timeline?.kill()
  })
})
</script>

<style scoped>
/* Sits on the photo, under the Space terminator shade, so it is lit like the face */
.profile-shades {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  border-radius: 50%;
  pointer-events: none;
}

/* Each layer covers the whole photo, so the pinch point is the same spot on both */
.profile-shades__layer {
  position: absolute;
  inset: 0;
  visibility: hidden;
  /* Moved as finished layers, never repainted mid-flight */
  will-change: transform;
}

.profile-shades__art {
  position: absolute;
  max-width: none;
  height: auto;
  user-select: none;
}
</style>
