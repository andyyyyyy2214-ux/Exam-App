#!/usr/bin/env bash
# ==============================================================================
# Anand Exam App - Full Stack Demo Launcher
# Starts the local backend (Port 5000) and serves the client (Port 3000)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/activate.sh"

echo "==================================================="
echo "🚀 Launching Anand Exam App Full-Stack Demo"
echo "==================================================="

# Kill any stale processes on ports 5000 and 3000
fuser -k 5000/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 1

# 1. Start Backend in Background
echo "📡 Starting Backend API (Port 5000)..."
cd "$SCRIPT_DIR/server"
node src/server.js &
SERVER_PID=$!

# Trap signals to cleanly kill both processes
trap "echo ''; echo '🛑 Shutting down demo servers...'; kill -9 $SERVER_PID 2>/dev/null; fuser -k 5000/tcp 2>/dev/null; fuser -k 3000/tcp 2>/dev/null; exit 0" INT TERM EXIT

sleep 2

# 2. Check if client/dist exists, if not build it
if [ ! -f "$SCRIPT_DIR/client/dist/index.html" ]; then
  echo "📦 Building client web bundle..."
  cd "$SCRIPT_DIR/client"
  npx expo export --platform web
fi

# 3. Serve client on Port 3000
echo ""
echo "📱 Serving Standalone Web/PWA App on Port 3000..."
echo "👉 Open http://localhost:3000 in your browser"
echo "👉 Or access from mobile on the LAN IP printed above"
echo "👉 Press Ctrl+C to stop both servers"
echo "==================================================="
echo ""

cd "$SCRIPT_DIR/client/dist"
python3 -m http.server 3000
