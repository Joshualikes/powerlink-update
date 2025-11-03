import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { getMockConsumers } from "@/lib/mock-data-store"

// Simple hash function for demonstration. In production, use bcrypt
async function hashPassword(password: string): Promise<string> {
  // Using Web Crypto API for hashing
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}

export async function GET() {
  try {
    try {
      const consumers = await sql`
        SELECT 
          c.*,
          COALESCE(b.amount_due, 0) as last_bill_amount,
          b.due_date as last_bill_due_date,
          b.status as last_bill_status
        FROM consumers c
        LEFT JOIN bills b ON c.id = b.consumer_id 
        AND b.id = (
          SELECT id FROM bills 
          WHERE consumer_id = c.id 
          ORDER BY created_at DESC 
          LIMIT 1
        )
        ORDER BY c.created_at DESC
      `

      const formattedConsumers = consumers.map((consumer: any) => ({
        id: consumer.id.toString(),
        accountNumber: consumer.account_number,
        fullName: consumer.full_name,
        email: consumer.email,
        address: consumer.address,
        contactNumber: consumer.contact_number,
        status: consumer.status,
        serviceType: consumer.service_type,
        meterNumber: consumer.meter_number,
        connectionDate: consumer.connection_date,
        lastBillAmount: consumer.last_bill_amount,
        lastBillStatus: consumer.last_bill_status,
      }))

      return NextResponse.json({
        success: true,
        data: formattedConsumers,
      })
    } catch (dbError) {
      console.log("[v0] Database query failed, falling back to mock data:", dbError)
      const mockConsumers = getMockConsumers()
      return NextResponse.json({
        success: true,
        data: mockConsumers,
        source: "mock",
      })
    }
  } catch (error) {
    console.error("Error fetching consumers:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch consumers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Received consumer data:", body)

    const { fullName, email, address, contactNumber, serviceType, meterNumber, password } = body

    if (!fullName || !email || !address || !contactNumber || !password) {
      console.log("[v0] Missing required fields:", {
        fullName: !!fullName,
        email: !!email,
        address: !!address,
        contactNumber: !!contactNumber,
        password: !!password,
      })
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields. Please fill in all fields.",
        },
        { status: 400 },
      )
    }

    const existingConsumer = await sql`
      SELECT id FROM consumers WHERE email = ${email} LIMIT 1
    `

    if (existingConsumer.length > 0) {
      console.log("[v0] Email already exists:", email)
      return NextResponse.json(
        {
          success: false,
          error: "Email already exists. Please use a different email.",
        },
        { status: 400 },
      )
    }

    const accountCount = await sql`SELECT COUNT(*) as count FROM consumers`
    const accountNumber = `ACC${String(Number.parseInt(accountCount[0].count) + 1).padStart(3, "0")}`

    console.log("[v0] Generated account number:", accountNumber)

    // For now, we'll use a basic hash. In production, install bcrypt: npm install bcrypt
    const passwordHash = await hashPassword(password)
    console.log("[v0] Password hashed successfully")

    console.log("[v0] Inserting consumer with data:", {
      accountNumber,
      email,
      fullName,
      address,
      contactNumber,
      serviceType: serviceType || "residential",
      meterNumber,
    })

    const newConsumer = await sql`
      INSERT INTO consumers (
        account_number, email, full_name, address, contact_number, 
        service_type, meter_number, connection_date, password_hash, status
      )
      VALUES (
        ${accountNumber}, ${email}, ${fullName}, ${address}, ${contactNumber},
        ${serviceType || "residential"}, ${meterNumber}, CURRENT_DATE, ${passwordHash}, 'active'
      )
      RETURNING *
    `

    console.log("[v0] Consumer created successfully:", newConsumer[0].id)

    return NextResponse.json({
      success: true,
      data: {
        id: newConsumer[0].id.toString(),
        accountNumber: newConsumer[0].account_number,
        fullName: newConsumer[0].full_name,
        email: newConsumer[0].email,
        address: newConsumer[0].address,
        contactNumber: newConsumer[0].contact_number,
        status: newConsumer[0].status,
        serviceType: newConsumer[0].service_type,
        meterNumber: newConsumer[0].meter_number,
      },
    })
  } catch (error) {
    console.error("[v0] Error creating consumer:", error)
    console.error("[v0] Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json(
      {
        success: false,
        error: `Failed to create consumer: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, fullName, email, address, contactNumber, status, serviceType } = await request.json()

    const updatedConsumer = await sql`
      UPDATE consumers 
      SET 
        full_name = ${fullName},
        email = ${email},
        address = ${address},
        contact_number = ${contactNumber},
        status = ${status},
        service_type = ${serviceType},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (!updatedConsumer.length) {
      return NextResponse.json({ success: false, error: "Consumer not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedConsumer[0].id.toString(),
        accountNumber: updatedConsumer[0].account_number,
        fullName: updatedConsumer[0].full_name,
        email: updatedConsumer[0].email,
        address: updatedConsumer[0].address,
        contactNumber: updatedConsumer[0].contact_number,
        status: updatedConsumer[0].status,
        serviceType: updatedConsumer[0].service_type,
      },
    })
  } catch (error) {
    console.error("Error updating consumer:", error)
    return NextResponse.json({ success: false, error: "Failed to update consumer" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Consumer ID is required" }, { status: 400 })
    }

    const deletedConsumer = await sql`
      DELETE FROM consumers 
      WHERE id = ${id}
      RETURNING *
    `

    if (!deletedConsumer.length) {
      return NextResponse.json({ success: false, error: "Consumer not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: deletedConsumer[0].id.toString(),
        fullName: deletedConsumer[0].full_name,
      },
    })
  } catch (error) {
    console.error("Error deleting consumer:", error)
    return NextResponse.json({ success: false, error: "Failed to delete consumer" }, { status: 500 })
  }
}
