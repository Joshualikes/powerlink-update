import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("transactionId")
    const consumerEmail = searchParams.get("email")

    if (!transactionId || !consumerEmail) {
      return Response.json({ success: false, message: "Missing required parameters" }, { status: 400 })
    }

    // Get payment details
    const payments = await sql`
      SELECT p.*, b.bill_number, b.amount_due, c.email
      FROM payments p
      JOIN bills b ON p.bill_id = b.id
      JOIN consumers c ON p.consumer_id = c.id
      WHERE p.payment_reference = ${transactionId} AND c.email = ${consumerEmail}
    `

    if (payments.length === 0) {
      return Response.json({ success: false, message: "Payment not found" }, { status: 404 })
    }

    const payment = payments[0]

    return Response.json({
      success: true,
      payment: {
        id: payment.id,
        transactionId: payment.payment_reference,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.payment_method,
        billNumber: payment.bill_number,
        createdAt: payment.created_at,
        paidAt: payment.paid_at,
      },
    })
  } catch (error) {
    console.error("[v0] Payment status error:", error)
    return Response.json({ success: false, message: "Failed to fetch payment status" }, { status: 500 })
  }
}
