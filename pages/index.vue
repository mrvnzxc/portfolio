<template>
  <div class="light-bg relative min-h-screen text-slate-900 dark:bg-slate-950 dark:text-slate-50">
    <DustCanvas />
    <AppHeader />
    <main>
      <HeroSection />
      <AboutSection />
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

useHead({ htmlAttrs: { class: 'scroll-smooth' } })

watch(isDark, () => {
  // keep canvas and dark classes in sync reactively
})

onMounted(() => {
  observeElements(document.querySelectorAll('.reveal-on-scroll'))
})
</script>
