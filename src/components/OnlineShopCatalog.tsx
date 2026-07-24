/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  Heart, 
  CheckCircle, 
  Truck, 
  Clock, 
  CreditCard,
  Grid,
  ChevronRight
} from 'lucide-react';
import { Product, Category, AppTranslations } from '../types';
import { getProductIcon } from '../utils/productIcons';

interface OnlineShopCatalogProps {
  products: Product[];
  categories: Category[];
  t: AppTranslations;
  isMr: boolean;
}

export default function OnlineShopCatalog({
  products,
  categories,
  t,
  isMr
}: OnlineShopCatalogProps) {
  // Ecom States
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Checkout timeline simulation
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [orderTimelineStep, setOrderTimelineStep] = useState(1); // 1: Placed, 2: Packed, 3: Shipped

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.itemNameMr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(item => item !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);

  const handleCheckout = () => {
    setOrderPlaced(true);
    setCart([]);
    // Simulate timeline steps increments
    setTimeout(() => setOrderTimelineStep(2), 2000);
    setTimeout(() => setOrderTimelineStep(3), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-pink-500 to-indigo-600 p-8 rounded-2xl text-white space-y-2 shadow-lg">
        <span className="text-[10px] font-mono font-bold tracking-widest uppercase bg-white/20 px-2.5 py-1 rounded-full w-fit block">
          Dynamic E-Commerce Showcase
        </span>
        <h2 className="text-2xl font-bold font-sans tracking-tight">
          {isMr ? 'वस्त्रा ऑनलाइन दालन' : 'Vastraa Online Public Catalog'}
        </h2>
        <p className="text-white/80 text-xs max-w-xl">
          {isMr ? 'तुमच्या आवडत्या कपड्यांची खरेदी आता घरबसल्या करा. १००% खात्रीशीर कापड आणि वेगवान डिलिव्हरी.' : 'A beautiful, fully responsive consumer-facing web catalogue. Showcasing live categories, dynamic cart checkouts, and real-time shipping tracking.'}
        </p>
      </div>

      {/* Main Ecom Section layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-xs text-slate-700">
        
        {/* Left Side: Search & Categories Selector (1 Column) */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">Catalog Filter</h4>
            <div className="relative">
              <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Search catalog..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg outline-none text-xs focus:ring-1 focus:ring-pink-400"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono mb-2">Categories</h4>
            <button
              onClick={() => setSelectedCategory('All')}
              className={`w-full text-left p-2 rounded-lg font-semibold transition ${selectedCategory === 'All' ? 'bg-pink-50 text-pink-600' : 'hover:bg-slate-50'}`}
            >
              All Products
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.name)}
                className={`w-full text-left p-2 rounded-lg font-semibold transition ${selectedCategory === c.name ? 'bg-pink-50 text-pink-600' : 'hover:bg-slate-50'}`}
              >
                {isMr ? c.nameMr : c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Middle Area: Products List (2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map(p => {
              const inWishlist = wishlist.includes(p.id);

              return (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-3.5 hover:shadow-md transition flex flex-col justify-between space-y-3">
                  <div className="space-y-2 relative">
                    {/* Simulated ecom picture */}
                    <div className="w-full h-40 bg-slate-100 rounded-lg overflow-hidden relative border border-slate-100 flex items-center justify-center">
                      {p.images[0] && p.images[0] !== 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500' ? (
                        <img src={p.images[0]} alt={p.itemName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        getProductIcon(p.itemName, p.category, "text-slate-400", 32)
                      )}
                      
                      <button 
                        onClick={() => toggleWishlist(p.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-xs hover:bg-white text-pink-500 shadow-xs transition"
                      >
                        <Heart size={14} fill={inWishlist ? '#ec4899' : 'none'} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 font-bold uppercase font-mono">{p.brand}</span>
                      <h4 className="font-bold text-xs text-slate-800 leading-snug line-clamp-2">
                        {isMr ? p.itemNameMr : p.itemName}
                      </h4>
                      <p className="text-[10px] text-slate-400">Available size: <strong>{p.size}</strong></p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                    <span className="font-bold text-sm text-indigo-700 font-mono">₹{p.sellingPrice}</span>
                    <button
                      id={`ecom-add-to-cart-${p.id}`}
                      onClick={() => addToCart(p)}
                      className="flex items-center gap-1.5 bg-pink-600 hover:bg-pink-500 text-white font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      <ShoppingCart size={12} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Virtual Shopping Cart & Live Tracking Timeline (1 Column) */}
        <div className="space-y-4">
          {/* Cart Panel */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-100 pb-2">
              <ShoppingBag size={14} className="text-pink-500" />
              Shopping Bag ({cart.reduce((s, i) => s + i.quantity, 0)})
            </h4>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-slate-400 space-y-1">
                <ShoppingCart className="mx-auto text-slate-300" size={24} />
                <p>Your shopping cart is empty.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex justify-between items-center text-xs">
                      <div className="space-y-0.5 max-w-[120px]">
                        <span className="font-bold text-slate-800 block truncate">{isMr ? item.product.itemNameMr : item.product.itemName}</span>
                        <span className="text-[10px] text-slate-400 font-mono">₹{item.product.sellingPrice} x{item.quantity}</span>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-300 hover:text-rose-600 text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2.5">
                  <div className="flex justify-between font-bold text-slate-900 text-xs">
                    <span>Subtotal:</span>
                    <span className="font-mono text-pink-600">₹{cartTotal.toLocaleString()}</span>
                  </div>

                  <button
                    id="ecom-open-checkout"
                    onClick={() => setIsCheckoutOpen(true)}
                    className="w-full py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg transition shadow-md shadow-pink-600/15 text-center"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Checkout modal / tracking timeline inside right panel */}
          {isCheckoutOpen && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
              {!orderPlaced ? (
                <div className="space-y-3 text-xs">
                  <h4 className="font-bold text-slate-900 uppercase font-mono">Select Payment</h4>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPaymentMethod('COD')}
                      className={`w-1/2 py-2 border rounded-lg font-bold text-center ${paymentMethod === 'COD' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      Cash on Delivery
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('ONLINE')}
                      className={`w-1/2 py-2 border rounded-lg font-bold text-center ${paymentMethod === 'ONLINE' ? 'border-pink-500 bg-pink-50 text-pink-600' : 'border-slate-200 hover:bg-slate-50'}`}
                    >
                      UPI / Card Pay
                    </button>
                  </div>
                  <button
                    id="ecom-place-order"
                    onClick={handleCheckout}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
                  >
                    Confirm & Place Order
                  </button>
                </div>
              ) : (
                /* Interactive timeline steps tracker */
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                    <CheckCircle size={16} />
                    <span>Order Placed Successfully!</span>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-bold text-slate-500 font-mono uppercase tracking-wider text-[9px]">Live Shipping Tracker</h5>
                    
                    <div className="space-y-4 relative pl-5 text-xs">
                      {/* Vertical line indicator */}
                      <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-slate-200"></div>

                      <div className="relative">
                        <div className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${orderTimelineStep >= 1 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200'}`}>1</div>
                        <span className={`font-bold block ${orderTimelineStep >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>Order Registered & Approved</span>
                        <span className="text-[10px] text-slate-400 font-mono block">Sat, 18 Jul 13:17</span>
                      </div>

                      <div className="relative">
                        <div className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${orderTimelineStep >= 2 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200'}`}>2</div>
                        <span className={`font-bold block ${orderTimelineStep >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>Products Packaged (Wharehouse Satara)</span>
                        <span className="text-[10px] text-slate-400 font-mono block">Sat, 18 Jul 13:17</span>
                      </div>

                      <div className="relative">
                        <div className={`absolute -left-5 top-0.5 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${orderTimelineStep >= 3 ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200'}`}>3</div>
                        <span className={`font-bold block ${orderTimelineStep >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>Out for Delivery (Swargate Pune Courier Hub)</span>
                        <span className="text-[10px] text-slate-400 font-mono block">Processing Transit</span>
                      </div>
                    </div>
                  </div>

                  <button 
                    id="ecom-reset"
                    onClick={() => {
                      setIsCheckoutOpen(false);
                      setOrderPlaced(false);
                      setOrderTimelineStep(1);
                    }}
                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 font-semibold rounded-lg text-center"
                  >
                    Close Tracker
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
