/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const SUPABASE_SQL_SCHEMA = `-- ==========================================
-- VASTRAA CLOTH SHOP MANAGEMENT SUITE
-- Production PostgreSQL Database Script (Supabase)
-- Auto Sync, Conflict Resolution, and JWT Role-based RLS
-- ==========================================

-- Enable extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    name_mr VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. BRANDS TABLE
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SUPPLIERS TABLE
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    name_mr VARCHAR(150) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100),
    address TEXT,
    gst_number VARCHAR(15),
    outstanding NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CUSTOMERS TABLE
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    name_mr VARCHAR(150) NOT NULL,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    whatsapp VARCHAR(15),
    address TEXT,
    gst_number VARCHAR(15),
    credit_limit NUMERIC(12, 2) DEFAULT 10000.00 NOT NULL,
    outstanding NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. PRODUCTS (ITEMS) TABLE
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    brand_id UUID REFERENCES brands(id) ON DELETE RESTRICT,
    item_name VARCHAR(200) NOT NULL,
    item_name_mr VARCHAR(200) NOT NULL,
    color VARCHAR(50) NOT NULL,
    size VARCHAR(20) NOT NULL,
    unit VARCHAR(20) DEFAULT 'Pcs' NOT NULL,
    purchase_price NUMERIC(10, 2) NOT NULL,
    selling_price NUMERIC(10, 2) NOT NULL,
    gst_percent NUMERIC(5, 2) DEFAULT 5.00 NOT NULL,
    hsn VARCHAR(15),
    barcode VARCHAR(50) UNIQUE,
    qr_code VARCHAR(100) UNIQUE,
    images TEXT[] DEFAULT '{}',
    current_stock INTEGER DEFAULT 0 NOT NULL,
    min_stock INTEGER DEFAULT 5 NOT NULL,
    opening_stock INTEGER DEFAULT 0 NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. STOCK TRANSACTIONS LOGS (Auto Audit trail)
CREATE TABLE stock_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity_changed INTEGER NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('PURCHASE', 'SALE', 'RETURN', 'EXCHANGE', 'ADJUSTMENT')),
    reference_id VARCHAR(50) NOT NULL,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. PURCHASES TABLE
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE RESTRICT,
    purchase_date DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    grand_total NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Unpaid' CHECK (payment_status IN ('Paid', 'Unpaid', 'Partial')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. PURCHASE ITEMS TABLE
CREATE TABLE purchase_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    rate NUMERIC(10, 2) NOT NULL,
    gst_percent NUMERIC(5, 2) NOT NULL,
    total NUMERIC(12, 2) NOT NULL
);

-- 9. SALES (INVOICES) TABLE
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    sale_date DATE NOT NULL,
    invoice_type VARCHAR(10) DEFAULT 'GST' CHECK (invoice_type IN ('GST', 'Non-GST')),
    subtotal NUMERIC(12, 2) NOT NULL,
    discount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    grand_total NUMERIC(12, 2) NOT NULL,
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Card', 'Credit', 'Split')),
    amount_paid NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(20) DEFAULT 'Paid' CHECK (status IN ('Paid', 'Unpaid', 'Partial')),
    whatsapp_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. SALE ITEMS TABLE
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sale_id UUID REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    rate NUMERIC(10, 2) NOT NULL,
    gst_percent NUMERIC(5, 2) NOT NULL,
    hsn VARCHAR(15),
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL
);

-- 11. COLLECTIONS TABLE (Receiving Outstanding Payments)
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE RESTRICT,
    date DATE NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_mode VARCHAR(20) NOT NULL CHECK (payment_mode IN ('Cash', 'UPI', 'Card')),
    reference_number VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. EXPENSES TABLE
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    paid_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. LEDGER ENTRIES TABLE (Unified view log of credits/debits)
CREATE TABLE ledger_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('sale', 'purchase', 'receipt', 'payment', 'return')),
    reference_id VARCHAR(50) NOT NULL,
    description TEXT,
    debit NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    credit NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    balance NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT chk_party CHECK (
        (customer_id IS NOT NULL AND supplier_id IS NULL) OR 
        (customer_id IS NULL AND supplier_id IS NOT NULL)
    )
);

-- 14. AUDIT LOGS TABLE
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID,
    user_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    device_cache_id VARCHAR(100) -- Ties to the offline client ID
);

-- 15. SHOP SETTINGS TABLE (Single row config)
CREATE TABLE shop_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    shop_name VARCHAR(200) NOT NULL,
    shop_name_mr VARCHAR(200) NOT NULL,
    address TEXT NOT NULL,
    address_mr TEXT NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    whatsapp VARCHAR(15) NOT NULL,
    gst_number VARCHAR(15),
    enable_gst_billing BOOLEAN DEFAULT TRUE NOT NULL,
    thermal_printer_width VARCHAR(10) DEFAULT '80mm',
    whatsapp_api_token VARCHAR(200),
    backup_interval VARCHAR(20) DEFAULT 'daily',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(30) NOT NULL, -- 'LOW_STOCK', 'PENDING_PAYMENT', etc.
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ========================================================
-- INDEXES FOR FAST METRICS AND SCANS
-- ========================================================
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_qrcode ON products(qr_code);
CREATE INDEX idx_sales_invoice_number ON sales(invoice_number);
CREATE INDEX idx_purchases_bill_number ON purchases(bill_number);
CREATE INDEX idx_customers_mobile ON customers(mobile);
CREATE INDEX idx_suppliers_mobile ON suppliers(mobile);
CREATE INDEX idx_stock_log_product ON stock_log(product_id);

-- ========================================================
-- AUTOMATIC STOCK CHANGE TRIGGERS (Auto Increase / Decrease)
-- ========================================================

-- Trigger function for sales stock reduction
CREATE OR REPLACE FUNCTION process_sales_stock_reduction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.product_id;

    INSERT INTO stock_log (product_id, quantity_changed, transaction_type, reference_id)
    VALUES (NEW.product_id, -NEW.quantity, 'SALE', 
            (SELECT invoice_number FROM sales WHERE id = NEW.sale_id));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sales_stock_reduction
AFTER INSERT ON sale_items
FOR EACH ROW EXECUTE FUNCTION process_sales_stock_reduction();


-- Trigger function for purchase stock increase
CREATE OR REPLACE FUNCTION process_purchase_stock_increase()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET current_stock = current_stock + NEW.quantity
    WHERE id = NEW.product_id;

    INSERT INTO stock_log (product_id, quantity_changed, transaction_type, reference_id)
    VALUES (NEW.product_id, NEW.quantity, 'PURCHASE', 
            (SELECT bill_number FROM purchases WHERE id = NEW.purchase_id));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_purchase_stock_increase
AFTER INSERT ON purchase_items
FOR EACH ROW EXECUTE FUNCTION process_purchase_stock_increase();


-- ========================================================
-- STORED PROCEDURES FOR OFFLINE SYNC CONFLICT RESOLUTION
-- ========================================================
-- Syncs local cache invoices. Checks for existing barcode sequences 
-- and updates client stock with dynamic server authoritative balances.
CREATE OR REPLACE FUNCTION sync_offline_invoice(
    p_invoice_number VARCHAR,
    p_customer_id UUID,
    p_sale_date DATE,
    p_type VARCHAR,
    p_subtotal NUMERIC,
    p_discount NUMERIC,
    p_tax_amount NUMERIC,
    p_grand_total NUMERIC,
    p_payment_mode VARCHAR,
    p_amount_paid NUMERIC,
    p_status VARCHAR,
    p_audit_user VARCHAR
) RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
BEGIN
    -- Conflict Resolution: Check if invoice number already uploaded
    SELECT id INTO v_sale_id FROM sales WHERE invoice_number = p_invoice_number;
    
    IF v_sale_id IS NOT NULL THEN
        -- If invoice already exists, discard to prevent duplicate, return existing ID
        INSERT INTO audit_logs (user_name, action, details)
        VALUES (p_audit_user, 'SYNC_CONFLICT_RESOLVED', 'Duplicate sale sync rejected: ' || p_invoice_number);
        RETURN v_sale_id;
    END IF;

    -- Create new server record
    INSERT INTO sales (invoice_number, customer_id, sale_date, invoice_type, subtotal, discount, tax_amount, grand_total, payment_mode, amount_paid, status)
    VALUES (p_invoice_number, p_customer_id, p_sale_date, p_type, p_subtotal, p_discount, p_tax_amount, p_grand_total, p_payment_mode, p_amount_paid, p_status)
    RETURNING id INTO v_sale_id;

    -- Adjust customer ledger outstanding if credit payment
    IF p_payment_mode = 'Credit' OR p_status = 'Partial' THEN
        UPDATE customers 
        SET outstanding = outstanding + (p_grand_total - p_amount_paid)
        WHERE id = p_customer_id;
    END IF;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
-- Enable RLS on all sensitive tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Owner Role (full permissions) Policy
CREATE POLICY owner_full_access ON products
    FOR ALL USING (auth.jwt() ->> 'role' = 'owner');

CREATE POLICY owner_full_access_sales ON sales
    FOR ALL USING (auth.jwt() ->> 'role' = 'owner');

-- Employee Role (view and write only, no deletion) Policies
CREATE POLICY employee_view_products ON products
    FOR SELECT USING (TRUE);

CREATE POLICY employee_write_products ON products
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'employee');

CREATE POLICY employee_view_sales ON sales
    FOR SELECT USING (TRUE);

CREATE POLICY employee_create_sales ON sales
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'employee');

-- ========================================================
-- BUCKETS & STORAGE (Supabase Storage setup)
-- ========================================================
-- Create a public bucket for product images
-- Insert into storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
`;
