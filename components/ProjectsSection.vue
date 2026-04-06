<template>
  <section id="projects" class="section-band-a featured-projects">
    <div class="mx-auto max-w-6xl px-4">
      <header class="mb-10 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 class="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Mission Control Projects</h2>
        </div>
        <span class="self-end text-right text-xs sm:self-auto sm:text-left sm:text-sm font-semibold uppercase tracking-wide text-primary-600">Featured Projects</span>

      </header>

      <div class="space-y-12 sm:space-y-16 lg:space-y-20">
        <article
          v-for="(project, index) in projects"
          :key="project.title"
          :data-index="index"
          :ref="setCardRef"
          class="project-reveal group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_24px_55px_rgba(15,23,42,0.12)] ring-1 ring-white/50 transition-[opacity,transform,box-shadow] duration-700 ease-out dark:border-white/10 dark:bg-slate-950/95 dark:shadow-[0_0_18px_rgba(56,189,248,0.08)] dark:ring-cyan-300/10"
          :class="{ 'is-visible': revealed[index] }"
          tabindex="0"
          role="button"
          :aria-label="`Open details for ${project.title}`"
          @click="openProject(project)"
          @keydown.enter.prevent="openProject(project)"
          @keydown.space.prevent="openProject(project)"
        >
          <div class="grid lg:grid-cols-[48%_52%]">
            <div
              class="project-media border-b border-slate-200/80 p-6 dark:border-white/10 lg:border-b-0"
              :class="index % 2 ? 'lg:order-2 lg:border-l' : 'lg:border-r'"
            >
              <div class="flex min-h-[280px] items-center justify-center sm:min-h-[320px] lg:min-h-[360px]">
                <button
                  type="button"
                  class="image-launch image-frame group/image w-full overflow-hidden rounded-2xl border border-slate-300/85 bg-slate-100/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_20px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700/90 dark:bg-slate-900/90 dark:shadow-[inset_0_1px_0_rgba(148,163,184,0.2),0_12px_24px_rgba(2,6,23,0.5)] dark:focus-visible:ring-cyan-300"
                  :aria-label="`Expand ${project.title} preview image`"
                  @click.stop="openImagePreview(project.image, project.title)"
                >
                  <img
                    :src="project.image"
                    :alt="project.title"
                    class="h-auto max-h-[460px] w-full rounded-xl border border-slate-300/70 object-contain dark:border-slate-700/80"
                    loading="lazy"
                  />
                </button>
              </div>
            </div>

            <div class="space-y-4 p-6 sm:p-8" :class="index % 2 ? 'lg:order-1' : ''">
              <div class="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-primary-500/25 bg-primary-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-primary-700 dark:border-cyan-300/30 dark:bg-cyan-400/10 dark:text-cyan-200">
                <span class="h-1.5 w-1.5 rounded-full bg-primary-500 dark:bg-cyan-300"></span>
                <span class="break-words">{{ project.label }}</span>
              </div>

              <h3 class="text-2xl font-semibold tracking-tight">{{ project.title }}</h3>
              <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{{ project.description }}</p>

              <div>
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Tech Stack
                </p>
                <ul class="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
                  <li
                    v-for="item in project.stack"
                    :key="item.label"
                    class="flex items-center gap-2 border-b border-slate-200/70 pb-1 last:border-b-0 dark:border-white/10"
                  >
                    <Icon :icon="item.icon" :class="item.iconClass" />
                    <span>{{ item.label }}</span>
                  </li>
                </ul>
              </div>

              <div>
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Key Features
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="feature in project.features"
                    :key="feature"
                    class="rounded-full border border-slate-300/80 bg-slate-100/80 px-3 py-1 text-xs font-medium text-slate-700 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200"
                  >
                    {{ feature }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <Transition name="project-modal">
      <div
        v-if="selectedProject"
        class="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
        role="presentation"
      >
        <div
          class="project-modal-backdrop absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]"
          aria-hidden="true"
          @click="closeModal"
        />
        <article
          class="launch-modal project-modal-panel relative z-10 flex w-full max-w-none max-h-[min(93dvh,920px)] flex-col overflow-hidden rounded-t-2xl border border-slate-200/80 border-b-0 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.2)] ring-1 ring-white/50 dark:border-cyan-300/30 dark:bg-slate-950 dark:shadow-[0_0_28px_rgba(34,211,238,0.14)] dark:ring-cyan-200/20 sm:max-h-[min(85vh,680px)] sm:max-w-3xl sm:rounded-xl sm:border-b"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="selectedProject ? 'project-modal-title' : undefined"
          @click.stop
        >
        <header class="flex shrink-0 items-start justify-between gap-3 border-b border-slate-200/80 bg-white/95 px-4 py-3 dark:border-white/10 dark:bg-slate-950/95 sm:px-5">
          <div class="min-w-0 pr-2">
            <p class="text-[11px] font-semibold uppercase tracking-wide text-primary-600 dark:text-cyan-300">
              {{ selectedProject.label }}
            </p>
            <h3 id="project-modal-title" class="mt-0.5 text-base font-semibold leading-snug tracking-tight sm:text-xl">
              {{ selectedProject.title }}
            </h3>
          </div>
          <button
            type="button"
            class="shrink-0 rounded-lg border border-slate-300/80 bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            @click="closeModal"
          >
            Close
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div class="space-y-3 px-3 pb-6 pt-3 sm:space-y-4 sm:px-5 sm:py-5 sm:pb-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
              <button
                type="button"
                class="image-launch image-frame w-full shrink-0 overflow-hidden rounded-xl border border-slate-300/85 bg-slate-100/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_6px_16px_rgba(15,23,42,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700/90 dark:bg-slate-900/90 dark:shadow-[inset_0_1px_0_rgba(148,163,184,0.15),0_8px_18px_rgba(2,6,23,0.4)] dark:focus-visible:ring-cyan-300 sm:mx-0 sm:w-[46%] sm:min-w-[280px] sm:max-w-[420px]"
                :aria-label="`Expand ${selectedProject.title} preview image`"
                @click="openImagePreview(selectedProject.image, selectedProject.title)"
              >
                <img
                  :src="selectedProject.image"
                  :alt="selectedProject.title"
                  class="h-auto max-h-[min(38vh,240px)] w-full rounded-lg border border-slate-300/60 object-contain dark:border-slate-700/70 sm:max-h-[360px] lg:max-h-[400px]"
                  loading="lazy"
                />
              </button>
              <div class="project-modal-mobile-card min-w-0 flex-1 space-y-3 sm:space-y-3">
                <p class="text-[15px] leading-relaxed text-slate-700 dark:text-slate-200 sm:text-sm sm:leading-snug sm:text-slate-600 dark:sm:text-slate-300">
                  {{ selectedProject.description }}
                </p>
                <div class="border-t border-slate-200/80 pt-3 dark:border-white/10 sm:border-0 sm:pt-0">
                  <p class="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:mb-1 sm:text-[11px]">
                    Problem it solves
                  </p>
                  <p class="text-[15px] leading-relaxed text-slate-800 dark:text-slate-100 sm:text-sm sm:leading-snug sm:font-normal sm:text-slate-700 dark:sm:text-slate-200">
                    {{ selectedProject.problem }}
                  </p>
                </div>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 sm:gap-5 sm:border-t sm:border-slate-200/80 sm:pt-4 dark:sm:border-white/10">
              <div class="project-modal-mobile-card">
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 sm:mb-1.5 sm:text-[11px] sm:font-semibold sm:text-slate-500 dark:sm:text-slate-400">
                  How it works
                </p>
                <ol class="list-decimal space-y-2.5 pl-4 text-[15px] leading-relaxed text-slate-800 marker:font-medium marker:text-primary-600 dark:text-slate-100 dark:marker:text-cyan-400/90 sm:space-y-1.5 sm:pl-4 sm:text-xs sm:leading-snug sm:font-normal sm:text-slate-700 dark:sm:text-slate-200 dark:sm:marker:text-slate-500">
                  <li v-for="(step, i) in selectedProject.howItWorks" :key="i">{{ step }}</li>
                </ol>
              </div>
              <div class="project-modal-mobile-card">
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 sm:mb-1.5 sm:text-[11px] sm:font-semibold sm:text-slate-500 dark:sm:text-slate-400">
                  Deep dive
                </p>
                <p class="text-[15px] leading-relaxed text-slate-800 dark:text-slate-100 sm:text-xs sm:leading-snug sm:font-normal sm:text-slate-700 dark:sm:text-slate-200">
                  {{ selectedProject.deepDive }}
                </p>
                <div class="mt-4 border-t border-slate-200/80 pt-4 dark:border-white/10 sm:mt-4 sm:border-slate-200/70">
                  <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 sm:text-[11px] sm:font-semibold sm:text-slate-500 dark:sm:text-slate-400">
                    Key features
                  </p>
                  <div class="flex flex-wrap gap-2 sm:gap-1.5">
                    <span
                      v-for="feature in selectedProject.features"
                      :key="feature"
                      class="rounded-lg border border-slate-300/80 bg-white px-2.5 py-1 text-xs font-medium text-slate-800 shadow-sm dark:border-white/15 dark:bg-slate-900/90 dark:text-slate-100 sm:rounded-md sm:border-slate-300/70 sm:bg-slate-100/70 sm:px-2 sm:py-0.5 sm:text-[11px] sm:font-medium sm:text-slate-700 dark:sm:bg-slate-900/80 dark:sm:text-slate-200"
                    >
                      {{ feature }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 sm:gap-5 sm:border-t sm:border-slate-200/80 sm:pt-4 dark:sm:border-white/10">
              <div class="project-modal-mobile-card">
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 sm:mb-1.5 sm:text-[11px] sm:font-semibold sm:text-slate-500 dark:sm:text-slate-400">
                  Tech stack
                </p>
                <ul class="space-y-2.5 text-[15px] leading-relaxed text-slate-800 dark:text-slate-100 sm:space-y-1 sm:text-xs sm:leading-snug sm:font-normal sm:text-slate-700 dark:sm:text-slate-200">
                  <li v-for="item in selectedProject.stack" :key="item.label" class="flex items-start gap-2.5 sm:gap-2">
                    <Icon :icon="item.icon" :class="[item.iconClass, 'mt-0.5 shrink-0 opacity-90']" />
                    <span>{{ item.label }}</span>
                  </li>
                </ul>
              </div>
              <div class="project-modal-mobile-card">
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 sm:mb-1.5 sm:text-[11px] sm:font-semibold sm:text-slate-500 dark:sm:text-slate-400">
                  Architecture highlights
                </p>
                <ul class="space-y-2.5 text-[15px] leading-relaxed text-slate-800 dark:text-slate-100 sm:space-y-1 sm:text-xs sm:leading-snug sm:font-normal sm:text-slate-700 dark:sm:text-slate-200">
                  <li v-for="point in selectedProject.highlights" :key="point" class="flex gap-2 sm:gap-1.5">
                    <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500 dark:bg-cyan-400 sm:mt-1.5 sm:h-1 sm:w-1" />
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </article>
      </div>
    </Transition>

    <div
      v-if="imagePreview.src"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-4"
      @click="closeImagePreview"
    >
      <article
        class="relative w-full max-w-6xl rounded-2xl border border-cyan-300/25 bg-slate-950/95 p-4 shadow-[0_0_35px_rgba(34,211,238,0.2)]"
        @click.stop
      >
        <button
          type="button"
          class="absolute right-3 top-3 rounded-lg border border-white/20 bg-slate-900/90 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          @click="closeImagePreview"
        >
          Close
        </button>
        <div class="flex min-h-[60vh] items-center justify-center pt-8">
          <img
            :src="imagePreview.src"
            :alt="imagePreview.alt"
            class="h-auto max-h-[80vh] w-full object-contain"
          />
        </div>
      </article>
    </div>
  </section>
</template>

<script setup>
import { Icon } from '@iconify/vue'
import { onBeforeUnmount, onBeforeUpdate, onMounted, ref, watch } from 'vue'

const observer = ref(null)
const cardRefs = ref([])
const revealed = ref([])
const selectedProject = ref(null)
const imagePreview = ref({ src: '', alt: '' })

const setCardRef = (el) => {
  if (el) cardRefs.value.push(el)
}

const openProject = (project) => {
  selectedProject.value = project
}

const closeModal = () => {
  selectedProject.value = null
}

const openImagePreview = (src, alt) => {
  imagePreview.value = { src, alt }
}

const closeImagePreview = () => {
  imagePreview.value = { src: '', alt: '' }
}

const handleEscClose = (event) => {
  if (event.key !== 'Escape') return
  if (imagePreview.value.src) {
    closeImagePreview()
    return
  }
  if (selectedProject.value) closeModal()
}

const projects = [
  {
    label: 'Capstone Project',
    title: 'Payroll with Attendance System',
    image: '/payroll.png',
    description: 'An enterprise payroll and attendance platform with biometric validation and facial-recognition fallback checks.',
    problem:
      'Manual attendance tracking and payroll runs were slow to reconcile, easy to dispute, and weak on identity assurance—especially when teams work across shifts or sites.',
    howItWorks: [
      'Staff clock in with biometrics; the Java layer captures and validates fingerprints against enrolled templates before a session is accepted.',
      'If biometrics fail or need a second factor, Python-backed facial recognition compares live captures to stored embeddings and flags mismatches for review.',
      'Approved attendance events flow into the Laravel payroll service, where rules for shifts, overtime, absences, and pay periods produce runs and exports.',
      'MySQL holds employee, attendance, and payroll history so HR and finance can audit changes, regenerate reports, and keep compliance trails aligned.',
    ],
    stack: [
      {
        label: 'Java - Biometric fingerprint integration',
        icon: 'logos:java',
        iconClass: 'h-5 w-5 shrink-0',
      },
      {
        label: 'Python - Facial recognition processing',
        icon: 'simple-icons:python',
        iconClass: 'h-4 w-4 shrink-0 text-[#3776ab]',
      },
      {
        label: 'PHP/Laravel - Payroll backend system',
        icon: 'simple-icons:laravel',
        iconClass: 'h-4 w-4 shrink-0 text-[#ff2d20]',
      },
      {
        label: 'Database - Employee records storage',
        icon: 'simple-icons:mysql',
        iconClass: 'h-4 w-4 shrink-0 text-[#00618a]',
      },
    ],
    features: [
      'Biometric authentication',
      'Facial recognition backup',
      'Automated payroll',
      'Attendance monitoring',
      'Payroll reports',
    ],
    deepDive:
      'This system unifies attendance capture, identity validation, and payroll computation into a single operational pipeline for HR and finance teams.',
    highlights: [
      'Biometric and facial fallback flow with verification checkpoints',
      'Shift, overtime, and absence logic connected to payroll cycles',
      'Audit-focused exports for review, reporting, and compliance',
    ],
  },
  {
    label: 'AR Platform',
    title: 'NDDU Siena AR Campus Navigation System',
    image: '/nddu.png',
    description: 'A real-time AR campus navigation experience designed to guide students, visitors, and staff across key facilities.',
    problem:
      'Large campuses are hard to navigate with static maps alone; people need live, in-context guidance that matches where they are standing and where they are trying to go.',
    howItWorks: [
      'The Nuxt app loads building and path data from Supabase and keeps UI state for search, selected destinations, and route previews.',
      'WebXR layers anchor directions and markers in the camera view so walking routes feel grounded in the real environment, not just on a flat map.',
      'Supabase realtime channels push updates when routes or points of interest change, so reopening or sharing a session stays in sync.',
      'The client composes turn-by-turn cues, distance hints, and destination cards so visitors can move confidently between facilities.',
    ],
    stack: [
      {
        label: 'Nuxt - Frontend interface',
        icon: 'simple-icons:nuxtdotjs',
        iconClass: 'h-4 w-4 shrink-0 text-[#00dc82]',
      },
      {
        label: 'Supabase - Backend and database',
        icon: 'simple-icons:supabase',
        iconClass: 'h-4 w-4 shrink-0 text-[#3ecf8e]',
      },
      {
        label: 'WebXR - AR scene integration',
        icon: 'ph:cube-transparent-fill',
        iconClass: 'h-4 w-4 shrink-0 text-cyan-400',
      },
      {
        label: 'Realtime - Live path updates',
        icon: 'ph:radio-fill',
        iconClass: 'h-4 w-4 shrink-0 text-sky-400',
      },
    ],
    features: [
      'Augmented reality routes',
      'Campus wayfinding',
      'Real-time updates',
      'Building destination search',
      'On-site navigation cues',
    ],
    deepDive:
      'The platform combines geospatial routing and AR overlays so users can navigate large campus zones with contextual visual direction in real time.',
    highlights: [
      'Frontend route orchestration with Nuxt UI state management',
      'Supabase-backed location and route data synchronization',
      'WebXR overlays for immersive destination guidance',
    ],
  },
]

revealed.value = projects.map(() => false)

onBeforeUpdate(() => {
  cardRefs.value = []
})

onMounted(() => {
  observer.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const idx = Number(entry.target.getAttribute('data-index'))
        if (Number.isNaN(idx)) return
        revealed.value[idx] = entry.isIntersecting
      })
    },
    { threshold: 0.18, rootMargin: '0px 0px -8% 0px' }
  )

  cardRefs.value.forEach((card) => observer.value?.observe(card))
  window.addEventListener('keydown', handleEscClose)
})

onBeforeUnmount(() => {
  observer.value?.disconnect()
  window.removeEventListener('keydown', handleEscClose)
})

watch(selectedProject, (project) => {
  document.body.style.overflow = project || imagePreview.value.src ? 'hidden' : ''
})

watch(imagePreview, (preview) => {
  document.body.style.overflow = selectedProject.value || preview.src ? 'hidden' : ''
})
</script>

<style scoped>
.project-reveal {
  opacity: 0;
  transform: translateY(28px);
}

.project-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.project-reveal.is-visible:hover {
  transform: translateY(-4px);
}

.project-media {
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}

.project-reveal.is-visible .project-media {
  opacity: 1;
  transform: translateY(0);
}

.image-launch img {
  display: block;
  border-radius: inherit;
  transition: transform 0.35s ease;
}

.image-launch {
  display: block;
  line-height: 0;
  overflow: hidden;
  border-radius: inherit;
}

.project-modal-enter-active .project-modal-backdrop,
.project-modal-leave-active .project-modal-backdrop {
  transition: opacity 0.28s ease;
}

.project-modal-enter-from .project-modal-backdrop,
.project-modal-leave-to .project-modal-backdrop {
  opacity: 0;
}

.project-modal-enter-active .project-modal-panel,
.project-modal-leave-active .project-modal-panel {
  transition:
    opacity 0.3s ease,
    transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
}

.project-modal-enter-from .project-modal-panel,
.project-modal-leave-to .project-modal-panel {
  opacity: 0;
  transform: translateY(18px) scale(0.97);
}

@media (max-width: 639px) {
  .project-modal-enter-from .project-modal-panel,
  .project-modal-leave-to .project-modal-panel {
    transform: translateY(1.25rem) scale(0.98);
  }
}

.project-modal-mobile-card {
  border-radius: 0.75rem;
  border: 1px solid rgb(226 232 240 / 0.85);
  background-color: rgb(248 250 252 / 0.96);
  padding: 1rem;
  box-shadow: 0 1px 2px 0 rgb(15 23 42 / 0.04);
}

.dark .project-modal-mobile-card {
  border-color: rgb(255 255 255 / 0.1);
  background-color: rgb(15 23 42 / 0.55);
}

@media (min-width: 640px) {
  .project-modal-mobile-card {
    border-radius: 0;
    border-width: 0;
    background-color: transparent;
    padding: 0;
    box-shadow: none;
  }

  .dark .project-modal-mobile-card {
    background-color: transparent;
  }
}

</style>
