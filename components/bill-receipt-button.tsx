"use client"

import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

interface BillReceiptButtonProps {
  billId: string
  billNumber: string
  className?: string
  size?: "default" | "sm" | "lg"
}

export function BillReceiptButton({ billId, billNumber, className, size }: BillReceiptButtonProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch("/api/bills/generate-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billId }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate receipt")
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to generate receipt")
      }

      // Generate HTML and download
      const { generateBillReceiptHTML } = await import("@/lib/bill-receipt-generator")
      const htmlContent = generateBillReceiptHTML(data.data)

      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `Bill_Receipt_${billNumber}_${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Success",
        description: "Bill receipt downloaded successfully",
      })
    } catch (error) {
      console.error("Error downloading receipt:", error)
      toast({
        title: "Error",
        description: "Failed to download bill receipt",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      onClick={handleDownload}
      variant="ghost"
      size={size || "sm"}
      title="Download Bill Receipt"
      className={className}
    >
      <Download className="w-4 h-4" />
    </Button>
  )
}
