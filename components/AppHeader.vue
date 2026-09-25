<template>
  <header id="top-nav" class="sticky top-0 z-30 border-b border-nebula/15 bg-[#f1f2fb]/75 backdrop-blur-md dark:bg-[#04060f]/70">
    <nav ref="navRoot" class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
      <a href="#hero" class="inline-flex items-center gap-2 rounded-full border border-nebula/25 bg-nebula/5 px-3 py-1 font-mono text-sm text-ink">
        <span class="inline-flex h-2 w-2 rounded-full bg-ion shadow-[0_0_8px_rgb(var(--c-ion)/0.85)]"></span>
        <span class="inline-flex items-center gap-1 rounded-full bg-nebula/10 px-2 py-0.5">
          <Icon icon="ph:caret-left" class="text-muted" />
          <span class="text-gradient">marvin_dev</span>
          <Icon icon="ph:caret-right" class="text-muted" />
        </span>
      </a>

      <div class="flex items-center gap-2 md:hidden">
        <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-nebula/30 bg-nebula/5 text-ink transition hover:border-ion/60 hover:text-ion" aria-label="Toggle light or dark mode" @click="toggleTheme">
          <Icon :icon="isDark ? 'ph:sun-fill' : 'ph:moon-fill'" />
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

      <div id="navMenu" class="nav-menu absolute left-0 right-0 top-full z-20 w-full flex-col gap-4 border-b border-nebula/15 bg-[#f1f2fb]/[0.98] px-4 pb-4 pt-3 shadow-lg shadow-[#04060f]/10 dark:bg-[#070b1c]/[0.97] dark:shadow-black/40 md:static md:z-auto md:flex md:w-auto md:flex-row md:items-center md:gap-6 md:border-none md:bg-transparent md:p-0 md:shadow-none dark:md:bg-transparent dark:md:shadow-none" :class="menuClass" @animationend="onMenuAnimationEnd">
        <ul class="nav-links flex flex-col gap-3 text-base font-medium text-ink/75 md:flex-row md:items-center md:gap-6 md:text-[15px]">
          <li><a href="#projects" @click="closeMenu">Projects</a></li>
          <li><a href="#skills" @click="closeMenu">Skills</a></li>
          <li><a href="#about" @click="closeMenu">About</a></li>
          <li><a href="#achievements" @click="closeMenu">Achievements</a></li>
          <li><a href="#gallery" @click="closeMenu">Gallery</a></li>
          <li><a href="#contact" @click="closeMenu">Contact</a></li>
        </ul>
        <button type="button" class="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-full border border-nebula/30 bg-nebula/5 text-ink transition hover:border-ion/60 hover:text-ion" aria-label="Toggle light or dark mode" @click="toggleTheme">
          <Icon :icon="isDark ? 'ph:sun-fill' : 'ph:moon-fill'" />
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
const menuState = ref<'closed' | 'open' | 'closing'>('closed')

const isMenuActive = computed(() => menuState.value !== 'closed')
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
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.nav-links a {
  transition: color 0.2s ease, text-shadow 0.2s ease;
}

.nav-links a:hover,
.nav-links a:focus-visible {
  color: rgb(var(--c-ion));
  text-shadow: 0 0 14px rgb(var(--c-ion) / 0.45);
}
</style>
