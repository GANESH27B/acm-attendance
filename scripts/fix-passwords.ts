import "dotenv/config"
import bcrypt from "bcryptjs"
import { executeQuery } from "../lib/database"

async function fixPasswords() {
  console.log("🔧 Fixing password hashes...\n")

  try {
    // Hash the correct passwords
    const adminPasswordHash = await bcrypt.hash("admin123", 10)
    const studentPasswordHash = await bcrypt.hash("student123", 10)

    console.log("1. Updating admin password...")
    const adminResult = await executeQuery(
      "UPDATE users SET password_hash = ? WHERE email = ?",
      [adminPasswordHash, "admin@smartattend.com"]
    )

    if (adminResult.success) {
      console.log("   ✅ Admin password updated")
    } else {
      console.log("   ❌ Failed to update admin password")
    }

    console.log("\n2. Updating student passwords...")
    const studentEmails = [
      "john.doe@klu.ac.in",
      "jane.smith@klu.ac.in", 
      "mike.johnson@klu.ac.in",
      "sarah.wilson@klu.ac.in"
    ]

    for (const email of studentEmails) {
      const studentResult = await executeQuery(
        "UPDATE users SET password_hash = ? WHERE email = ?",
        [studentPasswordHash, email]
      )

      if (studentResult.success) {
        console.log(`   ✅ Updated password for ${email}`)
      } else {
        console.log(`   ❌ Failed to update password for ${email}`)
      }
    }

    console.log("\n🎉 Password fixes completed!")
    console.log("\n📋 Updated credentials:")
    console.log("   • Admin: admin@smartattend.com / admin123")
    console.log("   • Students: [any student email] / student123")

  } catch (error) {
    console.error("❌ Password fix failed:", error)
  }
}

fixPasswords() 