@echo off
REM Helper unit: compile backend (dist/) + build frontend (dist/) for production.
setlocal
set "ROOT=%~dp0..\.."

echo Building backend...
pushd "%ROOT%\Backend" && call npm run build && popd

echo Building frontend...
pushd "%ROOT%\Frontend" && call npm run build && popd
endlocal
