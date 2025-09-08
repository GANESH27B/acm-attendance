import { executeQuery } from "../lib/database"
import bcrypt from "bcryptjs"

async function seedData() {
  console.log("🌱 Seeding database with sample data...")

  try {
    // Hash passwords
    const adminPasswordHash = await bcrypt.hash("admin123", 10)
    const studentPasswordHash = await bcrypt.hash("student123", 10)

    // Insert admin user
    await executeQuery(
      `INSERT IGNORE INTO users (
        id, full_name, email, password_hash, role, department, registration_number, acm_member
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "ADMIN001",
        "System Administrator",
        "admin@smartattend.com",
        adminPasswordHash,
        "admin",
        "Administration",
        "ADMIN001",
        false,
      ],
    )

    // Insert sample students
    const students = [
      [
        "USER001",
        "John Doe",
        "john.doe@klu.ac.in",
        "Computer Science Engineering",
        "REG2024001",
        "21001A05L0",
        true,
        "Technical Lead",
        "3rd Year",
        "A",
      ],
      [
        "USER002",
        "Jane Smith",
        "jane.smith@klu.ac.in",
        "Computer Science Engineering",
        "REG2024002",
        "21001A05L1",
        true,
        "President",
        "3rd Year",
        "A",
      ],
      [
        "USER003",
        "Mike Johnson",
        "mike.johnson@klu.ac.in",
        "Mechanical Engineering",
        "REG2024003",
        "21001A03L0",
        false,
        null,
        "2nd Year",
        "B",
      ],
      [
        "USER004",
        "Sarah Wilson",
        "sarah.wilson@klu.ac.in",
        "Electronics and Communication Engineering",
        "REG2024004",
        "21001A04L0",
        true,
        "Secretary",
        "1st Year",
        "A",
      ],
    ]

    for (const student of students) {
      await executeQuery(
        `INSERT IGNORE INTO users (
          id, full_name, email, password_hash, role, department, 
          registration_number, student_id, acm_member, acm_role, year, section
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          student[0],
          student[1],
          student[2],
          studentPasswordHash,
          "user",
          student[3],
          student[4],
          student[5],
          student[6],
          student[7],
          student[8],
          student[9],
        ],
      )
    }

    console.log("✅ Sample data seeded successfully!")
    console.log("\n🔑 Login Credentials:")
    console.log("Admin: admin@smartattend.com / admin123")
    console.log("Student: john.doe@klu.ac.in / student123")
  } catch (error) {
    console.error("❌ Error seeding data:", error)
  }

  process.exit(0)
}

seedData()
