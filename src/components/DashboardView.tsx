/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  IndianRupee, 
  AlertTriangle, 
  Package, 
  CheckCircle, 
  TrendingDown, 
  Layers,
  ArrowRight,
  FileSpreadsheet,
  Store,
  User,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Sparkles,
  Phone
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Product, Invoice, AppTranslations, ShopSettings, UserSession } from '../types';

interface DashboardProps {
  products: Product[];
  invoices: Invoice[];
  t: AppTranslations;
  isMr: boolean;
  onNavigate: (view: string) => void;
  shopSettings?: ShopSettings;
  session?: UserSession | null;
}

export default function DashboardView({ products, invoices, t, isMr, onNavigate, shopSettings, session }: DashboardProps) {
  // Calculators
  const todayStr = '2026-07-18'; // Simulated date context
  
  const todayInvoices = invoices.filter(inv => inv.date === todayStr);
  const todaySales = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const todayCollection = invoices.reduce((sum, inv) => {
    if (inv.date === todayStr) {
      return sum + inv.amountPaid;
    }
    return sum;
  }, 0);

  const pendingPayments = invoices.reduce((sum, inv) => sum + (inv.grandTotal - inv.amountPaid), 0);
  const totalStockVal = products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0);
  const totalStockQty = products.reduce((sum, p) => sum + p.currentStock, 0);
  const lowStockItems = products.filter(p => p.currentStock <= p.minStock);
  
  const todayProfit = todayInvoices.reduce((sum, inv) => {
    const cost = inv.items.reduce((cSum, item) => {
      const prod = products.find(p => p.id === item.productId);
      return cSum + ((prod?.purchasePrice || 0) * item.quantity);
    }, 0);
    return sum + (inv.grandTotal - cost - inv.discount);
  }, 0);

  const monthlyProfit = 42800; // Simulated stable profit indicator

  // Top Selling Products Simulation
  const topProducts = [
    { name: isMr ? 'प्रीमियम पांढरा शर्ट' : 'Premium Linen White Shirt', qty: 15, sales: 28485, tag: 'Raymond' },
    { name: isMr ? '५११ स्लिम फिट जीन्स' : '511 Slim Fit Blue Denim', qty: 12, sales: 29988, tag: "Levi's" },
    { name: isMr ? 'बनारसी सिल्क साडी' : 'Banarasi Silk Saree', qty: 8, sales: 47992, tag: 'Manyavar' },
  ];

  // Recharts Chart Data (Trend of last 6 days)
  const chartData = [
    { date: '13 Jul', Sales: 12400, Collection: 11000 },
    { date: '14 Jul', Sales: 18500, Collection: 17500 },
    { date: '15 Jul', Sales: 9500, Collection: 12000 },
    { date: '16 Jul', Sales: 22000, Collection: 19000 },
    { date: '17 Jul', Sales: 14500, Collection: 15000 },
    { date: '18 Jul', Sales: todaySales || 17898, Collection: todayCollection || 14500 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Title Banner */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-6 md:p-8 rounded-3xl border border-slate-800 text-white shadow-xl overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          
          {/* Section A: Shop Identity and Welcoming Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="hidden sm:flex bg-indigo-500/10 text-indigo-400 p-4.5 rounded-2xl ring-4 ring-indigo-500/5 items-center justify-center shrink-0 border border-indigo-500/25">
              <Store size={28} className="animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-indigo-400 font-extrabold uppercase bg-indigo-500/15 px-2.5 py-1 rounded-full border border-indigo-500/30 flex items-center gap-1.5">
                  <Sparkles size={11} className="text-amber-300" />
                  {isMr ? 'वस्त्रा ईआरपी लाइव्ह' : 'VASTRAA ERP LIVE'}
                </span>
                
                {/* GST Number verification pill */}
                {(shopSettings?.gstNumber || '27AAAAA1234A1Z0') && (
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/25 flex items-center gap-1">
                    <Shield size={10} className="fill-emerald-400/20" />
                    {isMr ? 'जीएसटी नोंदणीकृत' : 'GSTIN'}: {shopSettings?.gstNumber || '27AAAAA1234A1Z0'}
                  </span>
                )}
              </div>

              {/* Dynamic Shop Name */}
              <h1 className="text-2xl md:text-3xl font-sans font-black tracking-tight leading-none text-white">
                {isMr 
                  ? (shopSettings?.shopNameMr || 'वस्त्रा क्लोद एम्पोरियम') 
                  : (shopSettings?.shopName || 'Vastraa Cloth Emporium')}
              </h1>

              {/* Dynamic Shop Address */}
              <p className="text-slate-300 text-xs flex items-center gap-1.5 max-w-2xl leading-relaxed">
                <MapPin size={13} className="text-indigo-400 shrink-0" />
                <span>
                  {isMr 
                    ? (shopSettings?.addressMr || 'दुकान क्र. १२, स्वारगेट कमर्शियल प्लाझा, पुणे, महाराष्ट्र - ४११००२') 
                    : (shopSettings?.address || 'Shop No. 12, Swargate Commercial Plaza, Pune, MH - 411002')}
                </span>
              </p>
            </div>
          </div>

          {/* Section B: Owner Operator Card Profile */}
          <div className="flex flex-wrap items-center gap-4 xl:justify-end shrink-0 w-full xl:w-auto">
            
            {/* Operator Box */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center font-bold text-white text-sm shrink-0">
                <User size={18} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase">
                  {isMr ? 'सक्रिय ऑपरेटर' : 'Active Operator'}
                </span>
                <span className="text-xs font-bold text-white block">
                  {session?.name || (isMr ? 'राहुल देशमुख' : 'Rahul Deshmukh')}
                </span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-[9px] font-extrabold text-emerald-400 font-mono uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded">
                    {session?.role === 'owner' ? (isMr ? 'मालक' : 'Owner') : (isMr ? 'कर्मचारी' : 'Employee')}
                  </span>
                  {(session?.mobile || shopSettings?.mobile) && (
                    <span className="text-[9px] text-slate-400 font-mono flex items-center gap-0.5 ml-1">
                      <Phone size={8} /> {session?.mobile || shopSettings?.mobile}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Terminal Clock / Date Card */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center shrink-0 border border-indigo-500/20">
                <Calendar size={18} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-mono tracking-wider block uppercase">
                  {isMr ? 'आजचा दिनांक' : 'Live Date'}
                </span>
                <span className="text-xs font-bold text-indigo-100 block">
                  {isMr ? 'सोमवार, २० जुलै २०२६' : 'Monday, July 20, 2026'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock size={9} /> 10:45 AM • {isMr ? 'सुरक्षित क्लाउड' : 'Cloud Synced'}
                </span>
              </div>
            </div>

            {/* Quick Invoice Trigger */}
            <button
              id="nav-billing-btn"
              onClick={() => onNavigate('billing')}
              className="w-full sm:w-auto px-5 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl text-xs font-black tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 border border-indigo-400/20 transition transform hover:scale-[1.02]"
            >
              <IndianRupee size={15} />
              {t.newInvoice}
            </button>
          </div>

        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Today's Sales */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex justify-between items-start"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">{t.todaySales}</span>
            <h3 className="text-2xl font-bold font-sans text-indigo-950">₹{todaySales.toLocaleString('en-IN')}</h3>
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-0.5 font-mono">
              <TrendingUp size={12} /> +12.4% vs yest
            </span>
          </div>
          <div className="bg-indigo-50 p-2.5 rounded-lg text-indigo-600">
            <TrendingUp size={20} />
          </div>
        </motion.div>

        {/* KPI: Today's Collection */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex justify-between items-start"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">{t.todayCollection}</span>
            <h3 className="text-2xl font-bold font-sans text-emerald-950">₹{todayCollection.toLocaleString('en-IN')}</h3>
            <span className="text-emerald-600 text-xs font-semibold flex items-center gap-0.5 font-mono">
              <CheckCircle size={12} /> 100% synced
            </span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-600">
            <IndianRupee size={20} />
          </div>
        </motion.div>

        {/* KPI: Outstanding dues */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex justify-between items-start"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">{t.pendingPayments}</span>
            <h3 className="text-2xl font-bold font-sans text-rose-950">₹{pendingPayments.toLocaleString('en-IN')}</h3>
            <span className="text-slate-500 text-xs font-medium block">
              {isMr ? 'ग्राहकांकडील येणे बाकी' : 'Awaiting customer dues'}
            </span>
          </div>
          <div className="bg-rose-50 p-2.5 rounded-lg text-rose-600">
            <AlertTriangle size={20} />
          </div>
        </motion.div>

        {/* KPI: Low Stock Alerts */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => onNavigate('products')}
          className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex justify-between items-start cursor-pointer hover:border-amber-400 transition group"
        >
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-medium">{t.lowStockAlert}</span>
            <h3 className="text-2xl font-bold font-sans text-amber-950">
              {lowStockItems.length} {isMr ? 'आयटम' : 'Products'}
            </h3>
            <span className="text-amber-700 text-xs font-semibold flex items-center gap-0.5 font-mono">
              <Package size={12} /> Stock Total: {totalStockQty} pcs
            </span>
          </div>
          <div className="bg-amber-50 p-2.5 rounded-lg text-amber-600 group-hover:bg-amber-100 transition">
            <Package size={20} />
          </div>
        </motion.div>
      </div>

      {/* Profits & Live Inventory valuation mini indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-700">
            <CheckCircle size={16} />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">{t.todayProfit}</span>
            <span className="font-bold text-slate-800">₹{todayProfit.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-700">
            <TrendingUp size={16} />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">{t.monthlyProfit}</span>
            <span className="font-bold text-slate-800">₹{monthlyProfit.toLocaleString('en-IN')}</span>
          </div>
        </div>
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
          <div className="bg-sky-100 p-2 rounded-lg text-sky-700">
            <Layers size={16} />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">{isMr ? 'साठा मूल्य (खरेदी मूल्य)' : 'Total Stock Cost Valuation'}</span>
            <span className="font-bold text-slate-800">₹{totalStockVal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Main Graph & Top Selling Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Collection Chart (Left 2 Columns) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.salesCollectionTrend}</h2>
              <p className="text-xs text-slate-500">{isMr ? 'मागील ६ दिवसांचे प्रदर्शन' : 'Performance log of the past 6 days'}</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-xs block"></span> {isMr ? 'विक्री' : 'Sales'}
              </span>
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs block"></span> {isMr ? 'वसुली' : 'Collection'}
              </span>
            </div>
          </div>

          <div className="w-full h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D0BCFF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D0BCFF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B2F2BB" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#B2F2BB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#49454F" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#938F99' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#938F99' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1B1F', border: '1px solid #49454F', borderRadius: '12px', color: '#E6E1E5' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="Sales" stroke="#D0BCFF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Collection" stroke="#B2F2BB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCollection)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Stack */}
        <div className="flex flex-col gap-6">
          {/* Top Selling Products */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
            <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.topSelling}</h2>
              <p className="text-xs text-slate-500">{isMr ? 'सर्वात जास्त विकल्या गेलेले आयटम' : 'Items moving fast in the store'}</p>
            </div>

            <div className="space-y-3">
              {topProducts.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-xs text-slate-800 line-clamp-1">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block font-mono pl-6">{p.tag}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-indigo-600 block">{p.qty} {isMr ? 'नग' : 'pcs'}</span>
                    <span className="text-[10px] text-slate-500 font-mono">₹{p.sales.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            id="nav-reports-btn"
            onClick={() => onNavigate('reports')}
            className="w-full mt-4 flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 transition py-2.5 rounded-xl text-xs font-semibold text-slate-600"
          >
            <FileSpreadsheet size={14} />
            {isMr ? 'सर्व विक्री अहवाल पहा' : 'View Deep Sales Reports'}
            <ArrowRight size={12} />
          </button>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-rose-200 flex flex-col shadow-sm shadow-rose-100/50">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-rose-500" size={20} />
                <div>
                  <h2 className="text-base font-bold text-slate-900">{isMr ? 'कमी स्टॉक अलर्ट' : 'Low Stock Alerts'}</h2>
                  <p className="text-xs text-slate-500">{isMr ? 'लवकरच संपणारे आयटम' : 'Products needing restock'}</p>
                </div>
              </div>
              <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                {lowStockItems.length > 0 ? lowStockItems.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-rose-50 border border-rose-100">
                    <div className="space-y-0.5">
                      <span className="font-semibold text-xs text-slate-800 line-clamp-1">{isMr ? p.itemNameMr : p.itemName}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">Size: {p.size} • Color: {p.color}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-xs text-rose-600 block">{p.currentStock} left</span>
                      <span className="text-[10px] text-slate-500 font-mono">Min: {p.minStock}</span>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                    <CheckCircle className="mx-auto text-emerald-500 mb-2" size={20} />
                    <p className="text-xs font-bold text-emerald-700">{isMr ? 'सर्व स्टॉक व्यवस्थित आहे' : 'All stock levels healthy'}</p>
                  </div>
                )}
              </div>
            </div>
            <button 
              id="nav-products-btn"
              onClick={() => onNavigate('products')}
              className="w-full mt-4 flex items-center justify-center gap-2 border border-rose-200 hover:bg-rose-50 transition py-2.5 rounded-xl text-xs font-semibold text-rose-600"
            >
              <Package size={14} />
              {isMr ? 'इन्व्हेंटरी व्यवस्थापित करा' : 'Manage Inventory'}
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t.recentInvoices}</h2>
            <p className="text-xs text-slate-500">{isMr ? 'आजचे आणि कालचे बिलींग रेकॉर्ड' : 'Recent billing transactions'}</p>
          </div>
          <button 
            id="nav-billing-terminal-btn"
            onClick={() => onNavigate('billing')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
          >
            {isMr ? 'नवीन बिल बनवा' : 'Open POS Terminal'} <ArrowRight size={12} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 uppercase font-mono bg-slate-50/50">
                <th className="py-2.5 px-3">{isMr ? 'बिल क्र.' : 'Inv No.'}</th>
                <th className="py-2.5 px-3">{isMr ? 'तारीख' : 'Date'}</th>
                <th className="py-2.5 px-3">{isMr ? 'ग्राहक' : 'Customer'}</th>
                <th className="py-2.5 px-3">{isMr ? 'प्रकार' : 'Type'}</th>
                <th className="py-2.5 px-3">{isMr ? 'एकूण रक्कम' : 'Total'}</th>
                <th className="py-2.5 px-3">{isMr ? 'भरलेली रक्कम' : 'Paid'}</th>
                <th className="py-2.5 px-3">{isMr ? 'मोड' : 'Mode'}</th>
                <th className="py-2.5 px-3 text-center">{isMr ? 'स्थिती' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition font-sans text-slate-700">
                  <td className="py-3 px-3 font-semibold text-indigo-600 font-mono">{inv.invoiceNumber}</td>
                  <td className="py-3 px-3 text-slate-500">{inv.date}</td>
                  <td className="py-3 px-3 font-semibold">{inv.customerName}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${inv.type === 'GST' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-slate-50 text-slate-600'}`}>
                      {inv.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-emerald-600 font-semibold">₹{inv.amountPaid.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 font-mono text-[11px] font-semibold">{inv.paymentMode}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 
                      inv.status === 'Partial' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
