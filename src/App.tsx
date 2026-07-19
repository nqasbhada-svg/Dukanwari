/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Truck, 
  Users, 
  FileSpreadsheet, 
  ShoppingBag, 
  Settings, 
  Code,
  LogOut,
  Menu,
  X,
  Globe,
  Sun,
  Moon,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Key
} from 'lucide-react';

// Models & Types
import { 
  Product, 
  Customer, 
  Supplier, 
  Invoice, 
  PurchaseBill, 
  AuditLog, 
  ShopSettings, 
  Expense,
  UserSession,
  UserRole
} from './types';

// Dictionaries & Mock Databases
import { englishTranslations, marathiTranslations } from './data/translations';
import { 
  initialProducts, 
  initialCustomers, 
  initialSuppliers, 
  initialInvoices, 
  initialExpenses, 
  initialAuditLogs, 
  defaultSettings,
  initialCategories,
  initialBrands
} from './data/mockData';

// Subcomponents Views
import DashboardView from './components/DashboardView';
import ProductManagementView from './components/ProductManagementView';
import BillingTerminalView from './components/BillingTerminalView';
import StockInOutView from './components/StockInOutView';
import CustomerSupplierView from './components/CustomerSupplierView';
import ReportsView from './components/ReportsView';
import OnlineShopCatalog from './components/OnlineShopCatalog';
import AdminPanel from './components/AdminPanel';
import CodeCenterView from './components/CodeCenterView';

export default function App() {
  // Localization & Theme Configuration
  const [lang, setLang] = useState<'en' | 'mr'>('en');
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const isMr = lang === 'mr';
  const t = isMr ? marathiTranslations : englishTranslations;

  // Active View Tab Router
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Authentication State
  const [session, setSession] = useState<UserSession | null>(null);
  const [loginMobile, setLoginMobile] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Primary Business Collections (Reactive States simulating Cloud DB updates)
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseBill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [shopSettings, setShopSettings] = useState<ShopSettings>(defaultSettings);

  // Log an Audit Event helper
  const logEvent = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: session?.role === 'owner' ? 'usr-1' : 'usr-2',
      userName: session?.role === 'owner' ? 'Rahul (Owner)' : 'Amit (Employee)',
      action: action,
      details: details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Simulated OTP Auth functions
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMobile.length !== 10) {
      setOtpError(isMr ? 'कृपया वैध १०-अंकी नंबर प्रविष्ट करा.' : 'Please enter a valid 10-digit number.');
      return;
    }
    setOtpError('');
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginOtp === '123456') {
      const isOwner = loginMobile === '9876543210' || loginMobile === '8888888888';
      const role: UserRole = isOwner ? 'owner' : 'employee';
      setSession({
        role,
        mobile: loginMobile,
        name: isOwner ? 'Rahul Deshmukh' : 'Amit Shinde',
        permissions: isOwner 
          ? ['ALL', 'DELETE_PRODUCT', 'REPORTS_VIEW', 'SETTINGS_EDIT'] 
          : ['POS_BILLING', 'STOCK_INWARD']
      });
      setOtpSent(false);
      setLoginMobile('');
      setLoginOtp('');
    } else {
      setOtpError(isMr ? 'चुकीचा ओटीपी! डेमो ओटीपी: 123456' : 'Invalid OTP! Default demo OTP is 123456');
    }
  };

  const fastLogin = (role: 'owner' | 'employee') => {
    const mob = role === 'owner' ? '9876543210' : '9988776655';
    setSession({
      role,
      mobile: mob,
      name: role === 'owner' ? 'Rahul Deshmukh (Owner)' : 'Amit Shinde (Employee)',
      permissions: role === 'owner' 
        ? ['ALL', 'DELETE_PRODUCT', 'REPORTS_VIEW', 'SETTINGS_EDIT'] 
        : ['POS_BILLING', 'STOCK_INWARD']
    });
    // Log auth audit trail
    const timestamp = new Date().toISOString();
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      timestamp,
      userId: role === 'owner' ? 'usr-1' : 'usr-2',
      userName: role === 'owner' ? 'Rahul (Owner)' : 'Amit (Employee)',
      action: 'LOGIN_OTP_VERIFIED',
      details: `Successful OTP authentication for role: ${role.toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleLogout = () => {
    logEvent('LOGOUT_SECURE', `Securely logged out session for: ${session?.name}`);
    setSession(null);
    setCurrentView('dashboard');
  };

  // Database State mutators
  const handleAddProduct = (newP: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newP,
      id: 'prod-' + Date.now(),
    };
    setProducts(prev => [product, ...prev]);
    logEvent('PRODUCT_ADD', `Added clothes: ${product.itemName} (${product.size}) with starting stock: ${product.openingStock}`);
  };

  const handleEditProduct = (updatedP: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedP.id ? updatedP : p));
    logEvent('PRODUCT_EDIT', `Modified garment details for SKU ID: ${updatedP.barcode}`);
  };

  const handleDeleteProduct = (id: string) => {
    const p = products.find(prod => prod.id === id);
    setProducts(prev => prev.filter(prod => prod.id !== id));
    logEvent('PRODUCT_DELETE', `Deleted SKU: ${p?.itemName} from clothing catalog`);
  };

  const handleAddCustomer = (newC: Omit<Customer, 'id' | 'outstanding' | 'ledger'>) => {
    const client: Customer = {
      ...newC,
      id: 'cust-' + Date.now(),
      outstanding: 0,
      ledger: []
    };
    setCustomers(prev => [...prev, client]);
    logEvent('CRM_CLIENT_ADD', `Registered new client: ${client.name} | Credit Protection: ₹${client.creditLimit}`);
  };

  const handleAddSupplier = (newS: Omit<Supplier, 'id' | 'outstanding' | 'ledger'>) => {
    const vendor: Supplier = {
      ...newS,
      id: 'sup-' + Date.now(),
      outstanding: 0,
      ledger: []
    };
    setSuppliers(prev => [...prev, vendor]);
    logEvent('VEND_SUP_ADD', `Registered new wholesale vendor: ${vendor.name}`);
  };

  const handleGenerateInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    
    // Auto-decrease products inventories
    setProducts(prev => prev.map(p => {
      const billItem = invoice.items.find(it => it.productId === p.id);
      if (billItem) {
        return { ...p, currentStock: Math.max(0, p.currentStock - billItem.quantity) };
      }
      return p;
    }));

    // Adjust outstanding debts on customer if payment is CREDIT
    if (invoice.paymentMode === 'Credit' || invoice.status === 'Partial') {
      const debtAmount = invoice.grandTotal - invoice.amountPaid;
      setCustomers(prev => prev.map(c => {
        if (c.id === invoice.customerId) {
          const ledgerEntry = {
            id: 'l-c-' + Date.now(),
            date: invoice.date,
            type: 'sale' as const,
            refId: invoice.invoiceNumber,
            description: `Auto-logged invoice credit: ${invoice.items.length} clothes`,
            debit: invoice.grandTotal,
            credit: invoice.amountPaid,
            balance: c.outstanding + debtAmount
          };
          return {
            ...c,
            outstanding: c.outstanding + debtAmount,
            ledger: [...c.ledger, ledgerEntry]
          };
        }
        return c;
      }));
    }

    logEvent('BILL_CREATE', `Processed ${invoice.type} bill ${invoice.invoiceNumber} for client: ${invoice.customerName} of amount ₹${invoice.grandTotal}`);
  };

  const handleAddPurchaseBill = (bill: PurchaseBill) => {
    setPurchaseHistory(prev => [bill, ...prev]);
    
    // Adjust supplier outstanding payable if credit
    if (bill.paymentStatus !== 'Paid') {
      const debt = bill.grandTotal - bill.amountPaid;
      setSuppliers(prev => prev.map(s => {
        if (s.id === bill.supplierId) {
          const ledger = {
            id: 'l-s-' + Date.now(),
            date: bill.date,
            type: 'purchase' as const,
            refId: bill.billNumber,
            description: `Inventory wholesale supply purchase`,
            debit: bill.amountPaid,
            credit: bill.grandTotal,
            balance: s.outstanding + debt
          };
          return {
            ...s,
            outstanding: s.outstanding + debt,
            ledger: [...s.ledger, ledger]
          };
        }
        return s;
      }));
    }
  };

  const handleReceiveCollection = (customerId: string, amount: number, mode: 'Cash' | 'UPI' | 'Card', ref: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const entry = {
          id: 'l-c-' + Date.now(),
          date: '2026-07-18',
          type: 'receipt' as const,
          refId: ref || 'REC-SETTLE',
          description: `Collected outstanding balance via ${mode}`,
          debit: 0,
          credit: amount,
          balance: c.outstanding - amount
        };
        return {
          ...c,
          outstanding: Math.max(0, c.outstanding - amount),
          ledger: [...c.ledger, entry]
        };
      }
      return c;
    }));
    logEvent('CRM_PAYMENT_COLLECT', `Collected cash/UPI ₹${amount} from customer account ID: ${customerId}`);
  };

  const handlePaySupplier = (supplierId: string, amount: number, ref: string) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplierId) {
        const entry = {
          id: 'l-s-' + Date.now(),
          date: '2026-07-18',
          type: 'payment' as const,
          refId: ref || 'PAY-SETTLE',
          description: `Settled accounts payable cash/bank transfer`,
          debit: amount,
          credit: 0,
          balance: s.outstanding - amount
        };
        return {
          ...s,
          outstanding: Math.max(0, s.outstanding - amount),
          ledger: [...s.ledger, entry]
        };
      }
      return s;
    }));
    logEvent('VEND_SETTLEMENT_PAY', `Settled wholesale debt ₹${amount} with vendor ID: ${supplierId}`);
  };

  const handleUpdateProductStock = (productId: string, qty: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, currentStock: p.currentStock + qty } : p));
  };

  // Navigation menu links mapping
  const menuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'products', label: t.products, icon: Package },
    { id: 'billing', label: t.billing, icon: Receipt },
    { id: 'stock', label: isMr ? 'स्टॉक इन-आउट' : 'Stock In & Out', icon: Truck },
    { id: 'customers_suppliers', label: isMr ? 'ग्राहक आणि विक्रेता' : 'Ledgers & Directory', icon: Users },
    { id: 'reports', label: t.reports, icon: FileSpreadsheet, ownerOnly: true },
    { id: 'online_catalog', label: t.onlineCatalog, icon: ShoppingBag },
    { id: 'admin', label: t.adminPanel, icon: Settings },
    { id: 'code_center', label: t.devCenter, icon: Code },
  ];

  return (
    <div className="min-h-screen font-sans dark bg-[#0F0F0F] text-[#E6E1E5]">
      
      {/* If Not Logged In, Render beautiful OTP Lockscreen */}
      {!session ? (
        <div className="min-h-screen flex items-center justify-center p-4 bg-radial from-slate-900 to-slate-950 relative overflow-hidden text-white">
          
          {/* Ambient background decoration */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl"></div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl space-y-6 shadow-2xl relative z-10 text-center"
          >
            {/* Logo Icon */}
            <div className="mx-auto w-14 h-14 bg-gradient-to-tr from-pink-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/20">
              <ShoppingBag className="text-white" size={28} />
            </div>

            <div className="space-y-1.5">
              <div className="flex gap-2 items-center justify-center text-xs">
                {/* Language Selector */}
                <button 
                  id="login-lang-en"
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded font-bold ${lang === 'en' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >English</button>
                <span className="text-white/20">|</span>
                <button 
                  id="login-lang-mr"
                  onClick={() => setLang('mr')}
                  className={`px-2 py-0.5 rounded font-bold ${lang === 'mr' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >मराठी</button>
              </div>
              <h2 className="text-xl font-bold font-display tracking-tight mt-3">{t.loginTitle}</h2>
              <p className="text-white/60 text-xs">{t.loginSub}</p>
            </div>

            {/* OTP Form fields block */}
            {!otpSent ? (
              <form onSubmit={handleRequestOtp} className="space-y-4 text-left text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">{t.mobileLabel}</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                      type="text"
                      required
                      placeholder="e.g. 9876543210"
                      value={loginMobile}
                      onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none font-mono text-sm font-bold text-white tracking-widest"
                    />
                  </div>
                </div>

                {otpError && <p className="text-rose-400 text-[11px] font-semibold">{otpError}</p>}

                <button
                  id="request-otp-btn"
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 transition text-white rounded-xl text-xs font-bold font-sans tracking-wide uppercase shadow-lg shadow-indigo-600/20"
                >
                  {t.getOtp}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-left text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">{t.otpLabel}</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-2.5 text-slate-400" size={16} />
                    <input 
                      type="text"
                      required
                      placeholder="6-Digit Code"
                      value={loginOtp}
                      onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none font-mono text-sm font-bold text-white tracking-widest text-center"
                    />
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono block text-right mt-1">💡 Demo Key: 123456</span>
                </div>

                {otpError && <p className="text-rose-400 text-[11px] font-semibold">{otpError}</p>}

                <button
                  id="verify-otp-btn"
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 transition text-white rounded-xl text-xs font-bold font-sans tracking-wide uppercase shadow-lg shadow-emerald-600/20"
                >
                  {t.verifyOtp}
                </button>
              </form>
            )}

            {/* Quick Testing logins emulator layout */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Fast-Track Demo Login</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  id="demo-login-owner"
                  onClick={() => fastLogin('owner')}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-indigo-400 hover:bg-white/5 transition flex flex-col items-center gap-1 text-center"
                >
                  <ShieldCheck size={16} className="text-indigo-400" />
                  <span className="font-bold text-white/90">Owner Profile</span>
                  <span className="text-[9px] text-slate-400 font-mono">Full Privileges</span>
                </button>

                <button
                  id="demo-login-employee"
                  onClick={() => fastLogin('employee')}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-indigo-400 hover:bg-white/5 transition flex flex-col items-center gap-1 text-center"
                >
                  <Users size={16} className="text-pink-400" />
                  <span className="font-bold text-white/90">Staff Profile</span>
                  <span className="text-[9px] text-slate-400 font-mono">Restricted POS</span>
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      ) : (
        /* Main Application Workspace Layout */
        <div className="min-h-screen flex flex-col md:flex-row relative">
          
          {/* Side Drawer Drawer on Desktop */}
          <aside className="w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 hidden md:flex flex-col justify-between p-5 relative z-20">
            <div className="space-y-6">
              {/* Brand Branding Logo */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/20">
                  <ShoppingBag size={20} />
                </div>
                <div>
                  <h3 className="font-bold font-display text-white text-sm tracking-tight leading-none">Vastraa ERP</h3>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold">Small Shop OS</span>
                </div>
              </div>

              {/* Navigation list mapping */}
              <nav className="space-y-1">
                {menuItems.map(item => {
                  // Hide modules from staff if owner-only
                  if (item.ownerOnly && session.role !== 'owner') return null;
                  const isSelected = currentView === item.id;

                  return (
                    <button
                      key={item.id}
                      id={`nav-link-${item.id}`}
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${isSelected ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/10' : 'hover:bg-slate-800 text-slate-400'}`}
                    >
                      <span className="flex items-center gap-2.5">
                        <item.icon size={15} />
                        <span>{item.label}</span>
                      </span>
                      <ChevronRight size={12} className={isSelected ? 'text-white' : 'text-slate-600'} />
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Logout Panel footer */}
            <div className="border-t border-slate-800 pt-4 space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white text-[10px]">
                  {session.name.substring(0,2)}
                </div>
                <div>
                  <span className="font-bold text-white block truncate text-[11px] max-w-[120px]" title={session.name}>{session.name}</span>
                  <span className="text-[9px] uppercase font-mono text-slate-400 font-bold block">{session.role}</span>
                </div>
              </div>

              <button
                id="sidebar-logout-btn"
                onClick={handleLogout}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 transition rounded-lg text-rose-400 hover:text-rose-300 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <LogOut size={13} />
                {t.logout}
              </button>
            </div>
          </aside>

          {/* Top Bar for Mobile & Interactive Workspace Canvas */}
          <main className="flex-1 flex flex-col min-w-0">
            
            {/* Global Top header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-3 md:p-4 flex justify-between items-center relative z-10 shrink-0">
              <div className="flex items-center gap-2 md:gap-3">
                <button 
                  id="mobile-drawer-trigger"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                >
                  <Menu size={18} />
                </button>
                
                {/* Title */}
                <h2 className="font-bold font-display text-slate-900 dark:text-white text-sm md:text-base tracking-tight leading-none">
                  {menuItems.find(item => item.id === currentView)?.label}
                </h2>
              </div>

              {/* Utility shortcuts: Language, Mode, profile */}
              <div className="flex items-center gap-2 md:gap-3 text-xs">
                
                {/* Language Toggle bar */}
                <button
                  id="top-lang-toggle"
                  onClick={() => setLang(lang === 'en' ? 'mr' : 'en')}
                  className="flex items-center gap-1 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg transition text-[11px] md:text-xs text-slate-600 dark:text-slate-400"
                  title="Switch Language"
                >
                  <Globe size={13} />
                  <span className="font-bold">{lang === 'en' ? 'मराठी' : 'English'}</span>
                </button>

                {/* Dark Mode switch */}
                <button
                  id="top-dark-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-1.5 md:p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400"
                  title="Switch Color Theme"
                >
                  {darkMode ? <Sun size={13} /> : <Moon size={13} />}
                </button>

                {/* Role identifier badge */}
                <span className="hidden sm:inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-bold font-mono px-2 py-1 rounded-lg uppercase tracking-wider select-none shrink-0">
                  🛡️ {session.role}
                </span>
              </div>
            </header>

            {/* Mobile Sidebar overlay Drawer sheet */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden flex">
                  {/* Backdrop click barrier */}
                  <div 
                    onClick={() => setMobileMenuOpen(false)}
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-3xs"
                  ></div>

                  <motion.div 
                    initial={{ x: -260 }}
                    animate={{ x: 0 }}
                    exit={{ x: -260 }}
                    className="w-64 bg-slate-900 text-slate-300 relative z-10 flex flex-col justify-between p-5 text-xs"
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-sm font-display">Vastraa ERP</span>
                        <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white p-1">
                          <X size={18} />
                        </button>
                      </div>

                      <nav className="space-y-1">
                        {menuItems.map(item => {
                          if (item.ownerOnly && session.role !== 'owner') return null;
                          const isSelected = currentView === item.id;

                          return (
                            <button
                              key={item.id}
                              onClick={() => {
                                setCurrentView(item.id);
                                setMobileMenuOpen(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition ${isSelected ? 'bg-indigo-600 text-white font-bold shadow-md' : 'hover:bg-slate-800 text-slate-400'}`}
                            >
                              <span className="flex items-center gap-2.5">
                                <item.icon size={15} />
                                <span>{item.label}</span>
                              </span>
                            </button>
                          );
                        })}
                      </nav>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 transition rounded-lg text-rose-400 font-bold text-xs flex items-center justify-center gap-1.5"
                    >
                      <LogOut size={13} />
                      {t.logout}
                    </button>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Scrollable Working Canvas Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentView}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  {currentView === 'dashboard' && (
                    <DashboardView 
                      products={products}
                      invoices={invoices}
                      t={t}
                      isMr={isMr}
                      onNavigate={(view) => setCurrentView(view)}
                    />
                  )}

                  {currentView === 'products' && (
                    <ProductManagementView 
                      products={products}
                      categories={initialCategories}
                      brands={initialBrands}
                      suppliers={suppliers}
                      t={t}
                      isMr={isMr}
                      onAddProduct={handleAddProduct}
                      onEditProduct={handleEditProduct}
                      onDeleteProduct={handleDeleteProduct}
                    />
                  )}

                  {currentView === 'billing' && (
                    <BillingTerminalView 
                      products={products}
                      customers={customers}
                      t={t}
                      isMr={isMr}
                      onAddCustomer={handleAddCustomer}
                      onGenerateInvoice={handleGenerateInvoice}
                      shopSettings={shopSettings}
                    />
                  )}

                  {currentView === 'stock' && (
                    <StockInOutView 
                      products={products}
                      suppliers={suppliers}
                      purchaseHistory={purchaseHistory}
                      t={t}
                      isMr={isMr}
                      onAddPurchaseBill={handleAddPurchaseBill}
                      onUpdateProductStock={handleUpdateProductStock}
                    />
                  )}

                  {currentView === 'customers_suppliers' && (
                    <CustomerSupplierView 
                      customers={customers}
                      suppliers={suppliers}
                      t={t}
                      isMr={isMr}
                      settings={shopSettings}
                      onAddCustomer={handleAddCustomer}
                      onAddSupplier={handleAddSupplier}
                      onReceiveCollection={handleReceiveCollection}
                      onPaySupplier={handlePaySupplier}
                    />
                  )}

                  {currentView === 'reports' && (
                    <ReportsView 
                      products={products}
                      invoices={invoices}
                      purchaseHistory={purchaseHistory}
                      expenses={expenses}
                      t={t}
                      isMr={isMr}
                    />
                  )}

                  {currentView === 'online_catalog' && (
                    <OnlineShopCatalog 
                      products={products}
                      categories={initialCategories}
                      t={t}
                      isMr={isMr}
                    />
                  )}

                  {currentView === 'admin' && (
                    <AdminPanel 
                      settings={shopSettings}
                      auditLogs={auditLogs}
                      userSession={session}
                      isMr={isMr}
                      onUpdateSettings={(newSettings) => setShopSettings(newSettings)}
                      onToggleUserRole={(role) => setSession({ ...session, role })}
                    />
                  )}

                  {currentView === 'code_center' && (
                    <CodeCenterView 
                      isMr={isMr}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Elegant Mobile Bottom Navigation Bar (Floating Dock Style) */}
            <div className={`fixed bottom-0 left-0 right-0 z-30 md:hidden border-t px-2 py-2.5 flex justify-around items-center shadow-2xl backdrop-blur-md transition-colors ${darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-300' : 'bg-white/95 border-slate-200 text-slate-600'}`}>
              <button
                id="bottom-nav-dashboard"
                onClick={() => setCurrentView('dashboard')}
                className={`flex-1 flex flex-col items-center gap-1 transition ${currentView === 'dashboard' ? (darkMode ? 'text-indigo-400 font-bold' : 'text-indigo-600 font-bold') : 'text-slate-400 hover:text-slate-200'}`}
              >
                <LayoutDashboard size={18} />
                <span className="text-[10px] scale-90 font-medium">{t.dashboard}</span>
              </button>
              <button
                id="bottom-nav-products"
                onClick={() => setCurrentView('products')}
                className={`flex-1 flex flex-col items-center gap-1 transition ${currentView === 'products' ? (darkMode ? 'text-indigo-400 font-bold' : 'text-indigo-600 font-bold') : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Package size={18} />
                <span className="text-[10px] scale-90 font-medium">{t.products}</span>
              </button>
              <button
                id="bottom-nav-billing"
                onClick={() => setCurrentView('billing')}
                className={`flex-1 flex flex-col items-center gap-1 transition ${currentView === 'billing' ? (darkMode ? 'text-indigo-400 font-bold' : 'text-indigo-600 font-bold') : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Receipt size={18} />
                <span className="text-[10px] scale-90 font-medium">{t.billing}</span>
              </button>
              <button
                id="bottom-nav-customers"
                onClick={() => setCurrentView('customers_suppliers')}
                className={`flex-1 flex flex-col items-center gap-1 transition ${currentView === 'customers_suppliers' ? (darkMode ? 'text-indigo-400 font-bold' : 'text-indigo-600 font-bold') : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Users size={18} />
                <span className="text-[10px] scale-90 font-medium">{isMr ? 'ग्राहक-विक्रेता' : 'Ledgers'}</span>
              </button>
              <button
                id="bottom-nav-menu"
                onClick={() => setMobileMenuOpen(true)}
                className="flex-1 flex flex-col items-center gap-1 transition text-slate-400 hover:text-slate-200"
              >
                <Menu size={18} />
                <span className="text-[10px] scale-90 font-medium">{isMr ? 'अधिक' : 'More'}</span>
              </button>
            </div>

          </main>

        </div>
      )}

    </div>
  );
}
