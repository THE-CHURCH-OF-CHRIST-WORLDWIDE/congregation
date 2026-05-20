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
- **Settings** — Church settings, role and permissions management
- **Youth** — Youth ministry section

### Platform

- Firebase Auth with route-guard middleware (`middleware/auth.ts`)
- Cloud Firestore via a repository layer (`repositories/`)
- **Cloudinary-backed image uploads** — every image picker (sermons, hero, minister, leaders, gallery) uploads the file to Cloudinary first, then persists the returned `secure_url` to Firestore. Includes a reusable `<ImageUpload>` component and `useCloudinaryUpload` composable with progress, validation, and error states.
- Pinia stores with optional persistence (`pinia-plugin-persistedstate`)
- CSV import/export for member data
- Chart.js visualisations via `vue-chartjs`
- Iconify icons registered globally — use any icon set anywhere

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
│   ├── settings/
│   │   └── RolesPanel.vue
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
│       ├── HowToSteps.vue
│       ├── InfoField.vue
│       ├── Input.vue
│       ├── MapEmbed.vue
│       ├── Modal.vue
│       ├── SectionHeader.vue
│       ├── Select.vue
│       ├── Tabs.vue
│       ├── TagFilterBar.vue
│       └── VideoPlayer.vue
│
├── composables/
│   ├── useEventsMockData.ts          # Seeds events store with mock data
│   ├── usePublicMockData.ts          # Seeds public stores (sermons, streams, etc.)
│   ├── useMockData.ts                # Seeds admin stores
│   ├── useTeachings.ts
│   ├── useLiveStreams.ts
│   ├── useFilteredContent.ts
│   ├── usePageHeader.ts
│   ├── useScroll.ts
│   ├── useExportCSV.ts
│   └── useImportCsv.ts
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
├── repositories/
│   └── churchSettingsRepository.ts   # Firestore data access layer
│
├── stores/
│   ├── useAuthStore.ts               # Firebase Auth state
│   ├── useChurchSettingsStore.ts     # Church configuration
│   ├── events.ts                     # Public events state
│   ├── publicLiveStream.ts           # Public live stream state
│   ├── publicTeachings.ts            # Public sermons/lessons state
│   ├── members.ts                    # Member records (admin)
│   ├── attendance.ts                 # Attendance records (admin)
│   ├── finance.ts                    # Finance records (admin)
│   ├── teachings.ts                  # Teachings management (admin)
│   ├── roles.ts                      # RBAC roles and permissions
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
```

All variables are prefixed with `VITE_` so they are exposed to the browser (SPA mode). Never commit real credentials — `.env` is git-ignored.

### Image uploads (Cloudinary)

Every image picker in the app (sermon thumbnails, hero image, minister and congregation photos, leader avatars, gallery photos) follows the same flow:

1. User picks or drops a file.
2. The file is POSTed to Cloudinary using an **unsigned upload preset**.
3. Cloudinary returns a `secure_url`.
4. That URL is saved to Firestore — never the raw file or a base64 string.
5. The URL is what's read back whenever the image is rendered.

Setup steps:

1. In the [Cloudinary dashboard](https://cloudinary.com/console), grab your **Cloud name** from Account Details.
2. Go to **Settings → Upload → Upload presets** and add a new preset with **Signing Mode: Unsigned**. Use its name as `VITE_CLOUDINARY_UPLOAD_PRESET`.
3. Optionally set `VITE_CLOUDINARY_FOLDER` to keep all church uploads grouped (defaults to `congregation`). Individual uploads are filed into sub-folders like `congregation/sermons`, `congregation/leaders`, `congregation/gallery`, etc.

The integration lives in two places:

- [`composables/useCloudinaryUpload.ts`](composables/useCloudinaryUpload.ts) — handles the upload, exposes `uploading` / `progress` / `error` reactive state, and returns the `secure_url`.
- [`components/ui/ImageUpload.vue`](components/ui/ImageUpload.vue) — drag-and-drop image picker with live progress, replace/remove overlay, and `shape="circle"` / `compact` variants. Drop it anywhere with `v-model` bound to a URL string.

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
