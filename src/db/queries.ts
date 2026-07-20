/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './index.ts';
import { 
  users, 
  registrations, 
  products, 
  customers, 
  suppliers, 
  invoices, 
  purchaseBills, 
  auditLogs, 
  shopSettings 
} from './schema.ts';
import { eq, desc } from 'drizzle-orm';

// Error Wrapper Helper
function handleDbError(operation: string, error: any): never {
  console.error(`Database error during ${operation}:`, error);
  throw new Error(`Database operation failed during ${operation}. Please try again.`, { cause: error });
}

// ---------------- USER QUERIES ----------------
export async function getOrCreateUser(uid: string, email: string, name?: string, mobile?: string) {
  try {
    const result = await db.insert(users)
      .values({ uid, email, name, mobile })
      .onConflictDoUpdate({
        target: users.uid,
        set: { email, name: name || null, mobile: mobile || null }
      })
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('getOrCreateUser', error);
  }
}

// ---------------- REGISTRATION QUERIES ----------------
export function mapDbRecordToRegistration(dbRecord: any) {
  if (!dbRecord) return null;
  return {
    id: dbRecord.id,
    shopName: dbRecord.shopName,
    ownerName: dbRecord.ownerName,
    mobile: dbRecord.mobile,
    email: dbRecord.email,
    gstNumber: dbRecord.gstNumber || undefined,
    businessRegNumber: dbRecord.businessRegNumber || undefined,
    city: dbRecord.city,
    state: dbRecord.state,
    pincode: dbRecord.pincode,
    loginInfo: {
      username: dbRecord.username,
      password: dbRecord.password,
    },
    shopDetails: {
      shopType: dbRecord.shopType,
      employeesCount: Number(dbRecord.employeesCount) || 1,
      openingDate: dbRecord.openingDate,
    },
    documents: {
      ownerIdProof: dbRecord.ownerIdProof,
      shopLicense: dbRecord.shopLicense || undefined,
      gstCertificate: dbRecord.gstCertificate || undefined,
      shopPhoto: dbRecord.shopPhoto || undefined,
    },
    subscription: {
      status: dbRecord.status,
      subscriptionType: dbRecord.subscriptionType,
      startDate: dbRecord.startDate || undefined,
      endDate: dbRecord.endDate || undefined,
      notes: dbRecord.notes || undefined,
    },
    createdAt: dbRecord.createdAt || undefined,
  };
}

export async function getAllRegistrations() {
  try {
    let records = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
    
    const defaultRegs = [
      {
        id: 'reg-2026-001',
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
        id: 'reg-2026-002',
        shopName: "Rajshree Garments",
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
        id: 'reg-2026-003',
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
    const defaultIds = ['reg-2026-001', 'reg-2026-002', 'reg-2026-003'];
    
    for (const regId of defaultIds) {
      const exists = records.some(r => r.id === regId);
      if (!exists) {
        const reg = defaultRegs.find(d => d.id === regId);
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
      records = await db.select().from(registrations).orderBy(desc(registrations.createdAt));
    }
    
    return records.map(mapDbRecordToRegistration);
  } catch (error) {
    handleDbError('getAllRegistrations', error);
  }
}

export async function createRegistration(data: any) {
  try {
    const result = await db.insert(registrations)
      .values({
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
        status: data.subscription.status || 'Pending',
        subscriptionType: data.subscription.subscriptionType || '1 Year',
        startDate: data.subscription.startDate || null,
        endDate: data.subscription.endDate || null,
        notes: data.subscription.notes || null,
        createdAt: data.createdAt || new Date().toISOString(),
      })
      .returning();
    return mapDbRecordToRegistration(result[0]);
  } catch (error) {
    handleDbError('createRegistration', error);
  }
}

export async function updateRegistrationStatus(id: string, status: string, subscription?: any, notes?: string) {
  try {
    const updateValues: any = { status };
    if (notes !== undefined) {
      updateValues.notes = notes;
    }
    if (subscription) {
      if (subscription.subscriptionType) updateValues.subscriptionType = subscription.subscriptionType;
      if (subscription.startDate) updateValues.startDate = subscription.startDate;
      if (subscription.endDate) updateValues.endDate = subscription.endDate;
    }

    const result = await db.update(registrations)
      .set(updateValues)
      .where(eq(registrations.id, id))
      .returning();
    return mapDbRecordToRegistration(result[0]);
  } catch (error) {
    handleDbError('updateRegistrationStatus', error);
  }
}

// ---------------- PRODUCT QUERIES ----------------
export async function getAllProducts() {
  try {
    return await db.select().from(products);
  } catch (error) {
    handleDbError('getAllProducts', error);
  }
}

export async function upsertProduct(data: any) {
  try {
    const values = {
      id: data.id,
      category: data.category,
      brand: data.brand,
      itemName: data.itemName,
      itemNameMr: data.itemNameMr || null,
      color: data.color || null,
      size: data.size || null,
      unit: data.unit || 'Pcs',
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
      supplierId: data.supplierId || null,
    };

    const result = await db.insert(products)
      .values(values)
      .onConflictDoUpdate({
        target: products.id,
        set: values
      })
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('upsertProduct', error);
  }
}

export async function deleteProductById(id: string) {
  try {
    await db.delete(products).where(eq(products.id, id));
    return { success: true };
  } catch (error) {
    handleDbError('deleteProductById', error);
  }
}

// ---------------- CUSTOMER QUERIES ----------------
export async function getAllCustomers() {
  try {
    return await db.select().from(customers);
  } catch (error) {
    handleDbError('getAllCustomers', error);
  }
}

export async function upsertCustomer(data: any) {
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
      ledger: data.ledger || [],
    };

    const result = await db.insert(customers)
      .values(values)
      .onConflictDoUpdate({
        target: customers.id,
        set: values
      })
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('upsertCustomer', error);
  }
}

// ---------------- SUPPLIER QUERIES ----------------
export async function getAllSuppliers() {
  try {
    return await db.select().from(suppliers);
  } catch (error) {
    handleDbError('getAllSuppliers', error);
  }
}

export async function upsertSupplier(data: any) {
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
      ledger: data.ledger || [],
    };

    const result = await db.insert(suppliers)
      .values(values)
      .onConflictDoUpdate({
        target: suppliers.id,
        set: values
      })
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('upsertSupplier', error);
  }
}

// ---------------- INVOICE QUERIES ----------------
export async function getAllInvoices() {
  try {
    return await db.select().from(invoices).orderBy(desc(invoices.date));
  } catch (error) {
    handleDbError('getAllInvoices', error);
  }
}

export async function createInvoice(data: any) {
  try {
    const result = await db.insert(invoices)
      .values({
        id: data.id,
        invoiceNumber: data.invoiceNumber,
        date: data.date,
        customerId: data.customerId,
        customerName: data.customerName,
        customerMobile: data.customerMobile,
        type: data.type || 'Non-GST',
        items: data.items,
        subtotal: Number(data.subtotal) || 0,
        discount: Number(data.discount) || 0,
        taxAmount: Number(data.taxAmount) || 0,
        grandTotal: Number(data.grandTotal) || 0,
        paymentMode: data.paymentMode || 'Cash',
        splitDetails: data.splitDetails || null,
        whatsappSent: !!data.whatsappSent,
        status: data.status || 'Paid',
        amountPaid: Number(data.amountPaid) || 0,
      })
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('createInvoice', error);
  }
}

export async function upsertInvoice(data: any) {
  try {
    const values = {
      id: data.id,
      invoiceNumber: data.invoiceNumber,
      date: data.date,
      customerId: data.customerId,
      customerName: data.customerName,
      customerMobile: data.customerMobile,
      type: data.type || 'Non-GST',
      items: data.items,
      subtotal: Number(data.subtotal) || 0,
      discount: Number(data.discount) || 0,
      taxAmount: Number(data.taxAmount) || 0,
      grandTotal: Number(data.grandTotal) || 0,
      paymentMode: data.paymentMode || 'Cash',
      splitDetails: data.splitDetails || null,
      whatsappSent: !!data.whatsappSent,
      status: data.status || 'Paid',
      amountPaid: Number(data.amountPaid) || 0,
    };

    const result = await db.insert(invoices)
      .values(values)
      .onConflictDoUpdate({
        target: invoices.id,
        set: values
      })
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('upsertInvoice', error);
  }
}

// ---------------- PURCHASE BILLS QUERIES ----------------
export async function getAllPurchaseBills() {
  try {
    return await db.select().from(purchaseBills).orderBy(desc(purchaseBills.date));
  } catch (error) {
    handleDbError('getAllPurchaseBills', error);
  }
}

export async function createPurchaseBill(data: any) {
  try {
    const result = await db.insert(purchaseBills)
      .values({
        id: data.id,
        billNumber: data.billNumber,
        date: data.date,
        supplierId: data.supplierId,
        supplierName: data.supplierName,
        items: data.items,
        grandTotal: Number(data.grandTotal) || 0,
        paymentStatus: data.paymentStatus || 'Paid',
        amountPaid: Number(data.amountPaid) || 0,
      })
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('createPurchaseBill', error);
  }
}

// ---------------- AUDIT LOG QUERIES ----------------
export async function getAllAuditLogs() {
  try {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.timestamp));
  } catch (error) {
    handleDbError('getAllAuditLogs', error);
  }
}

export async function createAuditLog(data: any) {
  try {
    const result = await db.insert(auditLogs)
      .values({
        id: data.id,
        timestamp: data.timestamp,
        userId: data.userId,
        userName: data.userName,
        action: data.action,
        details: data.details,
      })
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('createAuditLog', error);
  }
}

// ---------------- SETTINGS QUERIES ----------------
export async function getShopSettings() {
  try {
    const result = await db.select().from(shopSettings).where(eq(shopSettings.id, 'default'));
    return result[0] || null;
  } catch (error) {
    handleDbError('getShopSettings', error);
  }
}

export async function upsertShopSettings(data: any) {
  try {
    const values = {
      id: 'default',
      shopName: data.shopName,
      shopNameMr: data.shopNameMr || null,
      address: data.address || null,
      addressMr: data.addressMr || null,
      mobile: data.mobile || null,
      whatsapp: data.whatsapp || null,
      gstNumber: data.gstNumber || null,
      enableGstBilling: !!data.enableGstBilling,
      thermalPrinterWidth: data.thermalPrinterWidth || '58mm',
      whatsappApiToken: data.whatsappApiToken || null,
      backupInterval: data.backupInterval || 'manual',
      currency: data.currency || '₹',
      templateInvoice: data.templateInvoice || null,
      templateReminder: data.templateReminder || null,
      templateOffer: data.templateOffer || null,
    };

    const result = await db.insert(shopSettings)
      .values(values)
      .onConflictDoUpdate({
        target: shopSettings.id,
        set: values
      })
      .returning();
    return result[0];
  } catch (error) {
    handleDbError('upsertShopSettings', error);
  }
}
