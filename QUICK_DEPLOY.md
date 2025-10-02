# Quick Deploy Guide 🚀

## Deploy in 3 Simple Steps

### Option 1: Use the Deploy Script (Easiest)

```bash
./deploy.sh
```

This will automatically:
1. Build your app
2. Deploy Firebase rules
3. Deploy to Firebase Hosting

---

### Option 2: Manual Deployment

#### Step 1: Build
```bash
npm run build
```

#### Step 2: Deploy Rules
```bash
firebase deploy --only storage,firestore
```

#### Step 3: Deploy Hosting
```bash
firebase deploy --only hosting
```

---

### Option 3: Deploy Everything at Once

```bash
npm run build && firebase deploy
```

---

## First Time Setup

If you haven't logged in to Firebase CLI yet:

```bash
firebase login
```

Make sure you're using the correct project:

```bash
firebase use billzai
```

---

## Your Live URLs

After deployment:

- **Main App**: https://studio-billzai.us-central1.hosted.app
- **Shareable Links**: https://studio-billzai.us-central1.hosted.app/bill/[billId]

---

## What Gets Deployed

✅ **Hosting**: Your Next.js app
✅ **Storage Rules**: Allows authenticated users to upload images
✅ **Firestore Rules**: Secures bill data with proper permissions

---

## Testing After Deploy

1. Visit https://studio-billzai.us-central1.hosted.app
2. Sign in with Google
3. Upload a receipt or create a bill
4. Click "Save & Share"
5. ✅ No more 403 errors!
6. Copy and share the link with friends

---

## Troubleshooting

### Error: Not logged in
```bash
firebase login
```

### Error: Wrong project
```bash
firebase use billzai
```

### Error: Build failed
Check the error message and fix any TypeScript/lint errors, then try again.

---

## Need Help?

See [DEPLOY.md](DEPLOY.md) for detailed instructions.
