#!/usr/bin/env bash
# Helper unit: compile backend (dist/) + build frontend (dist/) for production.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "Building backend..."
( cd "$ROOT/Backend" && npm run build )

echo "Building frontend..."
( cd "$ROOT/Frontend" && npm run build )
