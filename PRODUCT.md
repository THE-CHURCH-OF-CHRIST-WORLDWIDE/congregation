# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Visitors and congregants** of whichever church deploys Congregation, using the public website. Many are first-time guests on mobile phones; some congregants are older readers. They come to find service times and location, watch a live or recorded service, read or listen to teachings, see events, register as a member, or send a message.
- **Church staff** (Super Admin, Admin, Secretary, Content Editor, Financial Secretary, Elder, Deacon, Preacher, Youth Leader) using the admin dashboard, mostly for weekly, repetitive record-keeping: attendance per service, weekly collections and expenses, the member register, plus content upkeep for the public site.

## Product Purpose

An open-source (AGPL v3) Church Management System: one Nuxt SPA that gives a congregation both a public website and an internal dashboard, backed by Firebase. Success: a first-time visitor trusts the church and finds what they need; a secretary can finish Sunday-evening record-keeping quickly and without errors.

## Positioning

Free, self-hostable, and deployed by many different churches. The public site and the records system share one codebase and one data source, so content staff edit in Settings appears directly on the public site.

## Operating Context

- Deployed independently by multiple churches. Church name, address, minister, leaders, hero images, gallery, service times and most public copy come from Settings (Firestore) and Cloudinary uploads, not from code.
- Admin work happens weekly (attendance after each service, finance collections, member updates), often on laptops, sometimes on phones.
- Role-based access: the UI shows or enables features per role, and Firestore rules enforce the same permissions server-side. The audit log is append-only and visible to Super Admins only.

## Capabilities and Constraints

- Stack: Nuxt 4 (SPA, `ssr: false`), Vue 3, TypeScript strict, Tailwind CSS v4, Pinia, Firebase, Cloudinary, Chart.js, jsPDF, date-fns, Iconify.
- Quality gates: ESLint, Prettier, vue-tsc, Vitest (some tests select by class names such as `.text-accent`, `.worship-modal`, `.err`, `.empty`, `.info`, `.value`, `.label`), Husky pre-commit.
- Admins can show or hide individual public nav items; staging-only routes are hidden in production.

## Brand Commitments

- Brand-neutral by design: no single church's logo, name, or colours may be baked into the product. Each deploying church's identity arrives through its own name, photos and content.
- Admin dark mode follows the OS `prefers-color-scheme` setting. There is no in-app toggle.

## Evidence on Hand

- All real content (photos, sermons, leaders, events) is per-deployment and comes from Settings and Firestore. The repo ships placeholder images under `public/images/`. Do not invent testimonials, statistics, or church-specific claims.

## Product Principles

1. Readability over novelty: older readers and first-time visitors on phones come first on the public site.
2. Speed of routine entry: weekly record-keeping must be fast, scannable, and hard to get wrong.
3. One coherent product: public and admin share a single design system.
4. Each church's content leads: the frame stays neutral so any congregation's photos and name look like its own.

## Accessibility & Inclusion

WCAG 2.1 AA. Public body text at least 16px with generous line height. Touch targets at least 44px. Visible keyboard focus. Respect `prefers-reduced-motion`.
