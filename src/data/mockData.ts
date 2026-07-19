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

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    category: 'Shirts',
    brand: 'Raymond',
    itemName: 'Premium Linen White Shirt',
    itemNameMr: 'प्रीमियम लिनेन पांढरा शर्ट',
    color: 'White',
    size: 'L',
    unit: 'Pcs',
    purchasePrice: 1200,
    sellingPrice: 1899,
    gstPercent: 5,
    hsn: '610510',
    barcode: '890100210011',
    qrCode: 'QR_LINEN_WHT_L',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&auto=format&fit=crop&q=60'],
    currentStock: 24,
    minStock: 5,
    openingStock: 30,
    supplierId: 'sup-1',
  },
  {
    id: 'prod-2',
    category: 'Jeans & Denims',
    brand: "Levi's",
    itemName: '511 Slim Fit Blue Denim',
    itemNameMr: '५११ स्लिम फिट निळी जीन्स',
    color: 'Dark Blue',
    size: '32',
    unit: 'Pcs',
    purchasePrice: 1600,
    sellingPrice: 2499,
    gstPercent: 12,
    hsn: '620342',
    barcode: '890100210022',
    qrCode: 'QR_LEVIS_511_32',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&auto=format&fit=crop&q=60'],
    currentStock: 18,
    minStock: 4,
    openingStock: 20,
    supplierId: 'sup-2',
  },
  {
    id: 'prod-3',
    category: 'Sarees & Ethnic',
    brand: 'Manyavar',
    itemName: 'Banarasi Silk Embroidered Saree',
    itemNameMr: 'बनारसी सिल्क नक्षीदार साडी',
    color: 'Deep Red & Gold',
    size: 'Free Size',
    unit: 'Pcs',
    purchasePrice: 3500,
    sellingPrice: 5999,
    gstPercent: 5,
    hsn: '500720',
    barcode: '890100210033',
    qrCode: 'QR_BANARASI_RED',
    images: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=60'],
    currentStock: 3,
    minStock: 5, // Under stock alert!
    openingStock: 8,
    supplierId: 'sup-3',
  },
  {
    id: 'prod-4',
    category: 'Kurtis & Tops',
    brand: 'Zara',
    itemName: 'Floral Print Georgette Kurti',
    itemNameMr: 'फ्लोरल प्रिंट जॉर्जेट कुर्ती',
    color: 'Peach Pink',
    size: 'M',
    unit: 'Pcs',
    purchasePrice: 600,
    sellingPrice: 1199,
    gstPercent: 5,
    hsn: '620443',
    barcode: '890100210044',
    qrCode: 'QR_ZARA_KURTI_M',
    images: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=500&auto=format&fit=crop&q=60'],
    currentStock: 32,
    minStock: 8,
    openingStock: 40,
    supplierId: 'sup-1',
  },
  {
    id: 'prod-5',
    category: 'Suits & Blazers',
    brand: 'Blackberrys',
    itemName: 'Royal Velvet Wedding Blazer',
    itemNameMr: 'रॉयल मखमली लग्न ब्लेझर',
    color: 'Navy Blue',
    size: '40',
    unit: 'Pcs',
    purchasePrice: 4500,
    sellingPrice: 7999,
    gstPercent: 12,
    hsn: '620311',
    barcode: '890100210055',
    qrCode: 'QR_BB_SUIT_40',
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=60'],
    currentStock: 2,
    minStock: 3, // Under stock alert!
    openingStock: 5,
    supplierId: 'sup-2',
  }
];

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
  templateOffer: 'Special Festive Offer from *{shopName}* for you, {customerName}! Get exclusive discounts on our latest garment collections. Visit us today!'
};

export const initialRegistrations: any[] = [
  {
    id: 'reg-2026-001',
    shopName: 'Sanskriti Fashion Hub',
    ownerName: 'Deepak Patil',
    mobile: '9123456789',
    email: 'deepak.patil@sanskritifashion.in',
    gstNumber: '27ABCDE5555M1Z9',
    businessRegNumber: 'MH-PN-2026-B9921',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411030',
    loginInfo: {
      username: 'sanskriti_fashion',
      password: 'password123'
    },
    shopDetails: {
      shopType: "Women's Wear",
      employeesCount: 4,
      openingDate: '2024-11-12'
    },
    documents: {
      ownerIdProof: 'deepak_patil_aadhaar_card.pdf',
      shopLicense: 'gumasta_license_2024.pdf',
      gstCertificate: 'gst_reg_06_sanskriti.pdf',
      shopPhoto: 'sanskriti_store_front.jpg'
    },
    subscription: {
      status: 'Pending',
      subscriptionType: '1 Year',
      notes: 'Submitted on 18th July. Seeking premium license.'
    },
    createdAt: '2026-07-18T10:11:00.000Z'
  },
  {
    id: 'reg-2026-002',
    shopName: 'Vastraa Trends',
    ownerName: 'Sneha Deshmukh',
    mobile: '8888888888',
    email: 'sneha@vastraatrends.com',
    gstNumber: '27XYZAB7777N1ZC',
    businessRegNumber: 'MH-MUM-2025-X0109',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    loginInfo: {
      username: 'vastraa_trends',
      password: 'password123'
    },
    shopDetails: {
      shopType: "Boutique",
      employeesCount: 3,
      openingDate: '2025-05-20'
    },
    documents: {
      ownerIdProof: 'sneha_deshmukh_pan.pdf',
      shopLicense: 'gumasta_mumbai_sneha.pdf',
      gstCertificate: 'gst_certificate_vastraatrends.pdf',
      shopPhoto: 'vastraa_trends_interior.jpg'
    },
    subscription: {
      status: 'Active',
      subscriptionType: 'Lifetime',
      startDate: '2026-07-15',
      notes: 'Approved by Admin Rahul on 15th July with Lifetime loyalty package.'
    },
    createdAt: '2026-07-15T08:22:00.000Z'
  },
  {
    id: 'reg-2026-003',
    shopName: 'Kids Planet Clothes',
    ownerName: 'Prasad Shinde',
    mobile: '7777777777',
    email: 'prasad@kidsplanet.in',
    gstNumber: undefined,
    businessRegNumber: undefined,
    city: 'Kolhapur',
    state: 'Maharashtra',
    pincode: '416001',
    loginInfo: {
      username: 'kids_planet',
      password: 'password123'
    },
    shopDetails: {
      shopType: "Kids Wear",
      employeesCount: 2,
      openingDate: '2026-02-15'
    },
    documents: {
      ownerIdProof: 'prasad_shinde_aadhaar.pdf',
      shopPhoto: 'kids_planet_signboard.jpg'
    },
    subscription: {
      status: 'MoreInfoNeeded',
      subscriptionType: '3 Months',
      notes: 'Requesting shop license / Gumasta. Uploaded owner ID but missing municipal license.'
    },
    createdAt: '2026-07-17T14:45:00.000Z'
  }
];

