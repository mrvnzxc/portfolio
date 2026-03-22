<template>
  <section id="services" class="section-band-b">
    <div class="mx-auto max-w-6xl px-4">
      <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 reveal-on-scroll">
        <h2 class="mb-1 text-3xl font-semibold tracking-tight sm:text-4xl">How I Can Help</h2>
        <span class="self-end text-right text-xs sm:self-auto sm:text-left sm:text-sm font-semibold uppercase tracking-wide text-primary-600">Services</span>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <div class="hover-card card-animated h-full rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 text-sm text-slate-600 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 reveal-on-scroll">
          <h3 class="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"><Icon icon="ph:gear-fill" /></span>
            Backend &amp; APIs
          </h3>
          <p class="text-sm sm:text-base">Designing reliable REST/GraphQL services, data models, and integrations that stay scalable and secure.</p>
        </div>
        <div class="hover-card card-animated h-full rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 text-sm text-slate-600 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 reveal-on-scroll">
          <h3 class="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"><Icon icon="ph:monitor-fill" /></span>
            Frontend &amp; UX
          </h3>
          <p class="text-sm sm:text-base">Building responsive, accessible UIs with clean component systems and thoughtful interactions.</p>
        </div>
        <div class="hover-card card-animated h-full rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 text-sm text-slate-600 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 reveal-on-scroll">
          <h3 class="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"><Icon icon="ph:robot-fill" /></span>
            Automation &amp; AI
          </h3>
          <p class="text-sm sm:text-base">Automating workflows with Python, OpenCV, and scripts to reduce manual ops and increase reliability.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
</script>
