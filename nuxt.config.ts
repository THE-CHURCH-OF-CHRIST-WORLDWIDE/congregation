// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt',
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
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
    storesDirs: ["./stores/**"]
  },
  app: {
        pageTransition: { name: "fade", mode: "out-in" },
        head: {
            title: "Congregation",
            titleTemplate: "%s | Congregation",
            meta: [
                { name: "description", content: "Congregation - Your All in one church management solution" },
                { name: "viewport", content: "width=device-width, initial-scale=1" },
            ],
            link: [
                { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
                {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Piedra&family=Poppins:wght@400;500;600;700&display=swap",
                },
            ],
        },
    },
});
