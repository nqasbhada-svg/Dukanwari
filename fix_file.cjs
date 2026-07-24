const fs = require('fs');

let content = fs.readFileSync('src/components/BillingTerminalView.tsx', 'utf8');

// Find the index of `{activeTerminalTab === "recent" && (`
const recentIndex = content.lastIndexOf('{activeTerminalTab === "recent" && (');

if (recentIndex !== -1) {
  // Let's remove everything after `</form>\n            </div>\n          </motion.div>\n        </div>\n      )}`
  // Wait, let's look for the actual end of the "terminal" tab.
  const endOfTerminalIndex = content.indexOf('</form>\n            </div>\n          </motion.div>\n        </div>\n      )}');
  
  if (endOfTerminalIndex !== -1) {
    // The "terminal" tab's content ends at the `}` of the `showCustomerPopup` conditional.
    const endStr = '</form>\n            </div>\n          </motion.div>\n        </div>\n      )}\n    </div>';
    const trueEndOfTerminal = content.indexOf(endStr);
    
    if (trueEndOfTerminal !== -1) {
       let newContent = content.substring(0, trueEndOfTerminal + endStr.length);
       newContent += `
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
                      <button onClick={() => { setActiveInvoice(inv); setShowInvoicePreview(true); }} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors" title="View & Print">
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
       fs.writeFileSync('src/components/BillingTerminalView.tsx', newContent);
       console.log("Fixed successfully.");
    } else {
       console.log("Could not find the end of terminal");
    }
  }
}

