# Congregation redesign guide: "The Register"

Working guide for the presentation-layer redesign. Every page agent follows it.

## The world

The church's record books, made legible. Public site = the visitors' book at the door. Admin = the registers (nominal roll, attendance book, collections ledger).

- **Ledger page**: white `bg-surface` panels on a cool rule-blue `bg-canvas` ground (admin) or white page with `bg-surface-muted` alternate sections (public).
- **Feint blue rules**: `border-rule` for every divider and table line; `border-rule-strong` for inputs and emphasised dividers. Lists of entries use `divide-y divide-rule` or the `.ruled` utility. Rows, not cards, are the default container for lists.
- **Red double margin**: `.margin-rule` utility (adds left padding + two hairlines). Use it ONLY on a page/section header block or a single featured "entry" panel. Never on cards in a grid, never on list items.
- **Bookcloth green** (`bg-primary`, `text-on-primary`, `.bookcloth` for big woven fields): primary actions, active states, the hero band, the footer, the admin sidebar. This is the committed colour.
- **Gilt** (`text-accent`, `.stamp`): small stamped meta only (dates, categories, labels). Never body text, never buttons.
- **Ink**: `text-ink` (primary text), `text-ink-muted` (secondary), `text-ink-subtle` (captions, placeholders). `text-secondary` = ink-blue for big public headings.
- Status: `success|warning|error|info` + `-soft` backgrounds. `text-live` / `bg-live` for live-stream indicators.

## Tokens (Tailwind utilities, defined in assets/css/main.css)

Colours: `canvas surface surface-muted surface-sunken overlay rule rule-strong margin ink ink-muted ink-subtle primary primary-hover primary-active primary-soft primary-ink on-primary secondary secondary-soft accent accent-soft success(-soft) warning(-soft) error(-soft) info(-soft) live focus`. All accept opacity modifiers (`bg-primary/10`).

The `gray-*` scale is remapped to the ledger's tinted neutrals, so leftover gray classes still work, but prefer semantic tokens.

Fonts: `font-display` (Bitter slab, headings) and `font-sans` (Public Sans, default). `font-serif` also maps to Bitter. Never use Playfair, Poppins, Roboto, Piedra, or `font-['…']`.

Numbers: add `num` (tabular figures) to every count, amount, date column, stat value. Money columns are `text-right num`.

Radii: `rounded-md` (6px) for buttons/inputs/panels, `rounded-lg` (8px) for cards/modals, `rounded-sm` for badges. Avoid `rounded-2xl`/`rounded-3xl` and pill buttons. Avatars stay `rounded-full`.

Shadows: `shadow-xs` on resting panels, `shadow-md`/`shadow-lg` only for floating things (dropdowns, popovers, modals). No coloured glows.

Motion: `duration-150`/`duration-200` for hovers; `ease-[cubic-bezier(0.16,1,0.3,1)]` for entrances. The global CSS already handles `prefers-reduced-motion`. Keep existing `reveal` classes where present.

## Light mode only

The product is light mode only, on both surfaces. Do not add `dark:` classes or dark tokens.

## Component patterns

Use the shared primitives (already redesigned): `Button` (variants primary/secondary/danger/ghost, sizes sm/md/lg), `Input`, `Select`, `Card`, `Modal`, `Badge`, `EmptyState`, `LoadingState`, `Tabs`, `Pagination`, `SectionHeader`. Do NOT edit files under `components/ui/` unless they are assigned to you.

Raw elements that remain (textarea, checkbox, date input, native buttons inside tables) should match the primitives:

- Textarea / bare input: `w-full rounded-md border border-rule-strong bg-surface px-3 py-2 text-sm text-ink shadow-xs outline-none transition-[border-color,box-shadow] hover:border-ink-subtle focus:border-primary focus:ring-3 focus:ring-primary/15 placeholder:text-ink-subtle disabled:bg-surface-muted`
- Label: `text-sm font-medium text-ink`; helper `text-xs text-ink-subtle`; error `text-xs font-medium text-error`
- Primary raw button: `inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-on-primary shadow-xs hover:bg-primary-hover disabled:opacity-55`
- Secondary raw button: `… border border-rule-strong bg-surface text-ink hover:bg-surface-muted`
- Icon button: `inline-flex size-9 items-center justify-center rounded-md text-ink-subtle hover:bg-surface-sunken hover:text-ink` (size-10/11 on touch-heavy public pages)
- Focus is global (`:focus-visible` outline). Remove `focus:outline-none` + `focus:ring-*` pairs on buttons/links. Inputs keep their focus ring.

**Data tables (admin):**

- Wrapper: `overflow-x-auto rounded-lg border border-rule bg-surface shadow-xs`
- `thead`: `sticky top-0 z-[1] bg-surface-muted` with `th` = `px-4 py-2.5 text-left text-xs font-semibold tracking-wide text-ink-muted uppercase border-b border-rule whitespace-nowrap`
- `tbody`: `divide-y divide-rule`; rows `hover:bg-surface-muted/70 transition-colors`; `td` = `px-4 py-3 text-sm text-ink`
- Numeric cells: `text-right num`; secondary cell text `text-ink-muted`
- Row action buttons keep their handlers and `usePendingAction` spinners.

**Stat cards (admin)**: no big-number hero template with decorative icon tiles. Label `text-xs font-semibold tracking-wide uppercase text-ink-muted`, value `font-display text-3xl font-semibold num text-ink`, optional delta/meta line `text-xs`. Small icon may sit top-right in `text-ink-subtle`. Panel: `rounded-lg border border-rule bg-surface p-5 shadow-xs`.

**Chart containers**: panel as above, header row `flex items-center justify-between` with `font-display text-base font-semibold text-ink` title and muted subtitle; chart below with `mt-4`. Dataset colours: import from `~/utils/chartTheme` (`chartPalette`, `chartSeries`, `chartStatus`, `chartAlpha`). Chart.js fonts, gridlines and tooltips are themed globally by `plugins/chart-theme.client.ts`, so remove per-chart hardcoded grid/legend/tick colours. Changing a dataset's colour in `<script>` is allowed ONLY as a literal colour value swap; call it out in your report.

**Badges**: `Badge` component (squared, ring-inset). Read/unread: unread rows get `font-semibold text-ink` plus a `size-2 rounded-full bg-primary` dot; read rows `text-ink-muted`.

**Empty / loading / error**: use `EmptyState` / `LoadingState` (`:rows` skeleton for tables) only where the code ALREADY has that condition. Error blocks: `rounded-md border border-error/25 bg-error-soft px-4 py-3 text-sm text-error` with `mdi:alert-circle-outline`.

**Admin page structure**: the layout already renders the page title (with margin rule) and an `#admin-header-actions` teleport slot. Pages: sections separated by `space-y-6`; filter bar = `flex flex-wrap items-end gap-3 rounded-lg border border-rule bg-surface p-3 shadow-xs`; panel headings `font-display text-lg font-semibold text-ink`.

**Public page structure**:

- Section rhythm: `py-16 md:py-24`, container `mx-auto max-w-7xl px-5 sm:px-6 lg:px-8`. Alternate `bg-surface` and `bg-surface-muted`; one or two sections per page may be `.bookcloth` fields.
- Body copy ≥ 16px (`text-base`/`text-lg`, `leading-relaxed`/`leading-7`), measure ≤ 70ch.
- Section headers: `SectionHeader` component, or `h2` = `font-display text-3xl md:text-4xl font-bold text-secondary leading-tight`; heading-to-subtitle `mt-3`, header-to-content `mb-10 md:mb-12`.
- NO eyebrow/kicker labels above headings (delete existing ones or turn them into a `.stamp` meta line placed BELOW the heading only if they carry real info like a date). NO gradient text. NO coloured `border-left` > 1px on cards. NO glassmorphism. NO hard offset shadows. NO emoji as icons.
- Entry lists (events, sermons, service times): prefer ruled rows (`divide-y divide-rule` inside a `border-y border-rule`) with a date/time column in `num font-display` on the left: the "visitors' book" entry. Image cards are fine for sermons/gallery where a thumbnail carries meaning; keep them `rounded-lg border border-rule bg-surface overflow-hidden` with `hover:shadow-md hover:border-rule-strong`.
- Touch targets ≥ 44px (`min-h-11`), links in copy `text-primary-ink underline underline-offset-3 hover:text-primary-hover`.
- Images: keep existing `loading="lazy"`; add `loading="lazy"` + `decoding="async"` to below-the-fold `<img>` that lack it (presentational). Keep all `:src`/`alt` bindings.

**Icons**: one family. Use `mdi:*` outline icons (e.g. `mdi:calendar-outline`). Swapping `heroicons:*`/other icon names to `mdi:*` equivalents is an allowed presentational change (call it out). Social brand SVG paths may stay inline.

## Hard constraints (non-negotiable)

1. `<script>` blocks byte-for-byte unchanged, EXCEPT: Tailwind class strings in class maps, literal colour values for charts, and icon names. Report every script edit.
2. Do not change: props, emits, v-model, `@event` handlers, refs (`ref="..."`), `v-if`/`v-show`/`v-for`/`v-else` conditions, `:key`, route targets (`to`, `href`), form field `name`/`type`/`required`/`id`/`for`, `:disabled`, `aria-*` that exist (you may ADD aria/labels/role/sr-only text), `data-testid`, ids. Never ADD `type`, `name`, `id`, `for`, `disabled`, `required`, handlers, conditions or link targets either: e.g. adding `type="button"` inside a form changes submit behaviour.
3. Do not add, remove, merge, rename, or hide features or text content. Microcopy may be polished only where meaning is identical. Never delete user-visible information.
4. Test selectors that must survive: `button.text-accent` (ContactForm "send another" button), `#cf-name #cf-email #cf-phone #cf-message`, classes `.worship-modal`, `.value`, `.label`, `.err`, `.empty`, `.info`, `nav[aria-label=...]`, `aside`, `[role=...]`, `label[for=...]`, `tbody tr`, `td`, `li`, `select option`. Before editing a file, run `grep -rn "<ComponentName>" tests/` and read the test so you keep whatever it selects (classes, element types, structure counts like number of `button`s, `img`, `path`, `circle`, `li`, `td`).
5. Don't add new components, composables or dependencies. Small scoped `<style>` blocks are fine for things Tailwind can't express.
6. Keep Prettier style (2 spaces, single quotes, no semicolons, printWidth 100). Run `npx prettier --write <your files>` and `npx eslint <your files>` before finishing, and run `npx vitest run <related test files>` for any component with a test.

## Report format (your final message)

For each file: one line of problems fixed, then one line of visual changes. Then: "Script edits:" listing every change inside `<script>` (should be class strings / colours / icon names only). Then "Tests run:" with results. Then "Future changes (not implemented):" any functional improvements you noticed but did not make.
