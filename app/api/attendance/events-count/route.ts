import { AttendanceModel } from "@/lib/models/Attendance";
import { withAuthorization } from "@/withAuthorization";
import { type NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest) {
  try {
    const result = await AttendanceModel.getTotalEventsCount();
    if (result.success) {
      return NextResponse.json({ success: true, count: result.count });
    }
    return NextResponse.json({ success: false, error: result.error }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export const GET = withAuthorization(handler, ["admin"]);
