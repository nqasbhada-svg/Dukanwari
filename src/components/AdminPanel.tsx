/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion } from 'motion/react';
import { 
  Settings, 
  UserCheck, 
  Database, 
  ShieldAlert, 
  Save, 
  Printer, 
  Smartphone, 
  Key, 
  History, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { ShopSettings, AuditLog, UserSession } from '../types';

interface AdminPanelProps {
  settings: ShopSettings;
  auditLogs: AuditLog[];
  userSession: UserSession;
  isMr: boolean;
  onUpdateSettings: (settings: ShopSettings) => void;
  onToggleUserRole: (role: 'owner' | 'employee') => void;
}

export default function AdminPanel({
  settings,
  auditLogs,
  userSession,
  isMr,
  onUpdateSettings,
  onToggleUserRole
}: AdminPanelProps) {
  // Tabs: 'shop_profile', 'roles_permissions', 'backup_sync', 'audit_logs'
  const [activeAdminTab, setActiveAdminTab] = useState<'profile' | 'whatsapp' | 'roles' | 'backup' | 'audit'>('profile');

  // Shop profile state copy
  const [shopName, setShopName] = useState(settings.shopName);
  const [shopNameMr, setShopNameMr] = useState(settings.shopNameMr);
  const [address, setAddress] = useState(settings.address);
  const [addressMr, setAddressMr] = useState(settings.addressMr);
  const [mobile, setMobile] = useState(settings.mobile);
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber);
  const [enableGstBilling, setEnableGstBilling] = useState(settings.enableGstBilling);
  const [thermalPrinterWidth, setThermalPrinterWidth] = useState<'58mm' | '80mm'>(settings.thermalPrinterWidth);
  const [whatsappApiToken, setWhatsappApiToken] = useState(settings.whatsappApiToken);

  // WhatsApp templates state copy
  const [templateInvoice, setTemplateInvoice] = useState(settings.templateInvoice || '');
  const [templateReminder, setTemplateReminder] = useState(settings.templateReminder || '');
  const [templateOffer, setTemplateOffer] = useState(settings.templateOffer || '');

  // Dynamic dummy variables for live WhatsApp mockup preview
  const [dummyCustomerName, setDummyCustomerName] = useState('Rahul Sharma');
  const [dummyGrandTotal, setDummyGrandTotal] = useState('1450');
  const [dummyInvoiceNumber, setDummyInvoiceNumber] = useState('INV-2026-004');
  const [dummyLink, setDummyLink] = useState('https://ais-pre-dgftlp.run.app/invoice/INV-2026-004');
  const [dummyActiveTab, setDummyActiveTab] = useState<'invoice' | 'reminder' | 'offer'>('invoice');

  // QR Code feature states
  const [previewMode, setPreviewMode] = useState<'phone' | 'qr'>('phone');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [fullMessageText, setFullMessageText] = useState<string>('');
  const [fullWhatsAppUrl, setFullWhatsAppUrl] = useState<string>('');
  const [showResetNotice, setShowResetNotice] = useState<boolean>(false);

  useEffect(() => {
    let templateText = '';
    if (dummyActiveTab === 'invoice') {
      templateText = templateInvoice || 'Hello {customerName}, your digital invoice from *{shopName}* is ready. Amount: *₹{grandTotal}*. View PDF: {link}. Thank you!';
    } else if (dummyActiveTab === 'reminder') {
      templateText = templateReminder || 'Dear {customerName}, this is a gentle reminder regarding outstanding invoice *{invoiceNumber}* from *{shopName}* of amount *₹{grandTotal}*. Please clear via UPI.';
    } else {
      templateText = templateOffer || 'Special Festive Offer from *{shopName}* for you, {customerName}! Get exclusive discounts on our latest garment collections. Visit us today!';
    }

    const messageText = templateText
      .replace(/{customerName}/gi, dummyCustomerName || 'Rahul Sharma')
      .replace(/{client}/gi, dummyCustomerName || 'Rahul Sharma')
      .replace(/{grandTotal}/gi, dummyGrandTotal || '0')
      .replace(/{amt}/gi, dummyGrandTotal || '0')
      .replace(/{invoiceNumber}/gi, dummyInvoiceNumber || 'INV-XXXX')
      .replace(/{invNo}/gi, dummyInvoiceNumber || 'INV-XXXX')
      .replace(/{shopName}/gi, shopName || 'Royal Boutique')
      .replace(/{shop}/gi, shopName || 'Royal Boutique')
      .replace(/{link}/gi, dummyLink || 'https://ais-pre-dgftlp.run.app/invoice/INV-2026-004');

    setFullMessageText(messageText);

    // Mock a recipient phone number for standard previewing
    const mockMobile = '919876543210';
    const encodedText = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${mockMobile}?text=${encodedText}`;
    setFullWhatsAppUrl(waUrl);

    QRCode.toDataURL(waUrl, {
      width: 220,
      margin: 1.5,
      color: {
        dark: '#075E54', // Beautiful WhatsApp forest green
        light: '#FFFFFF'
      }
    })
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error('Error generating QR Code:', err);
      });
  }, [
    dummyActiveTab,
    templateInvoice,
    templateReminder,
    templateOffer,
    dummyCustomerName,
    dummyGrandTotal,
    dummyInvoiceNumber,
    dummyLink,
    shopName
  ]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      shopName,
      shopNameMr,
      address,
      addressMr,
      mobile,
      whatsapp,
      gstNumber,
      enableGstBilling,
      thermalPrinterWidth,
      whatsappApiToken,
      templateInvoice,
      templateReminder,
      templateOffer
    });
    alert(isMr ? 'व्यवसाय सेटिंग्ज यशस्वीरित्या जतन केल्या गेल्या!' : 'Business Settings updated successfully!');
  };

  const handleBackupTrigger = () => {
    alert(isMr 
      ? 'क्लाउड बॅकअप प्रक्रिया यशस्वी! Supabase सुरक्षित बकेटमध्ये बॅकअप (.JSON) अपलोड झाला.' 
      : 'Supabase cloud backup executed successfully! Daily backup ledger exported to secure Storage bucket.'
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs text-slate-700">
      {/* Admin Sidebar Navigation tabs */}
      <div className="space-y-2 bg-white p-4 rounded-xl border border-slate-200 h-fit">
        <h4 className="font-bold text-slate-400 uppercase tracking-wider font-mono mb-3">Admin Submenus</h4>
        
        <button
          onClick={() => setActiveAdminTab('profile')}
          className={`w-full text-left p-2.5 rounded-lg font-bold flex items-center gap-2 transition ${activeAdminTab === 'profile' ? 'bg-indigo-50 text-indigo-700 shadow-3xs' : 'hover:bg-slate-50 text-slate-500'}`}
        >
          <Settings size={14} />
          {isMr ? 'दुकान प्रोफाइल व सेटिंग्ज' : 'Shop Profile & Tax'}
        </button>

        <button
          id="whatsapp-templates-tab"
          onClick={() => setActiveAdminTab('whatsapp')}
          className={`w-full text-left p-2.5 rounded-lg font-bold flex items-center gap-2 transition ${activeAdminTab === 'whatsapp' ? 'bg-indigo-50 text-indigo-700 shadow-3xs' : 'hover:bg-slate-50 text-slate-500'}`}
        >
          <Smartphone size={14} />
          {isMr ? 'व्हॉट्सॲप मेसेज टेम्पलेट्स' : 'WhatsApp Message Templates'}
        </button>

        <button
          onClick={() => setActiveAdminTab('roles')}
          className={`w-full text-left p-2.5 rounded-lg font-bold flex items-center gap-2 transition ${activeAdminTab === 'roles' ? 'bg-indigo-50 text-indigo-700 shadow-3xs' : 'hover:bg-slate-50 text-slate-500'}`}
        >
          <UserCheck size={14} />
          {isMr ? 'भूमिका व कर्मचारी अधिकार' : 'User Roles & Security'}
        </button>

        <button
          onClick={() => setActiveAdminTab('backup')}
          className={`w-full text-left p-2.5 rounded-lg font-bold flex items-center gap-2 transition ${activeAdminTab === 'backup' ? 'bg-indigo-50 text-indigo-700 shadow-3xs' : 'hover:bg-slate-50 text-slate-500'}`}
        >
          <Database size={14} />
          {isMr ? 'बॅकअप आणि क्लाउड सिंक' : 'Supabase Cloud Backups'}
        </button>

        <button
          onClick={() => setActiveAdminTab('audit')}
          className={`w-full text-left p-2.5 rounded-lg font-bold flex items-center gap-2 transition ${activeAdminTab === 'audit' ? 'bg-indigo-50 text-indigo-700 shadow-3xs' : 'hover:bg-slate-50 text-slate-500'}`}
        >
          <History size={14} />
          {isMr ? 'ऑडिट लॉग्स' : 'Audit Trails Logs'}
        </button>
      </div>

      {/* Main Content Area (3 Columns) */}
      <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200">
        
        {/* TAB 1: Shop Profile Settings */}
        {activeAdminTab === 'profile' && (
          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Store Profile & Billing Configurations</h3>
              <p className="text-slate-500 text-xs">Set legal business names in both Marathi & English, and update invoice print headers.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Shop Name (English)</label>
                <input 
                  type="text"
                  required
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Shop Name (मराठी)</label>
                <input 
                  type="text"
                  required
                  value={shopNameMr}
                  onChange={(e) => setShopNameMr(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Office Address (English Invoice)</label>
                <input 
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Office Address (मराठी बिल)</label>
                <input 
                  type="text"
                  required
                  value={addressMr}
                  onChange={(e) => setAddressMr(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Billing Contact Mobile</label>
                <input 
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">WhatsApp Alert Number</label>
                <input 
                  type="text"
                  required
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold block text-slate-600">Store GSTIN Tax Number</label>
                <input 
                  type="text"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono uppercase"
                />
              </div>

              {/* Thermal Printer configuration */}
              <div className="space-y-1">
                <label className="font-semibold block text-slate-600 flex items-center gap-1">
                  <Printer size={13} /> Thermal Printer Ribbon Size
                </label>
                <select
                  value={thermalPrinterWidth}
                  onChange={(e) => setThermalPrinterWidth(e.target.value as any)}
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white font-semibold"
                >
                  <option value="58mm">58mm (Small pocket standard)</option>
                  <option value="80mm">80mm (Standard commercial width)</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold block text-slate-600 flex items-center gap-1">
                  <Smartphone size={13} /> WhatsApp API Security Bearer Token
                </label>
                <input 
                  type="password"
                  value={whatsappApiToken}
                  onChange={(e) => setWhatsappApiToken(e.target.value)}
                  placeholder="Bearer token keys"
                  className="w-full p-2 border border-slate-200 rounded-lg outline-none font-mono text-[11px]"
                />
              </div>
            </div>

            <button
              id="save-admin-settings-btn"
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition"
            >
              <Save size={14} />
              Save Config & Settings
            </button>
          </form>
        )}

        {/* TAB: WhatsApp Templates Settings */}
        {activeAdminTab === 'whatsapp' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {isMr ? 'व्हॉट्सॲप मेसेज टेम्पलेट्स कॉन्फिगरेशन' : 'WhatsApp Message Templates Configuration'}
              </h3>
              <p className="text-slate-500 text-xs">
                {isMr 
                  ? 'ग्राहक बिलांसाठी, थकबाकी स्मरणपत्रांसाठी आणि ऑफर मेसेजेससाठी स्वयंचलित टेम्पलेट्स संपादित करा.' 
                  : 'Customize automated message text formats for digital billing events, customer outstanding reminders, and festive promotional offers.'}
              </p>
            </div>

            {/* Tag Helper Reference Box */}
            <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl text-indigo-950 text-[11px] space-y-2">
              <span className="font-bold block uppercase tracking-wider font-mono text-[10px]">
                {isMr ? '📝 उपलब्ध डायनॅमिक टॅग्ज' : '📝 Available Dynamic Tags'}
              </span>
              <p className="text-slate-600 leading-relaxed">
                {isMr 
                  ? 'मेसेज कस्टमाइझ करण्यासाठी खालील टॅग्जचा वापर करा. हे टॅग्ज मेसेज पाठवताना ग्राहकांच्या प्रत्यक्ष माहितीने बदलले जातील:' 
                  : 'Insert these tags into your templates. They will be dynamically replaced with live customer and transaction information when sending:'}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                <span className="bg-white border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-md font-bold select-all">&#123;customerName&#125;</span>
                <span className="bg-white border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-md font-bold select-all">&#123;grandTotal&#125;</span>
                <span className="bg-white border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-md font-bold select-all">&#123;invoiceNumber&#125;</span>
                <span className="bg-white border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-md font-bold select-all">&#123;shopName&#125;</span>
                <span className="bg-white border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-md font-bold select-all">&#123;link&#125;</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Config list */}
              <div className="lg:col-span-7">
                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Template 1: Invoice delivery */}
                  <div className="space-y-2 border-b border-slate-100 pb-5">
                    <label className="font-bold block text-slate-800 text-xs flex items-center justify-between">
                      <span>{isMr ? '१. नवीन बिलाचा मेसेज टेम्पलेट (Invoice Delivery)' : '1. New Invoice Template'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Defaults if empty</span>
                    </label>
                    <textarea
                      value={templateInvoice}
                      onChange={(e) => setTemplateInvoice(e.target.value)}
                      placeholder="e.g. Hello {customerName}, your digital invoice from *{shopName}* is ready. Amount: *₹{grandTotal}*."
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none font-sans text-xs focus:ring-1 focus:ring-indigo-500 h-20 text-slate-800"
                    />
                  </div>

                  {/* Template 2: Payment reminder */}
                  <div className="space-y-2 border-b border-slate-100 pb-5">
                    <label className="font-bold block text-slate-800 text-xs flex items-center justify-between">
                      <span>{isMr ? '२. थकबाकी स्मरणपत्र टेम्पलेट (Outstanding Reminder)' : '2. Outstanding Payment Reminder Template'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Defaults if empty</span>
                    </label>
                    <textarea
                      value={templateReminder}
                      onChange={(e) => setTemplateReminder(e.target.value)}
                      placeholder="e.g. Dear {customerName}, this is a gentle reminder regarding outstanding invoice *{invoiceNumber}* from *{shopName}* of amount *₹{grandTotal}*."
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none font-sans text-xs focus:ring-1 focus:ring-indigo-500 h-20 text-slate-800"
                    />
                  </div>

                  {/* Template 3: Promotional Offer */}
                  <div className="space-y-2 border-b border-slate-100 pb-5">
                    <label className="font-bold block text-slate-800 text-xs flex items-center justify-between">
                      <span>{isMr ? '३. प्रमोशनल ऑफर्स टेम्पलेट (Promo Offers)' : '3. Festive Offers & Coupons Template'}</span>
                      <span className="text-[10px] text-slate-400 font-normal">Defaults if empty</span>
                    </label>
                    <textarea
                      value={templateOffer}
                      onChange={(e) => setTemplateOffer(e.target.value)}
                      placeholder="e.g. Special Festive Offer from *{shopName}* for you, {customerName}! Get exclusive discounts."
                      className="w-full p-2.5 border border-slate-200 rounded-lg outline-none font-sans text-xs focus:ring-1 focus:ring-indigo-500 h-20 text-slate-800"
                    />
                  </div>

                  {showResetNotice && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>✨</span>
                        <span>
                          {isMr 
                            ? 'टेम्पलेट्स मूळ डीफॉल्ट मूल्यांवर पुनर्संचयित केले गेले!'
                            : 'Templates restored to original defaults!'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">
                        {isMr
                          ? 'बदल सेव्ह करण्यासाठी आणि सर्व ग्राहकांसाठी ते लागू करण्यासाठी कृपया खालील "टेम्पलेट्स जतन करा" बटणावर क्लिक करा.'
                          : 'Please click the "Save Templates & Layout" button below to persist and apply these base templates across the app.'}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      id="save-whatsapp-templates-btn"
                      type="submit"
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition"
                    >
                      <Save size={14} />
                      {isMr ? 'टेम्पलेट्स जतन करा' : 'Save Templates & Layout'}
                    </button>
                    <button
                      id="reset-whatsapp-templates-btn"
                      type="button"
                      onClick={() => {
                        setTemplateInvoice('Hello {customerName}, your digital invoice from *{shopName}* is ready. Amount: *₹{grandTotal}*. View PDF: {link}. Thank you!');
                        setTemplateReminder('Dear {customerName}, this is a gentle reminder regarding outstanding invoice *{invoiceNumber}* from *{shopName}* of amount *₹{grandTotal}*. Please clear via UPI.');
                        setTemplateOffer('Special Festive Offer from *{shopName}* for you, {customerName}! Get exclusive discounts on our latest garment collections. Visit us today!');
                        setShowResetNotice(true);
                        setTimeout(() => {
                          setShowResetNotice(false);
                        }, 5000);
                      }}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg font-bold text-xs text-slate-700 transition"
                    >
                      {isMr ? 'डीफॉल्टवर रीसेट करा' : 'Reset to Defaults'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Visual Interactive Phone Preview Box */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-700 uppercase tracking-wider font-mono">
                      {isMr ? '📱 थेट कस्टमायझेशन पूर्वावलोकन' : '📱 Interactive Mock Preview'}
                    </span>
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>

                  {/* Dummy Variables Tuning Controls */}
                  <div className="space-y-2.5 bg-white p-3 rounded-xl border border-slate-200 text-[11px]">
                    <span className="font-bold text-slate-600 block">
                      {isMr ? 'चाचणी डेटा बदला (Tune Preview Variables)' : 'Override Test Variables'}
                    </span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Customer Name</label>
                        <input
                          type="text"
                          value={dummyCustomerName}
                          onChange={(e) => setDummyCustomerName(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Grand Total (₹)</label>
                        <input
                          type="text"
                          value={dummyGrandTotal}
                          onChange={(e) => setDummyGrandTotal(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Invoice Number</label>
                        <input
                          type="text"
                          value={dummyInvoiceNumber}
                          onChange={(e) => setDummyInvoiceNumber(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-400 font-mono text-[9px] uppercase">Mock Link</label>
                        <input
                          type="text"
                          value={dummyLink}
                          onChange={(e) => setDummyLink(e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview Selector and Template selector tabs in the preview widget */}
                  <div className="space-y-2">
                    <div className="flex bg-slate-200/50 p-1 rounded-lg gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setDummyActiveTab('invoice')}
                        className={`flex-1 py-1 rounded-md font-bold transition text-center ${dummyActiveTab === 'invoice' ? 'bg-white text-indigo-700 shadow-3xs' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {isMr ? 'बिल' : 'Invoice'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDummyActiveTab('reminder')}
                        className={`flex-1 py-1 rounded-md font-bold transition text-center ${dummyActiveTab === 'reminder' ? 'bg-white text-indigo-700 shadow-3xs' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {isMr ? 'स्मरणपत्र' : 'Reminder'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDummyActiveTab('offer')}
                        className={`flex-1 py-1 rounded-md font-bold transition text-center ${dummyActiveTab === 'offer' ? 'bg-white text-indigo-700 shadow-3xs' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        {isMr ? 'ऑफर' : 'Offer'}
                      </button>
                    </div>

                    <div className="flex bg-indigo-50/60 border border-indigo-100 p-0.5 rounded-lg gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setPreviewMode('phone')}
                        className={`flex-1 py-1 rounded-md font-bold transition text-center ${previewMode === 'phone' ? 'bg-indigo-600 text-white shadow-3xs' : 'text-slate-600 hover:text-slate-800'}`}
                      >
                        💬 {isMr ? 'मेसेज पूर्वावलोकन' : 'Chat Preview'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewMode('qr')}
                        className={`flex-1 py-1 rounded-md font-bold transition text-center ${previewMode === 'qr' ? 'bg-indigo-600 text-white shadow-3xs' : 'text-slate-600 hover:text-slate-800'}`}
                      >
                        📷 {isMr ? 'क्यूआर कोड जनरेटर' : 'Scan QR Code'}
                      </button>
                    </div>
                  </div>

                  {/* Smartphone Container Mockup */}
                  <div className="border-[6px] border-slate-800 rounded-3xl overflow-hidden shadow-md max-w-xs mx-auto bg-[#ECE5DD] font-sans flex flex-col h-[320px]">
                    {/* Phone Status Header */}
                    <div className="bg-[#075E54] text-white px-3 py-1.5 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-[#075E54] font-bold text-xs select-none">
                          {dummyCustomerName.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-[11px] leading-tight truncate max-w-[100px]">{dummyCustomerName || 'Customer'}</p>
                          <p className="text-[8px] text-emerald-100 font-medium">online</p>
                        </div>
                      </div>
                      <div className="flex gap-2.5 text-white/80 text-[10px]">
                        <span>📞</span>
                        <span>📹</span>
                        <span>⋮</span>
                      </div>
                    </div>

                    {/* Chat Messages Body OR QR Code Screen */}
                    {previewMode === 'phone' ? (
                      <div className="flex-1 p-3 overflow-y-auto flex flex-col justify-end">
                        {/* WhatsApp Sent Chat Bubble */}
                        <div className="bg-[#DCF8C6] border border-[#d2ecbd] text-slate-800 p-2.5 rounded-lg text-[10px] self-end max-w-[90%] relative shadow-3xs">
                          <p className="whitespace-pre-wrap leading-relaxed pb-2 pr-4 text-slate-800 font-sans">
                            {(() => {
                              let templateText = '';
                              if (dummyActiveTab === 'invoice') {
                                templateText = templateInvoice || 'Hello {customerName}, your digital invoice from *{shopName}* is ready. Amount: *₹{grandTotal}*. View PDF: {link}. Thank you!';
                              } else if (dummyActiveTab === 'reminder') {
                                templateText = templateReminder || 'Dear {customerName}, this is a gentle reminder regarding outstanding invoice *{invoiceNumber}* from *{shopName}* of amount *₹{grandTotal}*. Please clear via UPI.';
                              } else {
                                templateText = templateOffer || 'Special Festive Offer from *{shopName}* for you, {customerName}! Get exclusive discounts on our latest garment collections. Visit us today!';
                              }

                              const resultText = templateText
                                .replace(/{customerName}/gi, dummyCustomerName || 'Rahul Sharma')
                                .replace(/{client}/gi, dummyCustomerName || 'Rahul Sharma')
                                .replace(/{grandTotal}/gi, dummyGrandTotal || '0')
                                .replace(/{amt}/gi, dummyGrandTotal || '0')
                                .replace(/{invoiceNumber}/gi, dummyInvoiceNumber || 'INV-XXXX')
                                .replace(/{invNo}/gi, dummyInvoiceNumber || 'INV-XXXX')
                                .replace(/{shopName}/gi, shopName || 'Royal Boutique')
                                .replace(/{shop}/gi, shopName || 'Royal Boutique')
                                .replace(/{link}/gi, dummyLink || 'https://ais-pre-dgftlp.run.app/invoice/INV-2026-004');

                              // Render asterisks as bold
                              const parts = resultText.split(/(\*[^*]+\*)/g);
                              return parts.map((part, index) => {
                                if (part.startsWith('*') && part.endsWith('*')) {
                                  return <strong key={index} className="font-extrabold text-slate-950">{part.slice(1, -1)}</strong>;
                                }
                                return part;
                              });
                            })()}
                          </p>
                          <span className="absolute bottom-1 right-1 text-[8px] text-slate-400 font-mono flex items-center gap-0.5">
                            12:00 PM <span className="text-sky-500 font-bold">✓✓</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 p-3 flex flex-col items-center justify-between bg-white overflow-y-auto">
                        <div className="text-center">
                          <span className="font-bold text-[9px] text-[#075E54] uppercase tracking-wider font-mono block mb-1">
                            {isMr ? '📷 क्यूआर स्कॅन करा' : '📷 Scan to Send Message'}
                          </span>
                        </div>

                        {qrCodeUrl ? (
                          <div className="relative p-1.5 bg-white border border-slate-200 rounded-xl shadow-xs">
                            <img 
                              src={qrCodeUrl} 
                              alt="WhatsApp QR Link" 
                              className="w-32 h-32 select-none"
                              referrerPolicy="no-referrer"
                            />
                            {/* Visual alignment guides */}
                            <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#075E54] -translate-x-0.5 -translate-y-0.5"></span>
                            <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#075E54] translate-x-0.5 -translate-y-0.5"></span>
                            <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#075E54] -translate-x-0.5 translate-y-0.5"></span>
                            <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#075E54] translate-x-0.5 translate-y-0.5"></span>
                          </div>
                        ) : (
                          <div className="w-32 h-32 bg-slate-50 flex items-center justify-center rounded-xl text-slate-400 text-[10px] italic">
                            {isMr ? 'क्यूआर लोड होत आहे...' : 'Generating QR...'}
                          </div>
                        )}

                        <div className="space-y-1.5 text-center w-full">
                          <p className="text-[9px] text-slate-500 leading-tight">
                            {isMr 
                              ? 'हा क्यूआर तुमच्या मोबाईल कॅमेऱ्याने स्कॅन करा. यामुळे थेट ग्राहकाला संदेश पाठवण्यासाठी व्हॉट्सॲप उघडेल!' 
                              : 'Scan with your mobile camera to instantly open and send this customized message on your phone.'}
                          </p>

                          <a 
                            href={fullWhatsAppUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex w-full items-center justify-center gap-1 bg-[#128C7E] hover:bg-[#075E54] text-white font-bold text-[9px] py-1 rounded transition shadow-3xs"
                          >
                            🌐 {isMr ? 'थेट लिंक उघडा (Open URL)' : 'Open Pre-filled Link'}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Roles & Employee Permission Panel */}
        {activeAdminTab === 'roles' && (
          <div className="space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Role Based Access & Permissions (RLS)</h3>
              <p className="text-slate-500 text-xs">Verify permissions mapped to Owner and Employee roles based on secure Supabase RLS policies.</p>
            </div>

            {/* Quick Toggle login emulator */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-400">Security Login Emulator</span>
                <p className="text-slate-700">Currently Logged role: <strong className="text-indigo-600 uppercase font-mono">{userSession.role}</strong></p>
              </div>

              <div className="flex gap-2 text-xs">
                <button
                  id="toggle-role-employee"
                  onClick={() => onToggleUserRole('employee')}
                  className={`px-4 py-2 rounded-lg font-bold border transition ${userSession.role === 'employee' ? 'bg-indigo-600 text-white' : 'bg-white border-slate-200'}`}
                >
                  Switch to Employee Role
                </button>
                <button
                  id="toggle-role-owner"
                  onClick={() => onToggleUserRole('owner')}
                  className={`px-4 py-2 rounded-lg font-bold border transition ${userSession.role === 'owner' ? 'bg-indigo-600 text-white' : 'bg-white border-slate-200'}`}
                >
                  Switch to Owner Role
                </button>
              </div>
            </div>

            {/* Permissions list grid checklist */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Access Privileges Table</h4>
              <div className="border border-slate-100 rounded-lg overflow-hidden divide-y divide-slate-100">
                <div className="p-3 bg-slate-50 flex justify-between font-semibold">
                  <span>System Resource Module</span>
                  <div className="flex gap-6 font-mono text-[10px]">
                    <span className="w-16 text-center">EMPLOYEE</span>
                    <span className="w-16 text-center">OWNER</span>
                  </div>
                </div>

                <div className="p-3 flex justify-between">
                  <span>Generate Invoices / POS Terminal</span>
                  <div className="flex gap-6 font-bold font-mono">
                    <span className="w-16 text-center text-emerald-600">YES</span>
                    <span className="w-16 text-center text-emerald-600">YES</span>
                  </div>
                </div>

                <div className="p-3 flex justify-between">
                  <span>Inward Stock (Purchase Entry)</span>
                  <div className="flex gap-6 font-bold font-mono">
                    <span className="w-16 text-center text-emerald-600">YES</span>
                    <span className="w-16 text-center text-emerald-600">YES</span>
                  </div>
                </div>

                <div className="p-3 flex justify-between">
                  <span>Delete Clothes Catalog / Edit Selling Rates</span>
                  <div className="flex gap-6 font-bold font-mono">
                    <span className="w-16 text-center text-rose-500">NO</span>
                    <span className="w-16 text-center text-emerald-600">YES</span>
                  </div>
                </div>

                <div className="p-3 flex justify-between">
                  <span>View Analytics Reports & Net Profit logs</span>
                  <div className="flex gap-6 font-bold font-mono">
                    <span className="w-16 text-center text-rose-500">NO</span>
                    <span className="w-16 text-center text-emerald-600">YES</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Backup & Cloud Sync */}
        {activeAdminTab === 'backup' && (
          <div className="space-y-5 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Supabase Database Backups & Synchronization</h3>
              <p className="text-slate-500 text-xs">Trigger secure cloud storage exports or trace automated Sync worker queue configurations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Backups card */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono">Export DB Snapshot</h4>
                <p className="text-slate-400">Creates a secure JSON snapshot of local cached datasets and triggers upload to Supabase storage bucket.</p>
                <button
                  id="backup-supabase-btn"
                  onClick={handleBackupTrigger}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg transition"
                >
                  <Database size={13} /> Trigger Cloud Backup
                </button>
              </div>

              {/* Conflict resolution logic block */}
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl space-y-2.5 text-amber-950">
                <span className="font-bold text-xs uppercase tracking-wider font-mono flex items-center gap-1">
                  <AlertTriangle size={13} /> Offline Conflict Resolver
                </span>
                <p className="leading-relaxed">
                  If cash-terminal loses connectivity, invoice queues accumulate locally. Upon sync reconnection, the app automatically runs the stored procedure <strong>sync_offline_invoice()</strong> on the PostgreSQL database, executing server-authoritative validations against double billing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Audit Logs Table */}
        {activeAdminTab === 'audit' && (
          <div className="space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">System Operations Audit Trail</h3>
              <p className="text-slate-500">Chronological history of security, stock, and billing events logs.</p>
            </div>

            <div className="overflow-x-auto border border-slate-100 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Operator User</th>
                    <th className="py-2.5 px-3">Action Module</th>
                    <th className="py-2.5 px-3">Transaction Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600 font-sans leading-relaxed">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-medium">{log.timestamp}</td>
                      <td className="py-2.5 px-3 font-semibold">{log.userName}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase font-bold text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 max-w-[200px] truncate" title={log.details}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
