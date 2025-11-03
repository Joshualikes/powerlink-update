import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return Response.json({ success: false, message: "Missing email parameter" }, { status: 400 })
    }

    // Get all payments for the consumer
    const payments = await sql`
      SELECT p.*, b.bill_number
      FROM payments p
      JOIN bills b ON p.bill_id = b.id
      JOIN consumers c ON p.consumer_id = c.id
      WHERE c.email = ${email}
      ORDER BY p.created_at DESC
    `

    return Response.json({
      success: true,
      payments: payments.map((p) => ({
        id: p.id,
        transactionId: p.payment_reference,
        amount: p.amount,
        status: p.status,
        paymentMethod: p.payment_method,
        billNumber: p.bill_number,
        createdAt: p.created_at,
      })),
    })
  } catch (error) {
    console.error("[v0] Payment history error:", error)
    return Response.json({ success: false, message: "Failed to fetch payment history" }, { status: 500 })
  }
}
