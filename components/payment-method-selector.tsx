"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CreditCard, Smartphone, Building2 } from "lucide-react"
import { useState } from "react"

interface PaymentMethodSelectorProps {
  amount: number
  billId: number
  onPaymentMethodSelect: (method: string) => void
  isLoading?: boolean
}

export function PaymentMethodSelector({
  amount,
  billId,
  onPaymentMethodSelect,
  isLoading = false,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("gcash")

  const paymentMethods = [
    {
      id: "gcash",
      name: "GCash",
      description: "Pay using GCash mobile wallet",
      icon: Smartphone,
      color: "bg-blue-50 border-blue-200",
    },
    {
      id: "paymaya",
      name: "PayMaya",
      description: "Pay using PayMaya credit/debit card",
      icon: CreditCard,
      color: "bg-purple-50 border-purple-200",
    },
    {
      id: "bank_transfer",
      name: "Bank Transfer",
      description: "Direct bank transfer payment",
      icon: Building2,
      color: "bg-green-50 border-green-200",
    },
  ]

  const handleProceed = () => {
    onPaymentMethodSelect(selectedMethod)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Payment Method</CardTitle>
          <CardDescription>Choose how you want to pay your bill</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod}>
            {paymentMethods.map((method) => {
              const Icon = method.icon
              return (
                <div key={method.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                    <div className={`p-4 rounded-lg border-2 ${method.color} transition-all`}>
                      <div className="flex items-center gap-3">
                        <Icon className="w-6 h-6" />
                        <div>
                          <p className="font-semibold">{method.name}</p>
                          <p className="text-sm text-gray-600">{method.description}</p>
                        </div>
                      </div>
                    </div>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <p className="text-sm text-gray-600 mb-2">Amount to Pay:</p>
            <p className="text-3xl font-bold text-blue-600">₱{amount.toFixed(2)}</p>
          </div>

          <Button
            onClick={handleProceed}
            disabled={isLoading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {isLoading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
