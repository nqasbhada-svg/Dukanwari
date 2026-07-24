/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Category, Brand, Customer, Supplier, Invoice, PurchaseBill, AuditLog, ShopSettings, Expense } from '../types';

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Shirts', nameMr: 'शर्ट्स', code: 'SHR' },
  { id: 'cat-2', name: 'Jeans & Denims', nameMr: 'जीन्स आणि डेनिम्स', code: 'JNS' },
  { id: 'cat-3', name: 'Sarees & Ethnic', nameMr: 'साड्या आणि एथनिक', code: 'SAR' },
  { id: 'cat-4', name: 'Kurtis & Tops', nameMr: 'कुर्ती आणि टॉप्स', code: 'KUR' },
  { id: 'cat-5', name: 'Suits & Blazers', nameMr: 'सूट आणि ब्लेझर', code: 'SUT' },
];

export const initialBrands: Brand[] = [
  { id: 'br-1', name: "Raymond", code: 'RAY' },
  { id: 'br-2', name: "Levi's", code: 'LEV' },
  { id: 'br-3', name: 'Manyavar', code: 'MAN' },
  { id: 'br-4', name: 'Zara', code: 'ZAR' },
  { id: 'br-5', name: 'Blackberrys', code: 'BB' },
];

export const initialProducts: Product[] = [];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Rahul Deshmukh',
    nameMr: 'राहुल देशमुख',
    mobile: '9876543210',
    whatsapp: '9876543210',
    address: 'Shahu Nagar, Satara Road, Pune, Maharashtra',
    gstNumber: '27AAAAA1111A1Z1',
    creditLimit: 50000,
    outstanding: 8500,
    ledger: [
      { id: 'l-c-1', date: '2026-07-10', type: 'sale', refId: 'INV-2026-001', description: 'Bought Premium Suit & Raymond Shirt', debit: 9898, credit: 0, balance: 9898 },
      { id: 'l-c-2', date: '2026-07-11', type: 'receipt', refId: 'REC-2026-001', description: 'Received online UPI payment advance', debit: 0, credit: 5000, balance: 4898 },
      { id: 'l-c-3', date: '2026-07-15', type: 'sale', refId: 'INV-2026-003', description: 'Bought Levi Denim Jeans', debit: 3602, credit: 0, balance: 8500 }
    ]
  },
  {
    id: 'cust-2',
    name: 'Priya Kulkarni',
    nameMr: 'प्रिया कुलकर्णी',
    mobile: '9554433221',
    whatsapp: '9554433221',
    address: 'Deccan Gymkhana, Pune, Maharashtra',
    gstNumber: '',
    creditLimit: 20000,
    outstanding: 0,
    ledger: [
      { id: 'l-c-4', date: '2026-07-14', type: 'sale', refId: 'INV-2026-002', description: 'Bought Georgette Kurti & Silk Saree', debit: 7198, credit: 0, balance: 7198 },
      { id: 'l-c-5', date: '2026-07-14', type: 'receipt', refId: 'REC-2026-002', description: 'Cleared full payment by Cash', debit: 0, credit: 7198, balance: 0 }
    ]
  },
  {
    id: 'cust-3',
    name: 'Aniket Shinde',
    nameMr: 'अनिकेत शिंदे',
    mobile: '9988776655',
    whatsapp: '9988776655',
    address: 'Karvenagar, Pune, Maharashtra',
    gstNumber: '',
    creditLimit: 15000,
    outstanding: 3400,
    ledger: [
      { id: 'l-c-6', date: '2026-07-16', type: 'sale', refId: 'INV-2026-004', description: 'Bought Shirts & Jeans', debit: 4400, credit: 0, balance: 4400 },
      { id: 'l-c-7', date: '2026-07-17', type: 'receipt', refId: 'REC-2026-003', description: 'Paid partial UPI cash mix', debit: 0, credit: 1000, balance: 3400 }
    ]
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Vardhaman Textile Wholesale',
    nameMr: 'वर्धमान टेक्सटाईल होलसेल',
    mobile: '9123456789',
    email: 'info@vardhaman.com',
    address: 'Ichalkaranji, Kolhapur, Maharashtra',
    gstNumber: '27BBBBB2222B2Z2',
    outstanding: 15000,
    ledger: [
      { id: 'l-s-1', date: '2026-07-01', type: 'purchase', refId: 'PUR-001', description: 'Purchase of premium Linen material bulk', debit: 0, credit: 35000, balance: 35000 },
      { id: 'l-s-2', date: '2026-07-05', type: 'payment', refId: 'PAY-001', description: 'Paid online bank transfer', debit: 20000, credit: 0, balance: 15000 }
    ]
  },
  {
    id: 'sup-2',
    name: 'Surat Saree Sadan',
    nameMr: 'सुरत साडी सदन',
    mobile: '9898989898',
    email: 'contact@suratsarees.com',
    address: 'Ring Road Wholesale Market, Surat, Gujarat',
    gstNumber: '24CCCCC3333C3Z3',
    outstanding: 0,
    ledger: [
      { id: 'l-s-3', date: '2026-07-03', type: 'purchase', refId: 'PUR-002', description: 'Ethnic sarees festival bundle', debit: 0, credit: 28000, balance: 28000 },
      { id: 'l-s-4', date: '2026-07-04', type: 'payment', refId: 'PAY-002', description: 'Paid 100% full settlement check', debit: 28000, credit: 0, balance: 0 }
    ]
  },
  {
    id: 'sup-3',
    name: 'Mumbai Denim Distributors',
    nameMr: 'मुंबई डेनिम वितरक',
    mobile: '9321456987',
    email: 'sales@mumbaidenims.in',
    address: 'Dharavi Wholesale Estate, Mumbai, Maharashtra',
    gstNumber: '27DDDDD4444D4Z4',
    outstanding: 8500,
    ledger: [
      { id: 'l-s-5', date: '2026-07-12', type: 'purchase', refId: 'PUR-003', description: 'Super-Stretch Denim order bulk', debit: 0, credit: 18500, balance: 18500 },
      { id: 'l-s-6', date: '2026-07-15', type: 'payment', refId: 'PAY-003', description: 'Paid partial advance', debit: 10000, credit: 0, balance: 8500 }
    ]
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-001',
    date: '2026-07-10',
    customerId: 'cust-1',
    customerName: 'Rahul Deshmukh',
    customerMobile: '9876543210',
    type: 'GST',
    items: [
      {
        productId: 'prod-5',
        itemName: 'Royal Velvet Blazer Navy Blue',
        color: 'Navy Blue',
        size: '40',
        quantity: 1,
        rate: 7999,
        gstPercent: 12,
        hsn: '620311',
        discountAmount: 0,
        total: 7999,
      },
      {
        productId: 'prod-1',
        itemName: 'Premium Linen White Shirt',
        color: 'White',
        size: 'L',
        quantity: 1,
        rate: 1899,
        gstPercent: 5,
        hsn: '610510',
        discountAmount: 0,
        total: 1899,
      }
    ],
    subtotal: 9898,
    discount: 0,
    taxAmount: 1054.74,
    grandTotal: 10952.74,
    paymentMode: 'Credit',
    whatsappSent: true,
    status: 'Partial',
    amountPaid: 2452.74,
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-002',
    date: '2026-07-14',
    customerId: 'cust-2',
    customerName: 'Priya Kulkarni',
    customerMobile: '9554433221',
    type: 'Non-GST',
    items: [
      {
        productId: 'prod-3',
        itemName: 'Banarasi Silk Embroidered Saree',
        color: 'Deep Red & Gold',
        size: 'Free Size',
        quantity: 1,
        rate: 5999,
        gstPercent: 5,
        hsn: '500720',
        discountAmount: 0,
        total: 5999,
      },
      {
        productId: 'prod-4',
        itemName: 'Floral Print Georgette Kurti',
        color: 'Peach Pink',
        size: 'M',
        quantity: 1,
        rate: 1199,
        gstPercent: 5,
        hsn: '620443',
        discountAmount: 0,
        total: 1199,
      }
    ],
    subtotal: 7198,
    discount: 198,
    taxAmount: 0,
    grandTotal: 7000,
    paymentMode: 'Cash',
    whatsappSent: true,
    status: 'Paid',
    amountPaid: 7000,
  }
];

export const initialExpenses: Expense[] = [
  { id: 'exp-1', date: '2026-07-17', category: 'Electricity', amount: 3200, description: 'Shop main power bill for June', paidBy: 'Owner' },
  { id: 'exp-2', date: '2026-07-18', category: 'Tea & Hospitality', amount: 450, description: 'Customer & Staff tea expense', paidBy: 'Employee' },
  { id: 'exp-3', date: '2026-07-15', category: 'Shop Rent', amount: 12000, description: 'Monthly rent paid to landlord', paidBy: 'Owner' }
];

export const initialAuditLogs: AuditLog[] = [
  { id: 'aud-1', timestamp: '2026-07-18T09:30:11Z', userId: 'usr-1', userName: 'Rahul (Owner)', action: 'STOCK_SYNC', details: 'Automated Supabase secure socket DB sync executed successfully. 0 conflicts.' },
  { id: 'aud-2', timestamp: '2026-07-18T10:15:45Z', userId: 'usr-2', userName: 'Amit (Employee)', action: 'BILL_CREATE', details: 'Generated GST invoice INV-2026-002 for Priya Kulkarni' },
  { id: 'aud-3', timestamp: '2026-07-18T11:42:00Z', userId: 'usr-1', userName: 'Rahul (Owner)', action: 'STOCK_ADD', details: 'Inwarded stock for Raymond Premium Linen Shirts: +10 units' }
];

export const defaultSettings: ShopSettings = {
  shopName: 'Vastraa Cloth Emporium',
  shopNameMr: 'वस्त्रा क्लोद एम्पोरियम',
  address: 'Shop No. 12, Swargate Commercial Plaza, Pune, MH - 411002',
  addressMr: 'दुकान क्र. १२, स्वारगेट कमर्शियल प्लाझा, पुणे, महाराष्ट्र - ४११००२',
  mobile: '9876543210',
  whatsapp: '9876543210',
  gstNumber: '27AAAAA1234A1Z0',
  enableGstBilling: true,
  thermalPrinterWidth: '80mm',
  whatsappApiToken: 'WA_LIVE_TOKEN_889100223A',
  backupInterval: 'daily',
  currency: '₹',
  templateInvoice: 'Hello {customerName}, your digital invoice from *{shopName}* is ready. Amount: *₹{grandTotal}*. View PDF: {link}. Thank you!',
  templateReminder: 'Dear {customerName}, this is a gentle reminder regarding outstanding invoice *{invoiceNumber}* from *{shopName}* of amount *₹{grandTotal}*. Please clear via UPI.',
  templateOffer: 'Special Festive Offer from *{shopName}* for you, {customerName}! Get exclusive discounts on our latest product collections. Visit us today!'
};

export const initialRegistrations: any[] = [];

