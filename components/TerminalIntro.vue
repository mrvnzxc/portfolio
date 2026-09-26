<template>
  <div
    class="term-intro"
    :class="{ 'term-intro--leaving': leaving }"
    role="status"
    aria-live="polite"
    aria-label="Loading portfolio"
  >
    <!-- Backdrop: drifting stars + faint telemetry streams, like a mission console -->
    <div class="term-bg" aria-hidden="true">
      <div class="term-stars term-stars--far" />
      <div class="term-stars term-stars--near" />
      <pre class="term-telemetry term-telemetry--left">{{ telemetry }}{{ telemetry }}</pre>
      <pre class="term-telemetry term-telemetry--right">{{ telemetryAlt }}{{ telemetryAlt }}</pre>
    </div>

    <div class="term-window">
      <div class="term-window__bar" aria-hidden="true">
        <span class="term-window__title"><span class="term-window__icon">&gt;_</span>C:\portfolio\launch.cmd</span>
        <span class="term-window__controls"><span>—</span><span>☐</span><span>✕</span></span>
      </div>

      <div class="term-window__body">
        <pre class="term-screen"><template v-for="(line, index) in lines" :key="index"><span
          class="term-line"
        ><span v-if="line.prompt" class="tone-prompt">{{ line.prompt }}</span><span
          v-for="(seg, s) in line.segs"
          :key="s"
          :class="seg.tone ? `tone-${seg.tone}` : undefined"
        >{{ seg.text }}</span><span v-if="index === lines.length - 1" class="term-cursor" aria-hidden="true" /></span>
</template></pre>

        <div class="term-rocket" :class="{ 'is-ignited': ignited, 'is-launching': liftoff }" aria-hidden="true">
          <div class="term-rocket__craft">
            <pre class="term-rocket__body">{{ ROCKET }}</pre>
            <div class="term-rocket__flame">
              <pre class="term-rocket__flame-frame">{{ FLAME_A }}</pre>
              <pre class="term-rocket__flame-frame">{{ FLAME_B }}</pre>
            </div>
          </div>
          <pre class="term-rocket__pad">{{ PAD }}</pre>
        </div>
      </div>

      <div class="term-window__status" aria-hidden="true">
        <span>Press any key to skip</span>
        <span>MET {{ missionClock }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const emit = defineEmits<{ complete: [] }>()

type Tone = 'dim' | 'ok' | 'accent' | 'prompt' | 'hero'
type Seg = { text: string; tone?: Tone }
type Line = { prompt?: string; segs: Seg[] }

const ROCKET = [
  '       /\\',
  '      /  \\',
  '     /    \\',
  '    |  /\\  |',
  '    | (  ) |',
  '    |  \\/  |',
  '    |      |',
  '    |  JM  |',
  '    |      |',
  '   /|  ||  |\\',
  '  / |  ||  | \\',
  ' /__|__||__|__\\',
  '     /____\\'
].join('\n')
const FLAME_A = ['      (  )', '     ( )( )', '      )  (', '       ()'].join('\n')
const FLAME_B = ['     ( )( )', '      (  )', '       )(', '      (  )'].join('\n')
const PAD = '  ═══════════════'

/* Faint readouts streaming behind the window */
const makeTelemetry = (seed: number) =>
  Array.from({ length: 48 }, (_, i) => {
    const n = (i * 7919 + seed * 104729) % 9973
    const hex = (n * 2654435761 >>> 0).toString(16).slice(0, 6).padStart(6, '0').toUpperCase()
    const pwr = (90 + (n % 100) / 10).toFixed(1)
    const sig = -(40 + (n % 37))
    return `0x${hex}  PWR ${pwr}%  SIG ${sig}dBm  T+${String(i).padStart(3, '0')}`
  }).join('\n') + '\n'
const telemetry = makeTelemetry(1)
const telemetryAlt = makeTelemetry(7)

const lines = ref<Line[]>([])
const leaving = ref(false)
const ignited = ref(false)
const liftoff = ref(false)
const elapsed = ref(0)
const missionClock = computed(() => `00:00:${String(elapsed.value).padStart(2, '0')}`)

let skipped = false
let finished = false
let pendingTimer: ReturnType<typeof setTimeout> | undefined
let clockTimer: ReturnType<typeof setInterval> | undefined
let wake: (() => void) | undefined

/* Waits that collapse to zero once the visitor skips */
const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    if (skipped) return resolve()
    wake = resolve
    pendingTimer = setTimeout(resolve, ms)
  })

const print = (line: Line) => {
  lines.value.push(line)
}
const blank = () => print({ segs: [{ text: '' }] })
const current = () => lines.value[lines.value.length - 1]

/** Types a command after the prompt, one character at a time */
async function typeCommand(prompt: string, command: string) {
  print({ prompt, segs: [{ text: '' }] })
  const seg = current().segs[0]
  for (const char of command) {
    seg.text += char
    await sleep(16 + Math.random() * 12)
  }
  await sleep(160)
}

/** " [ OK ] Fueling rocket ........ 3 projects" */
function check(label: string, value: string) {
  print({
    segs: [
      { text: ' [ ', tone: 'dim' },
      { text: 'OK', tone: 'ok' },
      { text: ' ] ', tone: 'dim' },
      { text: `${label} ${'.'.repeat(Math.max(3, 22 - label.length))} ` },
      { text: value, tone: 'accent' }
    ]
  })
}

function manifest(key: string, value: string, tone?: Tone) {
  print({ segs: [{ text: ` ${key.padEnd(10)}`, tone: 'dim' }, { text: value, tone }] })
}

async function run() {
  const space = document.documentElement.classList.contains('dark')
  const now = new Date()
  const year = now.getFullYear()

  print({ segs: [{ text: `JMB Portfolio [Version ${year}.${now.getMonth() + 1}]` }] })
  print({ segs: [{ text: `(c) ${year} John Marvin Bautista. All rights reserved.`, tone: 'dim' }] })
  blank()
  await sleep(140)

  await typeCommand('C:\\Users\\marvin>', 'cd portfolio')
  await typeCommand('C:\\Users\\marvin\\portfolio>', `launch --mission=${space ? 'space-adventure' : 'ground-control'}`)
  blank()

  manifest('Mission', space ? 'SPACE ADVENTURE' : 'GROUND CONTROL BRIEFING', 'hero')
  await sleep(70)
  manifest('Pilot', 'John Marvin Bautista')
  await sleep(70)
  manifest('Crew', 'you')
  blank()
  await sleep(130)

  /* Counts match the page: 3 projects, 25 tools in the Skills orbit, 4 awards in About */
  check('Fueling rocket', '3 projects')
  await sleep(90)
  check('Charting the orbit', '25 tools')
  await sleep(90)
  check('Polishing trophies', '4 awards')
  await sleep(90)
  ignited.value = true
  check('Checking oxygen', 'nominal')
  await sleep(90)
  check('Buckling your seatbelt', 'click')
  blank()
  await sleep(150)

  print({ segs: [{ text: space ? ' Get ready for a space adventure!' : ' Get ready, Ground Control is on the line!', tone: 'hero' }] })
  print({ segs: [{ text: ' T-minus ', tone: 'dim' }] })
  for (const tick of ['3', '2', '1']) {
    current().segs.push({ text: `${tick}.. `, tone: 'accent' })
    await sleep(220)
  }
  current().segs.push({ text: 'LIFTOFF', tone: 'hero' })
  liftoff.value = true
  await sleep(550)

  finish()
}

function finish() {
  if (finished) return
  finished = true
  leaving.value = true
  pendingTimer = setTimeout(() => emit('complete'), skipped ? 220 : 450)
}

function skip() {
  if (skipped) return
  skipped = true
  if (pendingTimer) clearTimeout(pendingTimer)
  wake?.()
}

onMounted(() => {
  window.addEventListener('keydown', skip)
  window.addEventListener('pointerdown', skip)
  clockTimer = setInterval(() => (elapsed.value += 1), 1000)
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) skipped = true
  void run()
})

onBeforeUnmount(() => {
  if (pendingTimer) clearTimeout(pendingTimer)
  if (clockTimer) clearInterval(clockTimer)
  window.removeEventListener('keydown', skip)
  window.removeEventListener('pointerdown', skip)
})
</script>

<style scoped>
.term-intro {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 1rem;
  background: radial-gradient(ellipse 90% 70% at 50% 110%, #1b1446 0%, #070913 55%, #04050b 100%);
  color: #d6dae3;
  font-family: 'IBM Plex Mono', ui-monospace, 'Cascadia Mono', Consolas, monospace;
  transition: opacity 0.45s ease;
}

.term-intro--leaving {
  opacity: 0;
}

/* ---------- Backdrop ---------- */
.term-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.term-stars {
  position: absolute;
  inset: calc(var(--tile) * -1) 0 0 0;
  background-size: var(--tile) var(--tile);
  animation: term-drift var(--speed) linear infinite;
}

/* Stars stream downward: the ship is climbing */
.term-stars--far {
  --tile: 360px;
  --speed: 38s;
  opacity: 0.55;
  background-image:
    radial-gradient(1px 1px at 20px 40px, #fff, transparent 70%),
    radial-gradient(1px 1px at 140px 90px, #cfe0ff, transparent 70%),
    radial-gradient(1px 1px at 260px 20px, #fff, transparent 70%),
    radial-gradient(1px 1px at 330px 200px, #fff, transparent 70%),
    radial-gradient(1px 1px at 90px 250px, #ffe6c7, transparent 70%),
    radial-gradient(1px 1px at 200px 320px, #fff, transparent 70%);
}

.term-stars--near {
  --tile: 240px;
  --speed: 14s;
  opacity: 0.8;
  background-image:
    radial-gradient(1.5px 1.5px at 30px 60px, #fff, transparent 70%),
    radial-gradient(1.2px 1.2px at 180px 130px, #cfe0ff, transparent 70%),
    radial-gradient(1.5px 1.5px at 110px 210px, #fff, transparent 70%);
}

@keyframes term-drift {
  to {
    transform: translateY(var(--tile));
  }
}

.term-telemetry {
  position: absolute;
  top: 0;
  margin: 0;
  font-family: inherit;
  font-size: 11px;
  line-height: 1.9;
  color: #6ee7f9;
  opacity: 0.09;
  white-space: pre;
  animation: term-stream 26s linear infinite;
}

.term-telemetry--left {
  left: 1.5rem;
}

.term-telemetry--right {
  right: 1.5rem;
  text-align: right;
  animation-duration: 34s;
}

/* Narrow screens: one stream, or the two overlap into noise */
@media (max-width: 767px) {
  .term-telemetry--right {
    display: none;
  }
}

/* Content is doubled, so scrolling by half loops seamlessly */
@keyframes term-stream {
  to {
    transform: translateY(-50%);
  }
}

/* ---------- Window ---------- */
.term-window {
  position: relative;
  display: flex;
  width: min(100%, 980px);
  max-height: min(92vh, 680px);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgb(255 255 255 / 0.12);
  border-radius: 10px;
  background: rgb(8 10 18 / 0.86);
  box-shadow:
    0 0 0 1px rgb(0 0 0 / 0.5),
    0 30px 80px -20px rgb(0 0 0 / 0.9),
    0 0 90px -30px rgb(110 231 249 / 0.35);
  backdrop-filter: blur(6px);
}

.term-window__bar,
.term-window__status {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.9rem;
  font-size: 11px;
  letter-spacing: 0.05em;
  color: rgb(214 218 227 / 0.55);
}

.term-window__bar {
  border-bottom: 1px solid rgb(255 255 255 / 0.08);
  background: rgb(255 255 255 / 0.03);
}

.term-window__title {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.term-window__icon {
  border-radius: 3px;
  background: rgb(110 231 249 / 0.15);
  padding: 0 0.3rem;
  color: #6ee7f9;
}

.term-window__controls {
  display: inline-flex;
  gap: 1.1rem;
}

.term-window__status {
  border-top: 1px solid rgb(255 255 255 / 0.08);
  font-variant-numeric: tabular-nums;
}

.term-window__body {
  position: relative;
  display: flex;
  min-height: 0;
  flex: 1;
  gap: 2rem;
  overflow: hidden;
  padding: 1.1rem 1rem;
}

/* CRT scanlines + edge vignette over the screen */
.term-window__body::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    repeating-linear-gradient(to bottom, rgb(255 255 255 / 0.028) 0 1px, transparent 1px 3px),
    radial-gradient(ellipse at center, transparent 55%, rgb(0 0 0 / 0.35) 100%);
}

.term-screen {
  margin: 0;
  min-width: 0;
  flex: 1;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  text-shadow: 0 0 6px rgb(214 218 227 / 0.18);
}

@media (min-width: 768px) {
  .term-window__bar,
  .term-window__status {
    padding: 0.55rem 1.25rem;
  }

  .term-window__body {
    padding: 1.6rem 2rem;
  }

  .term-screen {
    font-size: 14px;
  }
}

.tone-dim {
  color: rgb(214 218 227 / 0.5);
}

.tone-prompt {
  color: #f4f6fb;
}

.tone-ok {
  color: #6ee7f9;
  text-shadow: 0 0 8px rgb(110 231 249 / 0.55);
}

.tone-accent {
  color: #fcc766;
}

.tone-hero {
  color: #b3a8ff;
  font-weight: 500;
  text-shadow: 0 0 10px rgb(165 148 255 / 0.6);
}

.term-cursor {
  display: inline-block;
  width: 0.6em;
  height: 1.1em;
  margin-left: 1px;
  vertical-align: text-bottom;
  background: currentColor;
  animation: term-blink 1s steps(1) infinite;
}

@keyframes term-blink {
  50% {
    opacity: 0;
  }
}

/* ---------- ASCII rocket ---------- */
.term-rocket {
  display: none;
  flex-shrink: 0;
  align-self: flex-end;
  flex-direction: column;
  align-items: flex-start;
  /* Room under the pad for the exhaust */
  padding-bottom: 3.6em;
  font-size: 14px;
  line-height: 1.15;
}

@media (min-width: 768px) {
  .term-rocket {
    display: flex;
  }
}

.term-rocket pre {
  margin: 0;
  font-family: inherit;
}

/* Body + flame travel together; the rocket rests on the pad until liftoff */
.term-rocket__craft {
  position: relative;
  z-index: 1;
  transition: transform 0.75s cubic-bezier(0.55, 0, 0.8, 0.2);
}

.term-rocket__body {
  color: #d6dae3;
  text-shadow: 0 0 8px rgb(214 218 227 / 0.25);
}

.term-rocket__flame {
  position: absolute;
  top: 100%;
  left: 0;
  display: grid;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.term-rocket__flame-frame {
  grid-area: 1 / 1;
  color: #ff8a3d;
  text-shadow: 0 0 10px rgb(255 138 61 / 0.8);
  animation: term-flicker 0.24s steps(1) infinite;
}

.term-rocket__flame-frame + .term-rocket__flame-frame {
  color: #fcc766;
  animation-delay: 0.12s;
}

@keyframes term-flicker {
  50% {
    opacity: 0;
  }
}

.term-rocket.is-ignited .term-rocket__flame {
  opacity: 1;
}

.term-rocket.is-ignited .term-rocket__body {
  animation: term-rumble 0.12s linear infinite;
}

/* Liftoff: the craft climbs out of the window */
.term-rocket.is-launching .term-rocket__craft {
  transform: translateY(-120vh);
}

.term-rocket.is-launching .term-rocket__body {
  animation: none;
}

@keyframes term-rumble {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(0.5px, -0.5px);
  }
}

.term-rocket__pad {
  color: rgb(214 218 227 / 0.45);
}

@media (prefers-reduced-motion: reduce) {
  .term-stars,
  .term-telemetry,
  .term-cursor,
  .term-rocket__flame-frame,
  .term-rocket.is-ignited .term-rocket__body {
    animation: none;
  }
}
</style>
