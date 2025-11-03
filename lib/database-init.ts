import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.NEON_DATABASE_URL!)

let dbInitialized = false

export async function initializeDatabase() {
  if (dbInitialized) return

  try {
    const result = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'applications'
      )
    `

    if (result[0]?.exists) {
      dbInitialized = true
      console.log("[v0] Database already initialized")
      return
    }

    console.log("[v0] Initializing database with PostgreSQL schema...")

    await sql`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        full_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
    `

    await sql`
      CREATE TABLE IF NOT EXISTS consumers (
        id SERIAL PRIMARY KEY,
        account_number VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        contact_number VARCHAR(20),
        meter_number VARCHAR(20) UNIQUE,
        connection_date DATE,
        status VARCHAR(20) DEFAULT 'active',
        service_type VARCHAR(20) DEFAULT 'residential',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_consumers_account_number ON consumers(account_number);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_consumers_email ON consumers(email);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_consumers_status ON consumers(status);
    `

    await sql`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        application_id VARCHAR(20) UNIQUE NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        address TEXT NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        email VARCHAR(100),
        service_type VARCHAR(20) DEFAULT 'residential',
        status VARCHAR(20) DEFAULT 'pending',
        account_number VARCHAR(20),
        reviewed_by INT,
        notes TEXT,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL,
        processed_at TIMESTAMP NULL,
        date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        date_processed TIMESTAMP NULL,
        processed_by INT,
        valid_id_url TEXT,
        proof_of_residency_url TEXT,
        id_document_url TEXT,
        proof_of_residency_url_new TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL,
        FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE SET NULL
      );
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_applications_account_number ON applications(account_number);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);
    `

    await sql`
      CREATE TABLE IF NOT EXISTS account_numbers (
        id SERIAL PRIMARY KEY,
        account_number VARCHAR(20) UNIQUE NOT NULL,
        is_assigned BOOLEAN DEFAULT FALSE,
        assigned_to INT,
        assigned_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assigned_to) REFERENCES consumers(id) ON DELETE SET NULL
      );
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_account_numbers_is_assigned ON account_numbers(is_assigned);
    `

    await sql`
      CREATE TABLE IF NOT EXISTS bills (
        id SERIAL PRIMARY KEY,
        bill_number VARCHAR(20) UNIQUE NOT NULL,
        consumer_id INT NOT NULL,
        billing_period_start DATE NOT NULL,
        billing_period_end DATE NOT NULL,
        kwh_used DECIMAL(10,2) NOT NULL,
        rate_per_kwh DECIMAL(10,2) NOT NULL,
        amount_due DECIMAL(10,2) NOT NULL,
        due_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        paid_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (consumer_id) REFERENCES consumers(id) ON DELETE CASCADE
      );
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_bills_consumer_id ON bills(consumer_id);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
    `

    await sql`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(20) NOT NULL DEFAULT 'general',
        priority VARCHAR(10) NOT NULL DEFAULT 'medium',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        scheduled_for TIMESTAMP NULL,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
      );
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_announcements_scheduled_for ON announcements(scheduled_for);
    `

    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        bill_id INT NOT NULL,
        consumer_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) NOT NULL,
        payment_reference VARCHAR(100),
        status VARCHAR(20) DEFAULT 'completed',
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
        FOREIGN KEY (consumer_id) REFERENCES consumers(id) ON DELETE CASCADE
      );
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_payments_consumer_id ON payments(consumer_id);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    `

    await sql`
      CREATE TABLE IF NOT EXISTS meter_readings (
        id SERIAL PRIMARY KEY,
        consumer_id INT NOT NULL,
        reading_date DATE NOT NULL,
        meter_reading DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(consumer_id, reading_date),
        FOREIGN KEY (consumer_id) REFERENCES consumers(id) ON DELETE CASCADE
      );
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_meter_readings_consumer_id ON meter_readings(consumer_id);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_meter_readings_reading_date ON meter_readings(reading_date);
    `

    await sql`
      CREATE TABLE IF NOT EXISTS bill_receipts (
        id SERIAL PRIMARY KEY,
        bill_id INT NOT NULL,
        consumer_id INT NOT NULL,
        current_reading DECIMAL(10, 2) NOT NULL,
        previous_reading DECIMAL(10, 2) NOT NULL,
        kwh_used DECIMAL(10, 2) GENERATED ALWAYS AS (current_reading - previous_reading) STORED,
        rate_per_kwh DECIMAL(10, 4) DEFAULT 12.50,
        total_amount_due DECIMAL(10, 2) GENERATED ALWAYS AS ((current_reading - previous_reading) * 12.50) STORED,
        due_date DATE NOT NULL,
        last_payment_date DATE,
        balance DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
        FOREIGN KEY (consumer_id) REFERENCES consumers(id) ON DELETE CASCADE
      );
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_bill_receipts_bill_id ON bill_receipts(bill_id);
    `

    await sql`
      CREATE INDEX IF NOT EXISTS idx_bill_receipts_consumer_id ON bill_receipts(consumer_id);
    `

    // Insert admin user
    await sql`
      INSERT INTO admins (username, password_hash, email, full_name, role)
      VALUES ('admin', '$2b$10$rQZ8kHqQZQZQZQZQZQZQOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK', 'admin@powerlink-bapa.com', 'System Administrator', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `

    // Insert account numbers C001-C160
    const accountNumbers = Array.from({ length: 160 }, (_, i) => `('C${String(i + 1).padStart(3, "0")}')`).join(",")

    await sql(`
      INSERT INTO account_numbers (account_number, is_assigned)
      VALUES ${accountNumbers}
      ON CONFLICT (account_number) DO NOTHING;
    `)

    // Insert sample consumers
    await sql`
      INSERT INTO consumers (account_number, email, password_hash, full_name, address, contact_number, meter_number, connection_date, status, service_type)
      VALUES 
        ('C001', 'juan.delacruz@email.com', '$2b$10$samplehash1', 'Juan dela Cruz', '123 Main St, Zone A, Barangay PowerLink', '09123456789', 'MT-001', '2024-01-15', 'active', 'residential'),
        ('C002', 'maria.santos@email.com', '$2b$10$samplehash2', 'Maria Santos', '456 Oak Ave, Zone B, Barangay PowerLink', '09987654321', 'MT-002', '2024-02-01', 'overdue', 'residential'),
        ('C003', 'pedro.garcia@email.com', '$2b$10$samplehash3', 'Pedro Garcia', '789 Pine Rd, Zone C, Barangay PowerLink', '09555123456', 'MT-003', '2024-02-15', 'active', 'residential')
      ON CONFLICT (account_number) DO NOTHING;
    `

    // Insert sample applications
    await sql`
      INSERT INTO applications (application_id, full_name, address, contact_number, email, service_type, status, account_number)
      VALUES
        ('APP001', 'Ana Reyes', '321 Elm St, Zone A, Barangay PowerLink', '09321654987', 'ana.reyes@email.com', 'residential', 'pending', NULL),
        ('APP002', 'Carlos Mendoza', '654 Maple Ave, Zone B, Barangay PowerLink', '09654321987', 'carlos.mendoza@email.com', 'residential', 'approved', 'C004'),
        ('APP003', 'Rosa Lopez', '987 Cedar Rd, Zone C, Barangay PowerLink', '09987123654', 'rosa.lopez@email.com', 'residential', 'pending', NULL)
      ON CONFLICT (application_id) DO NOTHING;
    `

    dbInitialized = true
    console.log("[v0] Database initialization complete")
  } catch (error: any) {
    console.error("[v0] Database initialization failed:", error)
    // Don't throw - let the app continue, individual queries will fail with appropriate errors
  }
}

export async function ensureDatabaseInitialized() {
  await initializeDatabase()
}
