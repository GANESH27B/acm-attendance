@echo off
echo 🚀 Setting up Smart Attendance Platform Database...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Start MySQL container
echo 📦 Starting MySQL container...
docker-compose up -d mysql

REM Wait for MySQL to be ready
echo ⏳ Waiting for MySQL to be ready...
timeout /t 30 /nobreak >nul

REM Check if MySQL is ready (with retry logic)
:check_mysql
docker exec smartattend_mysql mysqladmin ping -h"localhost" --silent >nul 2>&1
if %errorlevel% neq 0 (
    echo ⏳ Waiting for MySQL connection...
    timeout /t 5 /nobreak >nul
    goto check_mysql
)

echo ✅ MySQL is ready!

REM Initialize database
echo 🗄️ Initializing database...
docker exec -i smartattend_mysql mysql -u root -prootpassword123 < scripts/init-database.sql

echo ✅ Database setup complete!
echo.
echo 📋 Database connection details:
echo    Host: localhost
echo    Port: 3306
echo    Database: smartattend_db
echo    Username: smartattend_user
echo    Password: smartattend_pass
echo.
echo 👤 Default admin login:
echo    Email: admin@smartattend.com
echo    Password: admin123
echo.
echo 🎓 Sample student login:
echo    Email: john.doe@klu.ac.in
echo    Password: student123
echo.
echo 🌐 phpMyAdmin available at: http://localhost:8080
echo 🚀 You can now start your Next.js application with: npm run dev
echo.
pause
