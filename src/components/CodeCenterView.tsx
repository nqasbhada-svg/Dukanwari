/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FolderTree, 
  FileCode, 
  Copy, 
  Download, 
  Check, 
  Database, 
  ChevronRight, 
  Layout, 
  Layers 
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../data/supabaseCode';
import { FLUTTER_PROJECT_STRUCTURE, FLUTTER_FILE_KEY } from '../data/flutterCode';

interface CodeCenterViewProps {
  isMr: boolean;
}

export default function CodeCenterView({ isMr }: CodeCenterViewProps) {
  // Tabs: 'supabase', 'flutter'
  const [activeExporterTab, setActiveExporterTab] = useState<'supabase' | 'flutter'>('supabase');

  // Flutter file explorer state
  const [selectedFlutterFile, setSelectedFlutterFile] = useState<FLUTTER_FILE_KEY>('lib/main.dart');

  // Copy feedbacks
  const [copiedSupabase, setCopiedSupabase] = useState(false);
  const [copiedFlutter, setCopiedFlutter] = useState(false);

  const handleCopy = (text: string, type: 'sql' | 'flutter') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSupabase(true);
      setTimeout(() => setCopiedSupabase(false), 2000);
    } else {
      setCopiedFlutter(true);
      setTimeout(() => setCopiedFlutter(false), 2000);
    }
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs text-slate-700">
      
      {/* Exporter selector menu sidebar (1 Column) */}
      <div className="space-y-4">
        {/* Main Tab selector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
          <h4 className="font-bold text-slate-400 uppercase tracking-wider font-mono mb-2">Platform Selection</h4>
          
          <button
            onClick={() => setActiveExporterTab('supabase')}
            className={`w-full text-left p-3 rounded-lg font-bold flex items-center gap-2 transition ${activeExporterTab === 'supabase' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <Database size={14} />
            Supabase PostgreSQL DB Schema
          </button>

          <button
            onClick={() => setActiveExporterTab('flutter')}
            className={`w-full text-left p-3 rounded-lg font-bold flex items-center gap-2 transition ${activeExporterTab === 'flutter' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-50 text-slate-500'}`}
          >
            <Layout size={14} />
            Flutter Mobile Code Files
          </button>
        </div>

        {/* Flutter Project Folder Tree explorer (Renders only if activeTab is flutter) */}
        {activeExporterTab === 'flutter' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1.5 mb-2">
              <FolderTree size={14} className="text-slate-400" />
              Flutter Folder Tree
            </h4>

            <div className="space-y-1 divide-y divide-slate-50 max-h-[300px] overflow-y-auto pr-1 text-[11px]">
              {Object.keys(FLUTTER_PROJECT_STRUCTURE).map((key) => {
                const parts = key.split('/');
                const filename = parts[parts.length - 1];
                const isSelected = selectedFlutterFile === key;

                return (
                  <button
                    key={key}
                    onClick={() => setSelectedFlutterFile(key as FLUTTER_FILE_KEY)}
                    className={`w-full text-left p-2 rounded-md font-medium flex items-center justify-between gap-1 transition ${isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-600'}`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <FileCode size={12} className={isSelected ? 'text-indigo-600' : 'text-slate-400'} />
                      <span className="truncate">{key}</span>
                    </span>
                    <ChevronRight size={10} className="text-slate-300" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Code Editor Panel (3 Columns) */}
      <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
        
        {/* Exporter Info header */}
        <div className="flex justify-between items-center flex-wrap gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              {activeExporterTab === 'supabase' ? 'Supabase cloud schema.sql exporter' : `Flutter Clean-Architecture: ${selectedFlutterFile}`}
            </h3>
            <p className="text-slate-500 text-xs">
              {activeExporterTab === 'supabase' 
                ? 'Create tables, index, auto-stock triggers, and JWT role RLS rules in Supabase' 
                : 'Copy or export dart cleaner file to build Flutter Android / iOS client.'
              }
            </p>
          </div>

          <div className="flex gap-2">
            {/* Copy button */}
            <button
              id="cc-copy-btn"
              onClick={() => handleCopy(
                activeExporterTab === 'supabase' ? SUPABASE_SQL_SCHEMA : FLUTTER_PROJECT_STRUCTURE[selectedFlutterFile], 
                activeExporterTab === 'supabase' ? 'sql' : 'flutter'
              )}
              className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-lg px-3 py-1.5 transition text-xs"
            >
              {activeExporterTab === 'supabase' ? (
                copiedSupabase ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />
              ) : (
                copiedFlutter ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />
              )}
              {activeExporterTab === 'supabase' ? (copiedSupabase ? 'Copied SQL' : 'Copy SQL') : (copiedFlutter ? 'Copied File' : 'Copy Code')}
            </button>

            {/* Download Button */}
            <button
              id="cc-download-btn"
              onClick={() => handleDownload(
                activeExporterTab === 'supabase' ? 'supabase_schema.sql' : selectedFlutterFile.split('/').pop() || 'file.dart',
                activeExporterTab === 'supabase' ? SUPABASE_SQL_SCHEMA : FLUTTER_PROJECT_STRUCTURE[selectedFlutterFile]
              )}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg px-4 py-1.5 transition text-xs shadow-lg shadow-indigo-600/15"
            >
              <Download size={14} />
              {activeExporterTab === 'supabase' ? 'Download SQL' : 'Download Dart File'}
            </button>
          </div>
        </div>

        {/* Mock Code Editor layout with monospace code */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-900/60 font-mono text-[11px] leading-relaxed text-indigo-100 overflow-x-auto h-[480px]">
          <pre className="whitespace-pre">
            {activeExporterTab === 'supabase' ? SUPABASE_SQL_SCHEMA : FLUTTER_PROJECT_STRUCTURE[selectedFlutterFile]}
          </pre>
        </div>

        {/* Sync & architecture details explanation banner */}
        <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/60 flex items-center gap-3">
          <Layers className="text-indigo-600 shrink-0" size={18} />
          <span className="text-[10px] text-indigo-950 leading-relaxed font-medium">
            <strong>Architecture Notice:</strong> The Dart codebase is designed strictly based on the <strong>Clean Architecture (Domain, Data, Presentation)</strong> layer layout, utilizing <strong>Riverpod</strong> for State Management and <strong>flutter_secure_storage</strong> for transient offline caching only. permanent offline SQLite/Hive stores are omitted intentionally to ensure 100% security alignment with Supabase Cloud databases.
          </span>
        </div>

      </div>
    </div>
  );
}
