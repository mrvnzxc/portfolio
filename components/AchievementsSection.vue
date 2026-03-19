<template>
  <section id="achievements" class="border-t border-slate-200/70 py-16 sm:py-20 dark:border-slate-800">
    <div class="mx-auto max-w-6xl px-4">
      <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 reveal-on-scroll">
        <h2 class="mb-1 text-3xl font-semibold tracking-tight sm:text-4xl">Achievements</h2>
        <span class="self-end text-right text-xs sm:self-auto sm:text-left sm:text-sm font-semibold uppercase tracking-wide text-primary-600">Certificates &amp; contests</span>
      </div>
      <div class="grid gap-8 lg:grid-cols-2">
        <div class="reveal-on-scroll achievement-card rounded-2xl border border-slate-200/80 bg-white/80 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
          <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Certificates</h3>
          <div class="space-y-4">
            <NeonBorderReveal
              color="#f472b6"
              class="achievement-item cursor-pointer rounded-xl bg-slate-50/75 shadow-sm dark:bg-slate-900/60"
              @click="$emit('open-image', '/cert1.png')"
            >
              <figure class="overflow-hidden rounded-[inherit]">
                <img src="/cert1.png" alt="Certificate 1" class="achievement-thumb h-40 w-full object-cover sm:h-52">
                <figcaption class="flex items-center justify-between px-3 py-2 text-[11px]">
                  <span class="font-medium">Certificate 1</span>
                  <a href="/1.pdf" download class="text-primary-600 hover:underline dark:text-primary-300" @click.stop>Download PDF</a>
                </figcaption>
              </figure>
            </NeonBorderReveal>

            <NeonBorderReveal
              color="#f472b6"
              class="achievement-item cursor-pointer rounded-xl bg-slate-50/75 shadow-sm dark:bg-slate-900/60"
              @click="$emit('open-image', '/cert2.png')"
            >
              <figure class="overflow-hidden rounded-[inherit]">
                <img src="/cert2.png" alt="Certificate 2" class="achievement-thumb h-40 w-full object-cover sm:h-52">
                <figcaption class="flex items-center justify-between px-3 py-2 text-[11px]">
                  <span class="font-medium">Certificate 2</span>
                  <a href="/2.pdf" download class="text-primary-600 hover:underline dark:text-primary-300" @click.stop>Download PDF</a>
                </figcaption>
              </figure>
            </NeonBorderReveal>

            <NeonBorderReveal
              color="#f472b6"
              class="achievement-item cursor-pointer rounded-xl bg-slate-50/75 shadow-sm dark:bg-slate-900/60"
              @click="$emit('open-image', '/cert3.png')"
            >
              <figure class="overflow-hidden rounded-[inherit]">
                <img src="/cert3.png" alt="Certificate 3" class="achievement-thumb h-40 w-full object-cover sm:h-52">
                <figcaption class="flex items-center justify-between px-3 py-2 text-[11px]">
                  <span class="font-medium">Certificate 3</span>
                  <a href="/3.pdf" download class="text-primary-600 hover:underline dark:text-primary-300" @click.stop>Download PDF</a>
                </figcaption>
              </figure>
            </NeonBorderReveal>
          </div>
        </div>
        <div class="reveal-on-scroll achievement-card rounded-2xl border border-slate-200/80 bg-white/80 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
          <h3 class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-50">Programming Competitions</h3>
          <div class="grid gap-3 sm:grid-cols-2">
            <NeonBorderReveal
              v-for="n in 5"
              :key="n"
              color="#a855f7"
              class="achievement-item cursor-pointer rounded-xl bg-slate-50/75 shadow-sm dark:bg-slate-900/60"
              :class="n === 5 ? 'sm:col-span-2' : ''"
              @click="$emit('open-image', '/res' + n + '.jpg')"
            >
              <figure class="overflow-hidden rounded-[inherit]">
                <img
                  :src="'/res' + n + '.jpg'"
                  :alt="'Programming competition photo ' + n"
                  class="achievement-thumb h-32 w-full object-cover"
                  :class="n === 5 ? 'sm:h-48' : 'sm:h-40'"
                >
                <figcaption class="px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">Contest moment {{ n }}</figcaption>
              </figure>
            </NeonBorderReveal>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
<script setup lang="ts">
defineEmits<{ (e: 'open-image', src: string): void }>()
</script>
