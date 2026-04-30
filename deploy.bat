@echo off
chcp 65001 > nul
title GitHub Deploy
echo.
echo  [DEPLOY] GitHub 배포 시작...
echo.

cd /d "%~dp0"

git status --short
echo.

set /p msg="커밋 메시지 입력 (Enter = update): "
if "%msg%"=="" set msg=update

echo.
git add .
git commit -m "%msg%"
git push

echo.
echo  [완료] 배포 성공!
echo  1~2분 후 아래 주소에 반영됩니다.
echo  https://gogo0337.github.io/youtube_summary/
echo.
pause
