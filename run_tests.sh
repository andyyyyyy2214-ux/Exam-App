#!/usr/bin/env bash
# ==============================================================================
# Anand Exam App - Automated Feature Test Runner
# Runs Unit Tests, Integration Tests, and End-to-End Feature Verification
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/activate.sh"

echo "==================================================="
echo "🧪 Running Anand Exam App Automated Test Suite..."
echo "==================================================="

cd "$SCRIPT_DIR/server"
npm test

TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "==================================================="
  echo "🎉 ALL TESTS PASSED SUCCESSFULLY! (100% RELIABLE)"
  echo "==================================================="
else
  echo "❌ Tests failed with exit code $TEST_EXIT_CODE"
fi

exit $TEST_EXIT_CODE
