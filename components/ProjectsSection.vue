<template>
  <section
    id="projects"
    ref="sectionRoot"
    class="section-band-a featured-projects relative !py-7 sm:!py-9 pb-9 sm:pb-12"
  >
    <!-- overflow only on decorative layer — overflow-hidden on section breaks lg:sticky preview -->
    <div
      class="pointer-events-none absolute inset-0 overflow-hidden opacity-40 dark:opacity-30"
      aria-hidden="true"
    >
      <div
        class="absolute -left-1/4 top-0 h-[min(400px,50vh)] w-[min(546px,72vw)] rounded-full bg-gradient-to-br from-primary-400/25 via-sky-400/15 to-transparent blur-3xl dark:from-cyan-500/20 dark:via-primary-600/10"
      />
      <div
        class="absolute -right-1/4 bottom-0 h-[min(357px,44vh)] w-[min(462px,66vw)] rounded-full bg-gradient-to-tl from-violet-400/20 via-primary-500/10 to-transparent blur-3xl dark:from-violet-500/15 dark:via-cyan-600/10"
      />
    </div>

    <div class="relative mx-auto max-w-6xl px-4">
      <!-- Same row layout as GallerySection: title left, label right (text-primary-600) -->
      <div
        class="mb-4 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 reveal-on-scroll sm:mb-5"
      >
        <h2 class="mb-1 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          Mission Control Projects
        </h2>
        <span
          class="self-end text-right text-xs font-semibold uppercase tracking-wide text-primary-600 sm:self-auto sm:text-left sm:text-sm"
        >
          Featured projects
        </span>
      </div>

      <!-- GSAP stacking cards — desktop & mobile (same scroll logic) -->
      <div ref="stackStage" class="projects-stack-stage">
        <div class="projects-stack-cards">
          <div
            v-for="project in visibleProjects"
            :key="project.title"
            class="projects-card-wrapper"
          >
            <article
              role="button"
              tabindex="0"
              class="projects-stack-card project-card group relative flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/75 bg-white/55 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.12),inset_0_1px_0_0_rgba(255,255,255,0.75)] outline-none ring-1 ring-white/60 backdrop-blur-xl hover:border-cyan-500/35 hover:shadow-[0_22px_50px_-14px_rgba(15,23,42,0.18),0_0_40px_-8px_rgba(34,211,238,0.22),inset_0_1px_0_0_rgba(255,255,255,0.85)] focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 dark:border-cyan-500/15 dark:bg-slate-950/50 dark:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.06)] dark:ring-white/5 dark:hover:border-cyan-400/40 dark:hover:shadow-[0_26px_56px_-12px_rgba(0,0,0,0.55),0_0_48px_-6px_rgba(34,211,238,0.18)] dark:focus-visible:ring-cyan-400 dark:focus-visible:ring-offset-slate-950 lg:min-h-[400px] lg:flex-row"
              :aria-label="`View project: ${project.title}`"
              @click="openProject(project)"
              @keydown.enter.prevent="openProject(project)"
              @keydown.space.prevent="openProject(project)"
            >
              <div
                class="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden="true"
              >
                <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-400/25 via-sky-500/15 to-transparent blur-2xl dark:from-cyan-400/20 dark:via-violet-500/12" />
                <div class="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-tr from-violet-500/15 to-transparent blur-2xl dark:from-violet-500/12" />
              </div>
              <div
                class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-80 dark:via-cyan-300/35"
                aria-hidden="true"
              />

              <div class="relative aspect-[16/9] w-full shrink-0 overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-slate-100/90 to-slate-50/80 dark:border-white/10 dark:from-slate-900/80 dark:to-slate-950/90 lg:aspect-auto lg:h-[400px] lg:w-[63%] lg:border-b-0 lg:border-r">
                <img
                  :src="project.image"
                  :alt="project.title"
                  class="h-full w-full object-contain object-center p-5 transition duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  loading="lazy"
                />
              </div>

              <div class="relative flex min-h-0 flex-1 flex-col justify-center gap-2.5 p-5 lg:py-6">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <span class="inline-flex max-w-[72%] items-center rounded-full border border-primary-500/20 bg-primary-500/[0.08] px-2.5 py-0.5 text-[10px] font-semibold uppercase leading-tight tracking-wide text-primary-700 dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-200/95">
                    {{ project.label }}
                  </span>
                  <span class="shrink-0 text-[10px] font-medium tabular-nums text-slate-500 dark:text-slate-400">
                    {{ project.year }} · {{ project.phase }}
                  </span>
                </div>

                <h3 class="text-lg font-semibold leading-snug tracking-tight text-slate-900 dark:text-white sm:text-xl">
                  {{ project.title }}
                </h3>
                <p class="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {{ project.description }}
                </p>

                <div class="flex flex-wrap gap-1.5">
                  <span
                    v-for="item in project.stack"
                    :key="item.label"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/80 bg-white/90 shadow-sm transition group-hover:border-cyan-500/25 dark:border-white/10 dark:bg-slate-900/85 dark:group-hover:border-cyan-400/30"
                    :title="item.label"
                  >
                    <Icon :icon="item.icon" :class="[item.iconClass, 'h-4 w-4']" />
                  </span>
                </div>

                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="feature in project.features.slice(0, 3)"
                    :key="feature"
                    class="rounded-md border border-slate-200/80 bg-slate-50/95 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:border-slate-600/45 dark:bg-slate-800/85 dark:text-slate-200"
                  >
                    {{ feature }}
                  </span>
                </div>

                <div class="mt-1 flex pt-1">
                  <span class="inline-flex items-center gap-1.5 rounded-lg bg-slate-900/[0.04] px-2.5 py-1.5 text-xs font-semibold text-primary-600 ring-1 ring-slate-200/80 transition group-hover:bg-primary-600/10 group-hover:ring-cyan-500/30 dark:bg-white/[0.06] dark:text-cyan-300 dark:ring-white/10 dark:group-hover:bg-cyan-400/10 dark:group-hover:ring-cyan-400/25">
                    View details
                    <Icon icon="ph:arrow-right-bold" class="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
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
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <span class="tabular-nums text-slate-700 dark:text-slate-200">{{ selectedProject.year }}</span>
                · {{ selectedProject.phase }}
              </p>
              <p class="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-600 dark:text-cyan-300">
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
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useProjectStackScroll } from '~/composables/useProjectStackScroll'

const introContentReady = useIntroContentReady()
const sectionRoot = ref(null)
const stackStage = ref(null)
const selectedProject = ref(null)
const imagePreview = ref({ src: '', alt: '' })

const { init: initProjectStackScroll, bind: bindProjectStackScroll } = useProjectStackScroll(stackStage)
let unbindProjectStackScroll = null
let stackInitialized = false

function setupProjectStackScroll() {
  if (stackInitialized || !introContentReady.value) return
  stackInitialized = true
  unbindProjectStackScroll = bindProjectStackScroll()
  void initProjectStackScroll()
}

/** If intersection never fired, unstick only nodes that are already on screen (avoids forcing off-screen cards visible). */
function nudgeRevealIfStuckInView() {
  const vh = window.innerHeight
  sectionRoot.value?.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    if (el.classList.contains('is-visible')) return
    const r = el.getBoundingClientRect()
    const inView = r.top < vh * 0.92 && r.bottom > vh * 0.08
    if (inView) el.classList.add('is-visible')
  })
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
    year: '2025',
    phase: 'Capstone',
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
      'Government benefits monitoring',
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
    year: '2026',
    phase: 'Innovation project',
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
  {
    year: '2026',
    phase: 'Production client system',
    label: 'Merchandising Suite',
    title: 'ReedGrey Sales and Inventory System',
    image: '/sales.png',
    description:
      'A multi-branch sales and inventory platform that centralizes product movement, checkout, and reporting in one operational dashboard.',
    problem:
      'The system reduces manual product checking and spreadsheet reconciliation, while giving teams real-time visibility of stock and sales across branches.',
    howItWorks: [
      'Nuxt/Vue interfaces handle branch-level workflows for cataloging, stock intake, checkout, and sales review in a single connected experience.',
      'Supabase auth enforces role-based access so cashiers, staff, and admins only see actions relevant to their responsibilities.',
      'Inventory and transaction records are synced in Supabase, allowing branches to track stock levels, transfers, and low-stock states without manual tallying.',
      'POS transactions update inventory counts instantly and feed branch-by-branch sales summaries for faster daily and weekly decision making.',
    ],
    stack: [
      {
        label: 'Nuxt/Vue - Application frontend',
        icon: 'simple-icons:nuxtdotjs',
        iconClass: 'h-4 w-4 shrink-0 text-[#00dc82]',
      },
      {
        label: 'Tailwind CSS - UI styling system',
        icon: 'simple-icons:tailwindcss',
        iconClass: 'h-4 w-4 shrink-0 text-[#38bdf8]',
      },
      {
        label: 'Supabase - Database and Auth',
        icon: 'simple-icons:supabase',
        iconClass: 'h-4 w-4 shrink-0 text-[#3ecf8e]',
      },
      {
        label: 'POS Module - Checkout and sales processing',
        icon: 'ph:shopping-cart-fill',
        iconClass: 'h-4 w-4 shrink-0 text-emerald-400',
      },
    ],
    features: [
      'Product cataloging',
      'Inventory stocking',
      'Point-of-sale (POS)',
      'Cross-branch sales tracking',
      'Sales reporting',
      'Team management',
      'Inventory monitoring',
    ],
    deepDive:
      'The platform links catalog, stock, and POS flows so inventory movement and sales outcomes stay synchronized per branch without manual reconciliation cycles.',
    highlights: [
      'Branch-aware stock visibility and movement tracking',
      'Unified catalog + POS operations in one interface',
      'Supabase-backed auth and data consistency for operational controls',
    ],
  },
]

const visibleProjects = projects

onMounted(() => {
  window.addEventListener('keydown', handleEscClose)
  window.setTimeout(nudgeRevealIfStuckInView, 2000)

  if (introContentReady.value) {
    nextTick(() => requestAnimationFrame(() => setupProjectStackScroll()))
  }
})

watch(introContentReady, (ready) => {
  if (!ready) return
  nextTick(() => requestAnimationFrame(() => setupProjectStackScroll()))
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleEscClose)
  unbindProjectStackScroll?.()
})

watch(selectedProject, (project) => {
  document.body.style.overflow = project || imagePreview.value.src ? 'hidden' : ''
})

watch(imagePreview, (preview) => {
  document.body.style.overflow = selectedProject.value || preview.src ? 'hidden' : ''
})
</script>

<style scoped>
.projects-stack-stage {
  width: 100%;
  padding-top: 1rem;
  padding-bottom: 4rem;
}

.projects-stack-cards {
  width: 100%;
  margin: 0 auto;
}

.projects-card-wrapper {
  width: 100%;
  perspective: 500px;
  margin-bottom: 1.25rem;
  position: relative;
}

.projects-card-wrapper:last-child {
  margin-bottom: 0;
}

@media (min-width: 1024px) {
  .projects-stack-stage {
    padding-top: 1.5rem;
    padding-bottom: 6rem;
  }

  .projects-card-wrapper {
    margin-bottom: 3rem;
  }

  .projects-stack-card {
    will-change: transform;
    backface-visibility: hidden;
  }
}

@media (max-width: 1023px) {
  .projects-stack-stage {
    padding-top: 0.75rem;
    padding-bottom: 3rem;
  }

  .projects-card-wrapper {
    perspective: 500px;
    margin-bottom: 2.5rem;
  }

  .projects-stack-card {
    will-change: transform;
    backface-visibility: hidden;
  }
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
