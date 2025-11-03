"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  label: string
  accept?: string
  maxSize?: number // in MB
  value?: string
  onChange?: (url: string | null) => void
  disabled?: boolean
  required?: boolean
  className?: string
}

export function FileUpload({
  label,
  accept = "image/*,.pdf",
  maxSize = 5,
  value,
  onChange,
  disabled = false,
  required = false,
  className,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    setError(null)

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    const acceptedTypes = accept.split(",").map((type) => type.trim())
    const isValidType = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase())
      }
      return file.type.match(type.replace("*", ".*"))
    })

    if (!isValidType) {
      setError("Invalid file type")
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        onChange?.(result.data.url)
      } else {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      setError("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)

    if (disabled || uploading) return

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled && !uploading) {
      setDragActive(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    onChange?.(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getFileName = (url: string) => {
    return url.split("/").pop() || "Uploaded file"
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {value ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">{getFileName(value)}</p>
                  <p className="text-xs text-green-600">File uploaded successfully</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(value, "_blank")}
                  className="text-green-600 hover:text-green-700"
                >
                  <File className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400",
            disabled && "opacity-50 cursor-not-allowed",
            error && "border-red-300 bg-red-50",
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {uploading ? "Uploading..." : "Click to upload or drag and drop"}
              </p>
              <p className="text-xs text-gray-500">
                {accept.includes("image") && "Images"}
                {accept.includes("pdf") && accept.includes("image") && " or "}
                {accept.includes("pdf") && "PDF files"} up to {maxSize}MB
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        disabled={disabled || uploading}
        className="hidden"
      />
    </div>
  )
}
