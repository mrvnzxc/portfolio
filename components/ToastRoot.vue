<template>
  <div id="toast-root" class="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:px-6">
    <div v-show="visible" class="pointer-events-auto max-w-md rounded-xl px-4 py-3 text-sm shadow-lg" :class="variant === 'error' ? 'border border-red-500 bg-red-600/95 text-red-50' : 'border border-emerald-500 bg-emerald-600/95 text-emerald-50'">
      <div class="flex items-start gap-3">
        <Icon :icon="variant === 'error' ? 'ph:warning-circle-fill' : 'ph:check-circle-fill'" class="mt-0.5 text-lg" />
        <div>
          <p class="text-sm font-semibold">{{ title }}</p>
          <p class="mt-0.5 text-xs">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useToast } from '~/composables/useToast'

const { visible, title, message, variant } = useToast()
</script>
