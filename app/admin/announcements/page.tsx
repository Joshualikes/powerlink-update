"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  Zap,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Bell,
  User,
  AlertTriangle,
  Info,
  Gift,
  CreditCard,
  Calendar,
  Search,
} from "lucide-react"

interface Announcement {
  id: number
  title: string
  message: string
  type: "outage" | "promotion" | "payment" | "general"
  created_at: string
  is_active: boolean
}

export default function AdminAnnouncements() {
  const router = useRouter()
  const { toast } = useToast()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "general" as const,
    is_active: true,
  })

  useEffect(() => {
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchAnnouncements()
  }, [router])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/announcements")
      if (response.ok) {
        const data = await response.json()
        setAnnouncements(data)
      } else {
        throw new Error("Failed to fetch announcements")
      }
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
      toast({
        title: "Error",
        description: "Failed to load announcements",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    router.push("/admin/login")
  }

  const handleCreateAnnouncement = async () => {
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchAnnouncements()
        setIsCreateDialogOpen(false)
        resetForm()
        toast({
          title: "Success",
          description: "Announcement created successfully",
        })
      } else {
        throw new Error("Failed to create announcement")
      }
    } catch (error) {
      console.error("Failed to create announcement:", error)
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      })
    }
  }

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement) return

    try {
      const response = await fetch(`/api/admin/announcements/${editingAnnouncement.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchAnnouncements()
        setEditingAnnouncement(null)
        resetForm()
        toast({
          title: "Success",
          description: "Announcement updated successfully",
        })
      } else {
        throw new Error("Failed to update announcement")
      }
    } catch (error) {
      console.error("Failed to update announcement:", error)
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return

    try {
      const response = await fetch(`/api/admin/announcements/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchAnnouncements()
        toast({
          title: "Success",
          description: "Announcement deleted successfully",
        })
      } else {
        throw new Error("Failed to delete announcement")
      }
    } catch (error) {
      console.error("Failed to delete announcement:", error)
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "general",
      is_active: true,
    })
  }

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      is_active: announcement.is_active,
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "outage":
        return <AlertTriangle className="w-4 h-4" />
      case "promotion":
        return <Gift className="w-4 h-4" />
      case "payment":
        return <CreditCard className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "outage":
        return "bg-red-100 text-red-800"
      case "promotion":
        return "bg-green-100 text-green-800"
      case "payment":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.message.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || announcement.type === filterType
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading announcements...</p>
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
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
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
              <a href="/admin/applications" className="text-gray-600 hover:text-gray-900 pb-4">
                Applications
              </a>
              <a href="/admin/announcements" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">
                Announcements
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                  {announcements.filter((a) => a.is_active).length}
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold">Announcements Management</h2>
          <p className="text-blue-100 mt-1">Manage system announcements and notifications</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-80"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="outage">Outage</SelectItem>
                <SelectItem value="promotion">Promotion</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                New Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Announcement</DialogTitle>
                <DialogDescription>Create a new announcement that will be visible to consumers.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter announcement title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter announcement message"
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="outage">Outage</SelectItem>
                        <SelectItem value="promotion">Promotion</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="is_active">Status</Label>
                    <Select
                      value={formData.is_active ? "active" : "inactive"}
                      onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAnnouncement} className="bg-blue-600 hover:bg-blue-700">
                  Create Announcement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Announcements</CardTitle>
            <CardDescription>Manage and monitor all system announcements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAnnouncements.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No announcements found</p>
                </div>
              ) : (
                filteredAnnouncements.map((announcement) => (
                  <div key={announcement.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                          <Badge className={`${getTypeColor(announcement.type)} flex items-center gap-1`}>
                            {getTypeIcon(announcement.type)}
                            {announcement.type}
                          </Badge>
                          <Badge variant={announcement.is_active ? "default" : "secondary"}>
                            {announcement.is_active ? "active" : "inactive"}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{announcement.message}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Created: {new Date(announcement.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(announcement)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteAnnouncement(announcement.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={!!editingAnnouncement} onOpenChange={() => setEditingAnnouncement(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
              <DialogDescription>Update the announcement details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-message">Message</Label>
                <Textarea
                  id="edit-message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter announcement message"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="outage">Outage</SelectItem>
                      <SelectItem value="promotion">Promotion</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.is_active ? "active" : "inactive"}
                    onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingAnnouncement(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateAnnouncement} className="bg-blue-600 hover:bg-blue-700">
                Update Announcement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
