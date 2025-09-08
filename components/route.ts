import { promises as fs } from "fs"
import path from "path"
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db" // Assuming you have a db utility
import type { User } from "@/lib/auth" // Assuming a User type

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

export async function PUT(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params
  if (!userId) {
    return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
  }

  try {
    const userData: Partial<User> = await request.json()
    const currentUser = await db.getUserById(userId) // Fetch current user to get old image path

    // Check if a new profile image was uploaded (it will be a base64 string)
    if (userData.profileImage && userData.profileImage.startsWith("data:image")) {
      try {
        // A new image is being uploaded, delete the old one first.
        await deleteOldImage(currentUser?.profileImage)

        // 1. Separate the metadata from the base64 data
        const base64Data = userData.profileImage.replace(/^data:image\/\w+;base64,/, "")
        const buffer = Buffer.from(base64Data, "base64")

        // 2. Create a unique filename
        const fileExtension = userData.profileImage.split(";")[0].split("/")[1] || "png"
        const filename = `${userId}-${Date.now()}.${fileExtension}`

        // Ensure the uploads directory exists
        const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")
        await fs.mkdir(uploadDir, { recursive: true })

        const filePath = path.join(uploadDir, filename)

        // 3. Save the file to the server's filesystem
        await fs.writeFile(filePath, buffer)

        // 4. Update the profileImage to the public URL path
        userData.profileImage = `/uploads/avatars/${filename}`
      } catch (error) {
        console.error("Failed to save image:", error)
        return NextResponse.json({ success: false, error: "Failed to process image upload." }, { status: 500 })
      }
    } else if (userData.profileImage === "") {
      // Image is being removed
      await deleteOldImage(currentUser?.profileImage)
      // Set to null in the database to clear the image
      userData.profileImage = null
    }

    // Now, update the user in the database with the final `userData`.
    // If profileImage was not a base64 string and not an empty string, it's left untouched
    // and the existing value in the DB will be preserved by the partial update.
    const updatedUser = await db.updateUser(userId, userData as any)
    if (!updatedUser) {
      return NextResponse.json({ success: false, error: "User not found or update failed." }, { status: 404 })
    }

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error(`[USER_UPDATE_ERROR] userId: ${userId}`, error)
    return NextResponse.json({ success: false, error: "An internal error occurred." }, { status: 500 })
  }
}