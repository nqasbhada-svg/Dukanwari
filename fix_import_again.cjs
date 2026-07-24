const fs = require('fs');

let content = fs.readFileSync('src/components/BillingTerminalView.tsx', 'utf8');

// Remove it from motion/react
content = content.replace("import {\n  FileText,\n  motion, AnimatePresence } from 'motion/react';", "import { motion, AnimatePresence } from 'motion/react';");

// Add it to lucide-react
if (!content.includes("FileText } from 'lucide-react'") && !content.includes("FileText,")) {
  content = content.replace(/import \{\s*Search,\s*Plus,/, 'import { \n  FileText,\n  Search,\n  Plus,');
}

fs.writeFileSync('src/components/BillingTerminalView.tsx', content);
