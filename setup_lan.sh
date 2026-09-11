#!/usr/bin/env bash
# =============================================================================
#  setup_lan.sh — Auto-configure LAN IP so Expo Go works on a real phone
# =============================================================================
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
APP_JSON="$PROJECT_ROOT/client/app.json"

echo ""
echo "=========================================="
echo "  📱 EduAssess — LAN Setup for Expo Go"
echo "=========================================="

# ── Detect LAN IP ─────────────────────────────────────────────────────────────
# Try multiple methods to get the real Wi-Fi / Ethernet IP (not loopback)
LAN_IP=""

# Method 1: ip route (Linux standard)
if command -v ip &>/dev/null; then
  LAN_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' | head -1)
fi

# Method 2: hostname -I (simple fallback)
if [ -z "$LAN_IP" ] && command -v hostname &>/dev/null; then
  LAN_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
fi

# Method 3: ifconfig fallback
if [ -z "$LAN_IP" ] && command -v ifconfig &>/dev/null; then
  LAN_IP=$(ifconfig 2>/dev/null | grep -Eo 'inet (addr:)?([0-9]+\.){3}[0-9]+' \
    | grep -v '127.0.0.1' | awk '{print $2}' | head -1)
fi

# Method 4: /proc/net/fib_trie (deepest fallback for restricted environments)
if [ -z "$LAN_IP" ] && [ -f /proc/net/fib_trie ]; then
  LAN_IP=$(awk '/32 host/{print f} {f=$2}' /proc/net/fib_trie 2>/dev/null \
    | grep -v '127\.0\.0\.1' | grep -v '^$' | head -1)
fi

if [ -z "$LAN_IP" ] || [ "$LAN_IP" = "127.0.0.1" ]; then
  echo ""
  echo "⚠️  Could not auto-detect your LAN IP."
  echo ""
  echo "Please find it manually:"
  echo "  Linux/Mac: Run 'ip addr' or 'ifconfig' — look for inet under wlan0/eth0"
  echo "  Windows:   Run 'ipconfig' — look for IPv4 Address"
  echo ""
  read -rp "Enter your PC's LAN IP address (e.g. 192.168.1.15): " LAN_IP
fi

SERVER_URL="http://${LAN_IP}:5000"
echo ""
echo "✅ Detected LAN IP: $LAN_IP"
echo "   Backend URL:     $SERVER_URL"

# ── Patch app.json ────────────────────────────────────────────────────────────
# Use node/python to safely update the JSON (not sed, to avoid corruption)
if command -v node &>/dev/null; then
  node -e "
    const fs = require('fs');
    const path = '$APP_JSON';
    const json = JSON.parse(fs.readFileSync(path, 'utf8'));
    json.expo.extra = json.expo.extra || {};
    json.expo.extra.serverUrl = '$SERVER_URL';
    fs.writeFileSync(path, JSON.stringify(json, null, 2) + '\n');
    console.log('✅ app.json updated with serverUrl: $SERVER_URL');
  "
elif command -v python3 &>/dev/null; then
  python3 -c "
import json
with open('$APP_JSON', 'r') as f:
    data = json.load(f)
data['expo']['extra']['serverUrl'] = '$SERVER_URL'
with open('$APP_JSON', 'w') as f:
    json.dump(data, f, indent=2)
    f.write('\n')
print('✅ app.json updated with serverUrl: $SERVER_URL')
"
else
  echo "❌ Neither node nor python3 found. Please manually add this to client/app.json:"
  echo "   \"extra\": { \"serverUrl\": \"$SERVER_URL\", ... }"
  exit 1
fi

# ── Update server binding ─────────────────────────────────────────────────────
echo ""
echo "✅ Backend already binds to 0.0.0.0 (accessible from all devices on LAN)"

# ── Print instructions ────────────────────────────────────────────────────────
echo ""
echo "=========================================="
echo "  🚀 HOW TO TEST ON YOUR PHONE NOW"
echo "=========================================="
echo ""
echo "  STEP 1: Make sure phone & PC are on the SAME Wi-Fi network"
echo ""
echo "  STEP 2: Start the backend (in terminal 1):"
echo "    cd $PROJECT_ROOT"
echo "    ./start_server.sh"
echo ""
echo "  STEP 3: Start Expo dev server (in terminal 2):"
echo "    source $PROJECT_ROOT/activate.sh"
echo "    cd $PROJECT_ROOT/client"
echo "    npx expo start --lan"
echo ""
echo "  STEP 4: Open 'Expo Go' app on your Android phone"
echo "          Tap 'Scan QR Code' and scan the QR in the terminal"
echo ""
echo "  STEP 5: App loads on your phone! 🎉"
echo ""
echo "  Backend API: $SERVER_URL/api/v1"
echo "=========================================="
echo ""
