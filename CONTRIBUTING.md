# Contributing to Congregation

Thank you for helping build Congregation, an open-source Church Management System for churches and faith-based organizations of every size. Every contribution helps a congregation somewhere keep better records and reach its community, whether it's a bug report, a fix, a design suggestion, or a clearer sentence in the docs.

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Code of Conduct](#code-of-conduct)
- [Development Environment](#development-environment)
- [Local Setup](#local-setup)
- [Branches](#branches)
- [Commit Messages](#commit-messages)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Requests](#pull-requests)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Reporting Security Vulnerabilities](#reporting-security-vulnerabilities)
- [License of Contributions](#license-of-contributions)

---

## Ways to Contribute

You don't need to write code to help.

| You are a...        | You can...                                                                                           |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| **Developer**       | Fix bugs, build features, add tests, improve performance and accessibility                           |
| **Designer**        | Improve layouts, flows, and accessibility. The design system is described in [DESIGN.md](DESIGN.md). |
| **Tester**          | Try Congregation on real devices and browsers and report what breaks                                 |
| **Church using it** | Tell us what your secretaries, leaders, and members actually need, through a feature request         |
| **Writer**          | Improve the README and the guides in [`docs/`](docs), or fix anything that is unclear or out of date |

Looking for somewhere to start? Browse the [open issues](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/issues).

---

## Code of Conduct

Congregation does not yet have a formal code of conduct. Until one is adopted, please be respectful, patient, and constructive in issues, pull requests, and reviews. Remember that many contributors and users are volunteers serving their churches. Harassment or personal attacks are not welcome.

---

## Development Environment

| Requirement      | Version                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| Node.js          | 22 or newer (`.nvmrc` pins 22, so `nvm use` picks it up)                                                      |
| npm              | 10 or newer. The project uses `package-lock.json`, so please don't commit yarn or pnpm lockfiles.             |
| Git              | Any recent version                                                                                            |
| Firebase project | A **non-production** project for development. See [docs/firebase-setup.md](docs/firebase-setup.md).           |
| Cloudinary       | Optional. Only needed if you work on image uploads. See [docs/cloudinary-setup.md](docs/cloudinary-setup.md). |

Recommended editor: VS Code with the official Vue extension (Vue - Official), Tailwind CSS IntelliSense, ESLint, and Prettier.

---

## Local Setup

```bash
# 1. Fork the repository on GitHub, then clone your fork
git clone https://github.com/<your-username>/congregation.git
cd congregation

# 2. Add the upstream remote so you can stay in sync
git remote add upstream https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation.git

# 3. Install dependencies (also runs `nuxt prepare` and installs the Husky pre-commit hook)
npm install

# 4. Configure environment variables
cp .env.example .env
# Fill in your development Firebase project's web config, and Cloudinary if needed

# 5. Start the dev server
npm run dev   # http://localhost:3000
```

To use the admin dashboard, your Firebase project needs a Super Admin. Seeding one is covered in the README under [Backend Setup](README.md#backend-setup-firebase).

> Never point your local `.env` at a church's production Firebase project while developing.

---

## Branches

The project has two long-lived branches:

| Branch | Purpose                                                              |
| ------ | -------------------------------------------------------------------- |
| `dev`  | Integration branch. Deploys to staging. **Open pull requests here.** |
| `main` | Production. Updated by merging `dev` into `main`.                    |

Create your branch from an up-to-date `dev`:

```bash
git fetch upstream
git checkout -b feat/member-export upstream/dev
```

Use a short prefix that matches the change:

| Prefix      | Use for                               |
| ----------- | ------------------------------------- |
| `feat/`     | New features                          |
| `fix/`      | Bug fixes                             |
| `docs/`     | Documentation changes                 |
| `refactor/` | Code changes with no behaviour change |
| `test/`     | Adding or updating tests              |
| `chore/`    | Dependency updates, config changes    |

---

## Commit Messages

Commits follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>(<optional scope>): <short description>
```

Examples:

```text
feat(members): add CSV export for member list
fix(attendance): correct monthly totals when a service is skipped
docs: explain how to seed the first Super Admin
refactor(stores): simplify finance store state shape
test(utils): cover church number normalisation edge cases
```

| Type       | When to use                                       |
| ---------- | ------------------------------------------------- |
| `feat`     | A new feature                                     |
| `fix`      | A bug fix                                         |
| `docs`     | Documentation only                                |
| `refactor` | A code change that is neither a feature nor a fix |
| `test`     | Adding or updating tests                          |
| `style`    | Formatting only                                   |
| `chore`    | Build, dependency, or config changes              |

---

## Coding Standards

ESLint and Prettier enforce most formatting automatically. The pre-commit hook runs both on staged files. Beyond that:

- **TypeScript everywhere.** TypeScript runs in strict mode. Avoid `any`.
- **Vue components** use `<script setup lang="ts">` and the Composition API.
- **Components go in a feature folder** under `components/` (for example `nominal-roll/`, `attendance/`, `events/`), or in `components/ui/` if they are reusable primitives. Components are auto-imported without a path prefix, so file names must be unique across folders.
- **All Firestore access goes through `repositories/`**, one repository per collection. Don't call Firestore from components or stores directly.
- **Access control belongs in `firestore.rules`.** Hiding a button is not security. If you add a collection or change who may write it, update the rules, and keep role lists in step (`isStaff()` in `firestore.rules`, `STAFF_ROLES` in `stores/auth.ts`, `ChurchRoleId` in `types/index.ts`). There is a parity test for this.
- **Prefer Nuxt auto-imports.** Don't manually import `ref`, `computed`, `useRouter`, stores, composables, or utils.
- **Icons:** `<Icon icon="mdi:some-icon" />`. Iconify is registered globally.
- **Dates:** format through the helpers in `utils/date.ts`, not ad-hoc `toLocaleDateString` calls.
- **Naming:** `camelCase` for variables and functions, `PascalCase` for components and types.
- **Stay brand-neutral.** Don't hard-code a specific church's name, logo, colours, or copy. Church-specific content belongs in Settings.
- **Accessibility:** use the `Input` / `Select` primitives (they wire labels and errors for screen readers), keep visible focus states, and respect `prefers-reduced-motion`.

More patterns (loading states, form density, hiding pages in production, settings panels) are in [docs/ui-conventions.md](docs/ui-conventions.md). For the bigger picture, see [docs/architecture.md](docs/architecture.md).

---

## Testing

Run the same checks as CI before you open a pull request:

```bash
npm run typecheck     # vue-tsc
npm run lint          # ESLint
npm run format:check  # Prettier
npm run test          # Vitest
npm run build         # Production build
```

- **Add tests** for new stores, repository functions, composables, and non-trivial utilities, under the matching folder in `tests/`. Tests run with placeholder Firebase values from `.env.test` and must never contact a real project.
- **Test manually** in `npm run dev`: the affected admin and public pages render, saves work for the roles involved, and the browser console stays clean.
- **Firestore rules are not covered by automated tests.** If you change `firestore.rules`, describe in your PR which cases you checked in the Rules Playground. [docs/deployment.md](docs/deployment.md#deploying-security-rules) lists the baseline cases.

---

## Pull Requests

1. Keep each pull request focused on one concern. Don't mix refactors or reformatting with functional changes.
2. Push your branch to your fork and open a pull request **against `dev`**.
3. Fill in the [pull request template](.github/PULL_REQUEST_TEMPLATE.md): what changed, why, how you tested it, and screenshots for UI changes.
4. Link the issue it resolves (for example `Closes #42`).
5. Make sure CI passes.
6. Never include `.env` files, credentials, or real member data, including in screenshots.
7. A maintainer will review it. Push follow-up commits to the same branch to address feedback.

---

## Reporting Bugs

Open a [bug report](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/issues/new?template=bug_report.md) and include:

- what happened and what you expected,
- steps to reproduce,
- your browser, OS, and Node version, and the commit or branch you're on,
- whether it affects the admin dashboard, the public site, or both, and which role you were signed in as.

Search existing issues first. Remove any personal data from screenshots and logs.

---

## Requesting Features

Open a [feature request](https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation/issues/new?template=feature_request.md). Describe the problem from your church's point of view first ("our secretary has no way to..."), then your proposed solution and any alternatives. Proposals that serve many different congregations are the easiest to accept.

---

## Reporting Security Vulnerabilities

**Do not open a public issue for a security vulnerability.** Congregation stores personal data about church members, and public disclosure before a fix puts every deployment at risk. Follow the private reporting process in [SECURITY.md](SECURITY.md).

---

## License of Contributions

Congregation is licensed under the [GNU AGPL v3](LICENSE). By submitting a contribution, you agree that it is licensed under the same terms.
