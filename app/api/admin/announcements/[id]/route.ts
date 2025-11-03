import { type NextRequest, NextResponse } from "next/server"
import { mockDataStore } from "@/lib/mock-data-store"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { title, message, type, is_active } = body

    if (!title || !message || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const updatedAnnouncement = mockDataStore.updateAnnouncement(id, {
      title,
      message,
      type,
      is_active: is_active ?? true,
    })

    if (!updatedAnnouncement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    return NextResponse.json(updatedAnnouncement)
  } catch (error) {
    console.error("Failed to update announcement:", error)
    return NextResponse.json({ error: "Failed to update announcement" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    const success = mockDataStore.deleteAnnouncement(id)

    if (!success) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Announcement deleted successfully" })
  } catch (error) {
    console.error("Failed to delete announcement:", error)
    return NextResponse.json({ error: "Failed to delete announcement" }, { status: 500 })
  }
}
