#!/bin/bash

echo "🚀 Deploying AI Marketing Crypto App to Vercel for Hackathon Submission"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Build the frontend
echo "🔨 Building frontend..."
cd frontend
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your live demo URL will be displayed above"
echo "📝 Copy this URL for your hackathon submission" 