# Cloudinary Setup (Image Uploads)

> Moved from the README.

Every image picker in the app (sermon thumbnails, hero image, minister and congregation photos, leader avatars, gallery photos) follows the same flow:

1. User picks or drops a file.
2. The file is POSTed to Cloudinary using an **unsigned upload preset**.
3. Cloudinary returns a `secure_url`.
4. That URL is saved to Firestore — never the raw file or a base64 string.
5. The URL is what's read back whenever the image is rendered.

## Setting up Cloudinary

The free tier is more than enough for a single church. Setup takes a few minutes:

**1. Get your Cloud Name**

Sign up at [cloudinary.com](https://cloudinary.com/) and open the dashboard. The top of the page shows **Product Environment Credentials** — copy the **Cloud name** (something like `dxxxx1234`). You don't need the API key or secret because uploads from the browser are unsigned.

**2. Create an unsigned upload preset**

This is the access token that lets the browser POST images directly without exposing your API secret.

1. Click the **gear icon** (Settings) in the left sidebar of the dashboard.
2. Open the **Upload** tab → scroll to **Upload presets** → click **Add upload preset**.
3. Fill in:
   - **Preset name** — anything memorable, e.g. `congregation_unsigned`. Copy this exact string into `.env`.
   - **Signing Mode** — set to **Unsigned**. This is the critical setting.
   - **Folder** — leave blank. The app already files uploads into sub-folders like `congregation/sermons`, `congregation/leaders`, `congregation/gallery`.
   - **Allowed formats** (recommended) — `jpg, png, webp, gif`.
   - **Max file size** (recommended) — `5000000` (5 MB), matches the client-side limit.
4. Click **Save**.

**3. Fill in `.env`**

```env
VITE_CLOUDINARY_CLOUD_NAME=dxxxx1234
VITE_CLOUDINARY_UPLOAD_PRESET=congregation_unsigned
VITE_CLOUDINARY_FOLDER=congregation        # optional — defaults to "congregation"
```

`VITE_CLOUDINARY_FOLDER` is the root namespace under which every image lives. Individual uploaders pin sub-folders on top (e.g. the hero uploader uses `congregation/hero`, leaders use `congregation/leaders`).

**4. Restart the dev server**

Vite only reads `.env` at startup:

```bash
npm run dev
```

**5. Verify it works**

1. Open `/admin/settings` → **Homepage** tab.
2. Drag an image into **Building Photo**. You should see a progress overlay (`Uploading… 42%`), then a preview.
3. Click **Save Settings**.
4. Check your Cloudinary **Media Library** — the file should be under `congregation/hero/`.
5. Check Firestore (`settings/church` document) — `heroImageUrl` should hold the `https://res.cloudinary.com/...` URL.

## Troubleshooting

| Symptom                                          | Fix                                                                                    |
| ------------------------------------------------ | -------------------------------------------------------------------------------------- |
| `Cloudinary is not configured` error             | You didn't restart `npm run dev` after editing `.env`.                                 |
| `Upload preset must be whitelisted for unsigned` | The preset is set to **Signed** mode. Edit it and switch Signing Mode to **Unsigned**. |
| `Invalid cloud name`                             | Typo, or you copied the dashboard URL instead of just the cloud name string.           |
| Image uploads but doesn't persist after refresh  | Firestore save failed. Check the browser console and your Firestore security rules.    |

## Where the integration lives

- [`composables/useCloudinaryUpload.ts`](../composables/useCloudinaryUpload.ts) — handles the upload, exposes `uploading` / `progress` / `error` reactive state, and returns the `secure_url`.
- [`components/ui/ImageUpload.vue`](../components/ui/ImageUpload.vue) — drag-and-drop image picker with live progress, replace/remove overlay, and `shape="circle"` / `compact` variants. Drop it anywhere with `v-model` bound to a URL string.
