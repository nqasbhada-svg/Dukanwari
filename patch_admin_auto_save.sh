cat << 'INNER_EOF' > /tmp/admin_auto_save_patch.js
const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// We need to inject a useEffect that listens to all the state variables
// and if autoSave is true, it calls onUpdateSettings and onSyncAll

const useEffectCode = `
  // Auto-Save Effect
  useEffect(() => {
    if (autoSave) {
      // Create a debounce so it doesn't fire on every single keystroke if possible,
      // but the requirement says "immediately", so we can just fire it on a small timeout or directly.
      const timer = setTimeout(() => {
        onUpdateSettings({
          ...settings,
          shopName,
          shopNameMr,
          address,
          addressMr,
          mobile,
          whatsapp,
          gstNumber,
          enableGstBilling,
          thermalPrinterWidth,
          whatsappApiToken,
          templateInvoice,
          templateReminder,
          templateOffer,
          autoSave
        });
        
        // Immediately trigger Supabase sync
        if (onSyncAll) {
          onSyncAll();
        }
      }, 500); // 500ms debounce to avoid excessive writes while typing
      return () => clearTimeout(timer);
    }
  }, [
    autoSave, shopName, shopNameMr, address, addressMr, mobile, whatsapp, 
    gstNumber, enableGstBilling, thermalPrinterWidth, whatsappApiToken,
    templateInvoice, templateReminder, templateOffer
  ]);
`;

// Insert after the existing useEffects (e.g. after runResolution)
content = content.replace(
  /const handleSaveSettings = \(e: React\.FormEvent\) => {/,
  useEffectCode + '\n  const handleSaveSettings = (e: React.FormEvent) => {'
);

// We need to add the autoSave field to handleSaveSettings as well
content = content.replace(
  /templateOffer\n    }\);/,
  'templateOffer,\n      autoSave\n    });'
);

const autoSaveToggleCode = `
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <Settings size={18} className="text-indigo-600" />
              {isMr ? 'पॅनेल व्यवस्थापित करा' : 'Administration Panel'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-600">{isMr ? 'ऑटो-सेव्ह' : 'Auto-Save'}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={autoSave} onChange={(e) => {
                setAutoSave(e.target.checked);
              }} />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
`;

content = content.replace(
  /\{\/\* Main Content Area \(3 Columns\) \*\/\}\s*<div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200">/,
  '{/* Main Content Area (3 Columns) */}\n      <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200">\n' + autoSaveToggleCode
);

// Add Settings icon import if not present
if (!content.includes('Settings,')) {
  content = content.replace(/import { /, 'import { Settings, ');
}

fs.writeFileSync('src/components/AdminPanel.tsx', content);
INNER_EOF
node /tmp/admin_auto_save_patch.js
