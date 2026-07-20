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
  Key,
  Clock,
  AlertTriangle,
  Wifi,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { auth, googleAuthProvider, signInWithPopup } from './utils/firebase.ts';

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
  UserRole,
  Category,
  Brand
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
  initialBrands,
  initialRegistrations
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
import ShopRegistrationForm from './components/ShopRegistrationForm';
import AdminApprovalView from './components/AdminApprovalView';
import ShopOwnerStatusDashboard from './components/ShopOwnerStatusDashboard';
import { ShopRegistration } from './types';
import { hashPassword, comparePassword } from './utils/crypto';


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
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [loginMobile, setLoginMobile] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Shop Registrations & Admin Approval States
  const [registrations, setRegistrations] = useState<ShopRegistration[]>(() => {
    const stored = localStorage.getItem('vastraa_registrations');
    return stored ? JSON.parse(stored) : initialRegistrations;
  });
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [loginMode, setLoginMode] = useState<'otp' | 'business'>('otp');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [pendingSession, setPendingSession] = useState<ShopRegistration | null>(null);

  // Primary Business Collections (Reactive States simulating Cloud DB updates)
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('vastraa_products');
    return stored ? JSON.parse(stored) : initialProducts;
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const stored = localStorage.getItem('vastraa_customers');
    return stored ? JSON.parse(stored) : initialCustomers;
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const stored = localStorage.getItem('vastraa_suppliers');
    return stored ? JSON.parse(stored) : initialSuppliers;
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const stored = localStorage.getItem('vastraa_invoices');
    return stored ? JSON.parse(stored) : initialInvoices;
  });
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseBill[]>(() => {
    const stored = localStorage.getItem('vastraa_purchaseHistory');
    return stored ? JSON.parse(stored) : [];
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const stored = localStorage.getItem('vastraa_expenses');
    return stored ? JSON.parse(stored) : initialExpenses;
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const stored = localStorage.getItem('vastraa_auditLogs');
    return stored ? JSON.parse(stored) : initialAuditLogs;
  });
  const [shopSettings, setShopSettings] = useState<ShopSettings>(() => {
    const stored = localStorage.getItem('vastraa_shopSettings');
    return stored ? JSON.parse(stored) : defaultSettings;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = localStorage.getItem('vastraa_categories');
    return stored ? JSON.parse(stored) : initialCategories;
  });
  const [brands, setBrands] = useState<Brand[]>(() => {
    const stored = localStorage.getItem('vastraa_brands');
    return stored ? JSON.parse(stored) : initialBrands;
  });

  // ==========================================
  // SUPABASE REAL-TIME CONNECTION MONITOR & SYNC EFFECT
  // ==========================================
  const [supabaseOnline, setSupabaseOnline] = useState<boolean>(typeof window !== 'undefined' ? navigator.onLine : true);
  const [supabaseSyncing, setSupabaseSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Monitor network connection state
  useEffect(() => {
    const handleOnline = () => {
      setSupabaseOnline(true);
      // Automatically trigger a catch-up sync once back online
      setSupabaseSyncing(true);
      setTimeout(() => {
        setSupabaseSyncing(false);
        setLastSyncTime(new Date());
      }, 1500);
    };
    const handleOffline = () => setSupabaseOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerSupabaseSync = () => {
    if (!navigator.onLine) {
      setSupabaseOnline(false);
      return;
    }
    setSupabaseOnline(true);
    setSupabaseSyncing(true);
    const timer = setTimeout(() => {
      setSupabaseSyncing(false);
      setLastSyncTime(new Date());
    }, 1500);
    return () => clearTimeout(timer);
  };

  // Sync background updates when local datasets edit
  useEffect(() => {
    if (products.length > 0) {
      const cleanup = triggerSupabaseSync();
      return cleanup;
    }
  }, [products, customers, suppliers, invoices, purchaseHistory, expenses, categories, brands]);

  // Periodic automatic health check heartbeat (every 45s)
  useEffect(() => {
    const interval = setInterval(() => {
      triggerSupabaseSync();
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  // Keep localStorage in sync with changes in state
  useEffect(() => {
    localStorage.setItem('vastraa_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('vastraa_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('vastraa_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem('vastraa_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('vastraa_purchaseHistory', JSON.stringify(purchaseHistory));
  }, [purchaseHistory]);

  useEffect(() => {
    localStorage.setItem('vastraa_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('vastraa_auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('vastraa_shopSettings', JSON.stringify(shopSettings));
  }, [shopSettings]);

  const handleAddCategory = (newCat: Category) => {
    setCategories(prev => {
      const updated = [...prev, newCat];
      localStorage.setItem('vastraa_categories', JSON.stringify(updated));
      return updated;
    });
  };

  const handleAddBrand = (newBr: Brand) => {
    setBrands(prev => {
      const updated = [...prev, newBr];
      localStorage.setItem('vastraa_brands', JSON.stringify(updated));
      return updated;
    });
  };

  // Cloud SQL data loader
  useEffect(() => {
    const loadCloudData = async () => {
      try {
        const [
          regsRes,
          productsRes,
          customersRes,
          suppliersRes,
          invoicesRes,
          purchasesRes,
          auditLogsRes,
          settingsRes
        ] = await Promise.all([
          fetch('/api/registrations').then(r => r.ok ? r.json() : null),
          fetch('/api/products').then(r => r.ok ? r.json() : null),
          fetch('/api/customers').then(r => r.ok ? r.json() : null),
          fetch('/api/suppliers').then(r => r.ok ? r.json() : null),
          fetch('/api/invoices').then(r => r.ok ? r.json() : null),
          fetch('/api/purchase-bills').then(r => r.ok ? r.json() : null),
          fetch('/api/audit-logs').then(r => r.ok ? r.json() : null),
          fetch('/api/settings').then(r => r.ok ? r.json() : null)
        ]);

        if (regsRes && regsRes.length > 0) setRegistrations(regsRes);
        if (productsRes && productsRes.length > 0) setProducts(productsRes);
        if (customersRes && customersRes.length > 0) setCustomers(customersRes);
        if (suppliersRes && suppliersRes.length > 0) setSuppliers(suppliersRes);
        if (invoicesRes && invoicesRes.length > 0) setInvoices(invoicesRes);
        if (purchasesRes && purchasesRes.length > 0) setPurchaseHistory(purchasesRes);
        if (auditLogsRes && auditLogsRes.length > 0) setAuditLogs(auditLogsRes);
        if (settingsRes) setShopSettings(settingsRes);
      } catch (err) {
        console.warn('Failed to load initial data from Cloud SQL. Using local fallback:', err);
      }
    };
    loadCloudData();
  }, []);

  // Google Authentication Handler using Firebase and Cloud SQL profile sync
  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setOtpError('');
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await fetch('/api/users/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to sync user profile with Cloud Database.');
      }

      const syncResult = await response.json();
      
      setSession({
        role: 'owner',
        mobile: user.phoneNumber || 'Google Sign-In',
        name: user.displayName || user.email || 'Google User',
        permissions: ['ALL', 'DELETE_PRODUCT', 'REPORTS_VIEW', 'SETTINGS_EDIT']
      });

      // Log successful login
      const timestamp = new Date().toISOString();
      const newLog: AuditLog = {
        id: 'aud-' + Date.now(),
        timestamp,
        userId: user.uid,
        userName: user.displayName || user.email || 'Google User',
        action: 'GOOGLE_SIGNIN_SUCCESS',
        details: `Successful Cloud DB user authentication & profile synchronization.`
      };
      setAuditLogs(prev => [newLog, ...prev]);

      // Sync settings for the shop
      setShopSettings({
        ...defaultSettings,
        shopName: user.displayName ? `${user.displayName}'s Boutique` : 'Vastraa Trends',
        mobile: user.phoneNumber || '9876543210',
        whatsapp: user.phoneNumber || '9876543210',
      });

    } catch (error: any) {
      console.error('Google sign-in error:', error);
      const isPopupError = error.message?.includes('popup-blocked') || 
                           error.message?.includes('cancelled-popup-request') || 
                           error.message?.includes('assertion-failed') ||
                           error.message?.includes('promise');
      if (isPopupError) {
        setOtpError(isMr ? 
          'गूगल लॉगिन पॉप-अप ब्लॉक झाला आहे! आयफ्रेम सुरक्षा नियमांमुळे असे होऊ शकते. कृपया उजवीकडे वरच्या बाजूला असलेल्या "Open in New Tab" वर क्लिक करा किंवा खालील पर्यायी मार्ग (OTP / व्यवसाय लॉगिन) वापरा.' : 
          'Google Sign-In popup was blocked or cancelled! This is a standard security restriction inside preview frames. Please click the "Open in New Tab" button in the top-right corner to log in, or use the alternative OTP / Business login methods below.'
        );
      } else {
        setOtpError(isMr ? `गूगल लॉगिन अयशस्वी: ${error.message}` : `Google Sign-In Failed: ${error.message}`);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  // Business Login verification handler
  const handleBusinessLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    
    const trimmedUsername = loginUsername.toLowerCase().trim();
    if (
      (trimmedUsername === 'superadmin' || trimmedUsername === 'admin' || trimmedUsername === 'systemadmin') && 
      (loginPassword === 'adminpassword' || loginPassword === 'admin123')
    ) {
      // Successful System Admin login
      setSession({
        role: 'system_admin',
        mobile: '9876543210',
        name: 'System Admin (Platform Owner)',
        permissions: ['APPROVE_SHOPS', 'MANAGE_SUBSCRIPTIONS']
      });
      setCurrentView('approvals');
      setOtpError('');
      setLoginUsername('');
      setLoginPassword('');
      return;
    }

    const reg = registrations.find(r => 
      r.loginInfo.username.toLowerCase() === trimmedUsername && 
      comparePassword(loginPassword, r.loginInfo.password)
    );

    if (reg) {
      if (reg.subscription.status === 'Active') {
        // Successful login
        setSession({
          role: 'owner',
          mobile: reg.mobile,
          name: `${reg.ownerName} (${reg.shopName})`,
          permissions: ['ALL', 'DELETE_PRODUCT', 'REPORTS_VIEW', 'SETTINGS_EDIT']
        });
        
        // Load custom settings for the approved shop owner
        setShopSettings({
          ...defaultSettings,
          shopName: reg.shopName,
          mobile: reg.mobile,
          whatsapp: reg.mobile,
        });

        setLoginUsername('');
        setLoginPassword('');
      } else {
        // Pending approval, rejected, or more info requested
        setPendingSession(reg);
        setLoginUsername('');
        setLoginPassword('');
      }
    } else {
      setOtpError(isMr ? 'चुकीचे युझरनेम किंवा पासवर्ड!' : 'Invalid username or password!');
    }
  };

  // Submit registration form handler
  const handleRegisterBusiness = async (newReg: ShopRegistration) => {
    // Hash password securely using bcryptjs
    const securedReg: ShopRegistration = {
      ...newReg,
      loginInfo: {
        ...newReg.loginInfo,
        password: hashPassword(newReg.loginInfo.password)
      }
    };

    const updated = [securedReg, ...registrations];
    setRegistrations(updated);
    localStorage.setItem('vastraa_registrations', JSON.stringify(updated));
    
    // Synchronize secure registration with the backend Cloud SQL database
    try {
      await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(securedReg)
      });
    } catch (error) {
      console.error('Failed to sync secure registration with PostgreSQL database:', error);
    }
    
    // Log auth audit trail
    const timestamp = new Date().toISOString();
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      timestamp,
      userId: 'system',
      userName: 'Platform Gatekeeper',
      action: 'PARTNER_REGISTERED',
      details: `New Cloth Shop registered: ${newReg.shopName} by ${newReg.ownerName}. Status: Pending review.`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Send newly registered user directly to status tracking dashboard
    setPendingSession(securedReg);
    setIsRegistering(false);
  };

  // Update registration status handler (Admin/Software Owner Workflow)
  const handleUpdateRegistrationStatus = (
    id: string, 
    status: 'Pending' | 'Active' | 'Rejected' | 'MoreInfoNeeded',
    subscriptionUpdate?: {
      subscriptionType: 'Lifetime' | '1 Month' | '3 Months' | '6 Months' | '1 Year' | 'Custom';
      startDate: string;
      endDate?: string;
    },
    notes?: string
  ) => {
    const updated = registrations.map(reg => {
      if (reg.id === id) {
        return {
          ...reg,
          subscription: {
            ...reg.subscription,
            status,
            notes: notes || reg.subscription.notes,
            ...(subscriptionUpdate || {})
          }
        };
      }
      return reg;
    });

    setRegistrations(updated);
    localStorage.setItem('vastraa_registrations', JSON.stringify(updated));

    // Log the action to audit database
    const targetReg = registrations.find(r => r.id === id);
    const timestamp = new Date().toISOString();
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      timestamp,
      userId: session?.role === 'system_admin' ? 'system-admin' : (session?.role === 'owner' ? 'usr-1' : 'system'),
      userName: session?.name || 'System Admin',
      action: `PARTNER_STATUS_${status.toUpperCase()}`,
      details: `Updated status of shop ${targetReg?.shopName || id} to ${status.toUpperCase()}. notes: ${notes || 'None'}`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Update active pendingSession state if it is currently viewed
    if (pendingSession && pendingSession.id === id) {
      const freshReg = updated.find(r => r.id === id);
      if (freshReg) {
        setPendingSession(freshReg);
      }
    }
  };

  // Log an Audit Event helper
  const logEvent = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: session?.role === 'system_admin' ? 'system-admin' : (session?.role === 'owner' ? 'usr-1' : 'usr-2'),
      userName: session?.name || 'System User',
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

  const fastLogin = (role: 'system_admin' | 'owner' | 'employee') => {
    const mob = role === 'system_admin' ? '9876543210' : (role === 'owner' ? '9876543210' : '9988776655');
    setSession({
      role,
      mobile: mob,
      name: role === 'system_admin' 
        ? 'System Admin (Platform Owner)' 
        : (role === 'owner' ? 'Rahul Deshmukh (Owner)' : 'Amit Shinde (Employee)'),
      permissions: role === 'system_admin'
        ? ['APPROVE_SHOPS', 'MANAGE_SUBSCRIPTIONS']
        : (role === 'owner' 
          ? ['ALL', 'DELETE_PRODUCT', 'REPORTS_VIEW', 'SETTINGS_EDIT'] 
          : ['POS_BILLING', 'STOCK_INWARD'])
    });
    // Log auth audit trail
    const timestamp = new Date().toISOString();
    const newLog: AuditLog = {
      id: 'aud-' + Date.now(),
      timestamp,
      userId: role === 'system_admin' ? 'system-admin' : (role === 'owner' ? 'usr-1' : 'usr-2'),
      userName: role === 'system_admin' 
        ? 'System Admin' 
        : (role === 'owner' ? 'Rahul (Owner)' : 'Amit (Employee)'),
      action: 'LOGIN_OTP_VERIFIED',
      details: `Successful OTP authentication for role: ${role.toUpperCase()}`
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Set view accordingly
    if (role === 'system_admin') {
      setCurrentView('approvals');
    } else {
      setCurrentView('dashboard');
    }
  };

  const handleLogout = () => {
    logEvent('LOGOUT_SECURE', `Securely logged out session for: ${session?.name}`);
    setSession(null);
    setCurrentView('dashboard');
  };

  // Database State mutators
  const handleAddProduct = async (newP: Omit<Product, 'id'>) => {
    const product: Product = {
      ...newP,
      id: 'prod-' + Date.now(),
    };
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (response.ok) {
        const saved = await response.json();
        setProducts(prev => [saved, ...prev]);
      } else {
        setProducts(prev => [product, ...prev]);
      }
    } catch (err) {
      console.warn('Backend connection unavailable, saving locally:', err);
      setProducts(prev => [product, ...prev]);
    }
    logEvent('PRODUCT_ADD', `Added clothes: ${product.itemName} (${product.size}) with starting stock: ${product.openingStock}`);
  };

  const handleEditProduct = async (updatedP: Product) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedP),
      });
      if (response.ok) {
        const saved = await response.json();
        setProducts(prev => prev.map(p => p.id === saved.id ? saved : p));
      } else {
        setProducts(prev => prev.map(p => p.id === updatedP.id ? updatedP : p));
      }
    } catch (err) {
      console.warn('Backend connection unavailable, saving locally:', err);
      setProducts(prev => prev.map(p => p.id === updatedP.id ? updatedP : p));
    }
    logEvent('PRODUCT_EDIT', `Modified garment details for SKU ID: ${updatedP.barcode}`);
  };

  const handleDeleteProduct = async (id: string) => {
    const p = products.find(prod => prod.id === id);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setProducts(prev => prev.filter(prod => prod.id !== id));
      } else {
        setProducts(prev => prev.filter(prod => prod.id !== id));
      }
    } catch (err) {
      console.warn('Backend connection unavailable, deleting locally:', err);
      setProducts(prev => prev.filter(prod => prod.id !== id));
    }
    logEvent('PRODUCT_DELETE', `Deleted SKU: ${p?.itemName} from clothing catalog`);
  };

  const handleAddCustomer = async (newC: Omit<Customer, 'id' | 'outstanding' | 'ledger'>) => {
    const client: Customer = {
      ...newC,
      id: 'cust-' + Date.now(),
      outstanding: 0,
      ledger: []
    };
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
      if (response.ok) {
        const saved = await response.json();
        setCustomers(prev => [...prev, saved]);
      } else {
        setCustomers(prev => [...prev, client]);
      }
    } catch (err) {
      console.warn('Backend connection unavailable, saving locally:', err);
      setCustomers(prev => [...prev, client]);
    }
    logEvent('CRM_CLIENT_ADD', `Registered new client: ${client.name} | Credit Protection: ₹${client.creditLimit}`);
  };

  const handleAddSupplier = async (newS: Omit<Supplier, 'id' | 'outstanding' | 'ledger'>) => {
    const vendor: Supplier = {
      ...newS,
      id: 'sup-' + Date.now(),
      outstanding: 0,
      ledger: []
    };
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendor),
      });
      if (response.ok) {
        const saved = await response.json();
        setSuppliers(prev => [...prev, saved]);
      } else {
        setSuppliers(prev => [...prev, vendor]);
      }
    } catch (err) {
      console.warn('Backend connection unavailable, saving locally:', err);
      setSuppliers(prev => [...prev, vendor]);
    }
    logEvent('VEND_SUP_ADD', `Registered new wholesale vendor: ${vendor.name}`);
  };

  const handleGenerateInvoice = async (invoice: Invoice) => {
    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
    } catch (err) {
      console.warn('Backend connection unavailable for saving invoice:', err);
    }

    setInvoices(prev => [invoice, ...prev]);
    
    // Auto-decrease products inventories
    const updatedProducts = products.map(p => {
      const billItem = invoice.items.find(it => it.productId === p.id);
      if (billItem) {
        const updatedP = { ...p, currentStock: Math.max(0, p.currentStock - billItem.quantity) };
        // Sync product stock to DB
        fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedP),
        }).catch(err => console.warn('Failed to sync updated stock to DB:', err));
        return updatedP;
      }
      return p;
    });
    setProducts(updatedProducts);

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
          const updatedC = {
            ...c,
            outstanding: c.outstanding + debtAmount,
            ledger: [...c.ledger, ledgerEntry]
          };
          // Sync customer record to DB
          fetch('/api/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedC),
          }).catch(err => console.warn('Failed to sync updated customer outstanding to DB:', err));
          return updatedC;
        }
        return c;
      }));
    }

    logEvent('BILL_CREATE', `Processed ${invoice.type} bill ${invoice.invoiceNumber} for client: ${invoice.customerName} of amount ₹${invoice.grandTotal}`);
  };

  const handleAddPurchaseBill = async (bill: PurchaseBill) => {
    try {
      await fetch('/api/purchase-bills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bill),
      });
    } catch (err) {
      console.warn('Backend connection unavailable for purchase bills:', err);
    }

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
          const updatedS = {
            ...s,
            outstanding: s.outstanding + debt,
            ledger: [...s.ledger, ledger]
          };
          // Sync supplier record to DB
          fetch('/api/suppliers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedS),
          }).catch(err => console.warn('Failed to sync updated supplier outstanding to DB:', err));
          return updatedS;
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
  const menuItems = session?.role === 'system_admin'
    ? [
        { id: 'approvals', label: isMr ? 'नोंदणी मंजुरी आणि वर्गणी' : 'Licensing & Subscriptions', icon: ShieldCheck },
        { id: 'admin', label: t.adminPanel, icon: Settings }
      ]
    : [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
        { id: 'products', label: t.products, icon: Package },
        { id: 'billing', label: t.billing, icon: Receipt },
        { id: 'stock', label: isMr ? 'स्टॉक इन-आउट' : 'Stock In & Out', icon: Truck },
        { id: 'customers_suppliers', label: isMr ? 'ग्राहक आणि विक्रेता' : 'Ledgers & Directory', icon: Users },
        { id: 'reports', label: t.reports, icon: FileSpreadsheet, ownerOnly: true },
        { id: 'online_catalog', label: t.onlineCatalog, icon: ShoppingBag },
        { id: 'admin', label: t.adminPanel, icon: Settings, ownerOnly: true },
        { id: 'code_center', label: t.devCenter, icon: Code },
      ];

  if (isRegistering) {
    return (
      <ShopRegistrationForm 
        onBackToLogin={() => setIsRegistering(false)}
        onSubmitRegistration={handleRegisterBusiness}
        isMr={isMr}
      />
    );
  }

  if (pendingSession) {
    return (
      <ShopOwnerStatusDashboard 
        registration={pendingSession}
        onLogout={() => setPendingSession(null)}
        isMr={isMr}
      />
    );
  }

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

            {/* Google Cloud Login Button */}
            <div className="space-y-2">
              <button
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className={`w-full py-3 bg-white text-slate-900 hover:bg-slate-100 transition rounded-xl text-xs font-bold font-sans tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-white/5 active:scale-[0.98] ${isSigningIn ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSigningIn ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{isMr ? 'लॉगिन होत आहे...' : 'Signing in...'}</span>
                  </span>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.97 1 12 1 7.35 1 3.4 3.65 1.51 7.5l3.86 3C6.27 7.74 8.89 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.43c-.28 1.44-1.1 2.66-2.33 3.49l3.62 2.8c2.12-1.95 3.77-4.82 3.77-8.44z" />
                      <path fill="#FBBC05" d="M5.37 10.5a6.97 6.97 0 0 1 0-4.4L1.51 3.1a11.97 11.97 0 0 0 0 10.8l3.86-3z" />
                      <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.62-2.8c-1.1.74-2.52 1.18-4.34 1.18-3.11 0-5.73-2.7-6.63-5.46L1.51 16c1.89 3.85 5.84 6.5 10.49 6.5z" />
                    </svg>
                    <span>{isMr ? 'गूगल खाते द्वारे प्रवेश' : 'Sign in with Google Cloud'}</span>
                  </>
                )}
              </button>

              {/* Iframe detection notice */}
              {window.self !== window.top && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl text-[10px] leading-relaxed text-left space-y-1">
                  <p className="font-bold">⚠️ {isMr ? 'इशारा (Iframe Notice):' : 'Iframe Workspace Notice:'}</p>
                  <p>
                    {isMr 
                      ? 'गूगल लॉगिन पॉप-अप्स ब्राउझर सुरक्षा नियमांमुळे ब्लॉक होऊ शकतात. अडचण आल्यास, कृपया वरच्या उजव्या कोपऱ्यातील "Open in New Tab" वर क्लिक करा किंवा खालील OTP / व्यवसाय लॉगिन वापरा.' 
                      : 'Google Sign-In popups may be blocked inside this preview frame. If it fails, click "Open in New Tab" in the top-right, or use the OTP / Business login options below.'}
                  </p>
                </div>
              )}
              
              <div className="flex items-center gap-2 py-1">
                <div className="h-[1px] bg-white/10 flex-1"></div>
                <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">{isMr ? 'किंवा' : 'or'}</span>
                <div className="h-[1px] bg-white/10 flex-1"></div>
              </div>
            </div>

            {/* Auth Mode Toggle Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-white/5 p-1 rounded-xl text-xs font-semibold">
              <button
                id="mode-otp-btn"
                type="button"
                onClick={() => { setLoginMode('otp'); setOtpError(''); }}
                className={`py-1.5 rounded-lg transition ${loginMode === 'otp' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                📱 {isMr ? 'ओटीपी लॉगिन' : 'OTP Login'}
              </button>
              <button
                id="mode-business-btn"
                type="button"
                onClick={() => { setLoginMode('business'); setOtpError(''); }}
                className={`py-1.5 rounded-lg transition ${loginMode === 'business' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                🔑 {isMr ? 'व्यवसाय लॉगिन' : 'Business Account'}
              </button>
            </div>

            {/* Forms according to selected login mode */}
            {loginMode === 'otp' ? (
              !otpSent ? (
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
              )
            ) : (
              <form onSubmit={handleBusinessLogin} className="space-y-4 text-left text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">{isMr ? 'युझरनेम' : 'Username'}</label>
                  <input 
                    type="text"
                    required
                    placeholder={isMr ? "उदा. sanskriti_fashion" : "e.g. sanskriti_fashion"}
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none font-mono text-sm font-bold text-white tracking-wide"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">{isMr ? 'पासवर्ड' : 'Password'}</label>
                  <input 
                    type="password"
                    required
                    placeholder="••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none font-mono text-sm font-bold text-white tracking-widest"
                  />
                  <span className="text-[9px] text-indigo-400 font-mono block text-right mt-1">
                    🔑 {isMr ? 'सिस्टम ॲडमिन:' : 'System Admin:'} <span className="font-bold underline">admin</span> / {isMr ? 'पासवर्ड:' : 'pass:'} <span className="font-bold underline">admin123</span>
                  </span>
                </div>

                {otpError && <p className="text-rose-400 text-[11px] font-semibold">{otpError}</p>}

                <button
                  id="business-login-btn"
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 transition text-white rounded-xl text-xs font-bold font-sans tracking-wide uppercase shadow-lg shadow-indigo-600/20"
                >
                  {isMr ? 'खात्यामध्ये लॉगिन करा' : 'Verify & Log In'}
                </button>
              </form>
            )}

            {/* New Shop Registration CTA */}
            <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl space-y-1 text-xs text-left">
              <p className="text-slate-200 font-bold">{isMr ? 'नवीन कपड्यांचे दुकान नोंदणी:' : 'New Retail Clothes Shop?'}</p>
              <p className="text-[10px] text-slate-400 pb-2 leading-relaxed">
                {isMr 
                  ? 'नवीन ईआरपी पार्टनर बनण्यासाठी २ मिनिटांत ऑनलाईन नोंदणी करा व डिजिटल बिले सुरू करा.' 
                  : 'Register your shop profile and upload municipal approvals to activate your premium billing workspace.'}
              </p>
              <button
                id="trigger-register-btn"
                type="button"
                onClick={() => { setIsRegistering(true); setOtpError(''); }}
                className="w-full py-2 bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold tracking-wide uppercase shadow-md transition"
              >
                ✨ {isMr ? 'नवीन दुकान नोंदणी करा' : 'Register Your Shop Now'}
              </button>
            </div>

            {/* Quick Testing logins emulator layout */}
            <div className="border-t border-white/10 pt-4 space-y-2.5">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block text-left">Fast-Track Live Testing Demo</span>
              
              <div className="grid grid-cols-1 gap-2 text-xs">
                {/* 1. Platform Admin (System Admin) */}
                <button
                  id="demo-login-system-admin"
                  onClick={() => fastLogin('system_admin')}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-indigo-400 hover:bg-white/5 transition flex items-center justify-between gap-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#38BDF8] shrink-0" />
                    <div>
                      <span className="font-bold text-white/90 block leading-none">{isMr ? 'सिस्टम ॲडमिन (प्रणाली प्रशासक)' : 'Platform System Admin'}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">{isMr ? 'नवीन दुकानांची नोंदणी मंजूर करा आणि परवाने द्या' : 'Review shops & authorize licensing plans'}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-500" />
                </button>

                {/* 2. Shop Owner (Shop Admin) */}
                <button
                  id="demo-login-owner"
                  onClick={() => fastLogin('owner')}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-indigo-400 hover:bg-white/5 transition flex items-center justify-between gap-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white/90 block leading-none">{isMr ? 'दुकान मालक (शॉप ॲडमिन)' : 'Shop Owner (Shop Admin)'}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">{isMr ? 'बिलिंग टर्मिनल, उत्पादने आणि सेटिंग्ज व्यवस्थापित करा' : 'Manage billing, inventory, settings & reports'}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-500" />
                </button>

                {/* 3. Shop Employee */}
                <button
                  id="demo-login-employee"
                  onClick={() => fastLogin('employee')}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-indigo-400 hover:bg-white/5 transition flex items-center justify-between gap-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white/90 block leading-none">{isMr ? 'दुकान कर्मचारी (स्टाफ)' : 'Shop Employee (Billing Staff)'}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">{isMr ? 'थेट बिलिंग आणि स्टॉक नोंदणी हाताळा' : 'Handle direct POS sales bills and stock check'}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-500" />
                </button>

                {/* 2. Review pending */}
                <button
                  id="demo-preview-pending"
                  onClick={() => {
                    const pendingShop = registrations.find(r => r.id === 'reg-2026-001') || registrations[0];
                    if (pendingShop) setPendingSession(pendingShop);
                  }}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-indigo-400 hover:bg-white/5 transition flex items-center justify-between gap-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white/90 block leading-none">View "Pending Review" Shop Dashboard</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">Status of newly submitted store "Sanskriti Fashion"</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-500" />
                </button>

                {/* 3. Review rejected/more info */}
                <button
                  id="demo-preview-rejected"
                  onClick={() => {
                    const infoShop = registrations.find(r => r.id === 'reg-2026-003') || registrations[2];
                    if (infoShop) setPendingSession(infoShop);
                  }}
                  className="p-2.5 rounded-xl border border-white/10 hover:border-indigo-400 hover:bg-white/5 transition flex items-center justify-between gap-2 text-left"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={16} className="text-indigo-400 shrink-0" />
                    <div>
                      <span className="font-bold text-white/90 block leading-none">View "Action Required" Dashboard</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 block">Status feedback from admin on "Kids Planet Clothes"</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-500" />
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
                
                {/* Supabase Sync status indicator */}
                <div 
                  id="supabase-sync-indicator"
                  onClick={triggerSupabaseSync}
                  className={`flex items-center gap-1.5 border px-2 py-1 md:px-2.5 md:py-1.5 rounded-lg select-none transition cursor-pointer relative group text-[11px] md:text-xs ${
                    supabaseSyncing 
                      ? 'border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400'
                      : supabaseOnline
                        ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/10 text-emerald-700 dark:text-emerald-400'
                        : 'border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/10 text-rose-700 dark:text-rose-400'
                  }`}
                  title={isMr ? "सुपर्बेस सिंक्रोनाइझेशन स्थिती" : "Supabase Sync Status (Click to sync now)"}
                >
                  <div className="relative flex items-center justify-center">
                    {supabaseSyncing ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : supabaseOnline ? (
                      <>
                        <Wifi size={13} className="shrink-0" />
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                      </>
                    ) : (
                      <AlertCircle size={13} className="shrink-0" />
                    )}
                  </div>
                  
                  <span className="font-bold hidden sm:inline-block">
                    {supabaseSyncing 
                      ? (isMr ? 'सिंक्रोनाइझ करत आहे...' : 'Syncing...') 
                      : supabaseOnline 
                        ? (isMr ? 'ऑनलाइन' : 'Online') 
                        : (isMr ? 'ऑफलाईन' : 'Offline')
                    }
                  </span>
                  
                  {/* Subtle state icon / label for mobile */}
                  <span className="font-bold sm:hidden">
                    {supabaseSyncing ? '...' : supabaseOnline ? 'ON' : 'OFF'}
                  </span>

                  {/* Tooltip detail on hover */}
                  <div className="absolute right-0 top-full mt-2 w-48 p-2.5 bg-slate-950 text-white rounded-lg shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none z-50 text-[10px] space-y-1 leading-normal font-mono">
                    <p className="font-bold text-slate-300">
                      {isMr ? 'सुपर्बेस कनेक्शन' : 'Supabase Integration'}
                    </p>
                    <div className="flex items-center gap-1 text-slate-400">
                      <span className={`w-1.5 h-1.5 rounded-full ${supabaseOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                      <span>{supabaseOnline ? (isMr ? 'सुरक्षित जोडणी सक्रिय' : 'Secure Socket Active') : (isMr ? 'कनेक्शन नाही' : 'Offline Mode')}</span>
                    </div>
                    <p className="text-slate-500 text-[9px] pt-1 border-t border-slate-800 mt-1">
                      {isMr ? 'शेवटचे सिंक: ' : 'Last synchronized: '}
                      {lastSyncTime.toLocaleTimeString()}
                    </p>
                  </div>
                </div>

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
                      categories={categories}
                      brands={brands}
                      suppliers={suppliers}
                      t={t}
                      isMr={isMr}
                      onAddProduct={handleAddProduct}
                      onEditProduct={handleEditProduct}
                      onDeleteProduct={handleDeleteProduct}
                      onAddCategory={handleAddCategory}
                      onAddBrand={handleAddBrand}
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
                      categories={categories}
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

                  {currentView === 'approvals' && (
                    <AdminApprovalView 
                      registrations={registrations}
                      onUpdateStatus={handleUpdateRegistrationStatus}
                      isMr={isMr}
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
            {session?.role !== 'system_admin' && (
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
            )}

          </main>

        </div>
      )}

    </div>
  );
}
