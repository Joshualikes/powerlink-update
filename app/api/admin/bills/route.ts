import { type NextRequest, NextResponse } from "next/server"
import { mockDataStore } from "@/lib/mock-data-store"

export async function GET() {
  try {
    const bills = mockDataStore.getBills()

    const formattedBills = bills.map((bill) => ({
      id: bill.id,
      billNumber: bill.bill_number,
      consumerId: bill.consumer_id,
      consumerName: bill.consumer_name,
      period: bill.period,
      kwhUsed: bill.kwh_used,
      amount: bill.amount,
      status: bill.status,
      dueDate: bill.due_date,
      createdAt: bill.created_at,
    }))

    return NextResponse.json({
      success: true,
      data: formattedBills,
    })
  } catch (error) {
    console.error("Error fetching bills:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch bills" }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { consumerId, period, kwhUsed, rate, previousReading, currentReading } = await request.json()

    const consumers = mockDataStore.getConsumers()
    const consumer = consumers.find((c) => c.id === consumerId)

    if (!consumer) {
      return NextResponse.json({ success: false, error: "Consumer not found" }, { status: 404 })
    }

    const calculatedKwh = currentReading && previousReading ? currentReading - previousReading : kwhUsed

    const now = new Date()
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 5)
    const dueDate = nextMonth.toISOString().split("T")[0]

    const newBill = mockDataStore.addBill({
      consumer_id: consumerId,
      consumer_name: consumer.name,
      period,
      kwh_used: calculatedKwh,
      amount: calculatedKwh * rate,
      status: "Pending",
      due_date: dueDate,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: newBill.id,
        billNumber: newBill.bill_number,
        consumerId: newBill.consumer_id,
        consumerName: newBill.consumer_name,
        period: newBill.period,
        kwhUsed: newBill.kwh_used,
        amount: newBill.amount,
        status: newBill.status,
        dueDate: newBill.due_date,
        createdAt: newBill.created_at,
      },
    })
  } catch (error) {
    console.error("Error creating bill:", error)
    return NextResponse.json({ success: false, error: "Failed to create bill" }, { status: 200 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    const updatedBill = mockDataStore.updateBill(id, { status })

    if (!updatedBill) {
      return NextResponse.json({ success: false, error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedBill.id,
        status: updatedBill.status,
      },
    })
  } catch (error) {
    console.error("Error updating bill:", error)
    return NextResponse.json({ success: false, error: "Failed to update bill" }, { status: 200 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, error: "Bill ID is required" }, { status: 400 })
    }

    const success = mockDataStore.deleteBill(id)

    if (!success) {
      return NextResponse.json({ success: false, error: "Bill not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id,
      },
    })
  } catch (error) {
    console.error("Error deleting bill:", error)
    return NextResponse.json({ success: false, error: "Failed to delete bill" }, { status: 200 })
  }
}
