@echo off
echo 🚀 Starting Smart Attendance Database...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo 📦 Starting MySQL and phpMyAdmin containers...
docker-compose up -d

echo ⏳ Waiting for services to be ready...
timeout /t 15 /nobreak >nul

echo ✅ Services are starting up!
echo.
echo 📋 Available services:
echo    📊 Application: http://localhost:3000
echo    🗄️ phpMyAdmin: http://localhost:8080
echo    🔌 MySQL: localhost:3306
echo.
echo 🔑 phpMyAdmin login:
echo    Username: root
echo    Password: rootpassword123
echo.
pause
