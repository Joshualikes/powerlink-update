import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionId = searchParams.get("transactionId")

    if (!transactionId) {
      return Response.json({ success: false, message: "Missing transaction ID" }, { status: 400 })
    }

    // Get payment and bill details
    const payments = await sql`
      SELECT p.*, b.bill_number, b.amount_due, b.billing_period_start, b.billing_period_end,
             c.full_name, c.account_number, c.email, c.address
      FROM payments p
      JOIN bills b ON p.bill_id = b.id
      JOIN consumers c ON p.consumer_id = c.id
      WHERE p.payment_reference = ${transactionId}
    `

    if (payments.length === 0) {
      return Response.json({ success: false, message: "Payment not found" }, { status: 404 })
    }

    const payment = payments[0]

    // Generate simple HTML receipt (in production, use a library like puppeteer or pdfkit)
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payment Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #0066cc; margin: 0; }
          .section { margin-bottom: 20px; }
          .section-title { font-weight: bold; border-bottom: 2px solid #0066cc; padding-bottom: 5px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; }
          .label { color: #666; }
          .amount { font-size: 24px; font-weight: bold; color: #0066cc; text-align: right; }
          .footer { text-align: center; margin-top: 40px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PowerLink BAPA</h1>
          <p>Payment Receipt</p>
        </div>

        <div class="section">
          <div class="section-title">Consumer Information</div>
          <div class="row">
            <span class="label">Name:</span>
            <span>${payment.full_name}</span>
          </div>
          <div class="row">
            <span class="label">Account Number:</span>
            <span>${payment.account_number}</span>
          </div>
          <div class="row">
            <span class="label">Email:</span>
            <span>${payment.email}</span>
          </div>
          <div class="row">
            <span class="label">Address:</span>
            <span>${payment.address}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Payment Details</div>
          <div class="row">
            <span class="label">Transaction ID:</span>
            <span>${payment.payment_reference}</span>
          </div>
          <div class="row">
            <span class="label">Bill Number:</span>
            <span>${payment.bill_number}</span>
          </div>
          <div class="row">
            <span class="label">Payment Method:</span>
            <span>${payment.payment_method.toUpperCase()}</span>
          </div>
          <div class="row">
            <span class="label">Status:</span>
            <span>${payment.status.toUpperCase()}</span>
          </div>
          <div class="row">
            <span class="label">Date:</span>
            <span>${new Date(payment.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Billing Period</div>
          <div class="row">
            <span class="label">From:</span>
            <span>${new Date(payment.billing_period_start).toLocaleDateString()}</span>
          </div>
          <div class="row">
            <span class="label">To:</span>
            <span>${new Date(payment.billing_period_end).toLocaleDateString()}</span>
          </div>
        </div>

        <div class="section">
          <div class="row">
            <span class="label">Amount Paid:</span>
            <span class="amount">₱${Number.parseFloat(payment.amount).toFixed(2)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your payment!</p>
          <p>PowerLink BAPA - Barangay Energy Services</p>
        </div>
      </body>
      </html>
    `

    // Return as downloadable file
    return new Response(htmlContent, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="receipt-${transactionId}.html"`,
      },
    })
  } catch (error) {
    console.error("[v0] Receipt generation error:", error)
    return Response.json({ success: false, message: "Failed to generate receipt" }, { status: 500 })
  }
}
