# 🕊️ Congregation

<!-- [![GitHub stars](https://img.shields.io/github/stars/mfonidomark/congregation?style=social)](https://github.com/mfonidomark/congregation/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/mfonidomark/congregation?style=social)](https://github.com/mfonidomark/congregation/network/members)
[![GitHub issues](https://img.shields.io/github/issues/mfonidomark/congregation)](https://github.com/mfonidomark/congregation/issues)
[![GitHub license](https://img.shields.io/github/license/mfonidomark/congregation)](https://github.com/mfonidomark/congregation/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/congregation?color=orange)](https://www.npmjs.com/package/congregation) -->

> **Congregation** is an open-source **Church Management System (CMS)** and **public landing platform** that empowers churches and faith-based organizations to manage members, attendance, giving, events, and communications — all in one accessible and modern interface.

Built with **Vue.js**, **Nuxt 3**, and **Firebase**, Congregation brings simplicity, transparency, and connection to ministry administration — whether online or offline.  
It’s designed to be scalable, secure, and easy to deploy, supporting both small house churches and larger congregations.

<!-- ---

## 📸 Screenshots

| Admin Dashboard | Public Landing Page | Mobile View |
|-----------------|---------------------|--------------|
| ![Admin Dashboard Screenshot](docs/screenshots/admin-dashboard.png) | ![Public Landing Page Screenshot](docs/screenshots/public-landing.png) | ![Mobile Responsive Screenshot](docs/screenshots/mobile-view.png) | -->

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Support & Contact](#-support--contact)

---

## 🧭 Overview

Congregation serves two main purposes:

### 🧑‍💼 Admin Dashboard (CMS)

- **Centralized Management:** Manage members, families, attendance, giving, announcements, small groups, and events from a single dashboard.
- **Data Insights:** Generate reports on attendance trends, giving summaries, and engagement.
- **Collaboration Tools:** Role-based access for pastors, admins, and members.

### 🌍 Public Landing Page

- **Engaging Frontend:** Customizable website to share sermons, news, and events.
- **Community Interaction:** Prayer requests, newsletter sign-ups, and live stream integrations.
- **SEO Optimized:** Built for discoverability and fast performance.

> Congregation helps ministries embrace technology with accessibility and excellence — especially in underrepresented communities.  
> It’s free to use, modify, and deploy under the **AGPL-3.0 license**.

---

## ⚙️ Features

### 🖥️ Admin Dashboard

- Member & Family Management
- Giving & Tithe Tracking
- Event Scheduling & Reminders
- Attendance via QR Code or Manual Entry
- Sermon & Content Management
- Role-Based Access Control (RBAC)
- Custom Reports & Export Options

### 🌐 Public Landing Page

- Dynamic, Modular Sections (About, Events, Sermons)
- Interactive Forms (Prayer, Volunteer)
- Newsletter Subscriptions via Firebase Extensions
- Multimedia Support (YouTube, Vimeo)
- Mobile-First, Tailwind-powered Design
- WCAG 2.1 AA Accessibility Compliance

### 🔥 Backend (Firebase)

- Multi-provider Authentication
- Cloud Firestore Database
- Firebase Storage for Media
- Cloud Functions for automation
- Firebase Hosting & GitHub Actions CI/CD
- Built-in Analytics

### 🛡️ Security Features

- Data encryption at rest and in transit
- Input validation and sanitization
- Rate limiting and audit logs

---

## 🧰 Tech Stack

| Area | Technology | Notes |
|------|-------------|-------|
| **Frontend** | Vue.js 3 / Nuxt 3 | SSR/SSG support |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **State Management** | Pinia | Vue official store |
| **UI Components** | Headless UI / Heroicons | Accessible, unstyled components |
| **Backend** | Firebase | Serverless backend |
| **Database** | Cloud Firestore | NoSQL, real-time |
| **Authentication** | Firebase Auth | Multi-provider |
| **Storage** | Firebase Storage | File uploads & CDN |
| **Functions** | Firebase Cloud Functions | Node.js runtime |
| **Testing** | Vitest / Cypress | Unit & E2E tests |
| **Linting** | ESLint / Prettier | Code quality |
| **License** | GNU AGPL v3 | Copyleft open-source |

---

## 🗂️ Project Structure

```bash
congregation/
├── assets/              # Static assets
│   └── css/
├── components/          # Reusable Vue components
│   ├── admin/
│   └── public/
├── composables/         # Reusable logic (e.g., useAuth.js)
├── layouts/             # App layouts (admin, default)
├── middleware/          # Route guards (auth.js)
├── pages/               # Route-based pages
│   ├── admin/
│   └── public/
├── plugins/             # Nuxt plugins (firebase, tailwind)
├── public/              # Static files
├── server/              # Server-side API routes
├── stores/              # Pinia stores
├── utils/               # Helper utilities
├── .env.example         # Environment variables template
├── nuxt.config.ts       # Nuxt configuration
├── package.json         # Dependencies and scripts
└── tailwind.config.js   # Tailwind configuration
```
---

## 🧩 Prerequisites
### Ensure the following are installed:
- Node.js v20+
- npm or yarn
- Git
- Firebase CLI (npm install -g firebase-tools)
- Google account for Firebase setup

### Optional:
- VS Code (with Volar, Tailwind CSS IntelliSense, Prettier)
- Firebase Emulator Suite

## 🚀 Getting Started
### Local Development

```bash
git clone https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation.git
cd congregation
npm install
```
## 💬 Support & Contact
### Authors
#### Mfonido Mark — Lead Engineer
- GitHub - @favourmark05
- Twitter/x - @MfonidoMark 
- Email - MfonidoMark@gmail.com

#### Abasifreke Antia — Designer / Product Manager
- Email - abasifrekeantiaa@gmail.com
- Twitter/x - @Seantantiaa
- GitHub - @abasifrekeantia

>“Technology for the Kingdom — because stewardship should be as excellent as worship.”