#!/bin/bash

echo "🚀 Starting deployment process..."
echo ""

# Step 1: Build the app
echo "📦 Building Next.js app (static export)..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"
echo ""

# Step 2: Deploy Firebase rules
echo "🔐 Deploying Firebase Storage and Firestore rules..."
firebase deploy --only storage,firestore

if [ $? -ne 0 ]; then
    echo "⚠️  Rules deployment failed. You may need to run 'firebase login' first."
    read -p "Continue with deployment? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# Step 3: Deploy to Firebase Hosting
echo "🌐 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi

echo ""
echo "✅ Deployment complete!"
echo "🎉 Your app is now live at: https://studio-billzai.us-central1.hosted.app"
