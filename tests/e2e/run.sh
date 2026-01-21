#!/bin/bash
# Run E2E tests
# Assumes UI is running on localhost:4200 and API on localhost:2900

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Cochart E2E Tests ==="
echo ""

# Check if UI is running
if ! curl -s http://localhost:4200 > /dev/null 2>&1; then
  echo "Warning: UI may not be running on localhost:4200"
  echo "Start it with: cd packages/ui && ng serve"
  echo ""
fi

# Check if API is running
if ! curl -s http://localhost:2900/health > /dev/null 2>&1; then
  echo "Warning: API server may not be running on localhost:2900"
  echo "Start it with: cd packages/api && npm run serve"
  echo ""
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
  npx playwright install chromium
fi

# Run tests
echo "Running E2E tests..."
npm test

echo ""
echo "=== Tests Complete ==="
