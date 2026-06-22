@echo off
setlocal
REM ==========================================================================
REM  Dev launcher for the NestJS + React template.
REM  - Installs dependencies on first run (if node_modules is missing).
REM  - Starts the NestJS API (watch mode) and the React/Vite dev server (HMR)
REM    in two separate windows. They run as independent apps (CORS).
REM  Just double-click this file, or run "run.bat" from any terminal.
REM ==========================================================================

set "ROOT=%~dp0"

REM --- Install backend deps if missing ---
if not exist "%ROOT%Backend\node_modules" (
  echo Installing backend dependencies ^(first run^)...
  pushd "%ROOT%Backend" && call npm install && popd
)

REM --- Install frontend deps if missing ---
if not exist "%ROOT%Frontend\node_modules" (
  echo Installing frontend dependencies ^(first run^)...
  pushd "%ROOT%Frontend" && call npm install && popd
)

REM --- Launch both dev servers in their own windows ---
REM  /D sets each window's working directory (handles spaces in the path).
REM  cmd /k keeps the window open so you can read logs / stop with Ctrl+C.
start "Nest Backend (:3000)" /D "%ROOT%Backend" cmd /k "npm run dev"
start "React Frontend (:5173)" /D "%ROOT%Frontend" cmd /k "npm run dev"

echo.
echo   Backend  : http://localhost:3000/api   (Swagger: /api/docs)
echo   Frontend : http://localhost:5173        (hot reload)
echo.
echo Two windows opened. Close them (or press Ctrl+C in each) to stop the servers.
endlocal
