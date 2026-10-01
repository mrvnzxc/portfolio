<template>
  <section id="experience" class="section-band-b">
    <!-- Pinned while the jobs glide (useExperienceGlide); no class binding here, the composable owns `is-glide` -->
    <div ref="stage" class="xp-stage">
      <div class="mx-auto w-full max-w-6xl 2xl:max-w-7xl px-4">
        <div class="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 reveal-on-scroll">
          <h2 class="mb-1 text-3xl font-semibold tracking-tight sm:text-4xl">Flight Log</h2>
          <span class="section-tag self-end sm:self-auto">Work experience</span>
        </div>

        <!-- Space: a glowing flight path. Ground Control: a dimension line with end ticks. -->
        <div class="xp-rail" aria-hidden="true">
          <span class="xp-rail__base" />
          <span class="xp-rail__fill" />
          <span
            v-for="(job, index) in jobs"
            :key="job.org"
            class="xp-node"
            :class="{
              'is-on': index <= step,
              'xp-node--first': index === 0,
              'xp-node--last': index === jobs.length - 1
            }"
            :style="{ left: `${(index / (jobs.length - 1)) * 100}%` }"
          >
            <span class="xp-node__dot" />
            <span class="xp-node__date">{{ job.railDate }}</span>
            <span class="xp-node__name">{{ job.railName }}</span>
          </span>
        </div>

        <div class="xp-window">
          <ol class="xp-track">
            <li v-for="(job, index) in jobs" :key="job.org" class="xp-slide">
              <article class="space-panel xp-card" :class="{ 'xp-card--now': job.current }">
                <div class="xp-card__body">
                  <p class="xp-meta">
                    <span v-if="job.current" class="pill xp-pill">Current</span>
                    <span>{{ job.period }}</span>
                    <span v-if="job.kind">· {{ job.kind }}</span>
                  </p>
                  <h3 class="xp-role">{{ job.role }}</h3>
                  <p class="xp-org">{{ job.org }} · {{ job.orgDetail }}</p>
                  <p class="xp-summary">{{ job.summary }}</p>
                  <ul class="xp-duties">
                    <li v-for="duty in job.duties" :key="duty">{{ duty }}</li>
                  </ul>
                </div>

                <!-- Ground Control: each job is a numbered drawing sheet, like the project cards -->
                <dl class="gc-titleblock xp-titleblock dark:hidden">
                  <div><dt>Sheet</dt><dd>{{ String(index + 1).padStart(2, '0') }} / {{ String(jobs.length).padStart(2, '0') }}</dd></div>
                  <div><dt>Period</dt><dd>{{ job.period }}</dd></div>
                  <div><dt>Status</dt><dd>{{ job.status }}</dd></div>
                </dl>
              </article>
            </li>
          </ol>
        </div>

        <div class="xp-foot" aria-hidden="true">
          <span>{{ String(step + 1).padStart(2, '0') }} / {{ String(jobs.length).padStart(2, '0') }}</span>
          <span class="xp-hint" :class="{ 'is-done': step === jobs.length - 1 }">Scroll to go back in time →</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useExperienceGlide } from '~/composables/useExperienceGlide'

/* Newest first. Job descriptions only: what the role is, not which projects were built there. */
const jobs = [
  {
    role: 'Junior Software Developer',
    org: 'Brigada Distribution Incorporated',
    orgDetail: 'Central Support Group',
    period: 'Aug 2026 – Present',
    railDate: 'Aug 2026 – Now',
    railName: 'Brigada',
    current: true,
    status: 'Current',
    summary: "I build internal applications that help Brigada's departments and business units automate their workflows.",
    duties: ['Design and develop apps that replace manual, repetitive tasks with automated workflows.']
  },
  {
    role: 'Intern Web Developer',
    org: 'Dean IT Services',
    orgDetail: 'General Santos City',
    period: 'Jan – Apr 2026',
    railDate: 'Jan – Apr 2026',
    railName: 'Dean IT Services',
    kind: 'Internship',
    status: 'Completed',
    summary: 'A web development internship where I learned modern frameworks by working on real company projects.',
    duties: [
      'Learned React and other modern frameworks on the job.',
      "Helped develop landing pages for the company's SaaS projects."
    ]
  }
]

const introContentReady = useIntroContentReady()
const stage = ref<HTMLElement | null>(null)
/* Index of the job in view; every job counts as reached until the glide takes over */
const step = ref(jobs.length - 1)

const { init, destroy } = useExperienceGlide(stage, (index) => {
  step.value = index
})

let started = false
function start() {
  if (started || !introContentReady.value) return
  started = true
  void init()
}

onMounted(() => {
  if (introContentReady.value) nextTick(() => requestAnimationFrame(start))
})

watch(introContentReady, (ready) => {
  if (ready) nextTick(() => requestAnimationFrame(start))
})

onBeforeUnmount(destroy)
</script>

<style scoped>
/* ---------- Layout: static row by default, one job per view while gliding ---------- */
.xp-stage {
  --xp-progress: 1;
}

.xp-stage.is-glide {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: calc(100vh - var(--header-h));
  min-height: calc(100svh - var(--header-h));
  padding-block: 1.25rem;
}

.xp-track {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 768px) {
  .xp-track {
    grid-auto-columns: minmax(0, 1fr);
    grid-auto-flow: column;
  }
}

.is-glide .xp-window {
  overflow: hidden;
}

.is-glide .xp-track {
  display: flex;
  gap: 0;
  will-change: transform;
}

/* Room for Ground Control's crop marks, which sit just outside each sheet */
.xp-slide {
  padding: 10px;
}

.is-glide .xp-slide {
  flex: 0 0 100%;
}

/* ---------- Rail ---------- */
.xp-rail {
  position: relative;
  height: 3.6rem;
  margin: 1.25rem 10px 0.5rem;
}

/* A horizontal path over cards stacked on a phone means nothing; it shows once they sit side by side */
@media (max-width: 767px) {
  .xp-stage:not(.is-glide) .xp-rail {
    display: none;
  }
}

.xp-rail__base,
.xp-rail__fill {
  position: absolute;
  top: 6px;
  left: 0;
  right: 0;
  height: 2px;
}

.xp-rail__fill {
  transform: scaleX(var(--xp-progress));
  transform-origin: left center;
}

.xp-node {
  position: absolute;
  top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  transform: translateX(-50%);
}

.xp-node--first {
  align-items: flex-start;
  transform: none;
}

.xp-node--last {
  align-items: flex-end;
  transform: translateX(-100%);
}

.xp-node__dot {
  width: 14px;
  height: 14px;
  margin-bottom: 0.15rem;
  border-radius: 50%;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

.xp-node__date {
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgb(var(--c-muted));
  transition: color 0.3s ease;
}

.xp-node__name {
  font-size: 12px;
  white-space: nowrap;
  color: rgb(var(--c-ink) / 0.7);
}

/* ---------- Card ---------- */
.xp-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1.25rem 1.4rem;
}

/* Keeps the title block on the sheet's bottom edge when a neighbour job is taller */
.xp-card__body {
  flex: 1 0 auto;
}

@media (min-width: 1024px) {
  .is-glide .xp-card {
    padding: 1.6rem 1.9rem;
  }

  .is-glide .xp-role {
    font-size: 1.6rem;
  }
}

.xp-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgb(var(--c-muted));
}

.xp-pill {
  padding: 0.2rem 0.6rem;
  font-size: 10px;
  letter-spacing: 0.14em;
}

.xp-role {
  margin-top: 0.6rem;
  font-size: 1.35rem;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.xp-org {
  margin-top: 0.3rem;
  font-size: 0.9rem;
  color: rgb(var(--c-ion));
}

.xp-summary {
  margin-top: 0.9rem;
  font-size: 0.95rem;
  line-height: 1.65;
  color: rgb(var(--c-ink) / 0.82);
}

.xp-duties {
  margin-top: 0.6rem;
}

.xp-duties li {
  position: relative;
  margin-top: 0.4rem;
  padding-left: 1rem;
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgb(var(--c-ink) / 0.78);
}

.xp-duties li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.62em;
  width: 5px;
  height: 5px;
}

/* Flush with the sheet's bottom edge, the way a title block sits on a drawing */
.xp-titleblock {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 1.25rem -1.4rem -1.25rem;
  border-width: 1px 0 0;
}

@media (min-width: 1024px) {
  .is-glide .xp-titleblock {
    margin: 1.6rem -1.9rem -1.6rem;
  }
}

.xp-foot {
  display: none;
}

.is-glide .xp-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin: 0.25rem 10px 0;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgb(var(--c-muted));
}

.xp-hint {
  transition: opacity 0.4s ease;
}

.xp-hint.is-done {
  opacity: 0;
}

/* Short phones: tighter spacing so a whole job still fits on screen while the stage is pinned */
@media (max-width: 767px) and (max-height: 760px) {
  .xp-stage.is-glide {
    padding-block: 0.5rem;
  }

  .is-glide .xp-rail {
    height: 2.5rem;
    margin-top: 0.75rem;
  }

  .is-glide .xp-node__name {
    display: none;
  }

  .is-glide .xp-card {
    padding: 1rem 1.1rem;
  }

  .is-glide .xp-titleblock {
    margin: 1rem -1.1rem -1rem;
  }

  .is-glide .xp-summary {
    margin-top: 0.6rem;
    line-height: 1.55;
  }

  .is-glide .xp-duties li {
    margin-top: 0.25rem;
    line-height: 1.5;
  }
}

/* ---------- Space ---------- */
html.dark .xp-rail__base {
  border-radius: 2px;
  background: rgb(var(--c-nebula) / 0.2);
}

html.dark .xp-rail__fill {
  border-radius: 2px;
  background: linear-gradient(90deg, rgb(var(--c-ion)), rgb(var(--c-nebula)));
  box-shadow: 0 0 10px rgb(var(--c-ion) / 0.55);
}

html.dark .xp-node__dot {
  border: 2px solid rgb(var(--c-nebula) / 0.55);
  background: #04060f;
}

html.dark .xp-node.is-on .xp-node__dot {
  border-color: rgb(var(--c-ion));
  background: rgb(var(--c-ion));
  box-shadow:
    0 0 0 4px rgb(var(--c-ion) / 0.16),
    0 0 14px rgb(var(--c-ion));
}

html.dark .xp-node.is-on .xp-node__date {
  color: rgb(var(--c-ion));
}

html.dark .xp-card--now {
  border-color: rgb(var(--c-ion) / 0.35);
  background: linear-gradient(135deg, rgb(var(--c-ion) / 0.08), transparent 55%), var(--panel-bg);
}

html.dark .xp-duties li::before {
  border-radius: 50%;
  background: rgb(var(--c-ion));
  box-shadow: 0 0 6px rgb(var(--c-ion) / 0.8);
}

/* ---------- Ground Control ---------- */
html:not(.dark) .xp-rail__base {
  top: 6.5px;
  height: 1px;
  background: rgb(var(--c-ink) / 0.55);
}

/* Dimension-line end ticks */
html:not(.dark) .xp-rail__base::before,
html:not(.dark) .xp-rail__base::after {
  content: '';
  position: absolute;
  top: -6px;
  width: 1px;
  height: 13px;
  background: rgb(var(--c-ink) / 0.7);
}

html:not(.dark) .xp-rail__base::before {
  left: 0;
}

html:not(.dark) .xp-rail__base::after {
  right: 0;
}

html:not(.dark) .xp-rail__fill {
  background: rgb(var(--c-ion));
}

html:not(.dark) .xp-node__dot {
  border: 1.5px solid rgb(var(--c-ink));
  background: #fff;
}

html:not(.dark) .xp-node.is-on .xp-node__dot {
  background: var(--signal);
  box-shadow:
    0 0 0 3px #fff,
    0 0 0 4px rgb(var(--c-ink) / 0.5);
}

html:not(.dark) .xp-node.is-on .xp-node__date {
  font-weight: 600;
  color: rgb(var(--c-ink));
}

html:not(.dark) .xp-duties li::before {
  background: var(--signal);
}

@media (prefers-reduced-motion: reduce) {
  .xp-node__dot,
  .xp-node__date,
  .xp-hint {
    transition: none;
  }
}
</style>
