const fs = require('fs');

let content = fs.readFileSync('src/components/BillingTerminalView.tsx', 'utf8');

content = content.replace("import { FileText, motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");

// Make sure FileText is imported from lucide-react
if (!content.includes("FileText,") && !content.includes("FileText } from 'lucide-react'")) {
  content = content.replace(/import \{\s*/, 'import {\n  FileText,\n  ');
}

fs.writeFileSync('src/components/BillingTerminalView.tsx', content);
