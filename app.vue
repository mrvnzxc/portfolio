<template>
  <div class="relative min-h-screen">
    <ClientOnly>
      <TerminalIntro v-if="showIntro" @complete="onIntroComplete" />
    </ClientOnly>
    <!--
      Intro uses opacity only (no transform). Transform on this wrapper would break
      position:fixed #dust-canvas inside the page — it would stick to the hero band.
    -->
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

const showIntro = ref(true)
const portfolioVisible = ref(false)
const introSequenceDone = ref(false)
const minimumTimerElapsed = ref(false)
const introContentReady = useIntroContentReady()

const portfolioRevealClass = computed(() => {
  if (portfolioVisible.value) {
    return 'portfolio-reveal--in pointer-events-auto opacity-100'
  }
  return 'pointer-events-none select-none opacity-0'
})

onMounted(() => {
  /* The terminal intro paces itself; this only guards against a flash on a skip at first paint */
  window.setTimeout(() => {
    minimumTimerElapsed.value = true
  }, 400)

  // Safety net: never leave the site invisible if the intro fails to finish
  window.setTimeout(() => {
    if (portfolioVisible.value) return
    introSequenceDone.value = true
    minimumTimerElapsed.value = true
    showIntro.value = false
    portfolioVisible.value = true
    introContentReady.value = true
  }, 9000)
})

watch([introSequenceDone, minimumTimerElapsed], ([done, min]) => {
  if (!done || !min) return
  showIntro.value = false
  nextTick(() => {
    /* Let the intro paint its last frame off-DOM before starting the page ease-in. */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(() => {
          portfolioVisible.value = true
          introContentReady.value = true
        }, 72)
      })
    })
  })
})

function onIntroComplete() {
  introSequenceDone.value = true
}
</script>

<style scoped>
.portfolio-reveal {
  transition-property: opacity;
  transition-duration: 1.85s;
  transition-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  .portfolio-reveal {
    transition-duration: 0.4s;
    transition-timing-function: ease-out;
  }
}
</style>
