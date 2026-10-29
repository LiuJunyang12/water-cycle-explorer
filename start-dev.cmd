@echo off
setlocal
cd /d "%~dp0"
title Water Cycle Explorer - Dev Server

set "NODE_EXE=C:\Program Files\nodejs\node.exe"
if not exist "%NODE_EXE%" set "NODE_EXE=node"

echo ============================================
echo   Water Cycle Explorer - local preview
echo ============================================
echo.
echo Folder: %CD%
echo KEEP THIS WINDOW OPEN while you test the website.
echo Closing this window stops the server.
echo.
echo Starting dev server ...
echo.

"%NODE_EXE%" "%~dp0node_modules\vite\bin\vite.js" --host --port 5173 --strictPort --open
set "CODE=%ERRORLEVEL%"

echo.
echo --------------------------------------------
if not "%CODE%"=="0" (
  echo [FAILED] exit code %CODE%
  echo Possible causes:
  echo   1. node_modules missing  ^(run: npm install^)
  echo   2. port 5173 already in use
  echo   3. file blocked by antivirus
  echo Send the error text above to the developer.
) else (
  echo Server exited normally.
)
echo --------------------------------------------
pause