// <CHANGE> Updated upload API to handle document storage with mock URLs
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Validate file type (images or PDF only)
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: "Only images and PDF files are allowed" },
        { status: 400 },
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ success: false, error: "File size exceeds 5MB limit" }, { status: 400 })
    }

    // Generate a unique filename with timestamp and random string
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const extension = file.name.split(".").pop()
    const uniqueFilename = `${timestamp}-${random}.${extension}`

    // Store URL (in production, this would be an actual cloud storage URL)
    const fileUrl = `/uploads/${uniqueFilename}`

    return NextResponse.json({
      success: true,
      data: {
        url: fileUrl,
        filename: file.name,
        size: file.size,
        type: file.type,
      },
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ success: false, error: "Failed to upload file" }, { status: 500 })
  }
}
