awk '
BEGIN {
  print_wrapper = 0
}
/return \(/ {
  if (print_wrapper == 0) {
    print "  return ("
    print "    <div className=\"flex flex-col gap-4\">"
    print "      {/* Tab Switcher */}"
    print "      <div className=\"flex bg-white p-1.5 rounded-2xl w-max shadow-sm border border-slate-100 print-hidden\">"
    print "        <button"
    print "          onClick={() => setActiveTerminalTab(\"terminal\")}"
    print "          className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all ${"
    print "            activeTerminalTab === \"terminal\" "
    print "              ? \"bg-indigo-600 text-white shadow-md\" "
    print "              : \"text-slate-500 hover:bg-slate-50 hover:text-slate-700\""
    print "          }`}"
    print "        >"
    print "          {isMr ? \"बिलिंग टर्मिनल\" : \"Billing Terminal\"}"
    print "        </button>"
    print "        <button"
    print "          onClick={() => setActiveTerminalTab(\"recent\")}"
    print "          className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all ${"
    print "            activeTerminalTab === \"recent\" "
    print "              ? \"bg-indigo-600 text-white shadow-md\" "
    print "              : \"text-slate-500 hover:bg-slate-50 hover:text-slate-700\""
    print "          }`}"
    print "        >"
    print "          {isMr ? \"अलीकडील बिले\" : \"Recent Invoices\"}"
    print "        </button>"
    print "      </div>"
    print ""
    print "      {activeTerminalTab === \"terminal\" && ("
    print_wrapper = 1
    next
  }
}
{
  if (print_wrapper == 1 && $0 == "  );") {
    print "      )}"
    print ""
    print "      {activeTerminalTab === \"recent\" && ("
    print "        <div className=\"bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden\">"
    print "          <div className=\"p-6 border-b border-slate-100 bg-slate-50/50\">"
    print "            <h2 className=\"text-lg font-extrabold text-slate-800\">{isMr ? \"अलीकडील 5 बिले\" : \"Recent 5 Invoices\"}</h2>"
    print "            <p className=\"text-xs text-slate-500 mt-1\">{isMr ? \"त्वरित प्रिंट किंवा पाहण्यासाठी तुमचे अलीकडील इनव्हॉइस\" : \"Your most recently generated invoices for quick reprint or view\"}</p>"
    print "          </div>"
    print "          <div className=\"divide-y divide-slate-100\">"
    print "            {invoices.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map(inv => {"
    print "              const cust = customers.find(c => c.id === inv.customerId);"
    print "              return ("
    print "                <div key={inv.id} className=\"p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors\">"
    print "                  <div className=\"flex items-center gap-4\">"
    print "                    <div className=\"w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600\">"
    print "                      <FileText size={18} />"
    print "                    </div>"
    print "                    <div>"
    print "                      <div className=\"font-bold text-slate-800\">{inv.invoiceNumber}</div>"
    print "                      <div className=\"text-xs text-slate-500 font-medium\">{cust ? (isMr ? cust.nameMr : cust.name) : \"Walk-in Customer\"} • {new Date(inv.date).toLocaleDateString()}</div>"
    print "                    </div>"
    print "                  </div>"
    print "                  <div className=\"flex items-center gap-6\">"
    print "                    <div className=\"text-right\">"
    print "                      <div className=\"font-extrabold text-slate-800\">₹{inv.grandTotal.toFixed(2)}</div>"
    print "                      <div className=\"text-[10px] text-slate-400 font-bold uppercase\">{inv.paymentMode}</div>"
    print "                    </div>"
    print "                    <div className=\"flex gap-2\">"
    print "                      <button onClick={() => { setActiveInvoice(inv); setShowInvoiceModal(true); }} className=\"p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors\" title=\"View & Print\">"
    print "                        <Printer size={16} />"
    print "                      </button>"
    print "                    </div>"
    print "                  </div>"
    print "                </div>"
    print "              );"
    print "            })}"
    print "            {invoices.length === 0 && ("
    print "              <div className=\"p-8 text-center text-slate-500 text-sm font-medium\">"
    print "                {isMr ? \"अद्याप कोणतेही बिल तयार केलेले नाही.\" : \"No invoices generated yet.\"}"
    print "              </div>"
    print "            )}"
    print "          </div>"
    print "        </div>"
    print "      )}"
    print "    </div>"
    print "  );"
    next
  }
  print $0
}
' src/components/BillingTerminalView.tsx > temp_BillingTerminalView.tsx
mv temp_BillingTerminalView.tsx src/components/BillingTerminalView.tsx
