import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { ensureDatabaseInitialized } from "@/lib/database-init"

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized()
    const data = await request.json()

    const { accountNumber, fullName, email, phone, password, validIdUrl, proofOfResidencyUrl } = data

    if (!accountNumber || !fullName || !email || !phone || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    try {
      const result = await sql`
        INSERT INTO applications (
          full_name,
          contact_number,
          email,
          status,
          date_submitted,
          valid_id_url,
          proof_of_residency_url_new,
          service_type,
          address
        )
        VALUES (
          ${fullName},
          ${phone},
          ${email},
          'pending',
          NOW(),
          ${validIdUrl || ""},
          ${proofOfResidencyUrl || ""},
          'residential',
          ''
        )
        RETURNING id
      `

      return NextResponse.json({
        success: true,
        message: "Registration submitted successfully! Your application will be reviewed by our admin team.",
      })
    } catch (dbError: any) {
      console.error("[v0] Database insert error:", dbError)
      return NextResponse.json({ error: "Failed to save application: " + dbError.message }, { status: 400 })
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
