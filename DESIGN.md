---
name: Congregation
description: The church's record books made legible; a visitors' book at the door and the registers behind it.
colors:
  canvas: '#eef2f7'
  surface: '#ffffff'
  surface-muted: '#f5f7fa'
  surface-sunken: '#ebeff5'
  overlay: 'rgb(14 20 28 / 0.55)'
  rule: '#d5deea'
  rule-strong: '#b4c3d6'
  margin: '#c0392b'
  ink: '#172131'
  ink-muted: '#4b5768'
  ink-subtle: '#5f6b7c'
  primary: '#1e4d3b'
  primary-hover: '#163b2d'
  primary-active: '#10301f'
  primary-soft: '#e6efea'
  primary-ink: '#1e4d3b'
  on-primary: '#ffffff'
  secondary: '#24364f'
  secondary-soft: '#e8edf4'
  accent: '#8a5d0f'
  accent-soft: '#f6eedd'
  gilt-on-bookcloth: '#f2d593'
  focus-on-bookcloth: '#f2c14e'
  success: '#1f7a45'
  success-soft: '#e5f3ea'
  warning: '#94570a'
  warning-soft: '#fdf1dc'
  error: '#b42318'
  error-soft: '#fdecea'
  info: '#1f5fa8'
  info-soft: '#e7f0fa'
  live: '#c62828'
  focus: '#1f5fa8'
  chart-bookcloth: '#2f7a5c'
  chart-ink: '#3d5f8f'
  chart-gilt: '#c08a2e'
  chart-margin: '#c2493b'
  chart-slate: '#7a8aa0'
  chart-plum: '#8a5a9e'
  chart-teal: '#2e8a92'
  chart-clay: '#a8683f'
  chart-positive: '#2f8a57'
typography:
  display:
    fontFamily: "Bitter, 'Roboto Slab', Rockwell, Georgia, serif"
    fontSize: 'clamp(2.25rem, 6vw, 3.5rem)'
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '-0.01em'
  headline:
    fontFamily: "Bitter, 'Roboto Slab', Rockwell, Georgia, serif"
    fontSize: 'clamp(1.875rem, 4vw, 2.5rem)'
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: '-0.01em'
  page-title:
    fontFamily: "Bitter, 'Roboto Slab', Rockwell, Georgia, serif"
    fontSize: '1.625rem'
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: '-0.01em'
  title:
    fontFamily: "Bitter, 'Roboto Slab', Rockwell, Georgia, serif"
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: 1.375
  figure:
    fontFamily: "Bitter, 'Roboto Slab', Rockwell, Georgia, serif"
    fontSize: '1.875rem'
    fontWeight: 600
    lineHeight: 1
    fontFeature: "'tnum' 1, 'lnum' 1"
  body-lg:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1.125rem'
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.625
  body-admin:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
  prose:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.75rem'
    fontWeight: 600
    lineHeight: 1rem
    letterSpacing: '0.025em'
  stamp:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.75rem'
    fontWeight: 600
    lineHeight: 1rem
    letterSpacing: '0.06em'
  micro:
    fontFamily: "'Public Sans', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.6875rem'
    fontWeight: 600
    lineHeight: 1rem
rounded:
  xs: '2px'
  sm: '4px'
  md: '6px'
  lg: '8px'
  xl: '10px'
  2xl: '14px'
  full: '9999px'
spacing:
  hair: '4px'
  xs: '8px'
  sm: '12px'
  md: '16px'
  lg: '20px'
  xl: '24px'
  2xl: '32px'
  section: '64px'
  section-lg: '96px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
    padding: '0 16px'
    height: '44px'
  button-primary-hover:
    backgroundColor: '{colors.primary-hover}'
  button-primary-active:
    backgroundColor: '{colors.primary-active}'
  button-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '0 16px'
    height: '44px'
  button-secondary-hover:
    backgroundColor: '{colors.surface-muted}'
  button-danger:
    backgroundColor: '{colors.error}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
    padding: '0 16px'
    height: '44px'
  button-ghost:
    textColor: '{colors.ink-muted}'
    rounded: '{rounded.md}'
    padding: '0 16px'
    height: '44px'
  button-ghost-hover:
    backgroundColor: '{colors.surface-sunken}'
    textColor: '{colors.ink}'
  button-public-lg:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
    padding: '0 24px'
    height: '48px'
  icon-button:
    textColor: '{colors.ink-subtle}'
    rounded: '{rounded.md}'
    size: '36px'
  input:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '8px 12px'
    height: '40px'
  input-public:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.md}'
    padding: '10px 14px'
    height: '48px'
  input-disabled:
    backgroundColor: '{colors.surface-muted}'
    textColor: '{colors.ink-subtle}'
  card:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.lg}'
    padding: '20px'
  stat-card-value:
    textColor: '{colors.ink}'
    typography: '{typography.figure}'
  modal:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.xl}'
  modal-footer:
    backgroundColor: '{colors.surface-muted}'
    padding: '14px 20px'
  table-header:
    backgroundColor: '{colors.surface-muted}'
    textColor: '{colors.ink-muted}'
    typography: '{typography.label}'
    padding: '10px 16px'
  table-cell:
    textColor: '{colors.ink}'
    typography: '{typography.body-admin}'
    padding: '12px 16px'
  tab-active:
    textColor: '{colors.primary-ink}'
    height: '44px'
  tab-inactive:
    textColor: '{colors.ink-muted}'
    height: '44px'
  pagination-current:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.md}'
    size: '36px'
  badge-neutral:
    backgroundColor: '{colors.surface-sunken}'
    textColor: '{colors.ink-muted}'
    rounded: '{rounded.sm}'
    padding: '2px 8px'
  badge-success:
    backgroundColor: '{colors.success-soft}'
    textColor: '{colors.success}'
    rounded: '{rounded.sm}'
    padding: '2px 8px'
  badge-warning:
    backgroundColor: '{colors.warning-soft}'
    textColor: '{colors.warning}'
    rounded: '{rounded.sm}'
    padding: '2px 8px'
  badge-danger:
    backgroundColor: '{colors.error-soft}'
    textColor: '{colors.error}'
    rounded: '{rounded.sm}'
    padding: '2px 8px'
  badge-info:
    backgroundColor: '{colors.info-soft}'
    textColor: '{colors.info}'
    rounded: '{rounded.sm}'
    padding: '2px 8px'
  badge-account-role:
    backgroundColor: '{colors.primary-soft}'
    textColor: '{colors.primary-ink}'
    rounded: '{rounded.sm}'
    padding: '2px 8px'
  category-stamp:
    backgroundColor: '{colors.accent-soft}'
    textColor: '{colors.accent}'
    typography: '{typography.stamp}'
    rounded: '{rounded.sm}'
    padding: '4px 8px'
  toast:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.lg}'
    padding: '12px 8px 12px 16px'
  sidebar:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    width: '240px'
  sidebar-item-active:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.primary-hover}'
    rounded: '{rounded.md}'
    height: '40px'
  admin-top-bar:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    typography: '{typography.page-title}'
  public-nav-link-active:
    textColor: '{colors.primary-ink}'
    height: '44px'
  hero-ledger-panel:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.md}'
    padding: '40px'
  footer:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    padding: '64px 32px 40px'
---

# Design System: Congregation

## Overview

**Creative North Star: "The Register"**

Congregation is the church's record books made legible. The public site is the visitors' book at the door; the admin dashboard is the registers themselves: the nominal roll, the attendance book, the collections ledger. Everything is built from the materials of a bound record book: white ledger pages laid on a cool rule-blue ground, feint blue rules between entries, a red double margin down the left of a page heading, a deep green bookcloth binding, blue-black ink, and small gilt stamps for dates and categories.

Density follows the audience. Public pages are generous and legible for first-time visitors and older congregants on phones: 16-18px body, 44-48px touch targets, 64-96px section rhythm, entries set as ruled rows with a big slab date in the margin. Admin pages are a working register: 14px body, ruled data tables with sticky headers, tabular figures in every column, white panels on the canvas ground, one bookcloth spine on the left. Both surfaces are light only; there is no dark mode.

The system rejects the church-template look (a stock photo hero over three icon cards) and the grey SaaS dashboard. Depth is quiet (hairline rules first, soft ink-tinted shadows second), corners are squared like a bound book, and colour is committed rather than decorative: bookcloth green is the one field colour, everything else is ink on paper.

**Key Characteristics:**

- White ledger panels on a rule-blue canvas; feint blue hairlines as the default divider.
- One structural signature: the red double margin, on headers and a single featured entry only.
- Bookcloth green carries the nav band, footer, admin sidebar, and every primary action.
- Bitter slab for headings and figures, Public Sans for everything read.
- Tabular lining figures wherever a number appears.
- Squared corners (6-8px), hairline borders, soft low shadows; no glows, no glass, no pills except avatars and status dots.
- Light mode only, everywhere. No dark mode.

## Colors

A ledger palette: cool paper and blue rules, blue-black ink, one deep bookcloth green, and gilt and red used as marks, never as fields.

### Primary

- **Bookcloth Green** (`primary`): the binding. Primary buttons, active tabs and nav underlines, the current pagination page, checkbox and radio accent, the caret, progress fills, unread dots, and every large colour field (public nav band, hero frame, footer, admin sidebar). Hover deepens to `primary-hover`, press to `primary-active`. Large fields use `.bookcloth`: flat bookcloth green with no imitation texture.
- **Bookcloth Wash** (`primary-soft`): selected row and unread message backgrounds (at 35%), dropdown icon tiles, account-role chips, mobile nav active item.
- **Bookcloth Ink** (`primary-ink`): green used as text; links, active nav labels, "Read more" links, unread timestamps. Identical to primary.

### Secondary

- **Ink Blue** (`secondary`): large public headings (hero headline, section headings, date numerals in event rows), the brand wordmark and logo ring. Never used in admin headings, which stay in ink.
- **Ink Blue Wash** (`secondary-soft`): quiet tinted panels.

### Tertiary

- **Gilt** (`accent`, 5.6:1 on white): the stamp. Dates and categories stamped onto entries set in `.stamp`; category stamps on sermon thumbnails sit on `accent-soft` with a 20% gilt inset ring.
- **Gilt on Bookcloth** (`gilt-on-bookcloth`): the same role on green fields: footer column headings, the scripture reference under the About hero, the sidebar crest icon, the sidebar unread count chip (with `#3b2a06` text), the footer crest ring. Currently a literal in markup, not a CSS variable.
- **Margin Red** (`margin`): the red double margin only. Structural, never text, never fill.

### Neutral

- **Rule-Blue Ground** (`canvas`): the admin page ground behind panels.
- **Ledger Page** (`surface`): panels, cards, tables, modals, inputs, the public page.
- **Alternate Leaf** (`surface-muted`): alternating public sections, table headers, row hover (at 70%), modal footers, disabled inputs.
- **Well** (`surface-sunken`): skeleton base, neutral badges, icon-button hover, image placeholders.
- **Feint Rule** (`rule`, #D5DEEA): every divider, table line, card border, and the 32px ledger-paper ruling.
- **Strong Rule** (`rule-strong`): input and secondary-button borders, emphasised dividers (the outer rules of a public entry list), the scrollbar thumb.
- **Blue-Black Ink** (`ink`, 15.6:1), **Muted Ink** (`ink-muted`, 7.4:1), **Faint Ink** (`ink-subtle`, 5.4:1): primary text, secondary text, captions and placeholders.
- **Scrim** (`overlay`): modal and mobile-sidebar backdrop. The photo lightbox uses its own near-black `rgb(8 11 16 / 0.96)`.
- The Tailwind `gray-50..950` scale is remapped onto these same tinted neutrals, so stray gray classes stay inside the system.

### Status

`success`, `warning`, `error`, `info`, each with a `-soft` background, drive badges, toast stripes, inline alerts, finance income and expense, and trend deltas. `live` (#C62828) is reserved for live-stream indicators: the pulsing dot in the nav, the live badge on the stream teaser.

### Named Rules

**The One Binding Rule.** Bookcloth green is the only colour that fills large areas. Every other hue appears as text, a hairline, a dot, or a soft tint.

**The Gilt Stamp Rule.** Gilt marks; it never carries. Use it for stamped meta (dates, categories, scripture references), column headings on bookcloth, and small marks like the crest and count chips. Never for body text, button fills, or button labels.

**The Margin Is Structure Rule.** Margin red exists only as the two hairlines of the double margin. It never colours text, icons, or fills; errors use `error`, live status uses `live`.

## Typography

**Display Font:** Bitter (with Roboto Slab, Rockwell, Georgia, serif), weights 500, 600, 700
**Body Font:** Public Sans (with ui-sans-serif, system-ui, sans-serif), weights 400, 500, 600, 700, italic 400

**Character:** Bitter is record-book label type, a sturdy slab that reads like a stamped spine title; Public Sans is plain civic text, legible at small sizes in dense tables. All `h1`-`h4` default to Bitter with `text-wrap: balance` and -0.01em tracking; paragraphs use `text-wrap: pretty`.

### Hierarchy

- **Display** (Bitter 700, 2.25rem to 3rem at sm to 3.5rem at lg, line-height 1.1): the hero welcome headline in ink blue, inside the margin-ruled ledger panel. A lead-in phrase may sit inside the same `h1` as a Bitter 500 line at 1.25-1.5rem in muted ink. Bookcloth page heroes (About, Gallery) use 2.25rem to 3rem in white.
- **Headline** (Bitter 700, 1.875rem to 2.5rem at md, line-height 1.15): public section headings in ink blue; subtitle below at 1.125rem/1.625 muted, max 42rem wide, 12px gap.
- **Page Title** (Bitter 700, 1.25rem to 1.625rem at sm, line-height 1.25): the admin top-bar title, in ink, beside the margin rule; 14px muted subtitle.
- **Title** (Bitter 600, 1.125rem, line-height 1.375): panel headings, modal titles, card and event titles (1.25rem on md+ in public entry rows). Smaller panel titles step to 1rem or 15px.
- **Figure** (Bitter 600, 1.875rem, line-height 1, tabular): stat values and finance totals; finance summary figures at 1.25rem; event-row date numerals at 2.25rem Bitter 700.
- **Body** (Public Sans 400, 1rem to 1.125rem, line-height 1.625): public copy, never below 16px, measure at most 70ch.
- **Body Admin** (Public Sans 400, 0.875rem, line-height 1.43): admin tables, forms, lists. Dense grids drop to 13px.
- **Prose** (Public Sans 400, 1.0625rem, line-height 1.75, max 68ch, 1.1em between paragraphs): long-form teaching text.
- **Label** (Public Sans 600, 0.75rem, 0.025em tracking, uppercase, muted ink): table headers and stat-card labels. Form labels are sentence case, 14px 500 ink (16px on public forms).
- **Stamp** (Public Sans 600, 0.75rem, 0.06em tracking, uppercase, gilt): dates and categories stamped onto entries.
- **Citation** (`.citation`, Public Sans 500, 15px/24px, ink-muted, sentence case): the line under a heading that carries a scripture reference, a step label, or a Settings-supplied subtitle label. On bookcloth it is white at 80%.
- **Micro** (Public Sans 600, 0.6875rem): small badges and sidebar group labels.

The size steps are Tailwind's default ramp (12, 14, 16, 18, 20, 24, 30, 36, 48px) plus the 11px micro step and occasional 13px and 15px; the "1.2 minor third" note in the stylesheet header does not describe what shipped.

### Named Rules

**The Tabular Figures Rule.** Every number that can sit in a column or be compared (counts, amounts, dates, times, page numbers, stat values, pagination summaries) is set with tabular lining figures. Tables get it by default; everything else takes the `num` utility. Money columns are right-aligned.

**The Slab Speaks, Sans Reads Rule.** Bitter is for headings, titles, and display figures. Anything a person reads in sentences is Public Sans.

## Layout

**Public.** Container 1280px max (`max-w-7xl`) with 20/24/32px gutters at base/sm/lg; narrower containers (1152px leaders, 1024px contact form) for reading-led sections. Sections run 64px vertical padding, 96px from md, and alternate `surface` and `surface-muted`; one or two sections per page may be a bookcloth field. Header-to-content spacing is 40px, 48px from md. Card grids are 1/2/3 columns with 24-32px gaps; leader grids 2/3/4 columns. Touch targets are at least 44px, primary hero and form actions 48px. The sticky navbar is translucent white (95% with backdrop blur) under a 4px bookcloth band and gains a rule and `shadow-md` once scrolled.

**Admin.** Fixed 240px bookcloth sidebar on lg+ (256px off-canvas drawer below lg, sliding in over the scrim). Main column on `canvas`, content capped at 1440px with 16/20/32px padding. Page sections stack with 24px gaps. Forms in settings cap at 42-48rem; two-column field grids from sm.

**Rhythm.** A 4px base: 8, 12, 16, 20, 24, 32px within components; 64/96px between public sections. Panels pad 20px; table cells 16px by 12px; compact field rows 12px.

**Breakpoints.** Tailwind defaults: 640, 768, 1024, 1280px. The sidebar pins at 1024px; field heights step from 44px to 40px at 640px.

### Named Rules

**The Rows Before Cards Rule.** Lists of entries (events, service times, audit entries, messages, footer links) are ruled rows, not card grids. Cards are for items where a thumbnail carries meaning: sermons, gallery, leaders, roles.

## Elevation & Depth

Depth is hairline-first. Borders in `rule` define every panel; shadows are soft, low, and tinted with ink (`--shadow-color: 23 33 49`). Resting panels get only the faintest lift; floating things get real shadows.

### Shadow Vocabulary

- **Resting** (`box-shadow: 0 1px 2px rgb(23 33 49 / 0.06)`): cards, tables, inputs, buttons, filter bars.
- **Small** (`box-shadow: 0 1px 2px rgb(23 33 49 / 0.06), 0 1px 3px rgb(23 33 49 / 0.08)`): the active sidebar item.
- **Hover lift** (`box-shadow: 0 2px 4px rgb(23 33 49 / 0.05), 0 6px 16px rgb(23 33 49 / 0.08)`): card hover, the scrolled navbar.
- **Floating** (`box-shadow: 0 4px 8px rgb(23 33 49 / 0.06), 0 16px 40px rgb(23 33 49 / 0.14)`): dropdowns, toasts, the sticky settings save bar, the hero ledger panel on desktop.
- **Overlay** (`box-shadow: 0 8px 16px rgb(23 33 49 / 0.08), 0 28px 64px rgb(23 33 49 / 0.2)`): modals, the open mobile sidebar, the lightbox image.

### Named Rules

**The Hairline First Rule.** A border in `rule` defines the panel; the shadow only confirms it. Never a shadow without a border on a resting surface, never a coloured glow, never a hard offset shadow.

## Shapes

Squared like a bound book. Buttons, inputs, selects, icon buttons, badges' larger kin, dropdown menus, image frames, and the hero panel are 6px; cards, tables, filter bars, toasts, and the save bar are 8px; modals 10px (top corners only on the mobile bottom sheet); badges and stamps 4px. Only avatars, social icon buttons, the footer crest, status and unread dots, and the live pulse are round. Borders are 1px hairlines; the only 2px strokes are tab and nav underlines and the logo ring. The double margin is two 1px red rules 5px apart, at 85% opacity, with 20px of text inset. Long-form sections may use ledger-paper ruling: a 1px `rule` line every 32px.

## Components

### Buttons

Plain and firm, like a stamped label.

- **Shape:** 6px corners, semibold, no wrap, icon gap 8px (6px small).
- **Sizes:** small 36px tall, 12px padding, 13px text; medium 44px (40px from sm), 16px padding, 14px; large 48px, 24px padding, 16px. Public hero and form actions use the large size.
- **Primary:** bookcloth fill, white label, resting shadow; hover `primary-hover`, press `primary-active`.
- **Secondary:** paper fill, `rule-strong` border, ink label; hover `surface-muted` with border darkening to `ink-subtle`; press `surface-sunken`.
- **Danger:** `error` fill, `on-primary` label; hover brightness 95%, press 90%.
- **Ghost:** no fill, muted ink; hover `surface-sunken` and ink.
- **Icon button:** 36px square (40-48px on touch-heavy public surfaces and in the lightbox), faint ink, hover `surface-sunken`.
- **Text link action:** "View all" and "Read more" links are 16px semibold bookcloth ink with an underline on hover and a trailing arrow, 44px tall.
- **Focus:** the global 2px `focus` outline at 2px offset; on bookcloth fields focus turns gold (`focus-on-bookcloth`).
- **Loading / Disabled:** a spinning `mdi:loading` leads the label and sets `aria-busy`; disabled drops to 55% opacity, no shadow, not-allowed cursor.

### Inputs / Fields

- **Text input:** paper fill, 1px `rule-strong` border, 6px corners, resting shadow, 12px by 8px padding, 40px tall (44px under 640px, with 15px text). Compact density is 36px with 13px text. Public forms are 48px with 16px text.
- **Hover / Focus:** hover darkens the border to `ink-subtle`; focus sets the border to bookcloth plus a 3px bookcloth ring at 15%. The caret is bookcloth.
- **Error:** border and ring switch to `error`; message below in 12px semibold error with an alert-circle icon. Required fields add a red asterisk after the label.
- **Disabled:** `surface-muted` fill, faint ink text.
- **Select:** same frame, native appearance removed, a faint chevron 10px from the right, placeholder in faint ink until a value is set.
- **Textarea:** same frame, vertical resize only, relaxed line height.
- **Checkbox / radio:** native controls tinted bookcloth via `accent-color`; the attendance grid uses 18px checkboxes.
- **Labels:** 14px medium ink above the field, 6px gap; helper text 12px faint ink.

### Cards / Containers

- **Panel:** paper fill, 1px `rule` border, 8px corners, resting shadow, 20px padding (12px small, 24px large).
- **Image card (sermons, teachings):** the same frame with a 16:9 thumbnail flush to the top on a `surface-sunken` placeholder, up to two category stamps top-left, a Bitter 18px title (bookcloth ink on hover), a muted author and tabular date line, and a "Read more" link pinned to the bottom. Hover deepens the border to `rule-strong`, lifts to the hover shadow, and scales the image to 103%.
- **Stat strip (dashboard):** the four figures share one ruled register strip: a single bordered `surface` panel whose cells are separated by 1px `rule` gaps (1 column, 2 from sm, 4 from xl). Each cell: a 14px sentence-case muted label, the value in Bitter 28px tabular ink, a quiet sparkline at 70% opacity, and an optional 12px delta badge and subtitle. No floating cards, no icon tiles.
- **Chart container:** panel frame, header row with a Bitter 16px title and muted subtitle, chart 16px below.
- **Inline alert:** 6px corners, status-soft fill, status border at 25%, status text, leading outline icon.

### Data Tables

- **Wrapper:** panel frame with horizontal scroll.
- **Header:** sticky, `surface-muted`, uppercase label style, 16px by 10px cells, `rule` bottom border, no wrap.
- **Body:** rows divided by `rule`; cells 16px by 12px, 14px ink; secondary cells muted; hover tints the row `surface-muted` at 70%.
- **Numbers:** tabular by default; money right-aligned.
- **Row actions:** ghost icon buttons; destructive ones hover to `error-soft` and `error`.

### Pagination

A top-ruled footer row: tabular "Showing 1-20 of 84 members" in 12px muted on the left, 36px square buttons on the right. Pages are paper with a `rule-strong` border; the current page is a bookcloth fill. Windowed with ellipses beyond seven pages. Prev and next disable to 40%.

### Modals

Bottom sheet on mobile (top corners rounded), centred dialog from 640px, widths 384/448/576/768px. Paper panel, `rule` border, 10px corners, overlay shadow, max 88-92vh with an internal scroll. Header row: Bitter 18px title and a 40px close button, ruled below. Optional footer on `surface-muted`, ruled above. Enters with the scrim fading in (180ms) and the panel rising 16px (280ms, expo out). Escape and scrim click close.

### Dropdowns

Paper panel, `rule` border, floating shadow. The public Teachings menu is 320px wide, 8px corners, entries as ruled rows (36px bookcloth-wash icon tile, Bitter 15px label, 14px muted description), hover `surface-muted`; it fades in while rising 4px (150ms). Row action menus are 6px corners with 4px vertical padding.

### Tabs

A single feint rule under a horizontally scrolling row. Tabs are 44px tall with 14px padding. Active: a 2px bookcloth underline, semibold bookcloth ink. Inactive: medium muted ink; hover shows a `rule-strong` underline and ink text.

### Badges

- **Status badge:** 4px corners, semibold, a 1px inset ring at 25% of the status colour on its soft fill (`success`, `warning`, `danger`, `info`); `neutral` is `surface-sunken` with muted ink and a `rule-strong` ring. Medium 12px text with 8px by 2px padding; small 11px.
- **Role chips:** a member's assigned role is a neutral chip led by an 8px dot in that role's own colour; an account role (Super Admin, Admin, and so on) is a bookcloth-wash chip in bookcloth ink with a 20% ring. Permission counts are small neutral badges with tabular figures; custom permissions are a small warning badge.
- **Category stamp:** gilt stamp type on `accent-soft`, 4px corners, 20% gilt ring.
- **Read / unread:** unread rows carry an 8px bookcloth dot in a fixed 8px gutter, a 35% bookcloth-wash background, the sender in semibold ink, and the timestamp in semibold bookcloth ink; read rows drop the dot and fill and fall back to muted and faint ink.
- **Sidebar count:** a tabular 11px bold chip in gilt-on-bookcloth with dark gilt text, inverting to bookcloth when its item is active.

### Toasts

Top-right stack (full width with 12px insets on mobile), max 384px. Paper card, `rule` border, 8px corners, floating shadow, with a 4px status-colour stripe on the left edge, a status outline icon, 14px ink message, and a 32px dismiss button. Slides in 20px from the right; polite live region.

### Empty and Loading States

- **Empty state:** centred; a 56px (40px small) dashed `rule-strong` well on `surface-muted` holding a faint outline icon, a Bitter title, a muted description up to 24rem, an optional action. Inline variant for card slots.
- **Spinner:** bookcloth `mdi:loading` with a muted 14px caption.
- **Skeleton:** for tables; 40px bars, 6px corners, a shimmer from `surface-sunken` through `surface-muted` over 1.6s, each row delayed 80ms and progressively fainter.

### Navigation

- **Public navbar:** 4px bookcloth band on top, then a translucent white bar: round crest with ink-blue ring, Bitter 17px wordmark in ink blue, links in 15px medium muted ink with a 2px transparent underline that turns bookcloth (with bookcloth ink text) when active. The Live link turns `live` red with a pinging dot while streaming. A 44px bookcloth primary action ends the row. Below 1024px a 48px menu button opens a full-width ruled panel of 48px rows; active rows take a bookcloth wash.
- **Admin sidebar:** the bookcloth spine. Church identity block (40px crest tile in white at 10% with a gilt church icon, Bitter 15px name, 12px "Admin Dashboard" at 65% white), then the address in a black-15% well. Items 40px (44px mobile), 14px medium white at 80% with 19px icons at 60%; hover white at 10%. Active: a white tile with deep-green text and icon and a small shadow. A bottom group, ruled off in white at 10%, holds Home and Logout.
- **Admin top bar:** sticky, white at 95% with blur, ruled below. The page title sits inside the double margin; the `#admin-header-actions` slot on the right receives each page's primary actions. Environment and missing-role banners stack above it.

### Public Patterns

- **Hero:** a bookcloth frame (8-16px) around a 6px-cornered white sheet. The church's own photo fills the sheet (42-50svh on mobile, full height on desktop with a bottom shade). A white ledger panel, at most 672px and floating with the floating shadow on desktop, holds the margin-ruled welcome headline, a service-time line with a bookcloth icon, a Bitter italic line, and a large primary plus large secondary action. Entrance: `hero-animate`, 0.7s expo rise of 14px.
- **Bookcloth page hero:** interior pages (About, Gallery) open on a flat bookcloth field with a white Bitter title, a white-80% citation line below it, and a white-80% lead.
- **Section header:** Bitter headline in ink blue with a muted lead; no double margin (that is reserved for page titles and the hero entry).
- **Entry list (events, service times):** a list bounded by `rule-strong` above and below, rows divided by `rule`, 24px vertical padding. Left column: the day in Bitter 36px tabular ink blue over a gilt stamp of month and time with an 8px category dot. Body: Bitter 18-20px title and a muted 16px meta line with faint icons. A secondary button closes the row.
- **Sermon cards:** the image card above, in 1/2/3-column grids, revealing with `reveal-scale`.
- **Gallery:** CSS masonry, 4/3/2 columns, 12px gaps, 6px corners on a `surface-sunken` placeholder; hover scales the image to 102% and dims to 92% brightness.
- **Lightbox:** a near-black full-screen dialog (`rgb(8 11 16 / 0.96)`); image up to 82vh with 6px corners and the overlay shadow; 48px close and 56px prev/next buttons in white at 10% (20% on hover); a tabular counter pill at the bottom; gold focus ring; swipe on touch.
- **Leader profiles:** 4:5 portraits with 6px corners and a `rule` border on `surface-sunken` (a Bitter 36px monogram in bookcloth ink when there is no photo), Bitter 18px name, gilt stamp role below.
- **Form sections:** contact and registration forms on paper, 16px medium labels, 48px public fields, a full-width large primary submit; a bookcloth info aside lists contact details in white.
- **Footer:** a flat bookcloth field, 56-64px top padding. Brand column (round gilt-ringed crest, Bitter 20px name, address, an italic quotation set off by a 1px gilt rule, 44px round social buttons), then link columns headed by gilt uppercase 12px headings whose links are 44px ruled rows in white at 80%. A white-15% rule separates the copyright line.

### Admin Patterns

- **Filter bar:** an 8px panel with 12px padding, controls wrapping with 12px gaps and aligned to the bottom edge.
- **Attendance grid:** a separated-border table capped at 70vh with both a sticky header row and a sticky first column (member names in Bitter 14px semibold); every cell ruled on the left and bottom; 13px text; totals right-aligned and tabular; 18px bookcloth checkboxes. Info notes in an `info-soft` alert; progress bars are 6px `surface-sunken` tracks with a bookcloth fill that animates width over 280ms.
- **Finance amounts:** summary figures in Bitter tabular (30px for totals, 20px for income in `success`, expense in `error`, net in ink); amount inputs are tabular and right-aligned; transaction rows carry a success or danger badge with an arrow icon.
- **Settings layout:** a 224px sticky section nav on lg+, ruled on the right, grouped under 11px uppercase faint labels and replaced by a select below lg. Each section is a panel with a ruled header (Bitter 16px title, 13px muted description up to 70ch) over 20px of body. Repeating sub-entries are 6px cards on `surface-muted` at 50%. Unsaved changes raise a sticky floating save bar with an 8px warning dot.
- **Audit rows:** a ruled table with a sticky label header; timestamps tabular and muted; the actor in medium ink; long detail truncated at 16rem; a 12px faint explanatory note up to 70ch above.
- **Messages inbox:** ruled rows using the read/unread treatment above, with a small success "Handled" badge.

### Chart.js Theme

Applied once at startup by the chart-theme plugin. Fonts are Public Sans 12px; text and legend labels use `ink-muted`; gridlines and borders use `rule`. Legends use 8px point-style markers. Tooltips are an ink fill with surface-coloured text, 6px corners, 10px padding, a 600-weight title. Bars have 3px corners; lines are 2px with 0.3 tension and no points until hover (4px); arcs are separated by a 2px surface-coloured border. Series colours come in a fixed order (`chart-bookcloth`, `chart-ink`, `chart-gilt`, `chart-margin`, `chart-slate`, `chart-plum`, `chart-teal`, `chart-clay`), each at least 3:1 against the white surface; status charts use `chart-positive`, `chart-margin` for negative, `chart-slate` for neutral, and `chart-gilt` for caution. Area and bar fills are the same hues at reduced alpha.

### Motion

Durations are 120ms (fast), 180ms (base), 280ms (slow); hovers run 150-200ms. Entrances use expo-out (`cubic-bezier(0.16, 1, 0.3, 1)`), progress and the live pulse quart-out (`cubic-bezier(0.25, 1, 0.5, 1)`). Scroll reveals are deliberately small (16px rise, 20px side slide, or 97% scale, 0.6s) with 75-400ms stagger, so a missed observer never leaves a page blank. Pages crossfade at 180ms. The admin sidebar slides in over 300ms.

**Reduced motion:** under `prefers-reduced-motion: reduce` every animation and transition collapses to 0.01ms and runs once, smooth scrolling stops, reveal elements render in place at full opacity, and the hero entrance is removed.

## Do's and Don'ts

### Do:

- **Do** use the semantic tokens (`surface`, `ink`, `rule`, `primary`) rather than raw palette colours, so the system stays consistent.
- **Do** put the red double margin on page-title header blocks, the admin top-bar title, and the single featured hero entry panel.
- **Do** set every count, amount, date, and time in tabular figures, and right-align money.
- **Do** build entry lists as ruled rows with a Bitter date column before reaching for cards.
- **Do** keep public body copy at 16px or larger with a measure under 70ch, and touch targets at 44px or more.
- **Do** frame resting panels with a `rule` hairline and the resting shadow; save floating shadows for things that float.
- **Do** use one icon family, Material Design Icons outline glyphs.

### Don't:

- **Don't** put the double margin on cards in a grid, list items, or table rows.
- **Don't** set gilt on body text, button fills, or button labels; it is for stamps and small marks.
- **Don't** place eyebrow or kicker labels above headings. Meta that carries real information (a scripture reference, a step label) goes below the heading as a `.citation`.
- **Don't** put the red double margin on ordinary section headings. It belongs on the hero entry panel and page-title headers only; `SectionHeader` does not draw it.
- **Don't** use gradient text, glassmorphism, coloured glows, hard offset shadows, or a coloured left border wider than 1px on cards (toast status stripes are the single exception).
- **Don't** use pill-shaped buttons or radii above 10px on surfaces; only avatars, dots, and round icon buttons are fully round.
- **Don't** use emoji as icons, or fonts other than Bitter and Public Sans.
- **Don't** add a dark mode or `dark:` classes; the product is light only.
