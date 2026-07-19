/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileSpreadsheet, 
  FileText, 
  TrendingUp, 
  Percent, 
  Layers, 
  Clock, 
  Download,
  Flame,
  AlertOctagon,
  LineChart
} from 'lucide-react';
import { Product, Invoice, PurchaseBill, Expense, AppTranslations } from '../types';

interface ReportsViewProps {
  products: Product[];
  invoices: Invoice[];
  purchaseHistory: PurchaseBill[];
  expenses: Expense[];
  t: AppTranslations;
  isMr: boolean;
}

export default function ReportsView({
  products,
  invoices,
  purchaseHistory,
  expenses,
  t,
  isMr
}: ReportsViewProps) {
  // Subtabs: 'sales', 'gst', 'stock_valuation', 'pnl'
  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'gst' | 'stock' | 'pnl'>('sales');

  // Math Calculations
  const totalSalesVal = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPurchaseVal = purchaseHistory.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const totalExpensesVal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalGstSalesTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

  // Profit calculations
  // Est profit = total sales - wholesale cost of items sold - discounts - expenses
  const costOfItemsSold = invoices.reduce((sum, inv) => {
    return sum + inv.items.reduce((cSum, item) => {
      const p = products.find(prod => prod.id === item.productId);
      return cSum + ((p?.purchasePrice || 0) * item.quantity);
    }, 0);
  }, 0);
  const totalDiscounts = invoices.reduce((sum, inv) => sum + inv.discount, 0);
  const netEstimatedProfit = totalSalesVal - costOfItemsSold - totalDiscounts - totalExpensesVal;

  // Fast moving / slow moving categories
  const fastMovingItems = products.filter(p => p.currentStock > p.minStock * 2);
  const slowMovingItems = products.filter(p => p.currentStock <= p.minStock);

  const triggerExport = (format: 'pdf' | 'excel', name: string) => {
    alert(isMr 
      ? `${name} यशस्वीरित्या ${format.toUpperCase()} फाईलमध्ये सेव्ह झाला!` 
      : `${name} exported successfully in ${format.toUpperCase()} format!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab select bar */}
      <div className="flex border-b border-slate-200 flex-wrap gap-2 text-xs">
        <button
          id="report-tab-sales"
          onClick={() => setActiveReportTab('sales')}
          className={`py-3 px-4 font-bold border-b-2 transition ${activeReportTab === 'sales' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          📈 {isMr ? 'विक्री अहवाल' : 'Sales Logs & Moving Items'}
        </button>

        <button
          id="report-tab-gst"
          onClick={() => setActiveReportTab('gst')}
          className={`py-3 px-4 font-bold border-b-2 transition ${activeReportTab === 'gst' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          📄 {isMr ? 'जीएसटी अहवाल' : 'GST Tax Statements'}
        </button>

        <button
          id="report-tab-stock"
          onClick={() => setActiveReportTab('stock')}
          className={`py-3 px-4 font-bold border-b-2 transition ${activeReportTab === 'stock' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          📦 {isMr ? 'स्टॉक मूल्य' : 'Inventory Asset Valuations'}
        </button>

        <button
          id="report-tab-pnl"
          onClick={() => setActiveReportTab('pnl')}
          className={`py-3 px-4 font-bold border-b-2 transition ${activeReportTab === 'pnl' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          💰 {isMr ? 'नफा आणि तोटा' : 'Net Profit & Loss Statement'}
        </button>
      </div>

      {/* Export Toolbar panel */}
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs">
        <span className="text-slate-500 leading-normal font-medium">Select a format to download full financial ledger details:</span>
        <div className="flex gap-2">
          <button
            id="export-pdf-btn"
            onClick={() => triggerExport('pdf', activeReportTab.toUpperCase() + '_REPORT')}
            className="flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg font-bold px-3 py-1.5 hover:bg-rose-100 transition"
          >
            <FileText size={14} /> PDF
          </button>
          <button
            id="export-excel-btn"
            onClick={() => triggerExport('excel', activeReportTab.toUpperCase() + '_REPORT')}
            className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold px-3 py-1.5 hover:bg-emerald-100 transition"
          >
            <FileSpreadsheet size={14} /> Excel
          </button>
        </div>
      </div>

      {/* TAB content rendering */}
      {activeReportTab === 'sales' && (
        <div className="space-y-6">
          {/* Top Selling Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fast Moving Items (Flame color) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="text-orange-500" size={18} />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">Fast-Moving Clothes (High Velocity)</h4>
              </div>

              <div className="space-y-2">
                {fastMovingItems.map(p => (
                  <div key={p.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{isMr ? p.itemNameMr : p.itemName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Category: {p.category} | Size: {p.size}</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-mono">
                      Stock: {p.currentStock} pcs
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Slow Moving / Under Stock Limit Items */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center gap-2">
                <AlertOctagon className="text-amber-500" size={18} />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">Slow-Moving & Critical Alerts</h4>
              </div>

              <div className="space-y-2">
                {slowMovingItems.map(p => (
                  <div key={p.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-800 block">{isMr ? p.itemNameMr : p.itemName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">Brand: {p.brand} | Size: {p.size}</span>
                    </div>
                    <span className="bg-rose-50 text-rose-700 font-bold border border-rose-100 px-2 py-0.5 rounded text-[10px] font-mono">
                      Crit: {p.currentStock} pcs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'gst' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5 text-xs text-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">GST Tax Summary Logs</h3>
            <p className="text-slate-500">Summary of integrated tax liability collected and paid for the financial period.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs space-y-1">
              <span className="text-slate-500 font-sans">GST Tax Collected (Sales Output):</span>
              <h4 className="text-xl font-bold text-indigo-700">₹{totalGstSalesTax.toFixed(2)}</h4>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs space-y-1">
              <span className="text-slate-500 font-sans">ITC Available (Purchases Input):</span>
              <h4 className="text-xl font-bold text-amber-700">₹{(totalPurchaseVal * 0.05).toFixed(2)}</h4>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs space-y-1">
              <span className="text-slate-500 font-sans">Net Tax Liability Payable:</span>
              <h4 className="text-xl font-bold text-emerald-700">₹{Math.max(0, totalGstSalesTax - (totalPurchaseVal * 0.05)).toFixed(2)}</h4>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'stock' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5 text-xs text-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Inventory Assets Valuation</h3>
            <p className="text-slate-500">Analysis of stock valuations, purchasing costs, and potential retail sales value.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-slate-500 font-sans">Total Asset Valuation at Cost Price:</span>
              <h4 className="text-xl font-bold text-slate-800">
                ₹{products.reduce((sum, p) => sum + (p.currentStock * p.purchasePrice), 0).toLocaleString()}
              </h4>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
              <span className="text-slate-500 font-sans">Potential Sales Value at Retail MRP:</span>
              <h4 className="text-xl font-bold text-indigo-600">
                ₹{products.reduce((sum, p) => sum + (p.currentStock * p.sellingPrice), 0).toLocaleString()}
              </h4>
            </div>
          </div>
        </div>
      )}

      {activeReportTab === 'pnl' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5 text-xs text-slate-700">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Profit and Loss (P&L) Statement</h3>
            <p className="text-slate-500">Summary of revenues, costs, and operating expenses incurred during this demo session.</p>
          </div>

          <div className="space-y-3 font-mono border border-slate-100 rounded-xl overflow-hidden">
            {/* Revenues */}
            <div className="bg-slate-50/50 p-3 flex justify-between font-bold border-b border-slate-100">
              <span className="font-sans text-slate-800 text-xs">Total Operating Revenue (Sales Terminals):</span>
              <span className="text-slate-900">₹{totalSalesVal.toLocaleString()}</span>
            </div>

            {/* Direct Costs */}
            <div className="p-3 flex justify-between border-b border-slate-100">
              <span className="font-sans text-slate-500">Less: Wholesale Cost of Goods Sold (COGS):</span>
              <span className="text-rose-600">-₹{costOfItemsSold.toLocaleString()}</span>
            </div>

            {/* Discounts */}
            <div className="p-3 flex justify-between border-b border-slate-100">
              <span className="font-sans text-slate-500">Less: Customer Discounts & Coupon Deductions:</span>
              <span className="text-rose-600">-₹{totalDiscounts.toLocaleString()}</span>
            </div>

            {/* Expenses */}
            <div className="p-3 flex justify-between border-b border-slate-100">
              <span className="font-sans text-slate-500">Less: Shop Expenses (Electric, Hospitality, Rent):</span>
              <span className="text-rose-600">-₹{totalExpensesVal.toLocaleString()}</span>
            </div>

            {/* Net Profits */}
            <div className="bg-emerald-50/60 p-4 flex justify-between font-bold text-sm">
              <span className="font-sans text-emerald-950 text-xs uppercase tracking-wider">Net Estimated Profit:</span>
              <span className="text-emerald-700 text-base">₹{netEstimatedProfit.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
