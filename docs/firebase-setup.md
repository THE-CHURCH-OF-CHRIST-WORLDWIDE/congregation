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

Do not hand-write rules in the console. This repository's [`firestore.rules`](../firestore.rules)
is the real configuration — it covers the seven collections the app actually uses (`users`,
`invitations`, `auditLog`, `roles`, `roleAssignments`, `settings`, `members`), validates the shape of
self-registrations, and gates every write on the account's role. Deploy it as described in
[Deploy Firebase Security Rules](#7-deploy-firebase-security-rules) below, and read
[Account roles](#account-roles) first: the rules require a `users/{uid}` document to exist
before anyone can write.

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

> **Read the next section before deploying these rules to a project that already has data.**
> Writes are gated on a `users/{uid}` role document, and no rule lets an account create its
> own. Deploy without seeding one first and every write — including the one that would grant
> you a role — is refused.

---

## Account roles

Signing in is not the same as being allowed to write. Two separate things are involved:

| Concept                | Lives in               | What it does                                            |
| ---------------------- | ---------------------- | ------------------------------------------------------- |
| `users/{uid}` document | Firestore              | **Grants privilege.** Firestore rules read it on writes |
| `RoleAssignment`       | `stores/roles.ts` (UI) | Attaches roles to nominal-roll members, for display     |

They are deliberately distinct: most people on the nominal roll have no login at all, and a
login is not a member record. Only the `users/{uid}` document is enforced.

The document shape (see `AppUserRecord` in [`types/index.ts`](../types/index.ts)):

```json
{
  "email": "secretary@example.com",
  "roleId": "super-admin",
  "memberId": "optional-nominal-roll-id"
}
```

`roleId` must be one of `super-admin`, `admin`, `elder`, `deacon`, `preacher`, `secretary`,
`youth-leader`, `financial-secretary`. Anything else — or a missing document — means the
account can sign in and see the dashboard shell but cannot write. The admin header shows a
red banner in that state so the cause is visible rather than appearing as random save
failures.

Once a Super Admin exists, everyone else is invited from the app: **Settings → Roles &
Permissions → Dashboard Access → Invite by email**. See [Invitations](#invitations) below.

What each tier may do, per [`firestore.rules`](../firestore.rules):

|                    | `settings` | `members`                    | `users`             | `roles` | `roleAssignments` | `invitations`   | `auditLog`   |
| ------------------ | ---------- | ---------------------------- | ------------------- | ------- | ----------------- | --------------- | ------------ |
| Super Admin        | read+write | read+write                   | read+write          | r+w     | read+write        | read+write      | read, append |
| Admin              | read+write | read+write                   | read                | read    | read              | read            | append only  |
| Other staff        | read       | read+write                   | read                | read    | read              | read            | append only  |
| Signed in, no role | read       | —                            | own doc; claim only | —       | —                 | own invite only | —            |
| Anonymous          | read       | create only, via `/register` | —                   | —       | —                 | —               | —            |

Rules are the coarse security floor; the per-page permission matrix in Settings → Roles &
Permissions stays finer-grained on top of it. Keep the staff list in `isStaff()` in step with
`STAFF_ROLES` in [`stores/auth.ts`](../stores/auth.ts).

`roles/{roleId}` holds **permission overrides only** — the eight roles, their ids, names and
colours live in `DEFAULT_ROLES` in [`stores/roles.ts`](../stores/roles.ts) and are not editable.
On load the app rebuilds the list from those defaults and applies any stored `permissions` on
top, so a role added to the code later still appears and a stored override for a role that no
longer exists is ignored.

### Bootstrapping the first Super Admin

Do this **before** deploying the rules, once per Firebase project:

1. **Authentication → Users** — copy the UID of the account that should be Super Admin
   (create the account first if it does not exist).
2. **Firestore Database → Start collection** — collection id `users`, document id **exactly
   that UID**, with a `roleId` field of `super-admin` (and `email` for legibility).
3. Confirm the document path reads `users/<uid>` and that the id is the UID, not the email —
   this is the single most common way to get locked out.
4. Deploy the rules to **staging** first, sign in there, and check that saving a setting
   works and that the red no-role banner does not appear.
5. Only then deploy to production.

Every later account is granted a role by an existing Super Admin writing its `users/{uid}`
document. There is no UI for this yet — do it in the console, or ask for the Roles screen to
be wired to Firestore.

## Invitations

A Super Admin invites people from **Settings → Roles & Permissions → Dashboard Access**: enter an
email, pick a role, send. The invitee gets a sign-in link; opening it creates their account and
applies the role. Nobody has to touch the Firebase console, and no password is ever shared.

**One-time setup per project**, or invitations will fail to send:

1. **Authentication → Sign-in method** → enable **Email link (passwordless sign-in)**.
2. **Authentication → Settings → Authorized domains** → include the site's domain
   (`coc-abadina-prod.netlify.app`, `coc-abadina-staging.netlify.app`, `localhost`).

Email/password sign-in stays enabled alongside it — existing accounts keep signing in as before.

### How it works, and why it is safe without a backend

Creating a Firebase Auth account normally needs the Admin SDK, which needs Cloud Functions and
the **Blaze** plan. This flow avoids both by having the invitee claim their own role, with rules
policing the claim:

1. A Super Admin writes `invitations/{email}` (id lower-cased) holding the role. Rules allow
   `create` here only for a Super Admin.
2. Firebase emails a sign-in link pointing at `/invite`.
3. The invitee confirms their address, `signInWithEmailLink` creates the account — with the email
   already **verified**, because they demonstrably received the mail.
4. The app writes `users/{uid}` with the invited role. This is the one place rules let an account
   grant itself anything, and it is narrow: **create only** (an account that already has a record
   cannot re-run it to change its role), **own uid only**, **verified email only**, and the
   `roleId` must equal the one the invitation names. Knowing an invited address is not enough —
   you must be able to read that mailbox.
5. The invitation is deleted, so it cannot be reused.

Two deliberate consequences:

- **Invitations grant roles; they do not restrict who may hold an account.** Anyone can still sign
  up for an account with no role, which grants nothing.
- **The link is single-use and expires** (Firebase's default), so a forwarded email cannot be
  replayed later.

A pending invitation can be revoked from the same screen at any point before it is claimed.

Where an account already exists and just needs a role, the same card has an **"Or grant an
existing account by UID"** fallback — paste the UID from Authentication → Users.

### If you lock yourself out

Rules cannot lock out the Firebase console: open **Firestore Database → Data** and create or
fix the `users/{uid}` document there. Console access is governed by Google Cloud IAM, not by
these rules.

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
npx netlify-cli login                       # once per machine

npm run netlify:env -- staging              # dry run — shows old → new, values masked
npm run netlify:env -- staging --apply

npm run netlify:env -- production           # dry run
npm run netlify:env -- production --apply
```

Each environment names its own Netlify site and passes it with `--site`, so which project happens
to be linked locally does not matter and there is no re-linking between runs. `staging` reads
`.env.staging`, `production` reads `.env.production`, and each run also sets `APP_ENV`; local
`.env` is never uploaded.

The script refuses to continue if either file is missing a value, or if the two share a Firebase
project ID or API key. Before writing it prints the current value of every variable beside the new
one, so a site holding the wrong environment's credentials is visible before anything changes; and
after writing it reads the values back, exiting non-zero unless the site confirms all ten.

Environment variable changes only take effect on the **next** build, so trigger a redeploy
afterwards; existing deploys keep the values they were built with.

> When inspecting variables by hand, always pass a context: `netlify env:list` defaults to the
> `dev` context and will report variables as unset when they are only set for the contexts a
> deploy actually builds in. Use
> `npx netlify-cli env:list --site coc-abadina-prod --context production`.

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
