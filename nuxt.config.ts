export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/custom.css'],
  app: {
    head: {
      title: 'My Portfolio',
      link: [{ rel: 'icon', type: 'image/webp', href: '/profile.webp' }]
    }
  },
  compatibilityDate: '2026-03-19'
})
