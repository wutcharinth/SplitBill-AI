# Deployment Guide

## Deploy to Firebase Hosting

Since you already have Firebase Hosting set up (`studio-billzai.us-central1.hosted.app`), follow these steps to deploy the updated version:

### Step 1: Login to Firebase (if not already logged in)

```bash
firebase login
```

This will open your browser for authentication.

### Step 2: Deploy Firebase Rules First (Important!)

Deploy the security rules to fix the storage permission errors:

```bash
firebase deploy --only storage,firestore
```

This will:
- Update Storage rules to allow authenticated uploads
- Update Firestore rules for proper bill permissions

### Step 3: Build Your Next.js App

```bash
npm run build
```

This creates an optimized production build.

### Step 4: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

This will deploy your app to: `https://studio-billzai.us-central1.hosted.app`

### One-Command Deploy (All at Once)

To deploy everything at once:

```bash
npm run build && firebase deploy
```

This will:
1. Build the production app
2. Deploy hosting
3. Deploy storage rules
4. Deploy firestore rules

---

## Expected Output

After deployment, you should see:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/billzai/overview
Hosting URL: https://studio-billzai.us-central1.hosted.app
```

---

## Testing After Deployment

1. Visit your app: `https://studio-billzai.us-central1.hosted.app`
2. Sign in with Google
3. Upload a receipt or create a bill
4. Click "Save & Share"
5. Copy the shareable link (e.g., `https://studio-billzai.us-central1.hosted.app/bill/abc123`)
6. Share the link with anyone!

---

## Troubleshooting

### If you get "command not found: firebase"

The Firebase CLI is already installed. Try:
```bash
npm install -g firebase-tools
```

### If you're not logged in

```bash
firebase login
```

### If deployment fails

Check your Firebase project:
```bash
firebase projects:list
```

Make sure you're using the correct project:
```bash
firebase use billzai
```

---

## Custom Domain (Optional)

If you want to use a custom domain instead of `studio-billzai.us-central1.hosted.app`:

1. Go to Firebase Console → Hosting → Add custom domain
2. Follow the DNS configuration steps
3. Your app will be available at your custom domain

---

## Environment Variables

Make sure your `.env.local` file exists with the correct Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDPFEoxyFrcJwWeQk6aVjK8YbPodmxLA2o
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=billzai.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=billzai
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=billzai.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=743957871307
NEXT_PUBLIC_FIREBASE_APP_ID=1:743957871307:web:a6ed450e23c737a43ff94e
```

These are already configured in your `src/lib/firebase/config.ts`.
