<template>
    <section id="hero" class="section-band-b-first">
      <div class="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 md:flex-row md:items-center md:justify-between">
        <div class="max-w-xl space-y-4 sm:space-y-5 reveal-on-scroll">
          <p class="text-base sm:text-lg font-semibold uppercase tracking-wide text-primary-600">Full-Stack Developer</p>
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">Hello World, I'm <br><span class="text-gradient" id="typewriter-name">{{ name }}</span></h1>
          <div class="mt-6 flex justify-center md:hidden"><div class="profile-wrapper mx-auto shadow-lg shadow-primary-500/20"><img src="/profile.webp" alt="Profile photo" class="profile-img"></div></div>
          <p class="text-lg leading-relaxed text-slate-700 dark:text-slate-200">I build reliable, user-focused software that blends clean architecture with thoughtful design. Currently exploring AI-assisted automation and modern web stacks.</p>
          <div class="flex flex-wrap gap-3 pt-2">
            <a class="inline-flex items-center justify-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white" href="/cv.pdf" download>Download CV</a>
            <a class="inline-flex items-center justify-center rounded-lg border border-primary-600 px-5 py-2.5 text-sm font-semibold text-primary-700" href="#contact">Contact Me</a>
            <a class="inline-flex items-center gap-1 text-sm font-medium text-primary-700 underline-offset-4 hover:underline dark:text-primary-300" href="#projects"><Icon icon="ph:arrow-down"/>See Projects</a>
          </div>
          <div class="mt-5 flex flex-wrap gap-3"><div class="pill">Open to remote</div><div class="pill">Available for freelance</div><div class="pill">Based in General Santos</div></div>
        </div>
        <div class="hidden md:flex justify-center md:justify-end reveal-on-scroll"><div class="profile-wrapper mx-auto shadow-lg shadow-primary-500/20"><img src="/profile.webp" alt="Profile photo" class="profile-img"></div></div>
      </div>
    </section>
  </template>
  <script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { onMounted, ref } from 'vue'
  
  const fullName = 'John Marvin Bautista'
  const name = ref(fullName)
  onMounted(() => {
    let currentIndex = 0
    let isDeleting = false
    const typeSpeed = 100
    name.value = ''
  
    const tick = () => {
      if (!isDeleting && currentIndex < fullName.length) {
        name.value = fullName.substring(0, currentIndex + 1)
        currentIndex += 1
        setTimeout(tick, typeSpeed)
      } else if (!isDeleting && currentIndex === fullName.length) {
        setTimeout(() => {
          isDeleting = true
          tick()
        }, 3000)
      } else if (isDeleting && currentIndex > 0) {
        currentIndex -= 1
        name.value = fullName.substring(0, currentIndex)
        setTimeout(tick, typeSpeed / 2)
      } else {
        isDeleting = false
        setTimeout(tick, 500)
      }
    }
  
    tick()
  })
  </script>