import { computed, nextTick, onMounted, ref } from 'vue'

const theme = ref<'dark' | 'light'>('dark')

/* Text that changes font/position between Space and Ground Control and should glide between them */
const MORPH_TEXT_SELECTOR = [
  '#hero h1', '#hero p', '#hero .pill', '#hero .btn-thrust', '#hero .btn-hull',
  'main h2', 'main h3', '.section-tag', '.orbit-legend'
].join(',')
/** Bumps per switch so a superseded switch never cleans up after the one that replaced it */
let switchId = 0

type ViewTransitionLike = { finished: Promise<void> }
type DocumentWithViewTransition = Document & {
  startViewTransition?: (update: () => Promise<void> | void) => ViewTransitionLike
}

function applyTheme(value: 'dark' | 'light') {
  if (process.server) return
  const isDark = value === 'dark'
  document.body.classList.toggle('dark-mode', isDark)
  document.documentElement.classList.toggle('dark', isDark)
  localStorage.setItem('theme', value)
}

/** Gives each on-screen text block a unique view-transition-name so the browser morphs it */
function nameVisibleText() {
  const named: { el: HTMLElement; name: string }[] = []
  document.querySelectorAll<HTMLElement>(MORPH_TEXT_SELECTOR).forEach((el) => {
    const r = el.getBoundingClientRect()
    if (!r.width || !r.height || r.bottom < 0 || r.top > window.innerHeight || r.right < 0 || r.left > window.innerWidth) return
    const name = `vt-text-${named.length}`
    el.style.setProperty('view-transition-name', name)
    el.style.setProperty('view-transition-class', 'vt-text')
    named.push({ el, name })
  })
  return named
}

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  const setTheme = (value: 'dark' | 'light') => {
    theme.value = value
    applyTheme(value)
  }

  /**
   * The background switches at once; headings and labels glide from their old position and
   * typeface to the new one. Instant switch when unsupported or with reduced motion.
   */
  const toggleTheme = () => {
    const next = isDark.value ? 'light' : 'dark'
    const doc = document as DocumentWithViewTransition
    if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTheme(next)
      return
    }

    const id = ++switchId
    const named = nameVisibleText()
    const root = document.documentElement
    /* Colour transitions would otherwise be caught half-way in the "after" snapshot */
    root.classList.add('theme-switching')

    const transition = doc.startViewTransition(async () => {
      setTheme(next)
      await nextTick()
    })

    transition.finished.finally(() => {
      if (id !== switchId) return
      named.forEach(({ el }) => {
        el.style.removeProperty('view-transition-name')
        el.style.removeProperty('view-transition-class')
      })
      root.classList.remove('theme-switching')
    })
  }

  onMounted(() => {
    const storedTheme = localStorage.getItem('theme')
    const initial = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark'
    setTheme(initial)
  })

  return { isDark, theme, setTheme, toggleTheme }
}
