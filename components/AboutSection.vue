<template>
  <section id="about" class="section-band-a">
    <div class="mx-auto max-w-6xl 2xl:max-w-7xl px-4">
      <div class="grid gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)] md:items-start">
        <div class="reveal-on-scroll">
          <h2 class="text-4xl font-semibold tracking-tight sm:text-5xl">About Me</h2>
          <p class="mt-4 text-lg leading-relaxed text-ink/80">
            I'm a problem-solver who enjoys translating complex requirements into intuitive interfaces and dependable APIs. I value clean code, thoughtful UX, and measurable impact.
          </p>
          <ul class="mt-4 space-y-2 text-base text-ink/80">
            <li
              v-for="highlight in highlights"
              :key="highlight"
              class="flex gap-2"
            >
              <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ion shadow-[0_0_8px_rgb(var(--c-ion)/0.8)]"></span>
              <span>{{ highlight }}</span>
            </li>
          </ul>
        </div>

        <div class="reveal-on-scroll">
          <div class="space-panel card-animated p-5">
            <h3 class="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ion">Awards</h3>
            <ul class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              <li
                v-for="award in awards"
                :key="award"
                class="flex items-start gap-1.5 text-[11px] leading-tight text-ink/85 sm:text-xs"
              >
                <Icon class="mt-0.5 h-3 w-3 shrink-0 text-solar" icon="ph:trophy-fill" />
                <span>{{ award }}</span>
              </li>
            </ul>

            <h3 class="mt-4 border-t border-nebula/15 pt-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-ion">Quick Facts</h3>
            <div class="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
              <div
                v-for="fact in quickFacts"
                :key="fact.value"
                class="flex items-center gap-1.5 text-[11px] leading-tight text-muted sm:text-xs"
              >
                <Icon class="h-3 w-3 shrink-0" :class="fact.iconColor" :icon="fact.icon" />
                <span>{{ fact.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

const highlights = [
  'Comfortable across frontend, backend, and DevOps handoffs.',
  'Champion for accessibility, performance, and secure-by-default patterns.'
]

const awards = [
  'Programmer of the Year',
  'Best in Capstone Project',
  'Outstanding I.T.E Student of the Year',
  'Programming Excellence Award'
]

const quickFacts = [
  { value: 'General Santos City', icon: 'ph:map-pin-fill', iconColor: 'text-ion' },
  { value: 'UTC +8', icon: 'ph:clock-fill', iconColor: 'text-nebula' },
  { value: 'AI, developer tooling, clean UI', icon: 'ph:palette-fill', iconColor: 'text-solar' },
  { value: 'Build products that scale with clarity', icon: 'ph:rocket-launch-fill', iconColor: 'text-ion' }
]
</script>
