import { type NextRequest, NextResponse } from "next/server"
import { AttendanceModel } from "@/lib/models/Attendance"
import jwt from "jsonwebtoken"

export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any
    
    // Only admins can view daily attendance
    if (decoded.role !== "admin") {
      return NextResponse.json({ error: "Access denied. Admin only." }, { status: 403 })
    }

    // Get daily attendance
    const result = await AttendanceModel.getDailyAttendance(params.date)

    if (result.success) {
      return NextResponse.json({
        success: true,
        attendance: result.data
      })
    } else {
      return NextResponse.json({ error: result.error || "Failed to fetch daily attendance" }, { status: 500 })
    }
  } catch (error) {
    console.error("Get daily attendance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 