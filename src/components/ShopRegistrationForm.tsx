/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  MapPin, 
  Lock, 
  Eye, 
  EyeOff, 
  Store, 
  Users, 
  Calendar, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  CheckSquare, 
  FileCheck,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';
import { ShopRegistration } from '../types';

interface ShopRegistrationFormProps {
  onBackToLogin: () => void;
  onSubmitRegistration: (registration: ShopRegistration) => void;
  isMr: boolean;
}

export default function ShopRegistrationForm({ onBackToLogin, onSubmitRegistration, isMr }: ShopRegistrationFormProps) {
  // Current Form Step: 0 = Business, 1 = Address & Shop Details, 2 = Credentials & Document Upload, 3 = Terms & Review
  const [step, setStep] = useState<number>(0);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [agreed, setAgreed] = useState<boolean>(false);
  
  // Validation error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form Fields State
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [businessReg, setBusinessReg] = useState('');
  
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [shopType, setShopType] = useState("Men's Wear");
  const [employeesCount, setEmployeesCount] = useState<number>(2);
  const [openingDate, setOpeningDate] = useState('2026-07-19');

  // Document states (File uploads with demo preview values)
  const [ownerIdProofName, setOwnerIdProofName] = useState<string>('');
  const [shopLicenseName, setShopLicenseName] = useState<string>('');
  const [gstCertificateName, setGstCertificateName] = useState<string>('');
  const [shopPhotoName, setShopPhotoName] = useState<string>('');

  // Simulated subscription type chosen for request
  const [requestedSubscription, setRequestedSubscription] = useState<'Lifetime' | '1 Month' | '3 Months' | '6 Months' | '1 Year' | 'Custom'>('1 Year');

  // Handle mock file picks
  const handleMockFileUpload = (fieldName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (fieldName === 'ownerIdProof') setOwnerIdProofName(file.name);
      if (fieldName === 'shopLicense') setShopLicenseName(file.name);
      if (fieldName === 'gstCertificate') setGstCertificateName(file.name);
      if (fieldName === 'shopPhoto') setShopPhotoName(file.name);
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!shopName.trim()) newErrors.shopName = isMr ? 'दुकानचे नाव आवश्यक आहे' : 'Shop name is required';
      if (!ownerName.trim()) newErrors.ownerName = isMr ? 'मालकाचे नाव आवश्यक आहे' : 'Owner full name is required';
      if (!mobile.trim() || mobile.length !== 10) {
        newErrors.mobile = isMr ? '१०-अंकी वैध मोबाईल नंबर प्रविष्ट करा' : 'Please enter a valid 10-digit mobile number';
      }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = isMr ? 'वैध ईमेल पत्ता प्रविष्ट करा' : 'Please enter a valid email address';
      }
    } else if (currentStep === 1) {
      if (!city.trim()) newErrors.city = isMr ? 'शहर आवश्यक आहे' : 'City is required';
      if (!state.trim()) newErrors.state = isMr ? 'राज्य आवश्यक आहे' : 'State is required';
      if (!pincode.trim() || pincode.length !== 6) {
        newErrors.pincode = isMr ? '६-अंकी पिनकोड आवश्यक आहे' : 'Please enter a valid 6-digit pincode';
      }
      if (!openingDate) newErrors.openingDate = isMr ? 'ओपनिंग तारीख आवश्यक आहे' : 'Shop opening date is required';
    } else if (currentStep === 2) {
      if (!username.trim() || username.length < 4) {
        newErrors.username = isMr ? 'युझरनेम किमान ४ अक्षरे असावे' : 'Username must be at least 4 characters';
      }
      if (!password || password.length < 6) {
        newErrors.password = isMr ? 'पासवर्ड किमान ६ अक्षरांचा असावा' : 'Password must be at least 6 characters';
      }
      if (password !== confirmPassword) {
        newErrors.confirmPassword = isMr ? 'पासवर्ड जुळत नाहीत' : 'Passwords do not match';
      }
      if (!ownerIdProofName) {
        newErrors.ownerIdProof = isMr ? 'मालकाचा ओळख पुरावा आवश्यक आहे' : 'Owner ID Proof is required';
      }
      if (!shopPhotoName) {
        newErrors.shopPhoto = isMr ? 'दुकानचा फोटो आवश्यक आहे' : 'Shop Photo is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setErrors({ agreement: isMr ? 'कृपया नियम व अटी मान्य करा' : 'You must accept the terms and agreement' });
      return;
    }

    const registrationData: ShopRegistration = {
      id: 'reg-' + Date.now(),
      shopName,
      ownerName,
      mobile,
      email,
      gstNumber: gstNumber || undefined,
      businessRegNumber: businessReg || undefined,
      city,
      state,
      pincode,
      loginInfo: {
        username,
        password
      },
      shopDetails: {
        shopType,
        employeesCount,
        openingDate
      },
      documents: {
        ownerIdProof: ownerIdProofName || 'id_proof_uploaded.pdf',
        shopLicense: shopLicenseName || undefined,
        gstCertificate: gstCertificateName || undefined,
        shopPhoto: shopPhotoName || 'shop_exterior_uploaded.jpg'
      },
      subscription: {
        status: 'Pending',
        subscriptionType: requestedSubscription,
        notes: isMr ? 'नवीन नोंदणी सादर केली. मंजुरी प्रलंबित.' : 'New registration submitted. Pending review.'
      },
      createdAt: new Date().toISOString()
    };

    onSubmitRegistration(registrationData);
  };

  const stepsMeta = [
    { label: isMr ? 'व्यवसाय' : 'Business', desc: isMr ? 'दुकान आणि मालक माहिती' : 'Shop & owner info' },
    { label: isMr ? 'पत्ता व तपशील' : 'Address', desc: isMr ? 'दुकान पत्ता व प्रकार' : 'Type & address' },
    { label: isMr ? 'कागदपत्रे' : 'Credentials', desc: isMr ? 'लॉगिन आणि ओळखपत्रे' : 'Auth & uploads' },
    { label: isMr ? 'करार व पुनरावलोकन' : 'Agreement', desc: isMr ? 'अटी आणि अर्ज सादर करा' : 'Terms & review' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-3 md:p-6 relative overflow-x-hidden">
      {/* Decorative ambient blobs */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -z-10"></div>

      {/* Main Container */}
      <div className="w-full max-w-5xl bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative z-10">
        
        {/* Left Side: Professional Branding, Information & Guidelines */}
        <div className="w-full md:w-5/12 bg-gradient-to-b from-indigo-950/70 via-slate-900 to-indigo-950/40 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          
          {/* Header & Title */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={onBackToLogin}
                className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition"
                title={isMr ? "लॉगिनकडे जा" : "Back to Login"}
              >
                <ArrowLeft size={16} />
              </button>
              <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} className="text-pink-400 animate-pulse" />
                Vastraa ERP Partner
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black font-display tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                {isMr ? 'रिटेल क्लोदिंग नोंदणी' : 'Partner Registration'}
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isMr 
                  ? 'आपल्या कपड्यांच्या व्यवसायाला डिजिटल करण्यासाठी आजच नोंदणी करा. बिलिंग, ग्राहक व्हॉट्सॲप आणि स्टॉक एकाच ठिकाणी व्यवस्थापित करा.'
                  : 'Register your retail clothing business on the most reliable management platform. Manage billing, stock, and customer CRM with automated WhatsApp.'}
              </p>
            </div>

            {/* Quick Benefits list */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2.5 text-xs">
                <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-400 shrink-0 mt-0.5">
                  <Award size={13} />
                </div>
                <div>
                  <p className="font-bold text-slate-200">{isMr ? 'डिजिटल जीएसटी बिलिंग' : 'GST & Non-GST Fast POS'}</p>
                  <p className="text-[10px] text-slate-400">{isMr ? 'थर्मल किंवा ए४ साईज बिले सेकंदात बनवा.' : 'Generate beautiful thermal or A4 receipts in a flash.'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-400 shrink-0 mt-0.5">
                  <Phone size={13} />
                </div>
                <div>
                  <p className="font-bold text-slate-200">{isMr ? 'व्हॉट्सॲप मेसेजिंग इंटिग्रेशन' : 'WhatsApp Marketing & Alerts'}</p>
                  <p className="text-[10px] text-slate-400">{isMr ? 'ग्राहकांना थेट संदेश, बिल लिंक्स आणि ऑफर्स पाठवा.' : 'Directly dispatch receipts, loyalty alerts, and festive offers.'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs">
                <div className="p-1 bg-emerald-500/10 rounded-md text-emerald-400 shrink-0 mt-0.5">
                  <Clock size={13} />
                </div>
                <div>
                  <p className="font-bold text-slate-200">{isMr ? 'विश्वासार्ह डेटा साठवणूक' : 'Durable Multi-Device OS'}</p>
                  <p className="text-[10px] text-slate-400">{isMr ? 'तुमचा सर्व डेटा सुरक्षितपणे क्लाउडमध्ये संरक्षित राहील.' : 'Secure ledger management, live analytics and data durability.'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription details card (Read Only) */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/10 rounded-xl space-y-2">
              <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-extrabold block">
                🛡️ {isMr ? 'सदस्यत्व स्थिती (Read Only)' : 'INITIAL STATUS'}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300 font-medium">{isMr ? 'सुरुवातीची स्थिती:' : 'Review Status:'}</span>
                <span className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono font-bold text-[10px] rounded-full uppercase tracking-wider animate-pulse">
                  {isMr ? 'मंजुरी प्रलंबित' : 'Pending Approval'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>{isMr ? 'हवा असलेला प्लॅन:' : 'Requested Plan:'}</span>
                <select 
                  value={requestedSubscription} 
                  onChange={(e) => setRequestedSubscription(e.target.value as any)}
                  className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded px-2 py-0.5 focus:outline-none"
                >
                  <option value="Lifetime">{isMr ? 'Lifetime (आजीवन)' : 'Lifetime'}</option>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="1 Year">1 Year</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>
              <p className="text-[10px] text-slate-500 italic leading-tight pt-1">
                {isMr 
                  ? 'मंजुरीनंतर सॉफ्टवेअर मालकाद्वारे तुमचे खाते सक्रिय केले जाईल.' 
                  : 'Subscription will be verified and activated only after approval by the Software Owner/Admin.'}
              </p>
            </div>

            <button 
              type="button"
              onClick={onBackToLogin}
              className="text-[11px] text-slate-400 hover:text-indigo-400 flex items-center justify-center gap-1.5 w-full py-1 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition"
            >
              <ArrowLeft size={11} /> {isMr ? 'लॉगिन पृष्ठावर परत जा' : 'Already registered? Log in'}
            </button>
          </div>
        </div>

        {/* Right Side: Step-by-Step Form Canvas */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-between bg-slate-900/60">
          
          {/* Steps Horizontal Bar */}
          <div className="pb-6 border-b border-slate-800/80">
            <div className="flex items-center justify-between">
              {stepsMeta.map((s, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 relative">
                  {/* Step bubble */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 z-10 ${
                    step === idx 
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' 
                      : step > idx 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {step > idx ? <CheckCircle2 size={14} /> : idx + 1}
                  </div>
                  {/* Step Label */}
                  <span className={`text-[10px] mt-1.5 font-bold tracking-tight hidden sm:block ${step === idx ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {s.label}
                  </span>

                  {/* Connector lines */}
                  {idx < stepsMeta.length - 1 && (
                    <div className={`absolute top-3.5 left-1/2 w-full h-[2px] -z-1 transition-all duration-300 ${
                      step > idx ? 'bg-emerald-600' : 'bg-slate-800'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            {/* Active Step description for mobile */}
            <div className="text-center sm:text-left mt-3 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                {isMr ? `पायरी ${step + 1} पैकी 4` : `Step ${step + 1} of 4`}
              </span>
              <p className="text-xs text-slate-200 font-semibold">{stepsMeta[step].desc}</p>
            </div>
          </div>

          {/* Form Content area */}
          <form onSubmit={handleSubmit} className="flex-1 py-6 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.15 }}
                className="space-y-4 text-xs"
              >
                
                {/* STEP 1: BUSINESS INFORMATION */}
                {step === 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-indigo-400 pb-1 border-b border-slate-800">
                      {isMr ? 'व्यवसाय व मालक माहिती' : 'Business Information'}
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          {isMr ? 'दुकान / व्यवसायाचे नाव *' : 'Shop Name *'}
                        </label>
                        <div className="relative">
                          <Store className="absolute left-3 top-2.5 text-slate-500" size={14} />
                          <input 
                            type="text"
                            placeholder={isMr ? "उदा. रॉयल बुटीक" : "e.g. Royal Boutique"}
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            className={`w-full bg-slate-950/80 border ${errors.shopName ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none text-slate-100`}
                          />
                        </div>
                        {errors.shopName && <p className="text-rose-400 text-[10px]">{errors.shopName}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          {isMr ? 'मालकाचे पूर्ण नाव *' : 'Owner Full Name *'}
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 text-slate-500" size={14} />
                          <input 
                            type="text"
                            placeholder={isMr ? "उदा. राहुल देशमुख" : "e.g. Rahul Deshmukh"}
                            value={ownerName}
                            onChange={(e) => setOwnerName(e.target.value)}
                            className={`w-full bg-slate-950/80 border ${errors.ownerName ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none text-slate-100`}
                          />
                        </div>
                        {errors.ownerName && <p className="text-rose-400 text-[10px]">{errors.ownerName}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          {isMr ? 'मोबाईल नंबर *' : 'Mobile Number *'}
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 text-slate-500" size={14} />
                          <input 
                            type="text"
                            maxLength={10}
                            placeholder="e.g. 9876543210"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className={`w-full bg-slate-950/80 border ${errors.mobile ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none text-slate-100 font-mono`}
                          />
                        </div>
                        {errors.mobile && <p className="text-rose-400 text-[10px]">{errors.mobile}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          {isMr ? 'ईमेल पत्ता *' : 'Email Address *'}
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 text-slate-500" size={14} />
                          <input 
                            type="email"
                            placeholder="e.g. contact@shop.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full bg-slate-950/80 border ${errors.email ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none text-slate-100`}
                          />
                        </div>
                        {errors.email && <p className="text-rose-400 text-[10px]">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                          {isMr ? 'जीएसटी नंबर (GSTIN) - पर्यायी' : 'GST Number (Optional)'}
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-2.5 text-slate-500" size={14} />
                          <input 
                            type="text"
                            placeholder="e.g. 27AAAAA1111A1Z1"
                            value={gstNumber}
                            onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none text-slate-100 font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                          {isMr ? 'व्यवसाय नोंदणी क्रमांक - पर्यायी' : 'Business Registration No. (Optional)'}
                        </label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-2.5 text-slate-500" size={14} />
                          <input 
                            type="text"
                            placeholder="e.g. U12345MH2026PTC123"
                            value={businessReg}
                            onChange={(e) => setBusinessReg(e.target.value)}
                            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none text-slate-100 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: ADDRESS & SHOP DETAILS */}
                {step === 1 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-indigo-400 pb-1 border-b border-slate-800">
                      {isMr ? 'दुकान पत्ता व वर्गीकरण' : 'Shop Address & Details'}
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          {isMr ? 'शहर *' : 'City *'}
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 text-slate-500" size={14} />
                          <input 
                            type="text"
                            placeholder={isMr ? "उदा. पुणे" : "e.g. Pune"}
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={`w-full bg-slate-950/80 border ${errors.city ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none text-slate-100`}
                          />
                        </div>
                        {errors.city && <p className="text-rose-400 text-[10px]">{errors.city}</p>}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          {isMr ? 'पिनकोड *' : 'Pincode *'}
                        </label>
                        <input 
                          type="text"
                          maxLength={6}
                          placeholder="411001"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className={`w-full bg-slate-950/80 border ${errors.pincode ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-slate-100 font-mono`}
                        />
                        {errors.pincode && <p className="text-rose-400 text-[10px]">{errors.pincode}</p>}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                        {isMr ? 'राज्य *' : 'State *'}
                      </label>
                      <input 
                        type="text"
                        placeholder={isMr ? "उदा. महाराष्ट्र" : "e.g. Maharashtra"}
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className={`w-full bg-slate-950/80 border ${errors.state ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-slate-100`}
                      />
                      {errors.state && <p className="text-rose-400 text-[10px]">{errors.state}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          {isMr ? 'दुकानचा प्रकार *' : 'Shop Type *'}
                        </label>
                        <select 
                          value={shopType}
                          onChange={(e) => setShopType(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 outline-none text-slate-100"
                        >
                          <option value="Men's Wear">{isMr ? "Men's Wear (पुरुष परिधान)" : "Men's Wear"}</option>
                          <option value="Women's Wear">{isMr ? "Women's Wear (महिला परिधान)" : "Women's Wear"}</option>
                          <option value="Kids Wear">{isMr ? "Kids Wear (लहान मुलांचे कपडे)" : "Kids Wear"}</option>
                          <option value="Boutique">{isMr ? "Boutique (बुटीक)" : "Boutique"}</option>
                          <option value="Multi Brand">{isMr ? "Multi Brand (मल्टी ब्रँड दालन)" : "Multi Brand"}</option>
                          <option value="Other">{isMr ? "Other (इतर)" : "Other"}</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                          {isMr ? 'कर्मचाऱ्यांची संख्या' : 'Number of Employees'}
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-2.5 text-slate-500" size={14} />
                          <input 
                            type="number"
                            min={1}
                            value={employeesCount}
                            onChange={(e) => setEmployeesCount(parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none text-slate-100 font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                        {isMr ? 'दुकान सुरू झाल्याची तारीख / उद्घाटन दिन' : 'Shop Opening Date'}
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 text-slate-500" size={14} />
                        <input 
                          type="date"
                          value={openingDate}
                          onChange={(e) => setOpeningDate(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-3 py-2 outline-none text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: LOGINS & DOCUMENT UPLOAD */}
                {step === 2 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-indigo-400 pb-1 border-b border-slate-800">
                      {isMr ? 'लॉगिन माहिती आणि कागदपत्रे' : 'Login Credentials & Documents'}
                    </h3>

                    {/* Credentials */}
                    <div className="space-y-2 bg-indigo-950/10 p-3 rounded-2xl border border-indigo-500/5">
                      <span className="text-[9px] uppercase tracking-wider text-indigo-400 font-bold block mb-1">
                        🔑 {isMr ? 'नवीन युझर तयार करा' : 'ADMIN LOGIN CREDENTIALS'}
                      </span>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-slate-400 font-bold block">{isMr ? 'युझरनेम *' : 'Username *'}</label>
                        <input 
                          type="text"
                          placeholder="e.g. rahul_boutique"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                          className={`w-full bg-slate-950/80 border ${errors.username ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-xl px-3 py-1.5 outline-none text-slate-100`}
                        />
                        {errors.username && <p className="text-rose-400 text-[10px]">{errors.username}</p>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-slate-400 font-bold block">{isMr ? 'पासवर्ड *' : 'Password *'}</label>
                          <div className="relative">
                            <input 
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className={`w-full bg-slate-950/80 border ${errors.password ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-xl px-3 py-1.5 outline-none text-slate-100`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2 text-slate-400 hover:text-white"
                            >
                              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          {errors.password && <p className="text-rose-400 text-[10px]">{errors.password}</p>}
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] uppercase text-slate-400 font-bold block">{isMr ? 'पासवर्डची पुष्टी करा *' : 'Confirm Password *'}</label>
                          <div className="relative">
                            <input 
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className={`w-full bg-slate-950/80 border ${errors.confirmPassword ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 rounded-xl px-3 py-1.5 outline-none text-slate-100`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-2 text-slate-400 hover:text-white"
                            >
                              {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                          {errors.confirmPassword && <p className="text-rose-400 text-[10px]">{errors.confirmPassword}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Documents Upload Section */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                        📁 {isMr ? 'व्यवसाय पुरावे आणि दस्तऐवज' : 'REQUIRED BUSINESS DOCUMENTS'}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Owner ID Proof */}
                        <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-300">{isMr ? 'मालकाचा आयडी पुरावा *' : 'Owner ID Proof *'}</span>
                            <span className="text-[9px] text-slate-500">(Aadhaar / PAN)</span>
                          </div>
                          <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-lg cursor-pointer text-slate-400 hover:text-indigo-400 transition">
                            <Upload size={13} />
                            <span className="truncate">{ownerIdProofName || (isMr ? 'कागदपत्र निवडा' : 'Upload PDF/Image')}</span>
                            <input 
                              type="file" 
                              accept="image/*,application/pdf"
                              onChange={(e) => handleMockFileUpload('ownerIdProof', e)} 
                              className="hidden" 
                            />
                          </label>
                          {errors.ownerIdProof && <p className="text-rose-400 text-[10px]">{errors.ownerIdProof}</p>}
                        </div>

                        {/* Shop Photo */}
                        <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-300">{isMr ? 'दुकानचा दर्शनी फोटो *' : 'Shop Photo *'}</span>
                            <span className="text-[9px] text-slate-500">(Front Board)</span>
                          </div>
                          <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-lg cursor-pointer text-slate-400 hover:text-indigo-400 transition">
                            <Upload size={13} />
                            <span className="truncate">{shopPhotoName || (isMr ? 'फोटो निवडा' : 'Upload JPEG/PNG')}</span>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => handleMockFileUpload('shopPhoto', e)} 
                              className="hidden" 
                            />
                          </label>
                          {errors.shopPhoto && <p className="text-rose-400 text-[10px]">{errors.shopPhoto}</p>}
                        </div>

                        {/* Shop License (Optional) */}
                        <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-400">{isMr ? 'दुकान परवाना (पर्यायी)' : 'Shop License (Optional)'}</span>
                            <span className="text-[9px] text-slate-600">(Gumasta)</span>
                          </div>
                          <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer text-slate-500 hover:text-slate-300 transition">
                            <Upload size={13} />
                            <span className="truncate">{shopLicenseName || (isMr ? 'परवाना अपलोड' : 'Upload Document')}</span>
                            <input 
                              type="file" 
                              accept="image/*,application/pdf"
                              onChange={(e) => handleMockFileUpload('shopLicense', e)} 
                              className="hidden" 
                            />
                          </label>
                        </div>

                        {/* GST Certificate (Optional) */}
                        <div className="p-2.5 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1.5 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-slate-400">{isMr ? 'जीएसटी प्रमाणपत्र (पर्यायी)' : 'GST Certificate (Optional)'}</span>
                            <span className="text-[9px] text-slate-600">(REG-06)</span>
                          </div>
                          <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg cursor-pointer text-slate-500 hover:text-slate-300 transition">
                            <Upload size={13} />
                            <span className="truncate">{gstCertificateName || (isMr ? 'प्रमाणपत्र अपलोड' : 'Upload Document')}</span>
                            <input 
                              type="file" 
                              accept="image/*,application/pdf"
                              onChange={(e) => handleMockFileUpload('gstCertificate', e)} 
                              className="hidden" 
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: TERMS & SUBSCRIPTION AGREEMENT */}
                {step === 3 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-indigo-400 pb-1 border-b border-slate-800">
                      {isMr ? 'अटी, नियम आणि भागीदारी करार' : 'Terms & Subscription Agreement'}
                    </h3>

                    {/* Agreement Text Block */}
                    <div className="bg-slate-950/80 p-3.5 border border-slate-800 rounded-2xl h-48 overflow-y-auto space-y-3 text-[11px] text-slate-300 leading-relaxed font-sans">
                      <p className="font-bold text-slate-100 text-xs text-center border-b border-slate-800 pb-1.5">
                        {isMr ? 'सदस्यत्व आणि वापर करारनामा' : 'VASTRAA ERP SUBSCRIPTION AGREEMENT'}
                      </p>
                      
                      <ol className="list-decimal pl-4 space-y-2">
                        <li>
                          <strong>{isMr ? 'सॉफ्टवेअर मालक मंजुरी:' : 'Review & Approval:'}</strong>{' '}
                          {isMr 
                            ? 'माझी नोंदणी सॉफ्टवेअर मालकाद्वारे पडताळणी आणि मंजुरीच्या अधीन आहे हे मला मान्य आहे.'
                            : 'My registration is subject to verification and approval by the Software Owner.'}
                        </li>
                        <li>
                          <strong>{isMr ? 'नोंदणी अधिकार:' : 'Reservation of Rights:'}</strong>{' '}
                          {isMr
                            ? 'कोणतीही पूर्वसूचना न देता कोणतीही नोंदणी मंजूर किंवा नाकारण्याचा अधिकार सॉफ्टवेअर मालकाकडे राखीव आहे.'
                            : 'The Software Owner reserves the right to approve or reject any registration without prior notice.'}
                        </li>
                        <li>
                          <strong>{isMr ? 'प्रलंबित खाते:' : 'Inactive Account State:'}</strong>{' '}
                          {isMr
                            ? 'माझे खाते मंजूर होईपर्यंत ते निष्क्रिय राहील आणि मला बिले बनवता येणार नाहीत.'
                            : 'My account will remain inactive until approved by the administrators.'}
                        </li>
                        <li>
                          <strong>{isMr ? 'सदस्यत्व वाटप:' : 'Subscription Grant:'}</strong>{' '}
                          {isMr
                            ? 'मंजुरीनंतर, सॉफ्टवेअर मालक माझ्या खात्याला आजीवन (Lifetime) किंवा ठराविक कालावधीसाठी सदस्यत्व नियुक्त करू शकतात.'
                            : 'After approval, the Software Owner may assign a Lifetime subscription or a fixed subscription period.'}
                        </li>
                        <li>
                          <strong>{isMr ? 'कायदेशीर वापर:' : 'Lawful Business Purposes:'}</strong>{' '}
                          {isMr
                            ? 'मी या सॉफ्टवेअरचा वापर केवळ कायदेशीर आणि व्यावसायिक कारणांसाठीच करेन.'
                            : 'I agree to use this software only for lawful business purposes.'}
                        </li>
                        <li>
                          <strong>{isMr ? 'क्रेडेन्शियल्स गोपनीयता:' : 'Credential Security:'}</strong>{' '}
                          {isMr
                            ? 'मी माझे लॉगिन तपशील कोणत्याही अनधिकृत व्यक्तीसोबत सामायिक करणार नाही.'
                            : 'I will not share my login credentials with unauthorized users.'}
                        </li>
                        <li>
                          <strong>{isMr ? 'नियम उल्लंघन:' : 'Suspension and Misuse:'}</strong>{' '}
                          {isMr
                            ? 'प्लॅटफॉर्मचा चुकीचा वापर केल्यास माझे खाते निलंबित किंवा संपुष्टात आणले जाऊ शकते हे मला समजते.'
                            : 'I understand that misuse of the platform may result in account suspension or termination.'}
                        </li>
                        <li>
                          <strong>{isMr ? 'शुल्क नॉन-रिफंडेबल:' : 'Refund Policy:'}</strong>{' '}
                          {isMr
                            ? 'प्रलंबित किंवा लागू केलेले सदस्यत्व शुल्क कोणत्याही परिस्थितीत नॉन-रिफंडेबल असेल.'
                            : 'Subscription fees, if applicable, are non-refundable unless otherwise stated by the Software Owner.'}
                        </li>
                        <li>
                          <strong>{isMr ? 'डेटा जबाबदारी:' : 'Data Security & Ownership:'}</strong>{' '}
                          {isMr
                            ? 'माझ्या व्यवसायाच्या डेटाची सर्वस्वी जबाबदारी माझी असेल आणि तो साठवण्यासाठी मी प्लॅटफॉर्मला अधिकृत करत आहे.'
                            : 'My business data remains my responsibility, and I authorize the platform to securely store and process it for providing services.'}
                        </li>
                        <li>
                          <strong>{isMr ? 'भविष्यातील बदल:' : 'Compliance Updates:'}</strong>{' '}
                          {isMr
                            ? 'मी प्लॅटफॉर्मच्या भविष्यातील सर्व सुधारित अटी व नियमांचे पालन करण्यास बांधील राहीन.'
                            : 'I agree to comply with future updates to the platform\'s Terms and Conditions.'}
                        </li>
                      </ol>
                    </div>

                    {/* Checkbox agreement */}
                    <div className="pt-2">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <input 
                          id="agree-checkbox"
                          type="checkbox"
                          checked={agreed}
                          onChange={(e) => {
                            setAgreed(e.target.checked);
                            if (e.target.checked) {
                              setErrors(prev => ({ ...prev, agreement: '' }));
                            }
                          }}
                          className="mt-0.5 rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950 focus:ring-offset-slate-900"
                        />
                        <span className="text-[11px] text-slate-300 group-hover:text-white transition leading-snug">
                          <strong>{isMr ? 'मी नियम व अटी वाचल्या आहेत आणि सदस्यत्व कराराशी सहमत आहे. *' : 'I have read and agree to the Terms & Conditions and Subscription Agreement. *'}</strong>
                        </span>
                      </label>
                      {errors.agreement && <p className="text-rose-400 text-[10px] mt-1">{errors.agreement}</p>}
                    </div>

                    {/* Summary confirmation view */}
                    <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-[11px] space-y-1 text-slate-400">
                      <p className="font-bold text-slate-300 text-xs mb-1">🔍 {isMr ? 'नोंदणी अर्ज सारांश:' : 'Registration Quick Review:'}</p>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                        <div><span className="text-slate-500">{isMr ? 'दुकान:' : 'Shop Name:'}</span> <strong className="text-slate-200">{shopName}</strong></div>
                        <div><span className="text-slate-500">{isMr ? 'मालक:' : 'Owner:'}</span> <strong className="text-slate-200">{ownerName}</strong></div>
                        <div><span className="text-slate-500">{isMr ? 'मोबाईल:' : 'Mobile:'}</span> <strong className="text-slate-200 font-mono">{mobile}</strong></div>
                        <div><span className="text-slate-500">{isMr ? 'प्रकार:' : 'Type:'}</span> <strong className="text-slate-200">{shopType}</strong></div>
                        <div><span className="text-slate-500">{isMr ? 'युझरनेम:' : 'Username:'}</span> <strong className="text-slate-200 font-mono">{username}</strong></div>
                        <div><span className="text-slate-500">{isMr ? 'प्लॅन विनंती:' : 'Requested Plan:'}</span> <strong className="text-indigo-400 font-bold">{requestedSubscription}</strong></div>
                      </div>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </form>

          {/* Action Button Navigation Controls */}
          <div className="pt-4 border-t border-slate-800/80 flex justify-between gap-3">
            {step > 0 ? (
              <button
                id="reg-prev-btn"
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl font-bold flex items-center gap-1.5 text-xs transition"
              >
                <ArrowLeft size={14} /> {isMr ? 'मागे जा' : 'Back'}
              </button>
            ) : (
              <button
                id="reg-cancel-btn"
                type="button"
                onClick={onBackToLogin}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-bold text-xs transition"
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
            )}

            {step < 3 ? (
              <button
                id="reg-next-btn"
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs transition ml-auto shadow-md shadow-indigo-600/20"
              >
                {isMr ? 'पुढे चला' : 'Next Step'} <ArrowRight size={14} />
              </button>
            ) : (
              <button
                id="reg-submit-btn"
                type="button"
                onClick={handleSubmit}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 text-xs transition ml-auto shadow-lg shadow-emerald-600/20"
              >
                <FileCheck size={14} /> {isMr ? 'नोंदणी अर्ज सबमिट करा' : 'Submit Registration'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
