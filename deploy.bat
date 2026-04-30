@echo off
title GitHub 배포
echo.
echo  ▶ GitHub 배포 시작...
echo.

cd /d "%~dp0"

:: 변경 파일 확인
git status --short
echo.

:: 커밋 메시지 입력
set /p msg="커밋 메시지 입력 (Enter = '업데이트'): "
if "%msg%"=="" set msg=업데이트

echo.
git add .
git commit -m "%msg%"
git push

echo.
echo  ✅ 배포 완료!
echo  GitHub Actions 빌드 후 1~2분 내 반영됩니다.
echo  https://gogo0337.github.io/youtube_summary/
echo.
pause
