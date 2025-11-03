import { type NextRequest, NextResponse } from "next/server"
import { mockDataStore } from "@/lib/mock-data-store"

export async function GET() {
  try {
    const announcements = mockDataStore.getAnnouncements()
    return NextResponse.json(announcements)
  } catch (error) {
    console.error("Failed to fetch announcements:", error)
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, message, type, is_active } = body

    if (!title || !message || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newAnnouncement = mockDataStore.addAnnouncement({
      title,
      message,
      type,
      is_active: is_active ?? true,
    })

    return NextResponse.json(newAnnouncement, { status: 201 })
  } catch (error) {
    console.error("Failed to create announcement:", error)
    return NextResponse.json({ error: "Failed to create announcement" }, { status: 500 })
  }
}
