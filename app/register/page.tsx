"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { FileUpload } from "@/components/ui/file-upload"
import { Zap, User, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    accountNumber: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    validIdUrl: "",
    proofOfResidencyUrl: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    if (field === "phone") {
      // Only allow digits and limit to 11 characters
      const numericOnly = value.replace(/[^0-9]/g, "").slice(0, 11)
      setFormData((prev) => ({
        ...prev,
        [field]: numericOnly,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: field === "accountNumber" ? value.toUpperCase() : value,
      }))
    }
  }

  const handleDocumentUpload = (field: "validIdUrl" | "proofOfResidencyUrl", url: string | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: url || "",
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.accountNumber.trim()) {
      setError("Please enter your account number")
      return
    }

    if (!formData.fullName.trim()) {
      setError("Please enter your full name")
      return
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address")
      return
    }

    if (!formData.phone.trim()) {
      setError("Please enter your phone number")
      return
    }

    if (!formData.validIdUrl || !formData.proofOfResidencyUrl) {
      setError("Please upload both Valid ID and Proof of Residency documents")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        alert(
          "Account created successfully! Your documents will be reviewed by our admin team. Please check your email for updates.",
        )
        router.push("/")
      } else {
        setError(data.error || "Registration failed")
      }
    } catch (err) {
      setError("Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
          <p className="text-gray-600">
            Enter your account number and information to create your online account. Your documents will be verified by
            our admin team.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Account Registration</CardTitle>
            <CardDescription>Please fill in all required information to complete your registration</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number *</Label>
                <Input
                  id="accountNumber"
                  type="text"
                  placeholder="Enter your account number (e.g., C001)"
                  value={formData.accountNumber}
                  onChange={(e) => handleInputChange("accountNumber", e.target.value)}
                  maxLength={4}
                  required
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  Enter the account number provided by BAPA. Valid numbers range from C001 to C160.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your 11-digit phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  maxLength={11}
                  inputMode="numeric"
                  required
                  className="h-11"
                />
                <p className="text-xs text-gray-500">Please enter your 11-digit phone number (numbers only)</p>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Please upload clear copies of your valid ID and proof of residency documents. These will be reviewed
                  by the admin.
                </p>

                <FileUpload
                  label="Valid ID"
                  accept="image/*,.pdf"
                  maxSize={5}
                  value={formData.validIdUrl}
                  onChange={(url) => handleDocumentUpload("validIdUrl", url)}
                  required
                  className="mb-6"
                />

                <FileUpload
                  label="Proof of Residency"
                  accept="image/*,.pdf"
                  maxSize={5}
                  value={formData.proofOfResidencyUrl}
                  onChange={(url) => handleDocumentUpload("proofOfResidencyUrl", url)}
                  required
                />
              </div>

              <div className="space-y-2 border-t pt-6">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    required
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                    Privacy Policy
                  </a>{" "}
                  of PowerLink BAPA
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2025 PowerLink BAPA | Barangay Energy Services</p>
        </div>
      </footer>
    </div>
  )
}
