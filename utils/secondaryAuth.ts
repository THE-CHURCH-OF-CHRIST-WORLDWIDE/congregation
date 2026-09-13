import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

const SECONDARY_APP_NAME = 'secondary-account-creation'

/**
 * A second, isolated Firebase App instance pointed at the same project.
 *
 * Creating a Firebase Auth account with the client SDK also signs in as that account on
 * whichever Auth instance did the creating. Doing it on the default instance would sign the
 * admin out of their own session mid-action. Every Auth instance is scoped to the App it came
 * from, so a second App gives account creation somewhere to sign in that isn't the admin's
 * session — the admin's `$auth` never sees it happen.
 */
function secondaryApp(): FirebaseApp {
  if (getApps().some((a) => a.name === SECONDARY_APP_NAME)) return getApp(SECONDARY_APP_NAME)

  const config = useRuntimeConfig()
  return initializeApp(
    {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
    },
    SECONDARY_APP_NAME
  )
}

/** Auth instance for creating accounts without disturbing the signed-in admin. */
export function getSecondaryAuth(): Auth {
  return getAuth(secondaryApp())
}
