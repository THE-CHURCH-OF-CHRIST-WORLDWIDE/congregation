# Congregation

[![GitHub stars](https://img.shields.io/github/stars/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation?style=social)](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation?style=social)](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/network/members)
[![GitHub issues](https://img.shields.io/github/issues/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation)](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/issues)
[![GitHub license](https://img.shields.io/github/license/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation)](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/blob/main/LICENSE)

An open-source **Church Management System (CMS)** built with Nuxt 4, Vue 3, TypeScript, Tailwind CSS, and Firebase. Congregation helps churches manage members, attendance, giving, events, and communications — and presents a full public-facing website — from a single modern codebase.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment & Access Control](#deployment--access-control)
- [UI Conventions](#ui-conventions)
- [Date Formatting](#date-formatting)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Authors](#authors)

---

## Overview

Congregation is a single-page application (SPA) with two distinct areas:

**Admin Dashboard** (`/admin/*`) — A full-featured CMS for church staff to manage members, attendance, giving, events, teachings, and roles. Protected by Firebase Auth with route-level middleware.

**Public Website** (`/`, `/about-us`, `/events`, `/live-streams`, `/teachings/*`) — A clean, SEO-friendly public site for sharing the church's story, live streams, sermons, Sunday School lessons, and upcoming events.

> Licensed under **GNU AGPL v3** — free to use, modify, and self-host.

---

## Features

### Public Website

- **Home page** — Hero banner, minister welcome, live stream teaser, sermons teaser, events list, congregation search, contact form, photo gallery
- **About Us page** — Church history card, worship activities, leaders grid, activity calendar, service location with embedded map
- **Events page** — Upcoming events with image gallery preview slider, past events with featured card and month/year filtering, full-screen gallery lightbox
- **Live Streams page** — Active live stream cards, recorded stream archive
- **Teachings pages** — Sermons library (with detail pages), Sunday School lessons (with detail pages)

### Admin Dashboard

- **Dashboard** — Stats cards, recent uploads, backslider tracking, charts (bar, donut, line, sparkline)
- **Nominal Roll** — Member table, filters, detail panel, add/import (CSV) modals, role summary chart
- **Attendance** — Service attendance recording, monthly grid view, summary stats
- **Finance** — Income/expense tracking and reporting
- **Events** — Internal event management
- **Teachings** — Sermon and Sunday School upload/management
- **Settings** — Church and public-site content across 14 panels, roles and permissions, dashboard access and email invitations, plus a Super-Admin-only audit log
- **Youth** — Youth ministry section

### Platform

- Firebase Auth with route-guard middleware (`middleware/auth.ts`)
- Cloud Firestore via a repository layer (`repositories/`)
- **Cloudinary-backed image uploads** — every image picker (sermons, hero, minister, leaders, gallery) uploads the file to Cloudinary first, then persists the returned `secure_url` to Firestore. Includes a reusable `<ImageUpload>` component and `useCloudinaryUpload` composable with progress, validation, and error states.
- Pinia stores with optional persistence (`pinia-plugin-persistedstate`)
- CSV import/export for member data
- Chart.js visualisations via `vue-chartjs`
- Iconify icons registered globally — use any icon set anywhere
- **Append-only audit log** — every change made through the dashboard is recorded with its actor and a server timestamp; readable by Super Admins only
- **Accessible form primitives** — `Input` and `Select` associate their label via `for`/`id` and wire `aria-invalid` / `aria-describedby` to their error text
- **Loading states on every async action**, including per-row spinners for row-level work (`usePendingAction`)

---

## Tech Stack

| Area       | Technology                          | Version  |
| ---------- | ----------------------------------- | -------- |
| Framework  | Nuxt 4 (SPA mode)                   | ^4.1.3   |
| UI Library | Vue 3                               | ^3.5.22  |
| Language   | TypeScript (strict)                 | —        |
| Styling    | Tailwind CSS v4                     | ^4.1.15  |
| State      | Pinia + persistedstate              | ^3.0.3   |
| Icons      | Iconify for Vue                     | ^5.0.0   |
| Charts     | Chart.js + vue-chartjs              | ^4.5.1   |
| Dates      | date-fns (via `utils/date.ts`)      | ^4.2.1   |
| Backend    | Firebase (Auth, Firestore, Storage) | ^12.10.0 |
| Media      | Cloudinary (unsigned uploads)       | —        |
| Routing    | Vue Router                          | ^4.6.3   |
| License    | GNU AGPL v3                         | —        |

---

## Project Structure

```
congregation/
├── assets/
│   └── css/
│       └── main.css                  # Tailwind entry point + custom theme tokens
│
├── components/
│   ├── about/                        # /about-us page sections
│   │   ├── AboutHero.vue
│   │   ├── ChurchHistoryCard.vue
│   │   ├── WorshipActivities.vue
│   │   ├── ChurchLeaders.vue
│   │   ├── ActivityCalendar.vue
│   │   └── WorshipThisSunday.vue
│   ├── attendance/                   # Attendance admin components
│   │   ├── AttendanceSummary.vue
│   │   ├── AttendanceTable.vue
│   │   └── MonthlyGrid.vue
│   ├── charts/                       # Chart.js wrappers
│   │   ├── BarChart.vue
│   │   ├── DonutChart.vue
│   │   ├── LineChart.vue
│   │   └── SparkLine.vue
│   ├── dashboard/                    # Admin dashboard widgets
│   │   ├── BacksliderTable.vue
│   │   ├── RecentUploads.vue
│   │   └── StatsCard.vue
│   ├── events/                       # /events page components
│   │   ├── EventTabToggle.vue
│   │   ├── UpcomingPreviewPanel.vue
│   │   ├── UpcomingEventList.vue
│   │   ├── ImageSlider.vue
│   │   ├── GalleryLightbox.vue
│   │   ├── PastEventFeatured.vue
│   │   ├── PastEventList.vue
│   │   ├── PastEventMonthYearTabs.vue
│   │   └── SpeakerAvatars.vue
│   ├── home/                         # Home page sections
│   │   ├── HeroBanner.vue
│   │   ├── MinisterWelcome.vue
│   │   ├── LiveStreamTeaser.vue
│   │   ├── SermonsTeaser.vue
│   │   ├── EventsList.vue
│   │   ├── CongregationSearch.vue
│   │   ├── ContactForm.vue
│   │   └── PhotoGallery.vue
│   ├── layout/                       # App-wide shell components
│   │   ├── TheNavbar.vue
│   │   └── TheFooter.vue
│   ├── live-streams/                 # /live-streams page components
│   │   ├── LiveNowCard.vue
│   │   ├── StreamCard.vue
│   │   └── EmptyStreamState.vue
│   ├── nominal-roll/                 # Member management admin components
│   │   ├── MemberTable.vue
│   │   ├── MemberFilters.vue
│   │   ├── MemberDetailPanel.vue
│   │   ├── AddMemberModal.vue
│   │   ├── ImportCsvModal.vue
│   │   └── RoleSummaryChart.vue
│   ├── settings/                     # Settings panels and primitives
│   │   ├── AuditLogPanel.vue         # Who changed what (Super Admin only)
│   │   ├── RolesPanel.vue
│   │   ├── SettingsNav.vue
│   │   ├── SettingsRepeater.vue
│   │   ├── SettingsSaveBar.vue
│   │   └── SettingsSection.vue
│   ├── teachings/                    # Teachings admin components
│   │   ├── SermonCard.vue
│   │   └── UploadForm.vue
│   └── ui/                           # Reusable primitives (auto-imported)
│       ├── Avatar.vue
│       ├── Badge.vue
│       ├── Button.vue
│       ├── Card.vue
│       ├── CategoryBadge.vue
│       ├── ContentCard.vue
│       ├── EditField.vue
│       ├── EmptyState.vue
│       ├── EnvironmentBanner.vue      # Names the environment outside production
│       ├── GalleryUploader.vue
│       ├── HowToSteps.vue
│       ├── ImageUpload.vue
│       ├── InfoField.vue
│       ├── Input.vue
│       ├── LoadingState.vue
│       ├── MapEmbed.vue
│       ├── Modal.vue
│       ├── Pagination.vue
│       ├── SectionHeader.vue
│       ├── Select.vue
│       ├── Tabs.vue
│       ├── ToastContainer.vue
│       ├── TagFilterBar.vue
│       └── VideoPlayer.vue
│
├── composables/
│   ├── useCloudinaryUpload.ts        # Unsigned Cloudinary upload with progress
│   ├── useExportCSV.ts               # Member CSV export
│   ├── useFieldDensity.ts            # Lets a container set the size of the fields inside it
│   ├── useFinancePdf.ts              # Finance report PDF export
│   ├── useGalleryData.ts             # Gallery category lookups
│   ├── useImportCsv.ts               # Member CSV import
│   ├── useLiveStreams.ts             # Public live stream helpers
│   ├── usePageHeader.ts              # Admin header title/subtitle
│   ├── usePagination.ts              # Reusable table pagination
│   ├── usePendingAction.ts           # Per-row pending state for async row actions
│   ├── useScrollReveal.ts            # Scroll-into-view animations
│   └── useToast.ts                   # Toast notifications
│
├── docs/
│   ├── getting-started.md
│   ├── firebase-setup.md
│   ├── architecture.md
│   └── contributing.md
│
├── layouts/
│   ├── default.vue                   # Public site layout (TheNavbar + slot + TheFooter)
│   └── admin.vue                     # Admin layout (sidebar + slot)
│
├── middleware/
│   └── auth.ts                       # Firebase Auth route guard
│
├── pages/
│   ├── index.vue                     # Home (/)
│   ├── login.vue                     # Login (/login)
│   ├── about-us/
│   │   └── index.vue                 # About Us (/about-us)
│   ├── invite/
│   │   └── index.vue                 # Accept an emailed invitation (/invite)
│   ├── register/
│   │   └── index.vue                 # Public member registration (/register)
│   ├── salvation/
│   │   └── index.vue                 # God's Plan for Salvation (/salvation)
│   ├── gallery/
│   │   └── [category].vue            # Gallery by category (/gallery/:category)
│   ├── events/
│   │   └── index.vue                 # Events (/events?tab=upcoming|past)
│   ├── live-streams/
│   │   └── index.vue                 # Live Streams (/live-streams)
│   ├── teachings/
│   │   ├── sermons/
│   │   │   ├── index.vue             # Sermons list (/teachings/sermons)
│   │   │   └── [slug].vue            # Sermon detail (/teachings/sermons/:slug)
│   │   └── sunday-school/
│   │       ├── index.vue             # Sunday School list
│   │       └── [slug].vue            # Lesson detail
│   └── admin/
│       ├── index.vue                 # Admin dashboard (/admin)
│       ├── nominal-roll/
│       │   └── index.vue             # Member management
│       ├── attendance/
│       │   ├── index.vue             # Attendance overview
│       │   └── [service].vue         # Per-service attendance
│       ├── finance/
│       │   └── index.vue
│       ├── events/
│       │   └── index.vue
│       ├── teachings/
│       │   ├── index.vue
│       │   └── upload.vue
│       ├── youth/
│       │   └── index.vue
│       └── settings/
│           └── index.vue
│
├── plugins/
│   ├── firebase.client.ts            # Initialises Firebase app
│   └── iconify.client.ts             # Registers <Icon> globally
│
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── images/
│       └── heroImg.png
│
├── repositories/                     # Firestore data access layer
│   ├── auditRepository.ts            # auditLog — append-only activity record
│   ├── churchSettingsRepository.ts   # settings/church document
│   ├── invitationsRepository.ts      # invitations/{email} — pending invites
│   ├── membersRepository.ts          # members collection (nominal roll)
│   ├── roleAssignmentsRepository.ts  # roleAssignments — member ↔ role
│   ├── rolesRepository.ts            # roles/{roleId} — permission overrides
│   └── usersRepository.ts            # users/{uid} — account roles (grants access)
│
├── stores/
│   ├── accounts.ts                   # users/{uid} records — who may write
│   ├── attendance.ts                 # Attendance records (admin)
│   ├── audit.ts                      # Activity log; `record()` is fire-and-forget
│   ├── auth.ts                       # Firebase Auth state + the account's role
│   ├── churchSettings.ts             # Church configuration
│   ├── events.ts                     # Public events state
│   ├── finance.ts                    # Finance records (admin)
│   ├── invitations.ts                # Invite by email, and claiming an invite
│   ├── members.ts                    # Member records (admin)
│   ├── publicLiveStream.ts           # Public live stream state
│   ├── publicTeachings.ts            # Public sermons/lessons state
│   ├── roles.ts                      # Role definitions and member assignments
│   ├── teachings.ts                  # Teachings management (admin)
│   ├── toast.ts                      # Toast queue
│   └── ui.ts                         # Global UI state (modals, sidebar)
│
├── types/
│   ├── index.ts                      # Admin domain types (Member, Sermon, etc.)
│   ├── public.ts                     # Public site types (LiveStream, ChurchEvent, etc.)
│   ├── events.ts                     # Events page types (UpcomingEvent, PastEvent, Speaker)
│   └── iconify.d.ts                  # Global <Icon> component declaration
│
├── utils/
│   └── date.ts                       # Date formatting helpers (date-fns wrapper)
│
├── app.vue                           # Root — initialises auth + seeds mock data
├── nuxt.config.ts                    # Nuxt configuration
├── tsconfig.json
└── package.json
```

---

## Prerequisites

- **Node.js** v22 or higher (see `.nvmrc`)
- **npm** (or yarn / pnpm)
- **Git**
- **Firebase CLI** — `npm install -g firebase-tools`
- A Google account with an active Firebase project

**Recommended:**

- VS Code with the [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar), [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss), and Prettier extensions
- Firebase Emulator Suite for local backend development

---

## Getting Started

```bash
git clone https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation.git
cd congregation
npm install
```

Copy the environment variable template and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev        # http://localhost:3000
```

Other commands:

```bash
npm run build      # Production build
npm run generate   # Static site generation
npm run preview    # Preview production build
```

For the full setup guide including Firebase project creation, see [docs/getting-started.md](docs/getting-started.md).

---

## Environment Variables

Create a `.env` file at the project root with your Firebase project credentials and Cloudinary upload settings:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Cloudinary — host for all uploaded images
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
VITE_CLOUDINARY_FOLDER=congregation

# One of: development | staging | production
APP_ENV=development
```

All `VITE_`-prefixed variables are exposed to the browser (SPA mode). Never commit real credentials — `.env` is git-ignored.

### Environments

Staging and production are **separate Firebase projects**, each with its own git-ignored env file — `.env.staging` and `.env.production`, plus `.env` as the local development default:

```bash
npm run dev                 # uses .env
npm run dev:staging         # uses .env.staging
npm run build:staging       # uses .env.staging
npm run build:production    # uses .env.production
npm run generate:staging    # uses .env.staging
npm run generate:production # uses .env.production
```

Each script fails immediately if its env file is missing, rather than silently building an empty Firebase config.

Any `APP_ENV` other than `production` shows a banner in the admin header naming the connected Firebase project, so a staging session never looks like the live site. Firebase CLI targets are aliased in `.firebaserc` (`firebase use staging` / `firebase use production`).

Deploys are hosted on **Netlify** as two separate sites — `coc-abadina-prod` builds `main` against the production Firebase project, `coc-abadina-staging` builds `dev` against staging. [netlify.toml](netlify.toml) holds the shared build settings only; `APP_ENV` and the credentials are set per site (`npm run netlify:env -- staging|production`) rather than committed, because a committed value would apply to both sites.

See [docs/firebase-setup.md](docs/firebase-setup.md#environments) for the full setup.

### Image uploads (Cloudinary)

Every image picker in the app (sermon thumbnails, hero image, minister and congregation photos, leader avatars, gallery photos) follows the same flow:

1. User picks or drops a file.
2. The file is POSTed to Cloudinary using an **unsigned upload preset**.
3. Cloudinary returns a `secure_url`.
4. That URL is saved to Firestore — never the raw file or a base64 string.
5. The URL is what's read back whenever the image is rendered.

#### Setting up Cloudinary

The free tier is more than enough for a single church. Setup takes a few minutes:

**1. Get your Cloud Name**

Sign up at [cloudinary.com](https://cloudinary.com/) and open the dashboard. The top of the page shows **Product Environment Credentials** — copy the **Cloud name** (something like `dxxxx1234`). You don't need the API key or secret because uploads from the browser are unsigned.

**2. Create an unsigned upload preset**

This is the access token that lets the browser POST images directly without exposing your API secret.

1. Click the **gear icon** (Settings) in the left sidebar of the dashboard.
2. Open the **Upload** tab → scroll to **Upload presets** → click **Add upload preset**.
3. Fill in:
   - **Preset name** — anything memorable, e.g. `congregation_unsigned`. Copy this exact string into `.env`.
   - **Signing Mode** — set to **Unsigned**. This is the critical setting.
   - **Folder** — leave blank. The app already files uploads into sub-folders like `congregation/sermons`, `congregation/leaders`, `congregation/gallery`.
   - **Allowed formats** (recommended) — `jpg, png, webp, gif`.
   - **Max file size** (recommended) — `5000000` (5 MB), matches the client-side limit.
4. Click **Save**.

**3. Fill in `.env`**

```env
VITE_CLOUDINARY_CLOUD_NAME=dxxxx1234
VITE_CLOUDINARY_UPLOAD_PRESET=congregation_unsigned
VITE_CLOUDINARY_FOLDER=congregation        # optional — defaults to "congregation"
```

`VITE_CLOUDINARY_FOLDER` is the root namespace under which every image lives. Individual uploaders pin sub-folders on top (e.g. the hero uploader uses `congregation/hero`, leaders use `congregation/leaders`).

**4. Restart the dev server**

Vite only reads `.env` at startup:

```bash
npm run dev
```

**5. Verify it works**

1. Open `/admin/settings` → **Homepage** tab.
2. Drag an image into **Building Photo**. You should see a progress overlay (`Uploading… 42%`), then a preview.
3. Click **Save Settings**.
4. Check your Cloudinary **Media Library** — the file should be under `congregation/hero/`.
5. Check Firestore (`settings/church` document) — `heroImageUrl` should hold the `https://res.cloudinary.com/...` URL.

#### Troubleshooting

| Symptom                                          | Fix                                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `Cloudinary is not configured` error             | You didn't restart `npm run dev` after editing `.env`.                                 |
| `Upload preset must be whitelisted for unsigned` | The preset is set to **Signed** mode. Edit it and switch Signing Mode to **Unsigned**. |
| `Invalid cloud name`                             | Typo, or you copied the dashboard URL instead of just the cloud name string.           |
| Image uploads but doesn't persist after refresh  | Firestore save failed. Check the browser console and your Firestore security rules.    |

#### Where the integration lives

- [`composables/useCloudinaryUpload.ts`](composables/useCloudinaryUpload.ts) — handles the upload, exposes `uploading` / `progress` / `error` reactive state, and returns the `secure_url`.
- [`components/ui/ImageUpload.vue`](components/ui/ImageUpload.vue) — drag-and-drop image picker with live progress, replace/remove overlay, and `shape="circle"` / `compact` variants. Drop it anywhere with `v-model` bound to a URL string.

---

## Deployment & Access Control

Everything needed to stand a congregation up on its own Firebase projects and Netlify sites, and to decide who may change what. [docs/firebase-setup.md](docs/firebase-setup.md) carries the same material in more depth; this section is the operational checklist.

### Security model

Signing in and being allowed to write are separate things. Privilege comes from exactly one place: a `users/{uid}` document in Firestore, which [`firestore.rules`](firestore.rules) reads on every write. An account with no such document can sign in and see the dashboard shell but cannot change anything — the admin header shows a red banner saying so, rather than letting each save fail on its own.

Six collections, with deliberately different exposure:

| Collection        | Holds                                           | Notes                                                      |
| ----------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| `users/{uid}`     | The role a Firebase Auth account carries        | **Grants privilege.** Every write rule is gated on it      |
| `invitations`     | Pending invitations, keyed by lower-cased email | Claimed on first sign-in; the only self-service role grant |
| `roles/{roleId}`  | Permission-matrix overrides only                | Names, ids and colours stay in code                        |
| `roleAssignments` | Which nominal-roll member holds which role      | Presentational — records standing, not access              |
| `auditLog`        | Append-only record of who changed what          | Super Admin reads; staff append; nobody edits or deletes   |
| `settings/church` | Public site content                             | World-readable; the landing page reads it signed out       |
| `members`         | The nominal roll                                | Never publicly readable; `/register` may create only       |

Who may do what:

|                    | `settings` | `members`                    | `users`             | `roles` | `roleAssignments` | `invitations`   | `auditLog`   |
| ------------------ | ---------- | ---------------------------- | ------------------- | ------- | ----------------- | --------------- | ------------ |
| Super Admin        | read+write | read+write                   | read+write          | r+w     | read+write        | read+write      | read, append |
| Admin              | read+write | read+write                   | read                | read    | read              | read            | append only  |
| Other staff        | read       | read+write                   | read                | read    | read              | read            | append only  |
| Signed in, no role | read       | —                            | own doc; claim only | —       | —                 | own invite only | —            |
| Anonymous          | read       | create only, via `/register` | —                   | —       | —                 | —               | —            |

Staff roles are `super-admin`, `admin`, `elder`, `deacon`, `preacher`, `secretary`, `youth-leader`, `financial-secretary`. That list appears in three places which must stay in step: `isStaff()` in [`firestore.rules`](firestore.rules), `STAFF_ROLES` in [`stores/auth.ts`](stores/auth.ts), and `ChurchRoleId` in [`types/index.ts`](types/index.ts).

Rules are the coarse floor; the per-page matrix in Settings → Roles & Permissions is finer-grained on top of it.

### Roles & permissions

Three things carry the word "role" and are deliberately separate. Confusing them is the most common source of "why can't this person do X":

| Concept             | Lives in                           | Answers                              | Enforced by                   |
| ------------------- | ---------------------------------- | ------------------------------------ | ----------------------------- |
| **Role definition** | `DEFAULT_ROLES` + `roles/{roleId}` | "What may an Elder do?"              | The app's UI matrix           |
| **Role assignment** | `roleAssignments`                  | "Who are our elders?"                | Nothing — it records standing |
| **Account access**  | `users/{uid}`                      | "May this login change church data?" | **Firestore rules**           |

A member on the nominal roll can be an elder with no login at all, and a login can exist with no member record. Only `users/{uid}` gates anything.

#### Default permission matrix

Eight pages × five actions — **V**iew, **A**dd, **E**dit, **D**elete, e**X**port. Generated from [`stores/roles.ts`](stores/roles.ts):

| Role                | Dash  | Roll  | Youth | Att   | Teach | Events | Fin   | Set   |
| ------------------- | ----- | ----- | ----- | ----- | ----- | ------ | ----- | ----- |
| Super Admin         | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX  | VAEDX | VAEDX |
| Admin               | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX  | VAEDX | VAEDX |
| Elder               | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX  | VX    | V     |
| Deacon              | VAE   | VAE   | VAE   | VAE   | V     | V      | V     | —     |
| Preacher            | VAEDX | V     | V     | V     | VAEDX | VAEDX  | —     | —     |
| Secretary           | VAEX  | VAEX  | VAEX  | VAEX  | VAEX  | VAEX   | VX    | V     |
| Youth Leader        | VAEX  | V     | VAEX  | VAEX  | V     | V      | —     | —     |
| Financial Secretary | VAEDX | V     | —     | —     | —     | —      | VAEDX | —     |

**Admin** matches Super Admin in the matrix above but not in the rules: it may save church settings, and manage members, attendance, finance, teachings and events — but not `users`, `roles`, `roleAssignments` or `invitations`, and it cannot read the audit log. Only **Super Admin** manages who has access. The `V` that Elder and Secretary hold on Settings is view-only, and the rules enforce that independently of the matrix.

#### Managing them

All three live under **Settings → Roles & Permissions**:

- **Role Definitions** — click a role to open its matrix. Toggling any action auto-enables `view`; clearing `view` clears the row. Saving writes a `roles/{roleId}` document holding **only** the permissions, so ids, names and colours stay code-defined — an override cannot rename or invent a role. On load the app rebuilds from the code defaults and layers stored overrides on top, so a role added in code later still appears and an override for a deleted role is ignored.
- **Member Assignments** — assign a role to a nominal-roll member, optionally with **custom permissions** that override that role's defaults for that person only. Where someone holds several roles, `effectivePermissions()` merges them: any role granting an action grants it, and a custom override wins over the role default either way.
- **Dashboard Access** — invitations and `users/{uid}` records. See [Inviting people](#inviting-people).

Everything on this screen persists to Firestore. Writing any of it requires Super Admin, so a `deacon` opening the page can read the matrix but not change it — the controls render as plain text rather than inputs.

#### Adding a role

Roles are code-defined, so a new one is a code change: add it to `DEFAULT_ROLES` in [`stores/roles.ts`](stores/roles.ts), and if it should be able to write church data, add its id to `ChurchRoleId` in [`types/index.ts`](types/index.ts), `STAFF_ROLES` in [`stores/auth.ts`](stores/auth.ts), and `isStaff()` in [`firestore.rules`](firestore.rules) — then redeploy the rules. Missing the rules step gives a role that looks correct in the UI and is refused by the backend.

### First-time setup, per Firebase project

Do all of this on **staging first**, then repeat on production. Order matters — step 4 refuses every write from an account without a role, and no rule lets an account grant itself one, so seeding comes first.

1. **Create the project** and register a web app (Project Settings → Your apps → SDK setup). Copy the config into the matching env file.
2. **Enable Authentication** → Sign-in method:
   - **Email/Password**
   - **Email link (passwordless sign-in)** — required for invitations to send
   - Under **Settings → Authorized domains**, add the site's Netlify domain and `localhost`. Sign-in fails silently without this.
3. **Seed the first Super Admin.** There is no way to bootstrap this from the app:
   - **Authentication → Users** → copy the UID.
   - **Firestore → Data** → create `users/<that-uid>` with `roleId: "super-admin"` (and `email` for legibility).
   - Confirm the document id is the **UID, not the email** — this is the most common way to get locked out.
4. **Deploy the rules** (see below) and verify: a setting saves, and the red no-role banner does not appear.
5. **Create the Firestore database** and enable **Storage** if not already done.

Locked out anyway? Rules never restrict the Firebase console — fix or create the `users/{uid}` document under Firestore → Data. Console access is governed by Google Cloud IAM.

### Audit log

**Settings → Access → Audit Log**, visible to Super Admins only. Every change the dashboard makes is recorded: a member added, updated or deleted; settings saved; role permissions changed; roles assigned or revoked; dashboard access granted or revoked; invitations sent, revoked or claimed. Each entry carries who did it, what changed, and a server-side timestamp.

The rules make the collection **append-only** — `allow update, delete: if false` — so an entry cannot be edited or quietly removed by anyone, Super Admin included. Appending requires a staff role and `actorUid` must equal the caller, so nobody can write an entry attributed to someone else. Reading requires Super Admin.

**What this is not.** Entries are written by the client as each change succeeds. That evidences what the app did, but nothing can compel a client to write one — somebody using the Firebase SDK directly with valid credentials could change `members` and skip the log. Treat it as accountability among trusted staff, not a tamper-proof trail. A trail that cannot be bypassed needs a Firestore trigger in Cloud Functions, which requires the Blaze plan.

Logging never interferes with the work it describes: `record()` is fire-and-forget and swallows its own failures, so a refused log entry cannot turn a successful save into a visible error.

### Inviting people

Once a Super Admin exists, everyone else is invited from the app — no console, no shared passwords: **Settings → Roles & Permissions → Dashboard Access → Invite by email**.

The invitee receives a sign-in link; opening it creates their account and applies the role. Pending invitations are listed on the same card and can be revoked until claimed. Where an account already exists and only needs a role, use the collapsed **"Or grant an existing account by UID"** fallback.

Optionally link the invitation to a nominal-roll member. That carries through to `users/{uid}.memberId` when the invitation is claimed, so the login and the member record describe one person rather than two unrelated things. Rules require any `memberId` on a claim to match the one the invitation names, so a claimer cannot attach their login to someone else's record.

This works without Cloud Functions or the Blaze plan by having the invitee claim their own role, with the rules policing the claim: `users/{uid}` may be **created** (never updated) only for the caller's own uid, only with a **verified** email, and only with the exact `roleId` the invitation names. Knowing an invited address is not enough — you must be able to read that mailbox. The invitation is deleted on claim so it cannot be reused.

### Signing in

Three routes, because invited accounts are created by email link and therefore have **no password**:

| Route                       | For                                                                               |
| --------------------------- | --------------------------------------------------------------------------------- |
| Email + password            | Accounts that have set one                                                        |
| **Email me a sign-in link** | Invited accounts with no password, or any device where you are signed out         |
| **Forgot your password?**   | Resetting — and also how a link-only account _sets_ a password for the first time |

All three are on `/login`. Without the middle one an invited person is locked out the moment they sign out or open the dashboard on another device, since they have no password to type.

### Environment variables on Netlify

Two Netlify sites, each with its own copy of ten variables. [`netlify.toml`](netlify.toml) is committed and shared by both, so **no environment values belong in it** — each site is the `production` context for its own branch, and a committed `APP_ENV` would label staging as production.

```bash
npx netlify-cli login                       # once per machine

npm run netlify:env -- staging              # dry run: shows old → new, values masked
npm run netlify:env -- staging --apply

npm run netlify:env -- production           # dry run
npm run netlify:env -- production --apply
```

Each environment names its own site and passes it with `--site`, so the locally linked project is irrelevant and no re-linking is needed. The script refuses to run if either env file is missing a value or if the two share a Firebase project ID or API key, and after writing it reads the values back — it will not report success the site has not confirmed.

Environment variable changes only take effect on the **next** build. Trigger a redeploy afterwards.

When inspecting variables by hand, always pass a context — `netlify env:list` defaults to `dev`, which is not what a deploy builds with and will report variables as unset:

```bash
npx netlify-cli env:list --site coc-abadina-prod --context production
```

### Deploying security rules

[`firestore.rules`](firestore.rules) is the single source of truth for both projects. Never edit rules in the console — the next deploy silently reverts them.

```bash
firebase deploy --only firestore:rules -P staging
# verify on staging, then:
firebase deploy --only firestore:rules -P production
```

Rules are not covered by the test suite. Before a production deploy, exercise these in **Firestore → Rules → Playground** — they are the cases the rules are written against:

| Attempt                                                          | Expected |
| ---------------------------------------------------------------- | -------- |
| `get` on `members/x` as an unauthenticated visitor               | deny     |
| `get` on `members/x` as signed-in with no role                   | deny     |
| `create` on `users/<own-uid>` with a role the invitation ≠ names | deny     |
| `create` on `users/<someone-else-uid>` as an invited user        | deny     |
| `create` on `invitations/x@y.com` as a `deacon`                  | deny     |
| `write` on `settings/church` as your seeded Super Admin          | allow    |

### Going live: ordered checklist

1. Apply the Netlify variables for both sites and redeploy both.
2. Complete the per-project Firebase setup above, staging first.
3. Deploy rules to staging; confirm saves work and invitations send and can be claimed.
4. Deploy rules to production.
5. Merge `dev` → `main`. Production is a separate site building `main`, so until then it has neither `netlify.toml` nor `public/_redirects` — wrong publish directory and 404s on deep links.
6. Replace the placeholder copy in [`pages/salvation/index.vue`](pages/salvation/index.vue) before pointing anyone at it; it is linked from the footer on every public page.

### Troubleshooting

| Symptom                                                | Cause                                                                 | Fix                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `Firebase config is missing VITE_…` on a deployed site | The build had no environment variables                                | Apply them for that site, then **redeploy** — env changes need a build   |
| `auth/invalid-api-key` locally                         | The `--dotenv` file was missing, so the build shipped an empty config | The `*:staging` / `*:production` scripts now fail fast; create the file  |
| Red "no role assigned" banner                          | The account has no `users/{uid}` document                             | A Super Admin grants a role, or seed it in the console                   |
| Staging shows production data                          | Both sites hold the same variables                                    | `npm run netlify:env -- staging --apply`, then redeploy                  |
| Deploy fails: "secrets detected in build output"       | Vite inlines `VITE_*` into the bundle by design                       | `SECRETS_SCAN_OMIT_KEYS` in `netlify.toml` — extend it for new variables |
| Deep links 404 in production (`/gallery/photos`)       | The SPA fallback is missing                                           | Confirm `public/_redirects` survived into `dist/_redirects`              |
| Invitation email never arrives                         | Email link sign-in disabled, or the domain is not authorized          | Enable both under Authentication (step 2 above)                          |
| Login works, then nothing loads                        | Rules deployed before a Super Admin was seeded                        | Create `users/<uid>` in the console                                      |

---

## UI Conventions

Patterns worth following rather than reinventing. All of these are enforced by tests.

### Loading states

Every button that waits on something shows it. Single actions bind to the store's pending flag:

```vue
<Button :loading="membersStore.saving" @click="save">Save</Button>
```

Row-level actions must **not** use that flag — binding every row to one shared boolean makes them
all spin when you click one. Use [`usePendingAction`](composables/usePendingAction.ts), which
tracks pending work by key and ignores a repeat click while one is in flight:

```ts
const { isPending, run } = usePendingAction()
await run(member.id, () => membersStore.deleteMember(member.id))
```

```vue
<button :disabled="isPending(member.id)">
  <Icon :icon="isPending(member.id) ? 'mdi:loading' : 'mdi:trash-can-outline'" />
</button>
```

A spinner is only worth adding where something is actually awaited. The attendance, events,
finance and teachings stores are still synchronous (localStorage, pending their repository
migration), so a spinner there would never paint a frame — those buttons get one for free once
those stores move behind repositories.

### Form fields

Use `Input` / `Select` rather than a bare `<input>`: they generate an id, point their label at it
with `for`, and set `aria-invalid` plus `aria-describedby` on the error text. Pass `:error` to show
a message — never render one beside the field yourself, or screen readers will not connect them.

Density is inheritable. A container declares it once instead of every field repeating a `size`:

```vue
<SettingsSection title="Calendar Rows" density="sm">
```

An explicit `size` on a field still wins, so a single field can opt out.

### Hiding a page in production

Some pages are ready for staging but not for the congregation. Add the route to
`STAGING_ONLY_ROUTES` in [`constants/index.ts`](constants/index.ts):

```ts
export const STAGING_ONLY_ROUTES: string[] = [
  '/admin/finance', // and everything beneath it
  '/salvation',
]
```

That is the only edit. The route then 404s in production via a global middleware, and it drops out
of the admin sidebar and the footer's link lists automatically. Staging and local development are
untouched — the work stays reachable where it is reviewed.

Matching is by path segment, so `/admin/finance` covers `/admin/finance/reports` but not
`/admin/finance-archive`. Query strings and hashes are ignored, so `/salvation` also hides
`/salvation#hear`.

For a link written inline rather than driven by an array — most of the public navbar — guard it
with the composable:

```vue
<NuxtLink v-if="!isHidden('/events')" to="/events">Events</NuxtLink>
```

```ts
const { isHidden, isProduction } = useRouteVisibility()
```

> **This hides pages; it does not secure them.** The code still ships in the production bundle, so
> anyone can read it, and the data is still whatever Firestore will serve. Anything that must not
> be reachable belongs in `firestore.rules`.

### Settings panels

Three primitives, in [`components/settings/`](components/settings/):

| Component          | Use for                                                                       |
| ------------------ | ----------------------------------------------------------------------------- |
| `SettingsSection`  | A titled block. Always pass `description` — say where the fields surface      |
| `SettingsRepeater` | A list of editable rows: column headings once, remove control in its own cell |
| `SettingsSaveBar`  | The page-level save affordance; sticky, appears only while the draft is dirty |

Panels do **not** carry their own save button. The page holds one draft shared by every panel, so
"is anything unsaved?" is a page-level question — thirteen separate buttons made it possible to
edit one panel, switch to another, and lose track. The page also guards against losing work:
`beforeunload` for tab close, `onBeforeRouteLeave` for in-app navigation, and ⌘S / Ctrl+S to save.

---

## Date Formatting

All date display in the app goes through [`utils/date.ts`](utils/date.ts), a thin wrapper over [`date-fns`](https://date-fns.org/). The wrapper is auto-imported by Nuxt, so the helpers are available anywhere — components, pages, stores, composables — without an `import` statement.

**Why a wrapper?**

- Single source of truth for formatting patterns — changing `"d MMM yyyy"` to `"d MMM, yyyy"` is a one-line change in `utils/date.ts`, not a grep-and-replace across 8 files.
- Inputs are forgiving (`Date | string | number | null | undefined`) and invalid input returns `''` instead of `"Invalid Date"`, so the UI never blows up on missing data.
- ISO strings (`"2026-03-05"`) are parsed without timezone shift via `parseISO`.
- The underlying library can be swapped later (e.g. to Day.js or Luxon) without touching call sites.

### API

```ts
formatDate(input, style?)        // Format a date
formatRelative(input)            // "2 days ago", "in 5 minutes"
formatDateRange(start, end)      // "5 – 11 Mar 2026"
toISODate(input)                 // "2026-03-05" (storage / <input type="date">)
```

### Styles

`formatDate(input, style)` accepts the following styles (default: `'short'`):

| Style       | Output                 | Use case                                |
| ----------- | ---------------------- | --------------------------------------- |
| `short`     | `5 Mar 2026`           | Compact display — sermons, finance rows |
| `long`      | `5 March 2026`         | Formal — member profile fields          |
| `full`      | `Friday, 5 March 2026` | Headline date — live stream banner      |
| `numeric`   | `05/03/2026`           | Tight columns — dashboard widgets       |
| `dayMonth`  | `5 Mar`                | No-year labels — attendance week ticks  |
| `monthYear` | `March 2026`           | Page headings — attendance per service  |
| `iso`       | `2026-03-05`           | Storage and `<input type="date">`       |

### Examples

```vue
<template>
  <p>Uploaded {{ formatDate(sermon.date, 'numeric') }}</p>
  <p>Joined {{ formatDate(member.dateJoined, 'long') }}</p>
  <p>{{ formatRelative(event.createdAt) }}</p>
  <p>{{ formatDateRange(event.start, event.end) }}</p>
</template>
```

```ts
// stores/attendance.ts
const label = formatDate(weekStart, 'dayMonth') // "5 Mar"
```

### Adding a new style

Edit [`utils/date.ts`](utils/date.ts):

1. Add the variant to the `DateStyle` union.
2. Add the corresponding [date-fns format token](https://date-fns.org/docs/format) to the `PATTERNS` map.

That's it — TypeScript will then offer the new style at every call site.

---

## Documentation

| Document                                   | Description                                     |
| ------------------------------------------ | ----------------------------------------------- |
| [Getting Started](docs/getting-started.md) | Full local setup and Firebase configuration     |
| [Firebase Setup](docs/firebase-setup.md)   | Firestore rules, Storage config, Auth providers |
| [Architecture](docs/architecture.md)       | Codebase design decisions and patterns          |
| [Contributing](docs/contributing.md)       | Branching, commit conventions, PR process       |

---

## Contributing

Contributions are welcome. Please read [docs/contributing.md](docs/contributing.md) before opening a pull request.

Commits follow the [Conventional Commits](https://www.conventionalcommits.org/) spec: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc.

---

## License

Distributed under the **GNU Affero General Public License v3.0**. See [LICENSE](LICENSE) for full details.

---

## Authors

**Mfonido Mark** — Lead Engineer

- GitHub: [@favourmark05](https://github.com/favourmark05)
- Twitter: [@MfonidoMark](https://twitter.com/MfonidoMark)
- Email: MfonidoMark@gmail.com

**Abasifreke Antia** — Designer / Product Manager

- GitHub: [@abasifrekeantia](https://github.com/abasifrekeantia)
- Twitter: [@Seantantiaa](https://twitter.com/Seantantiaa)
- Email: abasifrekeantiaa@gmail.com

---

> _"Technology for the Kingdom — because stewardship should be as excellent as worship."_
