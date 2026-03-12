export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@pinia/nuxt', '@nuxt/image'],

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      titleTemplate: '%s | FreelanceHub',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
      ],
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#6366f1' },
        { name: 'description', content: '한국 프리랜서를 위한 올인원 업무 관리 툴' },
        { property: 'og:site_name', content: 'FreelanceHub' },
        { property: 'og:type', content: 'website' },
        { property: 'og:description', content: '한국 프리랜서를 위한 올인원 업무 관리 툴' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ||
        (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3002/api'),
    },
  },

  css: ['~/assets/css/main.css'],
})
