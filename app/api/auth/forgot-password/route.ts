import { type NextRequest, NextResponse } from "next/server"
import { UserModel } from "@/lib/models/User"
import nodemailer from "nodemailer"
import { resetCodes } from "../reset-password/route"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate input
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }
    
    // Email validation
    const isAdminEmail = [
      "admin@smartattend.com", 
      "superadmin@gmail.com",
      "admin1@klu.ac.in",
      "admin2@klu.ac.in",
      "admin3@klu.ac.in",
      "admin4@klu.ac.in",
      "admin@gmail.com"
    ].includes(email)
    const isUserEmail = email.endsWith("@klu.ac.in") || email.endsWith("@gmail.com")

    if (!isAdminEmail && !isUserEmail) {
      return NextResponse.json({ error: "Invalid email domain" }, { status: 400 })
    }

    // Check if user exists
    const userResult = await UserModel.findByEmail(email)
    if (!userResult.success) {
      return NextResponse.json({ error: "Email address not found" }, { status: 404 })
    }

    // 1. Generate a secure verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    // 2. Store the code in the in-memory store with expiration
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
    resetCodes[email] = { code: verificationCode, expires };

    // 3. Configure email transporter
    let transporter;

    // Use a temporary Ethereal account for development if no production email credentials are set
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: testAccount.user, // generated ethereal user
          pass: testAccount.pass, // generated ethereal password
        },
      });
    } else {
      // Use production/configured transport from .env.local
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT || 587),
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }

    const info = await transporter.sendMail({
      from: `"SmartAttend Support" <${process.env.EMAIL_USER || 'support@smartattend.com'}>`,
      to: email,
      subject: "Your Password Reset Code",
      text: `Your password reset verification code is: ${verificationCode}\nThis code will expire in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 600px; margin: auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>We received a request to reset your password for your SmartAttend account.</p>
            <p>Use the following verification code to complete the process:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px; padding: 10px; background-color: #f0f0f0; border-radius: 8px;">
                ${verificationCode}
            </p>
            <p>This code will expire in 10 minutes.</p>
            <p style="color: #888; font-size: 12px;">If you did not request a password reset, please ignore this email.</p>
        </div>
      `,
    });

    // Log the Ethereal URL only in development after the email has been sent
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_HOST) {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("************************************************************");
        console.log("DEVELOPMENT: No EMAIL_HOST in .env, using Ethereal.email for testing.");
        console.log("Preview URL for the last sent email: %s", previewUrl);
        console.log("************************************************************");
    }

    return NextResponse.json({
      success: true,
      message: "A verification code has been sent to your email address.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}