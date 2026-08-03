import { useState, useMemo, useEffect, useRef } from 'react'; import { Button } from '@/components/ui/Button';

import { Search, Grid, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useMenuCategories } from '@/hooks/useMenuCategories';
import { MenuItem } from '@/types/menu';

interface ProductCatalogProps {
  onAddProduct: (product: MenuItem, quantity: number) => void;
}

export function ProductCatalog({ onAddProduct }: ProductCatalogProps) {
  const { items, isLoading } = useMenuItems();
  const { categories } = useMenuCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount or when keyboard shortcuts are pressed
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }

    // Capture global escape or keypresses to focus search easily
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter only active categories for client selection
  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.isActive !== false);
  }, [categories]);

  // Compute final filtered items list
  const filteredProducts = useMemo(() => {
    return items.filter((item) => {
      // Match category
      const matchesCategory =
        selectedCategory === 'all' ||
        item.category?.toLowerCase() === selectedCategory.toLowerCase();

      // Match search query
      const matchesSearch =
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full overflow-hidden select-none">

      {/* Top Search Experience Bar */}
      <div className="relative mb-4">
        <Input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items or category... (Press '/' to focus)"
          leftIcon={<Search size={18} />}
        />
        {searchQuery && (
          <Button variant="custom" size="none" onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary text-xs font-bold font-mono px-1.5 py-0.5 hover:bg-surface-hover rounded-md transition-colors cursor-pointer"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Segmented Pill Category Selector - No Emoji Icons */}
      <div className="flex items-center gap-1 bg-[#F5F5F5] border border-border-subtle/35 p-1 rounded-full mb-4 shadow-inner select-none overflow-x-auto no-scrollbar max-w-full w-max">
        <Button variant="custom" size="none" onClick={() => setSelectedCategory('all')}
          className={`
            flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap
            ${selectedCategory === 'all'
              ? 'bg-white text-accent-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
            }
          `}
        >
          <Grid size={14} />
          <span>All Products</span>
        </Button>

        {activeCategories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          return (
            <Button variant="custom" size="none" key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`
                flex items-center gap-1.5 px-4.5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap
                ${isSelected
                  ? 'bg-white text-accent-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
                }
              `}
            >
              <span>{cat.name}</span>
            </Button>
          );
        })}
      </div>

      {/* Main product catalogue in table form */}
      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="bg-white border border-border-subtle rounded-xl overflow-hidden shadow-xs animate-pulse">
            <div className="h-10 bg-slate-50 border-b border-border-subtle" />
            <div className="divide-y divide-border-subtle/40">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="space-y-2 w-1/3">
                    <div className="h-4 bg-slate-100 rounded w-full" />
                    <div className="h-3 bg-slate-100 rounded w-2/3" />
                  </div>
                  <div className="h-4 bg-slate-100 rounded w-16" />
                  <div className="h-7 bg-slate-100 rounded w-24" />
                  <div className="h-7 bg-slate-100 rounded w-16" />
                </div>
              ))}
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="bg-white border border-border-subtle rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 border-b border-border-subtle text-[11px] font-bold tracking-wider text-text-secondary uppercase select-none font-inter">
                    <th className="py-3 px-4 font-semibold text-text-secondary">Product</th>
                    <th className="py-3 px-4 font-semibold text-text-secondary">Category</th>
                    <th className="py-3 px-4 font-semibold text-text-secondary text-right">Price</th>
                    <th className="py-3 px-4 font-semibold text-text-secondary text-center">Quantity</th>
                    <th className="py-3 px-4 font-semibold text-text-secondary text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/40">
                  {filteredProducts.map((prod) => (
                    <ProductRow
                      key={prod.id}
                      product={prod}
                      onAdd={onAddProduct}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border-subtle rounded-2xl text-text-secondary bg-surface-muted/20 select-none min-h-[300px]">
            <div className="w-12 h-12 rounded-full bg-white border border-border-subtle flex items-center justify-center mb-3 text-text-secondary shadow-xs">
              <HelpCircle size={20} />
            </div>
            <h5 className="font-poppins font-bold text-text-primary text-sm">No items found</h5>
            <p className="text-xs text-text-secondary mt-1 max-w-xs leading-relaxed">
              We couldn't find any products matching "{searchQuery}" under {selectedCategory === 'all' ? 'all products' : `"${selectedCategory}"`}.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

function ProductRow({
  product,
  onAdd
}: {
  product: MenuItem;
  onAdd: (product: MenuItem, quantity: number) => void;
  key?: string | number;
}) {
  const [qty, setQty] = useState(1);
  const isAvailable = product.isAvailable !== false;
  const groups = product.variantGroups || product.variants || [];
  const hasVariants = groups.length > 0;

  const hasDiscount = product.discountPrice !== undefined && product.discountPrice < product.basePrice && product.discountPrice > 0;
  const activePrice = hasDiscount ? product.discountPrice : product.basePrice;

  const handleIncrement = () => setQty((prev) => prev + 1);
  const handleDecrement = () => setQty((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddClick = () => {
    if (isAvailable) {
      onAdd(product, qty);
      setQty(1); // Reset qty to 1 after adding
    }
  };

  return (
    <tr className={`border-b border-border-subtle/40 hover:bg-slate-50/30 transition-colors ${!isAvailable ? 'opacity-50 bg-slate-50/10' : ''}`}>
      <td className="py-3.5 px-4 max-w-[220px] sm:max-w-xs">
        <div className="flex flex-col text-left">
          <span className="font-semibold text-xs sm:text-sm text-text-primary leading-tight">
            {product.name}
          </span>
          {product.description && (
            <span className="text-[10px] text-text-secondary mt-0.5 line-clamp-1 font-normal">
              {product.description}
            </span>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1 select-none">
            {product.badge && product.badge !== 'None' && (
              <span className="text-[8px] font-extrabold bg-accent-dark/95 text-white px-2 py-0.2 rounded-full uppercase tracking-wider">
                {product.badge}
              </span>
            )}
            {hasVariants && (
              <span className="text-[8px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 px-1.5 py-0.2 rounded-md">
                Has Options
              </span>
            )}
            {!isAvailable && (
              <span className="text-[8px] font-extrabold bg-red-100 text-red-700 px-1.5 py-0.2 rounded-md uppercase tracking-wider">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </td>
      <td className="py-3.5 px-4 text-xs font-semibold text-text-secondary capitalize">
        {product.category}
      </td>
      <td className="py-3.5 px-4 text-right">
        <div className="flex flex-col items-end">
          <span className="text-xs sm:text-sm font-bold text-text-primary font-mono">
            Rs. {activePrice.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-text-secondary line-through font-mono">
              Rs. {product.basePrice.toLocaleString()}
            </span>
          )}
        </div>
      </td>
      <td className="py-3.5 px-4">
        <div className="flex items-center justify-center gap-1.5">
          <Button variant="custom" size="none" onClick={handleDecrement}
            disabled={!isAvailable || qty <= 1}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-subtle bg-white hover:bg-slate-50 active:scale-95 text-text-secondary hover:text-text-primary transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer text-xs font-bold"
          >
            -
          </Button>
          <Input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val >= 1) {
                setQty(val);
              }
            }}
            disabled={!isAvailable}
          />
          <Button variant="custom" size="none" onClick={handleIncrement}
            disabled={!isAvailable}
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-subtle bg-white hover:bg-slate-50 active:scale-95 text-text-secondary hover:text-text-primary transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer text-xs font-bold"
          >
            +
          </Button>
        </div>
      </td>
      <td className="py-3.5 px-4 text-right">
        <Button variant="custom" size="none" onClick={handleAddClick}
          disabled={!isAvailable}
          className={`
            px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed
            ${hasVariants
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-accent-primary hover:bg-accent-dark text-white'
            }
          `}
        >
          {hasVariants ? 'Options' : '+ Add'}
        </Button>
      </td>
    </tr>
  );
}
