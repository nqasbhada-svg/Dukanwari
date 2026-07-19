# Vastraa ERP: Production Cloth Shop Management System

**Vastraa ERP** is a modern, enterprise-grade, dual-language (Marathi & English) shop management system custom-engineered for small to medium-sized apparel retail businesses. It integrates a lightweight, fast, offline-first client architecture built with **Flutter (Presentation, Domain, Data Layers)** and a robust cloud backend supported by **Supabase, PostgreSQL, and Realtime sync trigger engines**.

---

## 🌟 Key Application Capabilities

1. **Dual Language Localization**: Smooth, single-click hot-swap between Marathi and English, localizing invoice printing, dashboard widgets, stock limits, and ledger logs.
2. **Offline-First Secure Cache**: Adheres to strict privacy directives: *no permanent customer or transaction records are kept on physical device memory*. System utilizes temporary encrypted runtime caches with periodic background synchronization workers.
3. **Billing Terminal (POS)**: Features barcode/QR code scanners, dynamic HSN/GST automatic computations, split payments (Cash/UPI/Card/Credit), and direct WhatsApp sharing.
4. **Wholesale Stock Inward & Returns**: Purchase entries mapped to verified suppliers. Automated quantity increment triggers + store returned exchanges adjustments.
5. **Interactive Customers & Wholesalers Ledgers**: Client profiles with credit limits, warning markers for over-limit accounts, and interactive ledger grids displaying debits, credits, and running balances.
6. **Detailed Financial Reports**: Live analytics charts tracking daily/monthly sales velocities, P&L (Profit & Loss statement, accounting for wholesale costs and discounts), and GST tax liabilities.
7. **Public E-Commerce Catalog**: Consumer-facing web catalog with product filters, checkout, and simulated real-time shipping tracking.
8. **Dev Center**: Native code exporter allowing developers to copy and download complete PostgreSQL SQL databases and the modular Flutter client files.

---

## 🛠️ Technology & Architecture Stack

* **Frontend Client Core**: Flutter (Latest Stable)
* **Design Philosophy**: Material 3 Design Guidelines (Inter UI, Outfit headings, JetBrains Mono numbers)
* **State Management**: Riverpod (Providers, Notifiers, StateProviders)
* **Backend Platform**: Supabase (Authentication, Storage, PostgreSQL Database, Realtime Subscriptions)
* **Local Security Cache**: `flutter_secure_storage` (transient AES-encrypted in-memory cache)
* **Architecture Pattern**: Clean Architecture (MVVM + Repository + Entity Domain Partitioning)

---

## 📁 System Folder Structure & Files

The project contains a pre-compiled, fully interactive React demonstration suite, complete with code exporters:

* `/src/types.ts`: TypeScript interfaces mirroring domain entities (Product, Supplier, Customer, Invoice, PurchaseBill, Expense, AuditLog).
* `/src/data/translations.ts`: Master English and Marathi strings dictionary.
* `/src/data/mockData.ts`: Fully populated seed databases (garments, clients, suppliers, expenses, settings, audit trails).
* `/src/data/supabaseCode.ts`: Production SQL schema script, RLS security policies, and stored procedures.
* `/src/data/flutterCode.ts`: Complete production-ready Flutter Clean-Architecture Dart files.
* `/src/components/`: Modular interactive views:
  * `DashboardView`: KPIs, trend charts, fast-action billing launchpads.
  * `ProductManagementView`: Interactive clothing catalog, barcode generators.
  * `BillingTerminalView`: Real-time invoice POS, WhatsApp and receipt emulators.
  * `StockInOutView`: Suppliers purchasing inward entries and returns/exchanges.
  * `CustomerSupplierView`: Active customer accounts CRM and wholesale payment ledgers.
  * `ReportsView`: Profit & Loss sheets, asset valuations, and output GST tax tables.
  * `OnlineShopCatalog`: Public e-commerce simulator with order tracking timeline.
  * `AdminPanel`: Permissions, shop profiles, and audit log history tables.
  * `CodeCenterView`: Copy & download dashboard for Supabase and Flutter.

---

## 📊 Database Entity Relationship Summary

* **Customers** and **Suppliers** have associated **Ledger Entries** (`debit`, `credit`, `balance`).
* **Products** belong to specific **Categories** and **Brands** and are linked to their source wholesale **Supplier**.
* **Invoices** are linked to **Customers**, composed of multiple **Invoice Items** containing pricing rates, GST, and HSN codes.
* **Purchase Bills** log incoming items, updating product quantities via database triggers.
* **Audit Logs** chronologically log every action executed by Operators.

---

## ⚡ Quick Start for Developers

To run the interactive full-stack workspace:
1. Confirm node modules are installed:
   ```bash
   npm install
   ```
2. Launch the developer server:
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your web browser.
4. Select the **Developer Center** menu inside the app to copy the PostgreSQL production scripts and Flutter modules.
