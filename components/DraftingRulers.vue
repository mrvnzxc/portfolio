<template>
  <!--
    Ground Control only: drafting-table rulers on the left and bottom edges. Their ticks land
    on the graph paper's lines, the left one scrolls with the sheet, and both mark the cursor
    (or, on touch screens, where you tap).
  -->
  <div class="drafting-rulers" aria-hidden="true">
    <canvas ref="leftRuler" class="drafting-ruler drafting-ruler--left" />
    <canvas ref="bottomRuler" class="drafting-ruler drafting-ruler--bottom" />
    <div class="drafting-ruler drafting-ruler--corner" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const leftRuler = ref<HTMLCanvasElement | null>(null)
const bottomRuler = ref<HTMLCanvasElement | null>(null)

/** A tick every 12px: every 2nd lands on the paper's 24px minor lines, every 8th on its 96px majors */
const STEP = 12
const INK = '15, 27, 45'
const PENCIL = '#56657a'
const SIGNAL = '#ff5a1f'
const SIGNAL_TEXT = '#c2410c'
const PAPER = 'rgba(244, 247, 250, 0.96)'
/** A tap's marker stays this long after the finger lifts */
const TOUCH_HOLD_MS = 1500

/**
 * Everything scales with the ruler's depth: 16px on wide screens, 10px on narrow ones,
 * where the page's side margin is only 16px.
 */
const metrics = (depth: number) => ({
  depth,
  major: Math.round(depth * 0.56),
  mid: Math.round(depth * 0.31),
  minor: Math.max(2, Math.round(depth * 0.19)),
  font: `500 ${depth >= 14 ? 8 : 6}px "IBM Plex Mono", ui-monospace, monospace`,
  /** Baseline of the numbers, measured from the edge that faces the page */
  baseline: depth - 2,
  /** Arrowhead size for the cursor marker */
  arrow: depth >= 14 ? 4 : 3
})
type Metrics = ReturnType<typeof metrics>

const pad4 = (n: number) => String(Math.max(0, Math.round(n))).padStart(4, '0')
const tickFor = (i: number, m: Metrics) =>
  i % 8 === 0 ? { len: m.major, alpha: 0.55 } : i % 2 === 0 ? { len: m.mid, alpha: 0.4 } : { len: m.minor, alpha: 0.28 }

onMounted(() => {
  const left = leftRuler.value
  const bottom = bottomRuler.value
  const leftCtx = left?.getContext('2d')
  const bottomCtx = bottom?.getContext('2d')
  if (!left || !bottom || !leftCtx || !bottomCtx) return

  let pointer: { x: number; y: number } | null = null
  let frame = 0
  let touchTimer = 0

  const visible = () => !document.documentElement.classList.contains('dark')

  /** Sizes the canvas's pixels to its CSS box and clears it; returns the box */
  const fit = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, font: (box: DOMRect) => string) => {
    const box = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    const w = Math.round(box.width * dpr)
    const h = Math.round(box.height * dpr)
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, box.width, box.height)
    ctx.font = font(box)
    return box
  }

  /**
   * Orange cursor readout on a patch of paper spanning the ruler's depth (`above` and
   * `below` the baseline), so no tick shows through it
   */
  const readout = (ctx: CanvasRenderingContext2D, text: string, x: number, baseline: number, above: number, below: number) => {
    const width = ctx.measureText(text).width
    ctx.fillStyle = PAPER
    ctx.fillRect(x - 2, baseline - above, width + 4, above + below)
    ctx.fillStyle = SIGNAL_TEXT
    ctx.fillText(text, x, baseline)
  }

  const drawBottom = (paperX: number) => {
    const ctx = bottomCtx
    const box = fit(bottom, ctx, (b) => metrics(b.height).font)
    const m = metrics(box.height)
    ctx.fillStyle = `rgba(${INK}, 0.18)`
    ctx.fillRect(0, 0, box.width, 1)

    /* The cursor's marker and readout claim a stretch of the ruler; numbers there step aside */
    const marker = pointer ? Math.round(pointer.x - box.left) : -1
    const text = pointer ? `X ${pad4(pointer.x - paperX)}` : ''
    const busy = marker >= 0 && marker <= box.width ? [marker - m.arrow, marker + m.arrow + 6 + ctx.measureText(text).width] : null

    /* Ticks hang from the edge facing the page; numbers count the paper's 96px squares */
    for (let i = Math.floor((box.left - paperX) / STEP); ; i += 1) {
      const x = Math.round(paperX + i * STEP - box.left)
      if (x > box.width) break
      if (x < 0) continue
      const { len, alpha } = tickFor(i, m)
      ctx.fillStyle = `rgba(${INK}, ${alpha})`
      ctx.fillRect(x, 0, 1, len)
      const label = String(i / 8)
      const end = x + 2 + ctx.measureText(label).width
      if (i % 8 === 0 && i > 0 && !(busy && end >= busy[0] && x + 2 <= busy[1])) {
        ctx.fillStyle = PENCIL
        ctx.fillText(label, x + 2, m.baseline)
      }
    }

    if (!busy) return
    ctx.fillStyle = SIGNAL
    ctx.fillRect(marker, 0, 1, box.height)
    ctx.beginPath()
    ctx.moveTo(marker + 0.5, 0)
    ctx.lineTo(marker - m.arrow + 0.5, m.arrow + 1)
    ctx.lineTo(marker + m.arrow + 0.5, m.arrow + 1)
    ctx.closePath()
    ctx.fill()
    /* From just under the edge line to the far edge of the ruler */
    readout(ctx, text, marker + m.arrow + 2, m.baseline, m.baseline - 1, box.height - m.baseline)
  }

  const drawLeft = (paperY: number) => {
    const ctx = leftCtx
    const box = fit(left, ctx, (b) => metrics(b.width).font)
    const m = metrics(box.width)
    ctx.fillStyle = `rgba(${INK}, 0.18)`
    ctx.fillRect(box.width - 1, 0, 1, box.height)

    /* This ruler scrolls with the sheet, so its numbers say how far down the page you are */
    const sheetTop = window.scrollY + box.top
    /* Sideways text reads upward; its baseline sits this far in from the page edge (9px of 16) */
    const inset = Math.round(box.width * 0.58)
    /** Text set sideways, reading upward, starting just below `y` */
    const sideways = (text: string, y: number, draw: (t: string, x: number, baseline: number) => void) => {
      const width = ctx.measureText(text).width
      ctx.save()
      ctx.translate(inset, y + 3 + width)
      ctx.rotate(-Math.PI / 2)
      draw(text, 0, 0)
      ctx.restore()
    }

    const marker = pointer ? Math.round(pointer.y - box.top) : -1
    const text = pointer ? `Y ${pad4(window.scrollY + pointer.y - paperY)}` : ''
    const busy = marker >= 0 && marker <= box.height ? [marker - m.arrow, marker + m.arrow + 6 + ctx.measureText(text).width] : null

    for (let i = Math.floor((sheetTop - paperY) / STEP); ; i += 1) {
      const y = Math.round(paperY + i * STEP - sheetTop)
      if (y > box.height) break
      if (y < 0) continue
      const { len, alpha } = tickFor(i, m)
      ctx.fillStyle = `rgba(${INK}, ${alpha})`
      ctx.fillRect(box.width - len, y, len, 1)
      const label = String(i / 8)
      const end = y + 3 + ctx.measureText(label).width
      if (i % 8 === 0 && i > 0 && !(busy && end >= busy[0] && y + 3 <= busy[1])) {
        ctx.fillStyle = PENCIL
        sideways(label, y, (t, x, b) => ctx.fillText(t, x, b))
      }
    }

    if (!busy) return
    ctx.fillStyle = SIGNAL
    ctx.fillRect(0, marker, box.width, 1)
    ctx.beginPath()
    ctx.moveTo(box.width, marker + 0.5)
    ctx.lineTo(box.width - m.arrow - 1, marker - m.arrow + 0.5)
    ctx.lineTo(box.width - m.arrow - 1, marker + m.arrow + 0.5)
    ctx.closePath()
    ctx.fill()
    /* Cover from the page edge to just short of the edge line */
    sideways(text, marker + m.arrow - 1, (t, x, b) => readout(ctx, t, x, b, inset, box.width - 1 - inset))
  }

  const draw = () => {
    frame = 0
    if (!visible()) return
    /* The grid's origin: the sheet's top-left corner on the page */
    const sheet = document.querySelector('.light-bg')?.getBoundingClientRect()
    const paperX = (sheet?.left ?? 0) + window.scrollX
    const paperY = (sheet?.top ?? 0) + window.scrollY
    drawLeft(paperY)
    drawBottom(paperX)
  }

  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(draw)
  }

  const onPointer = (event: PointerEvent) => {
    /* A finger only marks the rulers while it's down; a mouse marks them while it's over the page */
    if (event.pointerType === 'touch' && event.type === 'pointermove' && event.buttons === 0) return
    window.clearTimeout(touchTimer)
    pointer = { x: event.clientX, y: event.clientY }
    schedule()
  }
  const onTouchEnd = (event: PointerEvent) => {
    if (event.pointerType !== 'touch') return
    window.clearTimeout(touchTimer)
    touchTimer = window.setTimeout(() => {
      pointer = null
      schedule()
    }, TOUCH_HOLD_MS)
  }
  const onPointerLeave = () => {
    pointer = null
    schedule()
  }

  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule)
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('pointerdown', onPointer, { passive: true })
  window.addEventListener('pointerup', onTouchEnd, { passive: true })
  window.addEventListener('pointercancel', onTouchEnd, { passive: true })
  document.documentElement.addEventListener('mouseleave', onPointerLeave)
  const themeObserver = new MutationObserver(schedule)
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  /* The numbers are drawn in IBM Plex Mono; redraw once it has loaded */
  void document.fonts?.ready.then(schedule)
  schedule()

  onBeforeUnmount(() => {
    cancelAnimationFrame(frame)
    window.clearTimeout(touchTimer)
    window.removeEventListener('scroll', schedule)
    window.removeEventListener('resize', schedule)
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('pointerdown', onPointer)
    window.removeEventListener('pointerup', onTouchEnd)
    window.removeEventListener('pointercancel', onTouchEnd)
    document.documentElement.removeEventListener('mouseleave', onPointerLeave)
    themeObserver.disconnect()
  })
})
</script>

<style scoped>
/* 10px on narrow screens, where the page's side margin is only 16px; 16px once there is room */
.drafting-rulers {
  --ruler: 10px;
  display: none;
}

html:not(.dark) .drafting-rulers {
  display: block;
}

@media (min-width: 1280px) {
  .drafting-rulers {
    --ruler: 16px;
  }
}

/* Under the header (z-30) and above the page, like the header's own frosted paper */
.drafting-ruler {
  position: fixed;
  z-index: 29;
  pointer-events: none;
  background: rgb(244 247 250 / 0.88);
  backdrop-filter: blur(6px);
}

.drafting-ruler--left {
  left: 0;
  top: var(--header-h);
  width: var(--ruler);
  height: calc(100vh - var(--header-h) - var(--ruler));
  height: calc(100dvh - var(--header-h) - var(--ruler));
}

.drafting-ruler--bottom {
  left: var(--ruler);
  bottom: 0;
  width: calc(100% - var(--ruler));
  height: var(--ruler);
}

/* Where the rulers meet: the sheet's origin, marked with a pencil cross */
.drafting-ruler--corner {
  --cross: calc(var(--ruler) * 0.45);
  left: 0;
  bottom: 0;
  width: var(--ruler);
  height: var(--ruler);
  box-shadow: inset -1px 1px 0 rgb(15 27 45 / 0.18);
  background:
    linear-gradient(#56657a, #56657a) center / var(--cross) 1px no-repeat,
    linear-gradient(#56657a, #56657a) center / 1px var(--cross) no-repeat,
    rgb(244 247 250 / 0.88);
}
</style>
