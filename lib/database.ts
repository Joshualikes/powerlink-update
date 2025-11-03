// Database connection and query utilities
import { neon } from "@neondatabase/serverless"
import { initializeDatabase } from "./database-init"

// Initialize database on first import
initializeDatabase().catch(console.error)

const sql = neon(process.env.NEON_DATABASE_URL!)

export { sql }

// Database utility functions
export async function getConsumerByEmail(email: string) {
  const result = await sql`
    SELECT * FROM consumers WHERE email = ${email} LIMIT 1
  `
  return result[0] || null
}

export async function getConsumerById(id: number) {
  const result = await sql`
    SELECT * FROM consumers WHERE id = ${id} LIMIT 1
  `
  return result[0] || null
}

export async function getAdminByUsername(username: string) {
  const result = await sql`
    SELECT * FROM admins WHERE username = ${username} LIMIT 1
  `
  return result[0] || null
}

export async function getAllConsumers() {
  return await sql`
    SELECT 
      c.*,
      COALESCE(b.amount_due, 0) as last_bill_amount,
      b.due_date as last_bill_due_date,
      b.status as last_bill_status
    FROM consumers c
    LEFT JOIN bills b ON c.id = b.consumer_id 
    AND b.id = (
      SELECT id FROM bills 
      WHERE consumer_id = c.id 
      ORDER BY created_at DESC 
      LIMIT 1
    )
    ORDER BY c.created_at DESC
  `
}

export async function getAllBills() {
  return await sql`
    SELECT 
      b.*,
      c.full_name as consumer_name,
      c.account_number
    FROM bills b
    JOIN consumers c ON b.consumer_id = c.id
    ORDER BY b.created_at DESC
  `
}

export async function getBillsByConsumerId(consumerId: number) {
  return await sql`
    SELECT * FROM bills 
    WHERE consumer_id = ${consumerId}
    ORDER BY created_at DESC
  `
}

export async function getAllAnnouncements() {
  return await sql`
    SELECT 
      a.*,
      ad.full_name as created_by_name
    FROM announcements a
    LEFT JOIN admins ad ON a.created_by = ad.id
    WHERE a.status = 'active'
    ORDER BY a.priority DESC, a.created_at DESC
  `
}

export async function getPaymentsByConsumerId(consumerId: number) {
  return await sql`
    SELECT 
      p.*,
      b.bill_number,
      b.billing_period_start,
      b.billing_period_end
    FROM payments p
    JOIN bills b ON p.bill_id = b.id
    WHERE p.consumer_id = ${consumerId}
    ORDER BY p.paid_at DESC
  `
}
