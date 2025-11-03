import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const consumerId = searchParams.get("consumerId")

    if (!consumerId) {
      return NextResponse.json({ error: "Consumer ID is required" }, { status: 400 })
    }

    // Get consumer info
    const consumer = await sql`
      SELECT * FROM consumers WHERE id = ${consumerId}
    `

    if (!consumer.length) {
      return NextResponse.json({ error: "Consumer not found" }, { status: 404 })
    }

    // Get current bill
    const currentBill = await sql`
      SELECT * FROM bills 
      WHERE consumer_id = ${consumerId} 
      AND status != 'paid'
      ORDER BY created_at DESC 
      LIMIT 1
    `

    // Get usage history (last 6 months)
    const usageHistory = await sql`
      SELECT 
        kwh_used,
        billing_period_start,
        billing_period_end,
        amount_due
      FROM bills 
      WHERE consumer_id = ${consumerId}
      ORDER BY billing_period_start DESC 
      LIMIT 6
    `

    // Get recent payments
    const recentPayments = await sql`
      SELECT 
        p.*,
        b.bill_number,
        b.billing_period_start,
        b.billing_period_end
      FROM payments p
      JOIN bills b ON p.bill_id = b.id
      WHERE p.consumer_id = ${consumerId}
      ORDER BY p.paid_at DESC 
      LIMIT 5
    `

    // Get active announcements
    const announcements = await sql`
      SELECT * FROM announcements 
      WHERE status = 'active'
      ORDER BY priority DESC, created_at DESC 
      LIMIT 5
    `

    return NextResponse.json({
      consumer: consumer[0],
      currentBill: currentBill[0] || null,
      usageHistory,
      recentPayments,
      announcements,
    })
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
