/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Layers, 
  Plus, 
  Calendar, 
  User, 
  FileText,
  RefreshCw,
  Clock,
  CheckCircle,
  UserPlus,
  Search,
  AlertCircle,
  X
} from 'lucide-react';
import { Product, Supplier, PurchaseBill, AppTranslations } from '../types';

interface StockInOutViewProps {
  products: Product[];
  suppliers: Supplier[];
  purchaseHistory: PurchaseBill[];
  t: AppTranslations;
  isMr: boolean;
  onAddPurchaseBill: (bill: PurchaseBill) => void;
  onUpdateProductStock: (productId: string, quantityChange: number) => void;
  onAddSupplier?: (supplier: Omit<Supplier, 'id' | 'outstanding' | 'ledger'>) => any;
}

export default function StockInOutView({
  products,
  suppliers,
  purchaseHistory,
  t,
  isMr,
  onAddPurchaseBill,
  onUpdateProductStock,
  onAddSupplier
}: StockInOutViewProps) {
  // Tabs: 'inward' (Purchase Entry), 'outward' (Returns/Exchanges)
  const [activeSubTab, setActiveSubTab] = useState<'inward' | 'outward'>('inward');

  // Supplier Add States
  const [showSupplierPopup, setShowSupplierPopup] = useState(false);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');
  const [supName, setSupName] = useState('');
  const [supMobile, setSupMobile] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supGst, setSupGst] = useState('');
  
  const matchedSupplier = supMobile.trim().length >= 3
    ? suppliers.find(s => s.mobile.replace(/\s+/g, '').includes(supMobile.trim()))
    : null;

  // Purchase Form fields
  const [billNumber, setBillNumber] = useState('');
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [purchaseQty, setPurchaseQty] = useState(10);
  const [purchaseRate, setPurchaseRate] = useState(products[0]?.purchasePrice || 500);
  const [purchaseDate, setPurchaseDate] = useState('2026-07-18');

  // Return/Exchange states
  const [returnInvoiceNo, setReturnInvoiceNo] = useState('');
  const [returnProductId, setReturnProductId] = useState(products[0]?.id || '');
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('Size Misfit');
  const [returnAction, setReturnAction] = useState<'return' | 'exchange'>('return');

  const handleProductChange = (id: string) => {
    setSelectedProductId(id);
    const prod = products.find(p => p.id === id);
    if (prod) {
      setPurchaseRate(prod.purchasePrice);
    }
  };

  const handleAddSupplierInline = async (e: React.FormEvent) => {
    e.preventDefault();

    if (matchedSupplier) {
      setSupplierId(matchedSupplier.id);
      setSupName('');
      setSupMobile('');
      setSupAddress('');
      setSupGst('');
      setShowSupplierPopup(false);
      return;
    }

    if (onAddSupplier) {
      const finalName = supName.trim() || (isMr ? 'अज्ञात विक्रेता' : 'Unknown Supplier');
      const finalMobile = supMobile.trim() || '-';
      const newSupplier = await onAddSupplier({
        name: finalName,
        nameMr: finalName,
        mobile: finalMobile,
        address: supAddress,
        gstNumber: supGst,
        email: '',
      });

      if (newSupplier && newSupplier.id) {
        setSupplierId(newSupplier.id);
      }
    }
    
    setSupName('');
    setSupMobile('');
    setSupAddress('');
    setSupGst('');
    setShowSupplierPopup(false);
  };

  const handleSavePurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billNumber || !supplierId || !selectedProductId || purchaseQty <= 0) {
      alert(isMr ? 'कृपया सर्व आवश्यक रकाने भरा!' : 'Please fill in all fields!');
      return;
    }

    const supplier = suppliers.find(s => s.id === supplierId) || suppliers[0];
    const product = products.find(p => p.id === selectedProductId) || products[0];
    const calculatedTotal = purchaseQty * purchaseRate;

    const newBill: PurchaseBill = {
      id: 'pur-' + Date.now(),
      billNumber: billNumber,
      date: purchaseDate,
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: [{
        productId: product.id,
        itemName: product.itemName,
        quantity: purchaseQty,
        rate: purchaseRate,
        gstPercent: product.gstPercent,
        total: calculatedTotal
      }],
      grandTotal: calculatedTotal,
      paymentStatus: 'Paid',
      amountPaid: calculatedTotal
    };

    onAddPurchaseBill(newBill);
    onUpdateProductStock(product.id, purchaseQty); // Auto stock increase

    // Clear Form
    setBillNumber('');
    setPurchaseQty(10);
    alert(isMr ? 'स्टॉक खरेदी एंट्री यशस्वी झाली व साठा वाढला!' : 'Purchase entry saved successfully and stock increased!');
  };

  const handleProcessReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnInvoiceNo || returnQty <= 0) return;

    const product = products.find(p => p.id === returnProductId) || products[0];

    if (returnAction === 'return') {
      // Return: increase stock (cloth returned back to shop)
      onUpdateProductStock(product.id, returnQty);
      alert(isMr ? `परतावा यशस्वी! ${product.itemName} चा स्टॉक +${returnQty} ने वाढला.` : `Return processed! Stock for ${product.itemName} increased by +${returnQty}.`);
    } else {
      // Exchange: stock remains net same or adjusted (this simulates direct net zero stock change or direct adjustment)
      alert(isMr ? 'कपडा अदलाबदल (Exchange) यशस्वीरित्या नोंदवली गेली!' : 'Product exchange logged successfully!');
    }

    setReturnInvoiceNo('');
    setReturnQty(1);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200">
        <button
          id="stock-tab-inward"
          onClick={() => setActiveSubTab('inward')}
          className={`py-3 px-6 font-bold text-xs border-b-2 transition ${activeSubTab === 'inward' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <span className="flex items-center gap-1.5">
            <ArrowUpRight size={14} className="text-emerald-500" />
            {isMr ? 'खरेदी नोंदणी (Stock Inward / Purchase)' : 'Purchase Inward (Stock In)'}
          </span>
        </button>

        <button
          id="stock-tab-outward"
          onClick={() => setActiveSubTab('outward')}
          className={`py-3 px-6 font-bold text-xs border-b-2 transition ${activeSubTab === 'outward' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <span className="flex items-center gap-1.5">
            <ArrowDownLeft size={14} className="text-rose-500" />
            {isMr ? 'परतावा व अदलाबदल (Stock Return / Exchange)' : 'Returns & Exchanges (Stock Out)'}
          </span>
        </button>
      </div>

      {activeSubTab === 'inward' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Purchase Entry Form (Left 2 Columns) */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Plus size={16} className="text-indigo-600" />
              {isMr ? 'नवीन खरेदी बिल नोंदवा' : 'Inward New Supplier Purchase'}
            </h3>

            <form onSubmit={handleSavePurchase} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Purchase Bill Number</label>
                <div className="relative">
                  <FileText className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                  <input 
                    type="text"
                    required
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    placeholder="e.g. PUR-2026-981"
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 font-mono uppercase bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Purchase Date</label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
                  <input 
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg outline-none font-mono bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="font-semibold block text-slate-600">Supplier/Vendor Party</label>
                  <button 
                    type="button"
                    onClick={() => setShowSupplierPopup(true)}
                    className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded hover:bg-indigo-100 transition-colors"
                  >
                    {isMr ? "बदला / नवीन जोडा" : "Change / Add"}
                  </button>
                </div>
                {(() => {
                  const currentSup = suppliers.find(s => s.id === supplierId);
                  if (!currentSup) return (
                    <div 
                      onClick={() => setShowSupplierPopup(true)}
                      className="p-2 border border-dashed border-slate-200 rounded-lg cursor-pointer text-center text-[10px] text-slate-500 font-semibold"
                    >
                      Click to select supplier
                    </div>
                  );
                  return (
                    <div 
                      onClick={() => setShowSupplierPopup(true)}
                      className="p-2 bg-indigo-50/50 border border-indigo-100 rounded-lg cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-slate-800 text-xs">
                          {isMr ? currentSup.nameMr : currentSup.name}
                        </p>
                        <p className="text-[10px] text-slate-500">Mob: {currentSup.mobile}</p>
                      </div>
                      <User size={14} className="text-indigo-400" />
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Select Cloth Item to Inward</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white font-semibold text-slate-800"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>👗 {isMr ? p.itemNameMr : p.itemName} ({p.size})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Purchase Quantity (Stock Inward)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  value={purchaseQty}
                  onChange={(e) => setPurchaseQty(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono font-bold bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Purchase Wholesale Rate per Unit (₹)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono font-bold text-indigo-600 bg-white"
                />
              </div>

              {/* Summary Valuation */}
              <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 block">Total Purchase Cost (Taxable):</span>
                  <span className="font-extrabold text-base text-slate-900 font-mono">₹{(purchaseQty * purchaseRate).toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle size={14} /> Auto-Stock Increase Enabled
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Will update products inventory database instantly.</span>
                </div>
              </div>

              <button
                id="save-purchase-btn"
                type="submit"
                className="sm:col-span-2 py-3 bg-indigo-600 hover:bg-indigo-500 transition text-white rounded-xl text-xs font-bold font-sans uppercase tracking-wider shadow-lg shadow-indigo-600/15"
              >
                Inward Stock & Update Inventory
              </button>
            </form>
          </div>

          {/* Supplier Purchase logs history (Right 1 Column) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Clock size={16} className="text-slate-400" />
              Recent Purchase Records
            </h3>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {purchaseHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Layers size={24} className="mx-auto text-slate-300 mb-2" />
                  <p>No recent purchase invoices inwarded.</p>
                </div>
              ) : (
                purchaseHistory.map(bill => (
                  <div key={bill.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-indigo-600 font-mono">{bill.billNumber}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{bill.date}</span>
                    </div>
                    <span className="font-semibold text-slate-800 block line-clamp-1">From: {bill.supplierName}</span>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] text-slate-500 font-medium">Qty: {bill.items.reduce((s, i) => s + i.quantity, 0)} products</span>
                      <span className="font-bold text-slate-900 font-mono">₹{bill.grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Return & Exchange View */
        <div className="bg-white rounded-xl border border-slate-200 p-5 max-w-2xl space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <RefreshCw size={16} className="text-indigo-600" />
            Process Return & Exchanges
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Quickly adjust clothing inventory levels when a customer brings back a size misfit or requests a product exchange. Enter the original invoice reference for auditing trails.
          </p>

          <form onSubmit={handleProcessReturn} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700">
            <div className="space-y-1">
              <label className="font-semibold block text-slate-600">Original Customer Invoice ID</label>
              <input 
                type="text"
                required
                value={returnInvoiceNo}
                onChange={(e) => setReturnInvoiceNo(e.target.value)}
                placeholder="e.g. INV-2026-002"
                className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono uppercase bg-white text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold block text-slate-600">Product Returned</label>
              <select
                value={returnProductId}
                onChange={(e) => setReturnProductId(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white font-semibold"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>👗 {isMr ? p.itemNameMr : p.itemName} ({p.size})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold block text-slate-600">Quantity Returned</label>
              <input 
                type="number"
                required
                min="1"
                value={returnQty}
                onChange={(e) => setReturnQty(Number(e.target.value))}
                className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono bg-white text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold block text-slate-600">Action Type</label>
              <div className="flex gap-4 pt-1.5">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="return_action" 
                    checked={returnAction === 'return'}
                    onChange={() => setReturnAction('return')}
                  />
                  <span>Store Return (Increases Stock)</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="return_action" 
                    checked={returnAction === 'exchange'}
                    onChange={() => setReturnAction('exchange')}
                  />
                  <span>Direct Exchange</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold block text-slate-600">Reason for exchange/return</label>
              <input 
                type="text"
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g. Size mis-fit, color mismatch, minor defect"
                className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white text-slate-800"
              />
            </div>

            <button
              id="process-return-btn"
              type="submit"
              className="sm:col-span-2 py-3 bg-slate-900 hover:bg-slate-800 transition text-white rounded-xl text-xs font-bold font-sans uppercase tracking-wider"
            >
              Log Return Action & Re-adjust Stocks
            </button>
          </form>
        </div>
      )}

      {/* Supplier Popup Screen / Modal Overlay */}
      {showSupplierPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
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
                  {isMr ? "विक्रेता निवडा किंवा नवीन बनवा" : "Select or Add Supplier"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isMr ? "शोधण्यासाठी मोबाईल नंबर किंवा नाव वापरा" : "Search existing suppliers or register a new one"}
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowSupplierPopup(false);
                  setSupplierSearchQuery('');
                  setSupName('');
                  setSupMobile('');
                  setSupAddress('');
                  setSupGst('');
                }}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* Search Existing Supplier Box */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  {isMr ? "हयात विक्रेता शोधा" : "Search Existing Supplier"}
                </label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder={isMr ? "नाव किंवा मोबाईल नंबरने शोधा..." : "Type Name or Phone number..."}
                    value={supplierSearchQuery}
                    onChange={(e) => setSupplierSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl text-xs font-semibold outline-none transition text-slate-800"
                  />
                </div>

                {/* Display matched search results if typing */}
                {supplierSearchQuery.trim().length > 0 && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-48 overflow-y-auto mt-2 shadow-xs">
                    {suppliers
                      .filter(s => 
                        s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) || 
                        s.mobile.includes(supplierSearchQuery) || 
                        (s.nameMr && s.nameMr.includes(supplierSearchQuery))
                      )
                      .map(s => (
                        <div 
                          key={s.id}
                          onClick={() => {
                            setSupplierId(s.id);
                            setSupplierSearchQuery('');
                            setShowSupplierPopup(false);
                          }}
                          className="p-3 hover:bg-indigo-50/50 cursor-pointer flex justify-between items-center transition"
                        >
                          <div>
                            <p className="font-bold text-xs text-slate-800">{isMr ? s.nameMr : s.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium">Mob: {s.mobile}</p>
                          </div>
                          <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">
                            Select
                          </span>
                        </div>
                      ))}
                    {suppliers.filter(s => 
                      s.name.toLowerCase().includes(supplierSearchQuery.toLowerCase()) || 
                      s.mobile.includes(supplierSearchQuery)
                    ).length === 0 && (
                      <p className="p-3 text-center text-xs text-slate-400 font-semibold">
                        No matching suppliers found.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Select Grid (up to 6 recent/top suppliers for quick selection) */}
              {supplierSearchQuery.trim().length === 0 && (
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    {isMr ? "त्वरित विक्रेता निवड" : "Quick Select Supplier"}
                  </label>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                    {suppliers.slice(0, 6).map(s => {
                      const isSelected = supplierId === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setSupplierId(s.id);
                            setShowSupplierPopup(false);
                          }}
                          className={`p-2.5 text-left rounded-xl border text-xs transition flex flex-col justify-between h-14 ${
                            isSelected 
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-800 font-bold' 
                              : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="truncate block font-bold w-full">{isMr ? s.nameMr : s.name}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">{s.mobile}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-slate-100 my-4"></div>

              {/* Add New Supplier Form */}
              <form onSubmit={handleAddSupplierInline} className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider">
                    {isMr ? "नवीन विक्रेता नोंदणी करा" : "Register New Supplier"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">
                      {isMr ? "नाव" : "Supplier Name"}
                    </label>
                    <input 
                      type="text" 
                      placeholder={isMr ? "उदा. आनंद मिल्स" : "e.g. Anand Mills"}
                      value={supName} 
                      onChange={e => setSupName(e.target.value)} 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl text-xs font-semibold outline-none transition text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 block">
                      {isMr ? "मोबाईल नंबर" : "Mobile Number"}
                    </label>
                    <input 
                      type="tel" 
                      placeholder="10-digit number"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      value={supMobile} 
                      onChange={e => setSupMobile(e.target.value)} 
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl text-xs font-semibold outline-none transition text-slate-800"
                    />
                  </div>
                </div>

                {/* Match Existing Supplier Banner */}
                {matchedSupplier && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-800"
                  >
                    <div className="space-y-0.5">
                      <p className="text-amber-900 font-extrabold flex items-center gap-1">
                        <AlertCircle size={14} className="text-amber-600" />
                        {isMr ? "या नंबरवर आधीच विक्रेता नोंदणीकृत आहे!" : "Supplier already registered!"}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        {isMr ? matchedSupplier.nameMr : matchedSupplier.name} • {matchedSupplier.mobile}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSupplierId(matchedSupplier.id);
                        setSupName('');
                        setSupMobile('');
                        setSupAddress('');
                        setSupGst('');
                        setShowSupplierPopup(false);
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
                    placeholder={isMr ? "उदा. मुंबई" : "e.g. Mumbai"}
                    value={supAddress} 
                    onChange={e => setSupAddress(e.target.value)}
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
                    value={supGst} 
                    onChange={e => setSupGst(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl text-xs font-semibold font-mono uppercase outline-none transition text-slate-800"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full p-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition-colors shadow-md shadow-indigo-600/20 text-xs uppercase tracking-wider"
                >
                  {isMr ? "नवीन विक्रेता नोंदवा आणि वापरा" : "Register and Select Supplier"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
