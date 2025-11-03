"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Zap,
  Users,
  Search,
  Eye,
  Bell,
  User,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Filter,
  Download,
  Printer,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
} from "lucide-react"

interface Consumer {
  id: string
  consumerId: string
  accountNumber: string
  fullName: string
  email: string
  phone: string
  address: string
  status: "active" | "inactive" | "suspended" | "overdue"
  connectionDate: string
  lastBillAmount: number
  area: string
}

interface ConsumerStats {
  totalConsumers: number
  activeAccounts: number
  suspended: number
  overdueBills: number
}

type SortField = "consumerId" | "fullName" | "address" | "status" | "lastBillAmount"
type SortDirection = "asc" | "desc"

export default function AdminConsumers() {
  const router = useRouter()
  const [consumers, setConsumers] = useState<Consumer[]>([])
  const [stats, setStats] = useState<ConsumerStats>({
    totalConsumers: 0,
    activeAccounts: 0,
    suspended: 0,
    overdueBills: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [areaFilter, setAreaFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("consumerId")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedConsumer, setSelectedConsumer] = useState<Consumer | null>(null)

  const [newConsumer, setNewConsumer] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    area: "",
    password: "",
  })

  const calculateStats = (consumerList: Consumer[]): ConsumerStats => {
    if (!Array.isArray(consumerList)) {
      console.log("[v0] consumerList is not an array:", consumerList)
      return {
        totalConsumers: 0,
        activeAccounts: 0,
        suspended: 0,
        overdueBills: 0,
      }
    }

    return {
      totalConsumers: consumerList.length,
      activeAccounts: consumerList.filter((c) => c.status === "active").length,
      suspended: consumerList.filter((c) => c.status === "suspended").length,
      overdueBills: consumerList.filter((c) => c.status === "overdue").length,
    }
  }

  const fetchConsumers = async () => {
    try {
      console.log("[v0] Fetching consumers from API...")
      const response = await fetch("/api/admin/consumers")
      if (response.ok) {
        const result = await response.json()
        console.log("[v0] API response result:", result)

        if (result.success && Array.isArray(result.data)) {
          const transformedConsumers = result.data.map((consumer: any) => ({
            id: consumer.id,
            consumerId: `#${consumer.accountNumber}`,
            accountNumber: consumer.accountNumber,
            fullName: consumer.fullName,
            email: consumer.email,
            phone: consumer.contactNumber || "N/A",
            address: consumer.address,
            status: consumer.status,
            connectionDate: consumer.connectionDate,
            lastBillAmount: consumer.lastBillAmount || 0,
            area: consumer.address?.includes("Phase 2") ? "Phase 2" : "Phase 1",
          }))

          setConsumers(transformedConsumers)
          setStats(calculateStats(transformedConsumers))
          console.log("[v0] Successfully loaded consumers from API:", transformedConsumers.length)
        } else {
          console.log("[v0] API returned invalid data format, using mock data")
          loadMockData()
        }
      } else {
        console.log("[v0] API response not ok, using mock data")
        loadMockData()
      }
    } catch (error) {
      console.error("Failed to fetch consumers:", error)
      loadMockData()
    } finally {
      setLoading(false)
    }
  }

  const loadMockData = () => {
    const mockConsumers: Consumer[] = [
      {
        id: "1",
        consumerId: "#C001",
        accountNumber: "ACC001",
        fullName: "Jester Yutiga",
        email: "juan@email.com",
        phone: "09123456789",
        address: "123 Main St, Phase 1",
        status: "active",
        connectionDate: "2024-01-15",
        lastBillAmount: 920.75,
        area: "Phase 1",
      },
      {
        id: "2",
        consumerId: "#C002",
        accountNumber: "ACC002",
        fullName: "Maria Ghina Chutay",
        email: "maria@email.com",
        phone: "09234567890",
        address: "456 Oak Ave, Phase 2",
        status: "overdue",
        connectionDate: "2024-02-20",
        lastBillAmount: 1250.0,
        area: "Phase 2",
      },
      {
        id: "3",
        consumerId: "#C003",
        accountNumber: "ACC003",
        fullName: "Lito Mandi",
        email: "pedro@email.com",
        phone: "09345678901",
        address: "789 Pine Rd, Phase 1",
        status: "active",
        connectionDate: "2024-03-10",
        lastBillAmount: 875.5,
        area: "Phase 1",
      },
      {
        id: "4",
        consumerId: "#C004",
        accountNumber: "ACC004",
        fullName: "Rosalie Bebit",
        email: "ana@email.com",
        phone: "09456789012",
        address: "321 Elm St, Phase 2",
        status: "suspended",
        connectionDate: "2024-04-05",
        lastBillAmount: 2150.25,
        area: "Phase 2",
      },
    ]

    setConsumers(mockConsumers)
    setStats(calculateStats(mockConsumers))
  }

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchConsumers()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    router.push("/admin/login")
  }

  const filteredConsumers = consumers.filter((consumer) => {
    const matchesSearch =
      consumer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumer.consumerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumer.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumer.phone.includes(searchTerm) ||
      consumer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consumer.lastBillAmount.toString().includes(searchTerm)

    const matchesStatus = statusFilter === "all" || consumer.status === statusFilter
    const matchesArea = areaFilter === "all" || consumer.area === areaFilter

    return matchesSearch && matchesStatus && matchesArea
  })

  const sortedConsumers = [...filteredConsumers].sort((a, b) => {
    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === "lastBillAmount") {
      aValue = Number(aValue)
      bValue = Number(bValue)
    } else if (typeof aValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedConsumers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedConsumers = sortedConsumers.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortDirection === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      case "suspended":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>
      case "overdue":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Overdue</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const handleAddConsumer = async () => {
    try {
      const consumer: Consumer = {
        id: Date.now().toString(),
        consumerId: `#C${String(consumers.length + 1).padStart(3, "0")}`,
        accountNumber: `ACC${String(consumers.length + 1).padStart(3, "0")}`,
        fullName: newConsumer.fullName,
        email: newConsumer.email,
        phone: newConsumer.phone,
        address: newConsumer.address,
        status: "active",
        connectionDate: new Date().toISOString().split("T")[0],
        lastBillAmount: 0,
        area: newConsumer.area,
      }

      const response = await fetch("/api/admin/consumers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: newConsumer.fullName,
          email: newConsumer.email,
          contactNumber: newConsumer.phone,
          address: newConsumer.address,
          serviceType: "residential",
          area: newConsumer.area,
          password: newConsumer.password,
        }),
      })

      const result = await response.json()

      if (result.success) {
        await fetchConsumers()
        setNewConsumer({ fullName: "", email: "", phone: "", address: "", area: "", password: "" })
        setIsAddModalOpen(false)
        alert(
          `Consumer added successfully! Account Number: ${result.data.accountNumber}\nThe consumer can now log in with their email and password.`,
        )
      } else {
        alert(`Failed to add consumer: ${result.error}`)
      }
    } catch (error) {
      console.error("Failed to add consumer:", error)
      alert("Failed to add consumer. Please try again.")
    }
  }

  const handleDeleteConsumer = (id: string) => {
    if (confirm("Are you sure you want to delete this consumer?")) {
      const updatedConsumers = consumers.filter((c) => c.id !== id)
      setConsumers(updatedConsumers)
      setStats(calculateStats(updatedConsumers))
    }
  }

  const handleViewConsumer = (consumer: Consumer) => {
    setSelectedConsumer(consumer)
    setIsViewModalOpen(true)
  }

  const handleEditConsumer = (consumer: Consumer) => {
    setSelectedConsumer(consumer)
    setNewConsumer({
      fullName: consumer.fullName,
      email: consumer.email,
      phone: consumer.phone,
      address: consumer.address,
      area: consumer.area,
      password: "", // Reset password field for editing
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateConsumer = async () => {
    if (!selectedConsumer) return

    try {
      const updatedConsumer: Consumer = {
        ...selectedConsumer,
        fullName: newConsumer.fullName,
        email: newConsumer.email,
        phone: newConsumer.phone,
        address: newConsumer.address,
        area: newConsumer.area,
      }

      const updatedConsumers = consumers.map((c) => (c.id === selectedConsumer.id ? updatedConsumer : c))

      setConsumers(updatedConsumers)
      setStats(calculateStats(updatedConsumers))
      setNewConsumer({ fullName: "", email: "", phone: "", address: "", area: "", password: "" })
      setSelectedConsumer(null)
      setIsEditModalOpen(false)
    } catch (error) {
      console.error("Failed to update consumer:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading consumers...</p>
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
              <a href="/admin/consumers" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">
                Consumers
              </a>
              <a href="/admin/billing" className="text-gray-600 hover:text-gray-900 pb-4">
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
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <Button onClick={handleLogout} variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Consumer Management</h2>
            <p className="text-gray-600 mt-1">Manage all registered consumers and their accounts</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" style={{ display: "none" }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Consumer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Consumer</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={newConsumer.fullName}
                    onChange={(e) => setNewConsumer({ ...newConsumer, fullName: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newConsumer.email}
                    onChange={(e) => setNewConsumer({ ...newConsumer, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newConsumer.phone}
                    onChange={(e) => setNewConsumer({ ...newConsumer, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newConsumer.address}
                    onChange={(e) => setNewConsumer({ ...newConsumer, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <Label htmlFor="area">Area</Label>
                  <Select
                    value={newConsumer.area}
                    onValueChange={(value) => setNewConsumer({ ...newConsumer, area: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Phase 1">Phase 1</SelectItem>
                      <SelectItem value="Phase 2">Phase 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="password">Initial Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newConsumer.password}
                    onChange={(e) => setNewConsumer({ ...newConsumer, password: e.target.value })}
                    placeholder="Enter initial password for consumer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This password will be used for the consumer's login account
                  </p>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddConsumer} className="bg-blue-600 hover:bg-blue-700">
                    Add Consumer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Consumers</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.totalConsumers.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Total Consumers</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Accounts</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.activeAccounts.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Active Accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Suspended</CardTitle>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.suspended}</div>
              <p className="text-xs text-gray-500 mt-1">Suspended</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Overdue Bills</CardTitle>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.overdueBills}</div>
              <p className="text-xs text-gray-500 mt-1">Overdue Bills</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search consumers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                <SelectItem value="Phase 1">Phase 1</SelectItem>
                <SelectItem value="Phase 2">Phase 2</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Consumer List</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {paginatedConsumers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No consumers found matching your criteria.</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("consumerId")}>
                        <div className="flex items-center space-x-1">
                          <span>Consumer ID</span>
                          {getSortIcon("consumerId")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("fullName")}>
                        <div className="flex items-center space-x-1">
                          <span>Name</span>
                          {getSortIcon("fullName")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("address")}>
                        <div className="flex items-center space-x-1">
                          <span>Address</span>
                          {getSortIcon("address")}
                        </div>
                      </TableHead>
                      <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => handleSort("status")}>
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          {getSortIcon("status")}
                        </div>
                      </TableHead>
                      <TableHead
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort("lastBillAmount")}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Last Bill</span>
                          {getSortIcon("lastBillAmount")}
                        </div>
                      </TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedConsumers.map((consumer) => (
                      <TableRow key={consumer.id}>
                        <TableCell className="font-medium">{consumer.consumerId}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-gray-600" />
                            </div>
                            <span>{consumer.fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-48 truncate">{consumer.address}</TableCell>
                        <TableCell>{getStatusBadge(consumer.status)}</TableCell>
                        <TableCell>{formatCurrency(consumer.lastBillAmount)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="View Details"
                              className="h-8 w-8 p-0"
                              onClick={() => handleViewConsumer(consumer)}
                            >
                              <Eye className="w-4 h-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit Consumer"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEditConsumer(consumer)}
                            >
                              <Edit className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Delete Consumer"
                              className="h-8 w-8 p-0"
                              onClick={() => handleDeleteConsumer(consumer.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-500">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredConsumers.length)} of{" "}
                    {filteredConsumers.length} consumers
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className={currentPage === page ? "bg-blue-600" : ""}
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* View Modal - Removed Meter Number section */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Consumer Details</DialogTitle>
            </DialogHeader>
            {selectedConsumer && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Consumer ID</Label>
                    <p className="text-sm">{selectedConsumer.consumerId}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Account Number</Label>
                    <p className="text-sm">{selectedConsumer.accountNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                    <p className="text-sm">{selectedConsumer.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="text-sm">{selectedConsumer.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="text-sm">{selectedConsumer.phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="text-sm">{selectedConsumer.address}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Area</Label>
                    <p className="text-sm">{selectedConsumer.area}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Status</Label>
                    <p className="text-sm">{getStatusBadge(selectedConsumer.status)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Connection Date</Label>
                    <p className="text-sm">{selectedConsumer.connectionDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Last Bill Amount</Label>
                    <p className="text-sm">{formatCurrency(selectedConsumer.lastBillAmount)}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Consumer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="editFullName">Full Name</Label>
                <Input
                  id="editFullName"
                  value={newConsumer.fullName}
                  onChange={(e) => setNewConsumer({ ...newConsumer, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={newConsumer.email}
                  onChange={(e) => setNewConsumer({ ...newConsumer, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <Label htmlFor="editPhone">Phone</Label>
                <Input
                  id="editPhone"
                  value={newConsumer.phone}
                  onChange={(e) => setNewConsumer({ ...newConsumer, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="editAddress">Address</Label>
                <Input
                  id="editAddress"
                  value={newConsumer.address}
                  onChange={(e) => setNewConsumer({ ...newConsumer, address: e.target.value })}
                  placeholder="Enter address"
                />
              </div>
              <div>
                <Label htmlFor="editArea">Area</Label>
                <Select
                  value={newConsumer.area}
                  onValueChange={(value) => setNewConsumer({ ...newConsumer, area: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Phase 1">Phase 1</SelectItem>
                    <SelectItem value="Phase 2">Phase 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateConsumer} className="bg-blue-600 hover:bg-blue-700">
                  Update Consumer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
