#!/usr/bin/env bash
# =============================================================================
#  build_apk.sh — One-click Standalone Android APK Builder for EduAssess
# =============================================================================
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
CLIENT_DIR="$PROJECT_ROOT/client"

echo ""
echo "========================================================"
echo "  📦 EduAssess — Standalone Android APK Build Service"
echo "========================================================"
echo ""

# Activate isolated Node environment
source "$PROJECT_ROOT/activate.sh"
cd "$CLIENT_DIR"

# 1. Check EAS Login Status
echo "🔍 Checking Expo / EAS account login..."
if ! npx eas whoami &>/dev/null; then
  echo ""
  echo "⚠️  You are not currently logged into an Expo account."
  echo "👉 Please log in (or create a free account at https://expo.dev/signup):"
  echo ""
  npx eas login
fi

echo ""
echo "✅ Logged in as: $(npx eas whoami 2>/dev/null | tail -1)"
echo ""

# 2. Trigger EAS Build for APK
echo "🚀 Starting EAS Cloud Build for standalone Android APK..."
echo "   Profile: preview (buildType: apk)"
echo "   Package: com.anand.examapp"
echo "   App:     EduAssess v1.0.0"
echo ""
echo "⏳ Expo Cloud is building your APK (typically takes ~5-8 minutes)..."
echo "   You can track progress in real-time below or via the web URL provided."
echo ""

npx eas build --platform android --profile preview

echo ""
echo "========================================================"
echo "🎉 APK Build Complete!"
echo "   Download the .apk from the link above and install it"
echo "   directly on any Android phone for your presentation."
echo "========================================================"
echo ""
