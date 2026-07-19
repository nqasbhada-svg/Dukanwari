/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Barcode, 
  Search, 
  Plus, 
  Trash2, 
  CreditCard, 
  Smartphone, 
  UserPlus, 
  Printer, 
  Share2, 
  CheckCircle, 
  Percent, 
  FileText, 
  ChevronRight,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Product, Customer, Invoice, InvoiceItem, AppTranslations } from '../types';
import { getWhatsAppBillingMessage, openWhatsAppBillingShare } from '../utils/whatsapp';

interface BillingTerminalProps {
  products: Product[];
  customers: Customer[];
  t: AppTranslations;
  isMr: boolean;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'outstanding' | 'ledger'>) => void;
  onGenerateInvoice: (invoice: Invoice) => void;
  shopSettings: any;
}

export default function BillingTerminalView({
  products,
  customers,
  t,
  isMr,
  onAddCustomer,
  onGenerateInvoice,
  shopSettings
}: BillingTerminalProps) {
  // POS States
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [invoiceType, setInvoiceType] = useState<'GST' | 'Non-GST'>('GST');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card' | 'Credit' | 'Split'>('Cash');
  const [splitDetails, setSplitDetails] = useState({ cash: 0, upi: 0, card: 0, credit: 0 });

  // Barcode / manual item adding state
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Bill creation outcome
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<'thermal' | 'a4'>('a4');

  // Customer inline adding state
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [custName, setCustName] = useState('');
  const [custMobile, setCustMobile] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custGst, setCustGst] = useState('');

  // Handle barcode "scanning" click simulation or Enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcodeSearch);
    if (product) {
      addItemToInvoice(product);
      setBarcodeSearch('');
    } else {
      alert(isMr ? 'बारकोड सापडला नाही!' : 'Product Barcode Not Found!');
    }
  };

  const addItemToInvoice = (product: Product) => {
    // Check if item already exists
    const existingIndex = items.findIndex(item => item.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].rate;
      setItems(updated);
    } else {
      const newItem: InvoiceItem = {
        productId: product.id,
        itemName: product.itemName,
        color: product.color,
        size: product.size,
        quantity: 1,
        rate: product.sellingPrice,
        gstPercent: invoiceType === 'GST' ? product.gstPercent : 0,
        hsn: product.hsn,
        discountAmount: 0,
        total: product.sellingPrice
      };
      setItems([...items, newItem]);
    }
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_, i) => i !== index);
    setItems(updated);
  };

  const updateQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = [...items];
    updated[index].quantity = newQty;
    updated[index].total = newQty * updated[index].rate;
    setItems(updated);
  };

  const handleAddCustomerInline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custMobile) return;
    onAddCustomer({
      name: custName,
      nameMr: custName,
      mobile: custMobile,
      whatsapp: custMobile,
      address: custAddress,
      gstNumber: custGst,
      creditLimit: 20000
    });
    setCustName('');
    setCustMobile('');
    setCustAddress('');
    setCustGst('');
    setIsAddingCustomer(false);
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
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerMobile: currentCustomer.mobile,
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Interactive Bill Panel (Left 2 columns) */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 space-y-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              POS
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.newInvoice}</h2>
              <p className="text-[10px] text-slate-400">Terminal Server #3000</p>
            </div>
          </div>

          <div className="flex gap-2 text-xs">
            <button 
              id="gst-invoice-toggle"
              onClick={() => {
                setInvoiceType('GST');
                // Adjust items' taxes
                setItems(items.map(it => {
                  const p = products.find(prod => prod.id === it.productId);
                  return { ...it, gstPercent: p?.gstPercent || 5 };
                }));
              }}
              className={`px-3 py-1.5 rounded-lg font-bold border transition ${invoiceType === 'GST' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              GST Invoice
            </button>
            <button 
              id="nongst-invoice-toggle"
              onClick={() => {
                setInvoiceType('Non-GST');
                setItems(items.map(it => ({ ...it, gstPercent: 0 })));
              }}
              className={`px-3 py-1.5 rounded-lg font-bold border transition ${invoiceType === 'Non-GST' ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              Non GST
            </button>
          </div>
        </div>

        {/* Scan Barcode / Search Clothes Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
          {/* Barcode scan Simulator */}
          <form onSubmit={handleBarcodeSubmit} className="relative">
            <Barcode className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder={isMr ? "बारकोड स्कॅन करा आणि एंटर दाबा..." : "Simulate Barcode Scan (e.g. 890100210011)"}
              value={barcodeSearch}
              onChange={(e) => setBarcodeSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-indigo-500 font-mono outline-none"
            />
            <button id="barcode-scan-submit-btn" type="submit" className="hidden"></button>
          </form>

          {/* Search Clothes dropdown click selection */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder={isMr ? "कपड्याचे नाव शोधून निवडा..." : "Search clothes by name / code..."}
              value={searchProductQuery}
              onChange={(e) => {
                setSearchProductQuery(e.target.value);
                setShowProductDropdown(true);
              }}
              onFocus={() => setShowProductDropdown(true)}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
            />
            {showProductDropdown && (
              <div className="absolute top-10 left-0 right-0 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-30 text-xs divide-y divide-slate-100">
                <div className="p-2 text-slate-400 bg-slate-50 flex justify-between items-center">
                  <span>{isMr ? 'उत्पादने निवडा' : 'Click to add item to invoice'}</span>
                  <button id="close-product-dropdown-btn" type="button" onClick={() => setShowProductDropdown(false)} className="text-[10px] hover:text-slate-600">Close</button>
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
                      className="p-2.5 hover:bg-slate-50 cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{isMr ? p.itemNameMr : p.itemName}</span>
                        <div className="text-[10px] text-slate-400 font-mono space-x-1.5">
                          <span>Size: {p.size}</span>
                          <span>•</span>
                          <span>Stock: {p.currentStock} {p.unit}</span>
                        </div>
                      </div>
                      <span className="font-bold text-indigo-600">₹{p.sellingPrice}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>

        {/* Invoice Itemized Grid Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-200 text-[10px]">
                <th className="py-2.5 px-3 w-8 text-center">#</th>
                <th className="py-2.5 px-3">{isMr ? 'कपड्याचे नाव/आकार' : 'Garment Name & Size'}</th>
                <th className="py-2.5 px-3 text-right">{isMr ? 'दर' : 'Rate'}</th>
                <th className="py-2.5 px-3 text-center">{isMr ? 'नग' : 'Qty'}</th>
                <th className="py-2.5 px-3 text-right">{isMr ? 'जीएसटी' : 'GST'}</th>
                <th className="py-2.5 px-3 text-right">{isMr ? 'एकूण' : 'Total'}</th>
                <th className="py-2.5 px-3 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                    <Barcode size={32} className="mx-auto text-slate-300" />
                    <p className="text-xs">{isMr ? 'बिलिंग यादी रिकामी आहे. बारकोड स्कॅन करा किंवा वरून कपडे जोडा.' : 'Invoice is empty. Scan barcodes or select clothes above.'}</p>
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/40">
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800">{isMr ? (products.find(p => p.id === item.productId)?.itemNameMr || item.itemName) : item.itemName}</span>
                      <div className="text-[10px] text-slate-500 space-x-2">
                        <span>Size: <strong className="text-slate-700">{item.size}</strong></span>
                        <span>•</span>
                        <span>Col: {item.color}</span>
                        {item.hsn && <span>• HSN: {item.hsn}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium">₹{item.rate}</td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          id={`qty-minus-${idx}`}
                          onClick={() => updateQuantity(idx, item.quantity - 1)}
                          className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center font-bold text-xs"
                        >-</button>
                        <span className="font-mono font-bold w-6 text-center">{item.quantity}</span>
                        <button 
                          id={`qty-plus-${idx}`}
                          onClick={() => updateQuantity(idx, item.quantity + 1)}
                          className="w-5 h-5 bg-slate-100 hover:bg-slate-200 rounded flex items-center justify-center font-bold text-xs"
                        >+</button>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-[10px] text-slate-500">{item.gstPercent}%</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">₹{item.total.toLocaleString()}</td>
                    <td className="py-3 px-3 text-center">
                      <button 
                        id={`remove-item-${idx}`}
                        onClick={() => removeItem(idx)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Sidebar Controller Panel (Right 1 column) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between space-y-6">
        <div className="space-y-5">
          {/* Section: Customer Picker */}
          <div className="space-y-1.5 pb-4 border-b border-slate-100">
            <div className="flex justify-between items-center">
              <label className="font-bold text-xs text-slate-800">{t.customerSelect}</label>
              <button 
                id="inline-add-customer-btn"
                onClick={() => setIsAddingCustomer(!isAddingCustomer)}
                className="text-xs text-indigo-600 hover:text-indigo-500 flex items-center gap-0.5"
              >
                <UserPlus size={12} /> {isMr ? 'नवीन जोडा' : 'New Client'}
              </button>
            </div>

            {isAddingCustomer ? (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 border border-indigo-100 bg-indigo-50/30 rounded-lg space-y-2 mt-2 text-xs"
              >
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Mobile" 
                  value={custMobile}
                  onChange={(e) => setCustMobile(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Address (Optional)" 
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded bg-white outline-none"
                />
                <div className="flex gap-2 pt-1">
                  <button id="cancel-inline-cust" type="button" onClick={() => setIsAddingCustomer(false)} className="w-1/2 p-1.5 bg-slate-100 rounded hover:bg-slate-200">Cancel</button>
                  <button id="save-inline-cust" type="button" onClick={handleAddCustomerInline} className="w-1/2 p-1.5 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-500">Save</button>
                </div>
              </motion.div>
            ) : (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-xs bg-white outline-none font-semibold text-slate-700"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>👤 {isMr ? c.nameMr : c.name} ({c.mobile})</option>
                ))}
              </select>
            )}
          </div>

          {/* Section: Discounts / Coupons */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-800">Discounts & Promos</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-500">Flat Discount (₹)</label>
                <div className="relative mt-1">
                  <span className="absolute left-2.5 top-2 text-slate-400">₹</span>
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
                    className="w-full pl-6 pr-2 p-1.5 border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500">Coupon Code</label>
                <div className="relative mt-1">
                  <input 
                    type="text"
                    placeholder="e.g. WELCOME10"
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
                    className="w-full p-1.5 border border-slate-200 rounded-lg outline-none font-mono uppercase text-[10px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Payment Modes selection */}
          <div className="space-y-3 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-800">{t.paymentMode}</h3>
            <div className="grid grid-cols-5 gap-1.5">
              {(['Cash', 'UPI', 'Card', 'Credit', 'Split'] as const).map(mode => (
                <button
                  key={mode}
                  id={`paymode-${mode}`}
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition text-center ${paymentMode === mode ? 'bg-indigo-50 text-indigo-700 border-indigo-400 shadow-3xs' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Split Payment Form fields */}
            {paymentMode === 'Split' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 mt-2 text-[10px]"
              >
                <p className="font-semibold text-slate-500 uppercase font-mono text-[9px]">Define Splitting Ratios (Must match total ₹{grandTotal})</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label>Cash Amount (₹)</label>
                    <input 
                      type="number" 
                      value={splitDetails.cash || ''} 
                      onChange={(e) => setSplitDetails({...splitDetails, cash: Number(e.target.value)})}
                      className="w-full p-1 border rounded bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label>UPI Amount (₹)</label>
                    <input 
                      type="number" 
                      value={splitDetails.upi || ''} 
                      onChange={(e) => setSplitDetails({...splitDetails, upi: Number(e.target.value)})}
                      className="w-full p-1 border rounded bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label>Card Amount (₹)</label>
                    <input 
                      type="number" 
                      value={splitDetails.card || ''} 
                      onChange={(e) => setSplitDetails({...splitDetails, card: Number(e.target.value)})}
                      className="w-full p-1 border rounded bg-white text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label>Credit/Ledger (₹)</label>
                    <input 
                      type="number" 
                      value={splitDetails.credit || ''} 
                      onChange={(e) => setSplitDetails({...splitDetails, credit: Number(e.target.value)})}
                      className="w-full p-1 border rounded bg-white text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Validation line */}
                {splitDetails.cash + splitDetails.upi + splitDetails.card + splitDetails.credit !== grandTotal && (
                  <span className="text-[9px] text-rose-600 flex items-center gap-0.5 font-semibold">
                    <AlertCircle size={10} /> Total is currently ₹{splitDetails.cash + splitDetails.upi + splitDetails.card + splitDetails.credit} (Diff: ₹{grandTotal - (splitDetails.cash + splitDetails.upi + splitDetails.card + splitDetails.credit)})
                  </span>
                )}
              </motion.div>
            )}
          </div>

          {/* Section: Calculator Breakdown summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-mono font-medium">₹{subtotal.toLocaleString()}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount Applied:</span>
                <span className="font-mono font-bold">-₹{discountAmount.toLocaleString()} ({discountPercent}%)</span>
              </div>
            )}
            {invoiceType === 'GST' && (
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>GST Tax Component (Incl.):</span>
                <span className="font-mono">₹{totalTax.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 font-bold text-slate-900 text-sm">
              <span>{t.grandTotal}</span>
              <span className="font-mono text-base text-indigo-600">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Generate Invoice primary check out button */}
        <button
          id="checkout-pos-btn"
          onClick={handleCheckout}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 transition text-white rounded-xl text-xs font-bold shadow-xl shadow-indigo-600/20 uppercase tracking-wider"
        >
          Generate & Print Invoice
        </button>
      </div>

      {/* Invoice Modal Overlay (Receipt + WhatsApp Share dashboard) */}
      {showInvoicePreview && activeInvoice && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 overflow-hidden text-xs text-slate-700"
          >
            {/* Left 2 columns: The Printable Invoice view itself */}
            <div className="md:col-span-2 p-6 max-h-[85vh] overflow-y-auto bg-slate-50 flex flex-col items-center">
              {/* Selector to switch print type format */}
              <div className="flex gap-2 bg-slate-200 p-1 rounded-lg mb-5 w-fit">
                <button
                  id="preview-a4-btn"
                  onClick={() => setPreviewTemplate('a4')}
                  className={`px-4 py-1.5 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition ${previewTemplate === 'a4' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <FileText size={14} />
                  A4 GST Tax Invoice
                </button>
                <button
                  id="preview-thermal-btn"
                  onClick={() => setPreviewTemplate('thermal')}
                  className={`px-4 py-1.5 rounded-md font-semibold text-[11px] flex items-center gap-1.5 transition ${previewTemplate === 'thermal' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <Printer size={14} />
                  Thermal Bill (80mm)
                </button>
              </div>

              {/* Template Render: 1. A4 Full GST Invoice */}
              {previewTemplate === 'a4' ? (
                <div className="bg-white p-8 w-full max-w-2xl border border-slate-200 rounded-lg shadow-sm font-sans space-y-6 text-slate-800">
                  {/* Company Header */}
                  <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-indigo-950 tracking-tight leading-none uppercase">{shopSettings.shopName}</h2>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest font-mono">Premium Fashion Emporium</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed max-w-xs">{shopSettings.address}</p>
                      <p className="text-[10px] text-slate-500">Mob: {shopSettings.mobile} | WhatsApp: {shopSettings.whatsapp}</p>
                    </div>
                    <div className="text-right space-y-1 bg-indigo-50 border border-indigo-100/60 p-2.5 rounded-lg">
                      <h4 className="text-indigo-900 font-bold tracking-tight text-xs uppercase">{activeInvoice.type} TAX INVOICE</h4>
                      <p className="text-[9px] font-mono font-semibold text-slate-600">GSTIN: {shopSettings.gstNumber}</p>
                    </div>
                  </div>

                  {/* Customer Details & Invoice identifiers */}
                  <div className="grid grid-cols-2 gap-4 text-[10px]">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-500 uppercase tracking-wider font-mono">Bill To Customer:</h4>
                      <p className="text-xs font-bold text-slate-900">{activeInvoice.customerName}</p>
                      <p className="text-slate-500">Contact: +91 {activeInvoice.customerMobile}</p>
                      {customers.find(c => c.id === activeInvoice.customerId)?.address && (
                        <p className="text-slate-400">Address: {customers.find(c => c.id === activeInvoice.customerId)?.address}</p>
                      )}
                      {customers.find(c => c.id === activeInvoice.customerId)?.gstNumber && (
                        <p className="text-indigo-600 font-mono font-semibold">GSTIN: {customers.find(c => c.id === activeInvoice.customerId)?.gstNumber}</p>
                      )}
                    </div>

                    <div className="space-y-1 text-right">
                      <h4 className="font-bold text-slate-500 uppercase tracking-wider font-mono">Invoice Credentials:</h4>
                      <p className="text-slate-600">Invoice ID: <strong className="font-mono text-slate-900">{activeInvoice.invoiceNumber}</strong></p>
                      <p className="text-slate-600">Bill Date: <strong className="font-mono text-slate-900">{activeInvoice.date}</strong></p>
                      <p className="text-slate-600">Payment Mode: <strong className="font-mono text-slate-900">{activeInvoice.paymentMode}</strong></p>
                      <p className="text-slate-600">Status: <span className="text-emerald-600 font-bold">{activeInvoice.status}</span></p>
                    </div>
                  </div>

                  {/* Items list mapping table */}
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase font-mono border-y border-slate-200">
                        <th className="py-2 px-1 text-center">#</th>
                        <th className="py-2 px-2">Garment Description</th>
                        <th className="py-2 px-1 font-mono text-center">HSN</th>
                        <th className="py-2 px-1 text-right font-mono">Rate (₹)</th>
                        <th className="py-2 px-1 text-center">Qty</th>
                        <th className="py-2 px-1 text-right font-mono">GST</th>
                        <th className="py-2 px-1 text-right font-mono">Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeInvoice.items.map((it, i) => (
                        <tr key={i} className="text-slate-700">
                          <td className="py-2.5 px-1 text-center font-mono">{i + 1}</td>
                          <td className="py-2.5 px-2 font-semibold">
                            {it.itemName}
                            <span className="text-[9px] text-slate-400 font-normal block">Size: {it.size} | Color: {it.color}</span>
                          </td>
                          <td className="py-2.5 px-1 text-center font-mono text-slate-500">{it.hsn || '-'}</td>
                          <td className="py-2.5 px-1 text-right font-mono">₹{it.rate}</td>
                          <td className="py-2.5 px-1 text-center font-mono font-semibold">{it.quantity}</td>
                          <td className="py-2.5 px-1 text-right font-mono text-slate-500">{it.gstPercent}%</td>
                          <td className="py-2.5 px-1 text-right font-mono font-bold">₹{it.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Calculations subtable summaries */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-[10px]">
                    <div className="space-y-1 leading-relaxed text-slate-400">
                      <p className="font-bold text-slate-500 uppercase tracking-wide">Terms & Conditions:</p>
                      <p>1. Goods once sold will not be returned, only exchanged within 7 days.</p>
                      <p>2. Subject to Pune jurisdiction only.</p>
                      <p>3. Dynamic warranty claims apply to premium fabrics only.</p>
                    </div>

                    <div className="space-y-1.5 font-sans">
                      <div className="flex justify-between text-slate-500">
                        <span>Items Subtotal:</span>
                        <span className="font-mono font-medium">₹{activeInvoice.subtotal.toLocaleString()}</span>
                      </div>
                      {activeInvoice.discount > 0 && (
                        <div className="flex justify-between text-emerald-600 font-semibold">
                          <span>Less Discount:</span>
                          <span className="font-mono">-₹{activeInvoice.discount.toLocaleString()}</span>
                        </div>
                      )}
                      {activeInvoice.type === 'GST' && (
                        <div className="flex justify-between text-slate-400 text-[9px]">
                          <span>GST Tax Component (Incl.):</span>
                          <span className="font-mono">₹{activeInvoice.taxAmount}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-slate-900 border-t border-slate-100 pt-1.5 text-xs">
                        <span>Invoice Total:</span>
                        <span className="font-mono text-indigo-700">₹{activeInvoice.grandTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* A4 signing and validation seals */}
                  <div className="flex justify-between items-end pt-8 text-[9px] text-slate-400">
                    <div className="space-y-1 text-center">
                      <div className="w-24 border-b border-slate-200 mx-auto h-8"></div>
                      <p>Customer Signature</p>
                    </div>
                    <div className="space-y-1 text-center font-semibold text-slate-600">
                      <p>For {shopSettings.shopName}</p>
                      <div className="w-24 h-8 bg-indigo-50/50 border border-indigo-100 rounded flex items-center justify-center italic text-indigo-600 text-[8px] font-mono">SEAL & SIGN</div>
                      <p>Authorized Representative</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Template Render: 2. Thermal Receipt */
                <div className="bg-white p-4 w-[280px] border border-slate-200 rounded-lg shadow-sm font-mono text-[9px] text-slate-800 space-y-3">
                  {/* Store Header */}
                  <div className="text-center space-y-1">
                    <h3 className="font-bold text-xs leading-none uppercase">{shopSettings.shopName}</h3>
                    <p className="text-[8px] leading-tight text-slate-500">{shopSettings.address}</p>
                    <p className="text-[8px] text-slate-500">Mobile: {shopSettings.mobile}</p>
                    <p className="text-[8px]">=============================</p>
                  </div>

                  {/* Invoice Header details */}
                  <div className="space-y-0.5 text-left text-slate-600">
                    <p>Bill No: {activeInvoice.invoiceNumber}</p>
                    <p>Date: {activeInvoice.date} 13:17</p>
                    <p>Customer: {activeInvoice.customerName}</p>
                    <p>Mob: +91 {activeInvoice.customerMobile}</p>
                    <p>Type: {activeInvoice.type} RETAIL BILL</p>
                    <p>=============================</p>
                  </div>

                  {/* Thermal Items Mapping */}
                  <div className="space-y-1 text-left text-slate-700">
                    <div className="grid grid-cols-4 font-bold uppercase text-[8px]">
                      <span className="col-span-2">Item description</span>
                      <span className="text-center">Qty</span>
                      <span className="text-right">Total</span>
                    </div>
                    <p>-----------------------------</p>
                    {activeInvoice.items.map((it, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="grid grid-cols-4">
                          <span className="col-span-2 font-bold">{it.itemName}</span>
                          <span className="text-center font-semibold">x{it.quantity}</span>
                          <span className="text-right font-bold">₹{it.total}</span>
                        </div>
                        <span className="text-[8px] text-slate-500 block">Size: {it.size} | Rate: ₹{it.rate}</span>
                      </div>
                    ))}
                    <p>=============================</p>
                  </div>

                  {/* Summary Calculations */}
                  <div className="space-y-1 text-right">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{activeInvoice.subtotal}</span>
                    </div>
                    {activeInvoice.discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount:</span>
                        <span>-₹{activeInvoice.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-xs border-t border-dashed border-slate-300 pt-1 text-slate-900">
                      <span>GRAND TOTAL:</span>
                      <span>₹{activeInvoice.grandTotal}</span>
                    </div>
                    <p>=============================</p>
                  </div>

                  {/* Footer Message */}
                  <div className="text-center space-y-1 leading-tight text-slate-500">
                    <p className="font-bold text-[8px]">THANK YOU - VISIT AGAIN!</p>
                    <p>Vastraa Cloud Sync Connected</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right 1 column: Share dashboard (WhatsApp PDF generators, Order Summaries, reminders) */}
            <div className="p-6 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Share2 className="text-emerald-500" size={18} />
                  <h3 className="font-bold text-slate-900 font-sans">WhatsApp Billing Terminal</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Send PDF copies, daily reminders, and order confirmations with one click! Automatically generates pre-formatted Marathi/English templates using secure WhatsApp web client.
                </p>

                {/* Simulated URL text bubble */}
                <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl space-y-1 text-emerald-950 font-mono text-[10px]">
                  <span className="font-bold uppercase tracking-wider block text-[8px] text-emerald-700">Constructed WhatsApp Template:</span>
                  <p className="italic font-sans">"{getWhatsAppMessage('invoice')}"</p>
                </div>

                {/* Templates checklist selections */}
                <div className="space-y-2.5 pt-2">
                  <button
                    id="wa-send-pdf-btn"
                    onClick={() => handleWhatsAppSend('invoice')}
                    className="w-full flex items-center justify-between p-3 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 rounded-xl transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-emerald-600" />
                      <div>
                        <span className="font-bold block text-slate-800">Send Invoice PDF</span>
                        <span className="text-[10px] text-slate-400">Share secure dynamic link</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>

                  <button
                    id="wa-send-summary-btn"
                    onClick={() => handleWhatsAppSend('summary')}
                    className="w-full flex items-center justify-between p-3 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 rounded-xl transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-emerald-600" />
                      <div>
                        <span className="font-bold block text-slate-800">Send Order Summary</span>
                        <span className="text-[10px] text-slate-400">Simple itemized checkout log</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>

                  <button
                    id="wa-send-reminder-btn"
                    onClick={() => handleWhatsAppSend('reminder')}
                    className="w-full flex items-center justify-between p-3 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/20 rounded-xl transition text-left"
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare size={14} className="text-emerald-600" />
                      <div>
                        <span className="font-bold block text-slate-800">Payment Reminder</span>
                        <span className="text-[10px] text-slate-400">Friendly credit outstanding alert</span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* PDF download, print triggers and close modal */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <button
                  id="print-invoice-btn"
                  onClick={() => {
                    alert(isMr ? 'प्रिंट आदेश यशस्वीरित्या पाठवला!' : 'Invoice printed successfully!');
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Printer size={14} />
                  Print Invoice
                </button>

                <button
                  id="close-invoice-preview-btn"
                  onClick={() => {
                    setShowInvoicePreview(false);
                    setActiveInvoice(null);
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold text-center"
                >
                  Close & New Transaction
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
