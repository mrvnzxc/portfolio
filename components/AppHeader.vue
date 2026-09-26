<template>
  <header id="top-nav" class="sticky top-0 z-30 border-b border-nebula/15 bg-[#f4f7fa]/90 backdrop-blur-md dark:bg-[#04060f]/70">
    <nav ref="navRoot" class="mx-auto flex max-w-6xl 2xl:max-w-7xl items-center justify-between px-4 py-3">
      <a href="#hero" class="inline-flex items-center gap-2 rounded-full border border-nebula/25 bg-nebula/5 px-3 py-1 font-mono text-sm text-ink">
        <span class="inline-flex h-2 w-2 rounded-full bg-ion shadow-[0_0_8px_rgb(var(--c-ion)/0.85)]"></span>
        <span class="inline-flex items-center gap-1 rounded-full bg-nebula/10 px-2 py-0.5">
          <Icon icon="ph:caret-left" class="text-muted" />
          <span class="text-gradient">marvin_dev</span>
          <Icon icon="ph:caret-right" class="text-muted" />
        </span>
      </a>

      <div class="flex items-center gap-2 md:hidden">
        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-nebula/30 bg-nebula/5 text-ink transition hover:border-ion/60 hover:text-ion" :aria-label="themeToggleLabel" :title="themeToggleLabel" @click="toggleTheme">
          <Icon :icon="isDark ? 'ph:compass-tool-fill' : 'ph:rocket-launch-fill'" />
        </button>
        <button type="button" class="nav-toggle inline-flex h-10 w-10 items-center justify-center rounded-md border border-nebula/30 bg-nebula/5 text-ink transition-transform duration-200 hover:scale-[1.04] hover:border-ion/60 hover:text-ion" :class="{ 'is-open': isMenuActive }" aria-controls="navMenu" :aria-expanded="isMenuActive" @click="toggleMenu">
          <span class="sr-only">Toggle navigation</span>
          <span class="nav-toggle-bars flex h-4 w-5 flex-col items-center justify-between">
            <span class="nav-toggle-bar nav-toggle-bar--top block h-0.5 w-full rounded-full bg-current"></span>
            <span class="nav-toggle-bar nav-toggle-bar--mid block h-0.5 w-4 rounded-full bg-current"></span>
            <span class="nav-toggle-bar nav-toggle-bar--bottom block h-0.5 w-3 rounded-full bg-current"></span>
          </span>
        </button>
      </div>

      <div id="navMenu" class="nav-menu absolute left-0 right-0 top-full z-20 w-full flex-col gap-4 border-b border-nebula/15 bg-[#f4f7fa]/[0.98] px-4 pb-4 pt-3 shadow-lg shadow-[#04060f]/10 dark:bg-[#070b1c]/[0.97] dark:shadow-black/40 md:static md:z-auto md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:border-none md:bg-transparent md:p-0 md:shadow-none dark:md:bg-transparent dark:md:shadow-none" :class="menuClass" @animationend="onMenuAnimationEnd">
        <ul class="nav-links flex flex-col gap-3 text-base font-medium text-ink/75 md:flex-row md:items-center md:gap-6 md:text-[15px]">
          <li v-for="item in navItems" :key="item.id">
            <a
              :href="`#${item.id}`"
              :class="{ 'is-active': activeSection === item.id }"
              :aria-current="activeSection === item.id ? 'location' : undefined"
              @click="closeMenu"
            >{{ item.label }}</a>
          </li>
        </ul>
        <button type="button" class="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full border border-nebula/30 bg-nebula/5 text-ink transition hover:border-ion/60 hover:text-ion" :aria-label="themeToggleLabel" :title="themeToggleLabel" @click="toggleTheme">
          <Icon :icon="isDark ? 'ph:compass-tool-fill' : 'ph:rocket-launch-fill'" />
        </button>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
const navRoot = ref<HTMLElement | null>(null)

const navItems = [
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'about', label: 'About' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'contact', label: 'Contact' }
]
/* Every section in page order, including ones without a nav link (hero, services) */
const PAGE_SECTIONS = ['hero', 'projects', 'skills', 'about', 'achievements', 'gallery', 'services', 'contact']
const activeSection = ref<string | null>(null)
let activeRaf = 0

/** The section crossing a reading line ~30% down the screen is the one being read */
const updateActiveSection = () => {
  activeRaf = 0
  const headerHeight = document.getElementById('top-nav')?.offsetHeight ?? 0
  const line = headerHeight + window.innerHeight * 0.3
  let current: string | null = null
  for (const id of PAGE_SECTIONS) {
    const rect = document.getElementById(id)?.getBoundingClientRect()
    if (rect && rect.top <= line && rect.bottom > line) {
      current = id
      break
    }
  }
  /* The last section may be too short to reach the line; at the very bottom it is the one in view */
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = 'contact'
  activeSection.value = navItems.some((item) => item.id === current) ? current : null
}

const onScrollForActive = () => {
  if (!activeRaf) activeRaf = requestAnimationFrame(updateActiveSection)
}

/* Publishes the header height so the full-screen hero can size itself below it */
let headerObserver: ResizeObserver | null = null
const menuState = ref<'closed' | 'open' | 'closing'>('closed')

const isMenuActive = computed(() => menuState.value !== 'closed')
/* Dark = Space, light = Ground Control; the icon shows where the toggle takes you */
const themeToggleLabel = computed(() => (isDark.value ? 'Switch to Ground Control (light) theme' : 'Switch to Space (dark) theme'))
const menuClass = computed(() => {
  if (menuState.value === 'open') return 'flex nav-menu--open md:flex'
  if (menuState.value === 'closing') return 'flex nav-menu--closing md:flex'
  return 'hidden md:flex'
})

const openMenu = () => {
  menuState.value = 'open'
}

const closeMenu = () => {
  if (window.innerWidth >= 768) return
  if (menuState.value === 'closed') return
  menuState.value = 'closing'
}

const toggleMenu = () => {
  if (menuState.value === 'open') {
    closeMenu()
  } else if (menuState.value === 'closing') {
    menuState.value = 'open'
  } else {
    openMenu()
  }
}

const onMenuAnimationEnd = () => {
  if (menuState.value === 'closing') {
    menuState.value = 'closed'
  }
}

const handleOutsideClick = (event: MouseEvent) => {
  if (window.innerWidth >= 768) return
  if (menuState.value === 'closed') return
  const target = event.target as Node | null
  if (!target) return
  if (navRoot.value?.contains(target)) return
  closeMenu()
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  window.addEventListener('scroll', onScrollForActive, { passive: true })
  window.addEventListener('resize', onScrollForActive, { passive: true })
  updateActiveSection()

  const header = document.getElementById('top-nav')
  if (header && 'ResizeObserver' in window) {
    headerObserver = new ResizeObserver(() => {
      document.documentElement.style.setProperty('--header-h', `${header.offsetHeight}px`)
    })
    headerObserver.observe(header)
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('scroll', onScrollForActive)
  window.removeEventListener('resize', onScrollForActive)
  cancelAnimationFrame(activeRaf)
  headerObserver?.disconnect()
})
</script>

<style scoped>
/* Underline colour for the section in view: ion cyan in Space, signal orange in Ground Control */
.nav-links {
  --nav-mark: var(--signal);
}

html.dark .nav-links {
  --nav-mark: rgb(var(--c-ion));
}

.nav-links a {
  position: relative;
  display: inline-block;
  transition: color 0.2s ease, text-shadow 0.2s ease;
}

.nav-links a::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -6px;
  height: 2px;
  border-radius: 2px;
  background: var(--nav-mark);
  transform: scaleX(0);
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

html.dark .nav-links a::after {
  box-shadow: 0 0 10px rgb(var(--c-ion) / 0.7);
}

.nav-links a.is-active {
  color: rgb(var(--c-ion));
}

.nav-links a.is-active::after {
  transform: scaleX(1);
}

.nav-links a:hover,
.nav-links a:focus-visible {
  color: rgb(var(--c-ion));
  text-shadow: 0 0 14px rgb(var(--c-ion) / 0.45);
}
</style>
