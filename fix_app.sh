cat << 'INNER_EOF' > /tmp/fix_app.js
const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  /onSyncAll=\{triggerSupabaseSync\}\n/,
  ''
);

fs.writeFileSync('src/App.tsx', content);
INNER_EOF
node /tmp/fix_app.js
