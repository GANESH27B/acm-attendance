import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
import {
  withAuthorization,
  type AuthorizedHandler,
} from "@/withAuthorization"

const mapUserToFrontend = (user: any) => ({
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
  isActive: Boolean(user.is_active),
  lastLogin: user.last_login,
  acmMember: Boolean(user.acm_member),
  acmRole: user.acm_role,
  year: user.year,
  section: user.section,
})

const getAllUsersHandler: AuthorizedHandler = async (request, context) => {
  const result = await UserModel.findAll()
  if (result.success) {
    const frontendUsers = result.data?.map(mapUserToFrontend) || []

    return NextResponse.json({
      success: true,
      users: frontendUsers,
    })
  }
  return NextResponse.json({ error: result.error || "Failed to fetch users" }, { status: 500 })
}

export const GET = withAuthorization(getAllUsersHandler, ["admin"])