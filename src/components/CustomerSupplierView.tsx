/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Truck, 
  Plus, 
  Search, 
  IndianRupee, 
  CheckCircle, 
  Calendar, 
  Clipboard, 
  ArrowRight,
  Info,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { Customer, Supplier, LedgerEntry, AppTranslations, ShopSettings } from '../types';
import { openWhatsAppBillingShare } from '../utils/whatsapp';

interface CustomerSupplierViewProps {
  customers: Customer[];
  suppliers: Supplier[];
  t: AppTranslations;
  isMr: boolean;
  settings: ShopSettings;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'outstanding' | 'ledger'>) => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'outstanding' | 'ledger'>) => void;
  onReceiveCollection: (customerId: string, amount: number, mode: 'Cash' | 'UPI' | 'Card', ref: string) => void;
  onPaySupplier: (supplierId: string, amount: number, ref: string) => void;
}

export default function CustomerSupplierView({
  customers,
  suppliers,
  t,
  isMr,
  settings,
  onAddCustomer,
  onAddSupplier,
  onReceiveCollection,
  onPaySupplier
}: CustomerSupplierViewProps) {
  // Tabs: 'customers', 'suppliers'
  const [activeTab, setActiveTab] = useState<'customers' | 'suppliers'>('customers');

  // Search states
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [gst, setGst] = useState('');
  const [creditLimit, setCreditLimit] = useState(10000);
  const [email, setEmail] = useState(''); // supplier only

  // Detail/Ledger view panel
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(customers[0] || null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(suppliers[0] || null);

  // Receive Collection / Pay Supplier popover states
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txAmount, setTxAmount] = useState(0);
  const [txPaymode, setTxPaymode] = useState<'Cash' | 'UPI' | 'Card'>('UPI');
  const [txRef, setTxRef] = useState('');

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mobile.includes(searchQuery)
  );

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.nameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.mobile.includes(searchQuery)
  );

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return;

    if (activeTab === 'customers') {
      onAddCustomer({
        name: name,
        nameMr: name,
        mobile: mobile,
        whatsapp: mobile,
        address: address,
        gstNumber: gst,
        creditLimit: Number(creditLimit)
      });
      alert(isMr ? 'नवीन ग्राहक यशस्वीरित्या जोडला गेला!' : 'New Customer added successfully!');
    } else {
      onAddSupplier({
        name: name,
        nameMr: name,
        mobile: mobile,
        address: address,
        gstNumber: gst,
        email: email
      });
      alert(isMr ? 'नवीन विक्रेता यशस्वीरित्या जोडला गेला!' : 'New Supplier Vendor added successfully!');
    }

    // Reset Fields
    setName('');
    setMobile('');
    setAddress('');
    setGst('');
    setCreditLimit(10000);
    setEmail('');
    setIsModalOpen(false);
  };

  const handlePostTx = (e: React.FormEvent) => {
    e.preventDefault();
    if (txAmount <= 0) return;

    if (activeTab === 'customers' && selectedCustomer) {
      onReceiveCollection(selectedCustomer.id, txAmount, txPaymode, txRef);
      // Auto reload ledger inside state view
      const updatedCust = customers.find(c => c.id === selectedCustomer.id);
      if(updatedCust) setSelectedCustomer(updatedCust);
      alert(isMr ? 'वसुली जमा केली व खातेवही अपडेट झाली!' : 'Collection recorded and customer ledger updated!');
    } else if (activeTab === 'suppliers' && selectedSupplier) {
      onPaySupplier(selectedSupplier.id, txAmount, txRef);
      const updatedSup = suppliers.find(s => s.id === selectedSupplier.id);
      if(updatedSup) setSelectedSupplier(updatedSup);
      alert(isMr ? 'पेमेंट नोंदवले गेले व खातेवही अपडेट झाली!' : 'Payment recorded and supplier ledger updated!');
    }

    setTxAmount(0);
    setTxRef('');
    setIsTxModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl shrink-0">
          <button
            id="tab-customers-view"
            onClick={() => {
              setActiveTab('customers');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${activeTab === 'customers' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Users size={14} className="text-indigo-600" />
            {isMr ? 'ग्राहक डेटाबेस' : 'Customers Directory'}
          </button>
          <button
            id="tab-suppliers-view"
            onClick={() => {
              setActiveTab('suppliers');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition ${activeTab === 'suppliers' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Truck size={14} className="text-amber-600" />
            {isMr ? 'विक्रेता होलसेलर्स' : 'Suppliers & Wholesalers'}
          </button>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={14} />
            <input 
              type="text"
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <button
            id="add-crm-btn"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition shrink-0 shadow-lg shadow-indigo-600/15"
          >
            <Plus size={14} />
            {activeTab === 'customers' ? (isMr ? 'ग्राहक जोडा' : 'Add Client') : (isMr ? 'विक्रेता जोडा' : 'Add Vendor')}
          </button>
        </div>
      </div>

      {/* Main split dashboard: List on left, interactive ledger on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parties List (Left 1 column) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 font-mono">
            {activeTab === 'customers' ? 'Select Customer Account' : 'Select Supplier Vendor'}
          </h3>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {activeTab === 'customers' ? (
              filteredCustomers.map(c => (
                <div
                  key={c.id}
                  id={`select-cust-${c.id}`}
                  onClick={() => setSelectedCustomer(c)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex justify-between items-center ${selectedCustomer?.id === c.id ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                >
                  <div className="space-y-0.5 text-xs">
                    <span className="font-bold text-slate-800">{isMr ? c.nameMr : c.name}</span>
                    <span className="text-[10px] text-slate-400 block">{c.mobile}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold text-xs block ${c.outstanding > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₹{c.outstanding.toLocaleString()}
                    </span>
                    <span className="text-[8px] uppercase font-semibold text-slate-400 tracking-wider">O/S Balance</span>
                  </div>
                </div>
              ))
            ) : (
              filteredSuppliers.map(s => (
                <div
                  key={s.id}
                  id={`select-sup-${s.id}`}
                  onClick={() => setSelectedSupplier(s)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex justify-between items-center ${selectedSupplier?.id === s.id ? 'border-indigo-400 bg-indigo-50/20' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                >
                  <div className="space-y-0.5 text-xs">
                    <span className="font-bold text-slate-800">{isMr ? s.nameMr : s.name}</span>
                    <span className="text-[10px] text-slate-400 block">{s.mobile}</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold text-xs block ${s.outstanding > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      ₹{s.outstanding.toLocaleString()}
                    </span>
                    <span className="text-[8px] uppercase font-semibold text-slate-400 tracking-wider">Accounts Payable</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ledger & Statement (Right 2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 space-y-5">
          {activeTab === 'customers' && selectedCustomer ? (
            <div className="space-y-5">
              {/* Customer summary card panel */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 text-xs">
                  <h4 className="text-base font-bold text-slate-900">{isMr ? selectedCustomer.nameMr : selectedCustomer.name}</h4>
                  <p className="text-slate-500">📞 Contact: +91 {selectedCustomer.mobile} | WhatsApp: {selectedCustomer.whatsapp}</p>
                  {selectedCustomer.address && <p className="text-slate-400">📍 Address: {selectedCustomer.address}</p>}
                  {selectedCustomer.gstNumber && <p className="text-indigo-600 font-mono font-bold">GSTIN: {selectedCustomer.gstNumber}</p>}
                </div>

                <div className="flex gap-4">
                  <div className="text-right text-xs">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Current Outstanding</span>
                    <span className="font-bold font-mono text-lg text-rose-600">₹{selectedCustomer.outstanding.toLocaleString()}</span>
                  </div>
                  <button
                    id="collect-dues-btn"
                    onClick={() => setIsTxModalOpen(true)}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-lg shadow-emerald-600/15 shrink-0"
                  >
                    <IndianRupee size={14} />
                    Receive Payment
                  </button>
                </div>
              </div>

              {/* CRM parameters */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center">
                  <span className="text-slate-500">Credit Protection Limit:</span>
                  <span className="font-bold font-mono text-slate-800">₹{selectedCustomer.creditLimit.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center">
                  <span className="text-slate-500">Account Safety Status:</span>
                  <span className={`font-bold uppercase tracking-wider text-[10px] ${selectedCustomer.outstanding > selectedCustomer.creditLimit ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedCustomer.outstanding > selectedCustomer.creditLimit ? '⚠️ OVER LIMIT' : '✅ SECURE'}
                  </span>
                </div>
              </div>

              {/* WhatsApp Quick Templates Actions */}
              <div className="p-4 bg-indigo-50/40 border border-indigo-100/80 rounded-xl space-y-2.5 text-xs">
                <div className="flex items-center gap-1.5 text-indigo-950 font-bold">
                  <Smartphone size={14} className="text-indigo-600" />
                  <span>{isMr ? 'वन-क्लिक व्हॉट्सॲप कम्युनिकेशन' : 'One-Click WhatsApp Templates'}</span>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  {isMr 
                    ? 'अॅडमिन पॅनेलमध्ये कस्टमाइझ केलेल्या टेम्पलेटनुसार या ग्राहकाला त्वरित व्हॉट्सॲप मेसेज पाठवा.' 
                    : 'Instantly launch pre-filled templates customized in your Admin Panel for outstanding dues or promotions.'}
                </p>
                
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    id="send-whatsapp-offer-btn"
                    onClick={() => {
                      openWhatsAppBillingShare(
                        'offer',
                        null,
                        settings,
                        undefined,
                        {
                          name: selectedCustomer.name,
                          outstanding: selectedCustomer.outstanding,
                          mobile: selectedCustomer.whatsapp || selectedCustomer.mobile
                        }
                      );
                    }}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-xs"
                  >
                    <MessageSquare size={13} />
                    {isMr ? 'ऑफर मेसेज पाठवा' : 'Send Promo Offer'}
                  </button>

                  {selectedCustomer.outstanding > 0 && (
                    <button
                      id="send-whatsapp-reminder-btn"
                      onClick={() => {
                        openWhatsAppBillingShare(
                          'reminder',
                          null,
                          settings,
                          undefined,
                          {
                            name: selectedCustomer.name,
                            outstanding: selectedCustomer.outstanding,
                            mobile: selectedCustomer.whatsapp || selectedCustomer.mobile
                          }
                        );
                      }}
                      className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-xs"
                    >
                      <Smartphone size={13} />
                      {isMr ? 'पेमेंट स्मरणपत्र पाठवा' : 'Send Payment Reminder'}
                    </button>
                  )}
                </div>
              </div>

              {/* Ledger Table logs */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Ledger Statements & Invoices Logs</h4>
                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono uppercase">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Reference Ref</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 text-right">Debit (+)</th>
                        <th className="py-2.5 px-3 text-right">Credit (-)</th>
                        <th className="py-2.5 px-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                      {selectedCustomer.ledger.map(entry => (
                        <tr key={entry.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 font-mono">{entry.date}</td>
                          <td className="py-3 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${entry.type === 'sale' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {entry.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-500">{entry.refId}</td>
                          <td className="py-3 px-3 text-slate-500 max-w-[150px] truncate" title={entry.description}>{entry.description}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-900 font-medium">{entry.debit > 0 ? `₹${entry.debit}` : '-'}</td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-600 font-bold">{entry.credit > 0 ? `-₹${entry.credit}` : '-'}</td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-indigo-950">₹{entry.balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'suppliers' && selectedSupplier ? (
            /* Vendor ledger */
            <div className="space-y-5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 text-xs">
                  <h4 className="text-base font-bold text-slate-900">{isMr ? selectedSupplier.nameMr : selectedSupplier.name}</h4>
                  <p className="text-slate-500">📞 Contact: +91 {selectedSupplier.mobile} {selectedSupplier.email && `| Email: ${selectedSupplier.email}`}</p>
                  {selectedSupplier.address && <p className="text-slate-400">📍 Address: {selectedSupplier.address}</p>}
                  {selectedSupplier.gstNumber && <p className="text-amber-600 font-mono font-bold">GSTIN: {selectedSupplier.gstNumber}</p>}
                </div>

                <div className="flex gap-4">
                  <div className="text-right text-xs">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">Outstanding Payable</span>
                    <span className="font-bold font-mono text-lg text-amber-600">₹{selectedSupplier.outstanding.toLocaleString()}</span>
                  </div>
                  <button
                    id="pay-vendor-btn"
                    onClick={() => setIsTxModalOpen(true)}
                    className="flex items-center gap-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-lg shadow-amber-600/15 shrink-0"
                  >
                    <IndianRupee size={14} />
                    Pay Supplier Vendor
                  </button>
                </div>
              </div>

              {/* Supplier ledger table */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Wholesale Ledger Records</h4>
                <div className="overflow-x-auto border border-slate-100 rounded-lg">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono uppercase">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Type</th>
                        <th className="py-2.5 px-3">Bill Ref ID</th>
                        <th className="py-2.5 px-3">Purchase Description</th>
                        <th className="py-2.5 px-3 text-right">Debit Payable (-)</th>
                        <th className="py-2.5 px-3 text-right">Credit Cash Paid (+)</th>
                        <th className="py-2.5 px-3 text-right">Outstanding Bal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-sans">
                      {selectedSupplier.ledger.map(entry => (
                        <tr key={entry.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-3 font-mono">{entry.date}</td>
                          <td className="py-3 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${entry.type === 'purchase' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                              {entry.type}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-500">{entry.refId}</td>
                          <td className="py-3 px-3 text-slate-500 max-w-[150px] truncate" title={entry.description}>{entry.description}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-900 font-medium">{entry.credit > 0 ? `₹${entry.credit}` : '-'}</td>
                          <td className="py-3 px-3 text-right font-mono text-emerald-600 font-bold">{entry.debit > 0 ? `-₹${entry.debit}` : '-'}</td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-amber-950">₹{entry.balance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-24 text-slate-400 space-y-2">
              <Users size={32} className="mx-auto text-slate-300" />
              <p>No account selected. Click a client or vendor card on the left panel to display accounts ledger details.</p>
            </div>
          )}
        </div>
      </div>

      {/* CRM Addition Modal Sheet */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-md overflow-hidden text-xs text-slate-700"
          >
            <div className="p-5 border-b border-slate-100 font-bold text-slate-900 font-sans flex justify-between items-center">
              <span>{activeTab === 'customers' ? 'Add New Customer Profile' : 'Add New Wholesaler Vendor'}</span>
              <button id="close-crm-modal" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Company / Individual Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anand Sarees Pune"
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Mobile Phone Number</label>
                <input 
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="10-digit phone number"
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Office Address (Optional)</label>
                <input 
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Address details"
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">GST Registration Number (Optional)</label>
                <input 
                  type="text"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  placeholder="27AAAAA0000A1Z1"
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono uppercase bg-white text-slate-800"
                />
              </div>

              {activeTab === 'customers' ? (
                <div className="space-y-1">
                  <label className="font-semibold block text-indigo-950">Max Outstanding Credit Limit (₹)</label>
                  <input 
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono font-bold text-indigo-600 bg-white"
                  />
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-600">Vendor Email address (Optional)</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sales@vendor.com"
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white text-slate-800"
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button id="cancel-crm-form" type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
                <button id="save-crm-form" type="submit" className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500">Save Account</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Received Collection / Payment recording modal popup overlay */}
      {isTxModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-sm overflow-hidden text-xs text-slate-700"
          >
            <div className="p-5 border-b border-slate-100 font-bold text-slate-900 font-sans flex justify-between items-center">
              <span>{activeTab === 'customers' ? 'Receive Outstanding Payment' : 'Settle Wholesaler Bill'}</span>
              <button id="close-tx-modal" onClick={() => setIsTxModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">X</button>
            </div>

            <form onSubmit={handlePostTx} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg flex items-center gap-2">
                <Info size={14} className="text-slate-400 shrink-0" />
                <span className="text-slate-500 leading-normal">
                  Settle balances for: <strong className="text-slate-800">{activeTab === 'customers' ? selectedCustomer?.name : selectedSupplier?.name}</strong>
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Amount Paid / Received (₹)</label>
                <input 
                  type="number"
                  required
                  min="1"
                  value={txAmount || ''}
                  onChange={(e) => setTxAmount(Number(e.target.value))}
                  placeholder="₹ Cash / UPI settled"
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono font-bold text-base text-emerald-600 bg-white"
                />
              </div>

              {activeTab === 'customers' && (
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-600">Settlement Payment Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Cash', 'UPI', 'Card'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setTxPaymode(mode)}
                        className={`p-2 border rounded-lg font-semibold transition text-center ${txPaymode === mode ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 hover:bg-slate-50 text-slate-500'}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Transaction Ref / Cheque No.</label>
                <input 
                  type="text"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="e.g. UPI-TXN-99210088A"
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono uppercase bg-white text-slate-800"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button id="cancel-tx" type="button" onClick={() => setIsTxModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg">Cancel</button>
                <button id="save-tx" type="submit" className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500">Record Settlement</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
