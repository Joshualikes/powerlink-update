import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`
      SELECT * FROM applications WHERE id = ${Number.parseInt(params.id)}
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    }

    const app = result[0]
    return NextResponse.json({
      success: true,
      data: {
        id: app.id.toString(),
        accountNumber: app.account_number,
        fullName: app.full_name,
        address: app.address,
        contactNumber: app.contact_number,
        email: app.email,
        serviceType: app.service_type,
        status: app.status,
        dateSubmitted: app.date_submitted,
        dateProcessed: app.date_processed,
        processedBy: "admin",
        notes: app.notes,
      },
    })
  } catch (error) {
    console.error("[v0] Failed to fetch application:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch application" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status, notes } = body

    if (!["approved", "declined", "pending"].includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 })
    }

    let accountNumber = null

    if (status === "approved") {
      const accountResult = await sql`
        SELECT account_number FROM account_numbers 
        WHERE is_assigned = FALSE 
        LIMIT 1
      `

      if (accountResult.length > 0) {
        accountNumber = accountResult[0].account_number

        // Mark account number as assigned
        await sql`
          UPDATE account_numbers 
          SET is_assigned = TRUE, assigned_at = NOW()
          WHERE account_number = ${accountNumber}
        `
      }
    }

    const result = await sql`
      UPDATE applications
      SET 
        status = ${status},
        account_number = ${accountNumber},
        date_processed = NOW(),
        processed_by = 1,
        notes = ${notes || null}
      WHERE id = ${Number.parseInt(params.id)}
      RETURNING id, account_number, full_name, email
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      accountNumber: result[0].account_number,
      data: result[0],
    })
  } catch (error) {
    console.error("[v0] Error updating application:", error)
    return NextResponse.json({ success: false, error: "Failed to update application" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await sql`
      DELETE FROM applications 
      WHERE id = ${Number.parseInt(params.id)}
      RETURNING id
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Application deleted successfully",
    })
  } catch (error) {
    console.error("[v0] Error deleting application:", error)
    return NextResponse.json({ success: false, error: "Failed to delete application" }, { status: 500 })
  }
}
