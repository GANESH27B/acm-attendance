# Setup Guide for Local MySQL on Windows

## Prerequisites
✅ Node.js installed
✅ MySQL installed
✅ VS Code installed

## Step-by-Step Setup

### 1. **Install Project Dependencies**
Open VS Code terminal in your project folder:
\`\`\`cmd
npm install
\`\`\`

Install additional dependencies:
\`\`\`cmd
npm install mysql2 @types/mysql2 bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken ts-node
\`\`\`

### 2. **Configure MySQL Database**

#### Option A: Using MySQL Workbench (Recommended)
1. Open **MySQL Workbench**
2. Connect to your local MySQL server
3. Open the file \`scripts/setup-local-mysql.sql\`
4. Execute the entire script (Ctrl+Shift+Enter)

#### Option B: Using MySQL Command Line
1. Open **Command Prompt** as Administrator
2. Navigate to MySQL bin directory:
   \`\`\`cmd
   cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
   \`\`\`
3. Login to MySQL:
   \`\`\`cmd
   mysql -u root -p
   \`\`\`
4. Run the setup script:
   \`\`\`sql
   source C:/path/to/your/project/scripts/setup-local-mysql.sql
   \`\`\`

### 3. **Configure Environment Variables**
The \`.env.local\` file is already configured for local MySQL:
\`\`\`
DB_HOST=localhost
DB_PORT=3306
DB_USER=smartattend_user
DB_PASSWORD=smartattend_pass
DB_NAME=smartattend_db
\`\`\`

### 4. **Test Database Connection**
\`\`\`cmd
npm run db:test
\`\`\`

### 5. **Start the Application**
\`\`\`cmd
npm run dev
\`\`\`

## 🔑 Default Login Credentials

### Admin Access
- **Email**: \`admin@smartattend.com\`
- **Password**: \`admin123\`

### Student Access
- **Email**: \`john.doe@klu.ac.in\`
- **Password**: \`student123\`

## 🌐 Access Your Application
- **Application**: http://localhost:3000

## 🛠️ Troubleshooting

### MySQL Connection Issues
1. **Check MySQL Service**: 
   - Open Services (services.msc)
   - Ensure "MySQL80" service is running

2. **Check MySQL Port**:
   - Default port is 3306
   - Verify in MySQL Workbench: Server → Status and System Variables

3. **User Permissions**:
   If you get permission errors, run this in MySQL:
   \`\`\`sql
   GRANT ALL PRIVILEGES ON smartattend_db.* TO 'smartattend_user'@'localhost';
   FLUSH PRIVILEGES;
   \`\`\`

### Common Windows Issues
1. **Path Issues**: Use forward slashes (/) in file paths
2. **Firewall**: Allow MySQL through Windows Firewall
3. **Port Conflicts**: Ensure port 3306 is not blocked

### Reset Database (if needed)
1. Drop the database in MySQL Workbench:
   \`\`\`sql
   DROP DATABASE IF EXISTS smartattend_db;
   \`\`\`
2. Re-run the setup script

## 📁 Important Files
- \`scripts/setup-local-mysql.sql\` - Database setup script
- \`.env.local\` - Environment configuration
- \`lib/database.ts\` - Database connection
- \`scripts/test-connection.ts\` - Connection test

## 🎯 Next Steps
1. Customize the application for your needs
2. Add more students through the admin panel
3. Configure additional subjects
4. Set up backup procedures for your database

## 📞 Need Help?
- Check MySQL error logs in: \`C:\ProgramData\MySQL\MySQL Server 8.0\Data\`
- Verify MySQL is running in Task Manager
- Ensure all dependencies are installed with \`npm install\`
\`\`\`
