"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Zap,
  DollarSign,
  FileText,
  AlertTriangle,
  Clock,
  Search,
  Download,
  Eye,
  Bell,
  User,
  LogOut,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Edit,
  Trash2,
  Calendar,
} from "lucide-react"
import { mockDataStore } from "@/lib/mock-data-store"
import { generateNextDueDate } from "@/lib/billing-utils"

interface BillingStats {
  revenue: { value: number; change: number; trend: string }
  generated: { value: number; change: number; trend: string }
  unpaid: { value: number; change: number; trend: string }
  overdue: { value: number; change: number; trend: string }
}

interface Bill {
  id: string
  billNumber: string
  consumerId: string
  consumerName: string
  period: string
  kwhUsed: number
  amount: number
  status: "paid" | "pending" | "overdue"
  dueDate: string
  createdAt: string
}

interface Consumer {
  id: string
  accountNumber: string
  fullName: string
}

export default function AdminBilling() {
  const router = useRouter()
  const [bills, setBills] = useState<Bill[]>([])
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [stats, setStats] = useState<BillingStats>({
    revenue: { value: 0, change: 0, trend: "up" },
    generated: { value: 0, change: 0, trend: "up" },
    unpaid: { value: 0, change: 0, trend: "down" },
    overdue: { value: 0, change: 0, trend: "neutral" },
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const [generateForm, setGenerateForm] = useState({
    consumerId: "",
    billingStartDate: "",
    billingEndDate: "",
    previousReading: "",
    currentReading: "",
    kwhUsed: "",
    rate: "12.50",
    total: "₱0.00",
  })
  const [generateLoading, setGenerateLoading] = useState(false)
  const [previousMeterReading, setPreviousMeterReading] = useState<number | null>(null)

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    type: "view" | "edit" | "delete" | null
  }>({
    open: false,
    type: null,
  })
  const [actionLoading, setActionLoading] = useState(false)

  const [editFormData, setEditFormData] = useState({
    period: "",
    kwhUsed: "",
    amount: "",
    status: "pending",
  })

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchBillingData()
  }, [router])

  const fetchBillingData = async () => {
    try {
      console.log("[v0] Fetching billing data from mock data store...")

      const mockBills = mockDataStore.getBills()
      const mockConsumers = mockDataStore.getConsumers()
      const billingStats = mockDataStore.getBillingStats()

      const transformedBills = mockBills.map((bill) => ({
        id: bill.id,
        billNumber: bill.bill_number,
        consumerId: bill.consumer_id,
        consumerName: bill.consumer_name,
        period: bill.period,
        kwhUsed: bill.kwh_used,
        amount: bill.amount,
        status: bill.status.toLowerCase() as "paid" | "pending" | "overdue",
        dueDate: bill.due_date,
        createdAt: bill.created_at,
      }))

      const transformedConsumers = mockConsumers.map((consumer) => ({
        id: consumer.id,
        accountNumber: consumer.account_number,
        fullName: consumer.name,
      }))

      const unpaidBillsCount = transformedBills.filter((b) => b.status !== "paid").length

      const transformedStats = {
        revenue: { value: billingStats.revenue, change: 8.2, trend: "up" as const },
        generated: { value: billingStats.generated, change: 15, trend: "up" as const },
        unpaid: { value: unpaidBillsCount, change: -5.3, trend: "down" as const },
        overdue: { value: billingStats.overdue, change: 0, trend: "neutral" as const },
      }

      setBills(transformedBills)
      setConsumers(transformedConsumers)
      setStats(transformedStats)

      console.log("[v0] Billing data loaded from mock store. Unpaid bills:", unpaidBillsCount)
    } catch (error) {
      console.error("Failed to fetch billing data:", error)
      toast({
        title: "Error",
        description: "Failed to load billing data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleConsumerSelect = async (consumerId: string) => {
    setGenerateForm((prev) => ({ ...prev, consumerId }))

    try {
      const response = await fetch(`/api/admin/meter-readings?consumerId=${consumerId}`)
      const data = await response.json()

      if (data.success && data.data) {
        setPreviousMeterReading(data.data.reading_value)
        setGenerateForm((prev) => ({
          ...prev,
          previousReading: data.data.reading_value.toString(),
        }))
      } else {
        setPreviousMeterReading(null)
        setGenerateForm((prev) => ({
          ...prev,
          previousReading: "",
        }))
      }
    } catch (error) {
      console.error("Error fetching meter reading:", error)
      setPreviousMeterReading(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    router.push("/admin/login")
  }

  const calculateKwhUsed = (previous: string, current: string) => {
    const prev = Number.parseFloat(previous) || 0
    const curr = Number.parseFloat(current) || 0
    return Math.max(0, curr - prev).toString()
  }

  const calculateTotal = (kwhUsed: string, rate: string) => {
    const kwh = Number.parseFloat(kwhUsed) || 0
    const rateValue = Number.parseFloat(rate) || 0
    const total = kwh * rateValue
    return `₱${total.toFixed(2)}`
  }

  const handleNumberInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "e" || e.key === "E") {
      e.preventDefault()
    }
  }

  const handleCurrentReadingChange = (value: string) => {
    const kwhUsed = calculateKwhUsed(generateForm.previousReading, value)
    setGenerateForm((prev) => ({
      ...prev,
      currentReading: value,
      kwhUsed,
      total: calculateTotal(kwhUsed, prev.rate),
    }))
  }

  const handleKwhChange = (value: string) => {
    setGenerateForm((prev) => ({
      ...prev,
      kwhUsed: value,
      total: calculateTotal(value, prev.rate),
    }))
  }

  const handleGenerateBill = async () => {
    try {
      if (!generateForm.consumerId || !generateForm.currentReading || !generateForm.previousReading) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      if (!generateForm.billingStartDate || !generateForm.billingEndDate) {
        toast({
          title: "Error",
          description: "Please select billing period dates",
          variant: "destructive",
        })
        return
      }

      const selectedConsumer = consumers.find((c) => c.id === generateForm.consumerId)
      if (!selectedConsumer) {
        toast({
          title: "Error",
          description: "Selected consumer not found",
          variant: "destructive",
        })
        return
      }

      // Check for duplicate bill
      const duplicateCheck = await fetch("/api/admin/bills/check-duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consumerId: generateForm.consumerId,
          billingPeriodStart: generateForm.billingStartDate,
          billingPeriodEnd: generateForm.billingEndDate,
        }),
      })

      const duplicateData = await duplicateCheck.json()
      if (duplicateData.isDuplicate) {
        toast({
          title: "Error",
          description: "A bill already exists for this consumer and period",
          variant: "destructive",
        })
        return
      }

      setGenerateLoading(true)

      const newBillData = {
        consumer_id: generateForm.consumerId,
        consumer_name: selectedConsumer.fullName,
        period: `${new Date(generateForm.billingStartDate).toLocaleDateString()} - ${new Date(generateForm.billingEndDate).toLocaleDateString()}`,
        kwh_used: Number.parseFloat(generateForm.kwhUsed),
        amount: Number.parseFloat(generateForm.kwhUsed) * Number.parseFloat(generateForm.rate),
        status: "Pending" as const,
        due_date: generateNextDueDate(),
      }

      const newBill = mockDataStore.addBill(newBillData)

      // Save current reading as meter reading
      await fetch("/api/admin/meter-readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consumerId: generateForm.consumerId,
          readingValue: Number.parseFloat(generateForm.currentReading),
          readingDate: generateForm.billingEndDate,
        }),
      })

      await fetchBillingData()

      setGenerateForm({
        consumerId: "",
        billingStartDate: "",
        billingEndDate: "",
        previousReading: "",
        currentReading: "",
        kwhUsed: "",
        rate: "12.50",
        total: "₱0.00",
      })
      setPreviousMeterReading(null)

      toast({
        title: "Success",
        description: `Bill ${newBill.bill_number} generated successfully with due date on the 5th of the month`,
      })
    } catch (error) {
      console.error("Failed to generate bill:", error)
      toast({
        title: "Error",
        description: "Failed to generate bill",
        variant: "destructive",
      })
    } finally {
      setGenerateLoading(false)
    }
  }

  const handleExport = () => {
    const csvContent = [
      ["Bill #", "Consumer", "Period", "kWh", "Amount", "Status", "Due Date"].join(","),
      ...bills.map((bill) =>
        [
          bill.billNumber,
          bill.consumerName,
          bill.period,
          bill.kwhUsed,
          bill.amount,
          bill.status,
          new Date(bill.dueDate).toLocaleDateString(),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bills-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Bills exported successfully",
    })
  }

  const handleUpdateBillStatus = async (billId: string, newStatus: string) => {
    setActionLoading(true)
    try {
      const updateData: any = { id: billId, status: newStatus }

      if (newStatus === "paid") {
        updateData.kwh_used = 0
        updateData.amount = 0
      }

      const response = await fetch("/api/admin/bills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        await fetchBillingData()
        toast({
          title: "Success",
          description:
            newStatus === "paid" ? "Bill marked as paid and kWh reset to 0" : "Bill status updated successfully",
        })
      } else {
        throw new Error("Failed to update bill")
      }
    } catch (error) {
      console.error("Failed to update bill:", error)
      toast({
        title: "Error",
        description: "Failed to update bill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditBill = async (billId: string, updatedData: any) => {
    setActionLoading(true)
    try {
      const updatePayload: any = {
        id: billId,
        period: updatedData.period,
        kwh_used: updatedData.kwhUsed,
        amount: updatedData.amount,
        status: updatedData.status,
      }

      if (updatedData.status === "paid") {
        updatePayload.kwh_used = 0
        updatePayload.amount = 0
      }

      const response = await fetch("/api/admin/bills", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      })

      if (response.ok) {
        await fetchBillingData()
        setActionDialog({ open: false, type: null })
        setSelectedBill(null)
        toast({
          title: "Success",
          description:
            updatedData.status === "paid" ? "Bill marked as paid and kWh reset to 0" : "Bill updated successfully",
        })
      } else {
        throw new Error("Failed to update bill")
      }
    } catch (error) {
      console.error("Failed to update bill:", error)
      toast({
        title: "Error",
        description: "Failed to update bill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteBill = async (billId: string) => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/bills?id=${billId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchBillingData()
        toast({
          title: "Success",
          description: "Bill deleted successfully",
        })
      } else {
        throw new Error("Failed to delete bill")
      }
    } catch (error) {
      console.error("Failed to delete bill:", error)
      toast({
        title: "Error",
        description: "Failed to delete bill. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }

    setActionDialog({ open: false, type: null })
    setSelectedBill(null)
  }

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.consumerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.billNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.period.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.amount.toString().includes(searchTerm) ||
      bill.kwhUsed.toString().includes(searchTerm)

    const matchesStatus = statusFilter === "all" || bill.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">🟢 Paid</Badge>
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">🔴 Overdue</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">🟡 Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading billing data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PowerLink</h1>
                <p className="text-xs text-gray-500">BAPA</p>
              </div>
            </div>

            <nav className="hidden md:flex space-x-8">
              <a href="/admin/dashboard" className="text-gray-600 hover:text-gray-900 pb-4">
                Dashboard
              </a>
              <a href="/admin/consumers" className="text-gray-600 hover:text-gray-900 pb-4">
                Consumers
              </a>
              <a href="/admin/billing" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">
                Billing
              </a>
              <a href="/admin/applications" className="text-gray-600 hover:text-gray-900 pb-4">
                Applications
              </a>
              <a href="/admin/announcements" className="text-gray-600 hover:text-gray-900 pb-4">
                Announcements
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                  3
                </Badge>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
          <p className="text-gray-600 mt-1">Manage bills and meter readings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue.value)}</div>
              <div className="flex items-center mt-1">
                {stats.revenue.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                )}
                <span className="text-xs text-gray-600 font-medium">{stats.revenue.change}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Generated</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.generated.value}</div>
              <div className="flex items-center mt-1">
                {stats.generated.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                )}
                <span className="text-xs text-gray-600 font-medium">{stats.generated.change}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unpaid</CardTitle>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.unpaid.value)}</div>
              <div className="flex items-center mt-1">
                {stats.unpaid.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                )}
                <span className="text-xs text-gray-600 font-medium">{stats.unpaid.change}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.overdue.value}</div>
              <div className="flex items-center mt-1">
                {stats.overdue.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                )}
                <span className="text-xs text-gray-600 font-medium">{stats.overdue.change}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Generate Bill Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Generate Bill</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Consumer</label>
                <Select value={generateForm.consumerId} onValueChange={handleConsumerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    {consumers.map((consumer) => (
                      <SelectItem key={consumer.id} value={consumer.id}>
                        {consumer.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Billing Start Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <Input
                    type="date"
                    value={generateForm.billingStartDate}
                    onChange={(e) => setGenerateForm((prev) => ({ ...prev, billingStartDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Billing End Date</label>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <Input
                    type="date"
                    value={generateForm.billingEndDate}
                    onChange={(e) => setGenerateForm((prev) => ({ ...prev, billingEndDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Previous</label>
                  <Input type="number" value={generateForm.previousReading} disabled placeholder="Auto-filled" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current</label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={generateForm.currentReading}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === "" || !isNaN(Number.parseFloat(value))) {
                        handleCurrentReadingChange(value)
                      }
                    }}
                    placeholder="0"
                    onKeyDown={handleNumberInputKeyDown}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">kWh Used</label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={generateForm.kwhUsed}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "" || !isNaN(Number.parseFloat(value))) {
                      handleKwhChange(value)
                    }
                  }}
                  placeholder="0"
                  onKeyDown={handleNumberInputKeyDown}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Rate (₱/kWh)</label>
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  value={generateForm.rate}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === "" || !isNaN(Number.parseFloat(value))) {
                      setGenerateForm((prev) => ({
                        ...prev,
                        rate: value,
                        total: calculateTotal(prev.kwhUsed, value),
                      }))
                    }
                  }}
                  onKeyDown={handleNumberInputKeyDown}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Total:</label>
                <div className="text-lg font-bold text-blue-600">{generateForm.total}</div>
              </div>

              <Button
                onClick={handleGenerateBill}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={generateLoading}
              >
                {generateLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* All Bills Table */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <CardTitle>All Bills</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    className="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {bills.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No bills found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Consumer</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>kWh</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBills.map((bill) => {
                      const consumer = consumers.find((c) => c.id === bill.consumerId)
                      return (
                        <TableRow key={bill.id}>
                          <TableCell className="font-medium">{consumer?.accountNumber || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <span>{bill.consumerName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{bill.period}</TableCell>
                          <TableCell>{bill.kwhUsed}</TableCell>
                          <TableCell>{formatCurrency(bill.amount)}</TableCell>
                          <TableCell>{getStatusBadge(bill.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                title="View Details"
                                onClick={() => {
                                  setSelectedBill(bill)
                                  setActionDialog({ open: true, type: "view" })
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Edit Status"
                                onClick={() => {
                                  setSelectedBill(bill)
                                  setActionDialog({ open: true, type: "edit" })
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Delete Bill"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setSelectedBill(bill)
                                  setActionDialog({ open: true, type: "delete" })
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Download">
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CRUD dialogs */}
        <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, type: null })}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === "view" && "Bill Details"}
                {actionDialog.type === "edit" && "Edit Bill Status"}
                {actionDialog.type === "delete" && "Delete Bill"}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.type === "view" && "Review bill details and information"}
                {actionDialog.type === "edit" && "Update the status of this bill"}
                {actionDialog.type === "delete" &&
                  "Are you sure you want to delete this bill? This action cannot be undone."}
              </DialogDescription>
            </DialogHeader>

            {actionDialog.type === "view" && selectedBill && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Bill Number</label>
                    <p className="text-sm">{selectedBill.billNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Consumer</label>
                    <p className="text-sm">{selectedBill.consumerName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Period</label>
                    <p className="text-sm">{selectedBill.period}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">kWh Used</label>
                    <p className="text-sm">{selectedBill.kwhUsed}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount</label>
                    <p className="text-sm">{formatCurrency(selectedBill.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-sm">{getStatusBadge(selectedBill.status)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Due Date</label>
                    <p className="text-sm">{formatDate(selectedBill.dueDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-sm">{formatDate(selectedBill.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}

            {actionDialog.type === "edit" && selectedBill && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Billing Period</label>
                  <Input
                    type="text"
                    value={editFormData.period}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, period: e.target.value }))}
                    placeholder="e.g., 01/01/2025 - 01/31/2025"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">kWh Used</label>
                  <Input
                    type="number"
                    value={editFormData.kwhUsed}
                    onChange={(e) => {
                      const kwh = Number.parseFloat(e.target.value) || 0
                      const rate = Number.parseFloat(selectedBill.amount.toString()) / (selectedBill.kwhUsed || 1)
                      setEditFormData((prev) => ({
                        ...prev,
                        kwhUsed: e.target.value,
                        amount: (kwh * rate).toFixed(2),
                      }))
                    }}
                    onKeyDown={handleNumberInputKeyDown}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Amount (₱)</label>
                  <Input
                    type="number"
                    value={Number.parseFloat(editFormData.amount).toFixed(2)}
                    onChange={(e) => setEditFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    onKeyDown={handleNumberInputKeyDown}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select
                    value={editFormData.status}
                    onValueChange={(value) => setEditFormData((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setActionDialog({ open: false, type: null })}
                disabled={actionLoading}
              >
                {actionDialog.type === "view" ? "Close" : "Cancel"}
              </Button>
              {actionDialog.type === "edit" && (
                <Button
                  onClick={() => selectedBill && handleEditBill(selectedBill.id, editFormData)}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={actionLoading}
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              )}
              {actionDialog.type === "delete" && (
                <Button
                  onClick={() => selectedBill && handleDeleteBill(selectedBill.id)}
                  variant="destructive"
                  disabled={actionLoading}
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  Delete
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
