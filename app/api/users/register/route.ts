import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Create a payload object that accepts both camelCase and snake_case from the client
    // to make the API more robust.
    const payload = {
      fullName: body.fullName || body.full_name,
      email: body.email,
      password: body.password,
      department: body.department,
      registrationNumber: body.registrationNumber || body.registration_number,
      acmMember: body.acmMember,
      acmRole: body.acmRole || body.acm_role,
      year: body.year,
      section: body.section,
      studentId: body.studentId || body.student_id,
    }

    // Improved validation to identify exactly which fields are missing.
    const requiredFields: (keyof typeof payload)[] = ["fullName", "email", "password", "department", "registrationNumber", "acmMember", "year", "section", "studentId"];
    const missingFields = requiredFields.filter(field => {
      // Special handling for acmMember to allow false as a valid value
      if (field === "acmMember") {
        return payload[field] === undefined || payload[field] === null;
      }
      // For other fields, null or empty string is considered missing
      return !payload[field];
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 },
      )
    }

    // Validate acmRole only if acmMember is true
    if (payload.acmMember && !payload.acmRole) {
      return NextResponse.json(
        { error: "Missing required field: acmRole (since acmMember is true)" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(payload.email)
    if (existingUser.success) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 })
    }

    // Create new user
    const result = await UserModel.create(payload)

    if (result.success && result.user) {
      const dbUser = result.user || {}
      const { password_hash, ...userForClient } = dbUser

      // Map to camelCase for a consistent API response
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
      return NextResponse.json(
        { success: true, message: "User registered successfully", user: responseUser },
        { status: 201 },
      )
    }

    return NextResponse.json({ error: result.error || "Registration failed" }, { status: 500 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
