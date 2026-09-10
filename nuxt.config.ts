// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: false,
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/eslint', '@pinia/nuxt', 'pinia-plugin-persistedstate/nuxt'],
  vite: {
    plugins: [tailwindcss()],
  },
  runtimeConfig: {
    public: {
      appEnv: process.env.APP_ENV || 'development',
      firebaseApiKey: process.env.VITE_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.VITE_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.VITE_FIREBASE_APP_ID,
      cloudinaryCloudName: process.env.VITE_CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.VITE_CLOUDINARY_UPLOAD_PRESET,
      cloudinaryFolder: process.env.VITE_CLOUDINARY_FOLDER || 'congregation',
    },
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  typescript: {
    strict: true,
    typeCheck: true,
  },
  pinia: {
    storesDirs: ['./stores/**'],
  },
  app: {
    // No `mode: 'out-in'`: that forces the old page to fully leave before the new one enters,
    // which races Nuxt's Suspense-wrapped page resolution if a second navigation starts before
    // the first's leave/resolve cycle finishes (e.g. clicking one nav link, then another, before
    // the fade settles) — the resulting `page:finish` / route-sync feedback loop is an infinite
    // `flushJobs` recursion ("Maximum call stack size exceeded"). Simultaneous enter/leave still
    // reads as a crossfade for a simple opacity transition, without that race.
    pageTransition: { name: 'fade' },
    head: {
      title: 'Congregation',
      titleTemplate: '%s | Congregation',
      meta: [
        {
          name: 'description',
          content: 'Congregation - Your All in one church management solution',
        },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'alternate icon', href: '/favicon.ico' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Piedra&family=Poppins:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&display=swap',
        },
      ],
    },
  },
})
