export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@vercel/analytics/nuxt'
  ],
  css: ['~/assets/css/custom.css'],
  app: {
    head: {
      title: 'John Marvin Bautista | Portfolio',
      link: [{ rel: 'icon', type: 'image/webp', href: '/profile.webp' }]
    }
  },
  runtimeConfig: {
    vercelAnalyticsToken: process.env.VERCEL_ANALYTICS_TOKEN || '',
    vercelProjectId: process.env.VERCEL_PROJECT_ID || '',
    vercelTeamId: process.env.VERCEL_TEAM_ID || ''
  },
  compatibilityDate: '2026-03-19'
})
