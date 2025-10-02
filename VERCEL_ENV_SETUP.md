# Vercel Environment Variables Setup

## The Error You're Seeing

The "Server Components render" error occurs because the AI receipt extraction feature needs the Google AI API key to work in production.

## Solution: Add Environment Variables to Vercel

### Step 1: Get Your Google AI API Key

You should already have this in your `.env.local` file. Check it:

```bash
cat .env.local | grep GOOGLE_GENAI_API_KEY
```

### Step 2: Add to Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/wthatans-projects/splitbill-ai
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add the following environment variables:

**Required Variables:**

| Name | Value | Environment |
|------|-------|-------------|
| `GOOGLE_GENAI_API_KEY` | Your Google AI API key | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | (from your .env.local) | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | (from your .env.local) | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | billzai | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | billzai.firebasestorage.app | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | (from your .env.local) | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | (from your .env.local) | Production, Preview, Development |

### Step 3: Redeploy

After adding the environment variables, redeploy:

```bash
vercel --prod
```

---

## Alternative: Add Via CLI

You can also add environment variables via CLI:

```bash
# Add Google AI API key
vercel env add GOOGLE_GENAI_API_KEY

# When prompted:
# - Enter your API key value
# - Select: Production, Preview, Development (all)
# - Confirm
```

Then redeploy:

```bash
vercel --prod
```

---

## After Setup

Once environment variables are added:

1. ✅ Receipt upload will work
2. ✅ AI extraction will work
3. ✅ No more "Server Components render" error
4. ✅ All features functional

---

## Quick Command to Get All Your Environment Variables

```bash
cat .env.local
```

Copy these values to Vercel dashboard under Settings → Environment Variables.

---

## Test After Setup

1. Visit your production URL
2. Upload a receipt
3. ✅ Should work without errors!
