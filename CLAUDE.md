# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Congregation is an open-source Church Management System (CMS) built with Nuxt 4, Vue 3, TypeScript, Tailwind CSS, and Firebase. It runs as a SPA (`ssr: false`) with two main areas: an Admin Dashboard for church management and a Public Landing Page.

## Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run generate     # Static site generation
npm run preview      # Preview production build
npm run typecheck    # Type-check with vue-tsc
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with --fix
npm run format       # Format with Prettier
npm run format:check # Verify formatting (used in CI)
npm run test         # Run Vitest in CI mode
npm run test:watch   # Run Vitest in watch mode
```

## Architecture

### Key Configuration
- **SPA mode**: `ssr: false` in `nuxt.config.ts` — no server-side rendering
- **TypeScript**: strict mode with `typeCheck: true`
- **Components**: auto-imported with `pathPrefix: false`, so all components under `components/` are available without path prefix (e.g., `<MyComponent />` not `<AdminMyComponent />`)
- **Pinia stores**: auto-discovered from `./stores/**`

### Directory Conventions
- `components/` — organised by feature (e.g. `about/`, `attendance/`, `home/`, `nominal-roll/`, `ui/`). The `admin/` and `public/` folders exist but are mostly empty placeholders; new components go in a feature folder, not under those.
- `pages/` — file-based routing. Admin routes live under `pages/admin/*`; public routes live at the `pages/` root (`index.vue`, `about-us/`, `events/`, `live-streams/`, `teachings/`).
- `stores/` — Pinia stores
- `composables/` — shared Vue composables (e.g., `useAuth`)
- `plugins/` — Nuxt plugins (client-only plugins use `.client.ts` suffix)
- `types/` — TypeScript type declarations
- `constants/` — shared constants
- `repositories/` — data access layer (Firebase abstraction)
- `utils/` — helper utilities
- `assets/css/main.css` — single CSS entry point, contains only `@import "tailwindcss"`

### Icons
Iconify is registered globally via `plugins/iconify.client.ts`. Use `<Icon icon="mdi:some-icon" />` anywhere — no per-component import needed. Type declarations are in `types/iconify.d.ts`.

### Firebase
Firebase is the backend (Firestore, Auth, Storage, Cloud Functions). Firebase credentials are configured via environment variables. Copy `.env` and fill in real values:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Firebase access is abstracted through the `repositories/` layer. This pattern is the target architecture but only partially in place today: [`churchSettingsRepository.ts`](repositories/churchSettingsRepository.ts) is the only repository implemented. Other domains (members, attendance, events, finance, teachings, roles) currently hold in-memory state seeded from mock composables (`composables/useMockData.ts`, `composables/useEventsMockData.ts`, `composables/usePublicMockData.ts`) and are scheduled to migrate. New Firebase reads/writes should still go through a repository.

### Runtime Config
Server-only secrets go under `runtimeConfig` in `nuxt.config.ts`. Public runtime config (accessible in browser) goes under `runtimeConfig.public`. Access via `useRuntimeConfig()` in composables/components.

## Commit Convention

Commits follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`, etc.
