cat << 'INNER_EOF' > /tmp/patch_buttons.js
const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace(
  /<button\n\s*id="save-admin-settings-btn"/g,
  '{!autoSave && <button\n              id="save-admin-settings-btn"'
).replace(
  /Save Config & Settings\n\s*<\/button>/,
  'Save Config & Settings\n            </button>}'
);

content = content.replace(
  /<button\n\s*id="save-whatsapp-templates-btn"/g,
  '{!autoSave && <button\n                      id="save-whatsapp-templates-btn"'
).replace(
  /Save Templates & Layout'}\n\s*<\/button>/,
  "Save Templates & Layout'}\n                    </button>}"
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
INNER_EOF
node /tmp/patch_buttons.js
