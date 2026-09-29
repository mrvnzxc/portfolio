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
          href: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Condensed:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap'
        }
      ]
    }
  },
  runtimeConfig: {
    vercelAnalyticsToken: process.env.VERCEL_ANALYTICS_TOKEN || '',
    vercelProjectId: process.env.VERCEL_PROJECT_ID || '',
    vercelTeamId: process.env.VERCEL_TEAM_ID || '',
    /* Portfolio assistant chatbot: free-tier keys, Groq first, Gemini when Groq is out of quota or down */
    groqApiKey: process.env.GROQ_API_KEY || '',
    groqModel: process.env.GROQ_MODEL || 'openai/gpt-oss-120b',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite'
  },
  compatibilityDate: '2026-03-19'
})
