# Architecture

This document describes the high-level architecture of Congregation, its directory structure, and the key design decisions that guide development.

---

## Overview

Congregation is a **Single-Page Application (SPA)** built with Nuxt 4 and Vue 3 (`ssr: false`). It has two distinct user-facing areas:

- **Admin Dashboard** — authenticated area for church staff to manage members, attendance, giving, events, and content
- **Public Landing Page** — unauthenticated area for visitors to browse church information, sermons, and events

Firebase is the backend, providing Authentication, Firestore (database), Storage, and Cloud Functions.

---

## Directory Structure

```
congregation/
├── assets/
│   └── css/
│       └── main.css          # Single CSS entry: @import "tailwindcss"
│
├── components/
│   ├── admin/                # Components used only in the admin dashboard
│   └── public/               # Components used only on the public landing page
│
├── composables/              # Shared Vue composables (e.g., useAuth.ts)
│
├── constants/                # Shared constant values across the app
│
├── layouts/
│   ├── admin.vue             # Layout wrapper for admin pages
│   └── default.vue           # Layout wrapper for public pages
│
├── middleware/               # Route guards (e.g., auth.ts)
│
├── pages/
│   ├── admin/                # Admin dashboard routes (file-based routing)
│   └── public/               # Public site routes (file-based routing)
│
├── plugins/
│   ├── firebase.client.ts    # Firebase initialization (client-only)
│   └── iconify.client.ts     # Iconify global registration (client-only)
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
├── nuxt.config.ts            # Nuxt configuration
└── package.json
```

---

## Key Design Decisions

### SPA Mode

`ssr: false` is set in `nuxt.config.ts`. Congregation runs entirely in the browser. There is no server-side rendering. This simplifies deployment (static hosting, Firebase Hosting) and avoids the complexity of SSR with Firebase Auth.

### Component Naming and Auto-import

All components under `components/` are auto-imported with `pathPrefix: false`. This means a component at `components/admin/MemberCard.vue` is available globally as `<MemberCard />`, not `<AdminMemberCard />`. This convention keeps templates clean and removes the need for manual imports.

### Data Access via Repositories

All Firebase operations (Firestore reads/writes, Storage uploads, etc.) are abstracted through the `repositories/` layer. Components and stores must never call Firebase directly. This separation:

- Makes the codebase easier to test and mock
- Isolates Firebase API changes to one location
- Keeps business logic out of UI components

### Pinia for State Management

Pinia stores are auto-discovered from `stores/`. Each store manages a specific domain (e.g., `useAuthStore`, `useMembersStore`). Stores fetch data by calling repository functions — they do not contain raw Firebase calls.

### Icons via Iconify

Icons are registered globally in `plugins/iconify.client.ts`. Use `<Icon icon="mdi:some-icon" />` anywhere in the app without per-component imports. Available icon sets include `mdi`, `heroicons`, `tabler`, and others supported by Iconify.

### Firebase Plugins (Client-only)

Both Firebase and Iconify plugins use the `.client.ts` suffix, ensuring they only run in the browser. This is required for SPA mode and prevents errors in build/generate steps.

### Environment Variables

Firebase credentials are passed through environment variables prefixed with `VITE_`. These are exposed to the browser via Vite's env system. Server-only secrets (if any) should use Nuxt's `runtimeConfig` without the `public` prefix.

---

## Authentication Flow

1. User visits a protected admin route
2. `middleware/auth.ts` checks if the user is authenticated via Firebase Auth
3. If unauthenticated, the user is redirected to the login page
4. On successful sign-in, Firebase Auth emits a state change
5. `useAuthStore` updates the reactive auth state
6. The user is redirected to the admin dashboard

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
4. **Build components** in `components/admin/` or `components/public/` as appropriate
5. **Add routes** by creating new files in `pages/admin/` or `pages/public/`
6. **Update middleware** if new route protection is required
