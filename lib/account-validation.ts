import { neon } from "@neondatabase/serverless"
import { ensureDatabaseInitialized } from "./database-init"

const sql = neon(process.env.NEON_DATABASE_URL!)

export interface AccountValidationResult {
  isValid: boolean
  exists: boolean
  isAssigned: boolean
  isApproved: boolean
  accountNumber: string | null
  applicationId: string | null
  fullName: string | null
  email: string | null
  status: "pending" | "approved" | "declined" | "invalid"
  message: string
}

export async function validateAccountNumber(accountNumber: string): Promise<AccountValidationResult> {
  try {
    try {
      await ensureDatabaseInitialized()
    } catch (initError) {
      console.error("[v0] Database init failed:", initError)
      // Continue anyway - the table might already exist
    }

    // First check if account number is in valid range (C001-C160)
    const validPattern = /^C\d{3}$/
    if (!validPattern.test(accountNumber.toUpperCase())) {
      return {
        isValid: false,
        exists: false,
        isAssigned: false,
        isApproved: false,
        accountNumber: null,
        applicationId: null,
        fullName: null,
        email: null,
        status: "invalid",
        message: "Invalid account number format. Must be C001 to C160.",
      }
    }

    const upperAccountNumber = accountNumber.toUpperCase()

    let accountPoolResult
    try {
      accountPoolResult = await sql`
        SELECT id, is_assigned FROM account_numbers 
        WHERE account_number = ${upperAccountNumber}
      `
    } catch (poolError: any) {
      console.error("[v0] Error querying account pool:", poolError)
      return {
        isValid: false,
        exists: false,
        isAssigned: false,
        isApproved: false,
        accountNumber,
        applicationId: null,
        fullName: null,
        email: null,
        status: "invalid",
        message: "Unable to verify account number at this time. Please try again later.",
      }
    }

    if (!accountPoolResult || accountPoolResult.length === 0) {
      return {
        isValid: false,
        exists: false,
        isAssigned: false,
        isApproved: false,
        accountNumber,
        applicationId: null,
        fullName: null,
        email: null,
        status: "invalid",
        message: "This account number does not exist in the system (C001-C160).",
      }
    }

    const poolAccount = accountPoolResult[0]

    let applicationResult
    try {
      applicationResult = await sql`
        SELECT 
          id,
          application_id,
          account_number,
          full_name,
          email,
          status
        FROM applications 
        WHERE account_number = ${upperAccountNumber}
        LIMIT 1
      `
    } catch (appError: any) {
      console.error("[v0] Error querying applications:", appError)
      return {
        isValid: false,
        exists: true,
        isAssigned: poolAccount.is_assigned,
        isApproved: false,
        accountNumber,
        applicationId: null,
        fullName: null,
        email: null,
        status: "pending",
        message: "Unable to retrieve application status. Please try again later.",
      }
    }

    if (!applicationResult || applicationResult.length === 0) {
      return {
        isValid: false,
        exists: true,
        isAssigned: poolAccount.is_assigned,
        isApproved: false,
        accountNumber,
        applicationId: null,
        fullName: null,
        email: null,
        status: "pending",
        message: "This account number has not been assigned to any application yet. Contact administrator.",
      }
    }

    const app = applicationResult[0]

    return {
      isValid: app.status === "approved",
      exists: true,
      isAssigned: poolAccount.is_assigned,
      isApproved: app.status === "approved",
      accountNumber: app.account_number,
      applicationId: app.application_id,
      fullName: app.full_name,
      email: app.email,
      status: app.status as "pending" | "approved" | "declined",
      message:
        app.status === "approved"
          ? "Account number verified and approved. You can now create your account."
          : app.status === "declined"
            ? "This application has been declined. Please submit a new application."
            : "Your application is still being reviewed. Please try again later.",
    }
  } catch (error: any) {
    console.error("[v0] Account validation error:", error)
    return {
      isValid: false,
      exists: false,
      isAssigned: false,
      isApproved: false,
      accountNumber: null,
      applicationId: null,
      fullName: null,
      email: null,
      status: "invalid",
      message: "Failed to validate account number. Please try again later.",
    }
  }
}

export async function isAccountNumberInRange(accountNumber: string): boolean {
  try {
    await ensureDatabaseInitialized()
    const result = await sql`
      SELECT EXISTS(
        SELECT 1 FROM account_numbers 
        WHERE account_number = ${accountNumber.toUpperCase()}
      ) as exists
    `
    return result[0]?.exists || false
  } catch (error) {
    console.error("[v0] Error checking account number range:", error)
    return false
  }
}

export async function getAccountNumberFormat(): string {
  return "C001 to C160"
}
