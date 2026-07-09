@echo off
setlocal
REM ==========================================================================
REM  Your project's DEV run script (NestJS + React), created at the repo root
REM  by the wizard. Local development with hot reload: installs deps on first
REM  run, then starts the API (watch) + Vite dev server (HMR) in two windows.
REM  (This template lives in scripts\launchers\; the wizard copies it to root.)
REM
REM  To HOST on a server, use scripts\server_windows.bat instead.
REM ==========================================================================
set "ROOT=%~dp0"

call "%ROOT%scripts\lib\install_windows.bat"

start "Nest API (dev :3000)" /D "%ROOT%Backend" cmd /k "npm run dev"
start "React (dev :5173)" /D "%ROOT%Frontend" cmd /k "npm run dev"

echo.
echo   API      http://localhost:3000/api   (Swagger: /api/docs)
echo   Frontend http://localhost:5173        (hot reload)
echo.
echo Two windows opened. Close them (or Ctrl+C in each) to stop.
endlocal
