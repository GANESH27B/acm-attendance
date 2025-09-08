import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
// NOTE: DEPARTMENTS and ACM_ROLES are not used here as validation is now more flexible.
// If strict validation is needed, it can be re-introduced.

export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get("authorization")
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7)
      try {
        const jwt = require("jsonwebtoken")
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "smartattend-jwt-secret-key-2024") as any
        if (decoded.role !== "admin") {
          return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 })
        }
      } catch (tokenError) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
      }
    }

    const body = await request.json()

    // Create a payload object that accepts both camelCase and snake_case from the client
    // to make the API more robust.
    const payload = {
      fullName: body.fullName || body.full_name,
      email: body.email,
      password: body.password,
      department: body.department,
      registrationNumber: body.registrationNumber || body.registration_number,
      acmMember: body.acmMember, // Let the model handle boolean conversion
      acmRole: body.acmRole || body.acm_role,
      year: body.year,
      section: body.section,
      studentId: body.studentId || body.student_id,
    }

    // Improved validation to identify exactly which fields are missing.
    const requiredFields: (keyof typeof payload)[] = ["fullName", "email", "password", "department", "registrationNumber"];
    const missingFields = requiredFields.filter(field => {
      // Special handling for acmMember to allow false as a valid value
      if (field === "acmMember") {
        return payload[field] === undefined || payload[field] === null;
      }
      // For other fields, null, undefined, or empty string is considered missing
      return !payload[field] || payload[field].toString().trim() === "";
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      )
    }

    // Password validation
    if (payload.password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Validate acmRole only if acmMember is true
    if (payload.acmMember && (!payload.acmRole || payload.acmRole.trim() === "")) {
      return NextResponse.json(
        { error: "ACM Role is required when ACM Member is selected" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(payload.email) // UserModel.create also checks for duplicates
    if (existingUser.success) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Pass the cleaned-up payload to the model
    const result = await UserModel.create(payload)

    if (result.success) {
      // Exclude sensitive data like password_hash from the response
      const dbUser = result.user || {}
      const { password_hash, ...userForClient } = dbUser

      // Map to camelCase for a consistent API response, matching other endpoints
      const responseUser = {
        id: userForClient.id,
        fullName: userForClient.full_name,
        email: userForClient.email,
        role: userForClient.role,
        department: userForClient.department,
        registrationNumber: userForClient.registration_number,
        acmMember: !!userForClient.acm_member,
        acmRole: userForClient.acm_role,
        year: userForClient.year,
        section: userForClient.section,
        studentId: userForClient.student_id,
        joinDate: userForClient.join_date,
        isActive: !!userForClient.is_active,
      }
      return NextResponse.json({ success: true, user: responseUser }, { status: 201 })
    } else {
      // Check if it's a duplicate entry error
      if (result.error && (
        result.error.includes("already exists") ||
        result.error.includes("duplicate") ||
        result.error.includes("Duplicate entry")
      )) {
        return NextResponse.json({ error: result.error }, { status: 409 })
      }
      return NextResponse.json({ error: result.error || "Failed to register user" }, { status: 500 })
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
