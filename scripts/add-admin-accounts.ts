import "dotenv/config"
import bcrypt from "bcryptjs"
import { executeQuery } from "../lib/database"

async function addAdminAccounts() {
  console.log("🔧 Adding admin accounts...\n")

  try {
    // Default password for all admin accounts
    const defaultPassword = "admin123"
    const passwordHash = await bcrypt.hash(defaultPassword, 10)

    // Admin accounts to add
    const adminAccounts = [
      {
        id: "ADMIN101",
        fullName: "Admin One",
        email: "admin1@klu.ac.in",
        department: "Administration"
      },
      {
        id: "ADMIN102",
        fullName: "Admin Two",
        email: "admin2@klu.ac.in",
        department: "Administration"
      },
      {
        id: "ADMIN103",
        fullName: "Admin Three",
        email: "admin3@klu.ac.in",
        department: "Administration"
      },
      {
        id: "ADMIN104",
        fullName: "Admin Four",
        email: "admin4@klu.ac.in",
        department: "Administration"
      },
      {
        id: "ADMIN105",
        fullName: "Gmail Admin",
        email: "admin@gmail.com",
        department: "Administration"
      }
    ]

    console.log("Adding admin accounts with default password: admin123")

    for (const admin of adminAccounts) {
      // Check if admin already exists
      const checkResult = await executeQuery(
        "SELECT * FROM users WHERE email = ?",
        [admin.email]
      )

      if (checkResult.success && Array.isArray(checkResult.data) && checkResult.data.length > 0) {
        console.log(`   ⚠️ Admin account ${admin.email} already exists, skipping...`)
        continue
      }

      // Insert new admin account
      const insertResult = await executeQuery(
        `INSERT INTO users (
          id, full_name, email, password_hash, role, department, 
          registration_number, join_date, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `,
        [
          admin.id,
          admin.fullName,
          admin.email,
          passwordHash,
          "admin",
          admin.department,
          admin.id, // Using admin ID as registration number
          true
        ]
      )

      if (insertResult.success) {
        console.log(`   ✅ Added admin account: ${admin.email}`)
      } else {
        console.log(`   ❌ Failed to add admin account: ${admin.email}`)
      }
    }

    console.log("\n🎉 Admin accounts setup completed!")
    console.log("\n📋 Admin credentials:")
    console.log("   • Email: admin1@klu.ac.in, admin2@klu.ac.in, admin3@klu.ac.in, admin4@klu.ac.in, admin@gmail.com")
    console.log("   • Password: admin123")

  } catch (error) {
    console.error("❌ Admin accounts setup failed:", error)
  }
}

addAdminAccounts()