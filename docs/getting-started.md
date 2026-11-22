# Getting Started

This guide walks you through setting up Congregation for local development.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v22 or higher — [nodejs.org](https://nodejs.org)
- **npm** v10 or higher (bundled with Node.js)
- **Git** — [git-scm.com](https://git-scm.com)
- **Firebase CLI** — `npm install -g firebase-tools`
- A **Google account** with access to the [Firebase Console](https://console.firebase.google.com/)

---

## 1. Clone the Repository

```bash
git clone https://github.com/THE-CHURCH-OF-CHRIST-WORLDWIDE/congregation.git
cd congregation
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and fill in your Firebase project credentials, plus Cloudinary if you need image uploads:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
VITE_CLOUDINARY_FOLDER=congregation

APP_ENV=development
```

> See [Firebase Setup](firebase-setup.md) for creating a Firebase project and obtaining these values, and [Cloudinary Setup](cloudinary-setup.md) for image uploads. The full variable reference is in the [README](../README.md#environment-variables).

---

## 4. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

- **Admin Dashboard** — `http://localhost:3000/admin`
- **Public Landing Page** — `http://localhost:3000/`

---

## 5. Seed the First Super Admin

The dashboard only lets an account change data if it has a `users/{uid}` document with a role. Create your first account under **Authentication → Users** in the Firebase console, then create the Firestore document `users/<that-uid>` with `roleId: "super-admin"`, and deploy the rules. See [Firebase Setup § Bootstrapping the first Super Admin](firebase-setup.md#bootstrapping-the-first-super-admin).

> **Firebase Emulator Suite:** the app does not currently call `connect*Emulator`, so running `firebase emulators:start` alone will not redirect it. Use a separate, non-production Firebase project for development.

---

## Available Scripts

| Command                | Description                          |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | Start development server             |
| `npm run build`        | Build for production                 |
| `npm run generate`     | Generate the static SPA              |
| `npm run preview`      | Preview the production build locally |
| `npm run typecheck`    | Type-check                           |
| `npm run lint`         | Run ESLint                           |
| `npm run format:check` | Check formatting                     |
| `npm run test`         | Run the unit tests                   |

The full list, including the staging and production variants, is in the [README](../README.md#available-scripts).

---

## Next Steps

- [Firebase Setup](firebase-setup.md) — Configure Firestore, Auth, and Storage
- [Architecture](architecture.md) — Understand the codebase structure
- [Deployment & Access Control](deployment.md) — Security model, roles, and going live
- [Contributing](../CONTRIBUTING.md) — Learn how to submit changes
