import { promises as fs } from "fs"
import path from "path"
import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
import {
  withAuthorization,
  type AuthorizedHandler,
} from "@/withAuthorization"

// Helper to map DB user to Frontend user format
const mapUserToFrontend = (dbUser: any) => ({
  id: dbUser.id,
  fullName: dbUser.full_name,
  email: dbUser.email,
  role: dbUser.role,
  department: dbUser.department,
  profileImage: dbUser.profile_image,
  phone: dbUser.phone,
  address: dbUser.address,
  dateOfBirth: dbUser.date_of_birth,
  studentId: dbUser.student_id,
  registrationNumber: dbUser.registration_number,
  joinDate: dbUser.join_date,
  isActive: dbUser.is_active,
  lastLogin: dbUser.last_login,
  acmMember: dbUser.acm_member,
  acmRole: dbUser.acm_role,
  year: dbUser.year,
  section: dbUser.section,
})

// Helper to map frontend keys to database keys for updates
const mapToDbUpdates = (updates: any): any => {
  const keyMap: { [key: string]: string } = {
    fullName: "full_name",
    email: "email",
    phone: "phone",
    address: "address",
    dateOfBirth: "date_of_birth",
    department: "department",
    profileImage: "profile_image",
    studentId: "student_id",
    registrationNumber: "registration_number",
    acmMember: "acm_member",
    acmRole: "acm_role",
    year: "year",
    section: "section",
    isActive: "is_active",
    role: "role",
  }

  return Object.keys(updates).reduce((acc, key) => {
    if (keyMap[key] !== undefined) {
      acc[keyMap[key]] = updates[key]
    }
    return acc
  }, {} as any)
}

// Helper to safely delete a file from the public/uploads directory
const deleteOldImage = async (imagePath: string | null | undefined) => {
  if (!imagePath || !imagePath.startsWith("/uploads/")) {
    return // Not a managed file, do nothing
  }
  try {
    const fullPath = path.join(process.cwd(), "public", imagePath)
    await fs.unlink(fullPath)
  } catch (error: any) {
    // If file doesn't exist, it's fine. Log other errors.
    if (error.code !== "ENOENT") {
      console.error("Failed to delete old image:", error)
    }
  }
}

// --- Route Handlers ---

const getUserHandler: AuthorizedHandler<{ userId: string }> = async (
  request,
  context
) => {
  const result = await UserModel.findById(context.params.userId)
  if (result.success && result.data) {
    const frontendUser = mapUserToFrontend(result.data)
    return NextResponse.json({ success: true, user: frontendUser })
  }
  return NextResponse.json({ error: "User not found" }, { status: 404 })
}

const updateUserHandler: AuthorizedHandler<{ userId: string }> = async (
  request,
  context
) => {
  const { userId } = context.params
  const contentType = request.headers.get("content-type") || ""
  let updates: Record<string, any> = {}

  try {
    // Use FormData for file uploads, which is more robust, especially for mobile.
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      formData.forEach((value, key) => {
        updates[key] = value
      })
    } else {
      // Fallback to JSON for non-file updates
      updates = await request.json()
    }
  } catch (error) {
    console.error("Failed to parse request body:", error)
    return NextResponse.json(
      { success: false, error: "Invalid request body." },
      { status: 400 }
    )
  }

  // --- Image processing ---
  try {
    const profileImageValue = updates.profileImage
    if (profileImageValue instanceof File && profileImageValue.size > 0) {
      // Handle file upload from FormData
      const currentUserResult = await UserModel.findById(userId)
      await deleteOldImage(currentUserResult.data?.profile_image)

      const buffer = Buffer.from(await profileImageValue.arrayBuffer())
      const fileExtension = path.extname(profileImageValue.name) || ".png"
      const filename = `${userId}-${Date.now()}${fileExtension}`
      const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")
      await fs.mkdir(uploadDir, { recursive: true })
      const filePath = path.join(uploadDir, filename)
      await fs.writeFile(filePath, buffer)
      updates.profileImage = `/uploads/avatars/${filename}`
    } else if (
      typeof profileImageValue === "string" &&
      profileImageValue.startsWith("data:image")
    ) {
      // Handle base64 image upload from JSON
      const currentUserResult = await UserModel.findById(userId)
      await deleteOldImage(currentUserResult.data?.profile_image)

      const base64Data = profileImageValue.replace(/^data:image\/\w+;base64,/, "")
      const buffer = Buffer.from(base64Data, "base64")
      const fileExtension = profileImageValue.split(";")[0].split("/")[1] || "png"
      const filename = `${userId}-${Date.now()}.${fileExtension}`
      const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")
      await fs.mkdir(uploadDir, { recursive: true })
      const filePath = path.join(uploadDir, filename)
      await fs.writeFile(filePath, buffer)
      updates.profileImage = `/uploads/avatars/${filename}`
    } else if (profileImageValue === "") {
      // Handle image removal
      const currentUserResult = await UserModel.findById(userId)
      await deleteOldImage(currentUserResult.data?.profile_image)
      updates.profileImage = null
    }
  } catch (error) {
    console.error("Failed to process image:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process image upload." },
      { status: 500 }
    )
  }

  // Sanitize inputs that might come from FormData as strings
  if (updates.dateOfBirth === "") {
    updates.dateOfBirth = null
  }
  if (typeof updates.acmMember === "string") {
    updates.acmMember = updates.acmMember === "true"
  }
  if (typeof updates.isActive === "string") {
    updates.isActive = updates.isActive === "true"
  }

  const dbUpdates = mapToDbUpdates(updates)

  // Security: Non-admins cannot change their own role or other sensitive fields.
  if (context.decoded.role !== "admin") {
    delete dbUpdates.role
    delete dbUpdates.is_active
  }

  const result = await UserModel.updateById(userId, dbUpdates)
  if (result.success && result.user) {
    const frontendUser = mapUserToFrontend(result.user)
    return NextResponse.json({ success: true, user: frontendUser })
  }
  return NextResponse.json(
    { error: result.error || "Failed to update user" },
    { status: 500 }
  )
}

const deleteUserHandler: AuthorizedHandler<{ userId: string }> = async (
  request,
  context
) => {
  const result = await UserModel.deleteById(context.params.userId)
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  }
  return NextResponse.json(
    { error: result.error || "User not found or failed to delete" },
    { status: 404 }
  )
}

// Export the wrapped handlers
export const GET = withAuthorization(getUserHandler, ["admin", "self"])
export const PATCH = withAuthorization(updateUserHandler, ["admin", "self"])
export const DELETE = withAuthorization(deleteUserHandler, ["admin"])