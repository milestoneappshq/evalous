#!/bin/bash

# ==============================================================================
# EVALOUS - ENTERPRISE DEPLOYMENT ENGINE (INTERWORX/VPS)
# ==============================================================================
# This script handles atomic builds, persistent volume symlinking, and PM2 rotation.
# Usage: ./deploy.sh
# ==============================================================================

# --- CONFIGURATION ---
APP_NAME="evalous-app"
WEB_ROOT=$(pwd)
STORAGE_ROOT="/home/evalous/evalous_data/proctoring"
UPLOADS_LINK="$WEB_ROOT/public/uploads"

echo "🚀 [1/6] INITIALIZING DEPLOYMENT PIPELINE..."

# Load Environment Variables from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ Environment variables loaded from .env"
else
    echo "⚠️  WARNING: .env file not found. Database sync may fail."
fi

# --- 1. PERSISTENCE LAYER SETUP ---
echo "📂 Ensuring persistent storage directories exist..."
mkdir -p "$STORAGE_ROOT"

if [ -L "$UPLOADS_LINK" ]; then
    echo "✅ Persistence symlink already exists."
elif [ -d "$UPLOADS_LINK" ]; then
    echo "⚠️  Moving existing uploads to persistent storage..."
    mv "$UPLOADS_LINK"/* "$STORAGE_ROOT/" 2>/dev/null
    rm -rf "$UPLOADS_LINK"
    ln -s "$STORAGE_ROOT" "$UPLOADS_LINK"
    echo "🔗 Created new persistence symlink."
else
    echo "🔗 Creating persistence symlink..."
    ln -s "$STORAGE_ROOT" "$UPLOADS_LINK"
fi

# --- 2. UPDATE REPOSITORY ---
echo "📥 [2/6] FETCHING LATEST CODE..."
git pull origin main

# --- 3. INSTALL DEPENDENCIES ---
echo "📦 [3/6] INSTALLING DEPENDENCIES..."
npm install

# --- 4. BUILD APPLICATION ---
echo "🏗️ [4/6] BUILDING PRODUCTION BUNDLE..."
npx prisma generate
rm -rf .next
npm run build

# --- 5. SYNC DATABASE (SUPABASE) ---
echo "🗄️ [5/6] SYNCING CLOUD DATABASE SCHEMA..."
# We temporarily swap to Direct URL for the push operation
export DATABASE_URL=$DIRECT_URL
npx prisma db push --accept-data-loss # Warning: ensure backups exist if modifying models
unset DATABASE_URL

# --- 6. PROCESS ROTATION (PM2) ---
echo "🔄 [6/6] RESTARTING APPLICATION SERVICE..."
if pm2 show $APP_NAME > /dev/null; then
    pm2 restart $APP_NAME --update-env
else
    pm2 start npm --name "$APP_NAME" -- start
fi

echo "✨ DEPLOYMENT COMPLETE: EVALOUS IS LIVE!"
echo "----------------------------------------------------------------------------"
echo "🌐 URL: https://evalous.com (or your configured domain)"
echo "📁 STORAGE: $STORAGE_ROOT (Persistent)"
echo "----------------------------------------------------------------------------"
