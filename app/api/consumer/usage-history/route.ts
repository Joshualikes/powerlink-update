import { NextResponse } from "next/server"

// Mock usage history data - replace with real database queries when integrated
const generateUsageHistory = (accountNumber: string) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const currentMonth = new Date().getMonth()
  const usageData = []

  // Generate 6 months of usage data
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12
    const month = months[monthIndex]
    const year = currentMonth - i < 0 ? 2024 : 2025

    // Generate realistic usage data (50-120 kWh)
    const usage = Math.floor(Math.random() * 70) + 50
    const rate = 12.5
    const amount = usage * rate

    usageData.push({
      month: `${month} ${year}`,
      usage,
      amount: Number.parseFloat(amount.toFixed(2)),
      avgTemp: Math.floor(Math.random() * 10) + 25, // 25-35°C
    })
  }

  return usageData
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const accountNumber = searchParams.get("account") || "C001"

    const usageHistory = generateUsageHistory(accountNumber)

    return NextResponse.json(usageHistory)
  } catch (error) {
    console.error("Error fetching usage history:", error)
    return NextResponse.json({ error: "Failed to fetch usage history" }, { status: 500 })
  }
}
