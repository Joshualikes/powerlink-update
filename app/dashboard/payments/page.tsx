"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Download, Eye } from "lucide-react"
import Link from "next/link"

interface Payment {
  id: number
  transactionId: string
  amount: string
  status: "completed" | "pending" | "failed"
  paymentMethod: string
  billNumber: string
  createdAt: string
}

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("consumer_token")
        const email = localStorage.getItem("consumer_email")

        if (!token || !email) {
          router.push("/login")
          return
        }

        const response = await fetch(`/api/payments/history?email=${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Failed to fetch payments")

        const data = await response.json()
        setPayments(data.payments || [])
      } catch (err) {
        setError("Failed to load payment history")
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [router])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const handleDownloadReceipt = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/payments/receipt/pdf?transactionId=${transactionId}`)
      if (!response.ok) throw new Error("Failed to generate receipt")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `receipt-${transactionId}.html`
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
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Loading payment history...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
            <p className="text-gray-600 mt-1">View all your payments and transactions</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {payments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">No payments found</p>
              <Link href="/dashboard">
                <Button className="bg-blue-600 hover:bg-blue-700">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Desktop View */}
            <div className="hidden md:block">
              <Card>
                <CardHeader>
                  <CardTitle>All Transactions</CardTitle>
                  <CardDescription>Total payments: {payments.length}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Bill #</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Method</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{new Date(payment.createdAt).toLocaleDateString()}</td>
                            <td className="py-3 px-4 font-mono text-sm">{payment.billNumber}</td>
                            <td className="py-3 px-4 font-semibold">₱{Number.parseFloat(payment.amount).toFixed(2)}</td>
                            <td className="py-3 px-4 capitalize">{payment.paymentMethod.replace("_", " ")}</td>
                            <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Link href={`/dashboard/payment-receipt?transactionId=${payment.transactionId}`}>
                                  <Button size="sm" variant="outline">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </Link>
                                {payment.status === "completed" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDownloadReceipt(payment.transactionId)}
                                  >
                                    <Download className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600">Bill #{payment.billNumber}</p>
                        <p className="font-semibold text-lg">₱{Number.parseFloat(payment.amount).toFixed(2)}</p>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
                      <p>Method: {payment.paymentMethod.replace("_", " ")}</p>
                      <p className="font-mono text-xs">ID: {payment.transactionId}</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Link
                        href={`/dashboard/payment-receipt?transactionId=${payment.transactionId}`}
                        className="flex-1"
                      >
                        <Button size="sm" variant="outline" className="w-full bg-transparent">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      {payment.status === "completed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => handleDownloadReceipt(payment.transactionId)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
