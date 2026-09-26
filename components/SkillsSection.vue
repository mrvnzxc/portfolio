<template>
  <section id="skills" class="section-band-b overflow-hidden">
    <div class="mx-auto max-w-6xl 2xl:max-w-7xl px-4">
      <div class="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4 reveal-on-scroll">
        <h2 class="mb-1 text-3xl font-semibold tracking-tight sm:text-4xl">Comfortable With</h2>
        <span class="section-tag self-end sm:self-auto">Tools in orbit</span>
      </div>

      <div class="grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <div class="order-2 reveal-on-scroll lg:order-1">
          <p class="max-w-md text-base leading-relaxed text-muted">
            The languages, frameworks, and tooling I build with day to day. Point at a ring to trace it.
          </p>
          <ul class="mt-6 space-y-2.5">
            <li v-for="ring in rings" :key="ring.id">
              <button
                type="button"
                class="orbit-legend"
                :class="{ 'is-active': activeRing === ring.id }"
                :style="{ '--ring': ring.color }"
                @mouseenter="activeRing = ring.id"
                @mouseleave="activeRing = null"
                @focus="activeRing = ring.id"
                @blur="activeRing = null"
                @click="activeRing = ring.id"
              >
                <span class="orbit-legend__swatch" aria-hidden="true" />
                <span class="min-w-0">
                  <span class="block font-display text-base font-semibold text-ink">{{ ring.name }}</span>
                  <span class="mt-0.5 block font-mono text-xs leading-relaxed text-muted">
                    <template v-for="(item, index) in ring.items" :key="item.name">
                      <span class="whitespace-nowrap">{{ item.name }}<span v-if="index < ring.items.length - 1" aria-hidden="true"> ·</span></span>{{ ' ' }}
                    </template>
                  </span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div class="order-1 reveal-on-scroll lg:order-2">
          <div class="orbit-stage">
            <!-- Ground Control only: centre lines and a degree dial on the outer ring -->
            <div class="orbit-axes" aria-hidden="true" />
            <div class="orbit-dial" aria-hidden="true" />

            <div class="orbit-core" aria-hidden="true">
              <span class="orbit-core__band orbit-core__band--back" />
              <span class="orbit-core__planet" />
              <span class="orbit-core__band orbit-core__band--front" />
            </div>

            <!-- Outer first so inner rings paint on top where chips pass close -->
            <ul
              v-for="ring in ringsOuterFirst"
              :key="ring.id"
              class="orbit-ring"
              :class="{ 'is-active': activeRing === ring.id, 'is-dimmed': activeRing && activeRing !== ring.id }"
              :style="{ '--ring': ring.color, '--size': ring.size, '--duration': ring.duration }"
              :aria-label="ring.name"
            >
              <li
                v-for="(item, index) in ring.items"
                :key="item.name"
                class="orbit-slot"
                :style="slotPosition(index, ring.items.length, ring.startAngle)"
              >
                <div class="orbit-counter">
                  <div class="orbit-body" :style="{ '--bob-delay': `${-((index * 1.37) % 5)}s` }">
                    <Icon :icon="item.icon" :class="item.iconClass" aria-hidden="true" />
                    <span class="orbit-label">{{ item.name }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, ref } from 'vue'

type RingId = 'languages' | 'frameworks' | 'tooling'

type Ring = {
  id: RingId
  name: string
  /** RGB triplet var from custom.css so the ring follows the active theme */
  color: string
  /** Diameter as a share of the stage */
  size: string
  /** Inner rings orbit faster, like real ones */
  duration: string
  startAngle: number
  items: { name: string; icon: string; iconClass?: string }[]
}

const rings: Ring[] = [
  {
    id: 'languages',
    name: 'Languages',
    color: 'var(--c-ion)',
    size: '46%',
    duration: '38s',
    startAngle: -90,
    items: [
      { name: 'Java', icon: 'logos:java' },
      { name: 'Python', icon: 'logos:python' },
      { name: 'JavaScript', icon: 'logos:javascript' },
      { name: 'PHP', icon: 'logos:php' },
      { name: 'TypeScript', icon: 'logos:typescript-icon' },
      { name: 'C++', icon: 'logos:c-plusplus' }
    ]
  },
  {
    id: 'frameworks',
    name: 'Frameworks',
    color: 'var(--c-nebula)',
    size: '71%',
    duration: '58s',
    startAngle: -64,
    items: [
      { name: 'Laravel', icon: 'logos:laravel' },
      { name: 'React / Next.js', icon: 'logos:react' },
      { name: 'Vue / Nuxt', icon: 'logos:nuxt-icon' },
      { name: 'Tailwind CSS', icon: 'logos:tailwindcss-icon' },
      { name: 'Spring Boot', icon: 'logos:spring-icon' },
      { name: 'Node.js', icon: 'logos:nodejs-icon' },
      { name: 'Flask', icon: 'simple-icons:flask', iconClass: 'text-ink' },
      { name: 'Express.js', icon: 'simple-icons:express', iconClass: 'text-ink' },
      { name: 'Angular', icon: 'logos:angular-icon' }
    ]
  },
  {
    id: 'tooling',
    name: 'Data & tooling',
    color: 'var(--c-solar)',
    size: '96%',
    duration: '84s',
    startAngle: -78,
    items: [
      { name: 'MySQL', icon: 'simple-icons:mysql', iconClass: 'text-[#00618a] dark:text-[#6fb3dd]' },
      { name: 'PostgreSQL', icon: 'logos:postgresql' },
      { name: 'Supabase', icon: 'logos:supabase-icon' },
      { name: 'GraphQL', icon: 'logos:graphql' },
      { name: 'PostGraphile', icon: 'logos:postgraphile' },
      { name: 'Docker', icon: 'logos:docker-icon' },
      { name: 'GitHub Actions', icon: 'logos:github-actions' },
      { name: 'OpenCV', icon: 'logos:opencv' },
      { name: 'Firebase', icon: 'logos:firebase-icon' },
      { name: 'RESTful APIs', icon: 'tabler:api', iconClass: 'text-ion' }
    ]
  }
]

const ringsOuterFirst = computed(() => [...rings].reverse())
const activeRing = ref<RingId | null>(null)

/** Point on the ring's circle, as a percentage of the ring box. */
function slotPosition(index: number, count: number, startAngle: number) {
  const angle = ((startAngle + (360 / count) * index) * Math.PI) / 180
  return {
    left: `${(50 + 50 * Math.cos(angle)).toFixed(3)}%`,
    top: `${(50 + 50 * Math.sin(angle)).toFixed(3)}%`
  }
}
</script>

<style scoped>
/* ---------- Legend ---------- */
.orbit-legend {
  display: flex;
  width: 100%;
  align-items: flex-start;
  gap: 0.9rem;
  border-radius: 0.9rem;
  border: 1px solid transparent;
  padding: 0.75rem 0.9rem;
  text-align: left;
  transition: border-color 0.25s ease, background-color 0.25s ease;
}

.orbit-legend:hover,
.orbit-legend.is-active {
  border-color: rgb(var(--ring) / 0.3);
  background-color: rgb(var(--ring) / 0.06);
}

.orbit-legend:focus-visible {
  outline: 2px solid rgb(var(--ring));
  outline-offset: 2px;
}

.orbit-legend__swatch {
  margin-top: 0.3rem;
  height: 0.85rem;
  width: 0.85rem;
  flex-shrink: 0;
  border-radius: 999px;
  border: 2px solid rgb(var(--ring));
}

html.dark .orbit-legend__swatch {
  box-shadow: 0 0 10px rgb(var(--ring) / 0.55);
}

/* ---------- Stage ---------- */
.orbit-stage {
  container-type: inline-size;
  --chip: clamp(34px, 9.5cqi, 54px);
  position: relative;
  margin-inline: auto;
  aspect-ratio: 1;
  /* Leave room for outer-ring chips, which overhang the stage by half a chip */
  width: min(calc(100% - 2.25rem), 560px);
}

/* ---------- Ground Control drafting marks (hidden in space) ---------- */
.orbit-axes {
  --cl: rgb(var(--c-ink) / 0.22);
  position: absolute;
  inset: 0;
  pointer-events: none;
  /* Dash-dot centre lines, as on an engineering drawing */
  background:
    repeating-linear-gradient(90deg, var(--cl) 0 14px, transparent 14px 18px, var(--cl) 18px 20px, transparent 20px 24px) center / 100% 1px no-repeat,
    repeating-linear-gradient(180deg, var(--cl) 0 14px, transparent 14px 18px, var(--cl) 18px 20px, transparent 20px 24px) center / 1px 100% no-repeat;
}

/* Protractor ticks along the inside of the outer ring: every 5°, longer every 30° */
.orbit-dial {
  position: absolute;
  inset: 2%;
  border-radius: 50%;
  pointer-events: none;
}

.orbit-dial::before,
.orbit-dial::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
}

.orbit-dial::before {
  background: repeating-conic-gradient(from -0.2deg, rgb(var(--c-ink) / 0.35) 0 0.4deg, transparent 0.4deg 5deg);
  mask: radial-gradient(closest-side, transparent calc(100% - 6px), #000 calc(100% - 6px));
}

.orbit-dial::after {
  background: repeating-conic-gradient(from -0.3deg, rgb(var(--c-ink) / 0.7) 0 0.6deg, transparent 0.6deg 30deg);
  mask: radial-gradient(closest-side, transparent calc(100% - 13px), #000 calc(100% - 13px));
}

html.dark .orbit-axes,
html.dark .orbit-dial {
  display: none;
}

/* ---------- Central planet with a tilted band ---------- */
.orbit-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 22%;
  aspect-ratio: 1;
  translate: -50% -50%;
  isolation: isolate;
}

.orbit-core__planet {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 50%;
  /* Ground Control: a section-hatched circle */
  background:
    repeating-linear-gradient(-45deg, rgb(var(--c-ink) / 0.4) 0 1px, transparent 1px 6px),
    #fff;
  box-shadow: 0 0 0 1.5px rgb(var(--c-ink));
}

html.dark .orbit-core__planet {
  background:
    radial-gradient(circle at 32% 28%, rgb(255 255 255 / 0.5), transparent 24%),
    radial-gradient(circle at 36% 36%, #9584fb 0%, #5239b8 42%, #1d1745 76%, #0b0a26 100%);
  box-shadow:
    0 0 0 1px rgb(165 148 255 / 0.3),
    0 0 70px -8px rgb(122 102 240 / 0.7),
    inset -12px -16px 28px rgb(4 6 15 / 0.6);
}

.orbit-core__band {
  position: absolute;
  left: -25%;
  top: 36%;
  width: 150%;
  height: 28%;
  border-radius: 50%;
  border: 1.5px solid rgb(var(--c-ink) / 0.8);
  rotate: -18deg;
}

html.dark .orbit-core__band {
  border: 2px solid rgb(var(--c-ion) / 0.55);
}

.orbit-core__band--back {
  z-index: 0;
  clip-path: inset(0 0 50% 0);
}

.orbit-core__band--front {
  z-index: 2;
  clip-path: inset(50% 0 0 0);
}

html.dark .orbit-core__band--front {
  box-shadow: 0 6px 12px -6px rgb(var(--c-ion) / 0.5);
}

/* ---------- Rings ---------- */
.orbit-ring {
  position: absolute;
  left: calc((100% - var(--size)) / 2);
  top: calc((100% - var(--size)) / 2);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  border: 1px solid rgb(var(--ring) / 0.45);
  pointer-events: none;
  animation: orbit-spin var(--duration) linear infinite;
  transition: opacity 0.35s ease, border-color 0.35s ease;
}

html.dark .orbit-ring {
  border-color: rgb(var(--ring) / 0.2);
}

.orbit-ring.is-active {
  border-color: rgb(var(--ring));
  border-width: 1.5px;
}

html.dark .orbit-ring.is-active {
  border-width: 1px;
  border-color: rgb(var(--ring) / 0.55);
  box-shadow: 0 0 30px -10px rgb(var(--ring) / 0.5), inset 0 0 30px -14px rgb(var(--ring) / 0.5);
}

.orbit-ring.is-dimmed {
  opacity: 0.22;
}

.orbit-ring:has(.orbit-body:hover) {
  z-index: 5;
}

.orbit-slot {
  position: absolute;
  width: 0;
  height: 0;
}

/* Spins against the ring so icons stay upright */
.orbit-counter {
  position: absolute;
  left: calc(var(--chip) / -2);
  top: calc(var(--chip) / -2);
  width: var(--chip);
  height: var(--chip);
  animation: orbit-spin var(--duration) linear infinite reverse;
}

.orbit-body {
  position: relative;
  display: grid;
  height: 100%;
  width: 100%;
  place-items: center;
  border-radius: 50%;
  border: 1px solid rgb(var(--ring) / 0.75);
  --chip-bg: #fff;
  --chip-shadow: none;
  background: var(--chip-bg);
  box-shadow: var(--chip-shadow);
  pointer-events: auto;
  cursor: default;
  animation: orbit-bob 5s ease-in-out infinite;
  animation-delay: var(--bob-delay, 0s);
  transition: box-shadow 0.25s ease, border-color 0.25s ease, scale 0.25s ease;
}

/* Only swaps variables, so :hover below still wins in dark mode */
html.dark .orbit-body {
  border-color: rgb(var(--ring) / 0.4);
  --chip-bg: radial-gradient(circle at 35% 30%, rgb(30 38 80 / 0.95), rgb(10 14 34 / 0.95));
  --chip-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.08),
    0 0 18px -6px rgb(var(--ring) / 0.55);
}

.orbit-body :deep(svg) {
  width: 52%;
  height: 52%;
}

/* Ground Control: hovering "selects" the chip like a CAD object */
.orbit-body:hover {
  scale: 1.12;
  border-style: dashed;
  border-color: rgb(var(--c-ion));
}

html.dark .orbit-body:hover {
  scale: 1.14;
  border-style: solid;
  border-color: rgb(var(--ring) / 0.9);
  box-shadow: 0 0 26px -4px rgb(var(--ring) / 0.8);
}

.orbit-label {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  translate: -50% 4px;
  white-space: nowrap;
  border-radius: 2px;
  border: 1px solid rgb(var(--c-ink));
  background: #fff;
  padding: 0.2rem 0.6rem;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgb(var(--c-ink));
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, translate 0.2s ease;
}

html.dark .orbit-label {
  border-radius: 999px;
  border-color: rgb(var(--ring) / 0.45);
  background: rgb(4 6 15 / 0.92);
}

.orbit-body:hover .orbit-label {
  opacity: 1;
  translate: -50% 0;
}

/* Hold the whole system still while an icon is being read */
.orbit-stage:has(.orbit-body:hover) :is(.orbit-ring, .orbit-counter, .orbit-body) {
  animation-play-state: paused;
}

@keyframes orbit-spin {
  to {
    rotate: 360deg;
  }
}

@keyframes orbit-bob {
  0%,
  100% {
    translate: 0 -3px;
  }
  50% {
    translate: 0 3px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .orbit-ring,
  .orbit-counter,
  .orbit-body {
    animation: none;
  }
}
</style>
