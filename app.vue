<template>
  <div class="relative min-h-screen">
    <ClientOnly>
      <WarpLoader v-if="showWarpLoader" @complete="onWarpComplete" />
    </ClientOnly>
    <div
      class="portfolio-reveal min-h-screen"
      :class="portfolioRevealClass"
    >
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'

const showWarpLoader = ref(true)
const portfolioVisible = ref(false)
const warpSequenceDone = ref(false)
const minimumTimerElapsed = ref(false)

const portfolioRevealClass = computed(() => {
  if (portfolioVisible.value) {
    return 'portfolio-reveal--in pointer-events-auto opacity-100 translate-y-0'
  }
  return 'pointer-events-none select-none opacity-0 translate-y-[20px]'
})

onMounted(() => {
  window.setTimeout(() => {
    minimumTimerElapsed.value = true
  }, 3000)
})

watch([warpSequenceDone, minimumTimerElapsed], ([warp, min]) => {
  if (!warp || !min) return
  showWarpLoader.value = false
  nextTick(() => {
    /* Let the loader paint its last frame off-DOM before starting the page ease-in. */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(() => {
          portfolioVisible.value = true
        }, 72)
      })
    })
  })
})

function onWarpComplete() {
  warpSequenceDone.value = true
}
</script>

<style scoped>
.portfolio-reveal {
  transition-property: opacity, transform;
  transition-duration: 1.85s;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  .portfolio-reveal {
    transition-duration: 0.4s;
    transition-timing-function: ease-out;
  }

  .portfolio-reveal:not(.portfolio-reveal--in) {
    transform: translate3d(0, 0, 0);
  }
}
</style>
