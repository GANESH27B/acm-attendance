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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as any

    // Get real-time statistics
    const [todayAttendanceCount, totalUsersCount] = await Promise.all([
      AttendanceModel.getTodayAttendanceCount(),
      AttendanceModel.getTotalUsersCount()
    ])

    const stats = {
      todayAttendance: todayAttendanceCount.success ? todayAttendanceCount.count : 0,
      totalUsers: totalUsersCount.success ? totalUsersCount.count : 0,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error) {
    console.error("Get dashboard stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 