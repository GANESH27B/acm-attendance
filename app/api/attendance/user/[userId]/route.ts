import { type NextRequest, NextResponse } from "next/server"
import { AttendanceModel } from "@/lib/models/Attendance"
import {
  withAuthorization,
  type AuthorizedHandler,
} from "@/withAuthorization"

const getUserAttendanceHandler: AuthorizedHandler<{ userId: string }> = async (
  request: NextRequest,
  context
) => {
  const result = await AttendanceModel.getUserAttendance(context.params.userId)

  if (result.success) {
    return NextResponse.json({
      success: true,
      attendance: result.data,
    })
  }
  return NextResponse.json({ error: result.error || "Failed to fetch user attendance" }, { status: 500 })
}

export const GET = withAuthorization(getUserAttendanceHandler, ["admin", "self"])