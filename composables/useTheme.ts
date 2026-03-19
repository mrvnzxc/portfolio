import { computed, onMounted, ref } from 'vue'

const theme = ref<'dark' | 'light'>('dark')

function applyTheme(value: 'dark' | 'light') {
  if (process.server) return
  const isDark = value === 'dark'
  document.body.classList.toggle('dark-mode', isDark)
  document.documentElement.classList.toggle('dark', isDark)
  localStorage.setItem('theme', value)
}

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  const setTheme = (value: 'dark' | 'light') => {
    theme.value = value
    applyTheme(value)
  }

  const toggleTheme = () => {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  onMounted(() => {
    const storedTheme = localStorage.getItem('theme')
    const initial = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark'
    setTheme(initial)
  })

  return { isDark, theme, setTheme, toggleTheme }
}
