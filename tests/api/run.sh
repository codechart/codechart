#!/bin/bash
# Run API tests
# Assumes API server is running on localhost:2900

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== Cochart API Tests ==="
echo ""

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
fi

# Run tests
echo "Running tests..."
npm test

echo ""
echo "=== Tests Complete ==="
