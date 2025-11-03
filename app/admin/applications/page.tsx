"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import {
  Zap,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Download,
  Eye,
  Check,
  X,
  Trash2,
  Bell,
  User,
  LogOut,
  Filter,
  RefreshCw,
  Copy,
  FileText,
  ExternalLink,
} from "lucide-react"

interface Application {
  id: string
  accountNumber: string | null
  fullName: string
  address: string
  contactNumber: string
  email: string
  serviceType: string
  validIdUrl: string
  proofOfResidencyUrl: string
  status: "pending" | "approved" | "declined"
  dateSubmitted: string
  dateProcessed: string | null
  processedBy: string | null
  notes: string | null
}

interface ApplicationStats {
  total: number
  pending: number
  approved: number
  declined: number
}

export default function AdminApplications() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats>({ total: 0, pending: 0, approved: 0, declined: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    type: "approve" | "decline" | "delete" | "view" | null
  }>({
    open: false,
    type: null,
  })
  const [notes, setNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [generatedAccountNumber, setGeneratedAccountNumber] = useState("")

  // ... existing useEffect and fetchApplications ...

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchApplications()
  }, [router])

  const fetchApplications = async () => {
    try {
      console.log("[v0] Fetching applications...")

      const response = await fetch("/api/admin/applications")
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setApplications(data.data.applications)
          setStats(data.data.stats)
          return
        }
      }
      throw new Error("API failed")
    } catch (error) {
      console.error("Failed to fetch applications:", error)
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ... existing handleAction, handleLogout, handleExport functions ...

  const handleAction = async (action: "approve" | "decline" | "delete") => {
    if (!selectedApplication) return

    setActionLoading(true)
    try {
      console.log(`[v0] ${action}ing application:`, selectedApplication.id)

      if (action === "delete") {
        const response = await fetch(`/api/admin/applications/${selectedApplication.id}`, {
          method: "DELETE",
        })

        if (response.ok) {
          await fetchApplications()
          toast({
            title: "Success",
            description: "Application deleted successfully",
          })
        } else {
          throw new Error("Failed to delete")
        }
      } else {
        const response = await fetch(`/api/admin/applications/${selectedApplication.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: action === "approve" ? "approved" : "declined",
            notes,
          }),
        })

        const result = await response.json()

        if (response.ok && result.success) {
          if (action === "approve" && result.accountNumber) {
            setGeneratedAccountNumber(result.accountNumber)
            toast({
              title: "Success",
              description: `Application approved! Account number: ${result.accountNumber}`,
            })
          } else {
            toast({
              title: "Success",
              description: `Application ${action}d successfully`,
            })
          }
          await fetchApplications()
        } else {
          throw new Error("Failed to update")
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} application:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} application`,
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }

    setActionDialog({ open: false, type: null })
    setSelectedApplication(null)
    setNotes("")
    setGeneratedAccountNumber("")
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    router.push("/admin/login")
  }

  const handleExport = () => {
    const csvContent = [
      ["Account Number", "Full Name", "Email", "Contact", "Address", "Service Type", "Status", "Date Submitted"].join(
        ",",
      ),
      ...applications.map((app) =>
        [
          app.accountNumber || "N/A",
          app.fullName,
          app.email,
          app.contactNumber,
          `"${app.address}"`,
          app.serviceType,
          app.status,
          new Date(app.dateSubmitted).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `applications-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Success",
      description: "Applications exported successfully",
    })
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.accountNumber && app.accountNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || app.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
      case "declined":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const openDocument = (url: string | null) => {
    if (url) {
      window.open(url, "_blank")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading applications...</p>
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
              <a href="/admin/billing" className="text-gray-600 hover:text-gray-900 pb-4">
                Billing
              </a>
              <a href="/admin/applications" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">
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
                  {stats.pending}
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
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Applications</h2>
          <p className="text-gray-600 mt-1">Manage member applications and approvals</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.approved}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Declined</CardTitle>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stats.declined}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search applicant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchApplications}
              disabled={loading}
              className="flex items-center space-x-2 bg-transparent"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button variant="outline" onClick={handleExport} className="flex items-center space-x-2 bg-transparent">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Applications ({applications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No applications found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Number</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell className="font-medium">{application.accountNumber || "Pending"}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{application.fullName}</div>
                          <div className="text-sm text-gray-500">{application.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>{application.contactNumber}</TableCell>
                      <TableCell>{formatDate(application.dateSubmitted)}</TableCell>
                      <TableCell>{getStatusBadge(application.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application)
                              setActionDialog({ open: true, type: "view" })
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {application.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(application)
                                  setActionDialog({ open: true, type: "approve" })
                                }}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedApplication(application)
                                  setActionDialog({ open: true, type: "decline" })
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedApplication(application)
                              setActionDialog({ open: true, type: "delete" })
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ open, type: null })}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {actionDialog.type === "view" && "Application Details & Documents"}
                {actionDialog.type === "approve" && "Approve Application"}
                {actionDialog.type === "decline" && "Decline Application"}
                {actionDialog.type === "delete" && "Delete Application"}
              </DialogTitle>
              <DialogDescription>
                {actionDialog.type === "view" && "Review application details and uploaded documents"}
                {actionDialog.type === "approve" && "Approve this application and generate account number"}
                {actionDialog.type === "decline" && "Decline this application with optional notes"}
                {actionDialog.type === "delete" && "Permanently delete this application"}
              </DialogDescription>
            </DialogHeader>

            {actionDialog.type === "view" && selectedApplication && (
              <div className="space-y-6">
                <div className="border-b pb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Valid ID Preview */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <p className="font-medium text-gray-900">Valid ID</p>
                        </div>
                        {selectedApplication.validIdUrl ? (
                          <div className="space-y-2">
                            <button
                              onClick={() => openDocument(selectedApplication.validIdUrl)}
                              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>View Document</span>
                            </button>
                            <p className="text-xs text-gray-600 break-all">{selectedApplication.validIdUrl}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No document uploaded</p>
                        )}
                      </div>
                    </div>

                    {/* Proof of Residency Preview */}
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-gray-100 p-4">
                        <div className="flex items-center space-x-2 mb-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <p className="font-medium text-gray-900">Proof of Residency</p>
                        </div>
                        {selectedApplication.proofOfResidencyUrl ? (
                          <div className="space-y-2">
                            <button
                              onClick={() => openDocument(selectedApplication.proofOfResidencyUrl)}
                              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span>View Document</span>
                            </button>
                            <p className="text-xs text-gray-600 break-all">{selectedApplication.proofOfResidencyUrl}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No document uploaded</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Full Name</label>
                    <p className="text-sm">{selectedApplication.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Account Number</label>
                    <p className="text-sm">{selectedApplication.accountNumber || "Not yet assigned"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contact Number</label>
                    <p className="text-sm">{selectedApplication.contactNumber}</p>
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-600">Address</label>
                    <p className="text-sm">{selectedApplication.address}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Service Type</label>
                    <p className="text-sm capitalize">{selectedApplication.serviceType}</p>
                  </div>
                </div>
              </div>
            )}

            {(actionDialog.type === "approve" || actionDialog.type === "decline") && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <Textarea
                    placeholder="Add any notes or comments..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            )}

            {generatedAccountNumber && actionDialog.type === "approve" && (
              <div className="bg-green-50 border-green-200 flex items-center p-4">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <p className="text-green-800">
                  <strong>Account Number Generated:</strong> {generatedAccountNumber}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedAccountNumber)
                    toast({ title: "Copied", description: "Account number copied to clipboard" })
                  }}
                  className="ml-2"
                >
                  <Copy className="w-4 h-4" />
                </Button>
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
              {actionDialog.type !== "view" && (
                <Button
                  onClick={() => actionDialog.type && handleAction(actionDialog.type)}
                  variant={actionDialog.type === "delete" ? "destructive" : "default"}
                  disabled={actionLoading}
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                  {actionDialog.type === "approve" && "Approve"}
                  {actionDialog.type === "decline" && "Decline"}
                  {actionDialog.type === "delete" && "Delete"}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
