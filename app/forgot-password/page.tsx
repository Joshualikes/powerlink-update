"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap, Mail, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

type Step = "request" | "verify" | "reset" | "success"

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("request")
  const [email, setEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [mockCode] = useState("123456")

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setStep("verify")
      // In production, this would send an actual email with a verification code
      console.log("[v0] Verification code sent to:", email, "Code:", mockCode)
    }, 1500)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    setTimeout(() => {
      if (verificationCode === mockCode) {
        setIsLoading(false)
        setStep("reset")
      } else {
        setError("Invalid verification code. Please try again.")
        setIsLoading(false)
      }
    }, 1000)
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    setIsLoading(true)

    setTimeout(() => {
      setIsLoading(false)
      setStep("success")
      // In production, this would update the password in the database
      console.log("[v0] Password reset successful for:", email)
    }, 1500)
  }

  if (step === "request") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Reset Password</CardTitle>
              <CardDescription className="text-gray-600 mt-1">
                Enter your email to receive a verification code
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequestReset} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <Link
                href="/login"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Login
              </Link>
            </div>

            <Alert className="mt-4">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                <strong>Need help?</strong> Contact the PowerLink BAPA office at (02) 8123-4567 or visit us during
                office hours.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <p className="text-xs text-gray-500 text-center">© 2025 PowerLink BAPA | Barangay Energy Services</p>
        </div>
      </div>
    )
  }

  if (step === "verify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Enter Verification Code</CardTitle>
              <CardDescription className="text-gray-600 mt-1">We sent a 6-digit code to {email}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <AlertDescription>
                  <strong>Demo Mode:</strong> Use code <strong>123456</strong> to continue
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                  maxLength={6}
                  className="h-11 text-center text-2xl tracking-widest"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <button
                onClick={() => setStep("request")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Didn't receive the code? Send again
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <p className="text-xs text-gray-500 text-center">© 2025 PowerLink BAPA | Barangay Energy Services</p>
        </div>
      </div>
    )
  }

  if (step === "reset") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Create New Password</CardTitle>
              <CardDescription className="text-gray-600 mt-1">Enter your new password below</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

              <Button
                type="submit"
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <p className="text-xs text-gray-500 text-center">© 2025 PowerLink BAPA | Barangay Energy Services</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <Mail className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Password Reset Successful!</CardTitle>
            <CardDescription className="text-gray-600 mt-1">Your password has been updated</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">You can now log in with your new password.</p>
          <Link href="/login">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Go to Login</Button>
          </Link>
        </CardContent>
      </Card>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <p className="text-xs text-gray-500 text-center">© 2025 PowerLink BAPA | Barangay Energy Services</p>
      </div>
    </div>
  )
}
