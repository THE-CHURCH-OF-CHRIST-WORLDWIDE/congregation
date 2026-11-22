# Congregation

[![CI](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/actions/workflows/ci.yml)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Sponsor](https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-ea4aaa?logo=githubsponsors&logoColor=white)](https://github.com/sponsors/THE-CHURCH-OF-CHRIST-WORLDWIDE)

**Congregation is an open-source Church Management System built for churches and faith-based organizations of every size. Manage members, track attendance, record giving, coordinate events, and stay connected with your congregation, all from one modern, accessible platform.**

One codebase gives a congregation two things that usually live in separate tools:

- a **public website** where visitors find service times, watch live streams, read teachings, see events, register as members, and send a message, and
- an **admin dashboard** where church staff keep the nominal roll, record attendance and finances, publish content, minute business meetings, and control who may change what.

Both halves read from the same Firebase backend, so content staff edit in Settings appears on the public site straight away.

---

## Table of Contents

- [Why Congregation](#why-congregation)
- [Preview](#preview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Backend Setup (Firebase)](#backend-setup-firebase)
- [Available Scripts](#available-scripts)
- [Testing and Quality Checks](#testing-and-quality-checks)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Community and Support](#community-and-support)
- [Sponsorship](#sponsorship)
- [License](#license)
- [Authors](#authors)

---

## Why Congregation

Many congregations keep their records in notebooks, spreadsheets, and group chats, and run their website as a separate, disconnected project. Commercial church management software often costs more than a small church can justify, and it holds the church's data on someone else's terms.

Congregation is designed for:

- **Church secretaries and administrators** who do weekly record-keeping (attendance after each service, collections and expenses, member updates) and want it to be fast and hard to get wrong.
- **Ministers, elders, and leaders** who need an accurate picture of membership and attendance, including who has been absent and may need a visit.
- **Visitors and members** who use the public site, many of them on phones, to find a service, watch a stream, or read a lesson.
- **Developers** who serve their church and want a modern, typed, tested codebase they can deploy and extend.

**Why open source?** Congregation is free to self-host on infrastructure the church controls. It is licensed under the GNU AGPL v3, so improvements made to hosted versions are shared back with every church that uses it. It is also brand-neutral: the church name, logo, photos, service times, and most public copy come from Settings rather than from code, so any congregation can deploy it as its own.

> **Project status:** Congregation is in active pre-1.0 development. Security fixes are applied to `main` only. See [SECURITY.md](SECURITY.md).

---

## Preview

<!--
  TODO (maintainers): add screenshots here.
  Suggested: public home page, admin dashboard, nominal roll, attendance.
  Capture them from a deployment with sample (non-personal) data, save under
  docs/images/, and reference them like:
  ![Admin dashboard](docs/images/admin-dashboard.png)
-->

_Screenshots are coming soon. To see Congregation now, follow [Getting Started](#getting-started) to run it locally._

---

## Features

Everything below is implemented in this repository. Routes are shown so you can find each feature in the code.

### Public Website

| Feature                       | What visitors can do                                                                                                                     |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Home** (`/`)                | See the hero banner, minister's welcome, live stream and sermon teasers, upcoming events, congregation search, gallery, and contact form |
| **About Us**                  | Read the church's history, worship activities, leaders, activity calendar, and Sunday service location with an embedded map              |
| **Events**                    | Browse upcoming and past events, filter past events by month and year, and view event photos in a full-screen lightbox                   |
| **Live Streams**              | Watch the current live service and browse recorded streams                                                                               |
| **Teachings**                 | Browse and filter sermons and Sunday School lessons, each with its own detail page                                                       |
| **Gallery**                   | Browse photos by category (`/gallery/:category`)                                                                                         |
| **Bible Lectureship**         | View the lectureship programme and speakers, and register to attend                                                                      |
| **Member Registration**       | Submit a membership registration form (`/register`)                                                                                      |
| **Salvation, Privacy, Terms** | Read the plan of salvation, privacy policy, and terms of use                                                                             |

Administrators can show or hide individual public navigation items from Settings without a code change.

### Admin Dashboard (`/admin`)

**Member management**

- **Nominal Roll**: search, filter, add, edit, and delete members; view a member's details in a side panel; import members from CSV and export to CSV; see a summary of roles.
- **Unique church numbers**: membership numbers are reserved in a Firestore transaction, so two people cannot be given the same number.
- **Youth**: a dedicated view of youth members (ages 13–35) with CSV export.

**Attendance**

- Record attendance per service, view a monthly grid, and see summary statistics and trends.
- Record visitors and children's numbers alongside each service.
- Absence tracking derives who has been missing from the Sunday register, and for how long, so leaders can follow up.
- Export attendance to CSV.

**Giving and finance**

- Record collections (income) and expenses by category.
- Export to CSV, or download a finance report as a PDF.

**Events, teachings, and lectureship**

- Create and manage the events shown on the public Events page.
- Upload and manage sermons and Sunday School lessons.
- Manage Bible Lectureship speakers and registrations, check registrants in on the day, and export registrations to CSV.

**Communication**

- **Messages**: an inbox for the public contact form, with an unread count in the sidebar and separate _read_ and _handled_ flags. Replies open in the staff member's own mail client via `mailto:`; Congregation does not send email itself.

**Business meetings**

- Record minutes following the usual order of business: attendance and quorum, previous minutes, matters arising, reports, new business, action points, and more.
- Record motions (moved, seconded, outcome) on any item.
- Approved minutes are locked; only an Admin or Super Admin can reopen them. Each meeting has a print / PDF copy with signature lines.

**Reporting**

- The dashboard shows statistics cards, bar, line, donut, and sparkline charts (Chart.js), recent uploads, and a follow-up list of absent members.

**Settings and administration**

- Edit church details and public-site content (homepage, branding, logo, social links, and more) across multiple settings panels, with a single page-level save bar and unsaved-change protection.
- Image uploads go to Cloudinary, with progress, validation, and client-side compression.

### Users, Roles, and Permissions

- **Firebase Authentication** with email and password, including password reset and an in-app password change.
- **Role-based access control** with nine staff roles: Super Admin, Admin, Elder, Deacon, Preacher, Secretary, Youth Leader, Financial Secretary, and Content Editor. Each role has a per-page View / Add / Edit / Delete / Export permission matrix that a Super Admin can adjust.
- **Server-side enforcement**: [`firestore.rules`](firestore.rules) checks privilege on every write. The UI hides what a role cannot do, and the rules refuse it regardless.
- **Dashboard access management**: a Super Admin can create staff logins from inside the app, with no Cloud Functions or Admin SDK required.
- **Append-only audit log**: dashboard changes are recorded with the actor and a server timestamp, readable only by a Super Admin.

The full security model, role matrix, and their limits are documented in [docs/deployment.md](docs/deployment.md).

---

## Technology Stack

| Category                       | Technology                                                                                                                                                  |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend framework**         | [Nuxt 4](https://nuxt.com) in SPA mode (`ssr: false`), [Vue 3](https://vuejs.org), [Vue Router](https://router.vuejs.org)                                   |
| **Language**                   | [TypeScript](https://www.typescriptlang.org) (strict mode, type-checked with `vue-tsc`)                                                                     |
| **UI and styling**             | [Tailwind CSS v4](https://tailwindcss.com), [Iconify](https://iconify.design) icons                                                                         |
| **State management**           | [Pinia](https://pinia.vuejs.org) with `pinia-plugin-persistedstate`                                                                                         |
| **Backend**                    | [Firebase](https://firebase.google.com): Authentication and Cloud Firestore. No custom server and no Cloud Functions.                                       |
| **Database**                   | Cloud Firestore, secured by [`firestore.rules`](firestore.rules)                                                                                            |
| **Authentication**             | Firebase Authentication (email and password)                                                                                                                |
| **Media**                      | [Cloudinary](https://cloudinary.com) unsigned uploads for all images                                                                                        |
| **Charts, dates, and exports** | [Chart.js](https://www.chartjs.org) with `vue-chartjs`, [date-fns](https://date-fns.org), [jsPDF](https://github.com/parallax/jsPDF) with `jspdf-autotable` |
| **Testing**                    | [Vitest](https://vitest.dev), `@nuxt/test-utils`, `@vue/test-utils`, `happy-dom`                                                                            |
| **Code quality**               | ESLint (`@nuxt/eslint`), Prettier, Husky and lint-staged pre-commit hooks                                                                                   |
| **CI and hosting**             | GitHub Actions ([`ci.yml`](.github/workflows/ci.yml)), Netlify static hosting ([`netlify.toml`](netlify.toml)), Firebase CLI for rules                      |

Exact versions are pinned in [`package.json`](package.json) and `package-lock.json`.

---

## Architecture

Congregation is a client-rendered single-page application. There is no application server: the browser talks directly to Firebase and Cloudinary, and Firestore security rules are the trust boundary.

```text
┌───────────────────────── Browser (Nuxt 4 SPA) ─────────────────────────┐
│                                                                         │
│   pages/  ──►  components/  ──►  stores/ (Pinia)  ──►  repositories/   │
│   (routes)     (UI, by feature)  (state & actions)     (Firestore I/O)  │
│                                                                         │
│   middleware/ (auth guard, nav visibility)   composables/   utils/      │
└───────────────┬──────────────────────────────────────────┬──────────────┘
                │                                          │
                ▼                                          ▼
   Firebase Auth + Cloud Firestore               Cloudinary (image uploads)
   (enforced by firestore.rules)
```

Key conventions:

- **Repository layer.** All Firestore reads and writes go through `repositories/`, one repository per collection. Components and stores never call Firestore directly.
- **Privilege lives in Firestore.** A `users/{uid}` document grants an account its role. Signing in alone grants nothing; `firestore.rules` reads that document on every write.
- **Auto-imports.** Components are auto-imported without a path prefix (`<MemberTable />`, not `<NominalRollMemberTable />`). Composables, utils, and Pinia stores are auto-discovered.
- **Client-only plugins.** Firebase, Iconify, the Chart.js theme, and motion directives are registered in `plugins/*.client.ts`.

Read [docs/architecture.md](docs/architecture.md) for the authentication flow, data flow, and how to add a new feature.

---

## Project Structure

```text
congregation/
├── .github/
│   ├── ISSUE_TEMPLATE/        # Bug report and feature request templates
│   ├── workflows/ci.yml       # Typecheck, lint, format check, test, and build
│   ├── FUNDING.yml            # GitHub Sponsors button
│   └── PULL_REQUEST_TEMPLATE.md
├── assets/css/main.css        # Tailwind entry point and theme tokens
├── components/                # Vue components, grouped by feature (auto-imported)
│   ├── about/  attendance/  business-meetings/  charts/  dashboard/
│   ├── events/  gallery/  home/  layout/  lectureship/  legal/
│   ├── live-streams/  nominal-roll/  settings/  shared/  teachings/
│   └── ui/                    # Reusable primitives: Button, Input, Modal, ImageUpload, ...
├── composables/               # Shared logic: CSV import/export, finance PDF, uploads, pagination, ...
├── constants/                 # Routes, nav items, roles, and other shared constants
├── docs/                      # Developer and operator documentation
├── layouts/                   # default.vue (public site) and admin.vue (dashboard shell)
├── middleware/                # auth.ts route guard, nav-visibility and staging-only global guards
├── pages/                     # File-based routes
│   ├── admin/                 # Dashboard: nominal-roll, attendance, finance, events, teachings,
│   │                          #   youth, lectureship, business-meetings, messages, settings
│   └── ...                    # Public: index, about-us, events, live-streams, teachings, gallery,
│                              #   lectureship, register, salvation, privacy-policy, terms-of-use, login
├── plugins/                   # Client-only plugins: firebase, iconify, chart-theme, motion
├── public/                    # Static files: favicon, robots.txt, _redirects (SPA fallback), images
├── repositories/              # Firestore data access, one file per collection
├── scripts/                   # require-dotenv.mjs (env preflight), netlify-env.mjs (env upload)
├── stores/                    # Pinia stores, one per domain
├── tests/                     # Vitest suites: components, composables, repositories, stores, utils
├── types/                     # Shared TypeScript types
├── utils/                     # Pure helpers: dates, church numbers, audit, image compression, ...
├── app.vue                    # Root component: starts auth, applies the uploaded favicon
├── firestore.rules            # Firestore security rules (the access-control source of truth)
├── firebase.json / .firebaserc# Firebase CLI config and staging / production project aliases
├── netlify.toml               # Netlify build settings shared by staging and production
├── nuxt.config.ts             # Nuxt configuration and public runtime config
├── vitest.config.ts           # Test configuration
├── .env.example               # Environment variable template
├── CONTRIBUTING.md  SECURITY.md  LICENSE  NOTICE
└── package.json
```

---

## Prerequisites

| Requirement                                          | Version / notes                                                                                     |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org)                        | **22 or newer** (`engines` in `package.json`; `.nvmrc` pins 22)                                     |
| npm                                                  | **10 or newer**. The repository ships a `package-lock.json`, so use npm.                            |
| Git                                                  | Any recent version                                                                                  |
| A Firebase project                                   | Free Spark plan is sufficient. Authentication (email/password) and Cloud Firestore must be enabled. |
| A Cloudinary account                                 | Free tier is sufficient. Needed only for image uploads.                                             |
| [Firebase CLI](https://firebase.google.com/docs/cli) | Needed to deploy `firestore.rules` (`npm install -g firebase-tools`).                               |

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation.git
cd congregation
npm install
```

`npm install` also runs `nuxt prepare` (which generates types and auto-imports) and installs the Husky pre-commit hook.

### 2. Configure environment variables

```bash
cp .env.example .env
```

Fill in your Firebase web app config and Cloudinary settings. See [Environment Variables](#environment-variables).

### 3. Set up Firebase

Create a Firebase project, enable email/password sign-in, create a Firestore database, deploy the security rules, and seed your first Super Admin. The steps are summarised in [Backend Setup](#backend-setup-firebase).

### 4. Start the development server

```bash
npm run dev
```

| URL                         | What it is                       |
| --------------------------- | -------------------------------- |
| http://localhost:3000       | Public website                   |
| http://localhost:3000/login | Staff sign-in                    |
| http://localhost:3000/admin | Admin dashboard (requires login) |

---

## Environment Variables

All variables are read in [`nuxt.config.ts`](nuxt.config.ts) and exposed through `useRuntimeConfig().public`. A template with comments lives in [`.env.example`](.env.example).

| Variable                            | Description                                                                                                            | Required                    |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| `VITE_FIREBASE_API_KEY`             | Firebase web app API key                                                                                               | Yes                         |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Auth domain, usually `<project-id>.firebaseapp.com`                                                           | Yes                         |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase project ID                                                                                                    | Yes                         |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase Storage bucket from the web app config                                                                        | Yes                         |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID                                                                                           | Yes                         |
| `VITE_FIREBASE_APP_ID`              | Firebase web app ID                                                                                                    | Yes                         |
| `VITE_CLOUDINARY_CLOUD_NAME`        | Cloudinary cloud name                                                                                                  | For image uploads           |
| `VITE_CLOUDINARY_UPLOAD_PRESET`     | Name of an **unsigned** Cloudinary upload preset                                                                       | For image uploads           |
| `VITE_CLOUDINARY_FOLDER`            | Root folder for uploads                                                                                                | No (default `congregation`) |
| `APP_ENV`                           | `development`, `staging`, or `production`. Any value except `production` shows an environment banner in the dashboard. | No (default `development`)  |

**Where to get them**

- **Firebase:** [Firebase console](https://console.firebase.google.com) → Project settings → Your apps → SDK setup and configuration. The Firebase plugin refuses to start and names any missing value.
- **Cloudinary:** the Cloudinary dashboard for the cloud name, and Settings → Upload → Upload presets for an unsigned preset. Step-by-step instructions are in [docs/cloudinary-setup.md](docs/cloudinary-setup.md).

> **These values are public by design.** Vite inlines every `VITE_*` value into the browser bundle. Firebase web config is not a secret; your data is protected by `firestore.rules`. Even so, never commit `.env`, `.env.staging`, or `.env.production`. They are git-ignored, and keeping each environment in its own file prevents staging and production from being mixed up.

Separate staging and production environments use `.env.staging` and `.env.production` together with the `:staging` and `:production` scripts below. See [docs/firebase-setup.md § Environments](docs/firebase-setup.md#environments).

---

## Backend Setup (Firebase)

Congregation uses **Cloud Firestore**, a schemaless document database. There are **no migrations and no seed scripts**: collections are created on first write, and the data shapes are defined by the TypeScript types in [`types/`](types) and validated by [`firestore.rules`](firestore.rules).

For each Firebase project (do staging first if you have one):

1. **Create a project** and register a **web app**. Copy its config into your `.env` file.
2. **Enable Authentication → Email/Password**, and add `localhost` plus your deployed domain under Authentication → Settings → Authorized domains.
3. **Create a Cloud Firestore database.**
4. **Seed the first Super Admin.** This cannot be done from the app. Create a user under Authentication → Users, copy its **UID**, then create the Firestore document `users/<that-uid>` with the field `roleId: "super-admin"`. The document ID must be the UID, not the email.
5. **Deploy the security rules** with the Firebase CLI:

   ```bash
   firebase login
   firebase deploy --only firestore:rules -P staging      # or -P production
   ```

   The `staging` and `production` aliases are defined in [`.firebaserc`](.firebaserc). If you use your own Firebase projects, update those aliases first, or run `firebase use --add`.

6. **Sign in** at `/login`. Further staff accounts are created from **Settings → Roles & Permissions → Dashboard Access**.

The detailed guides are [docs/firebase-setup.md](docs/firebase-setup.md) and [docs/deployment.md](docs/deployment.md).

> The app does not currently connect to the Firebase Emulator Suite. Local development runs against a real (ideally non-production) Firebase project.

---

## Available Scripts

Run from the repository root with npm.

| Command                                                  | Description                                                                         |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `npm run dev`                                            | Start the dev server on http://localhost:3000 using `.env`                          |
| `npm run dev:staging`                                    | Start the dev server using `.env.staging`                                           |
| `npm run build`                                          | Production build                                                                    |
| `npm run build:staging`                                  | Build using `.env.staging` (fails fast if the file is missing)                      |
| `npm run build:production`                               | Build using `.env.production` (fails fast if the file is missing)                   |
| `npm run generate`                                       | Generate the static SPA (this is what Netlify runs)                                 |
| `npm run generate:staging`                               | Generate using `.env.staging`                                                       |
| `npm run generate:production`                            | Generate using `.env.production`                                                    |
| `npm run preview`                                        | Preview the production build locally                                                |
| `npm run typecheck`                                      | Type-check with `vue-tsc` via `nuxt typecheck`                                      |
| `npm run lint`                                           | Run ESLint                                                                          |
| `npm run lint:fix`                                       | Run ESLint and apply fixes                                                          |
| `npm run format`                                         | Format with Prettier                                                                |
| `npm run format:check`                                   | Check formatting (used in CI)                                                       |
| `npm run test`                                           | Run the Vitest suite once                                                           |
| `npm run test:watch`                                     | Run Vitest in watch mode                                                            |
| `npm run netlify:env -- <staging\|production> [--apply]` | Upload an env file's values to the matching Netlify site (dry run unless `--apply`) |

There are no database migration or seed scripts. See [Backend Setup](#backend-setup-firebase).

---

## Testing and Quality Checks

The test suite uses Vitest with the Nuxt test environment and covers components, composables, repositories, stores, and utilities under [`tests/`](tests). Unit tests use placeholder Firebase values from `.env.test` and never contact a real project.

Before opening a pull request, run the same checks CI runs:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run build
```

A Husky pre-commit hook runs `lint-staged` (ESLint and Prettier) on staged files. Firestore rules are not covered by the test suite; [docs/deployment.md](docs/deployment.md#deploying-security-rules) lists the cases to check in the Rules Playground before deploying.

---

## Deployment

Congregation builds to a **static SPA** (`npm run generate` writes to `dist/`) and can be served by any static host that supports an SPA fallback to `index.html`. The repository is configured for **Netlify**:

- [`netlify.toml`](netlify.toml) runs `npm run generate`, publishes `dist`, and uses Node 22.
- [`public/_redirects`](public/_redirects) provides the SPA fallback for deep links.
- Environment variables are set **per Netlify site**, not in `netlify.toml`. The `npm run netlify:env` script uploads them from `.env.staging` or `.env.production` and verifies them afterwards.

The reference setup uses two Firebase projects and two Netlify sites: the `dev` branch deploys to staging and `main` deploys to production.

**Production checklist (summary)**

1. Set all `VITE_*` variables and `APP_ENV=production` on the hosting provider, then redeploy. Environment changes only take effect on the next build.
2. Complete the Firebase setup above, including the first Super Admin.
3. Deploy `firestore.rules` to the production project.
4. Add the production domain to Firebase Auth's authorized domains.
5. Replace any placeholder copy (for example on `/salvation`) and fill in Settings for your church.

The full runbook, including the security model, Netlify specifics, rules testing, and troubleshooting, is in [docs/deployment.md](docs/deployment.md).

---

## Documentation

| Document                                          | Contents                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| [Getting Started](docs/getting-started.md)        | Local setup, step by step                                                                 |
| [Firebase Setup](docs/firebase-setup.md)          | Creating projects, account roles, granting access, environments                           |
| [Cloudinary Setup](docs/cloudinary-setup.md)      | Configuring image uploads, and troubleshooting                                            |
| [Deployment & Access Control](docs/deployment.md) | Security model, role matrix, audit log, Netlify, deploying rules, go-live checklist       |
| [Architecture](docs/architecture.md)              | Design decisions, authentication flow, data flow, adding a feature                        |
| [UI Conventions](docs/ui-conventions.md)          | Loading states, form fields, hiding pages in production, settings panels, date formatting |
| [Contributing](CONTRIBUTING.md)                   | How to contribute                                                                         |
| [Security Policy](SECURITY.md)                    | How to report a vulnerability                                                             |

---

## Contributing

Contributions are welcome from developers, designers, testers, writers, and churches using Congregation.

1. Fork the repository and create a branch from `dev`, the integration branch (for example `feat/member-export` or `fix/attendance-totals`).
2. Make a focused change that follows the existing conventions: TypeScript, `<script setup>`, feature-folder components, and Firestore access through `repositories/`.
3. Run `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run test`.
4. Commit using [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, `chore:`, ...).
5. Open a pull request and fill in the template.

Read **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full guide.

---

## Community and Support

| Need                                  | Where to go                                                                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Report a bug                          | [Open a bug report](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/issues/new?template=bug_report.md)           |
| Suggest a feature                     | [Open a feature request](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/issues/new?template=feature_request.md) |
| Ask a question or browse known issues | [GitHub Issues](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/issues)                                          |
| Report a security vulnerability       | Do **not** open a public issue. Follow [SECURITY.md](SECURITY.md).                                                              |
| Read the documentation                | [`docs/`](docs)                                                                                                                 |

---

## Sponsorship

<p align="center">
  <a href="https://github.com/sponsors/THE-CHURCH-OF-CHRIST-WORLDWIDE">
    <img src="https://img.shields.io/badge/Sponsor%20Congregation-GitHub%20Sponsors-ea4aaa?style=for-the-badge&logo=githubsponsors&logoColor=white" alt="Sponsor Congregation on GitHub Sponsors">
  </a>
</p>

Congregation is built with the goal of making modern church management technology accessible to churches and faith-based organizations everywhere.

Maintaining and improving an open-source project requires time, resources, and community support.

Your sponsorship helps us continuously improve Congregation, introduce new features, improve reliability and security, maintain documentation, and make the platform better for churches around the world.

Every contribution makes a difference.

**[Become a sponsor →](https://github.com/sponsors/THE-CHURCH-OF-CHRIST-WORLDWIDE)**

---

## License

Congregation is free software, licensed under the **[GNU Affero General Public License v3.0](LICENSE)** (AGPL-3.0-or-later).

In short, you may use, study, modify, and redistribute Congregation. If you distribute a modified version, **or run one as a network service that others use**, you must make its complete source code available to those users under the same license.

Copyright © 2025–2026 Mfonido Mark and THE CHURCH OF CHRIST WORLDWIDE contributors. See [NOTICE](NOTICE) for the copyright notice and the additional attribution terms that apply under section 7 of the license.

---

## Authors

**Mfonido Mark**, Lead Engineer: [@favourmark05](https://github.com/favourmark05) · [@MfonidoMark](https://twitter.com/MfonidoMark)

**Abasifreke Antia**, Designer / Product Manager: [@abasifrekeantia](https://github.com/abasifrekeantia) · [@Seantantiaa](https://twitter.com/Seantantiaa)

---

> _"Technology for the Kingdom: because stewardship should be as excellent as worship."_
