# Firebase Setup

This guide covers creating a Firebase project and configuring it for use with Congregation.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter a project name (e.g., `coc-abadina` for production, `coc-abadina-staging` for staging)
4. Optionally enable Google Analytics
5. Click **Create project**

Repeat this for **each environment** — see [Environments](#environments) below. Run through
sections 2–5 once per project.

---

## 2. Register a Web App

1. From the project dashboard, click the **Web** icon (`</>`)
2. Enter an app nickname (e.g., `congregation-web`)
3. Click **Register app**
4. Copy the Firebase config object — you will need these values for your `.env` file

```js
const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
}
```

Map each value to its corresponding environment variable in `.env`:

```env
VITE_FIREBASE_API_KEY=apiKey
VITE_FIREBASE_AUTH_DOMAIN=authDomain
VITE_FIREBASE_PROJECT_ID=projectId
VITE_FIREBASE_STORAGE_BUCKET=storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=messagingSenderId
VITE_FIREBASE_APP_ID=appId
```

---

## 3. Enable Authentication

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the providers your app will use:
   - **Email/Password** (recommended minimum)
   - **Google** (optional)
3. Under **Authorized domains**, ensure your dev domain (`localhost`) and production domain are listed

---

## 4. Set Up Cloud Firestore

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in production mode** (recommended)
3. Select a region close to your users
4. After creation, go to the **Rules** tab and configure security rules

A minimal starting rules configuration:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public read for landing page content
    match /public/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    // Admin-only access for church data
    match /members/{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }

    match /giving/{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }

    match /attendance/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> Adjust these rules to match your application's role structure before going to production.

---

## 5. Set Up Firebase Storage

1. Go to **Storage** > **Get started**
2. Accept the default security rules for now
3. Update storage rules for your use case:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /public/{allPaths=**} {
      allow read: if true;
    }
    match /uploads/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 6. (Optional) Firebase Emulator Suite

For local development, use the Firebase Emulator to avoid modifying production data:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Log in
firebase login

# Initialize emulators in the project root
firebase init emulators
```

Select **Firestore**, **Authentication**, and **Storage** emulators. Then start them with:

```bash
firebase emulators:start
```

The emulator UI is available at `http://localhost:4000` by default.

---

## 7. Deploy Firebase Security Rules

Once you are satisfied with your Firestore and Storage rules, deploy them. Always pass the
target project explicitly — the alias is the only thing standing between a rules edit and the
live congregation:

```bash
firebase deploy --only firestore:rules -P staging
firebase deploy --only firestore:rules -P production
```

[`firestore.rules`](../firestore.rules) is the single source of truth for both projects. Edit
it once, deploy to staging, verify, then deploy to production — never edit rules in the console,
or the next deploy silently reverts them.

---

## Environments

Congregation uses **one Firebase project per environment**. This is Google's recommended
approach, and the only one that isolates Auth users, Storage objects and quotas rather than
just Firestore documents. Both projects run happily on the free Spark plan.

| Environment | Firebase project       | Branch | Netlify site          | `APP_ENV`     |
| ----------- | ---------------------- | ------ | --------------------- | ------------- |
| Local dev   | whichever `.env` holds | any    | —                     | `development` |
| Staging     | `coc-abadina-staging`  | `dev`  | `coc-abadina-staging` | `staging`     |
| Production  | `coc-abadina`          | `main` | `coc-abadina-prod`    | `production`  |

Nothing in the application code is environment-aware. [`plugins/firebase.client.ts`](../plugins/firebase.client.ts)
builds its config from `runtimeConfig.public`, which is populated from environment variables in
[`nuxt.config.ts`](../nuxt.config.ts) — so switching environments is purely a matter of which
variables are present at build time.

### Project aliases

[`.firebaserc`](../.firebaserc) maps short aliases to project IDs for the Firebase CLI:

```bash
firebase use staging      # switch the active project
firebase use production
firebase projects:list    # confirm which project an alias points at
```

Update the project IDs in that file if you named your Firebase projects differently.

### Local env files

Three git-ignored env files, all created from [`.env.example`](../.env.example):

| File              | Firebase project      | Used by                                             |
| ----------------- | --------------------- | --------------------------------------------------- |
| `.env`            | your choice           | `npm run dev` — the local default                   |
| `.env.staging`    | `coc-abadina-staging` | `*:staging` scripts, `netlify:env -- staging`       |
| `.env.production` | `coc-abadina`         | `*:production` scripts, `netlify:env -- production` |

Nuxt only reads `.env` by default, so the per-environment scripts point it elsewhere with
`--dotenv`:

```bash
npm run dev                  # uses .env
npm run dev:staging          # uses .env.staging
npm run build:staging        # uses .env.staging
npm run generate:staging     # uses .env.staging
npm run build:production     # uses .env.production
npm run generate:production  # uses .env.production
```

Each of these fails immediately if its env file is missing, rather than building an empty
config — see [`scripts/require-dotenv.mjs`](../scripts/require-dotenv.mjs).

Whichever project `.env` points at is what a plain `npm run dev` reads and writes. If it holds
production values, everyday local work is touching real member records; pointing it at staging
instead makes the safe path the default.

### Netlify sites

Each environment is its **own Netlify site**, deploying from its own branch:

| Netlify site          | Branch | URL                                     | Firebase project      |
| --------------------- | ------ | --------------------------------------- | --------------------- |
| `coc-abadina-prod`    | `main` | https://coc-abadina-prod.netlify.app    | `coc-abadina`         |
| `coc-abadina-staging` | `dev`  | https://coc-abadina-staging.netlify.app | `coc-abadina-staging` |

[`netlify.toml`](../netlify.toml) commits the build command and publish directory. Because
`ssr: false` produces a static SPA, the build is `npm run generate` publishing `dist` — note
that the Netlify preset writes to `dist`, not `.output/public`.

**No environment values belong in `netlify.toml`, including `APP_ENV`.** That file is committed
and therefore shared by both sites, and each site is the `production` context for its own
branch — so a `[context.production]` block sets `APP_ENV=production` on the staging site too,
hiding the environment banner on staging. Set `APP_ENV` per site instead, alongside that site's
credentials.

The SPA fallback lives in [`public/_redirects`](../public/_redirects) rather than in
`netlify.toml`. Nitro's Netlify preset generates its own `_redirects` containing
`/* /404.html 404`, and Netlify processes `_redirects` ahead of `netlify.toml`, so a rule
declared in the TOML would be shadowed by that 404 and dynamic routes
(`/gallery/:category`, `/teachings/sermons/:slug`) would break on direct load. Shipping the
file in `public/` replaces the generated one. If you ever see deep links 404 in production,
check that this file survived into `dist/_redirects`.

The credentials are **not** committed. Netlify never sees the local `.env` files either — they
are git-ignored, so nothing uploads them. Each site needs its own copy of these ten variables,
set under **Site configuration → Environment variables**:

```
APP_ENV                             ← production | staging
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
VITE_CLOUDINARY_FOLDER
```

Point `VITE_CLOUDINARY_FOLDER` at a different folder per site (e.g. `congregation-staging` vs
`congregation`) so test uploads never land in the production media folder.

Rather than filling twenty fields by hand,
[`scripts/netlify-env.mjs`](../scripts/netlify-env.mjs) reads the local env files and sets them
through the Netlify CLI — one site per run:

```bash
npx netlify-cli login                      # once per machine

npx netlify-cli link                       # link the STAGING site
npm run netlify:env -- staging             # dry run — prints the plan, values masked
npm run netlify:env -- staging --apply

npx netlify-cli link                       # re-link to the PRODUCTION site
npm run netlify:env -- production --apply
```

`staging` reads `.env.staging`, `production` reads `.env.production`, and each run also sets
`APP_ENV`. Local `.env` is never uploaded. The script refuses to continue if either file is
missing a value, if the two share a Firebase project ID or API key, or if the linked site's name
does not match the environment you asked for — that last check is what stops staging from being
handed production credentials.

Environment variable changes only take effect on the **next** build, so trigger a redeploy
afterwards; existing deploys keep the values they were built with.

These values all ship to the browser in the JS bundle, so they are not secrets in the usual
sense. They are still kept out of the repository: this project is public, and a committed
config would point every fork and clone at the live church's Firebase project and burn its
quota.

Because they are inlined into the bundle, Netlify's secrets scanning would otherwise fail the
deploy on finding them in the build output. `SECRETS_SCAN_OMIT_KEYS` in
[`netlify.toml`](../netlify.toml) exempts exactly these keys — extend that list if you add
another `VITE_` variable, rather than switching the scan off entirely.

Add each site's URL to **Authorized domains** in the matching Firebase project's Auth settings —
`coc-abadina-staging.netlify.app` in the staging project, `coc-abadina-prod.netlify.app` plus
any custom domain in the production project. Sign-in fails otherwise.

The staging site is publicly reachable, admin UI included. Firestore rules, not obscurity, are
what keep staging data safe — which is another reason never to seed staging with real member
records.

### Continuous integration

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs typecheck, lint, format, tests
and a build on `main` and `dev`. It needs **no Firebase secrets** — Netlify performs the real
builds, and the CI build is a compile smoke test whose artifact is discarded, so it runs on
placeholder config values.

### Telling the environments apart

Because both projects render an identical UI, [`components/ui/EnvironmentBanner.vue`](../components/ui/EnvironmentBanner.vue)
shows a bar across the admin header naming the environment and the connected Firebase project.
It renders nothing when `APP_ENV=production`, so its presence always means "this is not live".

### Things that do not copy across

Creating the second project does not clone anything. Per project you must separately:

- enable the same Auth providers and add authorized domains
- create the Firestore database and deploy rules and indexes
- enable Storage and deploy storage rules
- create the first admin user and its role document — staging Auth accounts are entirely
  distinct from production ones

Never copy real member data into staging. It is the same personal information under weaker
rules and wider access; seed staging with fabricated members instead.

---

## References

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Auth Providers](https://firebase.google.com/docs/auth/web/start)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
