#!/usr/bin/env bash
# Your project's DEV run script (NestJS + React), created at the repo root by the
# wizard. Local development with hot reload: installs deps, then runs the API
# (watch) and the Vite dev server (HMR).
# (This template lives in scripts/launchers/; the wizard copies it to root.)
# To host on a server, use scripts/server_linux.sh instead.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

bash "$ROOT/scripts/lib/install_linux.sh"

echo "API http://localhost:3000/api  |  Frontend http://localhost:5173 (hot reload)"
( cd "$ROOT/Backend" && npm run dev ) &
( cd "$ROOT/Frontend" && npm run dev ) &
trap 'kill 0' INT TERM
wait
