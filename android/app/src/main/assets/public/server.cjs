var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");

// src/utils/firebase-admin.ts
var import_app = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");

// firebase-applet-config.json
var firebase_applet_config_default = {
  projectId: "aerobic-ally-x7c1c",
  appId: "1:478226847559:web:7f09e298ec2bd482f49e62",
  apiKey: "AIzaSyBC-ChV0g4BRYauvYBFpYbFpmtk9epLuqQ",
  authDomain: "aerobic-ally-x7c1c.firebaseapp.com",
  storageBucket: "aerobic-ally-x7c1c.firebasestorage.app",
  messagingSenderId: "478226847559",
  measurementId: "",
  oAuthClientId: "478226847559-53gdvfpp6uflfupdipgh21rspbhuldef.apps.googleusercontent.com",
  recaptchaSiteKey: ""
};

// src/utils/firebase-admin.ts
if (!(0, import_app.getApps)().length) {
  (0, import_app.initializeApp)({
    projectId: firebase_applet_config_default.projectId
  });
}
var adminAuth = (0, import_auth.getAuth)();

// src/db/index.ts
var import_node_postgres = require("drizzle-orm/node-postgres");
var import_pg = __toESM(require("pg"), 1);

// src/db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  auditLogs: () => auditLogs,
  customers: () => customers,
  invoices: () => invoices,
  products: () => products,
  purchaseBills: () => purchaseBills,
  registrations: () => registrations,
  shopSettings: () => shopSettings,
  suppliers: () => suppliers,
  users: () => users
});
var import_pg_core = require("drizzle-orm/pg-core");
var users = (0, import_pg_core.pgTable)("users", {
  id: (0, import_pg_core.serial)("id").primaryKey(),
  uid: (0, import_pg_core.text)("uid").notNull().unique(),
  // Firebase Auth UID
  email: (0, import_pg_core.text)("email").notNull(),
  role: (0, import_pg_core.text)("role").default("owner"),
  // 'owner' | 'employee' | 'customer'
  name: (0, import_pg_core.text)("name"),
  mobile: (0, import_pg_core.text)("mobile"),
  createdAt: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var registrations = (0, import_pg_core.pgTable)("registrations", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  // e.g. reg-2026-001
  shopName: (0, import_pg_core.text)("shop_name").notNull(),
  ownerName: (0, import_pg_core.text)("owner_name").notNull(),
  mobile: (0, import_pg_core.text)("mobile").notNull(),
  email: (0, import_pg_core.text)("email").notNull(),
  gstNumber: (0, import_pg_core.text)("gst_number"),
  businessRegNumber: (0, import_pg_core.text)("business_reg_number"),
  city: (0, import_pg_core.text)("city").notNull(),
  state: (0, import_pg_core.text)("state").notNull(),
  pincode: (0, import_pg_core.text)("pincode").notNull(),
  username: (0, import_pg_core.text)("username").notNull().unique(),
  password: (0, import_pg_core.text)("password").notNull(),
  shopType: (0, import_pg_core.text)("shop_type").notNull(),
  employeesCount: (0, import_pg_core.integer)("employees_count").notNull().default(1),
  openingDate: (0, import_pg_core.text)("opening_date").notNull(),
  ownerIdProof: (0, import_pg_core.text)("owner_id_proof").notNull(),
  shopLicense: (0, import_pg_core.text)("shop_license"),
  gstCertificate: (0, import_pg_core.text)("gst_certificate"),
  shopPhoto: (0, import_pg_core.text)("shop_photo"),
  status: (0, import_pg_core.text)("status").notNull().default("Pending"),
  // 'Pending' | 'Active' | 'Rejected' | 'MoreInfoNeeded'
  subscriptionType: (0, import_pg_core.text)("subscription_type").notNull().default("1 Year"),
  startDate: (0, import_pg_core.text)("start_date"),
  endDate: (0, import_pg_core.text)("end_date"),
  notes: (0, import_pg_core.text)("notes"),
  createdAt: (0, import_pg_core.text)("created_at").notNull()
});
var products = (0, import_pg_core.pgTable)("products", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  category: (0, import_pg_core.text)("category").notNull(),
  brand: (0, import_pg_core.text)("brand").notNull(),
  itemName: (0, import_pg_core.text)("item_name").notNull(),
  itemNameMr: (0, import_pg_core.text)("item_name_mr"),
  color: (0, import_pg_core.text)("color"),
  size: (0, import_pg_core.text)("size"),
  unit: (0, import_pg_core.text)("unit").notNull().default("Pcs"),
  purchasePrice: (0, import_pg_core.doublePrecision)("purchase_price").notNull().default(0),
  sellingPrice: (0, import_pg_core.doublePrecision)("selling_price").notNull().default(0),
  gstPercent: (0, import_pg_core.doublePrecision)("gst_percent").notNull().default(0),
  hsn: (0, import_pg_core.text)("hsn"),
  barcode: (0, import_pg_core.text)("barcode"),
  qrCode: (0, import_pg_core.text)("qr_code"),
  images: (0, import_pg_core.text)("images").array(),
  // simple text array for images
  currentStock: (0, import_pg_core.integer)("current_stock").notNull().default(0),
  minStock: (0, import_pg_core.integer)("min_stock").notNull().default(0),
  openingStock: (0, import_pg_core.integer)("opening_stock").notNull().default(0),
  supplierId: (0, import_pg_core.text)("supplier_id")
});
var customers = (0, import_pg_core.pgTable)("customers", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  nameMr: (0, import_pg_core.text)("name_mr"),
  mobile: (0, import_pg_core.text)("mobile").notNull(),
  whatsapp: (0, import_pg_core.text)("whatsapp"),
  address: (0, import_pg_core.text)("address"),
  gstNumber: (0, import_pg_core.text)("gst_number"),
  creditLimit: (0, import_pg_core.doublePrecision)("credit_limit").notNull().default(0),
  outstanding: (0, import_pg_core.doublePrecision)("outstanding").notNull().default(0),
  ledger: (0, import_pg_core.jsonb)("ledger").default("[]")
  // array of ledger entries as json
});
var suppliers = (0, import_pg_core.pgTable)("suppliers", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  name: (0, import_pg_core.text)("name").notNull(),
  nameMr: (0, import_pg_core.text)("name_mr"),
  mobile: (0, import_pg_core.text)("mobile").notNull(),
  email: (0, import_pg_core.text)("email"),
  address: (0, import_pg_core.text)("address"),
  gstNumber: (0, import_pg_core.text)("gst_number"),
  outstanding: (0, import_pg_core.doublePrecision)("outstanding").notNull().default(0),
  ledger: (0, import_pg_core.jsonb)("ledger").default("[]")
});
var invoices = (0, import_pg_core.pgTable)("invoices", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  invoiceNumber: (0, import_pg_core.text)("invoice_number").notNull().unique(),
  date: (0, import_pg_core.text)("date").notNull(),
  customerId: (0, import_pg_core.text)("customer_id").notNull(),
  customerName: (0, import_pg_core.text)("customer_name").notNull(),
  customerMobile: (0, import_pg_core.text)("customer_mobile").notNull(),
  type: (0, import_pg_core.text)("type").notNull().default("Non-GST"),
  // 'GST' | 'Non-GST'
  items: (0, import_pg_core.jsonb)("items").notNull(),
  // JSON list of items
  subtotal: (0, import_pg_core.doublePrecision)("subtotal").notNull().default(0),
  discount: (0, import_pg_core.doublePrecision)("discount").notNull().default(0),
  taxAmount: (0, import_pg_core.doublePrecision)("tax_amount").notNull().default(0),
  grandTotal: (0, import_pg_core.doublePrecision)("grand_total").notNull().default(0),
  paymentMode: (0, import_pg_core.text)("payment_mode").notNull().default("Cash"),
  splitDetails: (0, import_pg_core.jsonb)("split_details"),
  whatsappSent: (0, import_pg_core.boolean)("whatsapp_sent").notNull().default(false),
  status: (0, import_pg_core.text)("status").notNull().default("Paid"),
  // 'Paid' | 'Unpaid' | 'Partial'
  amountPaid: (0, import_pg_core.doublePrecision)("amount_paid").notNull().default(0)
});
var purchaseBills = (0, import_pg_core.pgTable)("purchase_bills", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  billNumber: (0, import_pg_core.text)("bill_number").notNull(),
  date: (0, import_pg_core.text)("date").notNull(),
  supplierId: (0, import_pg_core.text)("supplier_id").notNull(),
  supplierName: (0, import_pg_core.text)("supplier_name").notNull(),
  items: (0, import_pg_core.jsonb)("items").notNull(),
  // JSON list of items
  grandTotal: (0, import_pg_core.doublePrecision)("grand_total").notNull().default(0),
  paymentStatus: (0, import_pg_core.text)("payment_status").notNull().default("Paid"),
  amountPaid: (0, import_pg_core.doublePrecision)("amount_paid").notNull().default(0)
});
var auditLogs = (0, import_pg_core.pgTable)("audit_logs", {
  id: (0, import_pg_core.text)("id").primaryKey(),
  timestamp: (0, import_pg_core.text)("timestamp").notNull(),
  userId: (0, import_pg_core.text)("user_id").notNull(),
  userName: (0, import_pg_core.text)("user_name").notNull(),
  action: (0, import_pg_core.text)("action").notNull(),
  details: (0, import_pg_core.text)("details").notNull()
});
var shopSettings = (0, import_pg_core.pgTable)("shop_settings", {
  id: (0, import_pg_core.text)("id").primaryKey().default("default"),
  shopName: (0, import_pg_core.text)("shop_name").notNull(),
  shopNameMr: (0, import_pg_core.text)("shop_name_mr"),
  address: (0, import_pg_core.text)("address"),
  addressMr: (0, import_pg_core.text)("address_mr"),
  mobile: (0, import_pg_core.text)("mobile"),
  whatsapp: (0, import_pg_core.text)("whatsapp"),
  gstNumber: (0, import_pg_core.text)("gst_number"),
  enableGstBilling: (0, import_pg_core.boolean)("enable_gst_billing").notNull().default(false),
  thermalPrinterWidth: (0, import_pg_core.text)("thermal_printer_width").notNull().default("58mm"),
  whatsappApiToken: (0, import_pg_core.text)("whatsapp_api_token"),
  backupInterval: (0, import_pg_core.text)("backup_interval").notNull().default("manual"),
  currency: (0, import_pg_core.text)("currency").notNull().default("\u20B9"),
  templateInvoice: (0, import_pg_core.text)("template_invoice"),
  templateReminder: (0, import_pg_core.text)("template_reminder"),
  templateOffer: (0, import_pg_core.text)("template_offer")
});

// src/db/index.ts
var { Pool } = import_pg.default;
var createPool = () => {
  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 15e3
  });
};
var pool = createPool();
pool.on("error", (err) => {
  console.error("Unexpected error on idle SQL pool client:", err);
});
var db = (0, import_node_postgres.drizzle)(pool, { schema: schema_exports });

// src/db/queries.ts
var import_drizzle_orm = require("drizzle-orm");
function handleDbError(operation, error) {
  console.error(`Database error during ${operation}:`, error);
  throw new Error(`Database operation failed during ${operation}. Please try again.`, { cause: error });
}
async function getOrCreateUser(uid, email, name, mobile) {
  try {
    const result = await db.insert(users).values({ uid, email, name, mobile }).onConflictDoUpdate({
      target: users.uid,
      set: { email, name: name || null, mobile: mobile || null }
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError("getOrCreateUser", error);
  }
}
function mapDbRecordToRegistration(dbRecord) {
  if (!dbRecord) return null;
  return {
    id: dbRecord.id,
    shopName: dbRecord.shopName,
    ownerName: dbRecord.ownerName,
    mobile: dbRecord.mobile,
    email: dbRecord.email,
    gstNumber: dbRecord.gstNumber || void 0,
    businessRegNumber: dbRecord.businessRegNumber || void 0,
    city: dbRecord.city,
    state: dbRecord.state,
    pincode: dbRecord.pincode,
    loginInfo: {
      username: dbRecord.username,
      password: dbRecord.password
    },
    shopDetails: {
      shopType: dbRecord.shopType,
      employeesCount: Number(dbRecord.employeesCount) || 1,
      openingDate: dbRecord.openingDate
    },
    documents: {
      ownerIdProof: dbRecord.ownerIdProof,
      shopLicense: dbRecord.shopLicense || void 0,
      gstCertificate: dbRecord.gstCertificate || void 0,
      shopPhoto: dbRecord.shopPhoto || void 0
    },
    subscription: {
      status: dbRecord.status,
      subscriptionType: dbRecord.subscriptionType,
      startDate: dbRecord.startDate || void 0,
      endDate: dbRecord.endDate || void 0,
      notes: dbRecord.notes || void 0
    },
    createdAt: dbRecord.createdAt || void 0
  };
}
async function getAllRegistrations() {
  try {
    let records = await db.select().from(registrations).orderBy((0, import_drizzle_orm.desc)(registrations.createdAt));
    const defaultRegs = [
      {
        id: "reg-2026-001",
        shopName: "Sanskriti Fashion",
        ownerName: "Sanskriti Patil",
        mobile: "9876543211",
        email: "sanskriti@example.com",
        gstNumber: "27AAAAA1234A1ZA",
        businessRegNumber: "BRN-00123",
        city: "Pune",
        state: "Maharashtra",
        pincode: "411001",
        username: "sanskriti",
        password: "password123",
        shopType: "Retail Boutique",
        employeesCount: 4,
        openingDate: "2026-01-15",
        ownerIdProof: "sanskriti_aadhar.jpg",
        shopLicense: "sanskriti_license.pdf",
        gstCertificate: null,
        shopPhoto: null,
        status: "Pending",
        subscriptionType: "1 Year",
        startDate: null,
        endDate: null,
        notes: "New registration submitted. Pending review.",
        createdAt: "2026-07-19T10:00:00.000Z"
      },
      {
        id: "reg-2026-002",
        shopName: "Rajshree Products",
        ownerName: "Rajesh Shinde",
        mobile: "9876543212",
        email: "rajesh@example.com",
        gstNumber: "27BBBBB1234B1ZB",
        businessRegNumber: "BRN-00456",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
        username: "rajesh",
        password: "password123",
        shopType: "Wholesale Clothes",
        employeesCount: 8,
        openingDate: "2025-05-10",
        ownerIdProof: "rajesh_pan.jpg",
        shopLicense: "rajesh_license.pdf",
        gstCertificate: null,
        shopPhoto: null,
        status: "Active",
        subscriptionType: "1 Year",
        startDate: "2026-07-01",
        endDate: "2027-07-01",
        notes: "Activated on 2026-07-01",
        createdAt: "2026-06-30T10:00:00.000Z"
      },
      {
        id: "reg-2026-003",
        shopName: "Pooja Sarees",
        ownerName: "Pooja Kadam",
        mobile: "9876543213",
        email: "pooja@example.com",
        gstNumber: "27CCCCC1234C1ZC",
        businessRegNumber: "BRN-00789",
        city: "Nagpur",
        state: "Maharashtra",
        pincode: "440001",
        username: "pooja",
        password: "password123",
        shopType: "Retail Sarees",
        employeesCount: 3,
        openingDate: "2026-03-20",
        ownerIdProof: "pooja_aadhar.jpg",
        shopLicense: null,
        gstCertificate: null,
        shopPhoto: null,
        status: "MoreInfoNeeded",
        subscriptionType: "1 Year",
        startDate: null,
        endDate: null,
        notes: "Uploaded shop license is blurred. Please re-upload clear copy.",
        createdAt: "2026-07-18T10:00:00.000Z"
      }
    ];
    let needsRefetch = false;
    const defaultIds = ["reg-2026-001", "reg-2026-002", "reg-2026-003"];
    for (const regId of defaultIds) {
      const exists = records.some((r) => r.id === regId);
      if (!exists) {
        const reg = defaultRegs.find((d) => d.id === regId);
        if (reg) {
          try {
            await db.insert(registrations).values(reg).onConflictDoNothing();
            needsRefetch = true;
          } catch (seedErr) {
            console.error(`Failed to seed registration ${reg.id}:`, seedErr);
          }
        }
      }
    }
    if (needsRefetch) {
      records = await db.select().from(registrations).orderBy((0, import_drizzle_orm.desc)(registrations.createdAt));
    }
    return records.map(mapDbRecordToRegistration);
  } catch (error) {
    handleDbError("getAllRegistrations", error);
  }
}
async function createRegistration(data) {
  try {
    const result = await db.insert(registrations).values({
      id: data.id,
      shopName: data.shopName,
      ownerName: data.ownerName,
      mobile: data.mobile,
      email: data.email,
      gstNumber: data.gstNumber || null,
      businessRegNumber: data.businessRegNumber || null,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      username: data.loginInfo.username,
      password: data.loginInfo.password,
      shopType: data.shopDetails.shopType,
      employeesCount: data.shopDetails.employeesCount || 1,
      openingDate: data.shopDetails.openingDate,
      ownerIdProof: data.documents.ownerIdProof,
      shopLicense: data.documents.shopLicense || null,
      gstCertificate: data.documents.gstCertificate || null,
      shopPhoto: data.documents.shopPhoto || null,
      status: data.subscription.status || "Pending",
      subscriptionType: data.subscription.subscriptionType || "1 Year",
      startDate: data.subscription.startDate || null,
      endDate: data.subscription.endDate || null,
      notes: data.subscription.notes || null,
      createdAt: data.createdAt || (/* @__PURE__ */ new Date()).toISOString()
    }).returning();
    return mapDbRecordToRegistration(result[0]);
  } catch (error) {
    handleDbError("createRegistration", error);
  }
}
async function updateRegistrationStatus(id, status, subscription, notes) {
  try {
    const updateValues = { status };
    if (notes !== void 0) {
      updateValues.notes = notes;
    }
    if (subscription) {
      if (subscription.subscriptionType) updateValues.subscriptionType = subscription.subscriptionType;
      if (subscription.startDate) updateValues.startDate = subscription.startDate;
      if (subscription.endDate) updateValues.endDate = subscription.endDate;
    }
    const result = await db.update(registrations).set(updateValues).where((0, import_drizzle_orm.eq)(registrations.id, id)).returning();
    return mapDbRecordToRegistration(result[0]);
  } catch (error) {
    handleDbError("updateRegistrationStatus", error);
  }
}
async function getAllProducts() {
  try {
    return await db.select().from(products);
  } catch (error) {
    handleDbError("getAllProducts", error);
  }
}
async function upsertProduct(data) {
  try {
    const values = {
      id: data.id,
      category: data.category,
      brand: data.brand,
      itemName: data.itemName,
      itemNameMr: data.itemNameMr || null,
      color: data.color || null,
      size: data.size || null,
      unit: data.unit || "Pcs",
      purchasePrice: Number(data.purchasePrice) || 0,
      sellingPrice: Number(data.sellingPrice) || 0,
      gstPercent: Number(data.gstPercent) || 0,
      hsn: data.hsn || null,
      barcode: data.barcode || null,
      qrCode: data.qrCode || null,
      images: data.images || [],
      currentStock: Number(data.currentStock) || 0,
      minStock: Number(data.minStock) || 0,
      openingStock: Number(data.openingStock) || 0,
      supplierId: data.supplierId || null
    };
    const result = await db.insert(products).values(values).onConflictDoUpdate({
      target: products.id,
      set: values
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError("upsertProduct", error);
  }
}
async function deleteProductById(id) {
  try {
    await db.delete(products).where((0, import_drizzle_orm.eq)(products.id, id));
    return { success: true };
  } catch (error) {
    handleDbError("deleteProductById", error);
  }
}
async function getAllCustomers() {
  try {
    return await db.select().from(customers);
  } catch (error) {
    handleDbError("getAllCustomers", error);
  }
}
async function upsertCustomer(data) {
  try {
    const values = {
      id: data.id,
      name: data.name,
      nameMr: data.nameMr || null,
      mobile: data.mobile,
      whatsapp: data.whatsapp || null,
      address: data.address || null,
      gstNumber: data.gstNumber || null,
      creditLimit: Number(data.creditLimit) || 0,
      outstanding: Number(data.outstanding) || 0,
      ledger: data.ledger || []
    };
    const result = await db.insert(customers).values(values).onConflictDoUpdate({
      target: customers.id,
      set: values
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError("upsertCustomer", error);
  }
}
async function getAllSuppliers() {
  try {
    return await db.select().from(suppliers);
  } catch (error) {
    handleDbError("getAllSuppliers", error);
  }
}
async function upsertSupplier(data) {
  try {
    const values = {
      id: data.id,
      name: data.name,
      nameMr: data.nameMr || null,
      mobile: data.mobile,
      email: data.email || null,
      address: data.address || null,
      gstNumber: data.gstNumber || null,
      outstanding: Number(data.outstanding) || 0,
      ledger: data.ledger || []
    };
    const result = await db.insert(suppliers).values(values).onConflictDoUpdate({
      target: suppliers.id,
      set: values
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError("upsertSupplier", error);
  }
}
async function getAllInvoices() {
  try {
    return await db.select().from(invoices).orderBy((0, import_drizzle_orm.desc)(invoices.date));
  } catch (error) {
    handleDbError("getAllInvoices", error);
  }
}
async function createInvoice(data) {
  try {
    const result = await db.insert(invoices).values({
      id: data.id,
      invoiceNumber: data.invoiceNumber,
      date: data.date,
      customerId: data.customerId,
      customerName: data.customerName,
      customerMobile: data.customerMobile,
      type: data.type || "Non-GST",
      items: data.items,
      subtotal: Number(data.subtotal) || 0,
      discount: Number(data.discount) || 0,
      taxAmount: Number(data.taxAmount) || 0,
      grandTotal: Number(data.grandTotal) || 0,
      paymentMode: data.paymentMode || "Cash",
      splitDetails: data.splitDetails || null,
      whatsappSent: !!data.whatsappSent,
      status: data.status || "Paid",
      amountPaid: Number(data.amountPaid) || 0
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError("createInvoice", error);
  }
}
async function upsertInvoice(data) {
  try {
    const values = {
      id: data.id,
      invoiceNumber: data.invoiceNumber,
      date: data.date,
      customerId: data.customerId,
      customerName: data.customerName,
      customerMobile: data.customerMobile,
      type: data.type || "Non-GST",
      items: data.items,
      subtotal: Number(data.subtotal) || 0,
      discount: Number(data.discount) || 0,
      taxAmount: Number(data.taxAmount) || 0,
      grandTotal: Number(data.grandTotal) || 0,
      paymentMode: data.paymentMode || "Cash",
      splitDetails: data.splitDetails || null,
      whatsappSent: !!data.whatsappSent,
      status: data.status || "Paid",
      amountPaid: Number(data.amountPaid) || 0
    };
    const result = await db.insert(invoices).values(values).onConflictDoUpdate({
      target: invoices.id,
      set: values
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError("upsertInvoice", error);
  }
}
async function getAllPurchaseBills() {
  try {
    return await db.select().from(purchaseBills).orderBy((0, import_drizzle_orm.desc)(purchaseBills.date));
  } catch (error) {
    handleDbError("getAllPurchaseBills", error);
  }
}
async function createPurchaseBill(data) {
  try {
    const result = await db.insert(purchaseBills).values({
      id: data.id,
      billNumber: data.billNumber,
      date: data.date,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      items: data.items,
      grandTotal: Number(data.grandTotal) || 0,
      paymentStatus: data.paymentStatus || "Paid",
      amountPaid: Number(data.amountPaid) || 0
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError("createPurchaseBill", error);
  }
}
async function getAllAuditLogs() {
  try {
    return await db.select().from(auditLogs).orderBy((0, import_drizzle_orm.desc)(auditLogs.timestamp));
  } catch (error) {
    handleDbError("getAllAuditLogs", error);
  }
}
async function createAuditLog(data) {
  try {
    const result = await db.insert(auditLogs).values({
      id: data.id,
      timestamp: data.timestamp,
      userId: data.userId,
      userName: data.userName,
      action: data.action,
      details: data.details
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError("createAuditLog", error);
  }
}
async function getShopSettings() {
  try {
    const result = await db.select().from(shopSettings).where((0, import_drizzle_orm.eq)(shopSettings.id, "default"));
    return result[0] || null;
  } catch (error) {
    handleDbError("getShopSettings", error);
  }
}
async function upsertShopSettings(data) {
  try {
    const values = {
      id: "default",
      shopName: data.shopName,
      shopNameMr: data.shopNameMr || null,
      address: data.address || null,
      addressMr: data.addressMr || null,
      mobile: data.mobile || null,
      whatsapp: data.whatsapp || null,
      gstNumber: data.gstNumber || null,
      enableGstBilling: !!data.enableGstBilling,
      thermalPrinterWidth: data.thermalPrinterWidth || "58mm",
      whatsappApiToken: data.whatsappApiToken || null,
      backupInterval: data.backupInterval || "manual",
      currency: data.currency || "\u20B9",
      templateInvoice: data.templateInvoice || null,
      templateReminder: data.templateReminder || null,
      templateOffer: data.templateOffer || null
    };
    const result = await db.insert(shopSettings).values(values).onConflictDoUpdate({
      target: shopSettings.id,
      set: values
    }).returning();
    return result[0];
  } catch (error) {
    handleDbError("upsertShopSettings", error);
  }
}

// server.ts
var authenticateUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Firebase Auth verification error:", error);
    next();
  }
};
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", database: "connected" });
  });
  app.post("/api/users/sync", authenticateUser, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Missing or invalid authentication token" });
      }
      const { email, uid, name } = req.user;
      const user = await getOrCreateUser(uid, email || "", name || "", "");
      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/registrations", async (req, res) => {
    try {
      const data = await getAllRegistrations();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/registrations", async (req, res) => {
    try {
      const newReg = await createRegistration(req.body);
      res.status(201).json(newReg);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.put("/api/registrations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, subscription, notes } = req.body;
      const updated = await updateRegistrationStatus(id, status, subscription, notes);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/products", async (req, res) => {
    try {
      const data = await getAllProducts();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/products", async (req, res) => {
    try {
      const saved = await upsertProduct(req.body);
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await deleteProductById(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/customers", async (req, res) => {
    try {
      const data = await getAllCustomers();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/customers", async (req, res) => {
    try {
      const saved = await upsertCustomer(req.body);
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/suppliers", async (req, res) => {
    try {
      const data = await getAllSuppliers();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/suppliers", async (req, res) => {
    try {
      const saved = await upsertSupplier(req.body);
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/invoices", async (req, res) => {
    try {
      const data = await getAllInvoices();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/invoices", async (req, res) => {
    try {
      const saved = await createInvoice(req.body);
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/purchase-bills", async (req, res) => {
    try {
      const data = await getAllPurchaseBills();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/purchase-bills", async (req, res) => {
    try {
      const saved = await createPurchaseBill(req.body);
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const data = await getAllAuditLogs();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/audit-logs", async (req, res) => {
    try {
      const saved = await createAuditLog(req.body);
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.get("/api/settings", async (req, res) => {
    try {
      const data = await getShopSettings();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/settings", async (req, res) => {
    try {
      const saved = await upsertShopSettings(req.body);
      res.json(saved);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app.post("/api/sync-all", async (req, res) => {
    try {
      const { products: productsList, customers: customersList, invoices: invoicesList } = req.body || {};
      const syncStatus = {
        productsSynced: 0,
        customersSynced: 0,
        invoicesSynced: 0,
        errors: []
      };
      if (Array.isArray(productsList)) {
        for (const item of productsList) {
          try {
            if (!item || typeof item !== "object") {
              throw new Error("Product item is not a valid object");
            }
            await upsertProduct(item);
            syncStatus.productsSynced++;
          } catch (e) {
            const label = item && typeof item === "object" ? item.itemName || item.id || "unnamed" : "invalid";
            syncStatus.errors.push(`Product [${label}]: ${e.message}`);
          }
        }
      }
      if (Array.isArray(customersList)) {
        for (const item of customersList) {
          try {
            if (!item || typeof item !== "object") {
              throw new Error("Customer item is not a valid object");
            }
            await upsertCustomer(item);
            syncStatus.customersSynced++;
          } catch (e) {
            const label = item && typeof item === "object" ? item.name || item.id || "unnamed" : "invalid";
            syncStatus.errors.push(`Customer [${label}]: ${e.message}`);
          }
        }
      }
      if (Array.isArray(invoicesList)) {
        for (const item of invoicesList) {
          try {
            if (!item || typeof item !== "object") {
              throw new Error("Invoice item is not a valid object");
            }
            await upsertInvoice(item);
            syncStatus.invoicesSynced++;
          } catch (e) {
            const label = item && typeof item === "object" ? item.invoiceNumber || item.id || "unnamed" : "invalid";
            syncStatus.errors.push(`Invoice [${label}]: ${e.message}`);
          }
        }
      }
      const success = syncStatus.errors.length === 0;
      res.json({
        success,
        ...syncStatus
      });
    } catch (error) {
      console.error("Critical failure in /api/sync-all:", error);
      res.status(500).json({ error: error.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    app.get("*", async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith("/api") || import_path.default.extname(url)) {
        return next();
      }
      try {
        const fs = await import("fs");
        const htmlPath = import_path.default.resolve(process.cwd(), "index.html");
        let html = fs.readFileSync(htmlPath, "utf-8");
        html = await vite.transformIndexHtml(url, html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-stack server successfully running on port ${PORT}`);
  });
}
startServer();
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
//# sourceMappingURL=server.cjs.map
