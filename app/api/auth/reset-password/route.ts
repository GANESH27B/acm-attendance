import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
import bcrypt from "bcryptjs"

// In-memory store for reset codes. In production, use a database or a more persistent cache like Redis.
export const resetCodes: { [email: string]: { code: string; expires: number } } = {}

export async function POST(request: NextRequest) {
  try {
    const { email, code, newPassword } = await request.json()

    // 1. Validate input
    if (!email || !code || !newPassword) {
      return NextResponse.json({ error: "Email, code, and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // 2. Verify the reset code
    const stored = resetCodes[email]
    if (!stored || stored.code !== code) {
      return NextResponse.json({ error: "Invalid or incorrect verification code" }, { status: 400 })
    }

    // 3. Check for expiration
    if (Date.now() > stored.expires) {
      delete resetCodes[email] // Clean up expired code
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 })
    }

    // 4. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 5. Update the user's password in the database
    const updateResult = await UserModel.updatePassword(email, hashedPassword)

    if (!updateResult.success) {
      return NextResponse.json({ error: updateResult.error || "Failed to update password" }, { status: 500 })
    }

    // 6. Clean up the used code
    delete resetCodes[email]

    return NextResponse.json({ success: true, message: "Password has been reset successfully." })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}