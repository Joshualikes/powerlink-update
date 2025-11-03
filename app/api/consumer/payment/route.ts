import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bill_id, consumer_id, amount, payment_method, payment_reference } = body

    // Create payment record
    const payment = await sql`
      INSERT INTO payments (
        bill_id, consumer_id, amount, payment_method, payment_reference
      )
      VALUES (
        ${bill_id}, ${consumer_id}, ${amount}, ${payment_method}, ${payment_reference}
      )
      RETURNING *
    `

    // Update bill status to paid
    await sql`
      UPDATE bills 
      SET 
        status = 'paid',
        paid_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${bill_id}
    `

    return NextResponse.json({
      success: true,
      payment: payment[0],
    })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 })
  }
}
