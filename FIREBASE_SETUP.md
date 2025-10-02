# Firebase Setup Instructions

## Deploy Firebase Security Rules

To fix the Firebase Storage permission errors, you need to deploy the security rules to your Firebase project.

### Steps:

1. **Login to Firebase CLI:**
   ```bash
   firebase login
   ```
   This will open a browser window for you to authenticate with your Google account.

2. **Deploy the rules:**
   ```bash
   firebase deploy --only storage,firestore
   ```

3. **Verify deployment:**
   After deployment, the Firebase Storage and Firestore rules will be updated to:
   - Allow authenticated users to upload images to their bills
   - Allow public read access to bills (for sharing)
   - Secure user data appropriately

### What the rules do:

**Storage Rules (`storage.rules`):**
- Authenticated users can upload images to `bills/{billId}/` folders
- Anyone can read/download images (for public sharing)

**Firestore Rules (`firestore.rules`):**
- Users can create/update/delete their own bills
- Anyone can read bills marked as `isPublic: true`
- Users can read their own bills regardless of public status

### Alternative: Deploy via Firebase Console

If you prefer, you can also deploy rules manually through the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **billzai**
3. For Storage Rules:
   - Go to Storage → Rules
   - Copy the content from `storage.rules` and paste it
   - Click "Publish"
4. For Firestore Rules:
   - Go to Firestore Database → Rules
   - Copy the content from `firestore.rules` and paste it
   - Click "Publish"

## After Deployment

Once deployed, the "Save & Share" button will work correctly:
1. It will save the bill to Firestore
2. Upload the summary image to Firebase Storage
3. Generate a shareable link
4. Display the link for you to copy and share

The "Download Only" button will download the image without saving to Firebase.
