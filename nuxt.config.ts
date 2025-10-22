// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  ssr: false,
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: [
    '@pinia/nuxt',
  ],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  runtimeConfig: {
    // Private keys (server only)
    apiSecret: process.env.API_SECRET,

    public: {
      apiBase: process.env.API_BASE || "https://api.example.com",
      appEnv: process.env.APP_ENV || "development",
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
            titleTemplate: "%s - Congregation Marketplace",
            meta: [
                { name: "description", content: "Congregation - Your All in one church management solution" },
                { name: "viewport", content: "width=device-width, initial-scale=1" },
            ],
            link: [
                { rel: "icon", type: "image/png", href: "/images/icon.png" },
                { rel: "icon", type: "image/x-icon", href: "/images/icon.png" },
                { rel: "apple-touch-icon", href: "/images/icon.png" },
                {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
                },
                {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Piedra&display=swap",
                },
                {
                rel: "stylesheet",
                href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap",
                },
            ],
        },
    },
});
