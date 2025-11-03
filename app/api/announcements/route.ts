import { NextResponse } from "next/server"
import { mockDataStore } from "@/lib/mock-data-store"

export async function GET() {
  try {
    const activeAnnouncements = mockDataStore.getAnnouncements().filter((announcement) => announcement.is_active)

    const transformedAnnouncements = activeAnnouncements.map((announcement) => ({
      id: Number.parseInt(announcement.id),
      title: announcement.title,
      content: announcement.message, // Map 'message' to 'content'
      type: mapAnnouncementType(announcement.type), // Transform type values
      priority: "medium", // Default priority since mock data doesn't have this
      status: announcement.is_active ? "active" : "inactive",
      createdAt: announcement.created_at,
      scheduledFor: undefined, // Mock data doesn't have scheduled dates
    }))

    return NextResponse.json(transformedAnnouncements)
  } catch (error) {
    console.error("Failed to fetch public announcements:", error)
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 })
  }
}

function mapAnnouncementType(mockType: string): "outage" | "promotion" | "payment" | "general" {
  switch (mockType) {
    case "warning":
      return "outage"
    case "success":
      return "promotion"
    case "info":
      return "payment"
    case "error":
      return "outage"
    default:
      return "general"
  }
}
