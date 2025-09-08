import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Email validation
    const isAdminEmail = [
      "admin@smartattend.com", 
      "superadmin@gmail.com",
      "admin1@klu.ac.in",
      "admin2@klu.ac.in",
      "admin3@klu.ac.in",
      "admin4@klu.ac.in",
      "admin@gmail.com" // Added new admin with gmail domain
    ].includes(email)
    const isUserEmail = email.endsWith("@klu.ac.in") || email.endsWith("@gmail.com")

    if (!isAdminEmail && !isUserEmail) {
      return NextResponse.json({ error: "Invalid email domain" }, { status: 400 })
    }

    // Find user in database
    const userResult = await UserModel.findByEmail(email)

    if (!userResult.success || !userResult.data) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 })
    }

    const user = userResult.data

    // Verify password
    const isValidPassword = await UserModel.verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 })
    }

    // Update last login
    const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await UserModel.updateById(user.id, { last_login: formattedDate })

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || "smartattend-jwt-secret-key-2024",
      { expiresIn: "24h" },
    )

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department,
        profileImage: user.profile_image,
        phone: user.phone,
        address: user.address,
        dateOfBirth: user.date_of_birth,
        studentId: user.student_id,
        registrationNumber: user.registration_number,
        joinDate: user.join_date,
        isActive: user.is_active,
        lastLogin: user.last_login,
        acmMember: user.acm_member,
        acmRole: user.acm_role,
        year: user.year,
        section: user.section,
      },
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
