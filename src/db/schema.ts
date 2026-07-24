/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { pgTable, serial, text, integer, doublePrecision, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (maps Firebase Auth UID to internal database user)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').default('owner'), // 'owner' | 'employee' | 'customer'
  name: text('name'),
  mobile: text('mobile'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Shop Registrations table
export const registrations = pgTable('registrations', {
  id: text('id').primaryKey(), // e.g. reg-2026-001
  shopName: text('shop_name').notNull(),
  ownerName: text('owner_name').notNull(),
  mobile: text('mobile').notNull(),
  email: text('email').notNull(),
  gstNumber: text('gst_number'),
  businessRegNumber: text('business_reg_number'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  pincode: text('pincode').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  shopType: text('shop_type').notNull(),
  employeesCount: integer('employees_count').notNull().default(1),
  openingDate: text('opening_date').notNull(),
  ownerIdProof: text('owner_id_proof').notNull(),
  shopLicense: text('shop_license'),
  gstCertificate: text('gst_certificate'),
  shopPhoto: text('shop_photo'),
  status: text('status').notNull().default('Pending'), // 'Pending' | 'Active' | 'Rejected' | 'MoreInfoNeeded'
  subscriptionType: text('subscription_type').notNull().default('1 Year'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// Products Table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  category: text('category').notNull(),
  brand: text('brand').notNull(),
  itemName: text('item_name').notNull(),
  itemNameMr: text('item_name_mr'),
  color: text('color'),
  size: text('size'),
  unit: text('unit').notNull().default('Pcs'),
  purchasePrice: doublePrecision('purchase_price').notNull().default(0),
  sellingPrice: doublePrecision('selling_price').notNull().default(0),
  gstPercent: doublePrecision('gst_percent').notNull().default(0),
  hsn: text('hsn'),
  barcode: text('barcode'),
  qrCode: text('qr_code'),
  images: text('images').array(), // simple text array for images
  currentStock: integer('current_stock').notNull().default(0),
  minStock: integer('min_stock').notNull().default(0),
  openingStock: integer('opening_stock').notNull().default(0),
  supplierId: text('supplier_id'),
});

// Customers Table
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameMr: text('name_mr'),
  mobile: text('mobile').notNull(),
  whatsapp: text('whatsapp'),
  address: text('address'),
  gstNumber: text('gst_number'),
  creditLimit: doublePrecision('credit_limit').notNull().default(0),
  outstanding: doublePrecision('outstanding').notNull().default(0),
  ledger: jsonb('ledger').default('[]'), // array of ledger entries as json
});

// Suppliers Table
export const suppliers = pgTable('suppliers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  nameMr: text('name_mr'),
  mobile: text('mobile').notNull(),
  email: text('email'),
  address: text('address'),
  gstNumber: text('gst_number'),
  outstanding: doublePrecision('outstanding').notNull().default(0),
  ledger: jsonb('ledger').default('[]'),
});

// Invoices (Sales Bills) Table
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  date: text('date').notNull(),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  customerMobile: text('customer_mobile').notNull(),
  type: text('type').notNull().default('Non-GST'), // 'GST' | 'Non-GST'
  items: jsonb('items').notNull(), // JSON list of items
  subtotal: doublePrecision('subtotal').notNull().default(0),
  discount: doublePrecision('discount').notNull().default(0),
  taxAmount: doublePrecision('tax_amount').notNull().default(0),
  grandTotal: doublePrecision('grand_total').notNull().default(0),
  paymentMode: text('payment_mode').notNull().default('Cash'),
  splitDetails: jsonb('split_details'),
  whatsappSent: boolean('whatsapp_sent').notNull().default(false),
  status: text('status').notNull().default('Paid'), // 'Paid' | 'Unpaid' | 'Partial'
  amountPaid: doublePrecision('amount_paid').notNull().default(0),
});

// Purchase Bills Table
export const purchaseBills = pgTable('purchase_bills', {
  id: text('id').primaryKey(),
  billNumber: text('bill_number').notNull(),
  date: text('date').notNull(),
  supplierId: text('supplier_id').notNull(),
  supplierName: text('supplier_name').notNull(),
  items: jsonb('items').notNull(), // JSON list of items
  grandTotal: doublePrecision('grand_total').notNull().default(0),
  paymentStatus: text('payment_status').notNull().default('Paid'),
  amountPaid: doublePrecision('amount_paid').notNull().default(0),
});

// Audit Logs Table
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  action: text('action').notNull(),
  details: text('details').notNull(),
});

// Shop Settings Table
export const shopSettings = pgTable('shop_settings', {
  id: text('id').primaryKey().default('default'),
  shopName: text('shop_name').notNull(),
  shopNameMr: text('shop_name_mr'),
  address: text('address'),
  addressMr: text('address_mr'),
  mobile: text('mobile'),
  whatsapp: text('whatsapp'),
  gstNumber: text('gst_number'),
  enableGstBilling: boolean('enable_gst_billing').notNull().default(false),
  thermalPrinterWidth: text('thermal_printer_width').notNull().default('58mm'),
  whatsappApiToken: text('whatsapp_api_token'),
  backupInterval: text('backup_interval').notNull().default('manual'),
  currency: text('currency').notNull().default('₹'),
  templateInvoice: text('template_invoice'),
  templateReminder: text('template_reminder'),
  templateOffer: text('template_offer'),
});

// Expenses Table
export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  category: text('category').notNull(),
  amount: integer('amount').notNull(),
  description: text('description'),
  paidBy: text('paid_by'),
});
