#!/bin/bash
echo "Starting MySQL database with Docker..."
docker-compose up -d mysql
echo "Waiting for MySQL to be ready..."
sleep 30
echo "MySQL is ready! You can now run your Next.js app."
echo ""
echo "Database connection details:"
echo "Host: localhost"
echo "Port: 3306"
echo "Database: smartattend_db"
echo "Username: smartattend_user"
echo "Password: smartattend_pass"
