# UI Conventions

> Moved from the README. Patterns worth following rather than reinventing.

## Loading states

Every button that waits on something shows it. Single actions bind to the store's pending flag:

```vue
<Button :loading="membersStore.saving" @click="save">Save</Button>
```

Row-level actions must **not** use that flag — binding every row to one shared boolean makes them
all spin when you click one. Use [`usePendingAction`](../composables/usePendingAction.ts), which
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

A spinner is only worth adding where something is actually awaited — around synchronous work it
never paints a frame. Every store now writes to Firestore, so every save and delete has a real
loading state.

## Form fields

Use `Input` / `Select` rather than a bare `<input>`: they generate an id, point their label at it
with `for`, and set `aria-invalid` plus `aria-describedby` on the error text. Pass `:error` to show
a message — never render one beside the field yourself, or screen readers will not connect them.

Density is inheritable. A container declares it once instead of every field repeating a `size`:

```vue
<SettingsSection title="Calendar Rows" density="sm">
```

An explicit `size` on a field still wins, so a single field can opt out.

## Hiding a page in production

Some pages are ready for staging but not for the congregation. Add the route to
`STAGING_ONLY_ROUTES` in [`constants/index.ts`](../constants/index.ts):

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

## Settings panels

Three primitives, in [`components/settings/`](../components/settings/):

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

All date display in the app goes through [`utils/date.ts`](../utils/date.ts), a thin wrapper over [`date-fns`](https://date-fns.org/). The wrapper is auto-imported by Nuxt, so the helpers are available anywhere — components, pages, stores, composables — without an `import` statement.

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

Edit [`utils/date.ts`](../utils/date.ts):

1. Add the variant to the `DateStyle` union.
2. Add the corresponding [date-fns format token](https://date-fns.org/docs/format) to the `PATTERNS` map.

That's it — TypeScript will then offer the new style at every call site.
