import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountNumber = searchParams.get("accountNumber")

    if (!accountNumber) {
      return NextResponse.json(
        {
          success: false,
          status: { message: "Account number is required", isValid: false, isApproved: false, status: "invalid" },
        },
        { status: 400 },
      )
    }

    try {
      const { validateAccountNumber } = await import("@/lib/account-validation")
      const result = await validateAccountNumber(accountNumber)

      return NextResponse.json({
        success: result.isValid,
        status: {
          isApproved: result.isApproved,
          isValid: result.isValid,
          exists: result.exists,
          isAssigned: result.isAssigned,
          accountNumber: result.accountNumber,
          applicationId: result.applicationId,
          fullName: result.fullName,
          email: result.email,
          status: result.status,
          message: result.message,
        },
      })
    } catch (innerError: any) {
      console.error("[v0] Inner error in account validation:", innerError)
      return NextResponse.json(
        {
          success: false,
          status: {
            isValid: false,
            isApproved: false,
            status: "invalid",
            message: "Failed to validate account number. Database connection error. Please try again later.",
          },
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("[v0] Error checking account status:", error)
    return NextResponse.json(
      {
        success: false,
        status: {
          isValid: false,
          isApproved: false,
          status: "invalid",
          message: "Internal server error. Please try again later.",
        },
      },
      { status: 500 },
    )
  }
}
