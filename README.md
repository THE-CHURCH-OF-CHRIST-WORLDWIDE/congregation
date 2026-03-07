# Congregation

[![GitHub stars](https://img.shields.io/github/stars/mfonidomark/congregation?style=social)](https://github.com/mfonidomark/congregation/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mfonidomark/congregation?style=social)](https://github.com/mfonidomark/congregation/network/members)
[![GitHub issues](https://img.shields.io/github/issues/mfonidomark/congregation)](https://github.com/mfonidomark/congregation/issues)
[![GitHub license](https://img.shields.io/github/license/mfonidomark/congregation)](https://github.com/mfonidomark/congregation/blob/main/LICENSE)

An open-source **Church Management System (CMS)** built with Nuxt 4, Vue 3, TypeScript, Tailwind CSS, and Firebase. Congregation helps churches and faith-based organizations manage members, attendance, giving, events, and communications from a single modern interface.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)
- [Authors](#authors)

---

## Overview

Congregation is a single-page application (SPA) with two distinct areas:

**Admin Dashboard** — A full-featured CMS for church staff to manage members, families, attendance, giving, events, announcements, and small groups. Includes role-based access control (RBAC) and data reporting.

**Public Landing Page** — A customizable, SEO-friendly website for sharing sermons, events, and news. Supports prayer request forms, newsletter subscriptions, and multimedia embeds.

> Licensed under **GNU AGPL v3** — free to use, modify, and self-host.

---

## Features

### Admin Dashboard

- Member and family profile management
- Giving and tithe tracking
- Event scheduling with reminders
- Attendance recording via QR code or manual entry
- Sermon and content management
- Role-based access control (Pastor, Admin, Member)
- Custom reports and data export

### Public Landing Page

- Modular, customizable sections (About, Events, Sermons)
- Interactive forms (Prayer requests, Volunteer sign-ups)
- Newsletter subscriptions via Firebase Extensions
- YouTube and Vimeo embed support
- Mobile-first design with WCAG 2.1 AA accessibility compliance

### Backend (Firebase)

- Multi-provider authentication (email, Google, etc.)
- Cloud Firestore real-time database
- Firebase Storage for media files
- Cloud Functions for server-side automation
- Firebase Hosting with GitHub Actions CI/CD

---

## Tech Stack

| Area              | Technology              | Notes                          |
|-------------------|-------------------------|--------------------------------|
| Frontend          | Vue 3 / Nuxt 4          | SPA mode (`ssr: false`)        |
| Language          | TypeScript              | Strict mode                    |
| Styling           | Tailwind CSS            | Utility-first CSS              |
| State Management  | Pinia                   | Auto-discovered stores         |
| Icons             | Iconify                 | Registered globally via plugin |
| Backend           | Firebase                | Serverless                     |
| Database          | Cloud Firestore         | NoSQL, real-time               |
| Authentication    | Firebase Auth           | Multi-provider                 |
| Storage           | Firebase Storage        | File uploads and CDN           |
| Functions         | Firebase Cloud Functions| Node.js runtime                |
| License           | GNU AGPL v3             | Copyleft open-source           |

---

## Project Structure

```
congregation/
├── assets/
│   └── css/              # Global styles (Tailwind entry point)
├── components/
│   ├── admin/            # Admin dashboard components
│   └── public/           # Public landing page components
├── composables/          # Shared Vue composables (e.g., useAuth)
├── constants/            # Shared constants
├── layouts/              # App layouts (admin, default)
├── middleware/           # Route guards
├── pages/
│   ├── admin/            # Admin routes
│   └── public/           # Public routes
├── plugins/              # Nuxt plugins (firebase.client.ts, iconify.client.ts)
├── repositories/         # Firebase data access layer
├── stores/               # Pinia stores
├── types/                # TypeScript type declarations
├── utils/                # Helper utilities
├── .env.example          # Environment variable template
├── nuxt.config.ts        # Nuxt configuration
└── package.json
```

---

## Prerequisites

- **Node.js** v20 or higher
- **npm** (or yarn / pnpm)
- **Git**
- **Firebase CLI** — `npm install -g firebase-tools`
- A Google account with a Firebase project

**Recommended (optional):**

- VS Code with the [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar), Tailwind CSS IntelliSense, and Prettier extensions
- Firebase Emulator Suite for local backend development

---

## Getting Started

```bash
git clone https://github.com/mfonidomark/congregation.git
cd congregation
npm install
```

Copy the environment variable template and fill in your Firebase credentials:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

For full setup instructions including Firebase configuration, see [docs/getting-started.md](docs/getting-started.md).

---

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/getting-started.md) | Full local setup guide |
| [Firebase Setup](docs/firebase-setup.md) | Firebase project configuration |
| [Architecture](docs/architecture.md) | Codebase structure and design decisions |
| [Contributing](docs/contributing.md) | How to contribute to this project |

---

## Contributing

Contributions are welcome. Please read [docs/contributing.md](docs/contributing.md) for guidelines on branching, commit conventions, and the pull request process.

---

## License

Distributed under the **GNU Affero General Public License v3.0**. See [LICENSE](LICENSE) for details.

---

## Authors

**Mfonido Mark** — Lead Engineer
- GitHub: [@favourmark05](https://github.com/favourmark05)
- Twitter: [@MfonidoMark](https://twitter.com/MfonidoMark)
- Email: MfonidoMark@gmail.com

**Abasifreke Antia** — Designer / Product Manager
- GitHub: [@abasifrekeantia](https://github.com/abasifrekeantia)
- Twitter: [@Seantantiaa](https://twitter.com/Seantantiaa)
- Email: abasifrekeantiaa@gmail.com

---

> "Technology for the Kingdom — because stewardship should be as excellent as worship."
