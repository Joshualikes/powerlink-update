import { type NextRequest, NextResponse } from "next/server"
import { requestPasswordReset, verifyResetCode, resetPassword } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { action, email, code, newPassword } = await request.json()

    switch (action) {
      case "request": {
        if (!email) {
          return NextResponse.json({ error: "Email is required" }, { status: 400 })
        }

        const result = await requestPasswordReset(email)
        return NextResponse.json(result)
      }

      case "verify": {
        if (!email || !code) {
          return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
        }

        const isValid = await verifyResetCode(email, code)
        return NextResponse.json({ success: isValid })
      }

      case "reset": {
        if (!email || !newPassword) {
          return NextResponse.json({ error: "Email and new password are required" }, { status: 400 })
        }

        if (newPassword.length < 8) {
          return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
        }

        const result = await resetPassword(email, newPassword)
        return NextResponse.json(result)
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
