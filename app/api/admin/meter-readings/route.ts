import { type NextRequest, NextResponse } from "next/server"
import { mockDataStore } from "@/lib/mock-data-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const consumerId = searchParams.get("consumerId")

    if (!consumerId) {
      return NextResponse.json({ success: false, error: "Consumer ID is required" }, { status: 400 })
    }

    const meterReadings = mockDataStore.getMeterReadings(consumerId)
    const previousReading = meterReadings.length > 0 ? meterReadings[0] : null

    return NextResponse.json({
      success: true,
      data: previousReading,
    })
  } catch (error) {
    console.error("Error fetching meter readings:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch meter readings", data: null }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { consumerId, readingValue, readingDate } = await request.json()

    if (!consumerId || readingValue === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const newReading = mockDataStore.addMeterReading({
      consumer_id: consumerId,
      reading_value: readingValue,
      reading_date: readingDate || new Date().toISOString().split("T")[0],
    })

    return NextResponse.json({
      success: true,
      data: newReading,
    })
  } catch (error) {
    console.error("Error creating meter reading:", error)
    return NextResponse.json({ success: false, error: "Failed to create meter reading" }, { status: 200 })
  }
}
