import re

with open('src/components/BillingTerminalView.tsx', 'r') as f:
    content = f.read()

with open('/tmp/receipt_content.txt', 'r') as f:
    new_receipt = f.read()

# find the div block
pattern = re.compile(r'<div id="invoice-preview-modal-area".*?</div>\s*</div>\s*</div>\s*</div>', re.DOTALL)
# actually, it's easier to replace exact string or just a specific known portion.
