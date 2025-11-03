interface Consumer {
  id: string
  name: string
  email: string
  address: string
  account_number: string
  status: "Active" | "Suspended" | "Overdue"
  connection_date: string
  service_type: string
  last_bill_amount: number
  last_payment_date: string
  next_reading_date: string
}

interface Bill {
  id: string
  bill_number: string
  consumer_id: string
  consumer_name: string
  period: string
  kwh_used: number
  amount: number
  status: "Paid" | "Overdue" | "Pending"
  due_date: string
  created_at: string
}

interface Application {
  id: string
  name: string
  email: string
  address: string
  phone: string
  service_type: string
  status: "Pending" | "Approved" | "Rejected"
  submitted_at: string
  processed_at?: string
}

interface Announcement {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  created_at: string
  is_active: boolean
}

interface MeterReading {
  id: string
  consumer_id: string
  reading_value: number
  reading_date: string
}

class MockDataStore {
  private consumers: Consumer[] = [
    {
      id: "1",
      name: "Jester Yutiga",
      email: "juan@email.com",
      address: "123 Main St, Zone A",
      account_number: "C001",
      status: "Active",
      connection_date: "2020-01-15",
      service_type: "Residential",
      last_bill_amount: 920.75,
      last_payment_date: "2025-04-22",
      next_reading_date: "2025-05-20",
    },
    {
      id: "2",
      name: "Maria Ghina Chutay",
      email: "maria@email.com",
      address: "456 Oak Ave, Zone B",
      account_number: "C002",
      status: "Overdue",
      connection_date: "2019-03-10",
      service_type: "Residential",
      last_bill_amount: 1250.0,
      last_payment_date: "2025-03-15",
      next_reading_date: "2025-05-22",
    },
    {
      id: "3",
      name: "Lito Mandi",
      email: "pedro@email.com",
      address: "789 Pine Rd, Zone C",
      account_number: "C003",
      status: "Active",
      connection_date: "2021-06-20",
      service_type: "Residential",
      last_bill_amount: 875.5,
      last_payment_date: "2025-04-18",
      next_reading_date: "2025-05-25",
    },
    {
      id: "4",
      name: "Rosalie Bebit",
      email: "ana@email.com",
      address: "321 Elm St, Zone A",
      account_number: "C004",
      status: "Suspended",
      connection_date: "2018-11-05",
      service_type: "Residential",
      last_bill_amount: 2150.25,
      last_payment_date: "2025-02-10",
      next_reading_date: "2025-05-28",
    },
  ]

  private bills: Bill[] = [
    {
      id: "1",
      bill_number: "#B001",
      consumer_id: "1",
      consumer_name: "Jester Yutiga",
      period: "Apr 20 - May 24, 2025",
      kwh_used: 245,
      amount: 920.75,
      status: "Pending",
      due_date: "2025-05-05",
      created_at: "2025-04-25",
    },
    {
      id: "2",
      bill_number: "#B002",
      consumer_id: "2",
      consumer_name: "Maria Ghina Chutay",
      period: "Apr 15 - May 19, 2025",
      kwh_used: 312,
      amount: 1250.0,
      status: "Overdue",
      due_date: "2025-05-05",
      created_at: "2025-04-20",
    },
    {
      id: "3",
      bill_number: "#B003",
      consumer_id: "3",
      consumer_name: "Lito Mandi",
      period: "Apr 18 - May 22, 2025",
      kwh_used: 198,
      amount: 875.5,
      status: "Paid",
      due_date: "2025-05-05",
      created_at: "2025-04-23",
    },
  ]

  private applications: Application[] = [
    {
      id: "1",
      name: "Carlos Mendoza",
      email: "carlos@email.com",
      address: "555 New St, Zone D",
      phone: "09123456789",
      service_type: "Residential",
      status: "Pending",
      submitted_at: "2025-05-01",
    },
    {
      id: "2",
      name: "Lisa Torres",
      email: "lisa@email.com",
      address: "777 Fresh Ave, Zone E",
      phone: "09987654321",
      service_type: "Commercial",
      status: "Pending",
      submitted_at: "2025-05-03",
    },
  ]

  private announcements: Announcement[] = [
    {
      id: "1",
      title: "Scheduled Power Outage",
      message: "May 30, 2025, from 7 PM to 5 PM for maintenance work.",
      type: "warning",
      created_at: "2025-05-15",
      is_active: true,
    },
    {
      id: "2",
      title: "Bill Payment Discount",
      message: "Get 5% discount when you pay before May 22, 2025.",
      type: "success",
      created_at: "2025-05-10",
      is_active: true,
    },
    {
      id: "3",
      title: "New Online Payment Option",
      message: "You can now pay through GCash and PayMaya.",
      type: "info",
      created_at: "2025-05-08",
      is_active: true,
    },
  ]

  private meterReadings: MeterReading[] = [
    {
      id: "1",
      consumer_id: "1",
      reading_value: 1245,
      reading_date: "2025-04-20",
    },
    {
      id: "2",
      consumer_id: "2",
      reading_value: 3456,
      reading_date: "2025-04-15",
    },
    {
      id: "3",
      consumer_id: "3",
      reading_value: 2100,
      reading_date: "2025-04-18",
    },
  ]

  // Consumer methods
  getConsumers(): Consumer[] {
    return [...this.consumers]
  }

  addConsumer(consumer: Omit<Consumer, "id">): Consumer {
    const newConsumer = {
      ...consumer,
      id: (this.consumers.length + 1).toString(),
    }
    this.consumers.push(newConsumer)
    return newConsumer
  }

  updateConsumer(id: string, updates: Partial<Consumer>): Consumer | null {
    const index = this.consumers.findIndex((c) => c.id === id)
    if (index === -1) return null

    this.consumers[index] = { ...this.consumers[index], ...updates }
    return this.consumers[index]
  }

  deleteConsumer(id: string): boolean {
    const index = this.consumers.findIndex((c) => c.id === id)
    if (index === -1) return false

    this.consumers.splice(index, 1)
    return true
  }

  // Bill methods
  getBills(): Bill[] {
    return [...this.bills]
  }

  addBill(bill: Omit<Bill, "id" | "bill_number" | "created_at">): Bill {
    const newBill = {
      ...bill,
      id: (this.bills.length + 1).toString(),
      bill_number: `#B${String(this.bills.length + 1).padStart(3, "0")}`,
      created_at: new Date().toISOString().split("T")[0],
    }
    this.bills.push(newBill)
    return newBill
  }

  updateBill(id: string, updates: Partial<Bill>): Bill | null {
    const index = this.bills.findIndex((b) => b.id === id)
    if (index === -1) return null

    this.bills[index] = { ...this.bills[index], ...updates }
    return this.bills[index]
  }

  deleteBill(id: string): boolean {
    const index = this.bills.findIndex((b) => b.id === id)
    if (index === -1) return false

    this.bills.splice(index, 1)
    return true
  }

  // Application methods
  getApplications(): Application[] {
    return [...this.applications]
  }

  updateApplication(id: string, updates: Partial<Application>): Application | null {
    const index = this.applications.findIndex((a) => a.id === id)
    if (index === -1) return null

    this.applications[index] = {
      ...this.applications[index],
      ...updates,
      processed_at: updates.status ? new Date().toISOString().split("T")[0] : this.applications[index].processed_at,
    }

    // If approved, add as consumer
    if (updates.status === "Approved") {
      const app = this.applications[index]
      const accountNumber = `C${String(this.consumers.length + 1).padStart(3, "0")}`
      this.addConsumer({
        name: app.name,
        email: app.email,
        address: app.address,
        account_number: accountNumber,
        status: "Active",
        connection_date: new Date().toISOString().split("T")[0],
        service_type: app.service_type,
        last_bill_amount: 0,
        last_payment_date: "",
        next_reading_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      })
    }

    return this.applications[index]
  }

  // Announcement methods
  getAnnouncements(): Announcement[] {
    return [...this.announcements]
  }

  addAnnouncement(announcement: Omit<Announcement, "id" | "created_at">): Announcement {
    const newAnnouncement = {
      ...announcement,
      id: (this.announcements.length + 1).toString(),
      created_at: new Date().toISOString().split("T")[0],
    }
    this.announcements.push(newAnnouncement)
    return newAnnouncement
  }

  updateAnnouncement(id: string, updates: Partial<Announcement>): Announcement | null {
    const index = this.announcements.findIndex((a) => a.id === id)
    if (index === -1) return null

    this.announcements[index] = { ...this.announcements[index], ...updates }
    return this.announcements[index]
  }

  deleteAnnouncement(id: string): boolean {
    const index = this.announcements.findIndex((a) => a.id === id)
    if (index === -1) return false

    this.announcements.splice(index, 1)
    return true
  }

  // Meter reading methods
  getMeterReadings(consumerId: string): MeterReading[] {
    return this.meterReadings
      .filter((mr) => mr.consumer_id === consumerId)
      .sort((a, b) => new Date(b.reading_date).getTime() - new Date(a.reading_date).getTime())
  }

  addMeterReading(reading: Omit<MeterReading, "id">): MeterReading {
    const newReading = {
      ...reading,
      id: (this.meterReadings.length + 1).toString(),
    }
    this.meterReadings.push(newReading)
    return newReading
  }

  // Statistics methods
  getConsumerStats() {
    const total = this.consumers.length
    const active = this.consumers.filter((c) => c.status === "Active").length
    const suspended = this.consumers.filter((c) => c.status === "Suspended").length
    const overdue = this.consumers.filter((c) => c.status === "Overdue").length

    return { total, active, suspended, overdue }
  }

  getBillingStats() {
    const totalRevenue = this.bills.filter((b) => b.status === "Paid").reduce((sum, b) => sum + b.amount, 0)
    const generated = this.bills.length
    const unpaid = this.bills.filter((b) => b.status !== "Paid").reduce((sum, b) => sum + b.amount, 0)
    const overdueCount = this.bills.filter((b) => b.status === "Overdue").length

    return {
      revenue: totalRevenue,
      generated,
      unpaid,
      overdue: overdueCount,
    }
  }

  getApplicationStats() {
    const pending = this.applications.filter((a) => a.status === "Pending").length
    const approved = this.applications.filter((a) => a.status === "Approved").length
    const rejected = this.applications.filter((a) => a.status === "Rejected").length

    return { pending, approved, rejected }
  }

  hasDuplicateBill(consumerId: string, startDate: string, endDate: string): boolean {
    return this.bills.some(
      (bill) => bill.consumer_id === consumerId && bill.period.includes(startDate) && bill.period.includes(endDate),
    )
  }
}

// Singleton instance
export const mockDataStore = new MockDataStore()

export function getMockConsumers() {
  const consumers = mockDataStore.getConsumers()
  return consumers.map((consumer) => ({
    id: consumer.id,
    accountNumber: consumer.account_number,
    fullName: consumer.name,
    email: consumer.email,
    address: consumer.address,
    contactNumber: "", // Not available in mock data
    status: consumer.status.toLowerCase(),
    serviceType: consumer.service_type,
    meterNumber: "", // Not available in mock data
    connectionDate: consumer.connection_date,
    lastBillAmount: consumer.last_bill_amount,
    lastBillStatus: "pending",
  }))
}
