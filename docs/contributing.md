# Contributing to Congregation

Thank you for your interest in contributing. This document outlines the process for reporting bugs, proposing features, and submitting code changes.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Reporting Bugs](#reporting-bugs)
- [Requesting Features](#requesting-features)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)

---

## Code of Conduct

All contributors are expected to maintain a respectful and inclusive environment. Be constructive in feedback, welcoming to newcomers, and considerate of different perspectives.

---

## Reporting Bugs

Use the [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md) template when opening a bug issue. Include:

- A clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Your environment (OS, browser, Node version)

---

## Requesting Features

Use the [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md) template. Describe the problem you are solving, your proposed solution, and any alternatives you considered.

---

## Development Workflow

### 1. Fork and Clone

```bash
# Fork the repo on GitHub, then:
git clone https://github.com/<your-username>/congregation.git
cd congregation
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env
# Fill in your Firebase credentials — see docs/firebase-setup.md
```

### 3. Create a Branch

Use a descriptive branch name that reflects the change:

```bash
git checkout -b feat/member-export
git checkout -b fix/attendance-qr-scan
git checkout -b docs/firebase-setup
```

**Branch naming conventions:**

| Prefix   | Use for                              |
|----------|--------------------------------------|
| `feat/`  | New features                         |
| `fix/`   | Bug fixes                            |
| `docs/`  | Documentation changes                |
| `chore/` | Dependency updates, config changes   |
| `refactor/` | Code refactoring                  |

### 4. Make Your Changes

- Keep changes focused — one concern per PR
- Do not mix formatting/refactoring changes with functional changes
- Follow the [Code Style](#code-style) guidelines

### 5. Test Your Changes

```bash
npm run dev
```

Manually verify that:
- The admin dashboard functions correctly
- The public landing page renders as expected
- Firebase interactions (Auth, Firestore, Storage) work as intended
- No console errors are introduced

---

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <short description>
```

**Examples:**

```
feat(members): add CSV export for member list
fix(attendance): resolve QR code scanner not working on iOS
docs(firebase-setup): add Firestore security rules section
chore: update firebase-tools to v13
refactor(stores): simplify giving store state shape
```

**Types:**

| Type       | When to use                                      |
|------------|--------------------------------------------------|
| `feat`     | A new feature                                    |
| `fix`      | A bug fix                                        |
| `docs`     | Documentation changes only                       |
| `chore`    | Build process, dependency, or config changes     |
| `refactor` | Code change that is not a feature or bug fix     |
| `style`    | Formatting, missing semicolons, etc.             |
| `test`     | Adding or updating tests                         |

---

## Pull Request Process

1. Push your branch to your fork:

   ```bash
   git push origin feat/your-feature-name
   ```

2. Open a Pull Request against the `main` branch of the upstream repository.

3. Fill in the [PR template](.github/PULL_REQUEST_TEMPLATE.md) completely.

4. Ensure your PR:
   - Has a clear title following commit convention
   - References the related issue (e.g., `Closes #42`)
   - Includes only focused, relevant changes
   - Does not include `.env` files or credentials

5. A maintainer will review your PR. Be prepared to address feedback and push additional commits to the same branch.

6. Once approved, your PR will be merged into `main`.

---

## Code Style

- **TypeScript**: All new code must be written in TypeScript. Avoid `any` types.
- **Vue components**: Use `<script setup lang="ts">` with the Composition API.
- **Components**: Place admin components under `components/admin/` and public components under `components/public/`.
- **Data access**: All Firebase reads and writes must go through the `repositories/` layer — never directly in components or stores.
- **Icons**: Use `<Icon icon="mdi:some-icon" />` via the globally registered Iconify plugin.
- **Stores**: Add Pinia stores to `stores/` — they are auto-discovered.
- **Naming**: Use `camelCase` for functions and variables, `PascalCase` for components and types, `kebab-case` for file names.
- **Imports**: Prefer auto-imports provided by Nuxt — avoid manually importing `ref`, `computed`, `useRouter`, etc.

---

For questions or help, open a [GitHub Discussion](https://github.com/mfonidomark/congregation/discussions) or reach out to the maintainers.
