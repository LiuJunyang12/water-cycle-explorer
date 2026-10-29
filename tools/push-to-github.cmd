@echo off
setlocal
cd /d "%~dp0.."
echo ============================================
echo  Water Cycle Explorer - push to GitHub
echo  Repo: https://github.com/LiuJunyang12/water-cycle-explorer.git
echo ============================================
echo.
git remote set-url origin https://github.com/LiuJunyang12/water-cycle-explorer.git
git push -u origin main
echo.
if errorlevel 1 (
  echo PUSH FAILED.
  echo - Sign in to GitHub in the window that opened, then run this file again.
  echo - Or open GitHub Desktop, add this folder, and press "Publish branch".
) else (
  echo PUSH DONE. Open: https://github.com/LiuJunyang12/water-cycle-explorer
)
echo.
pause
