## Description

Implements the complete **public-facing website** and **admin dashboard** for the Congregation CMS — from the ground up — on top of the initial project scaffold.

This branch covers the full landing page (home, about us, events, live streams, teachings), the entire admin dashboard (members, attendance, finance, settings, teachings, youth), a shared UI component library, Pinia state management, TypeScript type definitions, and developer tooling (ESLint, Prettier, CI/CD).

Fixes # <!-- Link the issue this PR closes, e.g. "Fixes #123" -->

---

## Type of Change

- [ ] Bug fix (non-breaking change that resolves an issue)
- [x] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Refactor (code change with no functional impact)
- [x] Documentation update
- [x] Chore (dependency update, config change, etc.)

---

## Changes Made

### Public Website

- **Home page** — Hero banner, minister welcome, live stream teaser, sermons teaser, events list, congregation search, contact form, photo gallery
- **About Us page** (`/about-us`) — Church history card with decorative corner images, worship activities (5 cards), leaders grid with circular avatars, activity calendar table, worship-this-sunday section with embedded Google Map
- **Events page** (`/events`) — Upcoming/past tab toggle with URL query sync (`?tab=`), upcoming events list with image gallery preview slider, past events with featured card + month/year sub-tabs, full-screen gallery lightbox with keyboard + touch navigation
- **Live Streams page** (`/live-streams`) — Active stream cards, recorded stream archive
- **Teachings pages** (`/teachings/sermons`, `/teachings/sunday-school`) — Filterable list pages + detail pages for both sermons and Sunday School lessons
- **Navbar** — Fixed `About Us` and `Events` links from `/#anchor` to proper `NuxtLink` routes with `active-class`

### Admin Dashboard

- **Dashboard** (`/admin`) — Stats cards, bar/line/donut/sparkline charts, backslider table, recent uploads widget
- **Nominal Roll** (`/admin/nominal-roll`) — Member table with search/filter, detail side-panel, add member modal, CSV import modal, role summary chart
- **Attendance** (`/admin/attendance`) — Service attendance recording, monthly grid view, summary stats
- **Finance** (`/admin/finance`) — Income and expense tracking, category breakdown
- **Teachings** (`/admin/teachings`, `/admin/teachings/upload`) — Sermon and Sunday School upload and management
- **Settings** (`/admin/settings`) — Church settings form, roles & permissions panel (RBAC)
- **Youth** (`/admin/youth`) — Youth ministry member list and management

### State Management (Pinia stores)

- `events.ts` — Upcoming/past tabs, gallery lightbox, month/year filtering
- `members.ts` — Member CRUD, complex filtering (search, gender, status, tab)
- `attendance.ts` — Service attendance records
- `finance.ts` — Collections and expenses
- `teachings.ts` — Admin teachings management
- `roles.ts` — Role and permission definitions
- `publicLiveStream.ts` — Public live stream state
- `publicTeachings.ts` — Public sermons/lessons state
- `ui.ts` — Global UI state (sidebar toggle)
- `useChurchSettingsStore.ts` — Church configuration

### Shared UI Component Library (`components/ui/`)

- `Button`, `Modal`, `Avatar`, `Badge`, `Card`, `Input`, `Select`, `Tabs`
- `MapEmbed`, `VideoPlayer`, `CategoryBadge`, `ContentCard`
- `SectionHeader`, `TagFilterBar`, `HowToSteps`, `EditField`, `InfoField`

### Types (`types/`)

- `types/index.ts` — Admin domain types: `Member`, `Sermon`, `AttendanceRecord`, `ServiceType`, `ExpenseCategory`, `RoleName`, `ChurchRole`, and more
- `types/public.ts` — Public site types: `LiveStream`, `PublicSermon`, `Lesson`, `ChurchEvent`, `Congregation`
- `types/events.ts` — Events page types: `UpcomingEvent`, `PastEvent`, `Speaker`

### Developer Tooling & Infrastructure

- **ESLint** — `eslint.config.mjs` with `@nuxt/eslint`, Vue `script-setup` enforcement, `multi-word-component-names` disabled for Nuxt conventions
- **Prettier** — `.prettierrc` (no semi, single quotes, 100 print width) + `.prettierignore`
- **CI/CD** — `.github/workflows/ci.yml` running typecheck → lint → build on every PR and push to `main`
- **Constants** — `constants/index.ts` extracting `MEMBER_STATUSES`, `SERVICE_TYPES`, `EXPENSE_CATEGORIES`, `ROLE_NAMES`, `PUBLIC_ROUTES`, `ADMIN_ROUTES`, `CHURCH_*` identity constants
- **`.env.example`** — Template with all required `VITE_FIREBASE_*` variables and comments
- **README** — Full rewrite with accurate project structure tree, correct GitHub org links, complete tech stack table, environment variables section, and all npm scripts

---

## How Has This Been Tested?

- [x] Tested locally on dev server (`npm run dev`)
- [x] Tested admin dashboard flows
- [x] Tested public landing page flows
- [ ] Verified Firebase interactions (Firestore, Auth, Storage)
- [x] Checked for console errors

---

## Screenshots (if applicable)

<!-- Attach before/after screenshots for UI changes. -->

---

## Checklist

- [x] My code follows the project's coding conventions
- [x] I have used conventional commit format (`feat:`, `fix:`, `chore:`, etc.)
- [x] I have self-reviewed my code
- [x] I have added or updated relevant documentation
- [x] No sensitive credentials or `.env` values are included in this PR
- [ ] TypeScript compiles without errors (`nuxt typecheck`)
- [ ] No new linting errors introduced
