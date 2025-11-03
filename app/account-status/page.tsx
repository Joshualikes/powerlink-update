"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, CheckCircle, Clock, XCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AccountStatus {
  isApproved: boolean
  accountNumber: string | null
  fullName: string | null
  email: string | null
  status: "pending" | "approved" | "declined"
}

export default function AccountStatusPage() {
  const [accountNumber, setAccountNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`/api/applications/check-status?accountNumber=${accountNumber}`)
      const data = await response.json()

      if (data.success) {
        setAccountStatus(data.status)
      } else {
        setError(data.message || "Account number not found")
        setAccountStatus(null)
      }
    } catch (err) {
      setError("Failed to check account status. Please try again.")
      setAccountStatus(null)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = () => {
    router.push(`/register?account=${accountNumber}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PowerLink</h1>
                <p className="text-xs text-gray-500">BAPA</p>
              </div>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm" className="bg-transparent">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Check Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Check Application Status</span>
              </CardTitle>
              <CardDescription>
                Enter your account number to check if your application has been approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckStatus} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="e.g., C001"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.toUpperCase())}
                    required
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">Your account number was provided by the PowerLink BAPA office</p>
                </div>

                {error && <Alert variant="destructive">{error}</Alert>}

                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                  {loading ? "Checking..." : "Check Status"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Section 2: Status Result */}
          <div>
            {accountStatus && (
              <Card
                className={accountStatus.isApproved ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}
              >
                <CardHeader>
                  <CardTitle className="text-lg">
                    {accountStatus.isApproved ? "Application Approved" : "Application Status"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {accountStatus.isApproved ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Your application is approved!</p>
                          <p className="text-sm text-gray-600">You can now create your online account</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium text-gray-900">{accountStatus.fullName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium text-gray-900">{accountStatus.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Account Number</p>
                          <p className="font-mono text-lg font-bold text-blue-600">{accountStatus.accountNumber}</p>
                        </div>
                      </div>

                      <Button
                        onClick={handleCreateAccount}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium h-11"
                      >
                        Create Account
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  ) : accountStatus.status === "pending" ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-8 h-8 text-yellow-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Application Under Review</p>
                          <p className="text-sm text-gray-600">Your application is still being processed</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-600">
                          Our team is reviewing your application and supporting documents. You will be notified by email
                          once a decision has been made (typically within 3-5 business days).
                        </p>
                      </div>

                      <Alert>
                        <AlertDescription>
                          In the meantime, you can save this page or bookmark it to check your status later.
                        </AlertDescription>
                      </Alert>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <XCircle className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="font-semibold text-gray-900">Application Declined</p>
                          <p className="text-sm text-gray-600">Unfortunately, your application was not approved</p>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg p-4 space-y-2">
                        <p className="text-sm text-gray-600">
                          Please visit the PowerLink BAPA office to discuss your application or submit a new one with
                          additional documentation.
                        </p>
                      </div>

                      <Alert variant="destructive">
                        <AlertDescription>
                          Contact the office at info@powerlink-bapa.com for more information
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!accountStatus && !error && (
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg">How it works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                          1
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Submit Application</p>
                        <p className="text-sm text-gray-600">Apply at PowerLink BAPA office with required documents</p>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                          2
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Receive Account Number</p>
                        <p className="text-sm text-gray-600">
                          Get your account number once your application is approved
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                          3
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Create Online Account</p>
                        <p className="text-sm text-gray-600">
                          Use your account number here to set up your online account
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2025 PowerLink BAPA | Barangay Energy Services</p>
          <p className="text-xs text-gray-400 mt-1">Questions? Contact us at info@powerlink-bapa.com</p>
        </div>
      </footer>
    </div>
  )
}
