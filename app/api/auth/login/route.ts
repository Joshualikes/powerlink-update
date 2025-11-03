import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error("[v0] Failed to parse request body:", parseError)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { identifier, password, loginType } = body

    if (!identifier || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 })
    }

    let expectedRole: "admin" | "consumer" | undefined
    if (loginType === "admin") {
      expectedRole = "admin"
    } else if (loginType === "consumer") {
      expectedRole = "consumer"
    }

    let user
    try {
      user = await authenticateUser({ identifier, password }, expectedRole)
    } catch (authError) {
      console.error("[v0] Authentication error:", authError)
      return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
    }

    if (!user) {
      if (expectedRole === "admin") {
        return NextResponse.json({ error: "Access denied: Please use the correct login page." }, { status: 401 })
      } else if (expectedRole === "consumer") {
        return NextResponse.json({ error: "Access denied: Please use the correct login page." }, { status: 401 })
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = `mock_${user.role}_token_${Date.now()}`

    return NextResponse.json({
      success: true,
      user,
      token,
    })
  } catch (error) {
    console.error("[v0] Login route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
