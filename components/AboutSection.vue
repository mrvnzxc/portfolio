<template>
  <section id="about" class="border-t border-slate-200/70 bg-white/80 py-16 sm:py-20 dark:border-slate-800 dark:bg-slate-900/60">
    <div class="mx-auto max-w-6xl px-4">
      <div class="grid gap-12 md:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)] md:items-center">
        <div class="reveal-on-scroll">
          <h2 class="text-3xl font-semibold tracking-tight sm:text-4xl">About Me</h2>
          <p class="mt-4 text-lg leading-relaxed text-slate-700 dark:text-slate-200">
            I'm a problem-solver who enjoys translating complex requirements into intuitive interfaces and dependable APIs. I value clean code, thoughtful UX, and measurable impact.
          </p>
          <ul class="mt-5 space-y-3 text-base text-slate-700 dark:text-slate-200">
            <li class="flex gap-2">
              <span class="mt-1 h-2 w-2 rounded-full bg-primary-500"></span>
              <span>Comfortable across frontend, backend, and DevOps handoffs.</span>
            </li>
            <li class="flex gap-2">
              <span class="mt-1 h-2 w-2 rounded-full bg-primary-500"></span>
              <span>Champion for accessibility, performance, and secure-by-default patterns.</span>
            </li>
          </ul>
        </div>
        <div class="h-full reveal-on-scroll">
          <div class="card-animated flex h-full flex-col justify-between rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80">
            <h3 class="text-xs sm:text-sm font-semibold uppercase tracking-wide text-primary-600">Quick Facts</h3>
            <div class="mt-4 space-y-2 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              <div class="flex items-center gap-2">
                <Icon class="h-4 w-4 text-emerald-500 dark:text-emerald-400" icon="ph:map-pin-fill" />
                <span>Based in: General Santos City</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon class="h-4 w-4 text-sky-500 dark:text-sky-400" icon="ph:clock-fill" />
                <span>Timezone: UTC +8</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon class="h-4 w-4 text-pink-500 dark:text-pink-400" icon="ph:palette-fill" />
                <span>Interests: AI, developer tooling, clean UI</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon class="h-4 w-4 text-amber-500 dark:text-amber-400" icon="ph:trophy-fill" />
                <span>Loves joining programming competitions</span>
              </div>
              <div class="flex items-center gap-2">
                <Icon class="h-4 w-4 text-violet-500 dark:text-violet-400" icon="ph:rocket-launch-fill" />
                <span>Goal: Build products that scale with clarity.</span>
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
</script>
