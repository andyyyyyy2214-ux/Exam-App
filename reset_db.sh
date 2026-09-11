#!/usr/bin/env bash
# Reset and re-seed the local SQLite database
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/activate.sh"
cd "$SCRIPT_DIR/server"
echo ""
echo "🗑️  Resetting database and re-seeding with test data..."
echo ""
node scripts/seed.js
echo ""
echo "✅ Database reset complete!"
