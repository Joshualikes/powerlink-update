import { type NextRequest, NextResponse } from "next/server"
import { mockDataStore } from "@/lib/mock-data-store"

export async function POST(request: NextRequest) {
  try {
    const { billId } = await request.json()

    if (!billId) {
      return NextResponse.json({ success: false, message: "Bill ID is required" }, { status: 400 })
    }

    // Get bill from mock store
    const bills = mockDataStore.getBills()
    const bill = bills.find((b) => b.id === billId)

    if (!bill) {
      return NextResponse.json({ success: false, message: "Bill not found" }, { status: 404 })
    }

    // Get consumer details
    const consumers = mockDataStore.getConsumers()
    const consumer = consumers.find((c) => c.id === bill.consumer_id)

    if (!consumer) {
      return NextResponse.json({ success: false, message: "Consumer not found" }, { status: 404 })
    }

    // Get meter readings for this consumer
    const meterReadings = mockDataStore.getMeterReadings(bill.consumer_id)
    const currentReading = meterReadings[0]?.reading_value || 0
    const previousReading = meterReadings[1]?.reading_value || 0

    const receiptData = {
      success: true,
      data: {
        billNumber: bill.bill_number,
        consumerName: bill.consumer_name,
        accountNumber: consumer.meter_no,
        address: consumer.address,
        period: bill.period,
        billingPeriodStart: bill.period.split("-")[0].trim(),
        billingPeriodEnd: bill.period.split("-")[1]?.trim() || "",
        currentReading: currentReading,
        previousReading: previousReading,
        kwhUsed: bill.kwh_used,
        rate: 12.5,
        amount: bill.amount,
        dueDate: bill.due_date,
        status: bill.status,
        createdAt: bill.created_at,
        companyName: "BARANGAY POWER ASSOCIATION",
        contactNumber: "(02) 8123-4567",
        email: "support@powerlink-bapa.com",
        address: "123 Energy St, Barangay Center, City",
      },
    }

    return NextResponse.json(receiptData)
  } catch (error) {
    console.error("Error generating receipt:", error)
    return NextResponse.json({ success: false, message: "Failed to generate receipt" }, { status: 500 })
  }
}
