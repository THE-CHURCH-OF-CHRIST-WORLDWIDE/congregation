# Deployment & Access Control

> Moved from the README. See also [Firebase Setup](firebase-setup.md) and [Cloudinary Setup](cloudinary-setup.md).

Everything needed to stand a congregation up on its own Firebase projects and Netlify sites, and to decide who may change what. [docs/firebase-setup.md](firebase-setup.md) carries the same material in more depth; this page is the operational checklist.

## Security model

Signing in and being allowed to write are separate things. Privilege comes from exactly one place: a `users/{uid}` document in Firestore, which [`firestore.rules`](../firestore.rules) reads on every write. An account with no such document can sign in and see the dashboard shell but cannot change anything — the admin header shows a red banner saying so, rather than letting each save fail on its own.

The collections defined in [`firestore.rules`](../firestore.rules), with deliberately different exposure:

| Collection                              | Holds                                            | Notes                                                               |
| --------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| `users/{uid}`                           | The role a Firebase Auth account carries         | **Grants privilege.** Only a Super Admin may write it               |
| `roles/{roleId}`                        | Permission-matrix overrides only                 | Names, ids and colours stay in code                                 |
| `roleAssignments`                       | Which nominal-roll member holds which role       | Presentational — records standing, not access                       |
| `auditLog`                              | Append-only record of who changed what           | Super Admin reads; staff append; nobody edits or deletes            |
| `settings/church`                       | Public site content                              | World-readable; the landing page reads it signed out                |
| `members`                               | The nominal roll                                 | Never publicly readable; `/register` may create only                |
| `memberNumbers`                         | Church-number reservations, keyed by the number  | Firestore has no unique constraint — this collection is it          |
| `messages`                              | The public contact form's inbox                  | Anonymous callers may create, never read; create-only               |
| `financeCollections`, `financeExpenses` | The congregation's books                         | Staff read; `canEditFinance()` writes                               |
| `teachings`                             | Sermons and Sunday School lessons                | Staff read; `canEditRecords()` writes                               |
| `attendance`                            | Who was present at which service                 | Never public; deterministic ids keep re-saves idempotent            |
| `events`                                | Upcoming and past events                         | World-readable — `/events` lists them to signed-out visitors        |
| `visitors`, `childrenAttendance`        | Visitor slips and children's numbers per service | Staff read; `canEditRecords()` writes                               |
| `businessMeetings`                      | Business meeting minutes                         | Staff read; `canEditRecords()` writes; `canManageMinutes()` deletes |
| `lectureshipSpeakers`                   | Bible Lectureship programme                      | World-readable; `canEditPublishedContent()` writes                  |
| `lectureshipRegistrations`              | Public Bible Lectureship registrations           | Anonymous create (shape-validated); staff read and check in         |
| `lectureshipStats`                      | Public registration counter                      | World-readable; only `registeredCount` may be written               |

Who may do what:

|                    | `settings` | `members`                    | `users`    | `roles` | `roleAssignments` | `auditLog`   |
| ------------------ | ---------- | ---------------------------- | ---------- | ------- | ----------------- | ------------ |
| Super Admin        | read+write | read+write                   | read+write | r+w     | read+write        | read, append |
| Admin              | read+write | read+write                   | read       | read    | read              | append only  |
| Other staff        | read       | read+write                   | read       | read    | read              | append only  |
| Signed in, no role | read       | —                            | own doc    | —       | —                 | —            |
| Anonymous          | read       | create only, via `/register` | —          | —       | —                 | —            |

Staff roles are `super-admin`, `admin`, `elder`, `deacon`, `preacher`, `secretary`, `youth-leader`, `financial-secretary`, `content-editor`. That list appears in three places which must stay in step: `isStaff()` in [`firestore.rules`](../firestore.rules), `STAFF_ROLES` in [`stores/auth.ts`](../stores/auth.ts), and `ChurchRoleId` in [`types/index.ts`](../types/index.ts).

Rules are the coarse floor; the per-page matrix in Settings → Roles & Permissions is finer-grained on top of it.

> **The floor is narrower than the matrix for four collections.** Teachings, attendance and events
> accept writes only from Super Admin, Admin and Secretary (`canEditRecords()`); finance only from
> Super Admin, Admin and Financial Secretary (`canEditFinance()`). The default matrix is more
> generous — an Elder shows full access to all three record areas, a Preacher to teachings and
> events, a Deacon and Youth Leader to attendance. Those roles will see the controls and have the
> write refused. Either narrow the matrix in Settings → Roles & Permissions to match, or widen the
> rules.

## Roles & permissions

Three things carry the word "role" and are deliberately separate. Confusing them is the most common source of "why can't this person do X":

| Concept             | Lives in                           | Answers                              | Enforced by                   |
| ------------------- | ---------------------------------- | ------------------------------------ | ----------------------------- |
| **Role definition** | `DEFAULT_ROLES` + `roles/{roleId}` | "What may an Elder do?"              | The app's UI matrix           |
| **Role assignment** | `roleAssignments`                  | "Who are our elders?"                | Nothing — it records standing |
| **Account access**  | `users/{uid}`                      | "May this login change church data?" | **Firestore rules**           |

A member on the nominal roll can be an elder with no login at all, and a login can exist with no member record. Only `users/{uid}` gates anything.

## Business meetings

**Admin → Business Meetings** is where the Secretary records the minutes of each business
meeting, following the usual order of business: meeting details, attendance (present,
apologies, absent, visitors, quorum), opening, reading and adoption of the previous minutes,
matters arising, reports, new business, any other business, action points, announcements,
the next meeting, and closing. Any item can record a motion (moved, seconded, outcome).
Name fields suggest people from the nominal roll. Each meeting has a **Print / PDF** copy
with signature lines.

Minutes live in the `businessMeetings` collection. Any staff account can read them. Super
Admin, Admin and the Secretary can write them. Once minutes are **approved** they are locked.
Only an Admin or Super Admin can reopen them, and only those two roles can delete a meeting.
`firestore.rules` enforces all of this, not just the UI.

## Contact messages

The "Send Us A Message" form on the landing page writes to the `messages` collection, and staff
read it at **Admin → Messages**. The sidebar item carries an unread count.

Each message has two independent flags. `read` is set when somebody opens it. `handled` is set
by hand, and means somebody has actually replied or dealt with it — a message can be read and
still open, which is the state that matters. Replying uses the staff member's own mail client
via `mailto:`; nothing is sent from inside the app.

**Anonymous callers may write to this collection**, which makes it part of the app's spam
surface (the public Bible Lectureship form, `lectureshipRegistrations` and `lectureshipStats`, is
the other). Two things bound it, and neither is rate-limiting:

- The rules pin the shape — exactly the seven expected fields, a length cap on each, `read` and
  `handled` forced to `false`, and `submittedAt` forced to the server's time. It cannot be used
  as free storage, and a message cannot arrive pre-dismissed from the inbox.
- Create-only. A visitor cannot list, read, edit or delete any message, including their own.
  Staff updates are restricted to the two flags, so the text as sent can never be rewritten.

Firestore rules cannot rate-limit, so a determined flood is still possible. If that happens, the
fix is [App Check](https://firebase.google.com/docs/app-check) with reCAPTCHA on the web app —
it turns away automated clients without adding a puzzle for real visitors — or moving the write
behind a Cloud Function that can throttle by IP.

## Church numbers are unique

A member's church (membership) number is assigned when adding or editing them on the nominal
roll, and no two members may hold the same one.

Firestore has no unique constraint, so uniqueness is enforced with a reservation document at
`memberNumbers/{key}` naming the member who holds that number. `membersRepository` claims it
**inside a transaction**, together with the member write — which is the only thing that stops
two secretaries assigning the same number at the same moment. A plain "is this taken?" query
would let both read _no_ before either wrote.

The key is a normalised form of the number: lower-cased, with every run of non-alphanumeric
characters collapsed to a hyphen (`utils/churchNumber.ts`). So `COC/001`, `coc-001` and
`COC 001` are all the same number, and the key can never contain the `/` that Firestore forbids
in a document id. The number is _stored_ as typed, only trimmed.

The reservation moves with the member: released when the number changes, when it is cleared,
and when the member is deleted. The form also checks the loaded roll as you type, so a clash
shows up before you save — but that check is only for feedback; the transaction is the
guarantee.

**Numbers already in the roll have no reservation.** Nothing wrote `churchNumber` before this,
so in practice there is nothing to backfill. If a record does carry one, re-save that member
once to claim it — until then the number is not actually reserved.

### Default permission matrix

Eight pages × five actions — **V**iew, **A**dd, **E**dit, **D**elete, e**X**port. Generated from [`stores/roles.ts`](../stores/roles.ts):

| Role                | Dash  | Roll  | Youth | Att   | Teach | Events | Fin   | Set   |
| ------------------- | ----- | ----- | ----- | ----- | ----- | ------ | ----- | ----- |
| Super Admin         | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX  | VAEDX | VAEDX |
| Admin               | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX  | VAEDX | VAEDX |
| Elder               | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX | VAEDX  | VX    | V     |
| Deacon              | VAE   | VAE   | VAE   | VAE   | V     | V      | V     | —     |
| Preacher            | VAEDX | V     | V     | V     | VAEDX | VAEDX  | —     | —     |
| Secretary           | VAEX  | VAEX  | VAEX  | VAEX  | VAEX  | VAEX   | VX    | V     |
| Youth Leader        | VAEX  | V     | VAEX  | VAEX  | V     | V      | —     | —     |
| Financial Secretary | VAEDX | V     | —     | —     | —     | —      | VAEDX | —     |
| Content Editor      | V     | —     | —     | —     | VAEDX | VAEDX  | —     | VAEDX |

**Admin** matches Super Admin in the matrix above but not in the rules: it may save church settings, and manage members, attendance, finance, teachings and events — but not `users`, `roles` or `roleAssignments`, and it cannot read the audit log. Only **Super Admin** manages who has access. The `V` that Elder and Secretary hold on Settings is view-only, and the rules enforce that independently of the matrix.

### Managing them

All three live under **Settings → Roles & Permissions**:

- **Role Definitions** — click a role to open its matrix. Toggling any action auto-enables `view`; clearing `view` clears the row. Saving writes a `roles/{roleId}` document holding **only** the permissions, so ids, names and colours stay code-defined — an override cannot rename or invent a role. On load the app rebuilds from the code defaults and layers stored overrides on top, so a role added in code later still appears and an override for a deleted role is ignored.
- **Member Assignments** — assign a role to a nominal-roll member, optionally with **custom permissions** that override that role's defaults for that person only. Where someone holds several roles, `effectivePermissions()` merges them: any role granting an action grants it, and a custom override wins over the role default either way.
- **Dashboard Access** — `users/{uid}` records, the only thing that grants privilege. See [Granting dashboard access](#granting-dashboard-access).

Everything on this screen persists to Firestore. Writing any of it requires Super Admin, so a `deacon` opening the page can read the matrix but not change it — the controls render as plain text rather than inputs.

### Adding a role

Roles are code-defined, so a new one is a code change: add it to `DEFAULT_ROLES` in [`stores/roles.ts`](../stores/roles.ts), and if it should be able to write church data, add its id to `ChurchRoleId` in [`types/index.ts`](../types/index.ts), `STAFF_ROLES` in [`stores/auth.ts`](../stores/auth.ts), and `isStaff()` in [`firestore.rules`](../firestore.rules) — then redeploy the rules. Missing the rules step gives a role that looks correct in the UI and is refused by the backend.

## First-time setup, per Firebase project

Do all of this on **staging first**, then repeat on production. Order matters — step 4 refuses every write from an account without a role, and no rule lets an account grant itself one, so seeding comes first.

1. **Create the project** and register a web app (Project Settings → Your apps → SDK setup). Copy the config into the matching env file.
2. **Enable Authentication** → Sign-in method:
   - **Email/Password**
   - Under **Settings → Authorized domains**, add the site's Netlify domain and `localhost`. Sign-in fails silently without this.
3. **Seed the first Super Admin.** There is no way to bootstrap this from the app:
   - **Authentication → Users** → copy the UID.
   - **Firestore → Data** → create `users/<that-uid>` with `roleId: "super-admin"` (and `email` for legibility).
   - Confirm the document id is the **UID, not the email** — this is the most common way to get locked out.
4. **Deploy the rules** (see below) and verify: a setting saves, and the red no-role banner does not appear.
5. **Create the Firestore database** and enable **Storage** if not already done.

Locked out anyway? Rules never restrict the Firebase console — fix or create the `users/{uid}` document under Firestore → Data. Console access is governed by Google Cloud IAM.

## Audit log

**Settings → Access → Audit Log**, visible to Super Admins only. Every change the dashboard makes is recorded: a member added, updated or deleted; settings saved; role permissions changed; roles assigned or revoked; dashboard access granted or revoked. Each entry carries who did it, what changed, and a server-side timestamp.

The rules make the collection **append-only** — `allow update, delete: if false` — so an entry cannot be edited or quietly removed by anyone, Super Admin included. Appending requires a staff role and `actorUid` must equal the caller, so nobody can write an entry attributed to someone else. Reading requires Super Admin.

**What this is not.** Entries are written by the client as each change succeeds. That evidences what the app did, but nothing can compel a client to write one — somebody using the Firebase SDK directly with valid credentials could change `members` and skip the log. Treat it as accountability among trusted staff, not a tamper-proof trail. A trail that cannot be bypassed needs a Firestore trigger in Cloud Functions, which requires the Blaze plan.

Logging never interferes with the work it describes: `record()` is fire-and-forget and swallows its own failures, so a refused log entry cannot turn a successful save into a visible error.

## Granting dashboard access

Once a Super Admin exists, everyone else is granted access from the app — no console, no shared Firebase logins: **Settings → Roles & Permissions → Dashboard Access → Create login with password**.

Enter their email and a password, choose a role, and the account is created immediately with that role applied — share the password with them directly, there is no way to look it up again afterwards. This runs on a second, isolated Firebase App instance (`getSecondaryAuth`, see [`utils/secondaryAuth.ts`](../utils/secondaryAuth.ts)) purely so creating the account — which signs in as it — never signs the admin out of their own session. No Cloud Functions or Admin SDK involved.

Optionally link the account to a nominal-roll member, which is carried through to `users/{uid}.memberId`, so the login and the member record describe one person rather than two unrelated things.

Where an account already exists (created elsewhere, or in a previous Firebase project) and only needs a role, use the collapsed **"Or grant an existing account by UID"** fallback instead — paste its UID from **Authentication → Users** in the console.

The same "give them a login" step is also offered inline from **Member Assignments → Assign Role**, so assigning a role and creating the login can happen in one action.

## Signing in

Two routes are on `/login`:

| Route                     | For                                              |
| ------------------------- | ------------------------------------------------ |
| Email + password          | The normal way in, for any account created above |
| **Forgot your password?** | Resetting a forgotten password                   |

## Environment variables on Netlify

Two Netlify sites, each with its own copy of ten variables. [`netlify.toml`](../netlify.toml) is committed and shared by both, so **no environment values belong in it** — each site is the `production` context for its own branch, and a committed `APP_ENV` would label staging as production.

```bash
npx netlify-cli login                       # once per machine

npm run netlify:env -- staging              # dry run: shows old → new, values masked
npm run netlify:env -- staging --apply

npm run netlify:env -- production           # dry run
npm run netlify:env -- production --apply
```

Each environment names its own site and passes it with `--site`, so the locally linked project is irrelevant and no re-linking is needed. The script refuses to run if either env file is missing a value or if the two share a Firebase project ID or API key, and after writing it reads the values back — it will not report success the site has not confirmed.

Environment variable changes only take effect on the **next** build. Trigger a redeploy afterwards.

When inspecting variables by hand, always pass a context — `netlify env:list` defaults to `dev`, which is not what a deploy builds with and will report variables as unset:

```bash
npx netlify-cli env:list --site coc-abadina-prod --context production
```

## Deploying security rules

[`firestore.rules`](../firestore.rules) is the single source of truth for both projects. Never edit rules in the console — the next deploy silently reverts them.

```bash
firebase deploy --only firestore:rules -P staging
# verify on staging, then:
firebase deploy --only firestore:rules -P production
```

Rules are not covered by the test suite. Before a production deploy, exercise these in **Firestore → Rules → Playground** — they are the cases the rules are written against:

| Attempt                                                                  | Expected |
| ------------------------------------------------------------------------ | -------- |
| `get` on `members/x` as an unauthenticated visitor                       | deny     |
| `get` on `members/x` as signed-in with no role                           | deny     |
| `create` on `users/<own-uid>` as a signed-in account with no role        | deny     |
| `write` on `users/<someone-else-uid>` as a non-Super-Admin staff account | deny     |
| `write` on `settings/church` as your seeded Super Admin                  | allow    |

## Going live: ordered checklist

1. Apply the Netlify variables for both sites and redeploy both.
2. Complete the per-project Firebase setup above, staging first.
3. Deploy rules to staging; confirm saves work and a Super Admin can create a login with a password.
4. Deploy rules to production.
5. Merge `dev` → `main`. Production is a separate site building `main`, so until then it has neither `netlify.toml` nor `public/_redirects` — wrong publish directory and 404s on deep links.
6. Replace the placeholder copy in [`pages/salvation/index.vue`](../pages/salvation/index.vue) before pointing anyone at it; it is linked from the footer on every public page.

## Troubleshooting

| Symptom                                                | Cause                                                                 | Fix                                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `Firebase config is missing VITE_…` on a deployed site | The build had no environment variables                                | Apply them for that site, then **redeploy** — env changes need a build   |
| `auth/invalid-api-key` locally                         | The `--dotenv` file was missing, so the build shipped an empty config | The `*:staging` / `*:production` scripts now fail fast; create the file  |
| Red "no role assigned" banner                          | The account has no `users/{uid}` document                             | A Super Admin grants a role, or seed it in the console                   |
| Staging shows production data                          | Both sites hold the same variables                                    | `npm run netlify:env -- staging --apply`, then redeploy                  |
| Deploy fails: "secrets detected in build output"       | Vite inlines `VITE_*` into the bundle by design                       | `SECRETS_SCAN_OMIT_KEYS` in `netlify.toml` — extend it for new variables |
| Deep links 404 in production (`/gallery/photos`)       | The SPA fallback is missing                                           | Confirm `public/_redirects` survived into `dist/_redirects`              |
| Login works, then nothing loads                        | Rules deployed before a Super Admin was seeded                        | Create `users/<uid>` in the console                                      |
