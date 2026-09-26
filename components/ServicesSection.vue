<template>
  <section id="services" class="section-band-b pt-5 sm:pt-6">
    <div class="mx-auto max-w-6xl 2xl:max-w-7xl px-4">
      <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 reveal-on-scroll">
        <h2 class="mb-1 text-3xl font-semibold tracking-tight sm:text-4xl">How I Can Help</h2>
        <span class="section-tag self-end sm:self-auto">Services</span>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <div class="space-panel card-animated h-full p-6 text-sm text-muted reveal-on-scroll">
          <h3 class="mb-2 flex items-center gap-2.5 text-lg font-semibold text-ink">
            <span class="icon-badge"><Icon icon="ph:gear-fill" /></span>
            Backend &amp; APIs
          </h3>
          <p class="text-sm sm:text-base">Designing reliable REST/GraphQL services, data models, and integrations that stay scalable and secure.</p>
        </div>
        <div class="space-panel card-animated h-full p-6 text-sm text-muted reveal-on-scroll">
          <h3 class="mb-2 flex items-center gap-2.5 text-lg font-semibold text-ink">
            <span class="icon-badge"><Icon icon="ph:monitor-fill" /></span>
            Frontend &amp; UX
          </h3>
          <p class="text-sm sm:text-base">Building responsive, accessible UIs with clean component systems and thoughtful interactions.</p>
        </div>
        <div class="space-panel card-animated h-full p-6 text-sm text-muted reveal-on-scroll">
          <h3 class="mb-2 flex items-center gap-2.5 text-lg font-semibold text-ink">
            <span class="icon-badge"><Icon icon="ph:robot-fill" /></span>
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
