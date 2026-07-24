import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  MessageSquare, 
  Share2, 
  UserPlus,
  Barcode,
  ChevronRight,
  AlertCircle,
  Tag,
  CreditCard,
  Banknote,
  Smartphone,
  PieChart,
  X
} from 'lucide-react';
import { Product, InvoiceItem, Invoice, Customer, ShopSettings, AppTranslations } from '../types';
import { getWhatsAppBillingMessage, openWhatsAppBillingShare } from '../utils/whatsapp';
import { downloadElementAsPDF } from '../utils/pdfGenerator';

interface BillingTerminalViewProps {
  products: Product[];
  customers: Customer[];
  onGenerateInvoice: (invoice: Invoice) => void;
  onAddCustomer: (c: Omit<Customer, 'id' | 'outstanding' | 'ledger'>) => any;
  shopSettings: ShopSettings;
  t: AppTranslations;
  isMr: boolean;
}

export default function BillingTerminalView({ 
  products, 
  customers, 
  onGenerateInvoice, 
  onAddCustomer,
  shopSettings,
  t,
  isMr
}: BillingTerminalViewProps) {
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [invoiceType, setInvoiceType] = useState<'GST' | 'Non-GST'>('GST');
  
  // Search & Barcode
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [barcodeSearch, setBarcodeSearch] = useState('');

  // Customer Selection & Popup
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [showCustomerPopup, setShowCustomerPopup] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custGst, setCustGst] = useState('');

  const matchedCustomer = custMobile.trim().length >= 3
    ? customers.find(c => c.mobile.replace(/\s+/g, '').includes(custMobile.trim()))
    : null;

  // Discounts
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [couponCode, setCouponCode] = useState('');

  // Payment State
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Credit' | 'Split'>('UPI');
  const [splitDetails, setSplitDetails] = useState({ cash: 0, upi: 0, card: 0, credit: 0 });

  // Post-generation Preview
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  // Focus trap for barcode scanner
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Logic for capturing physical barcode scanner rapid typing could go here
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeSearch) return;
    const found = products.find(p => p.id === barcodeSearch || p.itemName.includes(barcodeSearch));
    if (found) {
      addItemToInvoice(found);
    } else {
      alert(isMr ? 'उत्पादन सापडले नाही!' : 'Product not found!');
    }
    setBarcodeSearch('');
  };

  const addItemToInvoice = (p: Product) => {
    const existingIndex = items.findIndex(it => it.productId === p.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].rate;
      setItems(updated);
    } else {
      const rate = invoiceType === 'GST' ? p.sellingPrice : p.sellingPrice; // Logic adjustment based on shop policy
      const gstPercent = invoiceType === 'GST' ? p.gstPercent : 0;
      setItems([...items, {
        productId: p.id,
        itemName: isMr ? p.itemNameMr : p.itemName,
        size: p.size,
        color: p.color,
        quantity: 1,
        rate: rate,
        gstPercent: gstPercent,
        total: rate
      }]);
    }
  };

  const updateItemQty = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = [...items];
    updated[index].quantity = newQty;
    updated[index].total = newQty * updated[index].rate;
    setItems(updated);
  };

  const handleAddCustomerInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custMobile) return;

    // Direct check if matching customer by mobile number already exists (exact match)
    const existing = customers.find(c => c.mobile.replace(/\s+/g, '') === custMobile.trim());
    if (existing) {
      setSelectedCustomerId(existing.id);
      setCustName('');
      setCustMobile('');
      setCustAddress('');
      setCustGst('');
      setIsAddingCustomer(false);
      setShowCustomerPopup(false);
      return;
    }

    const newCustomer = await onAddCustomer({
      name: custName,
      nameMr: custName,
      mobile: custMobile,
      whatsapp: custMobile,
      address: custAddress,
      gstNumber: custGst,
      creditLimit: 20000
    });

    if (newCustomer && newCustomer.id) {
      setSelectedCustomerId(newCustomer.id);
    }
    setCustName('');
    setCustMobile('');
    setCustAddress('');
    setCustGst('');
    setIsAddingCustomer(false);
    setShowCustomerPopup(false);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const totalTaxable = subtotal - discountAmount;
  const totalTax = items.reduce((sum, item) => {
    const itemDiscountRatio = subtotal > 0 ? (item.total / subtotal) : 0;
    const itemAllocatedDiscount = discountAmount * itemDiscountRatio;
    const netItemPrice = item.total - itemAllocatedDiscount;
    const tax = netItemPrice - (netItemPrice / (1 + (item.gstPercent / 100)));
    return sum + tax;
  }, 0);
  const grandTotal = Math.round(subtotal - discountAmount);

  const handleCheckout = () => {
    if (items.length === 0) {
      alert(isMr ? 'कृपया बिलात किमान एक कपडा जोडा!' : 'Please add at least one item to invoice!');
      return;
    }

    const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
    const generatedInvId = 'inv-' + Date.now();
    const dummyInvNum = 'INV-2026-0' + Math.floor(100 + Math.random() * 900);

    const newInvoice: Invoice = {
      id: generatedInvId,
      invoiceNumber: dummyInvNum,
      date: '2026-07-18', // System Date context
      customerId: currentCustomer?.id || 'unknown',
      customerName: currentCustomer?.name || 'Walk-in Customer',
      customerMobile: currentCustomer?.mobile || '0000000000',
      type: invoiceType,
      items: items,
      subtotal: subtotal,
      discount: discountAmount,
      taxAmount: Number(totalTax.toFixed(2)),
      grandTotal: grandTotal,
      paymentMode: paymentMode,
      whatsappSent: false,
      status: paymentMode === 'Credit' ? 'Unpaid' : paymentMode === 'Split' ? 'Partial' : 'Paid',
      amountPaid: paymentMode === 'Credit' ? 0 : paymentMode === 'Split' ? splitDetails.cash + splitDetails.upi + splitDetails.card : grandTotal,
      splitDetails: paymentMode === 'Split' ? splitDetails : undefined
    };

    onGenerateInvoice(newInvoice);
    setActiveInvoice(newInvoice);
    setShowInvoicePreview(true);

    // Clear state
    setItems([]);
    setDiscountAmount(0);
    setDiscountPercent(0);
    setCouponCode('');
  };

  // WhatsApp click triggers
  const getWhatsAppMessage = (type: 'invoice' | 'summary' | 'reminder') => {
    if (!activeInvoice) return '';
    return getWhatsAppBillingMessage(type, activeInvoice, shopSettings);
  };

  const handleWhatsAppSend = (msgType: 'invoice' | 'summary' | 'reminder') => {
    if (!activeInvoice) return;
    openWhatsAppBillingShare(msgType, activeInvoice, shopSettings);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Interactive Bill Panel (Left 2 columns) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* Header Module */}
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 rounded-3xl p-6 text-white shadow-xl shadow-fuchsia-200/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-extrabold text-xl shadow-inner">
              POS
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight drop-shadow-md">{t.newInvoice}</h2>
              <p className="text-sm font-medium text-white/80">Terminal Server #3000</p>
            </div>
          </div>
          
          {/* GST Toggles */}
          <div className="flex bg-white/20 backdrop-blur-md p-1.5 rounded-xl">
            <button 
              id="gst-invoice-toggle"
              onClick={() => {
                setInvoiceType('GST');
                setItems(items.map(it => {
                  const p = products.find(prod => prod.id === it.productId);
                  return { ...it, gstPercent: p?.gstPercent || 5 };
                }));
              }}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${invoiceType === 'GST' ? 'bg-white text-violet-700 shadow-md transform scale-105' : 'text-white/90 hover:bg-white/10'}`}
            >
              GST Invoice
            </button>
            <button 
              id="nongst-invoice-toggle"
              onClick={() => {
                setInvoiceType('Non-GST');
                setItems(items.map(it => ({ ...it, gstPercent: 0 })));
              }}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${invoiceType === 'Non-GST' ? 'bg-white text-fuchsia-700 shadow-md transform scale-105' : 'text-white/90 hover:bg-white/10'}`}
            >
              Non GST
            </button>
          </div>
        </div>

        {/* Scan & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100">
          <form onSubmit={handleBarcodeSubmit} className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Barcode className="text-violet-400 group-focus-within:text-violet-600 transition-colors" size={20} />
            </div>
            <input 
              type="text"
              placeholder={isMr ? "बारकोड स्कॅन करा आणि एंटर दाबा..." : "Scan Barcode & Press Enter"}
              value={barcodeSearch}
              onChange={(e) => setBarcodeSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-violet-300 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 outline-none transition-all shadow-sm"
            />
            <button id="barcode-scan-submit-btn" type="submit" className="hidden"></button>
          </form>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="text-fuchsia-400 group-focus-within:text-fuchsia-600 transition-colors" size={20} />
            </div>
            <input 
              type="text"
              placeholder={isMr ? "उत्पादनाचे नाव शोधून निवडा..." : "Search product by name / code..."}
              value={searchProductQuery}
              onChange={(e) => {
                setSearchProductQuery(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-transparent focus:border-fuchsia-300 focus:bg-white rounded-2xl text-sm font-bold text-slate-800 placeholder-slate-400 outline-none transition-all shadow-sm"
            />
            {showProductDropdown && (
              <div className="absolute top-14 left-0 right-0 max-h-64 overflow-y-auto bg-white border border-slate-100 rounded-2xl shadow-2xl z-30 divide-y divide-slate-50">
                <div className="p-3 text-slate-400 bg-slate-50/80 backdrop-blur-sm sticky top-0 flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                  <span>{isMr ? 'उत्पादने निवडा' : 'Select Product'}</span>
                  <button id="close-product-dropdown-btn" type="button" onClick={() => setShowProductDropdown(false)} className="hover:text-slate-800 transition-colors">Close</button>
                </div>
                {products
                  .filter(p => p.itemName.toLowerCase().includes(searchProductQuery.toLowerCase()) || p.itemNameMr.toLowerCase().includes(searchProductQuery.toLowerCase()))
                  .map(p => (
                    <div 
                      key={p.id}
                      id={`select-prod-${p.id}`}
                      onClick={() => {
                        addItemToInvoice(p);
                        setSearchProductQuery('');
                        setShowProductDropdown(false);
                      }}
                      className="p-4 hover:bg-fuchsia-50 cursor-pointer flex justify-between items-center group transition-colors"
                    >
                      <div>
                        <span className="font-extrabold text-slate-800 group-hover:text-fuchsia-800 transition-colors">{isMr ? p.itemNameMr : p.itemName}</span>
                        <div className="text-xs text-slate-500 font-medium mt-1 flex gap-2">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md">Size: {p.size}</span>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md">Color: {p.color}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-violet-600 block">₹{p.sellingPrice}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Stock: {p.currentStock}</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 overflow-hidden flex-1 flex flex-col">
          <div className="grid grid-cols-12 gap-2 bg-slate-50 border-b border-slate-100 p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider items-center">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-4">Product</div>
            <div className="col-span-2 text-center">Rate</div>
            <div className="col-span-3 text-center">Qty</div>
            <div className="col-span-1 text-center">GST</div>
            <div className="col-span-1 text-center">Del</div>
          </div>
          
          <div className="divide-y divide-slate-50 flex-1 overflow-y-auto p-2">
            <AnimatePresence>
              {items.map((item, index) => (
                <motion.div 
                  layout
                  key={item.productId}
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="grid grid-cols-12 gap-2 p-3 items-center hover:bg-slate-50/80 transition-colors rounded-2xl"
                >
                  <div className="col-span-1 text-center text-xs font-extrabold text-slate-400">{index + 1}</div>
                  
                  <div className="col-span-4 flex flex-col">
                    <span className="font-extrabold text-sm text-slate-800">{item.itemName}</span>
                    <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {item.size} • {item.color}
                    </span>
                  </div>
                  
                  <div className="col-span-2 text-center font-bold text-sm text-slate-600">
                    ₹{item.rate}
                  </div>
                  
                  <div className="col-span-3 flex justify-center items-center gap-2">
                    <button 
                      onClick={() => updateItemQty(index, item.quantity - 1)}
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="w-6 text-center font-extrabold text-sm text-slate-900">{item.quantity}</span>
                    <button 
                      onClick={() => updateItemQty(index, item.quantity + 1)}
                      className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-600 flex items-center justify-center transition-colors shadow-sm"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                  
                  <div className="col-span-1 text-center font-bold text-xs text-slate-500">
                    {item.gstPercent}%
                  </div>
                  
                  <div className="col-span-1 flex justify-center">
                    <button 
                      onClick={() => {
                        const newItems = [...items];
                        newItems.splice(index, 1);
                        setItems(newItems);
                      }}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {items.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Barcode className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-400 font-bold">No products added to invoice yet.</p>
                <p className="text-slate-400 text-xs mt-1">Scan a barcode or search above to begin.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Control Panel (Right 1 column) */}
      <div className="space-y-6">
        
        {/* Customer Block */}
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
              <UserPlus size={18} className="text-emerald-500" />
              {isMr ? "ग्राहक माहिती" : "Customer Info"}
            </h3>
            <button 
              id="open-customer-popup-btn"
              onClick={() => setShowCustomerPopup(true)}
              className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
            >
              {isMr ? "ग्राहक निवडा / बदला" : "Select / Change"}
            </button>
          </div>
          
          {(() => {
            const currentCust = customers.find(c => c.id === selectedCustomerId);
            if (!currentCust) return (
              <div 
                onClick={() => setShowCustomerPopup(true)}
                className="p-4 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-200 rounded-2xl cursor-pointer text-center text-xs text-slate-500 font-semibold transition"
              >
                {isMr ? "कोणताही ग्राहक निवडलेला नाही. निवडण्यासाठी येथे क्लिक करा." : "No customer selected. Click here to select."}
              </div>
            );
            return (
              <div 
                onClick={() => setShowCustomerPopup(true)}
                className="p-4 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 rounded-2xl cursor-pointer transition flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="font-extrabold text-sm text-slate-800">
                    {isMr ? currentCust.nameMr : currentCust.name}
                  </p>
                  <p className="text-xs text-slate-500 font-semibold">
                    Mobile: {currentCust.mobile}
                  </p>
                  {currentCust.address && (
                    <p className="text-[11px] text-slate-400 font-medium">
                      Address: {currentCust.address}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                    Selected
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Discounts & Promos */}
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center gap-2">
            <Tag size={18} className="text-amber-500" />
            Discounts & Promos
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Flat Disc (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-3.5 text-slate-400 font-extrabold">₹</span>
                <input 
                  type="number"
                  min="0"
                  max={subtotal}
                  value={discountAmount || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setDiscountAmount(val);
                    setDiscountPercent(subtotal > 0 ? Number(((val / subtotal) * 100).toFixed(1)) : 0);
                  }}
                  className="w-full pl-8 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:bg-white transition-colors font-bold text-sm text-slate-800"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Coupon Code</label>
              <input 
                type="text"
                placeholder="PROMO10"
                value={couponCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setCouponCode(code);
                  if (code.toUpperCase() === 'WELCOME10') {
                    const disc = Math.round(subtotal * 0.1);
                    setDiscountAmount(disc);
                    setDiscountPercent(10);
                  }
                }}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-amber-400 focus:bg-white transition-colors font-bold text-sm uppercase text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Payment Mode */}
        <div className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-blue-500" />
            Payment Mode
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {([
              { mode: 'Cash', icon: Banknote, color: 'emerald' }, 
              { mode: 'UPI', icon: Smartphone, color: 'blue' }, 
              { mode: 'Card', icon: CreditCard, color: 'violet' }, 
              { mode: 'Credit', icon: UserPlus, color: 'rose' }, 
              { mode: 'Split', icon: PieChart, color: 'fuchsia' }
            ] as const).map(({ mode, icon: Icon, color }) => (
              <button
                key={mode}
                onClick={() => setPaymentMode(mode as any)}
                className={`py-3 px-2 rounded-2xl text-xs font-extrabold border-2 transition-all flex flex-col items-center gap-1.5 ${
                  paymentMode === mode 
                    ? `bg-${color}-50 text-${color}-600 border-${color}-400 shadow-sm transform scale-105` 
                    : 'border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600 hover:border-slate-200'
                }`}
              >
                <Icon size={18} strokeWidth={2.5} />
                {mode}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {paymentMode === 'Split' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-4 overflow-hidden"
              >
                <p className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-3">Define Splitting Ratios</p>
                <div className="grid grid-cols-2 gap-3">
                  {['cash', 'upi', 'card', 'credit'].map((k) => (
                    <div key={k}>
                      <label className="text-[10px] font-bold text-slate-400 uppercase">{k}</label>
                      <input 
                        type="number" 
                        value={(splitDetails as any)[k] || ''} 
                        onChange={(e) => setSplitDetails({...splitDetails, [k]: Number(e.target.value)})}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold mt-1 focus:border-fuchsia-400 outline-none transition-colors text-slate-800"
                      />
                    </div>
                  ))}
                </div>
                {splitDetails.cash + splitDetails.upi + splitDetails.card + splitDetails.credit !== grandTotal && (
                  <div className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-3 bg-rose-50 p-2 rounded-lg">
                    <AlertCircle size={12} /> Total does not match Grand Total!
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Final Summary & Checkout */}
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl shadow-slate-900/30 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-500/20 rounded-full blur-3xl transform -translate-x-10 translate-y-10"></div>
          
          <div className="relative z-10 space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-300">
              <span>Items Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-sm font-bold text-emerald-400">
                <span>Discount</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
            {invoiceType === 'GST' && (
              <div className="flex justify-between items-center text-xs font-medium text-slate-400 border-t border-slate-800 pt-3">
                <span>Included GST Tax</span>
                <span>₹{totalTax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-end pt-4 border-t border-slate-800 mt-2">
              <span className="font-bold text-slate-400 mb-1">{t.grandTotal}</span>
              <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-fuchsia-300">
                ₹{grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <button
            id="checkout-pos-btn"
            onClick={handleCheckout}
            className="relative z-10 w-full py-4 mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-all text-white rounded-2xl text-sm font-extrabold shadow-lg shadow-fuchsia-600/30 uppercase tracking-widest transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Generate Invoice
          </button>
        </div>

      </div>

      {/* Invoice Modal Overlay */}
      {showInvoicePreview && activeInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-slate-100"
          >
            {/* Left: Receipt Preview */}
            <div className="w-full md:w-1/2 p-8 bg-slate-50 flex flex-col items-center justify-center relative">
              <div id="invoice-preview-modal-area" className="w-[300px] bg-white border-x border-t border-slate-200 shadow-sm font-mono text-[10px] p-6 text-slate-800 leading-relaxed overflow-hidden relative">
                {/* Jagged edge bottom effect using border-image or pseudo-element conceptually */}
                <div className="absolute -bottom-2 left-0 right-0 h-4 bg-repeat-x flex items-end"></div>
                
                <div className="text-center space-y-1 mb-4">
                  <h2 className="text-lg font-extrabold uppercase">{shopSettings.shopName}</h2>
                  <p className="text-slate-500">{shopSettings.address}</p>
                  {shopSettings.gstNumber && <p className="text-slate-500">GSTIN: {shopSettings.gstNumber}</p>}
                  <p>=============================</p>
                </div>
                
                <div className="space-y-0.5 text-left text-slate-600 mb-4">
                  <p><span className="font-bold text-slate-800">Bill No:</span> {activeInvoice.invoiceNumber}</p>
                  <p><span className="font-bold text-slate-800">Date:</span> {activeInvoice.date}</p>
                  <p><span className="font-bold text-slate-800">Customer:</span> {activeInvoice.customerName}</p>
                  <p><span className="font-bold text-slate-800">Mob:</span> +91 {activeInvoice.customerMobile}</p>
                  <p><span className="font-bold text-slate-800">Type:</span> {activeInvoice.type} RETAIL BILL</p>
                  <p>=============================</p>
                </div>
                
                <div className="space-y-1 text-left mb-4">
                  <div className="grid grid-cols-4 font-extrabold uppercase text-[8px] border-b border-slate-300 pb-1 mb-1">
                    <span className="col-span-2">Item</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Total</span>
                  </div>
                  {activeInvoice.items.map((it, idx) => (
                    <div key={idx} className="space-y-0.5 py-1">
                      <div className="grid grid-cols-4">
                        <span className="col-span-2 font-bold">{it.itemName}</span>
                        <span className="text-center font-semibold text-slate-600">x{it.quantity}</span>
                        <span className="text-right font-extrabold">₹{it.total}</span>
                      </div>
                      <span className="text-[8px] text-slate-400 block">Rate: ₹{it.rate}</span>
                    </div>
                  ))}
                  <p className="mt-2">=============================</p>
                </div>
                
                <div className="space-y-1.5 text-right font-medium">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>₹{activeInvoice.subtotal}</span>
                  </div>
                  {activeInvoice.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount:</span>
                      <span>-₹{activeInvoice.discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm border-t-2 border-slate-300 pt-2 text-slate-900 mt-2">
                    <span>GRAND TOTAL:</span>
                    <span>₹{activeInvoice.grandTotal}</span>
                  </div>
                  <p className="pt-2">=============================</p>
                </div>
                
                <div className="text-center space-y-1 mt-4 text-slate-500 pb-2">
                  <p className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider">Thank you, visit again!</p>
                  <p className="text-[8px]">Powered by Vastraa Cloud</p>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="w-full md:w-1/2 p-8 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between bg-white">
              <div className="space-y-6">
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-3">
                    <Share2 className="text-violet-500" size={24} />
                    Digital Delivery
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-2 leading-relaxed">
                    Send secure PDF copies, itemized order summaries, and payment reminders instantly via WhatsApp.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                  <span className="font-bold uppercase tracking-wider block text-[10px] text-slate-400 mb-2">Message Preview</span>
                  <p className="italic font-medium text-xs text-slate-700 line-clamp-3">"{getWhatsAppMessage('invoice')}"</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => handleWhatsAppSend('invoice')}
                    className="w-full flex items-center justify-between p-4 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:shadow-lg hover:shadow-emerald-100 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare size={18} />
                      </div>
                      <div className="text-left">
                        <span className="font-extrabold block text-slate-800 text-sm">Send PDF Receipt</span>
                        <span className="text-[11px] font-semibold text-slate-400">Share dynamic secure link</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </button>
                  
                  <button
                    onClick={() => handleWhatsAppSend('summary')}
                    className="w-full flex items-center justify-between p-4 border border-slate-200 hover:border-violet-400 hover:bg-violet-50 hover:shadow-lg hover:shadow-violet-100 rounded-2xl transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare size={18} />
                      </div>
                      <div className="text-left">
                        <span className="font-extrabold block text-slate-800 text-sm">Send Text Summary</span>
                        <span className="text-[11px] font-semibold text-slate-400">Simple itemized log</span>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={async () => {
                    const success = await downloadElementAsPDF('invoice-preview-modal-area', `Invoice_${activeInvoice?.invoiceNumber}.pdf`);
                    if (success) {
                      alert(isMr ? 'पीडीएफ यशस्वीरित्या जतन केली!' : 'PDF receipt downloaded successfully!');
                    } else {
                      window.print();
                    }
                  }}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-extrabold text-sm flex items-center justify-center gap-3 shadow-lg shadow-slate-900/20 transition-all animate-pulse hover:animate-none"
                >
                  <Printer size={18} />
                  {isMr ? 'पीडीएफ बिल डाउनलोड करा / प्रिंट' : 'Generate & Download PDF'}
                </button>
                <button
                  onClick={() => {
                    setShowInvoicePreview(false);
                    setActiveInvoice(null);
                  }}
                  className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-extrabold text-sm transition-colors"
                >
                  Close & New Transaction
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Customer Popup Screen / Modal Overlay */}
      {showCustomerPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                  <UserPlus size={20} className="text-indigo-600" />
                  {isMr ? "ग्राहक निवडा किंवा नवीन बनवा" : "Select or Add Customer"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isMr ? "शोधण्यासाठी मोबाईल नंबर किंवा नाव वापरा" : "Search existing customers or register a new one"}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowCustomerPopup(false);
                  setCustomerSearchQuery('');
                  setCustName('');
                  setCustMobile('');
                  setCustAddress('');
                  setCustGst('');
                }}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Search Existing Customer Box */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  {isMr ? "हयात ग्राहक शोधा" : "Search Existing Customer"}
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder={isMr ? "नाव किंवा मोबाईल नंबरने शोधा..." : "Type Name or Phone number..."}
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl text-xs font-semibold outline-none transition text-slate-800"
                  />
                </div>

                {/* Display matched search results if typing */}
                {customerSearchQuery.trim().length > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto mt-2 shadow-xs">
                    {customers
                      .filter(c => 
                        c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
                        c.mobile.includes(customerSearchQuery) || 
                        (c.nameMr && c.nameMr.includes(customerSearchQuery))
                      )
                      .map(c => (
                        <div 
                          key={c.id}
                          onClick={() => {
                            setSelectedCustomerId(c.id);
                            setCustomerSearchQuery('');
                            setShowCustomerPopup(false);
                          }}
                          className="p-3 hover:bg-emerald-50/50 cursor-pointer flex justify-between items-center transition"
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-800">{isMr ? c.nameMr : c.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Mob: {c.mobile}</p>
                          </div>
                          <span className="text-[9px] font-extrabold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                            Select
                          </span>
                        </div>
                      ))}
                    {customers.filter(c => 
                      c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) || 
                      c.mobile.includes(customerSearchQuery)
                    ).length === 0 && (
                      <p className="p-3 text-center text-xs text-slate-400 font-semibold">
                        No matching customers found.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Select Grid (up to 6 recent/top customers for quick selection) */}
              {customerSearchQuery.trim().length === 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    {isMr ? "त्वरित ग्राहक निवड" : "Quick Select Customer"}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                    {customers.slice(0, 6).map(c => {
                      const isSelected = selectedCustomerId === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCustomerId(c.id);
                            setShowCustomerPopup(false);
                          }}
                          className={`p-2.5 text-left rounded-xl border text-xs transition flex flex-col justify-between h-14 ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold' 
                              : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate block font-bold w-full">{isMr ? c.nameMr : c.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">{c.mobile}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 my-4"></div>

              {/* Add New Customer Form */}
              <form onSubmit={handleAddCustomerInline} className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider">
                    {isMr ? "नवीन ग्राहक नोंदणी करा" : "Register New Customer"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">
                      {isMr ? "नाव" : "Customer Name"} <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder={isMr ? "उदा. आनंद पाटील" : "e.g. Anand Patil"}
                      value={custName} 
                      onChange={e => setCustName(e.target.value)} 
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl text-xs font-semibold outline-none transition text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">
                      {isMr ? "मोबाईल नंबर" : "Mobile Number"} <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="tel" 
                      placeholder="10-digit number"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={custMobile} 
                      onChange={e => setCustMobile(e.target.value)} 
                      required
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl text-xs font-semibold outline-none transition text-slate-800"
                    />
                  </div>
                </div>

                {/* Match Existing Customer Banner inline in popup form */}
                {matchedCustomer && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-800"
                  >
                    <div className="space-y-0.5">
                      <p className="text-amber-900 font-extrabold flex items-center gap-1">
                        <AlertCircle size={14} className="text-amber-600" />
                        {isMr ? "या नंबरवर आधीच ग्राहक नोंदणीकृत आहे!" : "Customer already registered!"}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        {isMr ? matchedCustomer.nameMr : matchedCustomer.name} • {matchedCustomer.mobile}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomerId(matchedCustomer.id);
                        setCustName('');
                        setCustMobile('');
                        setCustAddress('');
                        setCustGst('');
                        setShowCustomerPopup(false);
                      }}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg transition-colors text-[10px] shadow-xs"
                    >
                      {isMr ? "हा निवडा" : "Use This"}
                    </button>
                  </motion.div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">
                    {isMr ? "पत्ता (ऐच्छिक)" : "Address / Location (Optional)"}
                  </label>
                  <input 
                    type="text" 
                    placeholder={isMr ? "उदा. शिवाजीनगर, पुणे" : "e.g. Shivajinagar, Pune"}
                    value={custAddress} 
                    onChange={e => setCustAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl text-xs font-semibold outline-none transition text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 block">
                    GSTIN (Optional)
                  </label>
                  <input 
                    type="text" 
                    placeholder="27AAAAA0000A1Z1"
                    maxLength={15}
                    value={custGst} 
                    onChange={e => setCustGst(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl text-xs font-semibold font-mono uppercase outline-none transition text-slate-800"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-colors shadow-md shadow-indigo-600/20 text-xs uppercase tracking-wider"
                >
                  {isMr ? "नवीन ग्राहक नोंदवा आणि वापरा" : "Register and Select Customer"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
