import { type NextRequest, NextResponse } from "next/server"
import { AttendanceModel } from "@/lib/models/Attendance"
import {
  withAuthorization,
  type AuthorizedHandler,
} from "@/withAuthorization"

const getStatsHandler: AuthorizedHandler<{ userId: string }> = async (
  request: NextRequest,
  context
) => {
  const stats = await AttendanceModel.getAttendanceStats(context.params.userId)
  return NextResponse.json({
    success: true,
    stats,
  })
}

export const GET = withAuthorization(getStatsHandler, ["admin", "self"])
