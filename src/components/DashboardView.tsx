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
  FileSpreadsheet
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
import { Product, Invoice, AppTranslations } from '../types';

interface DashboardProps {
  products: Product[];
  invoices: Invoice[];
  t: AppTranslations;
  isMr: boolean;
  onNavigate: (view: string) => void;
}

export default function DashboardView({ products, invoices, t, isMr, onNavigate }: DashboardProps) {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-radial from-slate-900 to-slate-950 p-6 rounded-2xl border border-slate-800 text-white gap-4">
        <div>
          <span className="text-xs font-mono tracking-widest text-indigo-400 font-semibold uppercase">Cloud Connected - Supabase Live</span>
          <h1 className="text-2xl font-sans font-bold tracking-tight mt-1">
            {isMr ? 'रामकृष्ण हरी! कपडे दुकान व्यवस्थापन' : 'Vastraa Store Control Center'}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {isMr ? 'आजचा दिनांक: १८ जुलै २०२६ | युजर: राहुल (मालक)' : 'Live Store Terminal: Sat, July 18, 2026 | Operator: Rahul (Owner)'}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            id="nav-billing-btn"
            onClick={() => onNavigate('billing')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20"
          >
            <IndianRupee size={16} />
            {t.newInvoice}
          </button>
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

        {/* Top Selling Products (Right Column) */}
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
