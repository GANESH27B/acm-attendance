import { type NextRequest, NextResponse } from "next/server"
import { AttendanceModel } from "@/lib/models/Attendance"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any;
    } catch (jwtError: any) {
      if (jwtError.name === 'TokenExpiredError') {
        return NextResponse.json({ error: "Token expired. Please log in again." }, { status: 401 });
      } else if (jwtError.name === 'JsonWebTokenError') {
        return NextResponse.json({ error: "Invalid token. Please log in again." }, { status: 401 });
      } else {
        return NextResponse.json({ error: "Token verification failed. Please log in again." }, { status: 401 });
      }
    }

    // Get today's attendance
    const result = await AttendanceModel.getTodayAttendance()

    if (result.success) {
      return NextResponse.json({
        success: true,
        attendance: result.data
      })
    } else {
      return NextResponse.json({ error: result.error || "Failed to fetch today's attendance" }, { status: 500 })
    }
  } catch (error) {
    console.error("Get today attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
