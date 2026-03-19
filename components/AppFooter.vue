<template>
  <footer class="border-t border-slate-200/80 bg-white/80 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-400">
    <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row">
      <div>© {{ year }} John Marvin Bautista. All rights reserved.</div>
      <div class="flex flex-wrap items-center gap-4">
        <a class="transition hover:text-primary-600 dark:hover:text-primary-400" href="#hero">Back to top</a>
        <a class="transition hover:text-primary-600 dark:hover:text-primary-400" href="#projects">Projects</a>
        <a class="transition hover:text-primary-600 dark:hover:text-primary-400" href="#contact">Contact</a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>
