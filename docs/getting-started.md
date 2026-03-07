# Getting Started

This guide walks you through setting up Congregation for local development.

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v20 or higher — [nodejs.org](https://nodejs.org)
- **npm** v10 or higher (bundled with Node.js)
- **Git** — [git-scm.com](https://git-scm.com)
- **Firebase CLI** — `npm install -g firebase-tools`
- A **Google account** with access to the [Firebase Console](https://console.firebase.google.com/)

---

## 1. Clone the Repository

```bash
git clone https://github.com/mfonidomark/congregation.git
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

Open `.env` and fill in your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> See [Firebase Setup](firebase-setup.md) for instructions on creating a Firebase project and obtaining these values.

---

## 4. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

- **Admin Dashboard** — `http://localhost:3000/admin`
- **Public Landing Page** — `http://localhost:3000/`

---

## 5. (Optional) Use the Firebase Emulator Suite

For local backend development without touching your production Firebase project:

```bash
firebase emulators:start
```

This starts local emulators for Firestore, Authentication, and Storage. Make sure your `.env` or plugin configuration points to the emulator ports when running locally.

---

## Available Scripts

| Command             | Description                            |
|---------------------|----------------------------------------|
| `npm run dev`       | Start development server               |
| `npm run build`     | Build for production                   |
| `npm run generate`  | Generate a static site                 |
| `npm run preview`   | Preview the production build locally   |

---

## Next Steps

- [Firebase Setup](firebase-setup.md) — Configure Firestore, Auth, and Storage
- [Architecture](architecture.md) — Understand the codebase structure
- [Contributing](contributing.md) — Learn how to submit changes
