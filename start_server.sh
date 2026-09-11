#!/usr/bin/env bash
# Start the Backend REST API Server
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/activate.sh"

# Kill any stale process on port 5000
fuser -k 5000/tcp 2>/dev/null || true
sleep 1

cd "$SCRIPT_DIR/server"
echo ""
echo "🔧 Starting Backend Server..."
echo ""
node src/server.js
