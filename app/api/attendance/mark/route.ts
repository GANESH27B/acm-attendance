import { type NextRequest, NextResponse } from "next/server"
import { AttendanceModel } from "@/lib/models/Attendance"
import {
  withAuthorization,
  type AuthorizedHandler,
} from "@/withAuthorization"

const markAttendanceHandler: AuthorizedHandler = async (request, context) => {
  const { userId, subject, markedBy: providedMarkedBy } = await request.json()
  const { decoded } = context

  // Validate input
  if (!userId || !subject) {
    return NextResponse.json({ error: "User ID and subject are required" }, { status: 400 })
  }

  // Authorization check: Admins can mark for anyone, users can only mark for themselves.
  if (decoded.role !== "admin" && decoded.userId !== userId) {
    return NextResponse.json({ error: "Access denied: You can only mark your own attendance." }, { status: 403 })
  }

  // Determine who marked the attendance.
  // If an admin is marking, and they provide a `markedBy`, use it. Otherwise, use the admin's own ID.
  // If a user is marking, it's always their own ID.
  const markerId = decoded.role === 'admin' ? (providedMarkedBy || decoded.userId) : decoded.userId;

  // Mark attendance
  const result = await AttendanceModel.markAttendance(userId, subject, markerId)

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: "Attendance marked successfully",
    })
  }
  return NextResponse.json({ error: result.error || "Failed to mark attendance" }, { status: 500 })
}

export const POST = withAuthorization(markAttendanceHandler, ["admin", "user"])
