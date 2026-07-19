/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Store, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  LogOut, 
  Sparkles, 
  Tv, 
  Printer, 
  Barcode, 
  MessageSquare,
  BookmarkCheck,
  FileText
} from 'lucide-react';
import { ShopRegistration } from '../types';

interface ShopOwnerStatusDashboardProps {
  registration: ShopRegistration;
  onLogout: () => void;
  isMr: boolean;
}

export default function ShopOwnerStatusDashboard({ registration, onLogout, isMr }: ShopOwnerStatusDashboardProps) {
  const status = registration.subscription.status;

  const getStatusCard = () => {
    switch (status) {
      case 'Rejected':
        return (
          <div className="bg-rose-500/10 border border-rose-500/20 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2.5 text-rose-400">
              <XCircle size={20} className="shrink-0" />
              <h3 className="font-black text-sm uppercase tracking-wider">
                {isMr ? 'नोंदणी अर्ज नाकारला गेला' : 'REGISTRATION REJECTED'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isMr 
                ? 'तुमचा नोंदणी अर्ज आवश्यक निकष पूर्ण न केल्यामुळे नाकारला गेला आहे. अधिक माहितीसाठी खालील टिपणी वाचा किंवा प्रशासकांशी संपर्क साधा.'
                : 'Your shop registration application was rejected by the Software Owner / Admin. Please review the feedback notes below.'}
            </p>
            {registration.subscription.notes && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-rose-500/10 text-xs text-rose-300 font-mono">
                <span className="font-bold text-[10px] text-rose-400 block mb-1">📢 Admin Feedback Notes:</span>
                "{registration.subscription.notes}"
              </div>
            )}
          </div>
        );

      case 'MoreInfoNeeded':
        return (
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2.5 text-indigo-400">
              <AlertTriangle size={20} className="shrink-0" />
              <h3 className="font-black text-sm uppercase tracking-wider">
                {isMr ? 'अधिक माहिती / दस्तऐवज आवश्यक' : 'ACTION REQUIRED: MORE INFO NEEDED'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isMr 
                ? 'प्रशासकांनी तुमच्या नोंदणी अर्जाची पडताळणी केली आहे, परंतु प्रक्रियेसाठी अतिरिक्त दस्तऐवज किंवा स्पष्टीकरण आवश्यक आहे.'
                : 'The system administrator has reviewed your application, but requires more details or alternative document proofs to complete verification.'}
            </p>
            {registration.subscription.notes && (
              <div className="bg-slate-950/60 p-3 rounded-xl border border-indigo-500/10 text-xs text-indigo-300 font-mono">
                <span className="font-bold text-[10px] text-indigo-400 block mb-1">📢 Administrator Query:</span>
                "{registration.subscription.notes}"
              </div>
            )}
            <p className="text-[11px] text-slate-400 italic">
              {isMr 
                ? 'कृपया आवश्यक कागदपत्रे sghipargekar@gmail.com वर पाठवा किंवा सपोर्टशी संपर्क साधा.' 
                : 'Please email the requested files to support or sghipargekar@gmail.com.'}
            </p>
          </div>
        );

      default: // Pending
        return (
          <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-2xl space-y-2">
            <div className="flex items-center gap-2.5 text-amber-400">
              <Clock size={20} className="shrink-0 animate-pulse" />
              <h3 className="font-black text-sm uppercase tracking-wider">
                {isMr ? 'पडताळणी आणि मंजुरी प्रलंबित' : 'APPLICATION UNDER REVIEW'}
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {isMr 
                ? 'तुमची नोंदणी यशस्वीरित्या प्राप्त झाली आहे आणि ती सध्या सॉफ्टवेअर मालकाद्वारे पुनरावलोकनाखाली आहे. तुमचे खाते सक्रिय झाल्यावर तुम्हाला कळविण्यात येईल.'
                : 'Your shop registration is pending activation by the Software Owner / Admin. Once they review and verify your business details, your premium ERP services will boot.'}
            </p>
            <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-[10px] text-slate-400 leading-relaxed">
              <strong>💡 {isMr ? 'नोंद घ्या:' : 'Subscription Activation:'}</strong>{' '}
              {isMr 
                ? 'सदस्यत्व मंजुरी केवळ सॉफ्टवेअर मालकाद्वारे/ॲडमिनद्वारे तपासणीनंतरच सक्रिय केले जाईल.'
                : 'Your account is currently safe but inactive. Subscription will be activated only after approval by the Software Owner/Admin.'}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center relative overflow-x-hidden">
      {/* Decorative ambient blurred blobs */}
      <div className="absolute top-10 left-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -z-10"></div>

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative z-10 flex flex-col">
        
        {/* Header Block */}
        <div className="p-5 md:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-600/20">
              <Store size={22} />
            </div>
            <div>
              <h2 className="font-bold text-white text-base tracking-tight leading-none">{registration.shopName}</h2>
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold mt-1">
                {isMr ? 'व्यापारी नियंत्रण पॅनेल' : 'Vastraa ERP Partner Portal'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-xl text-slate-400 transition flex items-center gap-1.5 text-xs font-bold"
            title="Log Out"
          >
            <LogOut size={14} /> {isMr ? 'लॉगआउट' : 'Log Out'}
          </button>
        </div>

        {/* Core Layout */}
        <div className="p-5 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* LEFT: Verification Status & Summary (7 cols) */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Status card */}
            {getStatusCard()}

            {/* Visual Process Timeline tracker */}
            <div className="p-5 bg-slate-950/50 border border-slate-800/80 rounded-2xl space-y-4">
              <h4 className="font-black text-xs text-indigo-400 uppercase tracking-widest">
                📈 {isMr ? 'खाते सक्रियता प्रगती' : 'ACTIVATION WORKFLOW PROGRESS'}
              </h4>

              <div className="space-y-4">
                
                {/* Step 1: Completed always */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                      <CheckCircle2 size={13} />
                    </div>
                    <div className="w-0.5 h-10 bg-emerald-600"></div>
                  </div>
                  <div className="space-y-0.5 pt-0.5">
                    <p className="text-xs font-bold text-slate-200">{isMr ? 'पायरी १: नोंदणी अर्ज सादर केला' : 'Step 1: Registration Form Submitted'}</p>
                    <p className="text-[10px] text-slate-400">{isMr ? 'कराराच्या अटी यशस्वीरित्या मान्य केल्या.' : 'Business details and agreements signed successfully.'}</p>
                  </div>
                </div>

                {/* Step 2: Underway depending on status */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      status === 'Pending' 
                        ? 'bg-amber-600 text-white animate-pulse'
                        : status === 'MoreInfoNeeded'
                        ? 'bg-indigo-600 text-white'
                        : status === 'Rejected'
                        ? 'bg-rose-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {status === 'Pending' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                    </div>
                    <div className={`w-0.5 h-10 ${status === 'Active' ? 'bg-emerald-600' : 'bg-slate-800'}`}></div>
                  </div>
                  <div className="space-y-0.5 pt-0.5">
                    <p className="text-xs font-bold text-slate-200">
                      {isMr ? 'पायरी २: मालकाद्वारे दस्तऐवज पडताळणी' : 'Step 2: Software Owner Document Verification'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {status === 'Pending' && (isMr ? 'अधिकारी सध्या कागदपत्रांची पडताळणी करत आहेत.' : 'Verification currently underway by the Platform Admin.')}
                      {status === 'MoreInfoNeeded' && (isMr ? 'अतिरिक्त माहितीची मागणी प्रलंबित आहे.' : 'Awaiting additional document details from your end.')}
                      {status === 'Rejected' && (isMr ? 'कागदपत्र पडताळणी नाकारली.' : 'Verification review closed/rejected.')}
                    </p>
                  </div>
                </div>

                {/* Step 3: Activation */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 border border-slate-700 flex items-center justify-center text-xs">
                      {status === 'Active' ? <CheckCircle2 size={12} /> : '3'}
                    </div>
                  </div>
                  <div className="space-y-0.5 pt-0.5">
                    <p className="text-xs font-bold text-slate-500">{isMr ? 'पायरी ३: लायसन्स जनरेशन आणि ईआरपी एक्टिव्हेशन' : 'Step 3: ERP Software Activation'}</p>
                    <p className="text-[10px] text-slate-600">{isMr ? 'मंजुरीनंतर बिले आणि कॅटलॉग सुरू होईल.' : 'Unlocks full inventory, multi-mode cashiers, and GST billing.'}</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT: Profile Info & Setup Checklist (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            
            {/* Submitted Info Panel */}
            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <BookmarkCheck size={14} className="text-indigo-400" />
                {isMr ? 'सादर केलेले तपशील' : 'SUBMITTED PROFILE'}
              </h4>

              <div className="space-y-2 text-[11px] text-slate-400">
                <div className="flex justify-between pb-1 border-b border-slate-800/50">
                  <span>{isMr ? 'व्यवसाय मालक:' : 'Owner Full Name:'}</span>
                  <span className="text-slate-200 font-semibold">{registration.ownerName}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/50">
                  <span>{isMr ? 'मोबाईल नंबर:' : 'Mobile Contact:'}</span>
                  <span className="text-slate-200 font-mono font-bold">{registration.mobile}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/50">
                  <span>{isMr ? 'ईमेल पत्ता:' : 'Registered Email:'}</span>
                  <span className="text-slate-200 truncate max-w-[150px]">{registration.email}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/50">
                  <span>{isMr ? 'कपड्यांचा प्रकार:' : 'Clothing Shop Type:'}</span>
                  <span className="text-slate-200 font-semibold">{registration.shopDetails.shopType}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-800/50">
                  <span>{isMr ? 'शहर / ठिकाण:' : 'City / Location:'}</span>
                  <span className="text-slate-200 font-semibold">{registration.city}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span>{isMr ? 'प्लॅन विनंती:' : 'License Plan Requested:'}</span>
                  <span className="text-indigo-400 font-bold">{registration.subscription.subscriptionType}</span>
                </div>
              </div>
            </div>

            {/* Preparation recommendations */}
            <div className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-slate-300 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <Sparkles size={14} className="text-pink-400" />
                {isMr ? 'सुरुवात करण्याची तयारी' : 'PREPARATION CHECKLIST'}
              </h4>

              <div className="space-y-2 text-[11px] text-slate-400">
                <p className="text-[10px] text-slate-500 leading-normal">
                  {isMr 
                    ? 'खाते सक्रिय होत असताना, तुम्ही तुमच्या दुकानात खालील गोष्टी तयार ठेवू शकता जेणेकरून कामाला वेग येईल:'
                    : 'While our staff verifies your uploads, prepare your shop floor for instant digital launch:'}
                </p>

                <div className="flex items-start gap-2 pt-1">
                  <Printer size={12} className="text-slate-500 shrink-0 mt-0.5" />
                  <p><strong>{isMr ? 'थर्मल प्रिंटर जोडा:' : 'Thermal Printer setup:'}</strong> {isMr ? '२ किंवा ३ इंची प्रिंटर पीसीला जोडून ठेवा.' : 'Keep any standard 2-inch or 3-inch thermal printer ready.'}</p>
                </div>

                <div className="flex items-start gap-2">
                  <Barcode size={12} className="text-slate-500 shrink-0 mt-0.5" />
                  <p><strong>{isMr ? 'बारकोड स्कॅनर:' : 'Barcode Scanner:'}</strong> {isMr ? 'युएसबी बारकोड स्कॅनर जलद बिलिंगसाठी अत्यंत फायदेशीर आहे.' : 'Any standard plug-and-play USB laser scanner is fully supported.'}</p>
                </div>

                <div className="flex items-start gap-2">
                  <MessageSquare size={12} className="text-slate-500 shrink-0 mt-0.5" />
                  <p><strong>{isMr ? 'व्हॉट्सॲप नंबर:' : 'WhatsApp Business:'}</strong> {isMr ? 'ग्राहकांना स्वयंचलित बिले पाठवण्यासाठी संपर्क नंबर ठरवून ठेवा.' : 'Prepare the primary phone number you want to use for digital receipts.'}</p>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer info banner */}
        <div className="bg-slate-950 p-4 border-t border-slate-800 text-center text-[10px] text-slate-500 font-medium">
          {isMr 
            ? 'मदत आणि साहाय्यासाठी sghipargekar@gmail.com वर संपर्क साधा. © २०२६ वस्त्रा ईआरपी.' 
            : 'For onboarding support or custom period assistance, reach out at sghipargekar@gmail.com. © 2026 Vastraa ERP.'}
        </div>

      </div>
    </div>
  );
}
