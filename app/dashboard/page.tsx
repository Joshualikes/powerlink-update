"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Zap,
  Download,
  CreditCard,
  Phone,
  FileText,
  Bell,
  AlertTriangle,
  Info,
  Gift,
  TrendingUp,
  X,
  Check,
  Clock,
  MapPin,
  Mail,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { getBillingStatus } from "@/lib/billing-utils"

interface Announcement {
  id: number
  title: string
  content: string
  type: "outage" | "promotion" | "payment" | "general"
  priority: "low" | "medium" | "high"
  status: "active" | "inactive"
  createdAt: string
  scheduledFor?: string
}

interface UsageData {
  month: string
  usage: number
  amount: number
  avgTemp: number
}

export default function ConsumerDashboard() {
  const router = useRouter()
  const [consumerName, setConsumerName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<number[]>([])
  const [usageHistory, setUsageHistory] = useState<UsageData[]>([])
  const [chartType, setChartType] = useState<"usage" | "amount">("usage")

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false)
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("920.75")
  const [outstandingBalance, setOutstandingBalance] = useState(920.75)
  const [currentBillingStatus, setCurrentBillingStatus] = useState<"pending" | "overdue" | "suspended" | "paid">(
    "pending",
  )
  const [paymentHistory, setPaymentHistory] = useState([
    { id: 1, date: "Apr 22, 2025", amount: 875.5, method: "GCash", status: "Paid" },
    { id: 2, date: "Mar 20, 2025", amount: 920.25, method: "Credit Card", status: "Paid" },
    { id: 3, date: "Feb 18, 2025", amount: 845.75, method: "Cash", status: "Paid" },
  ])
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "support", message: "Hello! How can I help you today?", timestamp: new Date() },
  ])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    // Check if consumer is authenticated
    const token = localStorage.getItem("consumer_token")
    const name = localStorage.getItem("consumer_name")
    const account = localStorage.getItem("consumer_account")
    const service = localStorage.getItem("consumer_service_type")

    if (!token) {
      router.push("/login")
    } else {
      setConsumerName(name || "Jester Yutiga")
      setAccountNumber(account || "#C001")
      setServiceType(service || "Residential")

      const billingStatus = getBillingStatus(new Date().toISOString())
      setCurrentBillingStatus(billingStatus)

      fetchAnnouncements()
      setUsageHistory([
        { month: "Dec 2024", usage: 220, amount: 2750, avgTemp: 28 },
        { month: "Jan 2025", usage: 210, amount: 2625, avgTemp: 26 },
        { month: "Feb 2025", usage: 235, amount: 2937, avgTemp: 29 },
        { month: "Mar 2025", usage: 230, amount: 2875, avgTemp: 30 },
        { month: "Apr 2025", usage: 230, amount: 2875, avgTemp: 31 },
        { month: "May 2025", usage: 245, amount: 3062, avgTemp: 32 },
      ])
    }

    const dismissed = localStorage.getItem("dismissed_announcements")
    if (dismissed) {
      setDismissedAnnouncements(JSON.parse(dismissed))
    }
  }, [router])

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements")
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data)
        console.log("[v0] Fetched announcements from unified API:", data.length)
      } else {
        throw new Error("Failed to fetch announcements")
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
      setAnnouncements([])
    }
  }

  const refreshAnnouncements = () => {
    fetchAnnouncements()
  }

  useEffect(() => {
    const interval = setInterval(() => {
      refreshAnnouncements()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const handlePayNow = () => {
    setShowPaymentModal(true)
  }

  const processPayment = async () => {
    if (!selectedPaymentMethod) {
      alert("Please select a payment method")
      return
    }

    try {
      const paymentData = {
        amount: Number.parseFloat(paymentAmount),
        method: selectedPaymentMethod,
        accountNumber: accountNumber,
        billId: "current",
      }

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setOutstandingBalance(0)
      setCurrentBillingStatus("paid")

      // Add to payment history
      const newPayment = {
        id: paymentHistory.length + 1,
        date: new Date().toLocaleDateString(),
        amount: Number.parseFloat(paymentAmount),
        method: selectedPaymentMethod,
        status: selectedPaymentMethod === "Cash on Hand" ? "Pending" : "Paid",
      }
      setPaymentHistory([newPayment, ...paymentHistory])

      setUsageHistory((prev) => [
        {
          month: "Current",
          usage: 0,
          amount: 0,
          avgTemp: 0,
        },
        ...prev,
      ])

      setShowPaymentModal(false)
      alert(`Payment ${selectedPaymentMethod === "Cash on Hand" ? "scheduled" : "successful"}!`)
    } catch (error) {
      alert("Payment failed. Please try again.")
    }
  }

  const handleDownloadBill = () => {
    const accountNumber = localStorage.getItem("consumer_account") || "#C001"
    const token = localStorage.getItem("consumer_token")

    fetch("/api/bills/receipt-data", {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-Account-Number": accountNumber,
      },
    })
      .then((res) => res.json())
      .then((response) => {
        if (response.success) {
          generateBillWithReadings(response.data)
        } else {
          handleDownloadBillFallback()
        }
      })
      .catch(() => {
        handleDownloadBillFallback()
      })
  }

  const generateBillWithReadings = (readingsData: any) => {
    try {
      import("jspdf")
        .then(({ default: jsPDF }) => {
          const doc = new jsPDF()
          const pageWidth = doc.internal.pageSize.getWidth()
          const pageHeight = doc.internal.pageSize.getHeight()

          // Header
          doc.setFont(undefined, "bold")
          doc.setFontSize(16)
          doc.text("POWER BILL", pageWidth / 2, 20, { align: "center" })
          doc.setFontSize(14)
          doc.text("STATEMENT OF ACCOUNT", pageWidth / 2, 27, { align: "center" })

          // Company name
          doc.setFont(undefined, "bold")
          doc.setFontSize(12)
          doc.text("BARANGAY POWER ASSOCIATION", 20, 40)

          // Consumer info
          doc.setFont(undefined, "normal")
          doc.setFontSize(10)
          doc.text("CONSUMER:", 20, 50)
          doc.text(consumerName, 50, 50)
          doc.text("NO", pageWidth - 30, 50)

          // Meter readings table
          doc.setFont(undefined, "bold")
          doc.setFontSize(11)
          doc.text("READING", 20, 70)

          // Table structure
          const tableY = 80
          const colWidths = [40, 40, 40, 40]
          const cols = ["MONTHLY/YEAR", "CURRENT", "PREVIOUS", "KWH USED", "TOTAL AMOUNT DUE"]

          // Draw table headers
          doc.setDrawColor(0)
          doc.setLineWidth(0.5)
          let x = 20

          // Headers
          doc.setFont(undefined, "bold")
          doc.setFontSize(9)
          doc.rect(x, tableY, colWidths[0], 10)
          doc.text("MONTHLY/YEAR", x + 2, tableY + 7, { maxWidth: colWidths[0] - 4 })

          x += colWidths[0]
          doc.rect(x, tableY, colWidths[1], 10)
          doc.text("CURRENT", x + 2, tableY + 7, { maxWidth: colWidths[1] - 4 })

          x += colWidths[1]
          doc.rect(x, tableY, colWidths[1], 10)
          doc.text("PREVIOUS", x + 2, tableY + 7, { maxWidth: colWidths[1] - 4 })

          x += colWidths[1]
          doc.rect(x, tableY, colWidths[1], 10)
          doc.text("KWH USED", x + 2, tableY + 7, { maxWidth: colWidths[1] - 4 })

          x += colWidths[1]
          doc.rect(x, tableY + 20, colWidths[0] + colWidths[1] + colWidths[1], 10)
          doc.text("TOTAL AMOUNT DUE", x + 2, tableY + 27, { maxWidth: 90 })

          // Data rows
          const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" })
          doc.setFont(undefined, "normal")
          doc.setFontSize(10)

          x = 20
          const dataY = tableY + 10
          doc.rect(x, dataY, colWidths[0], 30)
          doc.text(currentMonth, x + 2, dataY + 15)

          x += colWidths[0]
          doc.rect(x, dataY, colWidths[1], 30)
          doc.text(readingsData.currentReading.toFixed(0), x + 2, dataY + 15)

          x += colWidths[1]
          doc.rect(x, dataY, colWidths[1], 30)
          doc.text(readingsData.previousReading.toFixed(0), x + 2, dataY + 15)

          x += colWidths[1]
          doc.rect(x, dataY, colWidths[1], 30)
          doc.text(readingsData.kwhUsed.toFixed(0), x + 2, dataY + 15)

          // Total amount due box
          x = 20
          doc.setLineWidth(1)
          doc.rect(x, tableY + 40, colWidths[0] * 3, 10)
          doc.text("TOTAL AMOUNT DUE", x + 2, tableY + 47)

          x += colWidths[0] * 3
          doc.rect(x, tableY + 40, colWidths[1], 10)
          doc.setFont(undefined, "bold")
          doc.text(`₱${readingsData.totalAmountDue.toFixed(2)}`, x + 2, tableY + 47)

          // Due date and payment notice
          const noticeY = tableY + 60
          doc.setFont(undefined, "normal")
          doc.setFontSize(9)
          doc.text(
            "If not paid within in (10) days after due date, service will be disconnected without any prior without notices",
            20,
            noticeY,
          )

          doc.setFont(undefined, "bold")
          doc.text("DUE DATE", pageWidth - 40, noticeY + 10)
          doc.setFont(undefined, "normal")
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + 10)
          doc.text(dueDate.toLocaleDateString(), pageWidth - 40, noticeY + 17)

          // Save PDF
          doc.save(`PowerLink_Bill_${accountNumber}_${new Date().toISOString().split("T")[0]}.pdf`)
        })
        .catch(() => {
          handleDownloadBillFallback()
        })
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      handleDownloadBillFallback()
    }
  }

  const handleDownloadBillFallback = () => {
    try {
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>PowerLink BAPA - Electric Bill</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { color: #2563eb; font-size: 24px; font-weight: bold; }
            .company { color: #666; font-size: 14px; }
            .bill-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .bill-details { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .amount-due { text-align: center; background: #2563eb; color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .amount { font-size: 36px; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f1f5f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">PowerLink BAPA</div>
            <div class="company">Barangay Energy Services</div>
            <div style="margin-top: 10px; color: #666;">Electric Bill Statement</div>
          </div>
          
          <div class="bill-info">
            <div>
              <strong>Bill To:</strong><br>
              ${consumerName}<br>
              Account: ${accountNumber}
            </div>
            <div style="text-align: right;">
              <strong>Bill Date:</strong> ${new Date().toLocaleDateString()}<br>
              <strong>Due Date:</strong> May 25, 2025<br>
              <strong>Bill Period:</strong> Apr 20 - May 24, 2025
            </div>
          </div>

          <div class="amount-due">
            <div class="amount">₱${outstandingBalance.toFixed(2)}</div>
            <div>Amount Due</div>
          </div>

          <div class="bill-details">
            <h3 style="margin-top: 0;">Usage Details</h3>
            <table>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
              <tr>
                <td>Electricity Consumption</td>
                <td>245 kWh</td>
                <td>₱12.50/kWh</td>
                <td>₱3,062.50</td>
              </tr>
              <tr>
                <td>System Loss</td>
                <td>-</td>
                <td>-</td>
                <td>₱153.13</td>
              </tr>
              <tr>
                <td>Transmission Charge</td>
                <td>-</td>
                <td>-</td>
                <td>₱76.56</td>
              </tr>
              <tr>
                <td>Distribution Charge</td>
                <td>-</td>
                <td>-</td>
                <td>₱122.50</td>
              </tr>
              <tr>
                <td>Subsidies</td>
                <td>-</td>
                <td>-</td>
                <td>-₱61.25</td>
              </tr>
              <tr>
                <td>Government Taxes</td>
                <td>-</td>
                <td>-</td>
                <td>₱91.88</td>
              </tr>
              <tr style="font-weight: bold; background: #f1f5f9;">
                <td>Total Amount Due</td>
                <td>-</td>
                <td>-</td>
                <td>₱${outstandingBalance.toFixed(2)}</td>
              </tr>
            </table>
          </div>

          <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
            <strong>Payment Notice:</strong> Please pay on or before the due date to avoid disconnection.
            <br><strong>Payment Options:</strong> GCash, PayMaya, Credit Card, or visit our office.
          </div>

          <div class="footer">
            <div>PowerLink BAPA - Barangay Energy Services</div>
            <div>123 Energy St, Barangay Center, City | (02) 8123-4567 | support@powerlink-bapa.com</div>
            <div style="margin-top: 10px;">Thank you for choosing PowerLink BAPA for your energy needs.</div>
          </div>
        </body>
        </html>
      `

      const blob = new Blob([pdfContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)

      const printWindow = window.open(url, "_blank")
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
            URL.revokeObjectURL(url)
          }, 250)
        }
      } else {
        const a = document.createElement("a")
        a.href = url
        a.download = `PowerLink_Bill_${accountNumber}_${new Date().toISOString().split("T")[0]}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Failed to generate HTML:", error)
      alert("Failed to generate bill. Please try again.")
    }
  }

  const handleViewPaymentHistory = () => {
    setShowPaymentHistoryModal(true)
  }

  const handleContactSupport = () => {
    setShowContactModal(true)
  }

  const sendChatMessage = () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: chatMessages.length + 1,
      sender: "user",
      message: newMessage,
      timestamp: new Date(),
    }

    setChatMessages([...chatMessages, userMessage])
    setNewMessage("")

    // Simulate support response
    setTimeout(() => {
      const supportResponse = {
        id: chatMessages.length + 2,
        sender: "support",
        message: "Thank you for your message. A support representative will assist you shortly.",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, supportResponse])
    }, 1000)
  }

  const visibleAnnouncements = announcements.filter((announcement) => !dismissedAnnouncements.includes(announcement.id))

  const handleLogout = () => {
    localStorage.removeItem("consumer_token")
    localStorage.removeItem("consumer_name")
    localStorage.removeItem("consumer_account")
    localStorage.removeItem("consumer_service_type")
    router.push("/login")
  }

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "outage":
        return <AlertTriangle className="w-5 h-5" />
      case "promotion":
        return <Gift className="w-5 h-5" />
      case "payment":
        return <CreditCard className="w-5 h-5" />
      default:
        return <Info className="w-5 h-5" />
    }
  }

  const getAnnouncementStyling = (type: string, priority: string) => {
    const baseClasses = "border-l-4 "

    if (priority === "high") {
      return baseClasses + "border-red-500 bg-red-50"
    } else if (type === "outage") {
      return baseClasses + "border-red-400 bg-red-50"
    } else if (type === "promotion") {
      return baseClasses + "border-green-400 bg-green-50"
    } else if (type === "payment") {
      return baseClasses + "border-blue-400 bg-blue-50"
    } else {
      return baseClasses + "border-gray-400 bg-gray-50"
    }
  }

  const getServiceTypeBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case "residential":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Residential</Badge>
      case "commercial":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Commercial</Badge>
      case "industrial":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Industrial</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PowerLink</h1>
                <p className="text-xs text-gray-500">BAPA</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <span className="text-sm text-blue-600 font-medium">Dashboard</span>
              <span className="text-sm text-gray-600">Welcome, {consumerName}</span>
            </nav>

            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2 bg-transparent text-sm"
            >
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold">Welcome back, {consumerName}!</h2>
          <p className="text-blue-100 mt-1">Here's your energy consumption overview</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Current Bill and Usage History */}
          <div className="xl:col-span-2 space-y-8">
            {/* Current Bill */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span>Current Bill</span>
                    </CardTitle>
                    <CardDescription>
                      {currentBillingStatus === "suspended" && (
                        <span className="text-red-600 font-semibold">Service Suspended - Payment Required</span>
                      )}
                      {currentBillingStatus === "overdue" && (
                        <span className="text-orange-600 font-semibold">Overdue - Please Pay Immediately</span>
                      )}
                      {currentBillingStatus === "pending" && <span>Due on the 5th of the month</span>}
                      {currentBillingStatus === "paid" && (
                        <span className="text-green-600 font-semibold">Payment Successful</span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      currentBillingStatus === "suspended"
                        ? "bg-red-100 text-red-800"
                        : currentBillingStatus === "overdue"
                          ? "bg-orange-100 text-orange-800"
                          : currentBillingStatus === "pending"
                            ? "bg-green-100 text-green-800"
                            : "bg-green-100 text-green-800"
                    }
                  >
                    {currentBillingStatus === "paid"
                      ? "✓ Paid"
                      : currentBillingStatus === "suspended"
                        ? "🔴 Suspended"
                        : currentBillingStatus === "overdue"
                          ? "🟠 Overdue"
                          : "🟢 Pending"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">₱{outstandingBalance.toFixed(2)}</div>
                  <p className="text-gray-600">Amount Due</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Due Date:</p>
                    <p className="font-medium">5th of Month</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Bill Period:</p>
                    <p className="font-medium">Apr 20 - May 24, 2025</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">kWh Used:</p>
                    <p className="font-medium">{currentBillingStatus === "paid" ? "0" : "245"} kWh</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rate:</p>
                    <p className="font-medium">₱12.50/kWh</p>
                  </div>
                </div>

                {currentBillingStatus === "suspended" && (
                  <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-600 rounded">
                    <p className="text-red-800 text-sm font-semibold">⚠️ Service Suspended</p>
                    <p className="text-red-700 text-xs mt-1">
                      Your electricity has been cut off as of the 15th of the month. Please pay immediately to restore
                      service.
                    </p>
                  </div>
                )}

                {currentBillingStatus === "overdue" && (
                  <div className="mb-6 p-4 bg-orange-100 border-l-4 border-orange-600 rounded">
                    <p className="text-orange-800 text-sm font-semibold">⚠️ Payment Overdue</p>
                    <p className="text-orange-700 text-xs mt-1">
                      Your payment is now overdue. Please pay before the 15th to avoid service suspension.
                    </p>
                  </div>
                )}

                {currentBillingStatus === "paid" && (
                  <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-600 rounded">
                    <p className="text-green-800 text-sm font-semibold">✅ Payment Successful</p>
                    <p className="text-green-700 text-xs mt-1">
                      Your payment has been successfully processed. Thank you!
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <Button
                    onClick={handlePayNow}
                    className={`flex-1 ${
                      currentBillingStatus === "paid"
                        ? "bg-green-600 hover:bg-green-700"
                        : currentBillingStatus === "suspended"
                          ? "bg-red-600 hover:bg-red-700"
                          : currentBillingStatus === "overdue"
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "bg-blue-600 hover:bg-blue-700"
                    }`}
                    disabled={outstandingBalance === 0}
                  >
                    {outstandingBalance > 0 ? "Pay Now" : "Paid"}
                  </Button>
                  <Button onClick={handleDownloadBill} variant="outline" className="flex-1 bg-transparent">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage History Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span>Usage History (Last 6 Months)</span>
                    </CardTitle>
                    <CardDescription>Track your energy consumption patterns</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">245</div>
                    <p className="text-sm text-gray-600">This Month</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">230</div>
                    <p className="text-sm text-gray-600">Last Month</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">235</div>
                    <p className="text-sm text-gray-600">Average</p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={usageHistory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value} kWh`, "Usage"]}
                        labelFormatter={(label) => `Month: ${label}`}
                      />
                      <Bar dataKey="usage" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Announcements and Account Summary */}
          <div className="space-y-6">
            {/* Announcements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-blue-600" />
                    <span>Announcements</span>
                  </div>
                  <Button
                    onClick={refreshAnnouncements}
                    variant="ghost"
                    size="sm"
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {announcements.length === 0 ? (
                  <div className="text-center py-4">
                    <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No announcements at this time</p>
                  </div>
                ) : (
                  announcements.slice(0, 3).map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`p-3 rounded-lg ${getAnnouncementStyling(announcement.type, announcement.priority)}`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-1 rounded-full ${
                            announcement.type === "outage"
                              ? "bg-red-100 text-red-600"
                              : announcement.type === "promotion"
                                ? "bg-green-100 text-green-600"
                                : announcement.type === "payment"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {getAnnouncementIcon(announcement.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm text-gray-900">{announcement.title}</h4>
                            {announcement.priority === "high" && (
                              <Badge className="bg-red-100 text-red-800 text-xs">High Priority</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-700 mt-1">{announcement.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs text-gray-500">
                              Posted: {new Date(announcement.createdAt).toLocaleDateString()}
                            </p>
                            {announcement.scheduledFor && (
                              <p className="text-xs text-orange-600">
                                Scheduled: {new Date(announcement.scheduledFor).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <Button
                  onClick={() => setShowAnnouncementsModal(true)}
                  variant="outline"
                  className="w-full text-sm bg-transparent"
                  disabled={announcements.length === 0}
                >
                  View All Announcements ({announcements.length})
                </Button>
              </CardContent>
            </Card>

            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {consumerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{consumerName}</p>
                    <p className="text-sm text-gray-600">Account: {accountNumber}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Connection Date:</span>
                    <span className="text-sm font-medium">Jan 15, 2020</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Service Type:</span>
                    {getServiceTypeBadge(serviceType)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Outstanding Balance:</span>
                    <span
                      className={`text-sm font-medium ${outstandingBalance > 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      ₱{outstandingBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Payment:</span>
                    <span className="text-sm font-medium">Apr 22, 2025</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Next Reading:</span>
                    <span className="text-sm font-medium">May 20, 2025</span>
                  </div>
                </div>

                <Button onClick={handleViewPaymentHistory} className="w-full bg-green-600 hover:bg-green-700">
                  View Payment History
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleDownloadBill}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto bg-transparent"
                >
                  <Download className="w-6 h-6 mb-2" />
                  <span className="text-xs">Download Bill</span>
                </Button>
                <Button
                  onClick={handlePayNow}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto bg-transparent"
                  disabled={outstandingBalance === 0}
                >
                  <CreditCard className="w-6 h-6 mb-2" />
                  <span className="text-xs">Pay Online</span>
                </Button>
                <Button
                  onClick={handleContactSupport}
                  variant="outline"
                  className="flex flex-col items-center p-4 h-auto bg-transparent"
                >
                  <Phone className="w-6 h-6 mb-2" />
                  <span className="text-xs">Contact Support</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pay Your Bill</DialogTitle>
            <DialogDescription>Choose your preferred payment method to pay ₱{paymentAmount}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount to Pay</Label>
              <Input
                id="amount"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                type="number"
                step="0.01"
                disabled
              />
            </div>
            <div>
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GCash">GCash</SelectItem>
                  <SelectItem value="PayMaya">PayMaya</SelectItem>
                  <SelectItem value="Credit Card">Debit / Credit Card</SelectItem>
                  <SelectItem value="Cash on Hand">Cash on Hand (Pay at Office)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Button onClick={processPayment} className="flex-1">
                {selectedPaymentMethod === "Cash on Hand" ? "Schedule Payment" : "Pay Now"}
              </Button>
              <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAnnouncementsModal} onOpenChange={setShowAnnouncementsModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>All Announcements</DialogTitle>
            <DialogDescription>Stay updated with the latest news and updates from PowerLink BAPA</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {announcements.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No announcements available</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-4 rounded-lg ${getAnnouncementStyling(announcement.type, announcement.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          announcement.type === "outage"
                            ? "bg-red-100 text-red-600"
                            : announcement.type === "promotion"
                              ? "bg-green-100 text-green-600"
                              : announcement.type === "payment"
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {getAnnouncementIcon(announcement.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                          <Badge
                            className={`text-xs ${
                              announcement.priority === "high"
                                ? "bg-red-100 text-red-800"
                                : announcement.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {announcement.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {announcement.type}
                          </Badge>
                        </div>
                        <p className="text-gray-700 mt-2">{announcement.content}</p>
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <span>Posted: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                          {announcement.scheduledFor && (
                            <span className="text-orange-600">
                              Scheduled: {new Date(announcement.scheduledFor).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentHistoryModal} onOpenChange={setShowPaymentHistoryModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment History</DialogTitle>
            <DialogDescription>View all your past payments and transactions</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        payment.status === "Paid"
                          ? "bg-green-100 text-green-600"
                          : payment.status === "Pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      {payment.status === "Paid" ? (
                        <Check className="w-4 h-4" />
                      ) : payment.status === "Pending" ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">₱{payment.amount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">
                        {payment.date} • {payment.method}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      payment.status === "Paid" ? "default" : payment.status === "Pending" ? "secondary" : "destructive"
                    }
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showContactModal} onOpenChange={setShowContactModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Support</DialogTitle>
            <DialogDescription>Get in touch with PowerLink BAPA support team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Phone className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Hotline</p>
                <p className="text-sm text-gray-600">0928-331-3902</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-gray-600">BAPAMasbatano@gmail.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 border rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Office Address</p>
                <p className="text-sm text-gray-600">BAPA Masbataño, Barangay Capunitan, Orion, Bataan 2102</p>
              </div>
            </div>
            <Separator />
            <p className="text-sm text-gray-600">Office Hours: Monday - Friday, 8:00 AM - 5:00 PM</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
