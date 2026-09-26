<template>
  <!-- Ground Control (light) counterpart to the starfield: a plotter drafting mission figures on the paper -->
  <div ref="layer" class="plotter-layer" aria-hidden="true" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

type Kind = 'guide' | 'ink' | 'detail'
type Note = { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end' }
type Figure = {
  /** Continues the numbering from the hero photo, which is FIG. 1 */
  fig: number
  name: string
  w: number
  h: number
  /** Construction lines [x1, y1, x2, y2, solid?] — dash-dot unless solid (dimension lines) */
  guides: [number, number, number, number, 1?][]
  ink: string[]
  detail: string[]
  notes: Note[]
}

const SVG_NS = 'http://www.w3.org/2000/svg'
const INK = '#0f1b2d'
const BLUE = '#1d4ed8'
const SIGNAL = '#ff5a1f'
const PENCIL = '#56657a'
/** On-screen drawing speed per stroke kind, px per second */
const SPEED: Record<Kind, number> = { guide: 420, ink: 170, detail: 230 }
const HOLD_MS = 6500
const ERASE_MS = 1400
const MAX_DRAWINGS_STATIC = 12

const circle = (cx: number, cy: number, r: number) =>
  `M${cx + r} ${cy} A${r} ${r} 0 1 1 ${cx - r} ${cy} A${r} ${r} 0 1 1 ${cx + r} ${cy}`

const FIGURES: Figure[] = [
  {
    fig: 2,
    name: 'Launch vehicle',
    w: 150,
    h: 262,
    guides: [
      [60, 2, 60, 236],
      [100, 8, 116, 8, 1],
      [100, 226, 116, 226, 1],
      [108, 8, 108, 226, 1]
    ],
    ink: [
      'M60 8 Q76 30 76 70 L76 196 L44 196 L44 70 Q44 30 60 8 Z',
      'M44 172 L26 208 L26 222 L44 206',
      'M76 172 L94 208 L94 222 L76 206',
      'M50 196 L46 222 Q60 228 74 222 L70 196'
    ],
    detail: ['M44 70 H76', 'M44 122 H76', 'M44 164 H76', circle(60, 95, 5), 'M52 140 H68'],
    notes: [{ x: 113, y: 120, text: '42 m' }]
  },
  {
    fig: 3,
    name: 'Transfer orbit',
    w: 260,
    h: 190,
    guides: [
      [130, 4, 130, 166],
      [44, 85, 216, 85]
    ],
    ink: [circle(130, 85, 16), 'M172 85 A58 55.7 0 0 0 56 85'],
    detail: [circle(130, 85, 42), circle(130, 85, 74), 'M114 85 A16 5 0 0 0 146 85', circle(172, 85, 3), circle(56, 85, 3)],
    notes: [
      { x: 178, y: 78, text: 'ΔV1' },
      { x: 50, y: 78, text: 'ΔV2', anchor: 'end' }
    ]
  },
  {
    fig: 4,
    name: 'Comm satellite',
    w: 260,
    h: 150,
    guides: [
      [130, 8, 130, 122],
      [12, 75, 248, 75]
    ],
    ink: ['M110 50 H150 V100 H110 Z', 'M20 58 H92 V92 H20 Z', 'M168 58 H240 V92 H168 Z', 'M114 32 Q130 50 146 32'],
    detail: [
      'M92 75 H110', 'M150 75 H168',
      'M38 58 V92', 'M56 58 V92', 'M74 58 V92',
      'M186 58 V92', 'M204 58 V92', 'M222 58 V92',
      'M130 41 V50', 'M130 41 V23', circle(130, 20, 2.5),
      'M116 62 H144', 'M116 88 H144'
    ],
    notes: [{ x: 150, y: 24, text: 'HGA' }]
  },
  {
    fig: 5,
    name: 'Descent capsule',
    w: 180,
    h: 196,
    guides: [
      [90, 14, 90, 150],
      [56, 150, 56, 172, 1],
      [124, 150, 124, 172, 1],
      [56, 166, 124, 166, 1]
    ],
    ink: ['M60 130 L78 50 L102 50 L120 130 Z', 'M56 130 Q90 150 124 130', 'M82 50 V40 H98 V50'],
    detail: ['M84 68 H96 V80 H84 Z', 'M71 95 H109', 'M66 114 H114'],
    notes: [{ x: 90, y: 162, text: 'Ø 3.9 m', anchor: 'middle' }]
  },
  {
    fig: 6,
    name: 'Nozzle, section A–A',
    w: 200,
    h: 180,
    guides: [[100, 6, 100, 160]],
    ink: [
      'M60 20 L60 58 Q60 70 86 82 Q70 110 40 150',
      'M140 20 L140 58 Q140 70 114 82 Q130 110 160 150',
      'M50 20 L50 60 Q50 76 78 90 Q62 118 30 150',
      'M150 20 L150 60 Q150 76 122 90 Q138 118 170 150',
      'M50 20 H150',
      'M30 150 H40', 'M160 150 H170'
    ],
    detail: [
      'M50 32 L60 26', 'M50 44 L60 38', 'M50 56 L60 50',
      'M150 32 L140 26', 'M150 44 L140 38', 'M150 56 L140 50',
      'M86 82 H114'
    ],
    notes: [{ x: 126, y: 86, text: 'THROAT' }]
  },
  {
    fig: 7,
    name: 'Orbital station',
    w: 280,
    h: 150,
    guides: [
      [10, 70, 270, 70],
      [140, 10, 140, 132]
    ],
    ink: [
      'M30 64 H250 V76 H30 Z',
      'M112 52 H168 V88 H112 Z',
      'M84 58 H112 V82 H84 Z',
      'M168 60 H190 V80 H168 Z',
      'M34 16 H62 V62 H34 Z', 'M34 78 H62 V124 H34 Z',
      'M218 16 H246 V62 H218 Z', 'M218 78 H246 V124 H218 Z'
    ],
    detail: [
      'M30 76 L40 64 L50 76 L60 64 L70 76 L80 64',
      'M190 64 L200 76 L210 64 L220 76 L230 64 L240 76 L250 64',
      'M34 32 H62', 'M34 47 H62', 'M34 94 H62', 'M34 109 H62',
      'M218 32 H246', 'M218 47 H246', 'M218 94 H246', 'M218 109 H246',
      circle(140, 70, 6)
    ],
    notes: [{ x: 112, y: 46, text: 'HAB MODULE' }]
  },
  {
    fig: 8,
    name: 'Lunar lander',
    w: 200,
    h: 190,
    guides: [
      [100, 8, 100, 158],
      [20, 160, 180, 160, 1]
    ],
    ink: [
      'M64 96 H136 L146 110 V124 L136 136 H64 L54 124 V110 Z',
      'M74 96 L78 60 L96 48 H118 L126 60 L126 96',
      'M60 130 L34 158', 'M140 130 L166 158',
      'M26 158 H42', 'M158 158 H174',
      'M92 136 L88 150 H112 L108 136'
    ],
    detail: ['M100 62 H114 V74 H100 Z', 'M64 116 L40 150', 'M136 116 L160 150', 'M86 48 L80 32', circle(80, 29, 3), 'M64 110 H136'],
    notes: [
      { x: 132, y: 56, text: 'ASCENT' },
      { x: 150, y: 128, text: 'DESCENT' }
    ]
  },
  {
    fig: 9,
    name: 'Surface rover',
    w: 240,
    h: 150,
    guides: [
      [10, 124, 230, 124, 1],
      [120, 10, 120, 124]
    ],
    ink: [
      'M56 70 H184 V96 H56 Z',
      'M48 62 H192 V70 H48 Z',
      circle(70, 112, 12), circle(120, 112, 12), circle(170, 112, 12),
      'M160 62 V36',
      'M150 24 H176 V36 H150 Z'
    ],
    detail: [
      'M70 112 L96 96', 'M120 112 V96', 'M170 112 L144 96',
      circle(70, 112, 3), circle(120, 112, 3), circle(170, 112, 3),
      'M76 62 L72 42', circle(72, 39, 3)
    ],
    notes: [{ x: 180, y: 22, text: 'MASTCAM' }]
  },
  {
    fig: 10,
    name: 'Planet, section B–B',
    w: 200,
    h: 196,
    guides: [
      [100, 6, 100, 176],
      [14, 90, 186, 90]
    ],
    ink: [circle(100, 90, 70), circle(100, 90, 46), circle(100, 90, 20)],
    detail: [
      'M88 80 L110 102', 'M84 90 L100 106', 'M100 74 L116 90',
      'M150 40 L178 22', 'M143 74 L176 62', 'M112 98 L178 118'
    ],
    notes: [
      { x: 198, y: 18, text: 'CRUST', anchor: 'end' },
      { x: 198, y: 57, text: 'MANTLE', anchor: 'end' },
      { x: 198, y: 128, text: 'CORE', anchor: 'end' }
    ]
  },
  {
    fig: 11,
    name: 'Ascent trajectory',
    w: 280,
    h: 170,
    guides: [
      [30, 140, 270, 140, 1],
      [30, 140, 30, 14, 1]
    ],
    ink: ['M34 138 Q60 60 140 36 T262 24'],
    detail: [
      circle(73.5, 73.5, 3), circle(140, 36, 3),
      'M140 40 V140',
      'M80 140 V146', 'M130 140 V146', 'M180 140 V146', 'M230 140 V146',
      'M30 100 H24', 'M30 60 H24', 'M30 20 H24'
    ],
    notes: [
      { x: 80, y: 70, text: 'MAX-Q' },
      { x: 146, y: 30, text: 'MECO' },
      { x: 270, y: 156, text: 'DOWNRANGE', anchor: 'end' },
      { x: 36, y: 12, text: 'ALT' }
    ]
  },
  {
    fig: 12,
    name: 'Ground station',
    w: 200,
    h: 200,
    guides: [
      [20, 176, 180, 176, 1],
      [75, 115, 150, 40]
    ],
    ink: [
      'M50 60 Q60 130 130 140',
      'M50 60 L118 72', 'M130 140 L118 72',
      circle(118, 72, 4),
      'M86 124 L96 150',
      'M84 176 L92 150 H108 L116 176',
      'M70 176 H130'
    ],
    detail: ['M100 150 V176', 'M72 176 L66 184', 'M88 176 L82 184', 'M104 176 L98 184', 'M120 176 L114 184'],
    notes: [
      { x: 126, y: 66, text: 'FEED' },
      { x: 140, y: 168, text: 'GS-1' }
    ]
  },
  {
    fig: 13,
    name: 'Star field, Orion',
    w: 200,
    h: 200,
    guides: [
      [10, 100, 190, 100],
      [100, 8, 100, 184]
    ],
    ink: [
      'M60 40 L100 22 L140 48',
      'M60 40 L86 100', 'M140 48 L114 92',
      'M86 100 L100 96 L114 92',
      'M86 100 L72 160', 'M114 92 L148 150'
    ],
    detail: [
      circle(60, 40, 4), circle(140, 48, 3), circle(100, 22, 2),
      circle(86, 100, 2.5), circle(100, 96, 2.5), circle(114, 92, 2.5),
      circle(72, 160, 3), circle(148, 150, 4)
    ],
    notes: [
      { x: 52, y: 34, text: 'α ORI', anchor: 'end' },
      { x: 156, y: 158, text: 'β ORI' }
    ]
  },
  {
    fig: 14,
    name: 'Orrery',
    w: 260,
    h: 200,
    guides: [
      [130, 6, 130, 180],
      [16, 93, 244, 93]
    ],
    ink: [circle(130, 93, 12)],
    detail: [
      circle(130, 93, 28), circle(130, 93, 46), circle(130, 93, 64), circle(130, 93, 84),
      circle(154.2, 79, 3), circle(86.8, 77.3, 4), circle(162, 148.4, 3.5), circle(88, 20.3, 5),
      'M79 21 A9 3 0 0 0 97 20'
    ],
    notes: [{ x: 100, y: 14, text: 'SATURN' }]
  }
]

/** Everything the plotter must not draw behind */
const CONTENT_SELECTOR = [
  'header', 'footer',
  'main h1', 'main h2', 'main h3', 'main p', 'main ul', 'main dl', 'main form', 'main img',
  '.space-panel', '.projects-stack-card', '.orbit-stage', '.gallery-viewport', '.profile-planet',
  '.section-tag', '.btn-thrust', '.btn-hull', '.pill'
].join(',')

type Stroke = {
  el: SVGPathElement | SVGLineElement
  len: number
  start: number
  dur: number
  line?: [number, number, number, number]
  complete: boolean
}

type Drawing = {
  figure: Figure
  svg: SVGSVGElement
  strokes: Stroke[]
  pen: SVGGElement
  readout: SVGTextElement
  labels: SVGGElement
  left: number
  top: number
  w: number
  h: number
  s: number
  drawEnd: number
  holdEnd: number
  eraseEnd: number
}

type Box = { l: number; t: number; r: number; b: number }

const layer = ref<HTMLDivElement | null>(null)
const introContentReady = useIntroContentReady()

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const pad4 = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, '0')

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>) {
  const el = document.createElementNS(SVG_NS, tag)
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, String(value))
  return el
}

onMounted(() => {
  const root = layer.value
  if (!root) return

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let drawings: Drawing[] = []
  let queue: Figure[] = []
  let raf = 0
  let running = false
  let nextSpawn = 0

  /* Several pens at once: 3 on wide screens, 2 elsewhere */
  const maxActive = () => (window.innerWidth >= 1280 ? 3 : 2)
  const targetSize = () => (window.innerWidth >= 1280 ? 240 : window.innerWidth >= 768 ? 200 : 150)

  const nextFigure = () => {
    const busy = new Set(drawings.map((d) => d.figure.fig))
    for (let i = 0; i < FIGURES.length; i += 1) {
      if (!queue.length) queue = [...FIGURES].sort(() => Math.random() - 0.5)
      const candidate = queue.shift()!
      if (!busy.has(candidate.fig)) return candidate
    }
    return null
  }

  const occupied = (): Box[] => {
    const vh = window.innerHeight
    const boxes: Box[] = []
    document.querySelectorAll(CONTENT_SELECTOR).forEach((el) => {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0 || r.bottom < -60 || r.top > vh + 60) return
      let { left, top, right, bottom } = r
      let pad = 22
      if (el.classList.contains('profile-planet')) {
        /* Its orbit, centre-line ticks and dimension line reach well past the photo */
        left -= r.width * 0.3
        right += r.width * 0.3
        top -= r.height * 0.25
        bottom += r.height * 0.5
      } else if (el.classList.contains('orbit-stage')) {
        pad = 34
      }
      boxes.push({ l: left - pad, t: top - pad, r: right + pad, b: bottom + pad })
    })
    const origin = root.getBoundingClientRect()
    drawings.forEach((d) => {
      boxes.push({ l: origin.left + d.left - 28, t: origin.top + d.top - 28, r: origin.left + d.left + d.w + 28, b: origin.top + d.top + d.h + 28 })
    })
    return boxes
  }

  const overlapArea = (x: number, y: number, w: number, h: number, boxes: Box[]) => {
    let area = 0
    for (const b of boxes) {
      const ow = Math.min(x + w, b.r) - Math.max(x, b.l)
      const oh = Math.min(y + h, b.b) - Math.max(y, b.t)
      if (ow > 0 && oh > 0) area += ow * oh
    }
    return area
  }

  /** Find an empty patch of paper inside the viewport; returns viewport coords + scale */
  const findSpot = (figure: Figure) => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    /* The header scrolls away with the page, so its bottom can be far above the viewport */
    const headerBottom = Math.max(0, document.getElementById('top-nav')?.getBoundingClientRect().bottom ?? 0)
    const boxes = occupied()
    const baseScale = targetSize() / Math.max(figure.w, figure.h)

    for (const factor of [1, 0.8, 0.65, 0.5]) {
      const s = baseScale * factor
      const w = figure.w * s
      const h = figure.h * s
      const minX = 10
      const maxX = vw - w - 10
      const minY = headerBottom + 10
      const maxY = vh - h - 10
      if (maxX <= minX || maxY <= minY) continue

      /* Scan the whole viewport on a 16px grid and pick at random among the empty spots */
      const spots: { x: number; y: number }[] = []
      const allowed = w * h * 0.02
      for (let y = minY; y <= maxY; y += 16) {
        for (let x = minX; x <= maxX; x += 16) {
          if (overlapArea(x, y, w, h, boxes) <= allowed) spots.push({ x, y })
        }
      }
      if (spots.length) return { ...spots[Math.floor(Math.random() * spots.length)], s, w, h }
    }
    return null
  }

  const build = (figure: Figure, left: number, top: number, s: number, now: number, animate: boolean): Drawing => {
    const w = figure.w * s
    const h = figure.h * s
    const svg = svgEl('svg', { viewBox: `0 0 ${figure.w} ${figure.h}`, width: w, height: h, class: 'plotter-fig' })
    svg.style.left = `${left}px`
    svg.style.top = `${top}px`
    root.appendChild(svg)

    const strokes: Stroke[] = []
    let t = now + 250
    const schedule = (el: Stroke['el'], kind: Kind, len: number, line?: Stroke['line']) => {
      const dur = animate ? Math.max(160, ((len * s) / SPEED[kind]) * 1000) : 0
      strokes.push({ el, len, start: t, dur, line, complete: !animate })
      t += dur + (animate ? 70 : 0)
    }

    for (const [x1, y1, x2, y2, solid] of figure.guides) {
      const line = svgEl('line', {
        x1, y1, x2: animate ? x1 : x2, y2: animate ? y1 : y2,
        stroke: BLUE, 'stroke-opacity': 0.5, 'stroke-width': 0.8 / s
      })
      if (!solid) line.setAttribute('stroke-dasharray', [10, 3, 2, 3].map((v) => v / s).join(' '))
      svg.appendChild(line)
      schedule(line, 'guide', Math.hypot(x2 - x1, y2 - y1), [x1, y1, x2, y2])
    }

    const addPaths = (list: string[], kind: Kind) => {
      /* One subpath per element so the dash reveal draws each stroke from its own start */
      list.flatMap((d) => d.split(/(?=M)/).map((p) => p.trim()).filter(Boolean)).forEach((d) => {
        const path = svgEl('path', {
          d, fill: 'none', stroke: INK,
          'stroke-opacity': kind === 'ink' ? 0.55 : 0.38,
          'stroke-width': (kind === 'ink' ? 1.3 : 0.9) / s,
          'stroke-linecap': 'round', 'stroke-linejoin': 'round'
        })
        svg.appendChild(path)
        const len = path.getTotalLength()
        if (animate) {
          path.style.strokeDasharray = `${len + 1} ${len + 2}`
          path.style.strokeDashoffset = `${len + 1}`
        }
        schedule(path, kind, len)
      })
    }
    addPaths(figure.ink, 'ink')
    addPaths(figure.detail, 'detail')

    const labels = svgEl('g', { 'font-family': "'IBM Plex Mono', ui-monospace, monospace", opacity: animate ? 0 : 1 })
    const captionText = `FIG. ${figure.fig} — ${figure.name.toUpperCase()}`
    /* Shrink the caption until it fits inside the figure's own width (mono ≈ 0.6em + tracking) */
    const captionSize = Math.min(9.5 / s, (figure.w * 0.96) / (captionText.length * 0.74))
    /* Below ~6.5px on screen, labels are noise — small figures go unlabelled */
    const legible = captionSize * s >= 6.5
    for (const note of legible ? figure.notes : []) {
      const text = svgEl('text', { x: note.x, y: note.y, 'font-size': 9.5 / s, fill: BLUE, 'fill-opacity': 0.8, 'text-anchor': note.anchor ?? 'start' })
      text.textContent = note.text
      labels.appendChild(text)
    }
    const caption = svgEl('text', {
      x: figure.w / 2, y: figure.h - 4, 'font-size': captionSize, 'letter-spacing': captionSize * 0.14,
      fill: PENCIL, 'text-anchor': 'middle'
    })
    caption.textContent = captionText
    if (legible) labels.appendChild(caption)
    svg.appendChild(labels)

    /* Plotter head: orange crosshair with a live coordinate readout */
    const pen = svgEl('g', { opacity: 0 })
    const arm = 6 / s
    pen.appendChild(svgEl('path', { d: `M${-arm} 0 H${arm} M0 ${-arm} V${arm}`, stroke: SIGNAL, 'stroke-width': 1.2 / s }))
    pen.appendChild(svgEl('circle', { r: 2.2 / s, fill: 'none', stroke: SIGNAL, 'stroke-width': 1 / s }))
    const readout = svgEl('text', { x: 9 / s, y: -7 / s, 'font-size': 8.5 / s, fill: '#c2410c', 'font-family': "'IBM Plex Mono', ui-monospace, monospace" })
    pen.appendChild(readout)
    svg.appendChild(pen)

    const drawEnd = t
    const holdEnd = drawEnd + 500 + HOLD_MS
    return { figure, svg, strokes, pen, readout, labels, left, top, w, h, s, drawEnd, holdEnd, eraseEnd: holdEnd + ERASE_MS }
  }

  const spawn = (now: number, animate = true) => {
    const figure = nextFigure()
    if (!figure) return false
    const spot = findSpot(figure)
    if (!spot) {
      queue.unshift(figure)
      return false
    }
    const origin = root.getBoundingClientRect()
    drawings.push(build(figure, spot.x - origin.left, spot.y - origin.top, spot.s, now, animate))
    return true
  }

  /** Advances one drawing; returns false once it has been erased */
  const update = (d: Drawing, now: number) => {
    let active: { stroke: Stroke; p: number } | null = null
    for (const stroke of d.strokes) {
      if (stroke.complete) continue
      const p = clamp01((now - stroke.start) / stroke.dur)
      if (p <= 0) break
      if (stroke.line) {
        const [x1, y1, x2, y2] = stroke.line
        stroke.el.setAttribute('x2', String(x1 + (x2 - x1) * p))
        stroke.el.setAttribute('y2', String(y1 + (y2 - y1) * p))
      } else {
        stroke.el.style.strokeDashoffset = String((stroke.len + 1) * (1 - p))
      }
      if (p >= 1) stroke.complete = true
      else active = { stroke, p }
    }

    if (active) {
      const { stroke, p } = active
      let x: number
      let y: number
      if (stroke.line) {
        const [x1, y1, x2, y2] = stroke.line
        x = x1 + (x2 - x1) * p
        y = y1 + (y2 - y1) * p
      } else {
        const pt = (stroke.el as SVGPathElement).getPointAtLength(stroke.len * p)
        x = pt.x
        y = pt.y
      }
      d.pen.setAttribute('transform', `translate(${x} ${y})`)
      d.pen.setAttribute('opacity', '1')
      d.readout.textContent = `X ${pad4(d.left + x * d.s)}  Y ${pad4(d.top + y * d.s)}`
    } else if (now >= d.drawEnd) {
      d.pen.setAttribute('opacity', String(1 - clamp01((now - d.drawEnd) / 300)))
    }

    d.labels.setAttribute('opacity', String(clamp01((now - d.drawEnd) / 500)))
    if (now > d.holdEnd) d.svg.style.opacity = String(1 - clamp01((now - d.holdEnd) / ERASE_MS))
    return now < d.eraseEnd
  }

  const tick = (now: number) => {
    if (introContentReady.value && now >= nextSpawn && drawings.length < maxActive()) {
      nextSpawn = spawn(now) ? now + rand(1600, 3200) : now + 1000
    }
    /* Figures scrolled well out of view are cleared at once, freeing the pen for where the reader is */
    const originTop = root.getBoundingClientRect().top
    const vh = window.innerHeight
    drawings = drawings.filter((d) => {
      const top = originTop + d.top
      const offscreen = top > vh + 150 || top + d.h < -150
      const alive = !offscreen && update(d, now)
      if (!alive) d.svg.remove()
      return alive
    })
    raf = requestAnimationFrame(tick)
  }

  /* Reduced motion: finished drawings, placed as the reader scrolls, never animated or erased */
  let staticTimer = 0
  const fillStatic = () => {
    if (!introContentReady.value) return
    const origin = root.getBoundingClientRect()
    const visible = drawings.filter((d) => origin.top + d.top < window.innerHeight && origin.top + d.top + d.h > 0).length
    for (let i = visible; i < 2 && drawings.length < MAX_DRAWINGS_STATIC; i += 1) {
      if (!spawn(performance.now(), false)) break
    }
  }
  const onScrollStatic = () => {
    window.clearTimeout(staticTimer)
    staticTimer = window.setTimeout(fillStatic, 300)
  }

  const start = () => {
    if (running) return
    running = true
    if (reducedMotion) {
      fillStatic()
      window.addEventListener('scroll', onScrollStatic, { passive: true })
    } else {
      nextSpawn = performance.now() + 900
      raf = requestAnimationFrame(tick)
    }
  }

  const stop = () => {
    if (!running) return
    running = false
    cancelAnimationFrame(raf)
    window.clearTimeout(staticTimer)
    window.removeEventListener('scroll', onScrollStatic)
    drawings.forEach((d) => d.svg.remove())
    drawings = []
  }

  /* Only draws in Ground Control; the starfield owns the sky in Space */
  const syncToTheme = () => (document.body.classList.contains('dark-mode') ? stop() : start())
  syncToTheme()
  const themeObserver = new MutationObserver(syncToTheme)
  themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] })
  const stopIntroWatch = watch(introContentReady, (ready) => {
    if (ready && reducedMotion && running) fillStatic()
  })

  onBeforeUnmount(() => {
    stop()
    themeObserver.disconnect()
    stopIntroWatch()
  })
})
</script>

<style>
.plotter-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

html.dark .plotter-layer {
  display: none;
}

.plotter-fig {
  position: absolute;
  overflow: visible;
}
</style>
