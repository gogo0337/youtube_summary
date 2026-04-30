@echo off
title YouTube 영상 분석기
echo.
echo  ▶ YouTube 영상 분석기 시작 중...
echo.

cd /d "%~dp0"

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [오류] Node.js가 설치되어 있지 않습니다.
    echo  https://nodejs.org 에서 설치 후 다시 실행하세요.
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo  패키지 설치 중... (최초 1회만 실행됩니다)
    npm install
    echo.
)

echo  서버 주소: http://localhost:5173
echo  종료하려면 이 창을 닫거나 Ctrl+C 를 누르세요.
echo.

start "" http://localhost:5173
npm run dev
