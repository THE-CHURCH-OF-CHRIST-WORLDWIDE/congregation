import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const firebaseConfig = {
    apiKey: config.public.firebaseApiKey,
    authDomain: config.public.firebaseAuthDomain,
    projectId: config.public.firebaseProjectId,
    storageBucket: config.public.firebaseStorageBucket,
    messagingSenderId: config.public.firebaseMessagingSenderId,
    appId: config.public.firebaseAppId,
  }

  // Firebase's own complaint about a missing key is `auth/invalid-api-key`, which names
  // neither the variable nor the environment at fault. Since these values are inlined at
  // build time, an empty one always means the build ran without them — say so.
  const missing = [
    ['VITE_FIREBASE_API_KEY', firebaseConfig.apiKey],
    ['VITE_FIREBASE_AUTH_DOMAIN', firebaseConfig.authDomain],
    ['VITE_FIREBASE_PROJECT_ID', firebaseConfig.projectId],
    ['VITE_FIREBASE_STORAGE_BUCKET', firebaseConfig.storageBucket],
    ['VITE_FIREBASE_MESSAGING_SENDER_ID', firebaseConfig.messagingSenderId],
    ['VITE_FIREBASE_APP_ID', firebaseConfig.appId],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missing.length) {
    throw new Error(
      `Firebase config is missing ${missing.join(', ')} (APP_ENV=${config.public.appEnv}). ` +
        `These are inlined at build time, so the build had no values for them. ` +
        `Locally: check the .env file the build used. On Netlify: Site configuration → ` +
        `Environment variables must define them for this deploy context with the Builds ` +
        `scope enabled, then redeploy — env changes only apply to new builds.`
    )
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

  const auth = getAuth(app)
  const firestore = getFirestore(app)
  const storage = getStorage(app)

  return {
    provide: {
      auth,
      firestore,
      storage,
    },
  }
})
