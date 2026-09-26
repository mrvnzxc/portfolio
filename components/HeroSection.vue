<template>
    <section id="hero" class="hero-screen section-band-b-first flex items-center overflow-x-clip">
      <div class="mx-auto flex w-full max-w-6xl 2xl:max-w-7xl flex-col items-center gap-12 px-4 md:flex-row md:items-center md:justify-between">
        <div class="max-w-xl space-y-4 sm:space-y-5 2xl:max-w-2xl reveal-on-scroll">
          <p class="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs font-medium uppercase tracking-[0.2em] text-ion sm:text-sm">
            <span>Software Engineer</span>
            <span class="text-muted/60" aria-hidden="true">/</span>
            <span class="text-muted">6.1164° N · 125.1716° E</span>
          </p>
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl 2xl:text-7xl">Hello World, I'm <br><span class="text-gradient" id="typewriter-name" :data-full-text="fullName"><span class="typewriter-text">{{ name }}</span></span></h1>
          <div class="flex justify-center pb-20 pt-8 md:hidden"><ProfilePlanet /></div>
          <p class="text-lg leading-relaxed text-ink/80 2xl:text-xl">I build reliable, user-focused software that blends clean architecture with thoughtful design. Currently exploring AI-assisted automation and modern web stacks.</p>
          <div class="flex flex-wrap items-center gap-3 pt-2">
            <a class="btn-thrust" href="/cv.pdf" download><Icon icon="ph:download-simple-bold" />Download CV</a>
            <a class="btn-hull" href="#contact">Contact Me</a>
            <a class="inline-flex items-center gap-1 text-sm font-medium text-ion underline-offset-4 hover:underline" href="#projects"><Icon icon="ph:arrow-down" />See Projects</a>
          </div>
          <div class="mt-5 flex flex-wrap gap-2.5"><div class="pill">Open to remote</div><div class="pill">Available for freelance</div><div class="pill">Based in General Santos</div></div>
        </div>
        <div class="hidden md:flex justify-center md:justify-end md:pr-10 reveal-on-scroll"><ProfilePlanet /></div>
      </div>
    </section>
  </template>
  <script setup lang="ts">
  import { Icon } from '@iconify/vue'
  import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

  const fullName = 'John Marvin Bautista'
  /** Empty until the intro hands off; avoids typing under the intro or a full-name flash. */
  const name = ref('')
  const introContentReady = useIntroContentReady()

  function runTypewriter() {
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
  }

  onMounted(() => {
    if (introContentReady.value) {
      runTypewriter()
      return
    }
    const stop = watch(
      introContentReady,
      (ready) => {
        if (ready) {
          stop()
          runTypewriter()
        }
      },
      { immediate: true }
    )
    onBeforeUnmount(stop)
  })
  </script>