@echo off
title KEAOS - Enterprise Agent Operating Studio
echo.
echo ===================================================
echo  KEAOS ^| Enterprise Agent Operating Studio
echo  Starting local development server...
echo ===================================================
echo.

if not exist node_modules (
    echo [KEAOS] node_modules directory missing. Installing dependencies...
    call npm install
)

echo [KEAOS] Opening browser at http://localhost:5173...
start http://localhost:5173/

echo [KEAOS] Launching Vite development server...
call npm run dev
