/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'owner' | 'employee' | 'customer';

export interface UserSession {
  role: UserRole;
  mobile: string;
  name: string;
  permissions: string[];
}

export interface Category {
  id: string;
  name: string;
  nameMr: string;
  code: string;
}

export interface Brand {
  id: string;
  name: string;
  code: string;
}

export interface Product {
  id: string;
  category: string;
  brand: string;
  itemName: string;
  itemNameMr: string;
  color: string;
  size: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  gstPercent: number;
  hsn: string;
  barcode: string;
  qrCode: string;
  images: string[];
  currentStock: number;
  minStock: number;
  openingStock: number;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  nameMr: string;
  mobile: string;
  email: string;
  address: string;
  gstNumber: string;
  outstanding: number;
  ledger: LedgerEntry[];
}

export interface Customer {
  id: string;
  name: string;
  nameMr: string;
  mobile: string;
  whatsapp: string;
  address: string;
  gstNumber: string;
  creditLimit: number;
  outstanding: number;
  ledger: LedgerEntry[];
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: 'sale' | 'purchase' | 'receipt' | 'payment' | 'return';
  refId: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface InvoiceItem {
  productId: string;
  itemName: string;
  color: string;
  size: string;
  quantity: number;
  rate: number;
  gstPercent: number;
  hsn: string;
  discountAmount: number;
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  type: 'GST' | 'Non-GST';
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxAmount: number;
  grandTotal: number;
  paymentMode: 'Cash' | 'UPI' | 'Card' | 'Credit' | 'Split';
  splitDetails?: {
    cash: number;
    upi: number;
    card: number;
    credit: number;
  };
  whatsappSent: boolean;
  status: 'Paid' | 'Unpaid' | 'Partial';
  amountPaid: number;
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: {
    productId: string;
    itemName: string;
    quantity: number;
    rate: number;
    gstPercent: number;
    total: number;
  }[];
  grandTotal: number;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partial';
  amountPaid: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
}

export interface ShopSettings {
  shopName: string;
  shopNameMr: string;
  address: string;
  addressMr: string;
  mobile: string;
  whatsapp: string;
  gstNumber: string;
  enableGstBilling: boolean;
  thermalPrinterWidth: '58mm' | '80mm';
  whatsappApiToken: string;
  backupInterval: 'daily' | 'weekly' | 'manual';
  currency: string;
  templateInvoice?: string;
  templateReminder?: string;
  templateOffer?: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  paidBy: string;
}

// Translations Structure
export interface AppTranslations {
  // Common
  dashboard: string;
  products: string;
  stockIn: string;
  stockOut: string;
  customers: string;
  suppliers: string;
  billing: string;
  reports: string;
  onlineCatalog: string;
  adminPanel: string;
  devCenter: string;
  logout: string;
  owner: string;
  employee: string;
  role: string;
  language: string;
  search: string;
  actions: string;
  add: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  loading: string;

  // Login
  loginTitle: string;
  loginSub: string;
  mobileLabel: string;
  otpLabel: string;
  getOtp: string;
  verifyOtp: string;
  enterValidMobile: string;
  otpSent: string;

  // Dashboard
  todaySales: string;
  todayCollection: string;
  pendingPayments: string;
  totalStock: string;
  lowStockAlert: string;
  todayProfit: string;
  monthlyProfit: string;
  topSelling: string;
  salesCollectionTrend: string;
  recentInvoices: string;

  // Product
  addProduct: string;
  itemName: string;
  category: string;
  brand: string;
  color: string;
  size: string;
  unit: string;
  purchasePrice: string;
  sellingPrice: string;
  gst: string;
  hsn: string;
  barcode: string;
  qrCode: string;
  currentStock: string;
  minStock: string;
  openingStock: string;

  // Billing
  newInvoice: string;
  scanBarcode: string;
  customerSelect: string;
  addItem: string;
  discount: string;
  coupon: string;
  grandTotal: string;
  paymentMode: string;
  thermalInvoice: string;
  a4Invoice: string;
  shareWhatsApp: string;
  printBill: string;
}
