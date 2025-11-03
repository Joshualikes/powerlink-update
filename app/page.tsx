"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Zap, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const adminToken = localStorage.getItem("admin_token")
    const consumerToken = localStorage.getItem("consumer_token")

    if (adminToken) {
      router.push("/admin/dashboard")
    } else if (consumerToken) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo and Title */}
        <div className="mb-12">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">PowerLink BAPA</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Barangay Energy Services - Reliable electricity management for our community
          </p>
        </div>

        <div className="flex justify-center max-w-md mx-auto">
          <Card className="shadow-xl hover:shadow-2xl transition-shadow w-full">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Consumer Portal</CardTitle>
              <CardDescription>Access your account, view bills, and manage your electricity service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/login" className="block">
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  Consumer Login
                </Button>
              </Link>
              <Link href="/apply" className="block">
                <Button variant="outline" className="w-full h-12 bg-transparent">
                  Apply for Membership
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">© 2025 PowerLink BAPA | Barangay Energy Services</p>
          <p className="text-xs text-gray-400 mt-1">Serving our community with reliable electricity</p>
        </div>
      </div>
    </div>
  )
}
