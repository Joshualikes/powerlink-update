"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, Download, AlertCircle } from "lucide-react"
import Link from "next/link"

interface PaymentDetails {
  id: string
  transactionId: string
  amount: string
  status: "completed" | "pending" | "failed"
  paymentMethod: string
  billNumber: string
  createdAt: string
  paidAt?: string
}

export default function PaymentReceiptPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const transactionId = searchParams.get("transactionId")

  const [payment, setPayment] = useState<PaymentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const token = localStorage.getItem("consumer_token")
        const email = localStorage.getItem("consumer_email")

        if (!token || !email || !transactionId) {
          router.push("/dashboard")
          return
        }

        const response = await fetch(`/api/payments/status?transactionId=${transactionId}&email=${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Failed to fetch payment details")

        const data = await response.json()
        setPayment(data.payment)
      } catch (err) {
        setError("Failed to load payment details")
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentDetails()
  }, [transactionId, router])

  const getStatusIcon = () => {
    switch (payment?.status) {
      case "completed":
        return <CheckCircle className="w-12 h-12 text-green-600" />
      case "pending":
        return <Clock className="w-12 h-12 text-yellow-600" />
      case "failed":
        return <XCircle className="w-12 h-12 text-red-600" />
      default:
        return null
    }
  }

  const getStatusBadge = () => {
    switch (payment?.status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return null
    }
  }

  const handleDownloadReceipt = async () => {
    try {
      const response = await fetch(`/api/payments/receipt/pdf?transactionId=${transactionId}`)
      if (!response.ok) throw new Error("Failed to generate receipt")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `receipt-${transactionId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      alert("Failed to download receipt")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Loading payment details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Payment details not found"}</AlertDescription>
          </Alert>
          <Link href="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Receipt Card */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{getStatusIcon()}</div>
            <CardTitle className="text-2xl">
              {payment.status === "completed"
                ? "Payment Successful"
                : payment.status === "pending"
                  ? "Payment Pending"
                  : "Payment Failed"}
            </CardTitle>
            <CardDescription>Transaction Receipt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">{getStatusBadge()}</div>

            {/* Payment Details */}
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Transaction ID</p>
                  <p className="font-mono text-sm font-semibold break-all">{payment.transactionId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Bill Number</p>
                  <p className="font-semibold">{payment.billNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-semibold capitalize">{payment.paymentMethod.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p className="font-semibold">{new Date(payment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Amount */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Amount Paid</p>
                <p className="text-3xl font-bold text-blue-600">₱{Number.parseFloat(payment.amount).toFixed(2)}</p>
              </div>

              {/* Status Message */}
              {payment.status === "pending" && (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Your payment is pending. Please complete the bank transfer within 24 hours.
                  </AlertDescription>
                </Alert>
              )}

              {payment.status === "failed" && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your payment failed. Please try again with a different payment method.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 border-t pt-4">
              {payment.status === "completed" && (
                <Button onClick={handleDownloadReceipt} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt (PDF)
                </Button>
              )}

              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full bg-transparent">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        {payment.status === "completed" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Thank you for your payment! Your bill has been marked as paid.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
