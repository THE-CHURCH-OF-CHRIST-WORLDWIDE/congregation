# Architecture

This document describes the high-level architecture of Congregation, its directory structure, and the key design decisions that guide development.

---

## Overview

Congregation is a **Single-Page Application (SPA)** built with Nuxt 4 and Vue 3 (`ssr: false`). It has two distinct user-facing areas:

- **Admin Dashboard** (`/admin/*`) — authenticated area for church staff to manage members, attendance, giving, events, and content
- **Public Website** (`/`, `/about-us`, `/events`, `/live-streams`, `/teachings/*`) — unauthenticated area for visitors to browse church information, sermons, and events

Firebase is the backend, providing Authentication, Firestore (database), Storage, and (planned) Cloud Functions.

> **Implementation status.** Auth and route protection are live, and every domain — members, settings, roles, access, invitations, audit, finance, teachings, attendance and events — reads and writes Firestore through the repository layer. The mock-data composables this note used to cite have been removed.

---

## Directory Structure

```
congregation/
├── assets/
│   └── css/
│       └── main.css          # Single CSS entry: @import "tailwindcss"
│
├── components/               # Feature-based, auto-imported (pathPrefix: false)
│   ├── about/                # /about-us page sections
│   ├── attendance/           # Admin attendance components
│   ├── charts/               # Chart.js wrappers
│   ├── dashboard/            # Admin dashboard widgets
│   ├── events/               # /events page components
│   ├── gallery/              # Photo gallery components
│   ├── home/                 # Home page sections
│   ├── layout/               # App-wide shell (TheNavbar, TheFooter)
│   ├── live-streams/         # /live-streams page components
│   ├── nominal-roll/         # Admin member management
│   ├── settings/             # Admin settings components
│   ├── shared/               # Cross-area shared components
│   ├── teachings/            # Admin teachings components
│   └── ui/                   # Reusable primitives (Button, Modal, Input, …)
│
├── composables/              # Shared Vue composables
│
├── constants/                # Shared constants (statuses, role names, app pages)
│
├── docs/                     # Project documentation
│
├── layouts/
│   ├── admin.vue             # Layout wrapper for admin pages
│   └── default.vue           # Layout wrapper for public pages
│
├── middleware/               # Route guards (auth.ts)
│
├── pages/                    # File-based routing
│   ├── index.vue             # Public home (/)
│   ├── login.vue             # Login
│   ├── about-us/             # /about-us
│   ├── events/               # /events
│   ├── live-streams/         # /live-streams
│   ├── teachings/            # /teachings/*
│   └── admin/                # Admin dashboard routes (/admin/*)
│
├── plugins/
│   ├── firebase.client.ts    # Firebase initialization (client-only)
│   └── iconify.client.ts     # Iconify global registration (client-only)
│
├── public/                   # Static assets
│
├── repositories/             # Firebase data access layer
│
├── stores/                   # Pinia stores (auto-discovered)
│
├── types/                    # TypeScript type declarations
│
├── utils/                    # Helper utilities
│
├── .env.example              # Environment variable template
├── firebase.json             # Firebase project configuration
├── firestore.rules           # Firestore security rules
├── storage.rules             # Storage security rules
├── nuxt.config.ts            # Nuxt configuration
└── package.json
```

Public pages live at the `pages/` root rather than under a `pages/public/` group; admin pages are grouped under `pages/admin/`.

---

## Key Design Decisions

### SPA Mode

`ssr: false` is set in `nuxt.config.ts`. Congregation runs entirely in the browser. There is no server-side rendering. This simplifies deployment (static hosting, Firebase Hosting) and avoids the complexity of SSR with Firebase Auth.

### Component Naming and Auto-import

All components under `components/` are auto-imported with `pathPrefix: false`. A component at `components/nominal-roll/MemberCard.vue` is available globally as `<MemberCard />`, not `<NominalRollMemberCard />`. Components are organised by feature, not by admin/public split — the same component (e.g. a UI primitive) may be used across both areas.

### Data Access via Repositories

The target architecture is that all Firebase operations (Firestore reads/writes, Storage uploads, etc.) are abstracted through the `repositories/` layer, so components and stores never call Firebase directly. This separation:

- Makes the codebase easier to test and mock
- Isolates Firebase API changes to one location
- Keeps business logic out of UI components

**Wired through this layer today** — one repository per Firestore collection:

| Repository                     | Collection                              |
| ------------------------------ | --------------------------------------- |
| `churchSettingsRepository.ts`  | `settings/church`                       |
| `membersRepository.ts`         | `members`                               |
| `usersRepository.ts`           | `users/{uid}`                           |
| `invitationsRepository.ts`     | `invitations`                           |
| `rolesRepository.ts`           | `roles/{roleId}`                        |
| `roleAssignmentsRepository.ts` | `roleAssignments`                       |
| `auditRepository.ts`           | `auditLog`                              |
| `financeRepository.ts`         | `financeCollections`, `financeExpenses` |
| `teachingsRepository.ts`       | `teachings`                             |
| `attendanceRepository.ts`      | `attendance`                            |
| `eventsRepository.ts`          | `events`                                |

Every domain is wired; nothing persists to `localStorage` any more. Finance and teachings previously held their data in a plain in-memory array, so figures and sermon uploads vanished on refresh while the UI reported success.

### Pinia for State Management

Pinia stores are auto-discovered from `stores/`. Each store manages a specific domain (e.g., `useAuthStore`, `useChurchSettingsStore`, `members`). Stores fetch data by calling repository functions — they do not contain raw Firebase calls.

### Icons via Iconify

Icons are registered globally in `plugins/iconify.client.ts`. Use `<Icon icon="mdi:some-icon" />` anywhere in the app without per-component imports. Available icon sets include `mdi`, `heroicons`, `tabler`, and others supported by Iconify.

### Firebase Plugins (Client-only)

Both Firebase and Iconify plugins use the `.client.ts` suffix, ensuring they only run in the browser. This is required for SPA mode and prevents errors in build/generate steps.

### Environment Variables

Firebase web SDK credentials are passed through environment variables prefixed with `VITE_` and exposed to the browser via `runtimeConfig.public` in `nuxt.config.ts`. Firebase web keys are **public by design** — security is enforced by Firestore Security Rules, Storage Rules, Firebase Auth, and (recommended) App Check, not by hiding the API key. Server-only secrets (if any) should use Nuxt's `runtimeConfig` without the `public` prefix.

---

## Authentication Flow

The intended flow is:

1. User visits a protected admin route
2. [`middleware/auth.ts`](../middleware/auth.ts) checks if the user is authenticated via [`useAuthStore`](../stores/auth.ts)
3. If unauthenticated, the user is redirected to `/login`
4. On successful sign-in, Firebase Auth emits a state change
5. `useAuthStore` updates the reactive auth state
6. The user is redirected to the admin dashboard

Client-side route protection is the first layer only. Authoritative enforcement lives in `firestore.rules` and `storage.rules` — even an authenticated client cannot read or write data that the rules deny.

[`middleware/auth.ts`](../middleware/auth.ts) is active on every `/admin/*` page. It awaits `authStore.whenReady()` first, because Firebase restores a persisted session asynchronously — without that wait, refreshing an admin page would read `isAuthenticated === false` and bounce a user who is in fact signed in.

**Signing in is not the same as being allowed to write.** Privilege comes from a `users/{uid}` document, which Firestore rules read on every write; the auth store loads it into `roleId` / `isStaff` / `isSuperAdmin`. That fetch deliberately runs _after_ `whenReady()` resolves, so a slow Firestore read can never stall routing. An account with no role reaches the dashboard shell and sees a banner explaining that saves will be refused. See [Deployment & Access Control](../README.md#deployment--access-control).

---

## Data Flow

```
Component / Page
      │
      ▼
  Pinia Store
      │
      ▼
  Repository (repositories/)
      │
      ▼
  Firebase (Firestore / Storage / Auth)
```

Data flows down from Firebase through the repository layer, into stores, and finally into components. Components read from stores and dispatch actions — they never access Firebase directly.

---

## Adding a New Feature

1. **Define types** in `types/` if new data structures are introduced
2. **Add repository functions** in `repositories/` for any new Firestore collections or operations
3. **Create or extend a Pinia store** in `stores/` to expose reactive state and actions
4. **Build components** in the appropriate `components/<feature>/` folder
5. **Add routes** by creating new files under `pages/` (public) or `pages/admin/` (admin)
6. **Update middleware** if new route protection is required
7. **Update `firestore.rules` / `storage.rules`** if you introduce new collections or storage paths
