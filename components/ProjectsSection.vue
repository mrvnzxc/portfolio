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

    <div
      v-if="selectedProject"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
      @click="closeModal"
    >
      <article
        class="launch-modal relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.25)] ring-1 ring-white/50 dark:border-cyan-300/30 dark:bg-slate-950 dark:shadow-[0_0_34px_rgba(34,211,238,0.18)] dark:ring-cyan-200/20"
        @click.stop
      >
        <Icon
          icon="ph:sun-fill"
          class="pointer-events-none absolute left-[46%] top-6 z-10 text-[38px] text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.65)]"
          aria-hidden="true"
        />
        <Icon
          icon="ph:planet-fill"
          class="pointer-events-none absolute left-7 top-[40%] z-10 text-[28px] text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]"
          aria-hidden="true"
        />
        <Icon
          icon="ph:meteor-fill"
          class="pointer-events-none absolute left-[34%] -bottom-3 z-10 text-[52px] text-amber-300 drop-shadow-[0_0_14px_rgba(252,211,77,0.45)]"
          aria-hidden="true"
        />
        <Icon
          icon="ph:planet-fill"
          class="pointer-events-none absolute right-7 bottom-[36%] z-10 text-[40px] text-orange-400 drop-shadow-[0_0_12px_rgba(251,146,60,0.45)]"
          aria-hidden="true"
        />
        <Icon
          icon="ph:planet-fill"
          class="pointer-events-none absolute right-20 bottom-16 z-10 text-[24px] text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.45)]"
          aria-hidden="true"
        />
        <Icon
          icon="ph:rocket-launch-fill"
          class="pointer-events-none absolute left-5 top-36 z-10 -rotate-12 text-[24px] text-slate-200 drop-shadow-[0_0_8px_rgba(125,211,252,0.5)]"
          aria-hidden="true"
        />
        <Icon
          icon="ph:rocket-launch-fill"
          class="pointer-events-none absolute right-14 top-20 z-10 rotate-12 text-[24px] text-slate-200 drop-shadow-[0_0_8px_rgba(125,211,252,0.5)]"
          aria-hidden="true"
        />

        <header class="z-10 flex items-start justify-between gap-4 border-b border-slate-200/80 bg-white/95 p-5 dark:border-white/10 dark:bg-slate-950/95">
          <div>
            <p class="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Launch Console
            </p>
            <p class="text-xs font-semibold tracking-[0.08em] text-primary-600 dark:text-cyan-300">
              {{ selectedProject.label }}
            </p>
            <h3 class="mt-1 text-2xl font-semibold tracking-tight">{{ selectedProject.title }}</h3>
          </div>
          <button
            type="button"
            class="rounded-lg border border-slate-300/80 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:border-white/15 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            @click="closeModal"
          >
            Close
          </button>
        </header>

        <div class="relative z-10 grid gap-0 lg:grid-cols-[46%_54%]">
          <div class="border-b border-slate-200/80 p-6 dark:border-white/10 lg:border-b-0 lg:border-r">
            <div class="space-y-4">
              <div class="flex min-h-[260px] items-center justify-center sm:min-h-[320px]">
                <button
                  type="button"
                  class="image-launch image-frame w-full overflow-hidden rounded-2xl border border-slate-300/85 bg-slate-100/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.65),0_10px_20px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-slate-700/90 dark:bg-slate-900/90 dark:shadow-[inset_0_1px_0_rgba(148,163,184,0.2),0_12px_24px_rgba(2,6,23,0.5)] dark:focus-visible:ring-cyan-300"
                  :aria-label="`Expand ${selectedProject.title} preview image`"
                  @click="openImagePreview(selectedProject.image, selectedProject.title)"
                >
                  <img
                    :src="selectedProject.image"
                    :alt="selectedProject.title"
                    class="h-auto max-h-[520px] w-full rounded-xl border border-slate-300/70 object-contain dark:border-slate-700/80"
                    loading="lazy"
                  />
                </button>
              </div>

              <div class="relative overflow-hidden rounded-xl border border-slate-300/70 bg-gradient-to-br from-slate-100/80 to-slate-200/50 p-3 dark:border-white/15 dark:from-slate-900/85 dark:to-slate-950/80">
                <Icon
                  icon="ph:astronaut-fill"
                  class="floating-astronaut pointer-events-none absolute left-3 top-2 text-5xl text-cyan-300/85 drop-shadow-[0_0_10px_rgba(34,211,238,0.45)]"
                  aria-hidden="true"
                />
                <Icon
                  icon="ph:rocket-launch-fill"
                  class="pointer-events-none absolute right-3 top-2 rotate-[12deg] text-2xl text-slate-200/85 drop-shadow-[0_0_8px_rgba(125,211,252,0.35)]"
                  aria-hidden="true"
                />
                <div class="relative z-10 mt-10 grid grid-cols-2 gap-2">
                  <div class="inline-flex items-center gap-1 rounded-md border border-slate-300/80 bg-white/85 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-700 dark:border-white/15 dark:bg-slate-950/75 dark:text-slate-200">
                    <Icon icon="ph:drop-fill" class="text-cyan-500 dark:text-cyan-300" />
                    Fuel 100%
                  </div>
                  <div class="inline-flex items-center gap-1 rounded-md border border-slate-300/80 bg-white/85 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-700 dark:border-white/15 dark:bg-slate-950/75 dark:text-slate-200">
                    <Icon icon="ph:crosshair-fill" class="text-emerald-500 dark:text-emerald-300" />
                    Nav Locked
                  </div>
                  <div class="inline-flex items-center gap-1 rounded-md border border-slate-300/80 bg-white/85 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-700 dark:border-white/15 dark:bg-slate-950/75 dark:text-slate-200">
                    <Icon icon="ph:check-circle-fill" class="text-lime-500 dark:text-lime-300" />
                    Status Ready
                  </div>
                  <div class="inline-flex items-center gap-1 rounded-md border border-slate-300/80 bg-white/85 px-2 py-1 text-[10px] font-semibold tracking-wide text-slate-700 dark:border-white/15 dark:bg-slate-950/75 dark:text-slate-200">
                    <Icon icon="ph:rocket-fill" class="text-orange-500 dark:text-orange-300" />
                    Rocket Armed
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="space-y-5 p-6 sm:p-8">
            <p class="inline-flex items-center gap-2 rounded-full border border-orange-300/70 bg-orange-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-orange-700 dark:border-orange-300/30 dark:bg-orange-400/10 dark:text-orange-200">
              <span aria-hidden="true">🚀</span> Rocket Mission Brief
            </p>
            <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {{ selectedProject.description }}
            </p>
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Deep Dive</p>
              <p class="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{{ selectedProject.deepDive }}</p>
            </div>
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tech Stack</p>
              <ul class="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
                <li
                  v-for="item in selectedProject.stack"
                  :key="item.label"
                  class="flex items-center gap-2 border-b border-slate-200/70 pb-1 last:border-b-0 dark:border-white/10"
                >
                  <Icon :icon="item.icon" :class="item.iconClass" />
                  <span>{{ item.label }}</span>
                </li>
              </ul>
            </div>
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Architecture Highlights</p>
              <ul class="space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
                <li v-for="point in selectedProject.highlights" :key="point" class="border-b border-slate-200/70 pb-1 last:border-b-0 dark:border-white/10">
                  {{ point }}
                </li>
              </ul>
            </div>
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Key Features</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="feature in selectedProject.features"
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

.floating-astronaut {
  animation: astronautFloat 3.2s ease-in-out infinite;
}

@keyframes astronautFloat {
  0%,
  100% {
    transform: translateY(0) rotate(-4deg);
  }
  50% {
    transform: translateY(-8px) rotate(4deg);
  }
}

</style>
