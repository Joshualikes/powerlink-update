import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_NEON_DATABASE_URL!)

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    const accountNumber = request.headers.get("X-Account-Number")

    if (!token || !accountNumber) {
      return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    try {
      // Get current and previous meter readings
      const readings = await sql`
        SELECT meter_reading, reading_date 
        FROM meter_readings 
        WHERE consumer_id = (SELECT id FROM consumers WHERE account_number = ${accountNumber})
        ORDER BY reading_date DESC 
        LIMIT 2
      `

      if (readings.length >= 2) {
        const currentReading = readings[0].meter_reading
        const previousReading = readings[1].meter_reading
        const kwhUsed = currentReading - previousReading
        const ratePerKwh = 12.5
        const totalAmountDue = kwhUsed * ratePerKwh

        return Response.json({
          success: true,
          data: {
            currentReading,
            previousReading,
            kwhUsed,
            ratePerKwh,
            totalAmountDue,
          },
        })
      }

      // Fallback if less than 2 readings exist
      const latestReading = readings[0]?.meter_reading || 0
      return Response.json({
        success: true,
        data: {
          currentReading: latestReading,
          previousReading: 0,
          kwhUsed: latestReading,
          ratePerKwh: 12.5,
          totalAmountDue: latestReading * 12.5,
        },
      })
    } catch (dbError) {
      // If meter_readings table doesn't exist or other DB error, return default values
      console.error("[v0] Database error:", dbError)
      return Response.json({
        success: true,
        data: {
          currentReading: 0,
          previousReading: 0,
          kwhUsed: 0,
          ratePerKwh: 12.5,
          totalAmountDue: 0,
        },
      })
    }
  } catch (error) {
    console.error("[v0] Receipt data fetch error:", error)
    return Response.json({ success: false, message: "Failed to fetch receipt data" }, { status: 500 })
  }
}
