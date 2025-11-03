import { type NextRequest, NextResponse } from "next/server"
import { mockDataStore } from "@/lib/mock-data-store"

export async function POST(request: NextRequest) {
  try {
    const { consumerId, billingPeriodStart, billingPeriodEnd } = await request.json()

    if (!consumerId || !billingPeriodStart || !billingPeriodEnd) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const isDuplicate = mockDataStore.hasDuplicateBill(consumerId, billingPeriodStart, billingPeriodEnd)

    return NextResponse.json({
      success: true,
      isDuplicate,
      data: isDuplicate ? { message: "Bill already exists for this period" } : null,
    })
  } catch (error) {
    console.error("Error checking duplicate bill:", error)
    return NextResponse.json({ success: true, isDuplicate: false, error: "Failed to check duplicate" }, { status: 200 })
  }
}
