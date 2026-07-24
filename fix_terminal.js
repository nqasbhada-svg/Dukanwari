const fs = require('fs');

let content = fs.readFileSync('src/components/BillingTerminalView.tsx', 'utf8');

// 1. Remove the wrongly injected wrapper inside useEffect
const badWrapper = `  return (
    <div className="flex flex-col gap-4">
      {/* Tab Switcher */}
      <div className="flex bg-white p-1.5 rounded-2xl w-max shadow-sm border border-slate-100 print-hidden">
        <button
          onClick={() => setActiveTerminalTab("terminal")}
          className={\`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all \${
            activeTerminalTab === "terminal" 
              ? "bg-indigo-600 text-white shadow-md" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }\`}
        >
          {isMr ? "बिलिंग टर्मिनल" : "Billing Terminal"}
        </button>
        <button
          onClick={() => setActiveTerminalTab("recent")}
          className={\`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all \${
            activeTerminalTab === "recent" 
              ? "bg-indigo-600 text-white shadow-md" 
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }\`}
        >
          {isMr ? "अलीकडील बिले" : "Recent Invoices"}
        </button>
      </div>

      {activeTerminalTab === "terminal" && (`;

content = content.replace(badWrapper, "    return () => window.removeEventListener('keydown', handleKeyDown);");

// 2. Also remove the wrongly injected closing tag if it exists. Wait, where was it injected?
// The AWK script looked for "  );" to inject the closing tag.
// The `useEffect` has `  }, []);`, not `  );`. Let's see if the closing tag was injected at all.
