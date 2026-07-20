import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  Download, 
  Printer, 
  Search, 
  Sparkles, 
  Settings, 
  Grid, 
  FileDown, 
  Tag, 
  HelpCircle, 
  CheckCircle,
  Copy,
  Plus,
  Minus,
  Trash2,
  RefreshCw,
  Package,
  Layers,
  Palette,
  LayoutGrid
} from 'lucide-react';
import { Product, ShopSettings } from '../types';

interface QrCodeGeneratorViewProps {
  products: Product[];
  t: any;
  isMr: boolean;
  shopSettings?: ShopSettings;
}

interface BatchItem {
  id: string; // product.id or generated custom id
  name: string;
  price: number;
  size: string;
  color: string;
  sku: string;
  category: string;
  brand: string;
  copies: number;
  isCustom?: boolean;
}

// Self-contained dynamic QR code renderer for batches
interface QrCodeImageProps {
  payload: string;
  qrColor: string;
  qrBgColor: string;
  eccLevel: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

function QrCodeImage({ payload, qrColor, qrBgColor, eccLevel, className }: QrCodeImageProps) {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(payload, {
      width: 180,
      margin: 1,
      color: {
        dark: qrColor,
        light: qrBgColor
      },
      errorCorrectionLevel: eccLevel
    })
    .then(url => {
      if (active) setSrc(url);
    })
    .catch(err => {
      console.error('Error in QrCodeImage:', err);
    });

    return () => {
      active = false;
    };
  }, [payload, qrColor, qrBgColor, eccLevel]);

  if (!src) {
    return <div className="w-full h-full bg-slate-100 animate-pulse rounded" />;
  }

  return (
    <img 
      src={src} 
      alt="QR Code" 
      className={className} 
      referrerPolicy="no-referrer"
    />
  );
}

// Predefined palette colors for QR code styling
const PALETTE_COLORS = [
  { name: 'Elegant Ink', value: '#0F172A' },       // slate-900
  { name: 'Royal Indigo', value: '#4F46E5' },      // indigo-600
  { name: 'Cosmic Violet', value: '#7C3AED' },     // violet-600
  { name: 'Deep Emerald', value: '#059669' },      // emerald-600
  { name: 'Crimson Rose', value: '#DB2777' },       // pink-600
  { name: 'Rustic Sienna', value: '#B45309' },     // amber-700
  { name: 'Classic Black', value: '#000000' }
];

export default function QrCodeGeneratorView({ products, t, isMr, shopSettings }: QrCodeGeneratorViewProps) {
  // Config state
  const [generationMode, setGenerationMode] = useState<'catalog' | 'custom'>('catalog');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  
  // Custom manual state
  const [manualName, setManualName] = useState<string>('');
  const [manualPrice, setManualPrice] = useState<number>(0);
  const [manualSize, setManualSize] = useState<string>('XL');
  const [manualColor, setManualColor] = useState<string>('Black');
  const [manualSku, setManualSku] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');

  // QR Code Styling options
  const [qrColor, setQrColor] = useState<string>('#0F172A');
  const [qrBgColor, setQrBgColor] = useState<string>('#FFFFFF');
  const [eccLevel, setEccLevel] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [labelTemplate, setLabelTemplate] = useState<'minimalist' | 'boutique' | 'industrial'>('minimalist');
  const [qrContentMode, setQrContentMode] = useState<'sku' | 'catalog' | 'custom'>('sku');

  // Search filter for catalog items
  const [productSearch, setProductSearch] = useState<string>('');

  // Generated QR Code Data URL state (for single active preview)
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Bulk printing sheet configuration
  const [printCols, setPrintCols] = useState<number>(4);
  const [printRows, setPrintRows] = useState<number>(6);
  const [printQty, setPrintQty] = useState<number>(24);
  const [isBulkPrintView, setIsBulkPrintView] = useState<boolean>(false);

  // Batch print queue list
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);

  // Reference to the active single sticker preview card for canvas capture
  const stickerRef = useRef<HTMLDivElement>(null);

  // Initialize batch with some default products so they have immediate preview data
  useEffect(() => {
    if (products.length > 0 && batchItems.length === 0) {
      const defaultBatch: BatchItem[] = [];
      const count = Math.min(products.length, 3);
      for (let i = 0; i < count; i++) {
        const p = products[i];
        defaultBatch.push({
          id: p.id,
          name: isMr && p.itemNameMr ? p.itemNameMr : p.itemName,
          price: p.sellingPrice,
          size: p.size,
          color: p.color,
          sku: p.barcode || p.id,
          category: p.category || 'Apparel',
          brand: p.brand || 'Vastraa',
          copies: i === 0 ? 4 : 2
        });
      }
      setBatchItems(defaultBatch);
    }
  }, [products]);

  // Set default selected product id for single preview once products load
  useEffect(() => {
    if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].id);
    }
  }, [products]);

  // Filter products based on search
  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase();
    return (
      p.itemName.toLowerCase().includes(q) ||
      (p.itemNameMr && p.itemNameMr.toLowerCase().includes(q)) ||
      p.barcode.toLowerCase().includes(q) ||
      p.size.toLowerCase().includes(q)
    );
  });

  // Calculate batch summary metrics
  const totalBatchCopiesCount = batchItems.reduce((acc, item) => acc + item.copies, 0);

  // Get current active single preview product details based on selections
  const getActiveStickerData = () => {
    if (generationMode === 'catalog') {
      const p = products.find(prod => prod.id === selectedProductId) || products[0];
      if (p) {
        return {
          name: isMr && p.itemNameMr ? p.itemNameMr : p.itemName,
          price: p.sellingPrice,
          size: p.size,
          color: p.color,
          sku: p.barcode || p.id,
          category: p.category || 'Apparel',
          brand: p.brand || 'Vastraa'
        };
      }
    }
    return {
      name: manualName || (isMr ? 'नवीन उत्पादन' : 'New Garment Item'),
      price: manualPrice,
      size: manualSize || 'Free Size',
      color: manualColor || 'Mixed',
      sku: manualSku || 'SKU-CUSTOM',
      category: 'Custom',
      brand: shopSettings?.shopName || 'Brand'
    };
  };

  const stickerData = getActiveStickerData();

  // Get the payload text to pack into the QR code
  const getStickerPayload = (item: { sku: string }) => {
    if (qrContentMode === 'sku') {
      return item.sku;
    }
    if (qrContentMode === 'catalog') {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://vastraa.app';
      return `${origin}/catalog?sku=${item.sku}`;
    }
    return customText || item.sku;
  };

  const payloadText = getStickerPayload(stickerData);

  // Generate single QR code data URL whenever parameters change
  useEffect(() => {
    const generateQrCode = async () => {
      setIsGenerating(true);
      try {
        const url = await QRCode.toDataURL(payloadText, {
          width: 256,
          margin: 1,
          color: {
            dark: qrColor,
            light: qrBgColor
          },
          errorCorrectionLevel: eccLevel
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
      } finally {
        setIsGenerating(false);
      }
    };

    generateQrCode();
  }, [payloadText, qrColor, qrBgColor, eccLevel]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Helper to query quantity of an item currently in batch queue
  const getBatchItemQty = (prodId: string) => {
    const found = batchItems.find(item => item.id === prodId);
    return found ? found.copies : 0;
  };

  // Update batch quantity for a catalog item
  const handleUpdateBatchQty = (prod: Product, delta: number) => {
    setBatchItems(prev => {
      const idx = prev.findIndex(item => item.id === prod.id);
      if (idx >= 0) {
        const updated = [...prev];
        const newQty = updated[idx].copies + delta;
        if (newQty <= 0) {
          updated.splice(idx, 1);
        } else {
          updated[idx] = { ...updated[idx], copies: newQty };
        }
        return updated;
      } else if (delta > 0) {
        return [...prev, {
          id: prod.id,
          name: isMr && prod.itemNameMr ? prod.itemNameMr : prod.itemName,
          price: prod.sellingPrice,
          size: prod.size,
          color: prod.color,
          sku: prod.barcode || prod.id,
          category: prod.category || 'Apparel',
          brand: prod.brand || 'Vastraa',
          copies: delta
        }];
      }
      return prev;
    });
  };

  // Add all filtered products to batch
  const handleAddAllFilteredToBatch = () => {
    if (filteredProducts.length === 0) return;
    
    setBatchItems(prev => {
      const updated = [...prev];
      for (const prod of filteredProducts) {
        const idx = updated.findIndex(item => item.id === prod.id);
        if (idx >= 0) {
          updated[idx].copies += 1;
        } else {
          updated.push({
            id: prod.id,
            name: isMr && prod.itemNameMr ? prod.itemNameMr : prod.itemName,
            price: prod.sellingPrice,
            size: prod.size,
            color: prod.color,
            sku: prod.barcode || prod.id,
            category: prod.category || 'Apparel',
            brand: prod.brand || 'Vastraa',
            copies: 2 // add with 2 default copies
          });
        }
      }
      return updated;
    });
    
    showToast(isMr 
      ? `सर्व ${filteredProducts.length} कपडे बॅच प्रिंटमध्ये यशस्वीरित्या जोडले!` 
      : `Successfully added all ${filteredProducts.length} filtered items to print queue!`);
  };

  // Add custom manual item to batch print queue
  const handleAddManualToBatch = () => {
    const name = manualName || (isMr ? 'नवीन मॅन्युअल कपडा' : 'Manual Apparel Item');
    const price = manualPrice || 0;
    const size = manualSize || 'Free Size';
    const color = manualColor || 'Mixed';
    const sku = manualSku || `SKU-CUST-${Math.floor(1000 + Math.random() * 9000)}`;

    const newItem: BatchItem = {
      id: `custom-${Date.now()}`,
      name,
      price,
      size,
      color,
      sku,
      category: 'Custom',
      brand: shopSettings?.shopName || 'Brand',
      copies: 4, // default 4 copies
      isCustom: true
    };

    setBatchItems(prev => [...prev, newItem]);
    showToast(isMr ? 'मॅन्युअल स्टिकर बॅच प्रिंटमध्ये जोडले गेले!' : 'Manual label added to the print batch queue!');
    
    // reset manual fields
    setManualName('');
    setManualPrice(0);
    setManualSku('');
  };

  // Stepper update for existing batch row item
  const updateExistingBatchRowQty = (id: string, delta: number) => {
    setBatchItems(prev => {
      const idx = prev.findIndex(item => item.id === id);
      if (idx >= 0) {
        const updated = [...prev];
        const newQty = updated[idx].copies + delta;
        if (newQty <= 0) {
          updated.splice(idx, 1);
        } else {
          updated[idx] = { ...updated[idx], copies: newQty };
        }
        return updated;
      }
      return prev;
    });
  };

  // Delete row from batch entirely
  const deleteBatchRow = (id: string) => {
    setBatchItems(prev => prev.filter(item => item.id !== id));
    showToast(isMr ? 'बॅचमधून काढले!' : 'Removed item from batch!');
  };

  // Clear batch list entirely
  const handleClearBatch = () => {
    setBatchItems([]);
    showToast(isMr ? 'प्रिंट बॅच रिकामी केली!' : 'Cleared print batch queue!');
  };

  // Download individual sticker as PNG by drawing HTML element on canvas
  const downloadSingleSticker = () => {
    if (!qrDataUrl) return;

    // Create a temporary canvas to draw a crisp high-res sticker
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 280;

    let borderColor = '#E2E8F0';
    let accentLineColor = qrColor;

    if (labelTemplate === 'boutique') {
      borderColor = '#FBCFE8'; // pink-200
      accentLineColor = '#DB2777'; // pink-600
    } else if (labelTemplate === 'industrial') {
      borderColor = '#000000';
      accentLineColor = '#000000';
    }

    // Fill background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, canvas.width - 12, canvas.height - 12);

    // Inner subtle border
    ctx.strokeStyle = accentLineColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // Draw Shop/Brand Name
    const brandName = (shopSettings?.shopName || 'VASTRAA TRENDS').toUpperCase();
    ctx.fillStyle = accentLineColor;
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(brandName, canvas.width / 2, 42);

    // Draw a neat divider line
    ctx.strokeStyle = accentLineColor + '40'; // 25% opacity
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 54);
    ctx.lineTo(canvas.width - 30, 54);
    ctx.stroke();

    // Prepare QR Code Image to draw
    const qrImg = new Image();
    qrImg.onload = () => {
      // Draw QR Code on the left side
      ctx.drawImage(qrImg, 35, 75, 140, 140);

      // Draw Item Information on the right side
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0F172A'; // Slate-900

      // Garment Name (truncated if too long)
      ctx.font = 'bold 15px "Inter", sans-serif';
      let displayName = stickerData.name;
      if (displayName.length > 20) displayName = displayName.substring(0, 18) + '...';
      ctx.fillText(displayName, 195, 95);

      // Price Tag (Beautiful Display)
      ctx.fillStyle = '#DC2626'; // bright red price
      ctx.font = 'extrabold 22px "Inter", sans-serif';
      ctx.fillText(`₹${stickerData.price.toLocaleString('en-IN')}`, 195, 130);

      // Size & Color Labels
      ctx.fillStyle = '#64748B'; // slate-500
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.fillText(`SIZE: `, 195, 158);
      ctx.fillText(`COLOR: `, 195, 178);

      // Size & Color values
      ctx.fillStyle = '#0F172A';
      ctx.font = 'extrabold 13px "Inter", sans-serif';
      ctx.fillText(stickerData.size, 240, 158);
      ctx.fillText(stickerData.color, 255, 178);

      // Draw horizontal dashed line or code details at the bottom
      ctx.strokeStyle = '#CBD5E1'; // Slate-300
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(195, 194);
      ctx.lineTo(canvas.width - 35, 194);
      ctx.stroke();
      ctx.setLineDash([]); // Reset line dash

      // SKU ID display at the bottom right
      ctx.fillStyle = '#475569';
      ctx.font = 'bold 10px "JetBrains Mono", monospace';
      ctx.fillText(`SKU: ${stickerData.sku}`, 195, 212);

      // Draw a tiny decorative scissors/cut line warning or secure tag
      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 8px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✄ FOR PROFESSIONAL USE • SCAN TO BILL', canvas.width / 2, 255);

      // Download the finalized canvas image
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${stickerData.sku}_sticker_tag.png`;
      link.href = dataUrl;
      link.click();
      showToast(isMr ? 'लेबल स्टिकर पीएनजी यशस्वीरित्या डाउनलोड केले!' : 'Sticker sticker tag downloaded successfully!');
    };
    qrImg.src = qrDataUrl;
  };

  // Compile list of stickers to render in the print sheet view
  const getPrintStickersList = () => {
    if (batchItems.length === 0) {
      // Fallback: If queue is empty, print printQty copies of the single active preview item
      return Array.from({ length: printQty }).map(() => ({
        ...stickerData,
        id: selectedProductId || 'custom'
      }));
    }

    // Multiply each batch item by its specified count of copies
    const list = [];
    for (const item of batchItems) {
      for (let i = 0; i < item.copies; i++) {
        list.push(item);
      }
    }
    return list;
  };

  // Print bulk sheet action
  const handlePrintSheet = () => {
    setIsBulkPrintView(true);
    setTimeout(() => {
      window.print();
    }, 450);
  };

  // Return to normal workspace once printed
  useEffect(() => {
    if (isBulkPrintView) {
      const handleAfterPrint = () => {
        setIsBulkPrintView(false);
      };
      window.addEventListener('afterprint', handleAfterPrint);
      return () => window.removeEventListener('afterprint', handleAfterPrint);
    }
  }, [isBulkPrintView]);

  return (
    <>
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl flex items-center gap-2.5 shadow-xl font-semibold text-xs border border-emerald-500"
          >
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER BULK PRINT SHEET VIEW */}
      {isBulkPrintView ? (
        <div className="fixed inset-0 bg-white text-black z-50 overflow-y-auto p-4 md:p-12 font-sans flex flex-col items-center">
          <div className="w-full max-w-4xl text-center space-y-2 mb-6 print:hidden">
            <h1 className="text-xl font-bold text-slate-800">Print Preview (A4 Sticker Sheet)</h1>
            <p className="text-xs text-slate-500">
              Set margins to "None" or "Minimum" and layout to Portrait in your browser print prompt for the perfect sticker alignment.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer size={14} /> Trigger Print
              </button>
              <button
                onClick={() => setIsBulkPrintView(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold"
              >
                Cancel / Return
              </button>
            </div>
          </div>

          {/* Printable Sheet Grid container */}
          <div 
            className="bg-white p-2 border border-dashed border-slate-300 print:border-none print:p-0 grid gap-3 max-w-[210mm] w-full"
            style={{
              gridTemplateColumns: `repeat(${printCols}, minmax(0, 1fr))`,
            }}
          >
            {getPrintStickersList().map((item, idx) => (
              <div 
                key={idx}
                className={`bg-white text-slate-900 flex flex-col p-3 rounded-lg border aspect-[4/3] relative ${
                  labelTemplate === 'boutique' 
                    ? 'border-pink-200 shadow-sm shadow-pink-50' 
                    : labelTemplate === 'industrial' 
                      ? 'border-black' 
                      : 'border-slate-200'
                }`}
              >
                {/* Branding */}
                <div className="text-center">
                  <span className={`text-[9px] font-extrabold uppercase tracking-wide truncate block ${
                    labelTemplate === 'boutique' ? 'text-pink-600' : 'text-indigo-950'
                  }`}>
                    {shopSettings?.shopName || 'VASTRAA TRENDS'}
                  </span>
                  <div className={`h-[1px] w-full mt-1 ${
                    labelTemplate === 'boutique' ? 'bg-pink-100' : 'bg-slate-100'
                  }`} />
                </div>

                {/* Sticker content */}
                <div className="flex-1 flex gap-2 items-center mt-2 overflow-hidden">
                  {/* QR Image */}
                  <div className="w-16 h-16 shrink-0 border border-slate-100 p-0.5 rounded flex items-center justify-center bg-white">
                    <QrCodeImage 
                      payload={getStickerPayload(item)} 
                      qrColor={qrColor} 
                      qrBgColor={qrBgColor} 
                      eccLevel={eccLevel}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Product Metadata */}
                  <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-0.5">
                    <div>
                      <span className="text-[10px] font-bold truncate block leading-tight text-slate-800">
                        {item.name}
                      </span>
                      <span className="text-[11px] font-extrabold text-rose-600 block mt-0.5 leading-none">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[8px] text-slate-500 leading-none">
                        <span>SIZE: <strong className="text-slate-800 font-extrabold">{item.size}</strong></span>
                        <span>•</span>
                        <span>CLR: <strong className="text-slate-800 font-extrabold">{item.color}</strong></span>
                      </div>
                      <span className="text-[7.5px] font-mono text-slate-400 block tracking-tighter leading-none truncate">
                        SKU: {item.sku}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Decorative cut border indicator */}
                <div className="absolute right-1 bottom-1 text-[7px] text-slate-300 font-mono print:hidden">
                  #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* STANDARD WORKSPACE PANEL VIEW */
        <div className="space-y-6">
          
          {/* Header Dashboard Banner */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-indigo-600/10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full w-fit">
                <Sparkles size={14} className="text-amber-300" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90">Smart Business Utilities</span>
              </div>
              <h1 className="text-2xl font-black font-display tracking-tight leading-none">
                {isMr ? 'मल्टिपल क्यूआर कोड लेबल जनरेटर' : 'Batch Clothing QR Tag Generator'}
              </h1>
              <p className="text-xs text-indigo-100 leading-relaxed max-w-xl">
                {isMr 
                  ? 'मल्टिपल कपडे एकाच वेळी निवडा, प्रति उत्पादन प्रति स्टिकर्स सेट करा आणि मुद्रणासाठी एका क्लिकवर एक सुंदर A4 स्टिकर शीट तयार करा!'
                  : 'Select multiple outfits at once, configure different printed label quantities for each product, and generate perfectly-aligned boutique A4 sticker sheets in one tap!'}
              </p>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <button
                id="view-sheet-btn"
                onClick={() => handlePrintSheet()}
                className="px-5 py-3 bg-white text-indigo-700 hover:bg-slate-50 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-white/5 transition"
              >
                <Printer size={15} />
                {isMr ? `स्टिकर शीट प्रिंट करा (${totalBatchCopiesCount} स्टिकर्स)` : `Print Sticker Sheet (${totalBatchCopiesCount} labels)`}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: CONTROLS & SELECTION PANEL */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Step 1: Selection Mode */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Tag className="text-violet-500" size={18} />
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                      {isMr ? '१. उत्पादन माहिती निवडा' : '1. Select Products for Batch'}
                    </h2>
                  </div>
                  
                  {/* Mode switcher tabs */}
                  <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-[10px] font-bold">
                    <button
                      onClick={() => setGenerationMode('catalog')}
                      className={`px-3 py-1.5 rounded-md transition ${generationMode === 'catalog' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      {isMr ? 'कॅटलॉगमधून निवडा' : 'From Catalog'}
                    </button>
                    <button
                      onClick={() => setGenerationMode('custom')}
                      className={`px-3 py-1.5 rounded-md transition ${generationMode === 'custom' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                      {isMr ? 'मॅन्युअल एन्ट्री' : 'Manual Entry'}
                    </button>
                  </div>
                </div>

                {generationMode === 'catalog' ? (
                  <div className="space-y-4">
                    {/* Catalog search bar */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                          type="text"
                          placeholder={isMr ? "कपड्याचे नाव, बारकोड किंवा साईज शोधा..." : "Search clothes name, SKU barcode, or size..."}
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:bg-white rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none transition"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddAllFilteredToBatch}
                        className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        title={isMr ? 'सर्व शोधलेले आयटम जोडा' : 'Add all visible items'}
                      >
                        <Plus size={14} />
                        {isMr ? 'सर्व जोडा' : 'Add All'}
                      </button>
                    </div>

                    {/* Catalog grid results with stepper selection */}
                    <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2 border border-slate-100 dark:border-slate-800/80 p-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => {
                          const isSelected = selectedProductId === p.id;
                          const currentQtyInBatch = getBatchItemQty(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => setSelectedProductId(p.id)}
                              className={`w-full p-3 rounded-xl border flex justify-between items-center transition cursor-pointer ${
                                isSelected 
                                  ? 'bg-violet-50 border-violet-300 dark:bg-violet-950/20 dark:border-violet-800' 
                                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                              }`}
                            >
                              {/* Left details */}
                              <div className="space-y-1 min-w-0 pr-2 flex-1">
                                <span className={`font-bold text-xs truncate block ${isSelected ? 'text-violet-950 dark:text-violet-300' : 'text-slate-800 dark:text-slate-200'}`}>
                                  {isMr && p.itemNameMr ? p.itemNameMr : p.itemName}
                                </span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                                  <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400 uppercase">Size: {p.size}</span>
                                  <span>•</span>
                                  <span>SKU: {p.barcode || p.id}</span>
                                </div>
                              </div>
                              
                              {/* Price & selection stepper */}
                              <div className="flex items-center gap-4 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <div className="text-right">
                                  <span className="font-extrabold text-xs text-rose-600 block">₹{p.sellingPrice.toLocaleString()}</span>
                                  <span className="text-[9px] text-slate-400 font-mono">Stock: {p.currentStock} pcs</span>
                                </div>

                                {currentQtyInBatch > 0 ? (
                                  /* Active batch quantity stepper controller */
                                  <div className="flex items-center gap-1.5 bg-indigo-600 text-white rounded-lg p-0.5 shadow">
                                    <button
                                      onClick={() => handleUpdateBatchQty(p, -1)}
                                      className="p-1 hover:bg-white/25 rounded transition text-white"
                                    >
                                      <Minus size={10} strokeWidth={3} />
                                    </button>
                                    <span className="text-xs font-black px-1 min-w-[12px] text-center">{currentQtyInBatch}</span>
                                    <button
                                      onClick={() => handleUpdateBatchQty(p, 1)}
                                      className="p-1 hover:bg-white/25 rounded transition text-white"
                                    >
                                      <Plus size={10} strokeWidth={3} />
                                    </button>
                                  </div>
                                ) : (
                                  /* Non-active quick add button */
                                  <button
                                    onClick={() => handleUpdateBatchQty(p, 1)}
                                    className="px-2.5 py-1.5 border border-slate-300 hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 text-[10px] font-bold rounded-lg transition text-slate-600 hover:text-indigo-600"
                                  >
                                    + Add
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          <Package className="mx-auto mb-2 text-slate-300" size={24} />
                          {isMr ? 'कोणतेही कपडे आढळले नाहीत' : 'No clothes match your query'}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Custom manual inputs fields */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          {isMr ? 'कपड्याचे नाव' : 'Garment / Item Name'}
                        </label>
                        <input
                          type="text"
                          placeholder={isMr ? "उदा. डिझायनर पैठणी साडी" : "e.g. Designer Saree"}
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          {isMr ? 'विक्री किंमत (₹)' : 'Selling Price (₹)'}
                        </label>
                        <input
                          type="number"
                          min="0"
                          placeholder="1499"
                          value={manualPrice || ''}
                          onChange={(e) => setManualPrice(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:bg-white rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 outline-none font-mono transition"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          {isMr ? 'साईज' : 'Clothing Size'}
                        </label>
                        <select
                          value={manualSize}
                          onChange={(e) => setManualSize(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none transition"
                        >
                          {['S', 'M', 'L', 'XL', 'XXL', '3XL', 'Free Size', '28', '30', '32', '34', '36', '38'].map((sz) => (
                            <option key={sz} value={sz}>{sz}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          {isMr ? 'रंग' : 'Fabric Color'}
                        </label>
                        <input
                          type="text"
                          placeholder={isMr ? "उदा. गडद लाल" : "e.g. Deep Red"}
                          value={manualColor}
                          onChange={(e) => setManualColor(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none transition"
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          {isMr ? 'बारकोड / एसकेयू आयडी' : 'Custom SKU Barcode / ID'}
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. SKU-DESIGNER-901"
                          value={manualSku}
                          onChange={(e) => setManualSku(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-violet-500 focus:bg-white rounded-xl text-xs font-bold font-mono text-slate-800 dark:text-slate-100 outline-none transition"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddManualToBatch}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                    >
                      <Plus size={14} />
                      {isMr ? 'मॅन्युअल स्टिकर बॅचमध्ये जोडा' : 'Add Manual Label to Batch Print'}
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: DEDICATED BATCH QUEUE MANAGEMENT PANEL */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm shadow-indigo-100/10">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="text-indigo-500" size={18} />
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                      {isMr ? '२. बॅच प्रिंट रांग (क्यू)' : '2. Batch Print Queue'}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                      {totalBatchCopiesCount} labels
                    </span>
                    {batchItems.length > 0 && (
                      <button
                        onClick={handleClearBatch}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition"
                      >
                        <Trash2 size={12} />
                        {isMr ? 'रांग साफ करा' : 'Clear Queue'}
                      </button>
                    )}
                  </div>
                </div>

                {batchItems.length > 0 ? (
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                    {batchItems.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200"
                      >
                        <div className="space-y-0.5 min-w-0 pr-4 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-[9px] font-bold flex items-center justify-center font-mono">
                              {idx + 1}
                            </span>
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate block">
                              {item.name}
                            </span>
                            {item.isCustom && (
                              <span className="text-[7.5px] bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-300 border border-amber-200 px-1 rounded font-bold uppercase shrink-0">
                                Manual
                              </span>
                            )}
                          </div>
                          <span className="text-[9.5px] text-slate-400 block font-mono pl-6">
                            SKU: {item.sku} • Price: ₹{item.price.toLocaleString()} • Size: {item.size} • Color: {item.color}
                          </span>
                        </div>

                        {/* Quantity Stepper Control in Batch List */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-xs">
                            <button
                              onClick={() => updateExistingBatchRowQty(item.id, -1)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"
                            >
                              <Minus size={11} />
                            </button>
                            <span className="text-xs font-black px-1.5 min-w-[16px] text-center font-mono text-slate-800 dark:text-slate-200">{item.copies}</span>
                            <button
                              onClick={() => updateExistingBatchRowQty(item.id, 1)}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"
                            >
                              <Plus size={11} />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => deleteBatchRow(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition"
                            title="Remove"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center text-slate-400 text-xs bg-slate-50/50 dark:bg-slate-950/10 rounded-xl border border-dashed border-slate-100 dark:border-slate-800">
                    <LayoutGrid className="mx-auto mb-2 text-slate-300" size={32} />
                    <p className="font-bold text-slate-500">{isMr ? 'बॅच प्रिंटिंग रांग रिकामी आहे' : 'Print Queue is Empty'}</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto">
                      {isMr 
                        ? 'वर क्यॅटलॉगमधून कपडे जोडा किंवा स्वतंत्र मॅन्युअल स्टिकर्स जोडा.' 
                        : 'Search and add clothing products from catalog above or type manual details to begin batching stickers.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Step 3: QR Code Content Mode Config */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Settings className="text-indigo-500" size={18} />
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                    {isMr ? '३. क्यूआर कोड लिंकेज आणि कॉन्फिगरेशन' : '3. QR Code Scanner Integration'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Option A: Fast Billing SKU */}
                  <button
                    onClick={() => setQrContentMode('sku')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                      qrContentMode === 'sku'
                        ? 'bg-indigo-50/50 border-indigo-400 dark:bg-indigo-950/10 dark:border-indigo-800'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className={`font-bold text-xs ${qrContentMode === 'sku' ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      ⚡ POS Smart Scan
                    </span>
                    <span className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      {isMr ? 'थेट उत्पादनाचा बारकोड क्यूआरमध्ये भरतो जेणेकरून बिलिंग टर्मिनलवर तात्काळ स्कॅन होईल.' : 'Encodes raw SKU/Barcode. Scans instantly into invoice items via camera.'}
                    </span>
                  </button>

                  {/* Option B: Catalog URL Link */}
                  <button
                    onClick={() => setQrContentMode('catalog')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                      qrContentMode === 'catalog'
                        ? 'bg-indigo-50/50 border-indigo-400 dark:bg-indigo-950/10 dark:border-indigo-800'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className={`font-bold text-xs ${qrContentMode === 'catalog' ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      🌐 Digital Catalog Link
                    </span>
                    <span className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      {isMr ? 'ग्राहकांचे मोबाईल कॅमेरा स्कॅनिंग थेट या साडी/कपड्याच्या ऑनलाईन शॉप कॅटलॉगवर रीडायरेक्ट करते.' : 'Generates absolute URL to the public online catalog page of this outfit.'}
                    </span>
                  </button>

                  {/* Option C: Custom text */}
                  <button
                    onClick={() => setQrContentMode('custom')}
                    className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                      qrContentMode === 'custom'
                        ? 'bg-indigo-50/50 border-indigo-400 dark:bg-indigo-950/10 dark:border-indigo-800'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <span className={`font-bold text-xs ${qrContentMode === 'custom' ? 'text-indigo-900 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                      ✏️ Custom Text / URL
                    </span>
                    <span className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      {isMr ? 'विशेष प्रमोशनल लिंक्स, सोशल मीडिया हँडल्स किंवा सानुकूल मजकूर प्रविष्ट करा.' : 'Embed unique website URL, festive offers, discount codes or specific text.'}
                    </span>
                  </button>
                </div>

                {qrContentMode === 'custom' && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Custom Embed Content</label>
                    <input
                      type="text"
                      placeholder="e.g. https://instagram.com/vastraatrends"
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-medium text-slate-800 dark:text-slate-100 outline-none transition"
                    />
                  </div>
                )}

                {/* Info block for feedback preview */}
                <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-[10px] font-mono flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <div className="space-y-0.5 truncate pr-2">
                    <span className="font-bold text-slate-400 block uppercase text-[9px] tracking-wider">Payload Content String</span>
                    <span className="truncate block font-semibold text-indigo-600 dark:text-indigo-400">{payloadText}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(payloadText);
                      showToast(isMr ? 'मजकूर क्लिपबोर्डवर कॉपी केला!' : 'Embedded payload text copied to clipboard!');
                    }}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-600"
                    title="Copy to clipboard"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              </div>

              {/* Step 4: Aesthetic QR Code styling & design */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Palette className="text-emerald-500" size={18} />
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                    {isMr ? '४. क्यूआर कोड व स्टिकर डिझाइन' : '4. Customize Tag & Color Palette'}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Template selector */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      {isMr ? 'स्टिकर लेआउट टेम्प्लेट' : 'Sticker Tag Template'}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'minimalist', name: isMr ? 'मिनिमल' : 'Minimal' },
                        { id: 'boutique', name: isMr ? 'बुटीक' : 'Boutique' },
                        { id: 'industrial', name: isMr ? 'क्लासिक' : 'Mono Bold' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setLabelTemplate(t.id as any)}
                          className={`py-2 px-1 rounded-lg border text-center text-[10px] font-bold transition uppercase ${
                            labelTemplate === t.id
                              ? 'bg-slate-900 border-slate-950 text-white dark:bg-indigo-600 dark:border-indigo-500'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ECC Level */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      {isMr ? 'त्रुटी दुरुस्ती पातळी (ECC)' : 'Error Correction (ECC)'}
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { level: 'L', desc: 'Low (7%)' },
                        { level: 'M', desc: 'Med (15%)' },
                        { level: 'Q', desc: 'Quart (25%)' },
                        { level: 'H', desc: 'High (30%)' }
                      ].map((item) => (
                        <button
                          key={item.level}
                          onClick={() => setEccLevel(item.level as any)}
                          className={`py-2 rounded-lg border text-center text-[10px] font-bold transition uppercase flex flex-col items-center justify-center leading-none ${
                            eccLevel === item.level
                              ? 'bg-slate-900 border-slate-950 text-white dark:bg-indigo-600 dark:border-indigo-500'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          }`}
                          title={item.desc}
                        >
                          <span className="text-xs">{item.level}</span>
                          <span className="text-[7px] text-slate-400 font-normal mt-0.5">{item.level === 'H' ? 'Strong' : 'Standard'}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Palette Selector */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                      {isMr ? 'क्यूआर कलर थीम' : 'Interactive QR Color Foreground'}
                    </label>
                    <div className="flex flex-wrap gap-2.5">
                      {PALETTE_COLORS.map((c) => {
                        const isSelected = qrColor === c.value;
                        return (
                          <button
                            key={c.value}
                            onClick={() => setQrColor(c.value)}
                            className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-xl border text-[10px] font-bold transition hover:scale-102 ${
                              isSelected
                                ? 'bg-slate-900 border-slate-950 text-white dark:bg-indigo-950/20 dark:border-indigo-700'
                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span 
                              className="w-3.5 h-3.5 rounded-full shrink-0 border border-black/10" 
                              style={{ backgroundColor: c.value }} 
                            />
                            {c.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>

              {/* Step 5: Printable Grid layout customizers */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Grid className="text-amber-500" size={18} />
                  <h2 className="text-sm font-bold text-slate-800 dark:text-white">
                    {isMr ? '५. बल्क स्टिकर शीट रचना (A4 शीट)' : '5. Printable Sticker Sheet Layout'}
                  </h2>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Columns</label>
                    <select
                      value={printCols}
                      onChange={(e) => {
                        const cols = Number(e.target.value);
                        setPrintCols(cols);
                        setPrintQty(cols * printRows);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                    >
                      {[2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n} Labels/row</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Rows</label>
                    <select
                      value={printRows}
                      onChange={(e) => {
                        const rows = Number(e.target.value);
                        setPrintRows(rows);
                        setPrintQty(printCols * rows);
                      }}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none"
                    >
                      {[4, 5, 6, 7, 8, 9, 10, 12].map(n => (
                        <option key={n} value={n}>{n} Rows/sheet</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase block">Grid Fill Factor</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      disabled={batchItems.length > 0}
                      value={batchItems.length > 0 ? totalBatchCopiesCount : printQty}
                      onChange={(e) => setPrintQty(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-center font-bold disabled:opacity-60"
                      title={batchItems.length > 0 ? "Total copies set in the batch queue determines total printed labels." : "Set custom copies counts"}
                    />
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 leading-relaxed bg-amber-50 dark:bg-amber-950/15 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-400">
                  ⚠️ <strong>{isMr ? 'प्रिंट टीप:' : 'Tip for alignment:'}</strong> {isMr 
                    ? 'जेव्हा प्रिंट पॉप-अप उघडेल, तेव्हा "Layout" पोर्ट्रेट ठेवा आणि "Margins" None करा, जेणेकरून पूर्ण आकाराच्या स्टिकर शीटवर कट्स अचूकपणे बसतील.' 
                    : 'Adjust margins in your chrome print dialog to "None" or "Zero" so sticker layout fits standard A4 sheets perfectly without gaps.'}
                </p>
              </div>

            </div>

            {/* COLUMN 2: REAL-TIME STICKER PREVIEW & DOWNLOADS */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">
                    {isMr ? 'रीअल-टाइम स्टिकर डिझाईन पूर्वावलोकन' : 'Highlight Label Tag Preview'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {isMr ? 'हे तुमच्या सध्या हायलाईट केलेल्या कपड्याचे पूर्वावलोकन आहे.' : 'A live sample of the physical clothing tag highlighted above.'}
                  </p>
                </div>

                {/* DYNAMIC PRICE TAG CONTAINER */}
                <div className="flex justify-center p-4 bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  
                  {/* Sticker Element */}
                  <div 
                    ref={stickerRef}
                    className={`w-full max-w-[280px] bg-white text-slate-900 rounded-2xl p-5 border flex flex-col justify-between aspect-[4/3] shadow-lg transition-all relative ${
                      labelTemplate === 'boutique' 
                        ? 'border-pink-200 shadow-pink-100/50' 
                        : labelTemplate === 'industrial' 
                          ? 'border-2 border-slate-950' 
                          : 'border-slate-200'
                    }`}
                  >
                    {/* Header boutique design */}
                    <div className="text-center">
                      <span className={`text-[10px] font-black uppercase tracking-widest block ${
                        labelTemplate === 'boutique' ? 'text-pink-600' : 'text-slate-900'
                      }`}>
                        {shopSettings?.shopName || 'VASTRAA TRENDS'}
                      </span>
                      <div className={`h-[1px] w-full mt-1.5 ${
                        labelTemplate === 'boutique' ? 'bg-pink-100' : 'bg-slate-100'
                      }`} />
                    </div>

                    {/* Middle: Content with QR code */}
                    <div className="flex-1 flex gap-3.5 items-center mt-3.5 overflow-hidden">
                      {/* Left: QR code container */}
                      <div className="w-20 h-20 shrink-0 border border-slate-100 p-0.5 rounded-xl flex items-center justify-center bg-white relative">
                        {isGenerating && (
                          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
                            <RefreshCw size={14} className="animate-spin text-indigo-600" />
                          </div>
                        )}
                        {qrDataUrl ? (
                          <img 
                            src={qrDataUrl} 
                            alt="QR Payload" 
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" />
                        )}
                      </div>

                      {/* Right: Info layout */}
                      <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-1">
                        <div>
                          <span className="text-xs font-bold text-slate-900 truncate block leading-tight">
                            {stickerData.name}
                          </span>
                          <span className="text-lg font-black text-rose-600 block mt-1 leading-none font-sans">
                            ₹{stickerData.price.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold leading-none">
                            <span>SIZE: <strong className="text-slate-900 font-black">{stickerData.size}</strong></span>
                            <span>•</span>
                            <span>CLR: <strong className="text-slate-900 font-black">{stickerData.color}</strong></span>
                          </div>
                          <span className="text-[8.5px] font-mono text-slate-400 block tracking-tight leading-none truncate">
                            SKU: {stickerData.sku}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer decoration */}
                    <div className="mt-2 text-center">
                      <div className={`h-[1.5px] w-full mb-1 border-t border-dashed ${
                        labelTemplate === 'boutique' ? 'border-pink-200' : 'border-slate-200'
                      }`} />
                      <span className="text-[7.5px] text-slate-400 font-bold tracking-tight uppercase leading-none block">
                        ✄ SCAN AT POS FOR BILLING
                      </span>
                    </div>

                    {/* Ribbon accent for boutique template */}
                    {labelTemplate === 'boutique' && (
                      <div className="absolute top-0 right-5 w-4 h-1.5 bg-pink-500 rounded-b-sm" />
                    )}
                  </div>

                </div>

                {/* DOWNLOAD INDIVIDUAL & BULK PRINT BUTTONS */}
                <div className="space-y-2.5">
                  <button
                    onClick={downloadSingleSticker}
                    disabled={isGenerating || !qrDataUrl}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md cursor-pointer"
                  >
                    <Download size={15} />
                    {isMr ? 'एक स्टिकर डाऊनलोड करा (PNG)' : 'Download Single Tag (PNG)'}
                  </button>

                  <button
                    onClick={() => handlePrintSheet()}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-violet-600/10 cursor-pointer"
                  >
                    <Printer size={15} />
                    {isMr ? `स्टिकर शीट प्रिंट करा (${totalBatchCopiesCount} स्टिकर्स)` : `Print Batch Sticker Sheet (${totalBatchCopiesCount} labels)`}
                  </button>
                </div>

                {/* Additional instructions */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase block">Scanner Integration guide</span>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    By choosing **POS Smart Scan**, the QR code embeds the Product SKU Barcode. In the **Billing Terminal** view, placing your physical scanner or computer camera over the sticker will instantly load the correct item into your cart.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}
    </>
  );
}
