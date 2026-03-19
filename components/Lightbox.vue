<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" @click.self="close">
    <div class="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-slate-900/90 p-3 shadow-2xl shadow-black/50">
      <button type="button" class="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700" aria-label="Close" @click="close">
        <Icon icon="ph:x" />
      </button>
      <div v-if="mode === 'image'" class="h-full w-full"><img :src="src" alt="Lightbox preview" class="h-full w-full max-h-[80vh] rounded-xl object-contain"></div>
      <div v-else class="h-[80vh] w-full"><iframe :src="src" title="Certificate preview" class="h-full w-full rounded-xl bg-white" loading="lazy"></iframe></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { onBeforeUnmount, onMounted } from 'vue'
import { useLightbox } from '~/composables/useLightbox'

const { isOpen, mode, src, close } = useLightbox()

onMounted(() => {
  window.addEventListener('keydown', onEscape)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onEscape)
})

const onEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}
</script>
