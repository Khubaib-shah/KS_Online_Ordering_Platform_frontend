import { Select } from '../../ui/Select';import { Button } from '@/components/ui/Button';

import React from 'react';
import { Input } from '../../ui/Input';
import { MenuItem } from '../../../types/menu';
import { Layers } from 'lucide-react';

interface ProductCardProps {
  product: MenuItem;
  onAdd: (product: MenuItem) => void;
  key?: string | number;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const isAvailable = product.isAvailable !== false;
  const groups = product.variantGroups || product.variants || [];
  const hasVariants = groups.length > 0;
  
  // Calculate active price
  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.basePrice && product.discountPrice > 0;
  const activePrice = hasDiscount ? product.discountPrice : product.basePrice;

  // Render safe local preview or clean initials fallback
  const renderImageFallback = () => {
    const initials = product.name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
    return (
      <div className="w-full h-full bg-accent-tint-bg/50 flex items-center justify-center text-accent-primary font-poppins font-bold text-sm uppercase">
        {initials}
      </div>
    );
  };

  return (
    <Button variant="custom" size="none"       onClick={() => isAvailable && onAdd(product)}
      disabled={!isAvailable}
      className={`
        relative flex flex-col bg-white border rounded-xl overflow-hidden transition-all text-left select-none h-full w-full group cursor-pointer active:scale-98 focus:outline-none focus:ring-2 focus:ring-accent-primary/20
        ${
          isAvailable
            ? 'border-border-subtle hover:border-accent-primary/30 hover:shadow-sm'
            : 'border-border-subtle opacity-65 bg-surface-muted/30 cursor-not-allowed'
        }
      `}
    >
      {/* Top Banner / Image area */}
      <div className="relative w-full aspect-video sm:aspect-square md:aspect-video bg-surface-muted border-b border-border-subtle overflow-hidden shrink-0">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                // Render initials
                parent.innerHTML = `<div class="w-full h-full bg-accent-tint-bg/50 flex items-center justify-center text-[#156A45] font-bold text-sm uppercase font-poppins">${product.name.substring(0, 2).toUpperCase()}</div>`;
              }
            }}
          />
        ) : (
          renderImageFallback()
        )}

        {/* Badge status overlay */}
        {product.badge && product.badge !== 'None' && (
          <span className="absolute top-2 left-2 text-[8px] font-extrabold bg-accent-dark/95 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            {product.badge}
          </span>
        )}

        {/* Custom Options / Variants Indicator Badge */}
        {hasVariants && (
          <span className="absolute top-2 right-2 flex items-center gap-1 text-[8px] font-bold bg-white/90 backdrop-blur-xs border border-border-subtle/80 text-text-primary px-1.5 py-0.5 rounded-md shadow-xs">
            <Layers size={9} />
            Options
          </span>
        )}

        {/* Sold Out Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/45 backdrop-blur-xs flex items-center justify-center">
            <span className="text-white font-poppins font-extrabold text-[10px] uppercase tracking-widest bg-red-600 px-3 py-1 rounded-full shadow-sm">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Title & Price Footer Info */}
      <div className="p-3 flex-1 flex flex-col justify-between gap-1.5 min-w-0">
        <div className="min-w-0">
          <h4 className="font-poppins font-bold text-xs sm:text-sm text-text-primary group-hover:text-accent-primary transition-colors line-clamp-2 leading-tight">
            {product.name}
          </h4>
          {product.description && (
            <p className="text-[10px] text-text-secondary line-clamp-1 mt-0.5 font-normal">
              {product.description}
            </p>
          )}
        </div>

        <div className="flex items-baseline justify-between gap-2 mt-auto">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-bold text-text-primary font-mono">
              Rs. {activePrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-text-secondary line-through font-mono font-medium">
                Rs. {product.basePrice.toLocaleString()}
              </span>
            )}
          </div>
          
          <span className="text-[10px] font-bold text-accent-primary bg-accent-tint-bg border border-accent-light/10 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 transition-all">
            + Add
          </span>
        </div>
      </div>
    </Button>
  );
}
