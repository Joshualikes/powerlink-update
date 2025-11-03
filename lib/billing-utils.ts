/**
 * Billing date utilities
 * - Due date: 5th of each month
 * - Overdue period: 6th to 14th of the month
 * - Suspended/Cut off: 15th of the month
 */

export function getDueDateForCurrentMonth(baseDate: Date = new Date()): Date {
  const date = new Date(baseDate)
  date.setDate(5)
  date.setHours(0, 0, 0, 0)
  return date
}

export function getBillingStatus(dueDate: string | Date): "pending" | "overdue" | "suspended" {
  const due = new Date(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  due.setHours(0, 0, 0, 0)

  const dayOfMonth = today.getDate()

  if (dayOfMonth <= 5) {
    return "pending"
  } else if (dayOfMonth >= 6 && dayOfMonth <= 14) {
    return "overdue"
  } else if (dayOfMonth >= 15) {
    return "suspended"
  }

  return "pending"
}

export function getConsumerStatusBasedOnBilling(dueDate: string | Date): "Active" | "Overdue" | "Suspended" {
  const status = getBillingStatus(dueDate)

  if (status === "suspended") {
    return "Suspended"
  } else if (status === "overdue") {
    return "Overdue"
  }

  return "Active"
}

export function generateNextDueDate(): string {
  const today = new Date()
  const currentDay = today.getDate()

  let nextDueDate: Date

  // If we haven't reached the 5th yet this month, use this month's 5th
  if (currentDay < 5) {
    nextDueDate = new Date(today.getFullYear(), today.getMonth(), 5)
  } else {
    // Otherwise, use next month's 5th
    nextDueDate = new Date(today.getFullYear(), today.getMonth() + 1, 5)
  }

  return nextDueDate.toISOString().split("T")[0]
}

export function formatBillingPeriod(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
}

export function isBillPastDueDate(dueDate: string | Date): boolean {
  const due = new Date(dueDate)
  const today = new Date()

  due.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  return today > due
}
