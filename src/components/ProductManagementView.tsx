/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Filter, 
  AlertTriangle, 
  QrCode, 
  Barcode, 
  Tag, 
  X, 
  Info, 
  Image as ImageIcon 
} from 'lucide-react';
import { Product, Category, Brand, Supplier, AppTranslations } from '../types';

interface ProductManagementViewProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  suppliers: Supplier[];
  t: AppTranslations;
  isMr: boolean;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (category: Category) => void;
  onAddBrand: (brand: Brand) => void;
}

export default function ProductManagementView({
  products,
  categories,
  brands,
  suppliers,
  t,
  isMr,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAddCategory,
  onAddBrand
}: ProductManagementViewProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStockFilter, setSelectedStockFilter] = useState('All'); // 'All', 'Low'

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [itemName, setItemName] = useState('');
  const [itemNameMr, setItemNameMr] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || '');
  const [brand, setBrand] = useState(brands[0]?.name || '');
  const [color, setColor] = useState('');
  const [size, setSize] = useState('');
  const [unit, setUnit] = useState('Pcs');
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [gstPercent, setGstPercent] = useState(5);
  const [hsn, setHsn] = useState('');
  const [barcode, setBarcode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [minStock, setMinStock] = useState(5);
  const [openingStock, setOpeningStock] = useState(0);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');

  // Dynamic Categories and Brands creation states
  const [isAddingNewCat, setIsAddingNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatNameMr, setNewCatNameMr] = useState('');

  const [isAddingNewBrand, setIsAddingNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  const handleSaveInlineCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const code = newCatName.substring(0, 3).toUpperCase();
    const newCat: Category = {
      id: 'cat-' + Date.now(),
      name: newCatName.trim(),
      nameMr: newCatNameMr.trim() || newCatName.trim(),
      code
    };
    onAddCategory(newCat);
    setCategory(newCat.name);
    setIsAddingNewCat(false);
    setNewCatName('');
    setNewCatNameMr('');
  };

  const handleSaveInlineBrand = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    const code = newBrandName.substring(0, 3).toUpperCase();
    const newBr: Brand = {
      id: 'br-' + Date.now(),
      name: newBrandName.trim(),
      code
    };
    onAddBrand(newBr);
    setBrand(newBr.name);
    setIsAddingNewBrand(false);
    setNewBrandName('');
  };

  // Search filter implementation
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.itemNameMr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.barcode.includes(searchQuery) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All' || p.brand === selectedBrand;
    const matchesStock = selectedStockFilter === 'All' || (selectedStockFilter === 'Low' && p.currentStock <= p.minStock);

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setItemName('');
    setItemNameMr('');
    setCategory(categories[0]?.name || 'Shirts');
    setBrand(brands[0]?.name || 'Raymond');
    setIsAddingNewCat(false);
    setIsAddingNewBrand(false);
    setNewCatName('');
    setNewCatNameMr('');
    setNewBrandName('');
    setColor('');
    setSize('');
    setUnit('Pcs');
    setPurchasePrice(0);
    setSellingPrice(0);
    setGstPercent(5);
    setHsn('');
    // Auto-generate a dummy barcode
    const dummyBarcode = '89010' + Math.floor(1000000 + Math.random() * 9000000);
    setBarcode(dummyBarcode);
    setQrCode('QR_' + dummyBarcode);
    setImages(['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500']);
    setMinStock(5);
    setOpeningStock(10);
    setSupplierId(suppliers[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setItemName(p.itemName);
    setItemNameMr(p.itemNameMr);
    setCategory(p.category);
    setBrand(p.brand);
    setIsAddingNewCat(false);
    setIsAddingNewBrand(false);
    setNewCatName('');
    setNewCatNameMr('');
    setNewBrandName('');
    setColor(p.color);
    setSize(p.size);
    setUnit(p.unit);
    setPurchasePrice(p.purchasePrice);
    setSellingPrice(p.sellingPrice);
    setGstPercent(p.gstPercent);
    setHsn(p.hsn);
    setBarcode(p.barcode);
    setQrCode(p.qrCode);
    setImages(p.images);
    setMinStock(p.minStock);
    setOpeningStock(p.openingStock);
    setSupplierId(p.supplierId);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      category,
      brand,
      itemName,
      itemNameMr: itemNameMr || itemName, // fallback
      color,
      size,
      unit,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      gstPercent: Number(gstPercent),
      hsn,
      barcode,
      qrCode,
      images,
      minStock: Number(minStock),
      openingStock: Number(openingStock),
      supplierId
    };

    if (editingProduct) {
      onEditProduct({
        ...productData,
        id: editingProduct.id,
        currentStock: editingProduct.currentStock // Preserve current stock level
      });
    } else {
      onAddProduct({
        ...productData,
        currentStock: Number(openingStock) // set initial stock
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-sans">{t.products}</h1>
          <p className="text-xs text-slate-500">
            {isMr ? 'कपड्यांचा स्टॉक व्यवस्थापन | एकूण उत्पादने: ' : 'Catalog Inventory & Alert Controls | Total Items: '}
            <span className="font-bold text-indigo-600">{products.length}</span>
          </p>
        </div>
        <button 
          id="add-product-modal-btn"
          onClick={openAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2.5 rounded-xl text-xs font-semibold text-white shadow-lg shadow-indigo-600/10"
        >
          <Plus size={14} />
          {t.addProduct}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input 
            type="text"
            placeholder={t.search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
          >
            <option value="All">{isMr ? 'सर्व श्रेणी' : 'All Categories'}</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{isMr ? c.nameMr : c.name}</option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-slate-400 shrink-0" />
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
          >
            <option value="All">{isMr ? 'सर्व ब्रँड्स' : 'All Brands'}</option>
            {brands.map(b => (
              <option key={b.id} value={b.name}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Stock Status Alert Trigger */}
        <select
          value={selectedStockFilter}
          onChange={(e) => setSelectedStockFilter(e.target.value)}
          className={`p-2 border rounded-lg text-xs bg-white outline-none font-semibold ${selectedStockFilter === 'Low' ? 'border-amber-400 text-amber-700 bg-amber-50/20' : 'border-slate-200'}`}
        >
          <option value="All">{isMr ? 'सर्व स्टॉक लेव्हल्स' : 'All Stock Levels'}</option>
          <option value="Low" className="text-amber-700 font-bold">⚠️ {isMr ? 'कमी स्टॉक अलर्ट' : 'Low Stock Only'}</option>
        </select>
      </div>

      {/* Main Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map(p => {
          const isLowStock = p.currentStock <= p.minStock;
          const markupPercent = Math.round(((p.sellingPrice - p.purchasePrice) / p.purchasePrice) * 100);

          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`bg-white rounded-xl border p-4 flex flex-col justify-between hover:shadow-md transition relative overflow-hidden ${isLowStock ? 'border-amber-200 ring-2 ring-amber-500/10' : 'border-slate-200'}`}
            >
              {/* Image & Main Info row */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative flex items-center justify-center border border-slate-100">
                    {p.images[0] ? (
                      <img src={p.images[0]} alt={p.itemName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <ImageIcon className="text-slate-400" size={24} />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex gap-1 items-center flex-wrap">
                      <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded uppercase">
                        {p.brand}
                      </span>
                      <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
                        {isMr ? (categories.find(c => c.name === p.category)?.nameMr || p.category) : p.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-slate-900 line-clamp-2">
                      {isMr ? p.itemNameMr : p.itemName}
                    </h3>
                    <div className="text-[10px] text-slate-500 space-x-2">
                      <span>{isMr ? `रंग: ${p.color}` : `Color: ${p.color}`}</span>
                      <span>•</span>
                      <span className="font-bold text-slate-700">{isMr ? `आकार: ${p.size}` : `Size: ${p.size}`}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Level Bar */}
                <div className="bg-slate-50 p-2.5 rounded-lg space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-medium">{isMr ? 'साठा प्रमाण:' : 'Current Stock:'}</span>
                    <span className={`font-bold ${isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>
                      {p.currentStock} / {p.minStock} {p.unit}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isLowStock ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min((p.currentStock / (p.minStock * 2)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  {isLowStock && (
                    <span className="text-[9px] text-amber-700 font-semibold flex items-center gap-0.5">
                      <AlertTriangle size={10} /> {isMr ? 'कमी साठा - खरेदी आवश्यक!' : 'Low stock - Reorder required!'}
                    </span>
                  )}
                </div>

                {/* Barcode / QR simulator rendering */}
                <div className="border border-dashed border-slate-200 p-2 rounded-lg flex justify-between items-center bg-slate-50/50">
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase font-mono tracking-wider text-slate-400 font-semibold block">Simulated Barcode</span>
                    <div className="flex items-center gap-1">
                      <Barcode size={14} className="text-slate-600" />
                      <span className="font-mono text-[10px] text-slate-700 font-semibold">{p.barcode}</span>
                    </div>
                  </div>
                  <div className="w-7 h-7 border border-slate-200 rounded flex items-center justify-center bg-white shadow-3xs cursor-pointer hover:bg-slate-50" title="Simulated QR code">
                    <QrCode size={16} className="text-indigo-600" />
                  </div>
                </div>

                {/* Pricing tags */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{isMr ? 'खरेदी दर (Cost)' : 'Purchase Cost'}</span>
                    <span className="font-bold text-slate-600 font-mono">₹{p.purchasePrice}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">{isMr ? 'विक्री दर (Retail)' : 'Retail Price'}</span>
                    <span className="font-bold text-indigo-700 font-mono text-sm">₹{p.sellingPrice}</span>
                    <span className="text-[9px] text-emerald-600 font-semibold block font-mono">+{markupPercent}% Margin</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100 justify-end">
                <button
                  id={`edit-prod-${p.id}`}
                  onClick={() => openEditModal(p)}
                  className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  title="Edit Product"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  id={`delete-prod-${p.id}`}
                  onClick={() => {
                    if(confirm(isMr ? 'हे उत्पादन खरोखर हटवायचे आहे का?' : 'Are you sure you want to delete this product?')) {
                      onDeleteProduct(p.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete Product"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit/Add Modal Screen Sheet overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 font-sans">
                {editingProduct ? (isMr ? 'उत्पादन सुधारा (Edit Cloth Details)' : 'Edit Product Details') : t.addProduct}
              </h3>
              <button 
                id="close-product-modal-btn"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4 text-xs text-slate-700">
              {/* Row 1: Names (Eng / Mr) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-600">{t.itemName} (English)</label>
                  <input 
                    type="text"
                    required
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="e.g. Premium Linen White Shirt"
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-600">{t.itemName} (मराठी)</label>
                  <input 
                    type="text"
                    required
                    value={itemNameMr}
                    onChange={(e) => setItemNameMr(e.target.value)}
                    placeholder="उदा. प्रीमियम लिनेन पांढरा शर्ट"
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500 bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* Row 2: Category & Brand selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold block text-slate-600">{t.category}</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewCat(!isAddingNewCat)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-500 font-bold hover:underline transition"
                    >
                      {isAddingNewCat ? (isMr ? '✕ रद्द' : '✕ Cancel') : (isMr ? '➕ नवीन वर्ग' : '➕ New Category')}
                    </button>
                  </div>
                  
                  {isAddingNewCat ? (
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-medium">Name (Eng)</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Shirts"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white focus:border-indigo-500 outline-none text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-medium">नाव (मराठी)</label>
                          <input
                            type="text"
                            required
                            placeholder="उदा. शर्ट्स"
                            value={newCatNameMr}
                            onChange={(e) => setNewCatNameMr(e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white focus:border-indigo-500 outline-none text-slate-800"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveInlineCategory}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded text-[10px] transition shadow-xs"
                      >
                        {isMr ? 'श्रेणी जतन करा' : 'Save Category'}
                      </button>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.name}>{isMr ? c.nameMr : c.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="font-semibold block text-slate-600">{t.brand}</label>
                    <button
                      type="button"
                      onClick={() => setIsAddingNewBrand(!isAddingNewBrand)}
                      className="text-[10px] text-indigo-600 hover:text-indigo-500 font-bold hover:underline transition"
                    >
                      {isAddingNewBrand ? (isMr ? '✕ रद्द' : '✕ Cancel') : (isMr ? '➕ नवीन ब्रँड' : '➕ New Brand')}
                    </button>
                  </div>

                  {isAddingNewBrand ? (
                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                      <div>
                        <label className="text-[10px] text-slate-500 font-medium">Brand Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Raymond"
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                          className="w-full p-1.5 border border-slate-200 rounded text-xs bg-white focus:border-indigo-500 outline-none text-slate-800"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSaveInlineBrand}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-1.5 rounded text-[10px] transition shadow-xs"
                      >
                        {isMr ? 'ब्रँड जतन करा' : 'Save Brand'}
                      </button>
                    </div>
                  ) : (
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white focus:border-indigo-500"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Row 3: Color, Size, Unit */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-600">{t.color}</label>
                  <input 
                    type="text"
                    required
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="e.g. White / Pink"
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-600">{t.size}</label>
                  <input 
                    type="text"
                    required
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="e.g. L / 32 / XL"
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-600">{t.unit}</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white"
                  >
                    <option value="Pcs">Pieces (Pcs)</option>
                    <option value="Meters">Meters (M)</option>
                    <option value="Bundle">Bundle (Bndl)</option>
                  </select>
                </div>
              </div>

              {/* Row 4: HSN & Codes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-600">{t.hsn}</label>
                  <input 
                    type="text"
                    value={hsn}
                    onChange={(e) => setHsn(e.target.value)}
                    placeholder="e.g. 610510"
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white text-slate-800"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="font-semibold block text-slate-600">Barcode / SKU Identifier</label>
                  <input 
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => {
                      setBarcode(e.target.value);
                      setQrCode('QR_' + e.target.value);
                    }}
                    placeholder="Barcode string"
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-slate-50 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Row 5: Financial Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-indigo-50/40 p-3 rounded-lg border border-indigo-100/60">
                <div className="space-y-1">
                  <label className="font-semibold block text-indigo-950">{t.purchasePrice} (₹)</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    value={purchasePrice || ''}
                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white font-semibold font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block text-indigo-950">{t.sellingPrice} (₹)</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    value={sellingPrice || ''}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white font-bold font-mono text-indigo-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block text-indigo-950">{t.gst} (%)</label>
                  <select
                    value={gstPercent}
                    onChange={(e) => setGstPercent(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white font-mono font-semibold"
                  >
                    <option value="0">0% (Exempted)</option>
                    <option value="5">5% (Garments &lt; 1000)</option>
                    <option value="12">12% (Garments &gt; 1000)</option>
                    <option value="18">18% (Luxury Fabrics)</option>
                  </select>
                </div>
              </div>

              {/* Row 6: Stocks, Supplier */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-600">
                    {editingProduct ? (isMr ? 'साठा मर्यादीत ठेवा' : 'Min Alert Threshold') : t.openingStock}
                  </label>
                  <input 
                    type="number"
                    required
                    min="0"
                    value={editingProduct ? minStock : openingStock}
                    onChange={(e) => editingProduct ? setMinStock(Number(e.target.value)) : setOpeningStock(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-600">{t.minStock} (Alert)</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold block text-slate-600">Product Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg outline-none bg-white"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{isMr ? s.nameMr : s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <button
                  id="cancel-product-btn"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 transition text-slate-600 rounded-lg font-semibold"
                >
                  {t.cancel}
                </button>
                <button
                  id="save-product-btn"
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-600/15"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
