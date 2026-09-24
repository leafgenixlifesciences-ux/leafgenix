@echo off
title LeafGenix - local dev server
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nahi mila. https://nodejs.org se LTS install karke dobara chalao.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies - first time only, 2-4 minutes...
  call npm install
  if errorlevel 1 ( echo npm install failed. & pause & exit /b 1 )
)

echo.
echo Starting LeafGenix at http://localhost:3000 ...
start "" http://localhost:3000
call npm run dev
pause
