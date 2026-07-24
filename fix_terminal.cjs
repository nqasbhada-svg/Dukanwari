const fs = require('fs');

let content = fs.readFileSync('src/components/BillingTerminalView.tsx', 'utf8');

// 1. Remove the wrongly injected wrapper inside useEffect
const badWrapper = `  return (
    <div className="flex flex-col gap-4">
      {/* Tab Switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl w-max shadow-sm border border-slate-100 print-hidden">
        <button
          onClick={() => setActiveTerminalTab("terminal")}
          className={\`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all \${
            activeTerminalTab === "terminal" 
              ? "bg-indigo-600 text-white shadow-md" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }\`}
        >
          {isMr ? "बिलिंग टर्मिनल" : "Billing Terminal"}
        </button>
        <button
          onClick={() => setActiveTerminalTab("recent")}
          className={\`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all \${
            activeTerminalTab === "recent" 
              ? "bg-indigo-600 text-white shadow-md" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }\`}
        >
          {isMr ? "अलीकडील बिले" : "Recent Invoices"}
        </button>
      </div>

      {activeTerminalTab === "terminal" && (`

content = content.replace(badWrapper, "    return () => window.removeEventListener('keydown', handleKeyDown);");

// Now we apply the correct wrapper. 
// We search for `return (\n    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">`
// Note: spacing might be slightly different.
const targetReturn = `  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">`;

const goodWrapper = `  return (
    <div className="flex flex-col gap-4">
      {/* Tab Switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl w-max shadow-sm border border-slate-100 print:hidden print-hidden">
        <button
          onClick={() => setActiveTerminalTab("terminal")}
          className={\`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all \${
            activeTerminalTab === "terminal" 
              ? "bg-indigo-600 text-white shadow-md" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }\`}
        >
          {isMr ? "बिलिंग टर्मिनल" : "Billing Terminal"}
        </button>
        <button
          onClick={() => setActiveTerminalTab("recent")}
          className={\`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all \${
            activeTerminalTab === "recent" 
              ? "bg-indigo-600 text-white shadow-md" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }\`}
        >
          {isMr ? "अलीकडील बिले" : "Recent Invoices"}
        </button>
      </div>

      {activeTerminalTab === "terminal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">`;

content = content.replace(targetReturn, goodWrapper);

// We also need to add the closing tags at the very end of the file.
// The file should end with `  );\n}`. Wait, earlier AWK script injected something when it matched `  );`
const wronglyInjectedClosing = `      )}

      {activeTerminalTab === "recent" && (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-extrabold text-slate-800">{isMr ? "अलीकडील 5 बिले" : "Recent 5 Invoices"}</h2>
            <p className="text-xs text-slate-500 mt-1">{isMr ? "त्वरित प्रिंट किंवा पाहण्यासाठी तुमचे अलीकडील इनव्हॉइस" : "Your most recently generated invoices for quick reprint or view"}</p>
          </div>
          <div className="divide-y divide-slate-100">
            {invoices.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(inv => {
              const cust = customers.find(c => c.id === inv.customerId);
              return (
                <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{inv.invoiceNumber}</div>
                      <div className="text-xs text-slate-500 font-medium">{cust ? (isMr ? cust.nameMr : cust.name) : "Walk-in Customer"} • {new Date(inv.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-extrabold text-slate-800">₹{inv.grandTotal.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{inv.paymentMode}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setActiveInvoice(inv); setShowInvoiceModal(true); }} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors" title="View & Print">
                        <Printer size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {invoices.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm font-medium">
                {isMr ? "अद्याप कोणतेही बिल तयार केलेले नाही." : "No invoices generated yet."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );`;

// The wrongly injected closing might be located at the very end of the file. Let's see if the AWK script replaced `  );` at the end.
content = content.replace(wronglyInjectedClosing, "  );");

// Let's inject it correctly now.
// The file should end with `  );\n}` before the AWK. Now it might end with `  );\n}`.
// Let's replace the last `  );\n}` with the correctly formatted closing.
const finalClosing = `        </div>
      )}

      {activeTerminalTab === "recent" && (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden print-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-lg font-extrabold text-slate-800">{isMr ? "अलीकडील 5 बिले" : "Recent 5 Invoices"}</h2>
            <p className="text-xs text-slate-500 mt-1">{isMr ? "त्वरित प्रिंट किंवा पाहण्यासाठी तुमचे अलीकडील इनव्हॉइस" : "Your most recently generated invoices for quick reprint or view"}</p>
          </div>
          <div className="divide-y divide-slate-100">
            {invoices.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(inv => {
              const cust = customers.find(c => c.id === inv.customerId);
              return (
                <div key={inv.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <FileText size={18} />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{inv.invoiceNumber}</div>
                      <div className="text-xs text-slate-500 font-medium">{cust ? (isMr ? cust.nameMr : cust.name) : "Walk-in Customer"} • {new Date(inv.date).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="font-extrabold text-slate-800">₹{inv.grandTotal.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{inv.paymentMode}</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setActiveInvoice(inv); setShowInvoiceModal(true); }} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors" title="View & Print">
                        <Printer size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            {invoices.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-sm font-medium">
                {isMr ? "अद्याप कोणतेही बिल तयार केलेले नाही." : "No invoices generated yet."}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}`;

content = content.replace(/\s*\);\s*\}\s*$/, '\n' + finalClosing);

fs.writeFileSync('src/components/BillingTerminalView.tsx', content);
