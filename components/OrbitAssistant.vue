<template>
  <div>
    <!-- The chat's code only loads on the first open; after that it stays mounted so the conversation survives closing -->
    <LazyOrbitAssistantPanel v-if="activated" v-show="open" :open="open" @close="close" />
    <button
      ref="launcherEl"
      type="button"
      class="oa-launcher"
      :class="{ 'is-open': open }"
      aria-controls="orbit-assistant"
      :aria-expanded="open"
      :aria-label="open ? 'Close the chat' : 'Ask about Marvin: open the chat'"
      :style="footerLift && !open ? { transform: `translateY(-${footerLift}px)` } : undefined"
      @click="open ? close() : show()"
    >
      <span class="oa-launcher__label" aria-hidden="true">Ask about Marvin</span>
      <!-- A small planet with a ring and a moon, like the hero photo's orbit. The ring's back half sits behind the planet. -->
      <span class="oa-orb" aria-hidden="true">
        <span class="oa-orb__ring oa-orb__ring--back" />
        <span class="oa-orb__planet" />
        <span class="oa-orb__ring" />
        <span class="oa-orb__moon" />
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const activated = ref(false)
const open = ref(false)
const launcherEl = ref<HTMLButtonElement | null>(null)
/** How much of the footer is on screen; the launcher rides above it so it never covers the footer's links */
const footerLift = ref(0)

let footerObserver: IntersectionObserver | null = null
let liftFrame = 0

function show() {
  activated.value = true
  open.value = true
}

function close() {
  open.value = false
  launcherEl.value?.focus()
}

function measureFooterLift() {
  liftFrame = 0
  const footer = document.querySelector('footer')
  footerLift.value = footer ? Math.max(0, Math.round(window.innerHeight - footer.getBoundingClientRect().top)) : 0
}

function scheduleFooterLift() {
  if (!liftFrame) liftFrame = requestAnimationFrame(measureFooterLift)
}

function stopTrackingFooter() {
  window.removeEventListener('scroll', scheduleFooterLift)
  window.removeEventListener('resize', scheduleFooterLift)
  cancelAnimationFrame(liftFrame)
  liftFrame = 0
}

onMounted(() => {
  const footer = document.querySelector('footer')
  if (!footer) return
  /* Only listen to scrolling while the footer is on screen */
  footerObserver = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      window.addEventListener('scroll', scheduleFooterLift, { passive: true })
      window.addEventListener('resize', scheduleFooterLift)
      measureFooterLift()
    } else {
      stopTrackingFooter()
      footerLift.value = 0
    }
  })
  footerObserver.observe(footer)
})

onBeforeUnmount(() => {
  footerObserver?.disconnect()
  stopTrackingFooter()
})
</script>

<style scoped>
/* Ground Control (default): the planet is a line drawing, hidden edges dashed. Space (html.dark): a glowing planet. */
.oa-launcher {
  position: fixed;
  z-index: 40;
  right: 1.5rem;
  bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border-radius: 999px;
}

.oa-launcher:focus-visible {
  outline: 2px solid rgb(var(--c-ion));
  outline-offset: 4px;
}

.oa-launcher__label {
  padding: 0.35rem 0.75rem;
  border: 1px solid rgb(15 27 45 / 0.55);
  border-radius: 3px;
  background: #fff;
  color: rgb(var(--c-ink));
  font-size: 12.5px;
  font-weight: 500;
  white-space: nowrap;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

html.dark .oa-launcher__label {
  border-color: rgb(165 148 255 / 0.3);
  border-radius: 999px;
  background: #0f1537;
}

.oa-launcher.is-open .oa-launcher__label {
  opacity: 0;
  transform: translateX(6px);
  pointer-events: none;
}

.oa-orb {
  position: relative;
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.oa-launcher:hover .oa-orb,
.oa-launcher.is-open .oa-orb {
  transform: translateY(-2px);
}

.oa-orb__planet {
  position: absolute;
  inset: 10px;
  border: 1.5px solid rgb(15 27 45 / 0.85);
  border-radius: 50%;
  background: #fff;
}

html.dark .oa-orb__planet {
  border: 0;
  background: radial-gradient(circle at 35% 30%, #c4b8ff, #7a66f0 45%, #2b1f7a 100%);
  box-shadow: 0 0 22px -2px rgb(122 102 240 / 0.8);
  transition: box-shadow 0.25s ease;
}

html.dark .oa-launcher:hover .oa-orb__planet,
html.dark .oa-launcher.is-open .oa-orb__planet {
  box-shadow: 0 0 28px 0 rgb(122 102 240 / 0.95);
}

/* One tilted ellipse, drawn twice: the back half behind the planet, the front half over it */
.oa-orb__ring {
  position: absolute;
  top: 18px;
  left: -2px;
  right: -2px;
  height: 16px;
  border: 1.5px solid rgb(var(--c-ion));
  border-radius: 50%;
  transform: rotate(-20deg);
  clip-path: inset(50% -3px -3px -3px);
}

.oa-orb__ring--back {
  border-style: dashed;
  clip-path: inset(-3px -3px 50% -3px);
}

html.dark .oa-orb__ring {
  border: 2px solid rgb(110 231 249 / 0.85);
}

html.dark .oa-orb__ring--back {
  border-color: rgb(110 231 249 / 0.45);
}

.oa-orb__moon {
  position: absolute;
  top: 12px;
  right: 2px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--signal);
}

html.dark .oa-orb__moon {
  background: #6ee7f9;
  box-shadow: 0 0 8px #6ee7f9;
}

/* Phones: just the planet, so it covers less of the page */
@media (max-width: 639px) {
  .oa-launcher {
    right: 0.9rem;
    bottom: 1.1rem;
  }

  .oa-launcher__label {
    display: none;
  }
}
</style>
