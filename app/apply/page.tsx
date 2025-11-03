"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Zap, FileText, Award as IdCard, Home, CheckCircle, Phone, Mail } from "lucide-react"
import Link from "next/link"

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <Link href="/login">
              <Button variant="outline" size="sm" className="bg-transparent">
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Apply for BAPA Membership</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join PowerLink BAPA for reliable electricity service in your barangay. Follow our simple application process
            to get connected.
          </p>
        </div>

        {/* Application Process */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Step 1: Submit Application</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Complete the application form with your personal information and contact details.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-lg">Step 2: Document Review</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our team will review your application and supporting documents within 3-5 business days.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IdCard className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Step 3: Get Account Number</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Once approved, you'll receive your unique account number to create your online account.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Requirements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Required Documents</span>
            </CardTitle>
            <CardDescription>Please prepare the following documents for your application</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <IdCard className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Valid Government ID</h3>
                  <p className="text-gray-600 text-sm">Any government-issued ID such as:</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Driver's License</li>
                    <li>• Passport</li>
                    <li>• PhilID / National ID</li>
                    <li>• SSS ID</li>
                    <li>• Voter's ID</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Home className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Proof of Residency</h3>
                  <p className="text-gray-600 text-sm">Document showing your current address:</p>
                  <ul className="text-sm text-gray-600 mt-1 space-y-1">
                    <li>• Barangay Certificate</li>
                    <li>• Utility Bill (Water/Internet)</li>
                    <li>• Lease Agreement</li>
                    <li>• Property Tax Receipt</li>
                    <li>• Certificate of Residency</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Form Alert */}
        <Alert className="mb-8">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Applications must be submitted in person at the PowerLink BAPA office. Online
            account creation is only available after your application has been approved and you receive your account
            number.
          </AlertDescription>
        </Alert>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Office Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <Home className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="font-medium">PowerLink BAPA Office</p>
                  <p className="text-gray-600 text-sm">
                    BAPA Masbataño
                    <br />
                    Barangay Capunitan
                    <br />
                    Orion, Bataan 2102
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Office Hours:</strong>
                </p>
                <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
                <p>Saturday: 8:00 AM - 12:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-gray-600">0928-331-3902</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-600">BAPAMasbatano@gmail.com</p>
                </div>
              </div>
              <div className="pt-3">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Applications processed within 3-5 business days
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 mb-8">
          <CardHeader>
            <CardTitle className="text-center">Already have an account number?</CardTitle>
            <CardDescription className="text-center">
              If your application has been approved and you received your account number, you can create your online
              account now.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/register">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Create Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2025 PowerLink BAPA | Barangay Energy Services</p>
          <p className="text-xs text-gray-400 mt-1">Reliable electricity for our community</p>
        </div>
      </footer>
    </div>
  )
}
