"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PaymentMethodSelector } from "@/components/payment-method-selector"
import { PaymentProcessing } from "@/components/payment-processing"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function PayBillPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const billId = searchParams.get("billId")

  const [bill, setBill] = useState<any>(null)
  const [consumer, setConsumer] = useState<any>(null)
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBillData = async () => {
      try {
        const token = localStorage.getItem("consumer_token")
        if (!token) {
          router.push("/login")
          return
        }

        const response = await fetch(`/api/bills/${billId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Failed to fetch bill")

        const data = await response.json()
        setBill(data.bill)
        setConsumer(data.consumer)
      } catch (err) {
        setError("Failed to load bill information")
      } finally {
        setLoading(false)
      }
    }

    if (billId) fetchBillData()
  }, [billId, router])

  const handlePaymentComplete = (success: boolean, transactionId: string) => {
    if (success) {
      setTimeout(() => {
        router.push(`/dashboard/payment-receipt?transactionId=${transactionId}`)
      }, 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-600">Loading bill information...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || "Bill not found"}</AlertDescription>
          </Alert>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Bill Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Bill Summary</CardTitle>
            <CardDescription>Bill #{bill.bill_number}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Billing Period</p>
                <p className="font-semibold">
                  {new Date(bill.billing_period_start).toLocaleDateString()} -{" "}
                  {new Date(bill.billing_period_end).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-semibold">{new Date(bill.due_date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Usage (kWh)</p>
                <p className="font-semibold">{bill.kwh_used}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rate per kWh</p>
                <p className="font-semibold">₱{Number.parseFloat(bill.rate_per_kwh).toFixed(2)}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">Amount Due</p>
              <p className="text-3xl font-bold text-blue-600">₱{Number.parseFloat(bill.amount_due).toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method Selection or Processing */}
        {!selectedMethod ? (
          <PaymentMethodSelector
            amount={Number.parseFloat(bill.amount_due)}
            billId={bill.id}
            onPaymentMethodSelect={setSelectedMethod}
          />
        ) : (
          <PaymentProcessing
            billId={bill.id}
            amount={Number.parseFloat(bill.amount_due)}
            paymentMethod={selectedMethod}
            consumerEmail={consumer.email}
            onPaymentComplete={handlePaymentComplete}
          />
        )}

        <Button variant="outline" onClick={() => router.back()} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  )
}
