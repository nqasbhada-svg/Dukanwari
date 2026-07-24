/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  FileText, 
  Store, 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertTriangle,
  Award,
  Users,
  Search,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Save,
  Check,
  Copy
} from 'lucide-react';
import { ShopRegistration } from '../types';

interface AdminApprovalViewProps {
  registrations: ShopRegistration[];
  onUpdateStatus: (
    id: string, 
    status: 'Pending' | 'Active' | 'Rejected' | 'MoreInfoNeeded',
    subscriptionUpdate?: {
      subscriptionType: 'Lifetime' | '1 Month' | '3 Months' | '6 Months' | '1 Year' | 'Custom';
      startDate: string;
      endDate?: string;
    },
    notes?: string
  ) => void;
  isMr: boolean;
}

export default function AdminApprovalView({ registrations, onUpdateStatus, isMr }: AdminApprovalViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReg, setSelectedReg] = useState<ShopRegistration | null>(registrations[0] || null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Keep selectedReg in sync when registrations load or change
  React.useEffect(() => {
    if (!selectedReg && registrations.length > 0) {
      setSelectedReg(registrations[0]);
      setNotesText(registrations[0].subscription.notes || '');
      setSubType(registrations[0].subscription.subscriptionType);
      if (registrations[0].subscription.startDate) {
        setStartDate(registrations[0].subscription.startDate);
      }
      if (registrations[0].subscription.endDate) {
        setEndDate(registrations[0].subscription.endDate);
      }
    }
  }, [registrations, selectedReg]);

  // Interactive Review States (Form values to configure active subscription)
  const [subType, setSubType] = useState<'Lifetime' | '1 Month' | '3 Months' | '6 Months' | '1 Year' | 'Custom'>('1 Year');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [notesText, setNotesText] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [showApprovalSuccess, setShowApprovalSuccess] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Handle setting corresponding end date based on type
  const handleSubTypeChange = (type: 'Lifetime' | '1 Month' | '3 Months' | '6 Months' | '1 Year' | 'Custom') => {
    setSubType(type);
    const sDate = new Date(startDate);
    if (type === '1 Month') {
      sDate.setMonth(sDate.getMonth() + 1);
      setEndDate(sDate.toISOString().split('T')[0]);
    } else if (type === '3 Months') {
      sDate.setMonth(sDate.getMonth() + 3);
      setEndDate(sDate.toISOString().split('T')[0]);
    } else if (type === '6 Months') {
      sDate.setMonth(sDate.getMonth() + 6);
      setEndDate(sDate.toISOString().split('T')[0]);
    } else if (type === '1 Year') {
      sDate.setFullYear(sDate.getFullYear() + 1);
      setEndDate(sDate.toISOString().split('T')[0]);
    } else {
      // Lifetime or Custom
      setEndDate('');
    }
  };

  const handleApplyAction = (status: 'Active' | 'Rejected' | 'MoreInfoNeeded') => {
    if (!selectedReg) return;

    const subscriptionUpdate = status === 'Active' ? {
      subscriptionType: subType,
      startDate: startDate,
      endDate: subType === 'Lifetime' ? undefined : endDate
    } : undefined;

    onUpdateStatus(selectedReg.id, status, subscriptionUpdate, notesText || undefined);

    setActionSuccessMsg(
      status === 'Active' 
        ? (isMr ? 'दुकान यशस्वीरित्या मंजूर आणि सक्रिय केले!' : 'Shop successfully approved and activated!')
        : status === 'Rejected'
        ? (isMr ? 'नोंदणी अर्ज नाकारला गेला.' : 'Registration rejected.')
        : (isMr ? 'अधिक माहितीसाठी विनंती पाठविली.' : 'Information request sent.')
    );

    if (status === 'Active') {
      // Show celebration modal with login details
      setShowApprovalSuccess({
        ...selectedReg,
        subscription: {
          ...selectedReg.subscription,
          subscriptionType: subType,
          startDate: startDate,
          endDate: subType === 'Lifetime' ? undefined : endDate
        }
      });
    }

    setTimeout(() => {
      setActionSuccessMsg('');
    }, 4000);
  };

  // Filter & Search
  const filteredRegs = registrations.filter(reg => {
    const matchesSearch = 
      reg.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.mobile.includes(searchTerm) ||
      reg.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && reg.subscription.status === filterStatus;
  });

  // Helper colors for status badges
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} /> {isMr ? 'सक्रिय' : 'Active'}
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle size={12} /> {isMr ? 'नाकारले' : 'Rejected'}
          </span>
        );
      case 'MoreInfoNeeded':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <HelpCircle size={12} /> {isMr ? 'माहिती हवी' : 'More Info Req'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <Clock size={12} /> {isMr ? 'प्रलंबित' : 'Pending Review'}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-2xl -z-10"></div>
        
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/15 text-indigo-400 text-[10px] font-bold uppercase rounded font-mono">
              Software Owner Console
            </span>
            <span className="text-slate-500 text-xs">•</span>
            <span className="text-slate-400 text-xs">{registrations.length} total applications</span>
          </div>
          <h2 className="text-lg md:text-xl font-black font-display tracking-tight text-white flex items-center gap-2">
            🛡️ {isMr ? 'कपड्यांचे दालन नोंदणी नियंत्रण केंद्र' : 'Shop Registration Review Center'}
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            {isMr 
              ? 'नवीन नोंदणीकृत दुकानदारांच्या दस्तऐवजांचे पुनरावलोकन करा, त्यांची ओळख पडताळणी करा आणि सदस्यत्व वैधता नियुक्त करून खाते सक्रिय करा.'
              : 'Review submitted registrations, verify owner uploaded legal documents, approve/reject access rights and assign software licenses.'}
          </p>
        </div>
      </div>

      {/* Main Review Dashboard layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Registrations List Queue (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-4 max-h-[750px]">
          
          {/* List Toolbar Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
              <input 
                type="text" 
                placeholder={isMr ? "दुकान, मालक किंवा शहर शोधा..." : "Search shop, owner, city..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 text-xs border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none text-slate-100"
              />
            </div>

            {/* Quick Status Buttons */}
            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
              {['all', 'Pending', 'Active', 'Rejected', 'MoreInfoNeeded'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition ${
                    filterStatus === st 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {st === 'all' ? (isMr ? 'सर्व' : 'All') : st}
                </button>
              ))}
            </div>
          </div>

          {/* Registrations List Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredRegs.length > 0 ? (
              filteredRegs.map((reg) => {
                const isSelected = selectedReg?.id === reg.id;
                return (
                  <button
                    key={reg.id}
                    onClick={() => {
                      setSelectedReg(reg);
                      setNotesText(reg.subscription.notes || '');
                      setSubType(reg.subscription.subscriptionType);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                      isSelected 
                        ? 'bg-indigo-950/20 border-indigo-500/60 shadow-inner' 
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="p-2 bg-slate-900 rounded-lg text-slate-400 shrink-0">
                      <Store size={16} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="font-bold text-xs text-slate-200 truncate">{reg.shopName}</h4>
                        {getStatusBadge(reg.subscription.status)}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                        <User size={10} /> {reg.ownerName}
                      </p>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono pt-1">
                        <span>📍 {reg.city}</span>
                        <span>{new Date(reg.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-8 text-center bg-slate-950/30 rounded-xl border border-slate-800/50 space-y-1">
                <AlertTriangle size={20} className="text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-bold">{isMr ? 'एकही नोंदणी सापडली नाही' : 'No applications found'}</p>
                <p className="text-[10px] text-slate-500">{isMr ? 'वेगळे शब्द वापरून शोधा.' : 'Try adjusting your filters.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Registration Review Panel (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-6">
          {selectedReg ? (
            <div className="space-y-6">
              
              {/* Application Details Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{selectedReg.shopName}</h3>
                    {getStatusBadge(selectedReg.subscription.status)}
                  </div>
                  <p className="text-xs text-slate-400">
                    {isMr ? 'नोंदणी क्र:' : 'Registration ID:'} <span className="font-mono font-bold text-slate-300">{selectedReg.id}</span>
                  </p>
                </div>

                <div className="text-xs sm:text-right text-slate-500">
                  <p>{isMr ? 'अर्ज सादर वेळ:' : 'Received on:'}</p>
                  <p className="font-mono text-slate-400 font-bold">{new Date(selectedReg.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {actionSuccessMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl flex items-center gap-2 animate-bounce">
                  <CheckCircle2 size={16} /> {actionSuccessMsg}
                </div>
              )}

              {/* Data Grid fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                
                {/* Business Information Card */}
                <div className="space-y-2 p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                  <h4 className="font-bold text-indigo-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Store size={12} /> {isMr ? 'व्यावसायिक तपशील' : 'Business Info'}
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between border-b border-slate-800 pb-1 text-[11px]"><span className="text-slate-500">{isMr ? 'दुकानदार:' : 'Owner Full Name:'}</span> <strong className="text-slate-200">{selectedReg.ownerName}</strong></div>
                    <div className="flex justify-between border-b border-slate-800 pb-1 text-[11px]"><span className="text-slate-500">{isMr ? 'मोबाईल नंबर:' : 'Mobile Number:'}</span> <strong className="text-slate-200 font-mono">{selectedReg.mobile}</strong></div>
                    <div className="flex justify-between border-b border-slate-800 pb-1 text-[11px]"><span className="text-slate-500">{isMr ? 'ईमेल पत्ता:' : 'Email Address:'}</span> <strong className="text-slate-200 truncate max-w-[130px]">{selectedReg.email}</strong></div>
                    <div className="flex justify-between border-b border-slate-800 pb-1 text-[11px]"><span className="text-slate-500">{isMr ? 'जीएसटी (GSTIN):' : 'GST Number:'}</span> <strong className="text-slate-200 font-mono">{selectedReg.gstNumber || 'N/A'}</strong></div>
                    <div className="flex justify-between text-[11px]"><span className="text-slate-500">{isMr ? 'नोंदणी क्रमांक:' : 'Business Reg:'}</span> <strong className="text-slate-200 font-mono">{selectedReg.businessRegNumber || 'N/A'}</strong></div>
                  </div>
                </div>

                {/* Shop Type and Address Card */}
                <div className="space-y-2 p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl">
                  <h4 className="font-bold text-indigo-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={12} /> {isMr ? 'दुकान आणि ठिकाण तपशील' : 'Shop Categorization'}
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between border-b border-slate-800 pb-1 text-[11px]"><span className="text-slate-500">{isMr ? 'दुकान प्रकार:' : 'Clothing Type:'}</span> <strong className="text-slate-200">{selectedReg.shopDetails.shopType}</strong></div>
                    <div className="flex justify-between border-b border-slate-800 pb-1 text-[11px]"><span className="text-slate-500">{isMr ? 'कर्मचारी संख्या:' : 'Staff Size:'}</span> <strong className="text-slate-200 font-mono">{selectedReg.shopDetails.employeesCount}</strong></div>
                    <div className="flex justify-between border-b border-slate-800 pb-1 text-[11px]"><span className="text-slate-500">{isMr ? 'सुरू तारीख:' : 'Opening Date:'}</span> <strong className="text-slate-200 font-mono">{selectedReg.shopDetails.openingDate}</strong></div>
                    <div className="flex justify-between border-b border-slate-800 pb-1 text-[11px]"><span className="text-slate-500">{isMr ? 'पत्ता / शहर:' : 'Location City:'}</span> <strong className="text-slate-200">{selectedReg.city}</strong></div>
                    <div className="flex justify-between text-[11px]"><span className="text-slate-500">{isMr ? 'पिनकोड / राज्य:' : 'Pincode State:'}</span> <strong className="text-slate-200 font-mono">{selectedReg.pincode}, {selectedReg.state}</strong></div>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents List with Preview Link simulation */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-300 uppercase tracking-widest font-mono">
                  📁 {isMr ? 'पडताळणीसाठी दस्तऐवज फायली (Documents)' : 'UPLOADED LEGAL DOCUMENT PROOFS'}
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* ID PROOF */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-300 text-[11px] truncate">{isMr ? 'मालक ओळखपत्र' : 'Owner ID Proof'}</p>
                        <p className="text-[10px] text-slate-500 truncate font-mono">{selectedReg.documents.ownerIdProof}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded font-bold text-[9px] cursor-pointer select-none">
                      {isMr ? 'पहा (View)' : 'Verify'}
                    </span>
                  </div>

                  {/* SHOP PHOTO */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-300 text-[11px] truncate">{isMr ? 'दुकान बाह्य फोटो' : 'Shop Exterior Photo'}</p>
                        <p className="text-[10px] text-slate-500 truncate font-mono">{selectedReg.documents.shopPhoto || 'uploaded_image.jpg'}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded font-bold text-[9px] cursor-pointer select-none">
                      {isMr ? 'पहा (View)' : 'Verify'}
                    </span>
                  </div>

                  {/* LICENSE */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-300 text-[11px] truncate">{isMr ? 'गुमास्ता परवाना' : 'Shop License (Gumasta)'}</p>
                        <p className="text-[10px] text-slate-500 truncate font-mono">{selectedReg.documents.shopLicense || 'not_provided.pdf'}</p>
                      </div>
                    </div>
                    {selectedReg.documents.shopLicense ? (
                      <span className="px-2 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded font-bold text-[9px] cursor-pointer select-none">
                        {isMr ? 'पहा (View)' : 'Verify'}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-600 italic font-mono">None</span>
                    )}
                  </div>

                  {/* GST */}
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-300 text-[11px] truncate">{isMr ? 'जीएसटी प्रमाणपत्र' : 'GST Certificate'}</p>
                        <p className="text-[10px] text-slate-500 truncate font-mono">{selectedReg.documents.gstCertificate || 'not_provided.pdf'}</p>
                      </div>
                    </div>
                    {selectedReg.documents.gstCertificate ? (
                      <span className="px-2 py-0.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded font-bold text-[9px] cursor-pointer select-none">
                        {isMr ? 'पहा (View)' : 'Verify'}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-600 italic font-mono">None</span>
                    )}
                  </div>

                </div>
              </div>

              {/* ADMIN ACTION WORKFLOW INTERFACE */}
              <div className="space-y-4 p-4 md:p-5 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <h4 className="font-bold text-xs text-white uppercase tracking-widest font-mono flex items-center gap-2">
                  <ShieldAlert size={14} className="text-amber-500" />
                  {isMr ? 'निर्णय आणि सक्रियता पॅनेल' : 'ADMIN APPROVAL & ACTIVATION WORKFLOW'}
                </h4>

                {/* Subscription Settings Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  
                  {/* Select Subscription Type */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{isMr ? 'सदस्यत्व प्रकार (Type)' : 'Select Subscription'}</label>
                    <select
                      value={subType}
                      onChange={(e) => handleSubTypeChange(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 outline-none text-white text-xs"
                    >
                      <option value="Lifetime">{isMr ? 'Lifetime (आजीवन)' : 'Lifetime'}</option>
                      <option value="1 Month">1 Month</option>
                      <option value="3 Months">3 Months</option>
                      <option value="6 Months">6 Months</option>
                      <option value="1 Year">1 Year</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{isMr ? 'प्रारंभ तारीख (Start Date)' : 'Set Start Date'}</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 outline-none text-white text-xs font-mono"
                    />
                  </div>

                  {/* Expiry Date (except Lifetime) */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{isMr ? 'समाप्ती तारीख (Expiry Date)' : 'Set Expiry Date'}</label>
                    <input
                      type="date"
                      disabled={subType === 'Lifetime'}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 outline-none text-white text-xs font-mono disabled:opacity-40"
                    />
                  </div>
                </div>

                {/* Notes or instructions */}
                <div className="space-y-1 text-xs">
                  <label className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                    {isMr ? 'निर्णय टिपणी / संदेश (Notes)' : 'Internal Audit / Owner Notes / Rejection Reason'}
                  </label>
                  <textarea
                    rows={2}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    placeholder={isMr ? "उदा. योग्य ओळखपत्रांसह मंजूर केले. खाते सक्रिय आहे." : "e.g. Identity verified. Activating lifetime product shop package."}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 outline-none text-white text-xs leading-relaxed"
                  />
                </div>

                {/* Button actions for the admin */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  
                  {/* Approve Action */}
                  <button
                    id="admin-approve-action-btn"
                    type="button"
                    onClick={() => handleApplyAction('Active')}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/15"
                  >
                    <CheckCircle2 size={14} /> {isMr ? 'खाते मंजूर करा (Approve)' : 'Approve & Activate Shop'}
                  </button>

                  {/* Request Info Action */}
                  <button
                    id="admin-request-info-action-btn"
                    type="button"
                    onClick={() => handleApplyAction('MoreInfoNeeded')}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-indigo-300 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <HelpCircle size={14} /> {isMr ? 'माहिती मागवा' : 'Request Info'}
                  </button>

                  {/* Reject Action */}
                  <button
                    id="admin-reject-action-btn"
                    type="button"
                    onClick={() => handleApplyAction('Rejected')}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-rose-950/40 text-rose-400 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={14} /> {isMr ? 'अर्ज नाकारा (Reject)' : 'Reject App'}
                  </button>

                </div>

              </div>

            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center text-slate-500 space-y-2">
              <Store size={36} className="text-slate-700 animate-pulse" />
              <p className="text-xs font-bold">{isMr ? 'पुनरावलोकनासाठी नोंदणी निवडा' : 'No registration selected'}</p>
              <p className="text-[10px] text-slate-600">{isMr ? 'डाव्या सूचीमधून दुकान अर्ज निवडा.' : 'Click any shop on the left queue to review.'}</p>
            </div>
          )}
        </div>

      </div>

      {/* GORGEOUS COLOURFUL APPROVAL SUCCESS MODAL */}
      {showApprovalSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden border border-indigo-500/30 rounded-3xl p-6 md:p-8 bg-gradient-to-b from-[#110d29] to-[#080514] text-slate-100 shadow-2xl glow-indigo animate-in fade-in zoom-in-95 duration-200">
            {/* Colorful background glow items */}
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>

            {/* Sparkles celebration animation elements */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-full text-white shadow-lg shadow-indigo-500/30">
                <Sparkles size={32} className="animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl md:text-2xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300">
                  {isMr ? '🎉 दुकान यशस्वीरित्या मंजूर!' : '🎉 Shop Successfully Approved!'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isMr ? 'सॉफ्टवेअर परवाना आणि लॉगिन तपशील तयार करण्यात आले आहेत.' : 'Software license and login credentials are now active.'}
                </p>
              </div>

              {/* Shop info card */}
              <div className="w-full bg-[#151035]/50 border border-indigo-500/10 rounded-2xl p-4 text-left space-y-3">
                <div className="flex justify-between border-b border-indigo-500/10 pb-2 text-xs">
                  <span className="text-slate-400">{isMr ? 'दुकान नाव:' : 'Shop Name:'}</span>
                  <strong className="text-white text-right">{showApprovalSuccess.shopName}</strong>
                </div>
                <div className="flex justify-between border-b border-indigo-500/10 pb-2 text-xs">
                  <span className="text-slate-400">{isMr ? 'मालक नाव:' : 'Owner Name:'}</span>
                  <strong className="text-white text-right">{showApprovalSuccess.ownerName}</strong>
                </div>
                <div className="flex justify-between border-b border-indigo-500/10 pb-2 text-xs">
                  <span className="text-slate-400">{isMr ? 'परवाना कालावधी:' : 'License Period:'}</span>
                  <strong className="text-indigo-400 text-right">{showApprovalSuccess.subscription?.subscriptionType || '1 Year'}</strong>
                </div>

                {/* Login details section */}
                <div className="p-3 bg-slate-950/70 border border-indigo-500/20 rounded-xl space-y-2 mt-2">
                  <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest font-mono">
                    🔑 {isMr ? 'दुकानदार लॉगिन माहिती' : 'OWNER LOGIN CREDENTIALS'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500">{isMr ? 'युझरनेम:' : 'Username:'}</span>
                      <p className="text-slate-200 font-bold break-all bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-500/10">{showApprovalSuccess.loginInfo?.username}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-500">{isMr ? 'पासवर्ड:' : 'Password:'}</span>
                      <p className="text-slate-200 font-bold break-all bg-indigo-950/20 px-1.5 py-0.5 rounded border border-indigo-500/10">{showApprovalSuccess.loginInfo?.password}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="w-full flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const msg = isMr 
                      ? `*अभिनंदन! तुमचे दुकान मंजूर झाले आहे!* 🎉\n\n🏪 *दुकान*: ${showApprovalSuccess.shopName}\n🔑 *युझरनेम*: ${showApprovalSuccess.loginInfo?.username}\n🔒 *पासवर्ड*: ${showApprovalSuccess.loginInfo?.password}\n📅 *परवाना*: ${showApprovalSuccess.subscription?.subscriptionType || '1 Year'}\n\nबिले आणि स्टॉक व्यवस्थापित करण्यासाठी आत्ताच लॉगिन करा!`
                      : `*Congratulations! Your Shop is Approved!* 🎉\n\n🏪 *Shop Name*: ${showApprovalSuccess.shopName}\n🔑 *Username*: ${showApprovalSuccess.loginInfo?.username}\n🔒 *Password*: ${showApprovalSuccess.loginInfo?.password}\n📅 *License*: ${showApprovalSuccess.subscription?.subscriptionType || '1 Year'}\n\nStart logging in to manage your bills and stock!`;
                    navigator.clipboard.writeText(msg);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-md ${
                    copied 
                      ? 'bg-emerald-600 text-white shadow-emerald-600/20' 
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied 
                    ? (isMr ? 'कॉपी केले! 👍' : 'Copied Success! 👍') 
                    : (isMr ? 'व्हॉट्सॲप मेसेज कॉपी करा' : 'Copy Message for WhatsApp')}
                </button>

                <button
                  type="button"
                  onClick={() => setShowApprovalSuccess(null)}
                  className="py-2.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition"
                >
                  {isMr ? 'बंद करा' : 'Close'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
