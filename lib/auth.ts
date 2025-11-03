export interface User {
  id: string
  accountNumber?: string
  username?: string
  email: string
  fullName: string
  role: "admin" | "consumer"
}

export interface LoginCredentials {
  identifier: string // account number for consumers, username for admin
  password: string
}

export interface RegisterData {
  accountNumber: string
  fullName: string
  email: string
  phone: string
  password: string
}

// Mock user data - replace with database queries
const mockUsers = {
  // Admin users
  admin: {
    id: "admin-1",
    username: "admin",
    email: "admin@powerlink-bapa.com",
    fullName: "System Administrator",
    role: "admin" as const,
    passwordHash: "powerlink2025", // In real app, this would be hashed
  },
  // Consumer users
  C001: {
    id: "consumer-1",
    accountNumber: "C001",
    email: "juan.delacruz@email.com",
    fullName: "Jester Yutiga",
    role: "consumer" as const,
    passwordHash: "password123",
  },
  C002: {
    id: "consumer-2",
    accountNumber: "C002",
    email: "maria.santos@email.com",
    fullName: "Maria Ghina Chutay",
    role: "consumer" as const,
    passwordHash: "password123",
  },
  C003: {
    id: "consumer-3",
    accountNumber: "C003",
    email: "pedro.garcia@email.com",
    fullName: "Lito Mandi",
    role: "consumer" as const,
    passwordHash: "password123",
  },
}

// Since admin will verify, we don't need to restrict these
const availableAccountNumbers = Array.from({ length: 160 }, (_, i) => `C${String(i + 1).padStart(3, "0")}`)

const verificationCodes = new Map<string, { code: string; timestamp: number }>()

export async function authenticateUser(
  credentials: LoginCredentials,
  expectedRole?: "admin" | "consumer",
): Promise<User | null> {
  console.log("[v0] Authenticating user with identifier:", credentials.identifier)

  // Check if it's an admin login (username-based)
  if (credentials.identifier === "admin") {
    const adminUser = mockUsers.admin
    if (adminUser.passwordHash === credentials.password) {
      if (expectedRole && expectedRole !== "admin") {
        console.log("[v0] Admin trying to login on consumer page")
        return null
      }
      console.log("[v0] Admin authentication successful")
      return {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: adminUser.role,
      }
    }
    console.log("[v0] Admin authentication failed")
    return null
  }

  // For consumers, check mock users first
  const mockUser = mockUsers[credentials.identifier as keyof typeof mockUsers]
  if (mockUser && mockUser.passwordHash === credentials.password) {
    if (expectedRole && expectedRole !== "consumer") {
      console.log("[v0] Consumer trying to login on admin page")
      return null
    }
    console.log("[v0] Consumer authentication successful")
    return {
      id: mockUser.id,
      accountNumber: mockUser.accountNumber,
      email: mockUser.email,
      fullName: mockUser.fullName,
      role: "consumer",
    }
  }

  console.log("[v0] Authentication failed for identifier:", credentials.identifier)
  return null
}

export async function registerConsumer(data: RegisterData): Promise<{ success: boolean; message: string }> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Validate account number format
    const accountNumberMatch = data.accountNumber.match(/^C(\d{3})$/)
    if (!accountNumberMatch) {
      return {
        success: false,
        message: "Invalid account number format. Please use format C001-C160.",
      }
    }

    const number = Number.parseInt(accountNumberMatch[1], 10)
    if (number < 1 || number > 160) {
      return {
        success: false,
        message: "Account number must be between C001 and C160.",
      }
    }

    // Import database utilities at runtime to avoid circular imports
    const { sql } = await import("./database")
    const { ensureDatabaseInitialized } = await import("./database-init")

    await ensureDatabaseInitialized()

    // Check if account number is already in use
    const existingConsumer = await sql`
      SELECT id FROM consumers WHERE account_number = ${data.accountNumber}
    `

    if (existingConsumer.length > 0) {
      return {
        success: false,
        message: "This account number is already registered.",
      }
    }

    // Create application record for admin approval
    const result = await sql`
      INSERT INTO applications (
        application_id,
        full_name,
        address,
        contact_number,
        email,
        service_type,
        valid_id_url,
        proof_of_residency_url_new,
        status,
        date_submitted
      )
      VALUES (
        'APP' || LPAD(CAST(NEXTVAL('applications_id_seq') AS VARCHAR), 6, '0'),
        ${data.fullName},
        '',
        ${data.phone},
        ${data.email},
        'residential',
        '',
        '',
        'pending',
        NOW()
      )
      RETURNING id, application_id
    `

    console.log("[v0] Application created with ID:", result[0].application_id)

    return {
      success: true,
      message: "Account created successfully! Your documents will be reviewed by our admin team.",
    }
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return {
      success: false,
      message: "Registration failed. Please try again.",
    }
  }
}

export function isValidAccountNumber(accountNumber: string): boolean {
  return availableAccountNumbers.includes(accountNumber) || Object.keys(mockUsers).includes(accountNumber)
}

export function getStoredAuth(): { type: "admin" | "consumer" | null; user: any } {
  if (typeof window === "undefined") return { type: null, user: null }

  const adminToken = localStorage.getItem("admin_token")
  const consumerToken = localStorage.getItem("consumer_token")

  if (adminToken) {
    return {
      type: "admin",
      user: {
        name: "System Administrator",
        role: "admin",
      },
    }
  }

  if (consumerToken) {
    const name = localStorage.getItem("consumer_name")
    const account = localStorage.getItem("consumer_account")
    return {
      type: "consumer",
      user: {
        name: name || "",
        accountNumber: account || "",
        role: "consumer",
      },
    }
  }

  return { type: null, user: null }
}

export function logout(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("admin_token")
  localStorage.removeItem("consumer_token")
  localStorage.removeItem("consumer_name")
  localStorage.removeItem("consumer_account")
}

export interface PasswordResetRequest {
  email: string
  verificationCode: string
  newPassword: string
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Check if email exists in mock users
  const userExists = Object.values(mockUsers).some((user) => user.email === email)

  if (!userExists) {
    // For security, don't reveal if email exists
    return {
      success: true,
      message: "If an account exists with this email, a verification code has been sent.",
    }
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  verificationCodes.set(email, { code, timestamp: Date.now() })

  // In production, send email with verification code
  console.log(`[v0] Password reset code for ${email}: ${code}`)

  return {
    success: true,
    message: "Verification code sent to your email.",
  }
}

export async function verifyResetCode(email: string, code: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const stored = verificationCodes.get(email)
  if (!stored) return false

  // Check if code is expired (15 minutes)
  const isExpired = Date.now() - stored.timestamp > 15 * 60 * 1000
  if (isExpired) {
    verificationCodes.delete(email)
    return false
  }

  return stored.code === code
}

export async function resetPassword(
  email: string,
  newPassword: string,
): Promise<{ success: boolean; message: string }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Find user by email
  const userEntry = Object.entries(mockUsers).find(([_, user]) => user.email === email)

  if (!userEntry) {
    return {
      success: false,
      message: "User not found.",
    }
  }

  // In production, hash the password and update in database
  const [key, user] = userEntry
  mockUsers[key as keyof typeof mockUsers].passwordHash = newPassword

  // Clear verification code
  verificationCodes.delete(email)

  console.log(`[v0] Password reset successful for ${email}`)

  return {
    success: true,
    message: "Password has been reset successfully.",
  }
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return hashHex
}
