
---

## 📘 `docs/firebase-setup.md`

```markdown
# Firebase Setup Guide

This document describes how to configure Firebase for ShepherdCMS.

---

## 1. Create a Firebase project
- Visit [Firebase Console](https://console.firebase.google.com/)
- Click **Add project**
- Enable Firestore, Authentication, and Storage

## 2. Configure Firebase locally
In `/server/firebase.json`, update:
```json
{
  "projectId": "your-project-id",
  "databaseURL": "https://your-project-id.firebaseio.com",
  "storageBucket": "your-project-id.appspot.com"
}
