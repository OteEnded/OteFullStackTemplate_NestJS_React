#!/usr/bin/env bash
# SERVER launcher for Linux/macOS (NestJS + React). Build + run in production
# mode for hosting. Installs deps, builds backend + frontend, runs migrations,
# then serves both. Vite is configured to accept all hosts.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/.." && pwd)"

bash "$HERE/lib/install_linux.sh"
bash "$HERE/lib/build_linux.sh"

echo "Running database migrations..."
( cd "$ROOT/Backend" && npm run migration:run )

echo "API http://localhost:3000/api  |  Frontend http://localhost:4173"
( cd "$ROOT/Backend" && npm run start:prod ) &
( cd "$ROOT/Frontend" && npm run preview ) &
trap 'kill 0' INT TERM
wait
