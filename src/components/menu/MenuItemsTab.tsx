import React, { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Select } from '@/components/ui/Select';
import { useUIStore } from '@/store/uiStore';
import { MenuItem } from '@/types/menu';
import { useMenuItems } from '@/hooks/useMenuItems';
import { useMenuCategories } from '@/hooks/useMenuCategories';
import { MenuItemModal } from './MenuItemModal';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableToolbar } from '@/components/data-table/DataTableToolbar';
import { Combobox } from '@/components/ui/Combobox';
import { useConfirmation } from '@/components/ui/confirmation/useConfirmation';
import { Plus, Edit2, Trash2, ShoppingBag, EyeOff, Layers, Globe } from 'lucide-react';


export function MenuItemsTab() {
  const confirm = useConfirmation();
  const { addToast, openAddItemTrigger, setOpenAddItemTrigger } = useUIStore();
  const { items, isLoading, saveItem, deleteItem } = useMenuItems();
  const { categories } = useMenuCategories();

  // Local Search & Filtering States
  const [searchValue, setSearchValue] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onlineFilter, setOnlineFilter] = useState<string>('all');
  const [badgeFilter, setBadgeFilter] = useState<string>('all');

  // Modal State Controllers
  const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Listen for global shortcut triggers to open Add Item modal
  React.useEffect(() => {
    if (openAddItemTrigger) {
      setSelectedItem(undefined);
      setIsModalOpen(true);
      setOpenAddItemTrigger(false);
    }
  }, [openAddItemTrigger, setOpenAddItemTrigger]);

  // Table Columns Setup
  const columns = useMemo<ColumnDef<MenuItem>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
            className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary cursor-pointer accent-accent-primary"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(!!e.target.checked)}
            className="w-4 h-4 rounded text-accent-primary focus:ring-accent-primary cursor-pointer accent-accent-primary no-row-click"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: 'Dish / Item Title',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-col select-none">
              <div className="flex items-center gap-2">
                <span className="font-poppins font-bold text-sm text-text-primary line-clamp-1">{item.name}</span>
                {item.badge && (
                  <span className={`
                    text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide
                    ${item.badge === 'Best Seller'
                      ? 'bg-[#CA8A04]/10 text-[#CA8A04] border border-[#CA8A04]/15'
                      : item.badge === 'New'
                        ? 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/15'
                        : 'bg-accent-tint-bg text-accent-primary border border-accent-light/30'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
              </div>
              {item.description && (
                <span className="text-xs font-medium text-text-secondary mt-0.5 line-clamp-1 max-w-sm">{item.description}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => {
          const val = row.getValue('category') as string;
          return (
            <span className="text-xs font-bold text-accent-primary bg-accent-tint-bg px-2.5 py-1 rounded-full border border-accent-light/30 select-none">
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: 'basePrice',
        header: 'Base Price',
        cell: ({ row }) => {
          const base = row.getValue('basePrice') as number;
          return (
            <span className="text-sm font-semibold text-text-secondary line-through">
              Rs. {base.toLocaleString()}
            </span>
          );
        },
      },
      {
        accessorKey: 'discountPrice',
        header: 'Selling Price',
        cell: ({ row }) => {
          const disc = row.getValue('discountPrice') as number;
          return (
            <span className="text-sm font-bold text-text-primary">
              Rs. {disc.toLocaleString()}
            </span>
          );
        },
      },
      {
        accessorKey: 'variantGroups',
        header: 'Options',
        cell: ({ row }) => {
          const groups = row.original.variants || row.original.variantGroups || [];
          return (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-text-secondary bg-[#FAFAFA] border border-border-subtle/30 px-2 py-1 rounded-lg select-none">
              <Layers size={11} />
              {groups.length} group{groups.length === 1 ? '' : 's'}
            </span>
          );
        },
        enableSorting: false,
      },
      {
        accessorKey: 'isAvailable',
        header: 'Stock Status',
        cell: ({ row }) => {
          const avail = row.getValue('isAvailable') as boolean;
          return (
            <span className={`inline-flex items-center text-[10px] font-bold uppercase select-none ${avail ? 'text-[#16A34A]' : 'text-red-500'}`}>
              ● {avail ? 'In Stock' : 'Sold Out'}
            </span>
          );
        },
      },
      {
        accessorKey: 'availableOnline',
        header: 'Online',
        cell: ({ row }) => {
          const online = row.original.availableOnline ?? true;
          return (
            <span className={`inline-flex items-center text-[10px] font-bold uppercase select-none ${online ? 'text-blue-500' : 'text-slate-400'}`} title={online ? 'Available on Website' : 'In-Store Only'}>
              <Globe size={14} className="mr-1" />
              {online ? 'Online' : 'In-Store'}
            </span>
          );
        },
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 no-row-click select-none">
            <button
              onClick={() => {
                setSelectedItem(row.original);
                setIsModalOpen(true);
              }}
              className="p-1.5 rounded-lg border border-border-subtle/30 hover:bg-slate-50 text-text-secondary hover:text-text-primary transition-all cursor-pointer active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2"
            >
              <Edit2 size={13} />
            </button>
            <button
              onClick={async () => {
                const ok = await confirm({
                  title: 'Delete Menu Item',
                  description: `Are you sure you want to delete ${row.original.name}? This action cannot be undone.`,
                  variant: 'destructive',
                  confirmText: 'Delete',
                  action: async () => {
                    await deleteItem(row.original.id);
                  }
                });

                if (ok) {
                  addToast('Product deleted from menu.', 'success');
                }
              }}
              className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100/75 text-red-500 hover:text-red-600 transition-all cursor-pointer active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2"
            >
              <Trash2 size={13} />
            </button>
          </div>
        ),
        enableSorting: false,
      },
    ],
    [deleteItem]
  );

  // Filter Pipeline
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Search Query
      const searchLower = searchValue.toLowerCase();
      const matchSearch =
        item.name.toLowerCase().includes(searchLower) ||
        (item.description && item.description.toLowerCase().includes(searchLower)) ||
        item.category.toLowerCase().includes(searchLower);

      if (!matchSearch) return false;

      // 2. Category Select
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      // 3. Status Select
      if (statusFilter !== 'all') {
        const isAvail = statusFilter === 'available';
        if (item.isAvailable !== isAvail) return false;
      }

      // 4. Online Select
      if (onlineFilter !== 'all') {
        const isOnline = onlineFilter === 'online';
        if ((item.availableOnline ?? true) !== isOnline) return false;
      }

      // 5. Badge Select
      if (badgeFilter !== 'all') {
        if (badgeFilter === 'featured' && !item.isFeatured) return false;
        if (badgeFilter !== 'featured' && item.badge !== badgeFilter) return false;
      }

      return true;
    });
  }, [items, searchValue, categoryFilter, statusFilter, onlineFilter, badgeFilter]);

  const hasActiveFilters =
    searchValue !== '' || categoryFilter !== 'all' || statusFilter !== 'all' || onlineFilter !== 'all' || badgeFilter !== 'all';

  const handleClearFilters = () => {
    setSearchValue('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setOnlineFilter('all');
    setBadgeFilter('all');
  };

  return (
    <div className="w-full flex flex-col animate-fade-in select-none">
      {/* Top action layout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-poppins font-bold text-lg text-text-primary">
            Website Menu Items ({filteredItems.length})
          </h2>
          <p className="text-xs text-text-secondary">
            Manage your full menu card items, pricing catalog, options, and live stock statuses.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedItem(undefined);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 h-10 text-xs font-semibold text-white bg-accent-primary hover:bg-accent-dark rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <Plus size={14} />
          Add Product
        </button>
      </div>

      {/* Main Filters Toolbar */}
      <DataTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder="Search product name, category or description..."
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
        filters={
          <div className="flex items-center gap-2.5">
            {/* Category Dropdown */}
            <Combobox
              options={[
                { value: 'all', label: 'All Categories' },
                ...categories.map((c) => ({ value: c.name, label: c.name }))
              ]}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="All Categories"
              searchPlaceholder="Search categories..."
              className="w-44 font-semibold text-text-primary text-nowrap bg-white border-border-subtle rounded-xl"
            />

            {/* Stock Availability Dropdown */}
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="font-semibold text-text-primary bg-white border border-border-subtle rounded-xl px-4 focus:outline-none focus:border-accent-primary cursor-pointer transition-all shadow-sm"
            >
              <option value="all">All Stocks</option>
              <option value="available">In Stock</option>
              <option value="sold_out">Sold Out</option>
            </Select>

            {/* Online Visibility Dropdown */}
            <Select
              value={onlineFilter}
              onChange={(e) => setOnlineFilter(e.target.value)}
              className="font-semibold text-text-primary bg-white border border-border-subtle rounded-xl px-4 focus:outline-none focus:border-accent-primary cursor-pointer transition-all shadow-sm"
            >
              <option value="all">Any Platform</option>
              <option value="online">Online + POS</option>
              <option value="pos_only">POS Only</option>
            </Select>

            {/* Badges / Special filters dropdown */}
            <Select
              value={badgeFilter}
              onChange={(e) => setBadgeFilter(e.target.value)}
              className="font-semibold text-text-primary bg-white border border-border-subtle rounded-xl px-4 focus:outline-none focus:border-accent-primary cursor-pointer transition-all shadow-sm"
            >
              <option value="all">All Promo Labels</option>
              <option value="featured">Featured On Hero</option>
              <option value="Best Seller">Best Sellers</option>
              <option value="New">New Items</option>
              <option value="Chef Special">Chef Specials</option>
              <option value="Deal">Value Deals</option>
            </Select>
          </div>
        }
      />

      {/* TanStack DataTable instance */}
      <DataTable
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        onRowClick={(item) => {
          setSelectedItem(item);
          setIsModalOpen(true);
        }}
        emptyMessage="No dishes match your active search filters."
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        bulkActions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-secondary mr-1">Bulk Actions:</span>
            {/* Bulk set available */}
            <button
              onClick={async () => {
                // To simplify we delegate. But here we just show the structure
                // Let's wire the triggers in the table instance itself
              }}
              className="hidden"
            />
            <button
              onClick={() => {
                // Mark in stock
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-accent-primary bg-accent-tint-bg rounded-full hover:bg-accent-tint-bg/80 transition-all cursor-pointer border border-accent-light/30"
            >
              <ShoppingBag size={13} />
              Mark In Stock
            </button>
            {/* Bulk set unavailable */}
            <button
              onClick={() => {
                // Mark sold out
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-text-secondary bg-[#FAFAFA] border border-border-subtle rounded-full hover:bg-slate-100 transition-all cursor-pointer"
            >
              <EyeOff size={13} />
              Mark Sold Out
            </button>
            {/* Bulk delete */}
            <button
              onClick={() => {
                // Delete
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition-all cursor-pointer border border-red-200"
            >
              <Trash2 size={13} />
              Delete Selected
            </button>
          </div>
        }
      />

      {/* Main MenuItem Create/Edit Modal overlay */}
      <MenuItemModal
        isOpen={isModalOpen}
        item={selectedItem}
        categories={categories}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedItem(undefined);
        }}
        onSave={async (itemPayload) => {
          await saveItem(itemPayload);
          addToast(`Product "${itemPayload.name}" saved to menu!`, 'success');
        }}
      />
    </div>
  );
}
