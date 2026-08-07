import React, { useState } from 'react';
import { GripVertical, Plus, Edit2, Trash2, ShieldCheck } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useMenuCategories } from '@/hooks/useMenuCategories';
import { Category } from '@/types/menu';
import { CategoryModal } from './CategoryModal';
import { useUIStore } from '@/store/uiStore';;

export function CategoriesTab() {
  const { addToast, openAddCategoryTrigger, setOpenAddCategoryTrigger } = useUIStore();;
  const { categories, isLoading, saveCategory, reorderCategories, deleteCategory } = useMenuCategories();

  // Modal controllers
  const [selectedCat, setSelectedCat] = useState<Category | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<'website' | 'pos'>('website');

  // Listen for global shortcut triggers to open Add Category modal
  React.useEffect(() => {
    if (openAddCategoryTrigger) {
      setSelectedCat(undefined);
      setIsModalOpen(true);
      setOpenAddCategoryTrigger(false);
    }
  }, [openAddCategoryTrigger, setOpenAddCategoryTrigger]);
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [fallbackCatId, setFallbackCatId] = useState<string>('');

  // Drag and Drop ordering handlers
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    // Rearrange array on the fly
    const sortedCategories = [...categories].sort((a, b) => 
      activeView === 'website' 
        ? (a.sortOrder || 0) - (b.sortOrder || 0) 
        : (a.posSortOrder || 0) - (b.posSortOrder || 0)
    );
    const rearranged = [...sortedCategories];
    const draggedItem = rearranged[draggedIdx];
    rearranged.splice(draggedIdx, 1);
    rearranged.splice(index, 0, draggedItem);

    // Update index & save optimistically
    setDraggedIdx(index);
    reorderCategories(rearranged.map((cat, idx) => 
      activeView === 'website'
        ? { ...cat, sortOrder: idx + 1 }
        : { ...cat, posSortOrder: idx + 1 }
    ));
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    addToast('Category list order updated!', 'success');
  };

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catToDelete || !fallbackCatId) return;

    try {
      await deleteCategory(catToDelete.id, fallbackCatId);
      addToast(`Category deleted. Orphan items reassigned successfully!`, 'success');
      setCatToDelete(null);
      setFallbackCatId('');
    } catch (err) {
      addToast('Failed to delete category', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 rounded-full border-4 border-accent-light/20 border-t-accent-primary animate-spin mb-3" />
        <span className="text-xs font-semibold text-text-secondary">Loading categories...</span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col animate-fade-in select-none">
      {/* Top Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 text-left">
        <div className="min-w-0 flex-1">
          <h2 className="font-poppins font-bold text-base sm:text-lg text-text-primary flex items-center gap-3">
            {activeView === 'website' ? 'Website Categories' : 'POS Categories'} ({categories.length})
            <div className="flex bg-slate-100 rounded-lg p-0.5 ml-2">
              <button
                onClick={() => setActiveView('website')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeView === 'website' 
                    ? 'bg-white text-text-primary shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Website
              </button>
              <button
                onClick={() => setActiveView('pos')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeView === 'pos' 
                    ? 'bg-white text-text-primary shadow-sm' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                POS
              </button>
            </div>
          </h2>
          <p className="text-xs text-text-secondary mt-1.5 leading-normal">
            Drag items using handles to reorder sections for the {activeView === 'website' ? 'website' : 'POS'}.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedCat(undefined);
            setIsModalOpen(true);
          }}
          title="Add Category"
          className="flex items-center gap-1.5 px-3.5 h-10 text-xs font-semibold text-white bg-accent-primary hover:bg-accent-dark rounded-full transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Drag & Drop Reorderable List */}
      <div className="bg-white border border-border-subtle/40 rounded-[22px] shadow-card overflow-hidden">
        <div className="flex flex-col">
          {[...categories]
            .sort((a, b) => 
              activeView === 'website' 
                ? (a.sortOrder || 0) - (b.sortOrder || 0) 
                : (a.posSortOrder || 0) - (b.posSortOrder || 0)
            )
            .map((cat, idx) => {
              const isDragged = draggedIdx === idx;
              return (
                <div
                  key={cat.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`
                    flex items-center justify-between gap-4.5 px-6 py-4.5 border-b border-border-subtle/15 transition-all group cursor-default
                    ${isDragged ? 'bg-accent-tint-bg/50 border-dashed border-accent-primary opacity-45' : 'hover:bg-[#FAFAFA]/75'}
                  `}
                >
                  <div className="flex items-center gap-4.5">
                    {/* Drag Handle */}
                    <div className="text-text-secondary/35 group-hover:text-text-secondary/70 cursor-grab active:cursor-grabbing p-1">
                      <GripVertical size={16} />
                    </div>

                    {/* Meta info */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-poppins font-bold text-sm text-text-primary">
                          {cat.name}
                        </span>
                        {!cat.isActive && (
                          <span className="text-[9px] font-bold text-red-500 bg-red-50 border border-red-200/50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Disabled
                          </span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-xs text-text-secondary mt-1 font-medium max-w-md line-clamp-1">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions & Dynamic Item Counts */}
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-bold text-text-secondary bg-slate-100 px-3 py-1 rounded-full border border-border-subtle/25">
                      {cat.itemCount || 0} item{cat.itemCount === 1 ? '' : 's'}
                    </span>

                    <div className="flex items-center gap-1.5 transition-opacity">
                      <button
                        onClick={() => {
                          setSelectedCat(cat);
                          setIsModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-border-subtle/30 bg-white hover:bg-slate-50 text-text-secondary hover:text-text-primary cursor-pointer active:scale-90 transition-all"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          setCatToDelete(cat);
                          // Default fallback is the first category that is NOT this one
                          const other = categories.find((c) => c.id !== cat.id);
                          setFallbackCatId(other?.id || '');
                        }}
                        disabled={categories.length <= 1}
                        className="p-1.5 rounded-lg border border-red-200/30 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 cursor-pointer active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Category Create/Edit Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        category={selectedCat}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCat(undefined);
        }}
        onSave={async (cat) => {
          await saveCategory(cat);
          addToast(`Category ${selectedCat ? 'updated' : 'created'} successfully!`, 'success');
        }}
      />

      {/* Category Safe Deletion Safe Re-assignment Dialog */}
      {catToDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 select-none">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCatToDelete(null)} />
          <div className="relative bg-white w-full max-w-md rounded-[22px] border border-border-subtle p-6 animate-scale-up">
            <h3 className="font-poppins font-bold text-lg text-text-primary mb-2 flex items-center gap-2">
              <ShieldCheck size={20} className="text-[#CA8A04]" />
              Safe Category Deletion
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4.5">
              You are deleting category <span className="font-bold text-text-primary">"{catToDelete.name}"</span>.
              Since this category currently holds <span className="font-bold text-accent-primary">{catToDelete.itemCount || 0}</span> menu item(s), you MUST select a fallback category below to transfer these items to.
            </p>

            <form onSubmit={handleDeleteSubmit}>
              <div>
                <label className="text-[11px] text-text-secondary font-bold uppercase tracking-wider block mb-1.5">
                  Fallback Destination Category *
                </label>
                <Select
                  required
                  value={fallbackCatId}
                  onChange={(e) => setFallbackCatId(e.target.value)}
                  className="w-full text-xs font-semibold h-11 bg-slate-50 border border-border-subtle rounded-xl px-4 focus:outline-none focus:border-accent-primary cursor-pointer shadow-sm"
                >
                  <option value="" disabled>Select target category...</option>
                  {categories
                    .filter((c) => c.id !== catToDelete.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.itemCount || 0} items)
                      </option>
                    ))}
                </Select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setCatToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-text-primary bg-[#FAFAFA] border border-border-subtle hover:bg-[#F5F5F5] rounded-full transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!fallbackCatId}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-full transition-all cursor-pointer disabled:opacity-45"
                >
                  Confirm Re-assign & Delete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
