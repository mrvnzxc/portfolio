export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@vercel/analytics/nuxt'
  ],
  css: ['~/assets/css/custom.css'],
  app: {
    head: {
      title: 'John Marvin Bautista | Portfolio',
      meta: [{ name: 'theme-color', content: '#04060f' }],
      link: [
        { rel: 'icon', type: 'image/webp', href: '/profile.webp' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap'
        }
      ]
    }
  },
  runtimeConfig: {
    vercelAnalyticsToken: process.env.VERCEL_ANALYTICS_TOKEN || '',
    vercelProjectId: process.env.VERCEL_PROJECT_ID || '',
    vercelTeamId: process.env.VERCEL_TEAM_ID || ''
  },
  compatibilityDate: '2026-03-19'
})
