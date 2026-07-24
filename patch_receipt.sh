#!/bin/bash
cat << 'INNER_EOF' > /tmp/receipt_content.txt
              <div id="invoice-preview-modal-area" className="w-full max-w-[380px] bg-white border border-slate-200 rounded-xl shadow-sm p-6 text-slate-800 relative font-sans overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500"></div>
                <div className="text-center space-y-1 mb-6 mt-2">
                  <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 uppercase">{shopSettings.shopName}</h2>
                  <p className="text-xs text-slate-500 font-medium">{shopSettings.address}</p>
                  {shopSettings.gstNumber && <p className="text-[10px] font-bold text-indigo-600 mt-1">GSTIN: {shopSettings.gstNumber}</p>}
                </div>

                <div className="bg-slate-50 rounded-lg p-3 mb-5 border border-slate-100 flex justify-between items-center text-[10px]">
                  <div>
                    <p className="text-slate-500 font-semibold mb-0.5">Billed To</p>
                    <p className="font-bold text-slate-800 text-xs">{activeInvoice.customerName || 'Walk-in Customer'}</p>
                    {activeInvoice.customerMobile && <p className="text-slate-500 mt-0.5">+91 {activeInvoice.customerMobile}</p>}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-900">Invoice: {activeInvoice.invoiceNumber}</p>
                    <p className="text-slate-500 font-medium mt-0.5">{activeInvoice.date}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 font-bold rounded text-[8px] uppercase">{activeInvoice.type} BILL</span>
                  </div>
                </div>

                <div className="space-y-1 mb-5">
                  <div className="grid grid-cols-4 font-bold text-slate-500 uppercase text-[9px] border-b-2 border-slate-100 pb-2 mb-2">
                    <span className="col-span-2">Item</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Total</span>
                  </div>
                  {activeInvoice.items.map((it, idx) => (
                    <div key={idx} className="grid grid-cols-4 py-1 items-center border-b border-slate-50 last:border-0 pb-1.5">
                      <div className="col-span-2">
                        <p className="font-bold text-slate-800 text-xs">{it.itemName}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">₹{it.rate} {it.gstPercent > 0 ? `(+${it.gstPercent}% GST)` : ''}</p>
                      </div>
                      <span className="text-center font-semibold text-slate-600 text-xs">{it.quantity}</span>
                      <span className="text-right font-extrabold text-slate-900 text-xs">₹{it.total}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>Subtotal</span>
                    <span>₹{activeInvoice.subtotal}</span>
                  </div>
                  {activeInvoice.discount > 0 && (
                    <div className="flex justify-between text-[11px] text-emerald-600 font-bold">
                      <span>Discount</span>
                      <span>-₹{activeInvoice.discount}</span>
                    </div>
                  )}
                  {activeInvoice.taxAmount > 0 && (
                    <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                      <span>Tax Amount</span>
                      <span>₹{activeInvoice.taxAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-extrabold text-sm border-t border-slate-200 pt-2 text-indigo-900">
                    <span>Grand Total</span>
                    <span>₹{activeInvoice.grandTotal}</span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                  <p className="font-extrabold text-slate-800 text-[10px] uppercase tracking-wide">Thank you for your business!</p>
                  <p className="text-[9px] text-slate-400 mt-1">Payment Mode: <span className="font-bold text-slate-500">{activeInvoice.paymentMode}</span></p>
                </div>
              </div>
INNER_EOF
