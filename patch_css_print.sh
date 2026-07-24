awk '/@media print/ { exit } { print }' src/index.css > temp_index.css

cat << 'INNER_EOF' >> temp_index.css

@media print {
  @page {
    size: A4 portrait;
    margin: 0;
  }

  html, body {
    width: 210mm !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    background-color: white !important;
    color: black !important;
  }

  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Hide everything except the modal receipt */
  body > div#root {
    display: block !important;
    background: white !important;
  }
  
  /* Hide all buttons and UI controls */
  button, header, nav, .sidebar {
    display: none !important;
  }

  /* Scale the invoice preview to fit the A4 page nicely */
  /* A4 is 210mm wide. 380px scaled by ~2 fits nicely */
  #invoice-preview-modal-area {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 380px !important;
    max-width: 380px !important;
    margin: 0 !important;
    padding: 20px !important;
    transform: scale(2.0) !important;
    transform-origin: top left !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    z-index: 9999 !important;
    background-color: white !important;
  }

  /* The public A4 preview is already A4 sized (max-w-2xl ~ 672px) */
  #public-invoice-a4 {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 210mm !important;
    max-width: 210mm !important;
    margin: 0 !important;
    padding: 15mm !important;
    border: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    z-index: 9999 !important;
    background-color: white !important;
  }
  
  /* Hide the rest of the UI when printing */
  .fixed.inset-0.z-50 {
    position: static !important;
    background: white !important;
    backdrop-filter: none !important;
  }
  
  /* Hide background elements of the modal */
  .fixed.inset-0 > div:not(div) {
    display: none !important;
  }
}
INNER_EOF

mv temp_index.css src/index.css
