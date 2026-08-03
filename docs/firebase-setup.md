# Firebase Setup

This guide covers creating a Firebase project and configuring it for use with Congregation.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter a project name (e.g., `congregation-prod`)
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

| Environment | Firebase project       | Branch | `APP_ENV`     |
| ----------- | ---------------------- | ------ | ------------- |
| Local dev   | `congregation-staging` | any    | `development` |
| Staging     | `congregation-staging` | `dev`  | `staging`     |
| Production  | `congregation-prod`    | `main` | `production`  |

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

Each environment gets its own git-ignored env file, created from
[`.env.example`](../.env.example):

```bash
cp .env.example .env.staging      # fill in congregation-staging config, APP_ENV=staging
cp .env.example .env.production   # fill in congregation-prod config, APP_ENV=production
```

Nuxt only reads `.env` by default, so the per-environment scripts point it elsewhere with
`--dotenv`:

```bash
npm run dev              # uses .env
npm run dev:staging      # uses .env.staging
npm run build:staging    # uses .env.staging
npm run build:production # uses .env.production
```

Keeping a `.env.production` locally is optional — and worth skipping unless you specifically
need to reproduce a production build, since it puts live credentials on your laptop. CI is the
safer place to build production.

### CI secrets

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) resolves secrets through **GitHub
Environments**. Create two environments in **Settings → Environments** named `staging` and
`production`, and add the same secret names to each, pointing at the matching Firebase project:

```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_CLOUDINARY_CLOUD_NAME
VITE_CLOUDINARY_UPLOAD_PRESET
```

`VITE_CLOUDINARY_FOLDER` is a non-secret environment **variable** rather than a secret — set it
to something like `congregation-staging` and `congregation` respectively so test uploads never
land in the production media folder.

Builds on `main` select the `production` environment; every other branch and pull request gets
`staging`.

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
