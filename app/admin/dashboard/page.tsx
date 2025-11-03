"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Users,
  FileText,
  DollarSign,
  Activity,
  LogOut,
  Bell,
  User,
  TrendingUp,
  TrendingDown,
  Clock,
  CreditCard,
} from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DashboardData {
  stats: {
    totalConsumers: { value: number; change: number; trend: string }
    unpaidBills: { value: number; change: number; trend: string }
    newApplications: { value: number; change: number; trend: string }
    readingsNeeded: { value: number; change: number; trend: string }
  }
  energyConsumption: Array<{ month: string; consumption: number }>
  recentActivities: Array<{
    id: number
    type: string
    title: string
    description: string
    icon: string
    color: string
  }>
}

export default function AdminDashboard() {
  const router = useRouter()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState("6 months")

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem("admin_token")
    if (!token) {
      router.push("/admin/login")
      return
    }

    // Fetch dashboard data
    fetchDashboardData()

    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [router])

  const fetchDashboardData = async () => {
    try {
      console.log("[v0] Fetching dashboard data...")
      const response = await fetch(`/api/admin/dashboard?period=${encodeURIComponent(selectedPeriod)}`)
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      } else {
        throw new Error("API failed")
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dashboardData) {
      fetchDashboardData()
    }
  }, [selectedPeriod])

  const handleLogout = () => {
    localStorage.removeItem("admin_token")
    router.push("/admin/login")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getActivityIcon = (iconType: string) => {
    switch (iconType) {
      case "user":
        return <User className="w-4 h-4" />
      case "bell":
        return <Bell className="w-4 h-4" />
      case "file":
        return <FileText className="w-4 h-4" />
      case "credit-card":
        return <CreditCard className="w-4 h-4" />
      case "activity":
        return <Activity className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getActivityColor = (color: string) => {
    switch (color) {
      case "blue":
        return "bg-blue-500"
      case "yellow":
        return "bg-yellow-500"
      case "green":
        return "bg-green-500"
      case "red":
        return "bg-red-500"
      case "purple":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleWidgetClick = (widgetType: string) => {
    switch (widgetType) {
      case "consumers":
        router.push("/admin/consumers")
        break
      case "billing":
        router.push("/admin/billing")
        break
      case "applications":
        router.push("/admin/applications")
        break
      case "readings":
        router.push("/admin/billing")
        break
      default:
        break
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading dashboard...</p>
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
              <a href="/admin/dashboard" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-4">
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
              <a href="/admin/announcements" className="text-gray-600 hover:text-gray-900 pb-4">
                Announcements
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => (window.location.href = "/admin/applications")}
                  className="cursor-pointer hover:opacity-70"
                  title="View new applications"
                >
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
                <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center p-0">
                  {dashboardData?.stats.newApplications.value || 0}
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
          <h2 className="text-2xl font-bold">Dashboard Overview</h2>
          <p className="text-blue-100 mt-1">Energy management system status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleWidgetClick("consumers")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Consumers</CardTitle>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {dashboardData?.stats.totalConsumers.value.toLocaleString()}
              </div>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">
                  +{dashboardData?.stats.totalConsumers.change}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleWidgetClick("billing")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unpaid Bills</CardTitle>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(dashboardData?.stats.unpaidBills.value || 0)}
              </div>
              <div className="flex items-center mt-1">
                <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
                <span className="text-xs text-red-600 font-medium">{dashboardData?.stats.unpaidBills.change}%</span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleWidgetClick("applications")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">New Applications</CardTitle>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.newApplications.value}</div>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-xs text-green-600 font-medium">
                  +{dashboardData?.stats.newApplications.change}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleWidgetClick("readings")}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Readings Needed</CardTitle>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Activity className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{dashboardData?.stats.readingsNeeded.value}</div>
              <div className="flex items-center mt-1">
                <Clock className="w-3 h-3 text-red-600 mr-1" />
                <span className="text-xs text-red-600 font-medium">Pending</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Energy Consumption</CardTitle>
                  <CardDescription>Monthly energy usage overview</CardDescription>
                </div>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6 months">6 months</SelectItem>
                    <SelectItem value="12 months">12 months</SelectItem>
                    <SelectItem value="24 months">24 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {dashboardData?.energyConsumption &&
              Array.isArray(dashboardData.energyConsumption) &&
              dashboardData.energyConsumption.length > 0 ? (
                <ChartContainer
                  config={{
                    consumption: {
                      label: "Energy Consumption (kWh)",
                      color: "#3b82f6",
                    },
                  }}
                  className="h-[300px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardData.energyConsumption}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} tickLine={false} />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="consumption"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-500">
                  <p>No energy consumption data available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentActivities &&
                Array.isArray(dashboardData.recentActivities) &&
                dashboardData.recentActivities.length > 0 ? (
                  dashboardData.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div
                        className={`w-8 h-8 ${getActivityColor(activity.color || "gray")} rounded-full flex items-center justify-center text-white flex-shrink-0`}
                      >
                        {getActivityIcon(activity.icon || "activity")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.title || "Unknown Activity"}</p>
                        <p className="text-xs text-gray-500">{activity.description || "No description available"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No recent activities</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
