import React from 'react';
import { Shirt, ShoppingBag, Watch, Glasses, Package, Image as ImageIcon } from 'lucide-react';

export const getProductIcon = (name: string, category: string, className?: string, size: number = 24) => {
  const n = (name + ' ' + category).toLowerCase();
  
  if (n.includes('bag') || n.includes('purse') || n.includes('backpack')) return <ShoppingBag className={className} size={size} />;
  if (n.includes('watch') || n.includes('smartwatch')) return <Watch className={className} size={size} />;
  if (n.includes('glass') || n.includes('sunglass') || n.includes('spectacle')) return <Glasses className={className} size={size} />;
  if (n.includes('shirt') || n.includes('tshirt') || n.includes('top') || n.includes('dress') || n.includes('kurt')) return <Shirt className={className} size={size} />;
  if (n.includes('shoe') || n.includes('sneaker') || n.includes('footwear') || n.includes('sandal')) return <Package className={className} size={size} />; // Package as fallback for shoes if Footwear is missing
  
  return <ImageIcon className={className} size={size} />;
};
