"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { useState } from "react"

interface PaymentProcessingProps {
  billId: number
  amount: number
  paymentMethod: string
  consumerEmail: string
  onPaymentComplete: (success: boolean, transactionId: string) => void
}

export function PaymentProcessing({
  billId,
  amount,
  paymentMethod,
  consumerEmail,
  onPaymentComplete,
}: PaymentProcessingProps) {
  const [status, setStatus] = useState<"processing" | "success" | "failed" | "pending">("processing")
  const [transactionId, setTransactionId] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  const handlePayment = async () => {
    try {
      setStatus("processing")
      const response = await fetch("/api/payments/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billId,
          amount,
          paymentMethod,
          consumerEmail,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setTransactionId(data.transactionId)
        onPaymentComplete(true, data.transactionId)
      } else {
        setStatus("failed")
        setErrorMessage(data.message || "Payment failed. Please try again.")
        onPaymentComplete(false, "")
      }
    } catch (error) {
      setStatus("failed")
      setErrorMessage("An error occurred during payment processing.")
      onPaymentComplete(false, "")
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-12 h-12 text-green-600" />
      case "failed":
        return <XCircle className="w-12 h-12 text-red-600" />
      case "pending":
        return <Clock className="w-12 h-12 text-yellow-600" />
      default:
        return <AlertCircle className="w-12 h-12 text-blue-600 animate-spin" />
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case "success":
        return "Payment Successful!"
      case "failed":
        return "Payment Failed"
      case "pending":
        return "Payment Pending"
      default:
        return "Processing Payment..."
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <CardTitle>Payment Status</CardTitle>
        <CardDescription>
          {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1).replace("_", " ")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center">{getStatusIcon()}</div>

        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">{getStatusMessage()}</h3>
          <p className="text-gray-600">Amount: ₱{amount.toFixed(2)}</p>
          {transactionId && <p className="text-sm text-gray-500 mt-2">Transaction ID: {transactionId}</p>}
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {status === "processing" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 text-center">Please wait while we process your payment...</p>
            <Button onClick={handlePayment} disabled className="w-full">
              Processing...
            </Button>
          </div>
        )}

        {status === "failed" && (
          <Button onClick={handlePayment} className="w-full bg-blue-600 hover:bg-blue-700">
            Retry Payment
          </Button>
        )}

        {status === "success" && (
          <div className="space-y-3">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Your payment has been successfully processed.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
