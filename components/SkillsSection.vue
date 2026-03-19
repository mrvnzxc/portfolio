<template>
  <section id="skills" class="border-t border-slate-200/70 bg-slate-50/70 py-16 sm:py-20 dark:border-slate-800 dark:bg-slate-900/60">
    <div class="mx-auto max-w-6xl px-4">
      <div class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 reveal-on-scroll">
        <h2 class="mb-1 text-3xl font-semibold tracking-tight sm:text-4xl">Comfortable With</h2>
        <span class="self-end text-right text-xs sm:self-auto sm:text-left sm:text-sm font-semibold uppercase tracking-wide text-primary-600">Daily drivers</span>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <div class="card-animated rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80 reveal-on-scroll">
          <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"><Icon icon="ph:code-fill" /></span>
            Languages &amp; Stack
          </h3>
          <div class="space-y-3 text-xs sm:text-sm">
            <div v-for="skill in skills" :key="skill.name" class="skill-bar">
              <div class="flex items-center justify-between gap-2">
                <span class="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
                  <Icon :icon="skill.icon" :class="skill.iconClass" />
                  {{ skill.name }}
                </span>
                <span class="skill-percentage text-slate-500 dark:text-slate-400">{{ skill.current }}%</span>
              </div>
              <div class="mt-1 h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                <div class="skill-bar-fill h-full rounded-full bg-primary-500/90 dark:bg-primary-400/90" :style="{ width: skill.current + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-animated rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80 reveal-on-scroll">
          <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"><Icon icon="ph:wrench-fill" /></span>
            Platforms &amp; Tools
          </h3>
          <div class="space-y-3 text-xs sm:text-sm">
            <div>
              <p class="mb-1 font-medium text-slate-800 dark:text-slate-100">Backend &amp; APIs</p>
              <div class="flex flex-wrap gap-2">
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-100">Spring Boot</span>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-100">Node.js</span>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-100">Flask</span>
              </div>
            </div>
            <div>
              <p class="mb-1 font-medium text-slate-800 dark:text-slate-100">Data &amp; Graph</p>
              <div class="flex flex-wrap gap-2">
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-100">Postgraphile</span>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-100">GraphQL</span>
              </div>
            </div>
            <div>
              <p class="mb-1 font-medium text-slate-800 dark:text-slate-100">DevOps &amp; Delivery</p>
              <div class="flex flex-wrap gap-2">
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-100">Docker</span>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-100">GitHub Actions</span>
              </div>
            </div>
            <div>
              <p class="mb-1 font-medium text-slate-800 dark:text-slate-100">Computer Vision &amp; AI</p>
              <div class="flex flex-wrap gap-2">
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-100">OpenCV</span>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-800 dark:bg-slate-800 dark:text-slate-100">Python tooling</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-animated rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 shadow-sm shadow-slate-950/5 dark:border-slate-800 dark:bg-slate-900/80 reveal-on-scroll">
          <h3 class="mb-3 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-200"><Icon icon="ph:trend-up-fill" /></span>
            Strengths
          </h3>
          <ul class="space-y-2 text-base text-slate-600 dark:text-slate-300">
            <li>Reliable API design with clean contracts.</li>
            <li>UI systems that stay consistent and accessible.</li>
            <li>Data modeling for clear analytics and reporting.</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onMounted, ref } from 'vue'

const skills = ref([
  { name: 'Java', percent: 80, current: 0, icon: 'logos:java', iconClass: 'h-6 w-6 shrink-0' },
  { name: 'Python', percent: 60, current: 0, icon: 'simple-icons:python', iconClass: 'h-5 w-5 shrink-0 text-[#3776ab]' },
  { name: 'JavaScript', percent: 60, current: 0, icon: 'simple-icons:javascript', iconClass: 'h-5 w-5 shrink-0 text-[#f7df1e]' },
  { name: 'PHP', percent: 85, current: 0, icon: 'simple-icons:php', iconClass: 'h-5 w-5 shrink-0 text-[#777bb4]' },
  { name: 'MySQL', percent: 70, current: 0, icon: 'simple-icons:mysql', iconClass: 'h-5 w-5 shrink-0 text-[#00618a]' },
  { name: 'Nuxt / Vue', percent: 60, current: 0, icon: 'simple-icons:nuxtdotjs', iconClass: 'h-5 w-5 shrink-0 text-[#00dc82]' },
  { name: 'Tailwind CSS', percent: 70, current: 0, icon: 'simple-icons:tailwindcss', iconClass: 'h-5 w-5 shrink-0 text-[#38bdf8]' },
  { name: 'PostgreSQL', percent: 50, current: 0, icon: 'simple-icons:postgresql', iconClass: 'h-5 w-5 shrink-0 text-[#4169e1]' }
])

onMounted(() => {
  const target = document.getElementById('skills')
  if (!target || !('IntersectionObserver' in window)) return
  const io = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      skills.value.forEach((skill) => {
        skill.current = 0
        const start = performance.now()
        const step = (ts: number) => {
          const progress = Math.min((ts - start) / 1000, 1)
          skill.current = Math.floor(progress * skill.percent)
          if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
      })
    } else {
      skills.value.forEach((skill) => {
        skill.current = 0
      })
    }
  }, { threshold: 0.4 })
  io.observe(target)
})
</script>
