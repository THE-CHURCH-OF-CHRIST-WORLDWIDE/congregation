---
name: Congregation
description: The church as a cultural institution in print; one editorial world for the public site and the admin dashboard.
colors:
  surface: '#faf8f3'
  canvas: '#f3efe6'
  surface-muted: '#f3efe6'
  surface-sunken: '#eae5da'
  overlay: 'rgb(17 16 14 / 0.6)'
  night: '#1a1916'
  night-raised: '#24231f'
  on-night: '#f3efe6'
  on-night-muted: '#bdb6a8'
  champagne: '#d4bc8e'
  rule: '#e2dccf'
  rule-strong: '#c8bfad'
  margin: '#a88456'
  ink: '#1b1a17'
  ink-muted: '#4f4b43'
  ink-subtle: '#6b665c'
  primary: '#2f3d2c'
  primary-hover: '#263223'
  primary-active: '#1d271b'
  primary-soft: '#e6e8dc'
  on-primary: '#faf8f3'
  secondary: '#22211d'
  secondary-soft: '#edeae2'
  accent: '#8a6a3b'
  accent-soft: '#f2eadb'
  success: '#2f6b43'
  success-soft: '#e6efe5'
  warning: '#8f5a12'
  warning-soft: '#f7ecd9'
  error: '#a3321f'
  error-soft: '#f8e6e1'
  info: '#2f5577'
  info-soft: '#e5ecf2'
  live: '#b3261e'
typography:
  display:
    fontFamily: "'Instrument Serif', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif"
    fontSize: 'clamp(3rem, 8.4vw, 6rem)'
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: '-0.025em'
  headline:
    fontFamily: "'Instrument Serif', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif"
    fontSize: 'clamp(2.625rem, 5.6vw, 4.75rem)'
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: '-0.022em'
  headline-section:
    fontFamily: "'Instrument Serif', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif"
    fontSize: 'clamp(2.125rem, 3.9vw, 3.5rem)'
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: '-0.018em'
  title-serif:
    fontFamily: "'Instrument Serif', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif"
    fontSize: 'clamp(1.5rem, 2.1vw, 2rem)'
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: '-0.01em'
  title-ui:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1rem'
    fontWeight: 600
    lineHeight: 1.375
  lede:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: 'clamp(1.0625rem, 1.3vw, 1.25rem)'
    fontWeight: 400
    lineHeight: 1.65
  body-long:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.8
  body:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.875rem'
    fontWeight: 400
    lineHeight: 1.43
  label:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontSize: '0.6875rem'
    fontWeight: 600
    lineHeight: 1.4545
    letterSpacing: '0.16em'
  numeral:
    fontFamily: "'Manrope', ui-sans-serif, system-ui, sans-serif"
    fontFeature: "'tnum' 1, 'lnum' 1"
rounded:
  xs: '1px'
  sm: '2px'
  md: '3px'
  lg: '4px'
  xl: '6px'
  2xl: '8px'
  round: '9999px'
spacing:
  gutter-sm: '1.25rem'
  gutter-md: '2rem'
  gutter-lg: '3rem'
  section: 'clamp(4.5rem, 10vw, 9rem)'
  section-tight: 'clamp(3.5rem, 7vw, 6rem)'
  site-max: '88rem'
  nav-h: '5rem'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.title-ui}'
    rounded: '{rounded.sm}'
    padding: '0 1.5rem'
    height: '3rem'
  button-primary-hover:
    backgroundColor: '{colors.primary-active}'
  button-dark:
    backgroundColor: '{colors.night}'
    textColor: '{colors.on-night}'
    rounded: '{rounded.sm}'
    padding: '0 1.5rem'
    height: '3rem'
  button-dark-hover:
    backgroundColor: '{colors.primary}'
  button-outline:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '0 1.5rem'
    height: '3rem'
  button-outline-hover:
    backgroundColor: '{colors.ink}'
    textColor: '{colors.surface}'
  button-light:
    backgroundColor: '{colors.on-night}'
    textColor: '{colors.night}'
    rounded: '{rounded.sm}'
    padding: '0 1.5rem'
    height: '3rem'
  button-light-hover:
    backgroundColor: '{colors.champagne}'
  button-admin-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    rounded: '{rounded.sm}'
    padding: '0 1rem'
    height: '2.5rem'
  button-admin-primary-hover:
    backgroundColor: '{colors.primary-hover}'
  button-admin-secondary:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '0 1rem'
    height: '2.5rem'
  button-admin-secondary-hover:
    backgroundColor: '{colors.surface-muted}'
  field-input-public:
    backgroundColor: 'transparent'
    textColor: '{colors.ink}'
    rounded: '0'
    padding: '0.75rem 0'
    height: '3rem'
  input-admin:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '0.5rem 0.75rem'
    height: '2.5rem'
  card-admin:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.sm}'
    padding: '1.25rem'
  badge-neutral:
    backgroundColor: '{colors.surface-sunken}'
    textColor: '{colors.ink-muted}'
    rounded: '{rounded.sm}'
    padding: '0.125rem 0.5rem'
  badge-success:
    backgroundColor: '{colors.success-soft}'
    textColor: '{colors.success}'
    rounded: '{rounded.sm}'
    padding: '0.125rem 0.5rem'
  admin-rail:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-night}'
    width: '15rem'
---

# Design System: Congregation

## Overview

**Creative North Star: "The Nave"**

The church as a cultural institution in print: an editorial publication you walk through like a nave, cover first. Pages are warm ivory paper with stone alternates; the cover, live worship and the close of every page sit in charcoal night fields; one deep forest green is the committed colour field. Instrument Serif sets the headlines large, at its single weight, with italic turns; Manrope carries everything that is read or operated. Bronze and champagne appear only as hairlines, dates, marks and active indicators.

Density is generous on the public site (section padding scales from 72px to 144px, more air above a heading than below) and efficient in the admin dashboard, which uses the same palette and type with standard controls: a forest rail, ivory work surface on a stone ground, Instrument Serif page titles and Manrope semibold for every small UI title. The frame is brand-neutral and light-only by product commitment: each church's own photographs and name lead, and nothing in the system assumes one congregation's colours. There is no dark mode.

Motion is one orchestrated grammar, not a collection of effects: headings rise word by word from behind masks, image frames unveil from their bottom edge while the photo settles, hairlines draw across, content rises into place. Everything eases out exponentially and everything stands still under reduced motion.

**Key Characteristics:**

- Warm ivory page, stone alternates, charcoal night fields, one forest field.
- Instrument Serif headlines at weight 400 only; Manrope for text and UI.
- Bronze and champagne as hairlines and marks, never as surfaces.
- Square corners (1 to 8px); round only for dots, avatars and round icon buttons.
- Lists of entries as hairline-ruled rows, not card grids.
- Flat surfaces; shadow only on floating layers (modal, menus, toasts).
- One motion grammar: masked word rise, clip-path unveil, hairline draw, rise.

## Colors

A warm, low-chroma print palette: paper, stone, charcoal and forest, with bronze kept to the width of a line.

### Primary

- **Nave Forest** (primary): the one committed large colour field besides night and stone. Primary actions, the admin sidebar rail, the congregation-search field on the home page, focus rings on ivory, checkbox and radio accent, progress fills, the placeholder face of a missing thumbnail. Darkens to Forest Hover and Forest Pressed on interaction; Forest Wash (primary-soft) is its quiet tint.

### Secondary

- **Charcoal Night** (night): full-bleed fields for the cover, live worship and the footer close; the dark button. Night Raised lifts panels inside it. Text on night uses Night Ivory (on-night) and Night Stone (on-night-muted).
- **Heading Charcoal** (secondary): section headings and strong text on ivory.

### Tertiary

- **Bronze** (accent): hairline marks on ivory. Event dates and categories (the stamp), the active tab underline, the active nav hairline, short rule marks above a signature, the text caret, empty-state icon strokes. Passes 4.6:1 on ivory, so it may carry small metadata text; it never carries body copy.
- **Champagne** (champagne): the same role on night and forest fields. Active nav hairline over the cover, the animated scroll line, focus rings on dark fields, the admin unread count, the hover state of round play buttons, the hover wipe of the light button.
- **Margin Bronze** (margin): the 1px signature hairline left of a page header or entry panel.

### Neutral

- **Ivory Page** (surface): the default page and every admin work surface.
- **Stone** (canvas / surface-muted): alternate public sections, the admin ground, quiet panels, modal footers.
- **Sunken Stone** (surface-sunken): wells, skeletons, neutral badges, image placeholders.
- **Stone Hairline** (rule) and **Strong Hairline** (rule-strong): every border and divider; strong for inputs, outline buttons and emphasised list tops.
- **Ink** (ink), **Muted Ink** (ink-muted), **Subtle Ink** (ink-subtle): body text, secondary text, metadata and placeholders. All pass AA on ivory.
- The Tailwind gray scale is remapped to these warm stones (#faf8f3 to #11100e), so any unmigrated gray still sits in the world.
- Status colours (success, warning, error, info, each with a soft wash) and Live Red (live) are muted pigments used only for state.

### Named Rules

**The Hairline Metal Rule.** Bronze and champagne are for marks, dates, active states and hairlines. They are never a resting fill for a rectangular button, a section background or body text. Champagne may appear as a hover state (the light button's wipe, a round play button) because that is an active state.

**The One Field Rule.** Large colour fields are night, forest or stone. Forest is the only committed chromatic field; no other hue takes a full section.

**The Light Only Rule.** One light scheme on both the public site and the admin. No dark mode, no scheme toggle.

## Typography

**Display Font:** Instrument Serif, regular and italic (with Iowan Old Style, Palatino Linotype, Georgia)
**Body Font:** Manrope 400, 500, 600, 700 (with ui-sans-serif, system-ui)

**Character:** A condensed, high-contrast editorial serif set oversized and tight, against a calm geometric sans that does all the reading and operating. The contrast is scale and voice, never weight.

### Hierarchy

- **Display** (400, clamp 48 to 96px, 0.94): the church name on the cover. One per page.
- **Headline** (400, clamp 42 to 76px, 0.98): page titles on inner public pages.
- **Section Headline** (400, clamp 34 to 56px, 1.02): section headings, usually capped near 14 to 18ch.
- **Serif Title** (400, clamp 24 to 32px, 1.1): sub-sections and form group titles; entry titles in ruled lists sit at 24 to 28px. Admin page titles use the serif at 26 to 32px.
- **UI Title** (Manrope 600, 16px, 1.375): modal titles, admin card and panel titles, small headings in operational UI.
- **Lede** (400, clamp 17 to 20px, 1.65, muted ink): the paragraph that opens a section.
- **Long-form Body** (400, 17px, 1.8, max 68ch): teachings and prose.
- **Body** (400, 14 to 15px): admin text and UI.
- **Label** (600, 11px, 0.16em tracking, uppercase): marginalia, metadata, side-rail labels, public form field labels. The bronze stamp is the same face at 0.14em in accent.
- **Numerals**: tabular, lining figures for money, counts and dates in columns; tables default to tabular figures.

### Named Rules

**The Single Weight Rule.** Instrument Serif ships one weight. It is set at 400 and font synthesis is off; never bold or semibold a serif. Emphasis in a headline is the italic turn.

**The Sans For Small Titles Rule.** Below about 20px, a UI title is Manrope semibold, not the serif.

**The No Kicker Rule.** Nothing sits above a heading as a small tracked label. Small tracked capitals are marginalia and metadata only; tags and categories go after a title, never before it.

## Layout

One container for every public section: max 88rem, centred, with a gutter of 20px on phones, 32px from 640px and 48px from 1024px. Sections pad vertically with a fluid clamp (72 to 144px; a tight variant 56 to 96px). Compositions use a 12-column grid at large widths with asymmetric splits (a heading block of 5 to 7 columns against a list offset to the right), collapsing to a single column on phones.

The navbar is fixed at 72px (80px from 1024px). Pages that open on a full-bleed cover run under it, transparent, by declaring `navOverlay: true` in page meta (the landing page always does); every other page starts below it.

Lists of entries (events, teachings, congregations, search results) are hairline-ruled rows inside an ordered list: a strong rule on top, stone hairlines between, generous row padding (28 to 36px), a fixed-width lead column for a date numeral or thumbnail.

The admin is a fixed 240px forest rail (256px drawer on mobile) beside a stone ground; a sticky ivory header carries the page title, and content sits in a max 1440px column padded 16 to 32px.

**The Ruled Rows Rule.** A collection of entries is a ruled list, not a grid of cards. Image tiles in a gallery are the exception; text entries never are.

## Elevation & Depth

Flat by default. Depth comes from field changes (ivory to stone to night) and hairlines, not shadow. A warm shadow scale exists, tinted from rgb(27 25 20), and is used only on layers that genuinely float: modals, popovers, toasts and the sticky settings save bar. Sticky bars that must hide scrolled content use a near-opaque ivory (92 to 95%) with a light blur; that is the only translucency in the system.

### Shadow Vocabulary

- **Float Medium** (`0 2px 4px rgb(27 25 20 / 0.04), 0 8px 20px rgb(27 25 20 / 0.07)`): menus and popovers.
- **Float Large** (`0 4px 8px rgb(27 25 20 / 0.05), 0 18px 44px rgb(27 25 20 / 0.12)`): toasts, the settings save bar.
- **Float Modal** (`0 8px 16px rgb(27 25 20 / 0.07), 0 30px 70px rgb(27 25 20 / 0.18)`): dialogs.

### Named Rules

**The Paper Rule.** Resting surfaces have no shadow. If it does not float above the page, it does not cast.

## Shapes

Square and printed. Radii run 1, 2, 3, 4, 6 and 8px; buttons, inputs, badges and cards sit at 2px, modals at 3px. Round is reserved for dots, avatars, the church seal and round icon buttons (play buttons, empty-state icon rings). Public form fields have no box at all: a single underline that thickens to forest on focus. Image frames are crisp-edged rectangles that clip a slow zoom.

The world's signature is the hairline: stone rules between rows, a 1px bronze margin rule left of a page header, short bronze marks above a signature, a bronze or champagne underline for the active item.

**The No Pill Rule.** Nothing rectangular is pill-shaped. A tag, badge, button or chip keeps its 2px corner.

## Components

### Buttons

Tactile and quiet: a fill wipes up from the baseline on hover, an arrow nudges 4px.

- **Shape:** squared (2px).
- **Public primary:** forest with ivory text, 48px tall, 24px padding, Manrope 600 at 15px; hover wipes up Forest Pressed over 450ms.
- **Public dark / outline:** night with ivory (hover wipes forest); outline is a strong hairline with ink text, wiping to solid ink with ivory text.
- **On night and forest fields:** light (ivory with night text, wiping to champagne) and ghost-light (a 42% ivory hairline, wiping to ivory).
- **Admin Button:** primary (forest, darkening to Forest Hover), secondary (ivory with strong hairline, stone on hover), danger (error red), ghost (muted text, sunken stone on hover). Sizes 36, 40 (44 on touch) and 48px. Colour transitions only, 150ms.
- **Inline link:** a 1px underline that retracts left to right on hover, with an arrow that nudges forward.

### Chips and Badges

- **Style:** 2px corners, soft status wash with its matching ink and a 1px inset ring at 25% strength; neutral is sunken stone with muted ink. 11 to 12px, semibold.
- **Filters (public):** tag filter buttons underline with a bronze hairline that draws from the left; no filled pills.

### Cards / Containers

- **Corner Style:** 2px.
- **Background:** ivory on the stone admin ground.
- **Shadow Strategy:** none (The Paper Rule).
- **Border:** one stone hairline.
- **Internal Padding:** 12, 16 to 20, or 20 to 24px.
- Cards are an admin container. On the public site, entries are ruled rows; a teaching appears as an image frame over a serif title with author and date after it.

### Inputs / Fields

- **Public field:** no box; a strong-hairline underline, 48px tall, 17px text, an uppercase tracked label above. Hover darkens the line; focus turns it forest and doubles it.
- **Admin field:** ivory, strong hairline, 2px corners, 40px (44 on touch); focus is a forest border with a 3px forest ring at 15%. Error swaps to error red with an icon and message below. Disabled sits on stone with subtle ink.
- Checkboxes and radios take the forest accent colour; the caret is bronze.

### Navigation

- **Public navbar:** fixed, 72 to 80px. Over a cover it is transparent with ivory type over a soft top veil; scrolled, it is 92% ivory with a stone hairline. Links are Manrope 500 at 14px, 78% opacity at rest; hover draws a 1px underline from the left; the active link holds a bronze hairline (champagne over the cover). Mobile opens a full-screen menu that wipes down and sets each link in the serif at 32 to 44px, active in italic forest, rows ruled.
- **Admin rail:** forest field, church name in the serif, a tracked champagne label for the congregation, Manrope 500 links; the active item carries a champagne mark; unread counts are a small champagne tab with tabular figures.
- **Tabs:** a stone baseline; the active tab is ink semibold over a 2px bronze underline.

### Empty States

- **Public:** the editorial note. A hairline top rule, one italic serif line (28 to 36px), one muted sentence, set inside the section's own grid. It has ivory, night and forest tones.
- **Admin:** a centred icon in a thin round bronze ring, a serif title (Manrope semibold at the small size), a muted sentence and an optional action.

### Masked Headline Reveal (signature)

Headings split into words, each rising 105% from behind its own mask over 1.1s on an exponential ease-out, staggered 55ms (70ms on the cover). The full text stays in the DOM as real text. On the cover it plays on mount after a 400ms delay; elsewhere it plays on entering the viewport.

### Motion Grammar (signature)

- **Rise:** content lifts 28px into place over 1s.
- **Fade:** opacity only, 1.1s.
- **Unveil:** an image frame's content opens from the bottom edge with an inset clip over 1.25s (quintic in-out) while the photo settles from 1.14 scale over 1.8s.
- **Rule:** a hairline scales across from the left over 1.2s.
- **Parallax:** a slow drift against scroll at a set fraction, for cover and feature imagery only.
- **Image hover:** a 1.045 zoom over 1.2s inside the frame.
- **Page change:** the new page rises 12px over 550ms; the old one simply fades.
- Easing is exponential ease-out (cubic-bezier(0.16, 1, 0.3, 1)) for arrivals and quartic ease-out for state changes. Under reduced motion every element is shown in place and nothing moves.

## Do's and Don'ts

### Do:

- **Do** set every Instrument Serif headline at weight 400 and use the italic turn for emphasis.
- **Do** use Manrope semibold for small UI titles in the admin (modal titles, card headings).
- **Do** set entries as hairline-ruled rows with the date or thumbnail in a fixed lead column.
- **Do** keep large fields to ivory, stone, night and forest.
- **Do** use bronze on ivory and champagne on night or forest for dates, marks, active states and hairlines.
- **Do** keep corners between 1 and 8px; round only for dots, avatars, the seal and round icon buttons.
- **Do** give numbers tabular, lining figures.
- **Do** use the editorial note for public empty states and the empty-state block in the admin.
- **Do** run every reveal through the one grammar (masked word rise, unveil, rule, rise) with exponential ease-out, and respect reduced motion.
- **Do** declare `navOverlay: true` on any page that opens on a full-bleed cover so the navbar sits transparent over it.

### Don't:

- **Don't** bold or semibold Instrument Serif, or let the browser synthesise a bold.
- **Don't** put a small tracked label, kicker or eyebrow above a heading; tags and categories follow the title.
- **Don't** lay out text entries as a grid of cards.
- **Don't** fill a rectangular button, a section or body text with bronze or champagne.
- **Don't** make anything rectangular pill-shaped.
- **Don't** use a thick coloured side stripe on cards, alerts or list items; the only side mark is the 1px bronze margin rule on a page header or entry panel.
- **Don't** use gradient text, glass panels or hard offset shadows; shadow only for floating layers.
- **Don't** add a dark mode or bake one church's colours into the frame.
- **Don't** introduce a second motion vocabulary (bounces, springs, spins) beside the grammar.
