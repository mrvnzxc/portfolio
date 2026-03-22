<template>
  <div class="light-bg relative min-h-screen text-slate-900 dark:bg-slate-950 dark:text-slate-50">
    <DustCanvas />
    <AppHeader />
    <main>
      <HeroSection />
      <AboutSection />
      <GallerySection />
      <ProjectsSection />
      <ServicesSection />
      <AchievementsSection @open-image="openImage" />
      <SkillsSection />
      <ContactSection />
    </main>
    <AppFooter />
    <Lightbox />
    <ToastRoot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, useHead, watch } from '#imports'
import HeroSection from '~/components/HeroSection.vue'
import { useLightbox } from '~/composables/useLightbox'
import { useScrollReveal } from '~/composables/useScrollReveal'
import { useTheme } from '~/composables/useTheme'

const { openImage } = useLightbox()
const { observeElements } = useScrollReveal()
const { isDark } = useTheme()

useHead({
  htmlAttrs: { class: 'scroll-smooth' },
  script: [
    {
      id: 'theme-init',
      innerHTML:
        "(function(){try{var t=localStorage.getItem('theme');var dark=(t==='light'||t==='dark')?t==='dark':true;document.documentElement.classList.toggle('dark',dark);var setBody=function(){if(document.body){document.body.classList.toggle('dark-mode',dark);}};if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',setBody,{once:true});}else{setBody();}}catch(e){document.documentElement.classList.add('dark');if(document.body){document.body.classList.add('dark-mode');}}})();"
    }
  ]
})

watch(isDark, () => {
  // keep canvas and dark classes in sync reactively
})

onMounted(() => {
  observeElements(document.querySelectorAll('.reveal-on-scroll'))
})
</script>
