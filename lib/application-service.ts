import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_DATABASE_URL!)

export interface ApplicationStatus {
  isApproved: boolean
  accountNumber: string | null
  applicationId: string | null
  fullName: string | null
  email: string | null
  status: "pending" | "approved" | "declined"
}

export async function checkAccountNumberApproval(accountNumber: string): Promise<ApplicationStatus> {
  try {
    const result = await sql`
      SELECT 
        id,
        application_id,
        account_number,
        full_name,
        email,
        status
      FROM powerlink.applications 
      WHERE account_number = ${accountNumber}
      LIMIT 1
    `

    if (result.length === 0) {
      return {
        isApproved: false,
        accountNumber: null,
        applicationId: null,
        fullName: null,
        email: null,
        status: "pending",
      }
    }

    const app = result[0]
    return {
      isApproved: app.status === "approved",
      accountNumber: app.account_number,
      applicationId: app.application_id,
      fullName: app.full_name,
      email: app.email,
      status: app.status as "pending" | "approved" | "declined",
    }
  } catch (error) {
    console.error("[v0] Error checking account number approval:", error)
    return {
      isApproved: false,
      accountNumber: null,
      applicationId: null,
      fullName: null,
      email: null,
      status: "pending",
    }
  }
}

export async function submitApplication(data: {
  fullName: string
  email: string
  phoneNumber: string
  address: string
  serviceType: string
}) {
  try {
    const applicationId = `APP${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`

    const result = await sql`
      INSERT INTO powerlink.applications (
        application_id,
        full_name,
        email,
        phone_number,
        address,
        service_type,
        status,
        date_submitted
      )
      VALUES (
        ${applicationId},
        ${data.fullName},
        ${data.email},
        ${data.phoneNumber},
        ${data.address},
        ${data.serviceType},
        'pending',
        NOW()
      )
      RETURNING id, application_id, email, full_name
    `

    return {
      success: true,
      applicationId: result[0].application_id,
      message: "Application submitted successfully. You will be notified once it is reviewed.",
    }
  } catch (error) {
    console.error("[v0] Error submitting application:", error)
    return {
      success: false,
      message: "Failed to submit application. Please try again.",
    }
  }
}

export async function approveApplication(
  applicationId: string,
  adminId: number,
  notes?: string,
): Promise<{ success: boolean; accountNumber?: string; message: string }> {
  try {
    // Generate account number
    const accountNumber = `C${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`

    const result = await sql`
      UPDATE powerlink.applications
      SET 
        status = 'approved',
        account_number = ${accountNumber},
        date_processed = NOW(),
        processed_by = ${adminId},
        notes = ${notes || null}
      WHERE application_id = ${applicationId}
      RETURNING account_number, full_name, email
    `

    if (result.length === 0) {
      return { success: false, message: "Application not found" }
    }

    return {
      success: true,
      accountNumber: result[0].account_number,
      message: `Application approved. Account number: ${result[0].account_number}`,
    }
  } catch (error) {
    console.error("[v0] Error approving application:", error)
    return { success: false, message: "Failed to approve application" }
  }
}

export async function declineApplication(applicationId: string, adminId: number, notes: string) {
  try {
    await sql`
      UPDATE powerlink.applications
      SET 
        status = 'declined',
        date_processed = NOW(),
        processed_by = ${adminId},
        notes = ${notes}
      WHERE application_id = ${applicationId}
    `

    return { success: true, message: "Application declined" }
  } catch (error) {
    console.error("[v0] Error declining application:", error)
    return { success: false, message: "Failed to decline application" }
  }
}

export async function getAllApplications(status?: string) {
  try {
    let query = `
      SELECT 
        a.id,
        a.application_id,
        a.account_number,
        a.full_name,
        a.email,
        a.phone_number,
        a.address,
        a.service_type,
        a.status,
        a.date_submitted,
        a.date_processed,
        a.notes,
        admin.full_name as processed_by_name
      FROM powerlink.applications a
      LEFT JOIN powerlink.admins admin ON a.processed_by = admin.id
    `

    if (status) {
      query += ` WHERE a.status = '${status}'`
    }

    query += ` ORDER BY a.date_submitted DESC`

    const result = await sql.query(query)
    return result
  } catch (error) {
    console.error("[v0] Error fetching applications:", error)
    return []
  }
}
