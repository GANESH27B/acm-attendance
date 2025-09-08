#!/bin/bash

echo "🚀 Setting up Smart Attendance Platform Database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start MySQL container
echo "📦 Starting MySQL container..."
docker-compose up -d mysql

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 30

# Check if MySQL is ready
until docker exec smartattend_mysql mysqladmin ping -h"localhost" --silent; do
    echo "⏳ Waiting for MySQL connection..."
    sleep 5
done

echo "✅ MySQL is ready!"

# Initialize database
echo "🗄️ Initializing database..."
docker exec -i smartattend_mysql mysql -u root -prootpassword123 < scripts/init-database.sql

echo "✅ Database setup complete!"
echo ""
echo "📋 Database connection details:"
echo "   Host: localhost"
echo "   Port: 3306"
echo "   Database: smartattend_db"
echo "   Username: smartattend_user"
echo "   Password: smartattend_pass"
echo ""
echo "👤 Default admin login:"
echo "   Email: admin@smartattend.com"
echo "   Password: admin123"
echo ""
echo "🎓 Sample student login:"
echo "   Email: john.doe@klu.ac.in"
echo "   Password: student123"
echo ""
echo "🌐 phpMyAdmin available at: http://localhost:8080"
echo "🚀 You can now start your Next.js application with: npm run dev"
