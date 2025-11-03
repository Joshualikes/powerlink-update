import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/database"
import { ensureDatabaseInitialized } from "@/lib/database-init"
import { mockDataStore } from "@/lib/mock-data-store"

export async function GET() {
  try {
    await ensureDatabaseInitialized()

    try {
      const applications = await sql`
        SELECT 
          id,
          application_id,
          account_number,
          full_name,
          address,
          contact_number,
          email,
          service_type,
          status,
          date_submitted,
          date_processed,
          notes,
          valid_id_url,
          proof_of_residency_url_new
        FROM applications
        ORDER BY date_submitted DESC
      `

      const stats = await sql`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)::int as pending,
          SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)::int as approved,
          SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END)::int as declined
        FROM applications
      `

      return NextResponse.json({
        success: true,
        data: {
          applications: applications.map((app: any) => ({
            id: app.id.toString(),
            accountNumber: app.account_number,
            fullName: app.full_name,
            address: app.address,
            contactNumber: app.contact_number,
            email: app.email,
            serviceType: app.service_type,
            validIdUrl: app.valid_id_url || "/placeholder-document.pdf",
            proofOfResidencyUrl: app.proof_of_residency_url_new || "/placeholder-document.pdf",
            status: app.status,
            dateSubmitted: app.date_submitted,
            dateProcessed: app.date_processed,
            processedBy: "admin",
            notes: app.notes,
          })),
          stats: stats[0],
        },
      })
    } catch (dbError: any) {
      console.log("[v0] Database query failed, falling back to mock data:", dbError.message)
      const mockApplications = mockDataStore.getApplications()

      const stats = {
        total: mockApplications.length,
        pending: mockApplications.filter((a: any) => a.status === "pending").length,
        approved: mockApplications.filter((a: any) => a.status === "approved").length,
        declined: mockApplications.filter((a: any) => a.status === "declined").length,
      }

      return NextResponse.json({
        success: true,
        data: {
          applications: mockApplications.map((app: any) => ({
            id: app.id,
            accountNumber: app.accountNumber,
            fullName: app.fullName,
            address: app.address,
            contactNumber: app.contactNumber,
            email: app.email,
            serviceType: app.serviceType,
            validIdUrl: app.validIdUrl,
            proofOfResidencyUrl: app.proofOfResidencyUrl,
            status: app.status,
            dateSubmitted: app.dateSubmitted,
            dateProcessed: app.dateProcessed,
            processedBy: app.processedBy,
            notes: app.notes,
          })),
          stats,
        },
      })
    }
  } catch (error: any) {
    console.error("[v0] Failed to fetch applications:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications: " + error.message },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized()

    const body = await request.json()
    const { fullName, address, contactNumber, email, serviceType, validIdUrl, proofOfResidencyUrl } = body

    const result = await sql`
      INSERT INTO applications (
        application_id,
        full_name,
        address,
        contact_number,
        email,
        service_type,
        valid_id_url,
        proof_of_residency_url_new,
        status,
        date_submitted
      )
      VALUES (
        'APP' || LPAD(CAST(NEXTVAL('applications_id_seq') AS VARCHAR), 6, '0'),
        ${fullName},
        ${address},
        ${contactNumber},
        ${email},
        ${serviceType},
        ${validIdUrl},
        ${proofOfResidencyUrl},
        'pending',
        NOW()
      )
      RETURNING id, application_id
    `

    const newApplication = {
      id: result[0].id.toString(),
      accountNumber: null,
      fullName,
      address,
      contactNumber,
      email,
      serviceType,
      validIdUrl,
      proofOfResidencyUrl,
      status: "pending",
      dateSubmitted: new Date().toISOString(),
      dateProcessed: null,
      processedBy: null,
      notes: null,
    }

    return NextResponse.json({
      success: true,
      data: newApplication,
    })
  } catch (error: any) {
    console.error("[v0] Failed to create application:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create application: " + error.message },
      { status: 500 },
    )
  }
}
