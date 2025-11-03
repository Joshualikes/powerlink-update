import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_DATABASE_URL!)

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Decode token to get consumer email (simplified - in production use proper JWT verification)
    const consumerEmail = Buffer.from(token, "base64").toString("utf-8")

    // Get bill and consumer details
    const bills = await sql`
      SELECT b.*, c.email, c.full_name, c.account_number
      FROM bills b
      JOIN consumers c ON b.consumer_id = c.id
      WHERE b.id = ${Number.parseInt(params.id)} AND c.email = ${consumerEmail}
    `

    if (bills.length === 0) {
      return Response.json({ success: false, message: "Bill not found" }, { status: 404 })
    }

    const bill = bills[0]

    return Response.json({
      success: true,
      bill: {
        id: bill.id,
        billNumber: bill.bill_number,
        billingPeriodStart: bill.billing_period_start,
        billingPeriodEnd: bill.billing_period_end,
        kwhUsed: bill.kwh_used,
        ratePerKwh: bill.rate_per_kwh,
        amountDue: bill.amount_due,
        dueDate: bill.due_date,
        status: bill.status,
        paidAt: bill.paid_at,
      },
      consumer: {
        email: bill.email,
        fullName: bill.full_name,
        accountNumber: bill.account_number,
      },
    })
  } catch (error) {
    console.error("[v0] Bill fetch error:", error)
    return Response.json({ success: false, message: "Failed to fetch bill" }, { status: 500 })
  }
}
