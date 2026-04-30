@echo off
title GitHub Deploy

cd /d "%~dp0"

echo.
echo Changed files:
git status --short
echo.

set /p msg="Commit message (Enter = update): "
if "%msg%"=="" set msg=update

git add .
git commit -m "%msg%"
git push

echo.
echo Done! https://gogo0337.github.io/youtube_summary/
echo.
pause
