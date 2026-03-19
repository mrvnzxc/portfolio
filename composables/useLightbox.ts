import { ref } from 'vue'

const isOpen = ref(false)
const mode = ref<'image' | 'pdf'>('image')
const src = ref('')

export function useLightbox() {
  const openImage = (value: string) => {
    mode.value = 'image'
    src.value = value
    isOpen.value = true
  }

  const openPdf = (value: string) => {
    mode.value = 'pdf'
    src.value = value
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    src.value = ''
  }

  return { isOpen, mode, src, openImage, openPdf, close }
}
