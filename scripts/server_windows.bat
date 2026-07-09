@echo off
setlocal
REM ==========================================================================
REM  SERVER launcher for Windows (NestJS + React). Build + run in production
REM  mode, for hosting a clone on a server. Installs deps, builds backend +
REM  frontend, runs DB migrations, then starts the compiled API and serves the
REM  built frontend. Vite is configured to accept all hosts.
REM  Tip: for a real deployment run the API under a service manager (pm2 / nssm).
REM ==========================================================================
set "HERE=%~dp0"
set "ROOT=%~dp0.."

call "%HERE%lib\install_windows.bat"
call "%HERE%lib\build_windows.bat"

echo Running database migrations...
pushd "%ROOT%\Backend" && call npm run migration:run && popd

echo Starting production servers...
start "Nest API (prod :3000)" /D "%ROOT%\Backend" cmd /k "npm run start:prod"
start "Frontend (preview :4173)" /D "%ROOT%\Frontend" cmd /k "npm run preview"

echo.
echo   API      http://localhost:3000/api
echo   Frontend http://localhost:4173   (set api.base_url + CORS for the public host)
endlocal
