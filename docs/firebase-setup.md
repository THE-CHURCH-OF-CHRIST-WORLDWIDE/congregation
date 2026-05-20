# Firebase Setup

This guide covers creating a Firebase project and configuring it for use with Congregation.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project**
3. Enter a project name (e.g., `congregation-prod`)
4. Optionally enable Google Analytics
5. Click **Create project**

---

## 2. Register a Web App

1. From the project dashboard, click the **Web** icon (`</>`)
2. Enter an app nickname (e.g., `congregation-web`)
3. Click **Register app**
4. Copy the Firebase config object — you will need these values for your `.env` file

```js
const firebaseConfig = {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...',
}
```

Map each value to its corresponding environment variable in `.env`:

```env
VITE_FIREBASE_API_KEY=apiKey
VITE_FIREBASE_AUTH_DOMAIN=authDomain
VITE_FIREBASE_PROJECT_ID=projectId
VITE_FIREBASE_STORAGE_BUCKET=storageBucket
VITE_FIREBASE_MESSAGING_SENDER_ID=messagingSenderId
VITE_FIREBASE_APP_ID=appId
```

---

## 3. Enable Authentication

1. In the Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the providers your app will use:
   - **Email/Password** (recommended minimum)
   - **Google** (optional)
3. Under **Authorized domains**, ensure your dev domain (`localhost`) and production domain are listed

---

## 4. Set Up Cloud Firestore

1. Go to **Firestore Database** > **Create database**
2. Choose **Start in production mode** (recommended)
3. Select a region close to your users
4. After creation, go to the **Rules** tab and configure security rules

A minimal starting rules configuration:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public read for landing page content
    match /public/{document=**} {
      allow read: if true;
      allow write: if false;
    }

    // Admin-only access for church data
    match /members/{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }

    match /giving/{document=**} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }

    match /attendance/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> Adjust these rules to match your application's role structure before going to production.

---

## 5. Set Up Firebase Storage

1. Go to **Storage** > **Get started**
2. Accept the default security rules for now
3. Update storage rules for your use case:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /public/{allPaths=**} {
      allow read: if true;
    }
    match /uploads/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 6. (Optional) Firebase Emulator Suite

For local development, use the Firebase Emulator to avoid modifying production data:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Log in
firebase login

# Initialize emulators in the project root
firebase init emulators
```

Select **Firestore**, **Authentication**, and **Storage** emulators. Then start them with:

```bash
firebase emulators:start
```

The emulator UI is available at `http://localhost:4000` by default.

---

## 7. Deploy Firebase Security Rules

Once you are satisfied with your Firestore and Storage rules, deploy them:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

---

## References

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Auth Providers](https://firebase.google.com/docs/auth/web/start)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
