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
  LineChart,
  CheckCircle2,
  Table,
  Briefcase
} from 'lucide-react';
import { Product, Invoice, PurchaseBill, Expense, AppTranslations, Customer } from '../types';
import * as XLSX from 'xlsx';

interface ReportsViewProps {
  products: Product[];
  invoices: Invoice[];
  purchaseHistory: PurchaseBill[];
  expenses: Expense[];
  customers?: Customer[];
  t: AppTranslations;
  isMr: boolean;
}

export default function ReportsView({
  products,
  invoices,
  purchaseHistory,
  expenses,
  customers = [],
  t,
  isMr
}: ReportsViewProps) {
  // Subtabs: 'sales', 'gst', 'stock', 'pnl', 'collections'
  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'gst' | 'stock' | 'pnl' | 'collections'>('sales');

  // Math Calculations
  const totalSalesVal = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPurchaseVal = purchaseHistory.reduce((sum, bill) => sum + bill.grandTotal, 0);
  const totalExpensesVal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalGstSalesTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);

  // Profit calculations
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

  // Helper to extract collections from state
  const getCollectionsData = () => {
    const list: any[] = [];

    // 1. Collections from invoices (direct payments at the terminal)
    invoices.forEach(inv => {
      if (inv.paymentMode !== 'Credit' && inv.amountPaid > 0) {
        list.push({
          id: inv.invoiceNumber,
          date: inv.date,
          customerName: inv.customerName,
          customerMobile: inv.customerMobile,
          type: 'Invoice Sale',
          paymentMode: inv.paymentMode,
          amountCollected: inv.amountPaid,
          description: `Direct checkout terminal collection (Bill Amt: ₹${inv.grandTotal})`
        });
      } else if (inv.paymentMode === 'Split') {
        const cashAmt = inv.splitDetails?.cash || 0;
        const upiAmt = inv.splitDetails?.upi || 0;
        const cardAmt = inv.splitDetails?.card || 0;
        const totalPaid = cashAmt + upiAmt + cardAmt;
        if (totalPaid > 0) {
          list.push({
            id: inv.invoiceNumber,
            date: inv.date,
            customerName: inv.customerName,
            customerMobile: inv.customerMobile,
            type: 'Invoice Sale (Split)',
            paymentMode: `Split (Cash: ₹${cashAmt}, UPI: ₹${upiAmt}, Card: ₹${cardAmt})`,
            amountCollected: totalPaid,
            description: `Split terminal collection (Bill Amt: ₹${inv.grandTotal})`
          });
        }
      }
    });

    // 2. Collections from customer ledgers (subsequent receipts / credit clearance)
    customers.forEach(cust => {
      cust.ledger.forEach(entry => {
        if (entry.type === 'receipt') {
          list.push({
            id: entry.refId || entry.id,
            date: entry.date,
            customerName: cust.name,
            customerMobile: cust.mobile,
            type: 'Ledger Payment',
            paymentMode: entry.description.toLowerCase().includes('upi') ? 'UPI' : (entry.description.toLowerCase().includes('card') ? 'Card' : 'Cash'),
            amountCollected: entry.credit,
            description: entry.description
          });
        }
      });
    });

    // Sort by date descending
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Prepare Excel/CSV Data structures
  const prepSalesSummary = () => invoices.map(inv => ({
    "Invoice Number": inv.invoiceNumber,
    "Date": inv.date,
    "Customer Name": inv.customerName,
    "Customer Mobile": inv.customerMobile,
    "Type": inv.type,
    "Subtotal (INR)": inv.subtotal,
    "Discount (INR)": inv.discount,
    "Tax Amount (INR)": inv.taxAmount,
    "Grand Total (INR)": inv.grandTotal,
    "Amount Paid (INR)": inv.amountPaid,
    "Payment Mode": inv.paymentMode,
    "Status": inv.status,
    "WhatsApp Sent": inv.whatsappSent ? "Yes" : "No"
  }));

  const prepSalesDetailed = () => {
    const rows: any[] = [];
    invoices.forEach(inv => {
      inv.items.forEach(it => {
        rows.push({
          "Invoice Number": inv.invoiceNumber,
          "Date": inv.date,
          "Customer Name": inv.customerName,
          "Customer Mobile": inv.customerMobile,
          "Item Name": it.itemName,
          "Size": it.size,
          "Color": it.color,
          "Quantity": it.quantity,
          "Rate (INR)": it.rate,
          "GST %": it.gstPercent,
          "Discount Amount (INR)": it.discountAmount || 0,
          "Item Total (INR)": it.total,
          "Invoice Grand Total": inv.grandTotal,
          "Payment Mode": inv.paymentMode
        });
      });
    });
    return rows;
  };

  const prepStockData = () => products.map(p => ({
    "Product ID": p.id,
    "Item Name (EN)": p.itemName,
    "Item Name (MR)": p.itemNameMr,
    "Category": p.category,
    "Brand": p.brand,
    "Size": p.size,
    "Color": p.color,
    "Current Stock (pcs)": p.currentStock,
    "Min Stock Level": p.minStock,
    "Stock Status": p.currentStock <= p.minStock ? "LOW STOCK" : "NORMAL",
    "Purchase Price (INR)": p.purchasePrice,
    "Selling Price / MRP (INR)": p.sellingPrice,
    "Total Cost Value (INR)": p.currentStock * p.purchasePrice,
    "Potential Retail Value (INR)": p.currentStock * p.sellingPrice,
    "HSN Code": p.hsn,
    "GST %": p.gstPercent
  }));

  const prepCollectionsData = () => {
    const collections = getCollectionsData();
    return collections.map(col => ({
      "Reference / Invoice ID": col.id,
      "Date": col.date,
      "Customer Name": col.customerName,
      "Customer Mobile": col.customerMobile,
      "Collection Source": col.type,
      "Payment Mode": col.paymentMode,
      "Amount Collected (INR)": col.amountCollected,
      "Description": col.description
    }));
  };

  const prepGstData = () => invoices.map(inv => ({
    "Invoice Number": inv.invoiceNumber,
    "Date": inv.date,
    "Customer Name": inv.customerName,
    "GSTIN / Customer Mobile": inv.customerMobile,
    "Invoice Type": inv.type,
    "Taxable Value (INR)": inv.subtotal - inv.discount,
    "Tax Rate": inv.items[0]?.gstPercent ? `${inv.items[0].gstPercent}%` : "Default",
    "GST Tax Collected (INR)": inv.taxAmount,
    "Grand Total (INR)": inv.grandTotal
  }));

  // Trigger export using XLSX
  const handleExportExcel = (type: 'current' | 'all' | 'sales' | 'stock' | 'collections') => {
    const wb = XLSX.utils.book_new();
    const dateStr = new Date().toISOString().split('T')[0];

    // Determine target sheets to add
    const exportSales = type === 'all' || type === 'sales' || (type === 'current' && activeReportTab === 'sales');
    const exportStock = type === 'all' || type === 'stock' || (type === 'current' && activeReportTab === 'stock');
    const exportCollections = type === 'all' || type === 'collections' || (type === 'current' && activeReportTab === 'collections');
    const exportGst = type === 'all' || (type === 'current' && activeReportTab === 'gst');

    // Add general summary info tab if exporting all FIRST (as the landing tab)
    if (type === 'all') {
      const summaryStats = [
        { "Metric": "Total Sales (INR)", "Value": totalSalesVal },
        { "Metric": "Total Purchases / Wholesale (INR)", "Value": totalPurchaseVal },
        { "Metric": "Total Operating Expenses (INR)", "Value": totalExpensesVal },
        { "Metric": "GST Output Tax Collected (INR)", "Value": totalGstSalesTax },
        { "Metric": "Estimated Cost of Goods Sold (INR)", "Value": costOfItemsSold },
        { "Metric": "Total Customer Discounts Allowed (INR)", "Value": totalDiscounts },
        { "Metric": "Net Session Profit (INR)", "Value": netEstimatedProfit },
        { "Metric": "Total Registered Products", "Value": products.length },
        { "Metric": "Total Invoices Generated", "Value": invoices.length },
        { "Metric": "Total Collections Received (INR)", "Value": getCollectionsData().reduce((sum, c) => sum + c.amountCollected, 0) }
      ];
      const wsSummaryStats = XLSX.utils.json_to_sheet(summaryStats);
      XLSX.utils.book_append_sheet(wb, wsSummaryStats, "Financial Overview");
    }

    if (exportSales) {
      const summaryData = prepSalesSummary();
      const detailedData = prepSalesDetailed();
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      const wsDetailed = XLSX.utils.json_to_sheet(detailedData);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Sales Summary");
      XLSX.utils.book_append_sheet(wb, wsDetailed, "Sales Items Detailed");
    }

    if (exportStock) {
      const stockData = prepStockData();
      const wsStock = XLSX.utils.json_to_sheet(stockData);
      XLSX.utils.book_append_sheet(wb, wsStock, "Stock Status");
    }

    if (exportCollections) {
      const collectionsData = prepCollectionsData();
      const wsCollections = XLSX.utils.json_to_sheet(collectionsData);
      XLSX.utils.book_append_sheet(wb, wsCollections, "Collections Ledger");
    }

    if (exportGst) {
      const gstData = prepGstData();
      const wsGst = XLSX.utils.json_to_sheet(gstData);
      XLSX.utils.book_append_sheet(wb, wsGst, "GST Statement");
    }

    const fileName = type === 'all' 
      ? `Vastraa_Consolidated_Ledger_${dateStr}` 
      : `Vastraa_${type.toUpperCase() === 'CURRENT' ? activeReportTab.toUpperCase() : type.toUpperCase()}_Report_${dateStr}`;

    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const handleExportCsv = (type: 'sales' | 'stock' | 'collections' | 'gst') => {
    let dataToExport: any[] = [];
    let sheetName = "";

    if (type === 'sales') {
      dataToExport = prepSalesSummary();
      sheetName = "Sales_Summary";
    } else if (type === 'stock') {
      dataToExport = prepStockData();
      sheetName = "Stock_Inventory";
    } else if (type === 'collections') {
      dataToExport = prepCollectionsData();
      sheetName = "Collections_Ledger";
    } else if (type === 'gst') {
      dataToExport = prepGstData();
      sheetName = "GST_Tax_Statement";
    }

    if (dataToExport.length === 0) {
      alert(isMr ? 'निर्यात करण्यासाठी डेटा रिकामा आहे!' : 'No data available to export!');
      return;
    }

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `Vastraa_${sheetName}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerExport = (format: 'pdf' | 'excel', name: string) => {
    if (format === 'excel') {
      handleExportExcel('current');
    } else {
      // PDF fallback: open browser print menu
      window.print();
    }
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
          id="report-tab-collections"
          onClick={() => setActiveReportTab('collections')}
          className={`py-3 px-4 font-bold border-b-2 transition ${activeReportTab === 'collections' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          💳 {isMr ? 'जमा रक्कम अहवाल' : 'Collections Ledger'}
        </button>

        <button
          id="report-tab-pnl"
          onClick={() => setActiveReportTab('pnl')}
          className={`py-3 px-4 font-bold border-b-2 transition ${activeReportTab === 'pnl' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          💰 {isMr ? 'नफा आणि तोटा' : 'Net Profit & Loss Statement'}
        </button>
      </div>

      {/* Export Control Panel */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 text-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-sans flex items-center gap-2">
              <FileSpreadsheet className="text-emerald-600" size={16} />
              {isMr ? 'डेटा एक्सपोर्ट केंद्र' : 'Interactive Spreadsheet & PDF Export Center'}
            </h4>
            <p className="text-slate-500 text-[11px] mt-1">
              {isMr 
                ? 'खालीलपैकी कोणताही अहवाल थेट एक्सेल किंवा सीएसव्ही स्वरूपात डाउनलोड करा.' 
                : 'Instantly download your sales terminals, active inventory assets, and customer collections.'}
            </p>
          </div>

          <button
            onClick={() => handleExportExcel('all')}
            className="self-start md:self-auto flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-xl font-bold px-4 py-2 shadow-sm transition transform active:scale-95 text-[11px]"
          >
            <Briefcase size={14} /> 
            {isMr ? 'सर्व अहवाल एकत्रित डाउनलोड करा (.xlsx)' : 'Download Consolidated Workbook (.xlsx)'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Sales Card */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-slate-800 block text-xs">📈 {isMr ? 'विक्री अहवाल' : 'Sales Reports'}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{invoices.length} invoices generated</span>
            </div>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => handleExportExcel('sales')}
                className="flex-1 text-center py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-100 transition text-[10px]"
              >
                Excel
              </button>
              <button
                onClick={() => handleExportCsv('sales')}
                className="flex-1 text-center py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 transition text-[10px]"
              >
                CSV
              </button>
            </div>
          </div>

          {/* Stock Card */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-slate-800 block text-xs">📦 {isMr ? 'स्टॉक अहवाल' : 'Stock Reports'}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{products.length} catalog items</span>
            </div>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => handleExportExcel('stock')}
                className="flex-1 text-center py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-100 transition text-[10px]"
              >
                Excel
              </button>
              <button
                onClick={() => handleExportCsv('stock')}
                className="flex-1 text-center py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 transition text-[10px]"
              >
                CSV
              </button>
            </div>
          </div>

          {/* Collections Card */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
            <div>
              <span className="font-bold text-slate-800 block text-xs">💳 {isMr ? 'जमा रक्कम अहवाल' : 'Collections Ledger'}</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{getCollectionsData().length} active transactions</span>
            </div>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={() => handleExportExcel('collections')}
                className="flex-1 text-center py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg border border-emerald-100 transition text-[10px]"
              >
                Excel
              </button>
              <button
                onClick={() => handleExportCsv('collections')}
                className="flex-1 text-center py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 transition text-[10px]"
              >
                CSV
              </button>
            </div>
          </div>
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
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">GST Tax Summary Logs</h3>
              <p className="text-slate-500">Summary of integrated tax liability collected and paid for the financial period.</p>
            </div>
            <button 
              onClick={() => handleExportExcel('current')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold font-mono text-[10px] flex items-center gap-1"
            >
              <FileSpreadsheet size={12} /> Export GST Excel
            </button>
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
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Inventory Assets Valuation</h3>
              <p className="text-slate-500">Analysis of stock valuations, purchasing costs, and potential retail sales value.</p>
            </div>
            <button 
              onClick={() => handleExportExcel('current')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold font-mono text-[10px] flex items-center gap-1"
            >
              <FileSpreadsheet size={12} /> Export Stock Excel
            </button>
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

      {activeReportTab === 'collections' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-5 text-xs text-slate-700">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{isMr ? 'जमा रक्कम अहवाल' : 'Collections Ledger'}</h3>
              <p className="text-slate-500">
                {isMr 
                  ? 'विक्री काउंटरवरील थेट पेमेंट आणि ग्राहकांकडून वसूल केलेल्या थकबाकीची नोंद.' 
                  : 'Summary of payments collected directly at the checkout terminal and from customer credit accounts.'}
              </p>
            </div>
            <button 
              onClick={() => handleExportExcel('current')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold font-mono text-[10px] flex items-center gap-1"
            >
              <FileSpreadsheet size={12} /> Export Collections Excel
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl space-y-1 col-span-1">
              <span className="text-slate-500 font-sans">{isMr ? 'एकूण जमा रक्कम:' : 'Total Amount Collected:'}</span>
              <h4 className="text-xl font-bold text-emerald-700">
                ₹{getCollectionsData().reduce((sum, item) => sum + item.amountCollected, 0).toLocaleString()}
              </h4>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-1 col-span-1">
              <span className="text-slate-500 font-sans">{isMr ? 'एकूण व्यवहारांची संख्या:' : 'Total Collection Entries:'}</span>
              <h4 className="text-xl font-bold text-slate-800">
                {getCollectionsData().length}
              </h4>
            </div>
          </div>

          {/* Collections Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-[300px] overflow-y-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase font-mono border-b border-slate-100 sticky top-0 z-10">
                  <th className="py-2.5 px-3 bg-slate-50">{isMr ? 'दिनांक' : 'Date'}</th>
                  <th className="py-2.5 px-3 bg-slate-50">{isMr ? 'संदर्भ क्र.' : 'Ref / Invoice'}</th>
                  <th className="py-2.5 px-3 bg-slate-50">{isMr ? 'ग्राहक' : 'Customer'}</th>
                  <th className="py-2.5 px-3 bg-slate-50">{isMr ? 'प्रकार' : 'Source'}</th>
                  <th className="py-2.5 px-3 bg-slate-50">{isMr ? 'पेमेंट मोड' : 'Payment Mode'}</th>
                  <th className="py-2.5 px-3 text-right font-mono bg-slate-50">{isMr ? 'रक्कम (₹)' : 'Amount (₹)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {getCollectionsData().map((col, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-500">{col.date}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-950">{col.id}</td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-800 block">{col.customerName}</span>
                      <span className="text-[9px] text-slate-400 font-mono">+91 {col.customerMobile}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        col.type.includes('Ledger') 
                          ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      }`}>
                        {col.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-600">{col.paymentMode}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">₹{col.amountCollected.toLocaleString()}</td>
                  </tr>
                ))}
                {getCollectionsData().length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {isMr ? 'कोणतीही जमा रक्कम आढळली नाही.' : 'No collections recorded yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
