import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Mock billing statistics
    const stats = {
      revenue: { value: 1200000, change: 8.2, trend: "up" },
      generated: { value: 1198, change: 15, trend: "up" },
      unpaid: { value: 85000, change: -5.3, trend: "down" },
      overdue: { value: 47, change: 0, trend: "neutral" },
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Error fetching billing stats:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch billing stats" }, { status: 500 })
  }
}
