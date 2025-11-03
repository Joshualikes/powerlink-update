import { neon } from "@neondatabase/serverless"
import crypto from "crypto"

const sql = neon(process.env.DATABASE_URL!)

// Sandbox payment gateway simulators
const paymentGateways = {
  gcash: async (amount: number, reference: string) => {
    // Simulate GCash payment processing
    // In production, this would call the actual GCash API
    const success = Math.random() > 0.1 // 90% success rate for demo
    return {
      success,
      transactionId: `GCH-${Date.now()}-${reference}`,
      status: success ? "completed" : "failed",
      message: success ? "Payment processed successfully" : "Payment declined",
    }
  },

  paymaya: async (amount: number, reference: string) => {
    // Simulate PayMaya payment processing
    const success = Math.random() > 0.15 // 85% success rate for demo
    return {
      success,
      transactionId: `PMY-${Date.now()}-${reference}`,
      status: success ? "completed" : "failed",
      message: success ? "Payment processed successfully" : "Card declined",
    }
  },

  bank_transfer: async (amount: number, reference: string) => {
    // Simulate Bank Transfer - typically pending
    return {
      success: true,
      transactionId: `BNK-${Date.now()}-${reference}`,
      status: "pending",
      message: "Bank transfer initiated. Please complete the transfer within 24 hours.",
    }
  },
}

export async function POST(request: Request) {
  try {
    const { billId, amount, paymentMethod, consumerEmail } = await request.json()

    // Validate input
    if (!billId || !amount || !paymentMethod || !consumerEmail) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Validate payment method
    if (!Object.keys(paymentGateways).includes(paymentMethod)) {
      return Response.json({ success: false, message: "Invalid payment method" }, { status: 400 })
    }

    // Get bill details
    const bills = await sql`
      SELECT b.*, c.id as consumer_id FROM bills b
      JOIN consumers c ON b.consumer_id = c.id
      WHERE b.id = ${billId} AND c.email = ${consumerEmail}
    `

    if (bills.length === 0) {
      return Response.json({ success: false, message: "Bill not found" }, { status: 404 })
    }

    const bill = bills[0]

    // Process payment through sandbox gateway
    const reference = crypto.randomBytes(8).toString("hex")
    const gatewayResponse = await paymentGateways[paymentMethod as keyof typeof paymentGateways](amount, reference)

    // Create payment record
    const payments = await sql`
      INSERT INTO payments (
        bill_id,
        consumer_id,
        amount,
        payment_method,
        payment_reference,
        status,
        created_at
      ) VALUES (
        ${billId},
        ${bill.consumer_id},
        ${amount},
        ${paymentMethod},
        ${gatewayResponse.transactionId},
        ${gatewayResponse.status},
        NOW()
      )
      RETURNING *
    `

    const payment = payments[0]

    // Update bill status if payment is successful
    if (gatewayResponse.status === "completed") {
      await sql`
        UPDATE bills
        SET status = 'paid', paid_at = NOW()
        WHERE id = ${billId}
      `
    }

    return Response.json({
      success: gatewayResponse.success,
      transactionId: gatewayResponse.transactionId,
      paymentId: payment.id,
      status: gatewayResponse.status,
      message: gatewayResponse.message,
      amount,
      paymentMethod,
    })
  } catch (error) {
    console.error("[v0] Payment processing error:", error)
    return Response.json({ success: false, message: "Payment processing failed" }, { status: 500 })
  }
}
