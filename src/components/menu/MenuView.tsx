import { UtensilsCrossed, FolderHeart, Award } from 'lucide-react';
import { CategoriesTab } from '@/components/menu/CategoriesTab';
import { MenuItemsTab } from '@/components/menu/MenuItemsTab';
import { PromotionsTab } from '@/components/menu/PromotionsTab';
import { useUIStore } from '@/store/uiStore';

export function MenuView() {
  const { menuActiveTab, setMenuActiveTab } = useUIStore();;
  const activeTab = menuActiveTab;
  const setActiveTab = setMenuActiveTab;

  return (
    <div className="w-full flex flex-col h-full select-none animate-fade-in">

      {/* Top Section & Segment Pill Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
        <div>
          <h1 className="font-poppins font-bold text-2xl sm:text-[28px] lg:text-[32px] text-text-primary tracking-tight leading-[1.2]">
            Menu Catalog
          </h1>
          <p className="text-[15px] sm:text-base text-text-secondary mt-1 leading-[1.5]">
            Manage your food catalog, dynamic drag-and-drop category structures, and active store coupons.
          </p>
        </div>

        {/* Tab Swappers */}
        <div className="flex items-center gap-1 bg-[#F5F5F5] border border-border-subtle/35 p-1 rounded-full self-start sm:self-auto shadow-inner select-none">
          <button
            onClick={() => setActiveTab('items')}
            title="Menu Items"
            className={`
              flex items-center gap-1.5 px-2.5 sm:px-4.5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer
              ${activeTab === 'items'
                ? 'bg-white text-accent-primary shadow-sm font-bold'
                : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            <UtensilsCrossed size={14} />
            <span className="hidden sm:inline">Menu Items</span>
            <span className="inline sm:hidden">Items</span>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            title="Categories"
            className={`
              flex items-center gap-1.5 px-2.5 sm:px-4.5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer
              ${activeTab === 'categories'
                ? 'bg-white text-accent-primary shadow-sm font-bold'
                : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            <FolderHeart size={14} />
            <span className="hidden sm:inline">Categories</span>
            <span className="inline sm:hidden">Categories</span>
          </button>
          <button
            onClick={() => setActiveTab('promos')}
            title="Promotions"
            className={`
              flex items-center gap-1.5 px-2.5 sm:px-4.5 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer
              ${activeTab === 'promos'
                ? 'bg-white text-accent-primary shadow-sm font-bold'
                : 'text-text-secondary hover:text-text-primary'
              }
            `}
          >
            <Award size={14} />
            <span className="hidden sm:inline">Promotions</span>
            <span className="inline sm:hidden">Promos</span>
          </button>
        </div>
      </div>

      {/* Dynamic Tab Rendering with fluid opacity animations */}
      <div className="flex-1">
        {activeTab === 'items' && <MenuItemsTab />}
        {activeTab === 'categories' && <CategoriesTab />}
        {activeTab === 'promos' && <PromotionsTab />}
      </div>
    </div>
  );
}
