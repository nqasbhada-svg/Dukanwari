cat << 'INNER_EOF' >> src/index.css

@media print {
  /* Scale the modal preview to fit better on A4 */
  #invoice-preview-modal-area {
    width: 380px !important;
    max-width: 380px !important;
    transform: scale(1.8);
    transform-origin: top left;
    margin-left: 15mm !important;
    margin-top: 15mm !important;
    border: none !important;
    box-shadow: none !important;
  }
}
INNER_EOF
