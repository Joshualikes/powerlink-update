-- ===================================================================
-- PowerLink BAPA - Complete Database Schema (Master File)
-- ===================================================================
-- This is the consolidated single master SQL script that includes:
-- - All table creations with relationships
-- - All schema updates and enhancements
-- - Seed data for testing
-- - Performance indexes
-- - Account numbers C001-C160 for registration
-- - Helpful views for registration system
--
-- Database: MySQL/MariaDB compatible
-- Usage: Run this single script in phpMyAdmin or MySQL client
-- ===================================================================

-- ===================================================================
-- PART 1: CREATE CORE TABLES
-- ===================================================================

-- Admin users table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_admins_username ON admins(username);

-- Consumer accounts table
CREATE TABLE IF NOT EXISTS consumers (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_consumers_account_number ON consumers(account_number);
CREATE INDEX idx_consumers_email ON consumers(email);
CREATE INDEX idx_consumers_status ON consumers(status);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL,
    FOREIGN KEY (processed_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_account_number ON applications(account_number);
CREATE INDEX idx_applications_created_at ON applications(created_at);

-- Account numbers pool (C001 to C160)
CREATE TABLE IF NOT EXISTS account_numbers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    is_assigned BOOLEAN DEFAULT FALSE,
    assigned_to INT,
    assigned_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES consumers(id) ON DELETE SET NULL
);

CREATE INDEX idx_account_numbers_is_assigned ON account_numbers(is_assigned);

-- Billing information
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (consumer_id) REFERENCES consumers(id) ON DELETE CASCADE
);

CREATE INDEX idx_bills_consumer_id ON bills(consumer_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_bills_due_date ON bills(due_date);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'general',
    priority VARCHAR(10) NOT NULL DEFAULT 'medium',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    scheduled_for TIMESTAMP NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES admins(id) ON DELETE SET NULL
);

CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_announcements_priority ON announcements(priority);
CREATE INDEX idx_announcements_scheduled_for ON announcements(scheduled_for);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
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

CREATE INDEX idx_payments_bill_id ON payments(bill_id);
CREATE INDEX idx_payments_consumer_id ON payments(consumer_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Meter readings table
CREATE TABLE IF NOT EXISTS meter_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    consumer_id INT NOT NULL,
    reading_date DATE NOT NULL,
    meter_reading DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_consumer_date (consumer_id, reading_date),
    FOREIGN KEY (consumer_id) REFERENCES consumers(id) ON DELETE CASCADE
);

CREATE INDEX idx_meter_readings_consumer_id ON meter_readings(consumer_id);
CREATE INDEX idx_meter_readings_reading_date ON meter_readings(reading_date);

-- Bill receipt tracking table
CREATE TABLE IF NOT EXISTS bill_receipts (
    id INT AUTO_INCREMENT PRIMARY KEY,
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

CREATE INDEX idx_bill_receipts_bill_id ON bill_receipts(bill_id);
CREATE INDEX idx_bill_receipts_consumer_id ON bill_receipts(consumer_id);

-- ===================================================================
-- PART 2: INSERT SEED DATA
-- ===================================================================

-- Insert default admin user (if not exists)
INSERT IGNORE INTO admins (id, username, password_hash, email, full_name, role) 
VALUES (
    1,
    'admin', 
    '$2b$10$rQZ8kHqQZQZQZQZQZQZQOeKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK',
    'admin@powerlink-bapa.com',
    'System Administrator',
    'admin'
);

-- Insert all account numbers from C001 to C160
INSERT IGNORE INTO account_numbers (account_number, is_assigned) VALUES
    ('C001', FALSE), ('C002', FALSE), ('C003', FALSE), ('C004', FALSE), ('C005', FALSE),
    ('C006', FALSE), ('C007', FALSE), ('C008', FALSE), ('C009', FALSE), ('C010', FALSE),
    ('C011', FALSE), ('C012', FALSE), ('C013', FALSE), ('C014', FALSE), ('C015', FALSE),
    ('C016', FALSE), ('C017', FALSE), ('C018', FALSE), ('C019', FALSE), ('C020', FALSE),
    ('C021', FALSE), ('C022', FALSE), ('C023', FALSE), ('C024', FALSE), ('C025', FALSE),
    ('C026', FALSE), ('C027', FALSE), ('C028', FALSE), ('C029', FALSE), ('C030', FALSE),
    ('C031', FALSE), ('C032', FALSE), ('C033', FALSE), ('C034', FALSE), ('C035', FALSE),
    ('C036', FALSE), ('C037', FALSE), ('C038', FALSE), ('C039', FALSE), ('C040', FALSE),
    ('C041', FALSE), ('C042', FALSE), ('C043', FALSE), ('C044', FALSE), ('C045', FALSE),
    ('C046', FALSE), ('C047', FALSE), ('C048', FALSE), ('C049', FALSE), ('C050', FALSE),
    ('C051', FALSE), ('C052', FALSE), ('C053', FALSE), ('C054', FALSE), ('C055', FALSE),
    ('C056', FALSE), ('C057', FALSE), ('C058', FALSE), ('C059', FALSE), ('C060', FALSE),
    ('C061', FALSE), ('C062', FALSE), ('C063', FALSE), ('C064', FALSE), ('C065', FALSE),
    ('C066', FALSE), ('C067', FALSE), ('C068', FALSE), ('C069', FALSE), ('C070', FALSE),
    ('C071', FALSE), ('C072', FALSE), ('C073', FALSE), ('C074', FALSE), ('C075', FALSE),
    ('C076', FALSE), ('C077', FALSE), ('C078', FALSE), ('C079', FALSE), ('C080', FALSE),
    ('C081', FALSE), ('C082', FALSE), ('C083', FALSE), ('C084', FALSE), ('C085', FALSE),
    ('C086', FALSE), ('C087', FALSE), ('C088', FALSE), ('C089', FALSE), ('C090', FALSE),
    ('C091', FALSE), ('C092', FALSE), ('C093', FALSE), ('C094', FALSE), ('C095', FALSE),
    ('C096', FALSE), ('C097', FALSE), ('C098', FALSE), ('C099', FALSE), ('C100', FALSE),
    ('C101', FALSE), ('C102', FALSE), ('C103', FALSE), ('C104', FALSE), ('C105', FALSE),
    ('C106', FALSE), ('C107', FALSE), ('C108', FALSE), ('C109', FALSE), ('C110', FALSE),
    ('C111', FALSE), ('C112', FALSE), ('C113', FALSE), ('C114', FALSE), ('C115', FALSE),
    ('C116', FALSE), ('C117', FALSE), ('C118', FALSE), ('C119', FALSE), ('C120', FALSE),
    ('C121', FALSE), ('C122', FALSE), ('C123', FALSE), ('C124', FALSE), ('C125', FALSE),
    ('C126', FALSE), ('C127', FALSE), ('C128', FALSE), ('C129', FALSE), ('C130', FALSE),
    ('C131', FALSE), ('C132', FALSE), ('C133', FALSE), ('C134', FALSE), ('C135', FALSE),
    ('C136', FALSE), ('C137', FALSE), ('C138', FALSE), ('C139', FALSE), ('C140', FALSE),
    ('C141', FALSE), ('C142', FALSE), ('C143', FALSE), ('C144', FALSE), ('C145', FALSE),
    ('C146', FALSE), ('C147', FALSE), ('C148', FALSE), ('C149', FALSE), ('C150', FALSE),
    ('C151', FALSE), ('C152', FALSE), ('C153', FALSE), ('C154', FALSE), ('C155', FALSE),
    ('C156', FALSE), ('C157', FALSE), ('C158', FALSE), ('C159', FALSE), ('C160', FALSE);

-- Insert sample consumers
INSERT IGNORE INTO consumers (id, account_number, email, password_hash, full_name, address, contact_number, meter_number, connection_date, status, service_type) 
VALUES
    (
        1,
        'C001', 
        'juan.delacruz@email.com', 
        '$2b$10$samplehash1', 
        'Juan dela Cruz', 
        '123 Main St, Zone A, Barangay PowerLink',
        '09123456789',
        'MT-001',
        '2024-01-15',
        'active',
        'residential'
    ),
    (
        2,
        'C002', 
        'maria.santos@email.com', 
        '$2b$10$samplehash2', 
        'Maria Santos', 
        '456 Oak Ave, Zone B, Barangay PowerLink',
        '09987654321',
        'MT-002',
        '2024-02-01',
        'overdue',
        'residential'
    ),
    (
        3,
        'C003', 
        'pedro.garcia@email.com', 
        '$2b$10$samplehash3', 
        'Pedro Garcia', 
        '789 Pine Rd, Zone C, Barangay PowerLink',
        '09555123456',
        'MT-003',
        '2024-02-15',
        'active',
        'residential'
    );

-- Mark account numbers as assigned
UPDATE account_numbers 
SET is_assigned = TRUE, assigned_at = NOW()
WHERE account_number IN ('C001', 'C002', 'C003');

-- Insert sample applications
INSERT IGNORE INTO applications (id, application_id, full_name, address, contact_number, email, service_type, status, account_number)
VALUES
    (
        1,
        'APP001',
        'Ana Reyes',
        '321 Elm St, Zone A, Barangay PowerLink',
        '09321654987',
        'ana.reyes@email.com',
        'residential',
        'pending',
        NULL
    ),
    (
        2,
        'APP002',
        'Carlos Mendoza',
        '654 Maple Ave, Zone B, Barangay PowerLink',
        '09654321987',
        'carlos.mendoza@email.com',
        'residential',
        'approved',
        'C004'
    ),
    (
        3,
        'APP003',
        'Rosa Lopez',
        '987 Cedar Rd, Zone C, Barangay PowerLink',
        '09987123654',
        'rosa.lopez@email.com',
        'residential',
        'review',
        NULL
    );

-- Insert sample bills
INSERT IGNORE INTO bills (id, bill_number, consumer_id, billing_period_start, billing_period_end, kwh_used, rate_per_kwh, amount_due, due_date, status)
VALUES
    (
        1,
        'B001',
        1,
        '2025-04-01',
        '2025-04-30',
        85,
        12.50,
        920.75,
        '2025-05-25',
        'paid'
    ),
    (
        2,
        'B002',
        2,
        '2025-04-01',
        '2025-04-30',
        112,
        12.50,
        1250.00,
        '2025-05-25',
        'overdue'
    ),
    (
        3,
        'B003',
        3,
        '2025-04-01',
        '2025-04-30',
        78,
        12.50,
        875.50,
        '2025-05-25',
        'pending'
    );

-- Insert sample announcements
INSERT IGNORE INTO announcements (id, title, content, type, priority, status, scheduled_for, created_by)
VALUES
    (
        1,
        'Scheduled Power Maintenance',
        'There will be a scheduled power maintenance on January 15, 2025 from 8:00 AM to 12:00 PM. Affected areas include Zone A and Zone B.',
        'outage',
        'high',
        'active',
        '2025-01-15 08:00:00',
        1
    ),
    (
        2,
        'New Online Payment Option Available',
        'We are excited to announce that you can now pay your electricity bills online through GCash and PayMaya. Visit our website to learn more.',
        'payment',
        'medium',
        'active',
        NULL,
        1
    ),
    (
        3,
        'Holiday Discount Promotion',
        'Get 5% discount on your electricity bill when you pay before the due date this month. Promo valid until January 31, 2025.',
        'promotion',
        'medium',
        'active',
        NULL,
        1
    ),
    (
        4,
        'System Maintenance Notice',
        'Our billing system will undergo maintenance on January 20, 2025 from 2:00 AM to 4:00 AM. Online services may be temporarily unavailable.',
        'general',
        'low',
        'inactive',
        NULL,
        1
    );

-- Insert sample meter readings
INSERT IGNORE INTO meter_readings (id, consumer_id, reading_date, meter_reading)
VALUES
    (1, 1, '2025-04-20', 2800),
    (2, 1, '2025-05-24', 3045);

-- ===================================================================
-- PART 3: CREATE HELPFUL VIEWS
-- ===================================================================

-- View for pending applications
CREATE OR REPLACE VIEW v_pending_applications AS
SELECT 
    id,
    application_id,
    account_number,
    full_name,
    email,
    address,
    contact_number,
    service_type,
    status,
    date_submitted
FROM applications
WHERE status = 'pending'
ORDER BY date_submitted DESC;

-- View for approved applications ready for account creation
CREATE OR REPLACE VIEW v_approved_applications AS
SELECT 
    id,
    application_id,
    account_number,
    full_name,
    email,
    address,
    contact_number,
    service_type,
    status,
    date_submitted,
    date_processed
FROM applications
WHERE status = 'approved' AND account_number IS NOT NULL
ORDER BY date_processed DESC;

-- View for application statistics
CREATE OR REPLACE VIEW v_application_stats AS
SELECT 
    COUNT(*) as total_applications,
    COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_count,
    COALESCE(SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END), 0) as approved_count,
    COALESCE(SUM(CASE WHEN status = 'declined' THEN 1 ELSE 0 END), 0) as declined_count,
    COUNT(CASE WHEN account_number IS NOT NULL THEN 1 END) as registered_consumers
FROM applications;

-- ===================================================================
-- END OF POWERLINK BAPA COMPLETE DATABASE SCHEMA (Master File)
-- ===================================================================
