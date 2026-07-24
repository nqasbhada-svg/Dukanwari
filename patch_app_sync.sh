cat << 'INNER_EOF' > /tmp/app_sync_patch.js
const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /onUpdateSettings=\{\(newSettings\) => setShopSettings\(newSettings\)\}/,
  'onUpdateSettings={(newSettings) => setShopSettings(newSettings)}\n                      onSyncAll={triggerSupabaseSync}'
);

fs.writeFileSync('src/App.tsx', content);
INNER_EOF
node /tmp/app_sync_patch.js
