#!/usr/bin/env bash
# Source this file to activate the isolated Node.js environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export PATH="$SCRIPT_DIR/.tools/node/bin:$PATH"
echo "✅ Anand_Project isolated Node.js environment activated!"
echo "Node version: $(node -v)"
echo "NPM version:  $(npm -v)"
