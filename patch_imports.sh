cat << 'INNER_EOF' > /tmp/patch_imports.js
const fs = require('fs');
let content = fs.readFileSync('src/components/BillingTerminalView.tsx', 'utf8');

if (!content.includes('FileText,')) {
  content = content.replace(/import \{/, 'import { FileText,');
  fs.writeFileSync('src/components/BillingTerminalView.tsx', content);
}
INNER_EOF
node /tmp/patch_imports.js
