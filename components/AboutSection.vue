<template>
  <section id="about" class="section-band-a !pb-12 !pt-6 sm:!pb-14 sm:!pt-8">
    <div class="mx-auto max-w-6xl px-4">
      <div class="grid gap-8 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)] md:items-start">
        <div class="reveal-on-scroll">
          <h2 class="text-4xl font-semibold tracking-tight sm:text-5xl">About Me</h2>
          <p class="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
            I'm a problem-solver who enjoys translating complex requirements into intuitive interfaces and dependable APIs. I value clean code, thoughtful UX, and measurable impact.
          </p>
          <ul class="mt-4 space-y-2 text-base text-slate-700 dark:text-slate-200">
            <li
              v-for="highlight in highlights"
              :key="highlight"
              class="flex gap-2"
            >
              <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500"></span>
              <span>{{ highlight }}</span>
            </li>
          </ul>
        </div>

        <div class="reveal-on-scroll">
          <div class="card-animated rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80">
            <h3 class="text-[11px] font-semibold uppercase tracking-wide text-primary-600">Awards</h3>
            <ul class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
              <li
                v-for="award in awards"
                :key="award"
                class="flex items-start gap-1.5 text-[11px] leading-tight text-slate-700 sm:text-xs dark:text-slate-200"
              >
                <Icon class="mt-0.5 h-3 w-3 shrink-0 text-amber-500 dark:text-amber-400" icon="ph:trophy-fill" />
                <span>{{ award }}</span>
              </li>
            </ul>

            <h3 class="mt-4 border-t border-slate-200/80 pt-4 text-[11px] font-semibold uppercase tracking-wide text-primary-600 dark:border-slate-800">Quick Facts</h3>
            <div class="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
              <div
                v-for="fact in quickFacts"
                :key="fact.value"
                class="flex items-center gap-1.5 text-[11px] leading-tight text-slate-600 sm:text-xs dark:text-slate-300"
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
  { value: 'General Santos City', icon: 'ph:map-pin-fill', iconColor: 'text-emerald-500 dark:text-emerald-400' },
  { value: 'UTC +8', icon: 'ph:clock-fill', iconColor: 'text-sky-500 dark:text-sky-400' },
  { value: 'AI, developer tooling, clean UI', icon: 'ph:palette-fill', iconColor: 'text-pink-500 dark:text-pink-400' },
  { value: 'Build products that scale with clarity', icon: 'ph:rocket-launch-fill', iconColor: 'text-violet-500 dark:text-violet-400' }
]
</script>
