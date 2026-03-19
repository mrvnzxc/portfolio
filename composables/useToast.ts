import { ref } from 'vue'

type ToastVariant = 'success' | 'error'

const visible = ref(false)
const title = ref('Message sent')
const message = ref('Thanks! I will get back to you shortly.')
const variant = ref<ToastVariant>('success')
let hideTimeout: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  const showToast = (payload: { title: string; message: string; variant: ToastVariant }) => {
    title.value = payload.title
    message.value = payload.message
    variant.value = payload.variant
    visible.value = true

    if (hideTimeout) clearTimeout(hideTimeout)
    hideTimeout = setTimeout(() => {
      visible.value = false
    }, 4000)
  }

  return { visible, title, message, variant, showToast }
}
