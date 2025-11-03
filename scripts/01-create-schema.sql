-- ===================================================================
-- PowerLink BAPA - PostgreSQL Database Schema
-- ===================================================================

-- Admin users table
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

CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- Consumer accounts table
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

CREATE INDEX IF NOT EXISTS idx_consumers_account_number ON consumers(account_number);
CREATE INDEX IF NOT EXISTS idx_consumers_email ON consumers(email);
CREATE INDEX IF NOT EXISTS idx_consumers_status ON consumers(status);

-- Applications table
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
    reviewed_by INTEGER,
    notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP NULL,
    processed_at TIMESTAMP NULL,
    date_submitted TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_processed TIMESTAMP NULL,
    processed_by INTEGER,
    valid_id_url TEXT,
    proof_of_residency_url TEXT,
    id_document_url TEXT,
    proof_of_residency_url_new TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_account_number ON applications(account_number);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at);

-- Account numbers pool (C001 to C160)
CREATE TABLE IF NOT EXISTS account_numbers (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    is_assigned BOOLEAN DEFAULT FALSE,
    assigned_to INTEGER,
    assigned_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES consumers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_account_numbers_is_assigned ON account_numbers(is_assigned);

-- Billing information
CREATE TABLE IF NOT EXISTS bills (
    id SERIAL PRIMARY KEY,
    bill_number VARCHAR(20) UNIQUE NOT NULL,
    consumer_id INTEGER NOT NULL,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    kwh_used NUMERIC(10,2) NOT NULL,
    rate_per_kwh NUMERIC(10,2) NOT NULL,
    amount_due NUMERIC(10,2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consumer_id) REFERENCES consumers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bills_consumer_id ON bills(consumer_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'general',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    scheduled_for TIMESTAMP NULL,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements(status);
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_scheduled_for ON announcements(scheduled_for);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL,
    consumer_id INTEGER NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'completed',
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (consumer_id) REFERENCES consumers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_payments_bill_id ON payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_payments_consumer_id ON payments(consumer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Meter readings table
CREATE TABLE IF NOT EXISTS meter_readings (
    id SERIAL PRIMARY KEY,
    consumer_id INTEGER NOT NULL,
    reading_date DATE NOT NULL,
    meter_reading NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (consumer_id, reading_date),
    FOREIGN KEY (consumer_id) REFERENCES consumers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_meter_readings_consumer_id ON meter_readings(consumer_id);
CREATE INDEX IF NOT EXISTS idx_meter_readings_reading_date ON meter_readings(reading_date);

-- Bill receipt tracking table
CREATE TABLE IF NOT EXISTS bill_receipts (
    id SERIAL PRIMARY KEY,
    bill_id INTEGER NOT NULL,
    consumer_id INTEGER NOT NULL,
    current_reading NUMERIC(10,2) NOT NULL,
    previous_reading NUMERIC(10,2) NOT NULL,
    rate_per_kwh NUMERIC(10,4) DEFAULT 12.50,
    due_date DATE NOT NULL,
    last_payment_date DATE,
    balance NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES bills(id) ON DELETE CASCADE,
    FOREIGN KEY (consumer_id) REFERENCES consumers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bill_receipts_bill_id ON bill_receipts(bill_id);
CREATE INDEX IF NOT EXISTS idx_bill_receipts_consumer_id ON bill_receipts(consumer_id);
