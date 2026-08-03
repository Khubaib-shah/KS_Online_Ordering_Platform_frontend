import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Megaphone, Layers, GripVertical, Percent, ShieldCheck, Check } from 'lucide-react';
import { usePromos } from '@/hooks/usePromos';
import { useUIStore } from '@/store/uiStore';
import { PromoCode, HeroSlide } from '@/types/promo';
import { PromoModal } from '@/components/menu/PromoModal';
import { SlideModal } from '@/components/menu/SlideModal';

export function PromotionsTab() {
  const { addToast, openAddPromoTrigger, setOpenAddPromoTrigger } = useUIStore();;
  const { promos, slides, announcement, isLoading, savePromo, deletePromo, saveSlides, saveAnnouncement } = usePromos();

  // Modal State Controllers
  const [selectedPromo, setSelectedPromo] = useState<PromoCode | undefined>(undefined);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | undefined>(undefined);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);

  // Listen for global shortcut triggers to open Add Promo modal
  React.useEffect(() => {
    if (openAddPromoTrigger) {
      setSelectedPromo(undefined);
      setIsPromoModalOpen(true);
      setOpenAddPromoTrigger(false);
    }
  }, [openAddPromoTrigger, setOpenAddPromoTrigger]);

  // Announcement Inline Editor Form State
  const [annText, setAnnText] = useState('');
  const [annActive, setAnnActive] = useState(false);
  const [annBg, setAnnBg] = useState('#CA8A04'); // default gold

  // Seed form state on mount
  React.useEffect(() => {
    if (announcement) {
      setAnnText(announcement.text);
      setAnnActive(announcement.isActive);
      setAnnBg(announcement.backgroundColor || '#CA8A04');
    }
  }, [announcement]);

  // Slides local state drag indices
  const [draggedSlideIdx, setDraggedSlideIdx] = useState<number | null>(null);

  const handleSlideDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedSlideIdx(idx);
  };

  const handleSlideDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedSlideIdx === null || draggedSlideIdx === index) return;

    const rearranged = [...slides];
    const draggedItem = rearranged[draggedSlideIdx];
    rearranged.splice(draggedSlideIdx, 1);
    rearranged.splice(index, 0, draggedItem);

    setDraggedSlideIdx(index);
    saveSlides(rearranged.map((slide, sIdx) => ({ ...slide, sortOrder: sIdx + 1 })));
  };

  const handleSlideDragEnd = () => {
    setDraggedSlideIdx(null);
    addToast('Hero slider order updated!', 'success');
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveAnnouncement({
        text: annText.trim(),
        isActive: annActive,
        backgroundColor: annBg
      });
      addToast('Site announcement bar updated!', 'success');
    } catch (err) {
      addToast('Failed to save announcement bar', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-16">
        <div className="w-10 h-10 rounded-full border-4 border-accent-light/20 border-t-accent-primary animate-spin mb-3" />
        <span className="text-xs font-semibold text-text-secondary">Loading campaigns...</span>
      </div>
    );
  }

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6.5 select-none animate-fade-in">

      {/* LEFT COLUMN: Coupons Directory (takes 2/3 space) */}
      <div className="lg:col-span-2 flex flex-col gap-6.5">

        {/* Active Coupons List Card */}
        <div className="bg-white border border-border-subtle/40 rounded-[22px] shadow-card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 text-left">
            <div className="min-w-0 flex-1">
              <h3 className="font-poppins font-bold text-base text-text-primary flex items-center gap-2 flex-wrap">
                <Percent size={18} className="text-accent-primary shrink-0" />
                <span className="truncate">Discount Promo Coupons ({promos.length})</span>
              </h3>
              <p className="text-xs text-text-secondary mt-0.5 leading-normal">
                Setup coupon discounts with minimum order total thresholds or maximum click usage limits.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedPromo(undefined);
                setIsPromoModalOpen(true);
              }}
              title="Add Code"
              className="flex items-center gap-1 px-3.5 h-9 text-xs font-semibold text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/15 rounded-full transition-all cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
            >
              <Plus size={13} />
              <span>Add Code</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border-subtle/15 pb-2 text-left">
                  <th className="py-2.5 text-xs font-bold text-text-secondary uppercase tracking-wider">Coupon Code</th>
                  <th className="py-2.5 text-xs font-bold text-text-secondary uppercase tracking-wider">Reduction</th>
                  <th className="py-2.5 text-xs font-bold text-text-secondary uppercase tracking-wider">Usage Details</th>
                  <th className="py-2.5 text-xs font-bold text-text-secondary uppercase tracking-wider">Expiry</th>
                  <th className="py-2.5 text-xs font-bold text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="py-2.5 text-xs font-bold text-text-secondary uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => {
                  const hasLimit = p.usageLimit && p.usageLimit > 0;
                  const percentUsed = hasLimit ? Math.round(((p.usageCount || 0) / p.usageLimit!) * 100) : 0;

                  return (
                    <tr key={p.id} className="border-b border-border-subtle/10 py-3.5">
                      <td className="py-3.5 pr-3">
                        <span className="font-mono font-extrabold text-sm text-text-primary tracking-wider bg-slate-50 border border-border-subtle/35 px-2.5 py-1 rounded-lg">
                          {p.code}
                        </span>
                      </td>
                      <td className="py-3.5 text-xs font-bold text-text-primary">
                        {p.type === 'flat_percent' ? `${p.value}% Off` : `Rs. ${p.value} Off`}
                        {p.minOrderValue && p.minOrderValue > 0 && (
                          <span className="block text-[10px] text-text-secondary/70 font-medium mt-0.5">Min: Rs. {p.minOrderValue}</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-3">
                        <div className="flex flex-col select-none">
                          <span className="text-xs font-semibold text-text-primary">
                            {p.usageCount || 0} used {hasLimit ? `/ ${p.usageLimit}` : '(Unlimited)'}
                          </span>
                          {hasLimit && (
                            <div className="w-24 bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                              <div
                                className="bg-accent-primary h-full rounded-full"
                                style={{ width: `${Math.min(percentUsed, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 text-xs font-medium text-text-secondary">
                        {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center text-[10px] font-bold uppercase ${p.isActive ? 'text-[#16A34A]' : 'text-red-500'}`}>
                          ● {p.isActive ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedPromo(p);
                              setIsPromoModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg border border-border-subtle/30 bg-white hover:bg-slate-50 text-text-secondary hover:text-text-primary cursor-pointer active:scale-90"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Delete coupon code ${p.code}?`)) {
                                try {
                                  await deletePromo(p.id);
                                  addToast('Coupon deleted.', 'success');
                                } catch (err) {
                                  addToast('Failed to delete', 'error');
                                }
                              }
                            }}
                            className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 cursor-pointer active:scale-90"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Announcement bar + Hero Banners (takes 1/3 space) */}
      <div className="flex flex-col gap-6.5">

        {/* 1. Dynamic Site Announcement strip bar */}
        <div className="bg-white border border-border-subtle/40 rounded-[22px] shadow-card p-5">
          <h3 className="font-poppins font-bold text-sm text-text-primary mb-4 flex items-center gap-2 border-b border-border-subtle/10 pb-3">
            <Megaphone size={16} className="text-[#CA8A04]" />
            Site Announcement Strip
          </h3>

          <form onSubmit={handleAnnouncementSubmit} className="flex flex-col gap-3.5">
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
                Banner Alert Text
              </label>
              <textarea
                required
                value={annText}
                onChange={(e) => setAnnText(e.target.value)}
                placeholder="FREE DELIVERY on all Peshawari Chicken Karahi orders over Rs. 3,000!"
                rows={2}
                className="w-full text-xs font-semibold text-text-primary placeholder:text-text-secondary bg-slate-50 border border-border-subtle rounded-xl p-2.5 focus:outline-none focus:border-accent-primary resize-none"
              />
            </div>

            <div className="flex items-center gap-4 mt-2">
              <button
                type="submit"
                className="flex-1 h-9 text-xs font-semibold text-white bg-accent-primary hover:bg-accent-dark rounded-full transition-all cursor-pointer shadow-sm active:scale-95"
              >
                Update Announcement Bar
              </button>

              <div className="flex items-center gap-3 border-l border-border-subtle pl-4 h-9">
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Visibility</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={annActive}
                    onChange={(e) => setAnnActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-primary"></div>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* 2. Banner Slides Card (drag sorting) */}
        <div className="bg-white border border-border-subtle/40 rounded-[22px] shadow-card p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-poppins font-bold text-sm text-text-primary flex items-center gap-2">
              <Layers size={16} className="text-text-secondary" />
              Home Slider Slides ({slides.length})
            </h3>
            <button
              onClick={() => {
                setSelectedSlide(undefined);
                setIsSlideModalOpen(true);
              }}
              title="Add Slide"
              className="flex items-center gap-1 px-3 h-8 text-[11px] font-semibold text-accent-primary bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/15 rounded-full transition-all cursor-pointer"
            >
              <Plus size={12} />
              <span>Add</span>
            </button>
          </div>
          <p className="text-[10px] text-text-secondary mb-4 leading-relaxed">
            Drag items using handles to reorder slides. Home users will see them in this exact sequence.
          </p>

          <div className="flex flex-col gap-3">
            {slides
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((slide, idx) => {
                const isDragged = draggedSlideIdx === idx;
                return (
                  <div
                    key={slide.id}
                    draggable
                    onDragStart={(e) => handleSlideDragStart(e, idx)}
                    onDragOver={(e) => handleSlideDragOver(e, idx)}
                    onDragEnd={handleSlideDragEnd}
                    className={`
                      flex items-center justify-between gap-3 p-3.5 bg-slate-50 border border-border-subtle/25 rounded-2xl select-none transition-all
                      ${isDragged ? 'opacity-30 border-dashed border-accent-primary bg-accent-tint-bg/50' : ''}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      {/* Handle */}
                      <div className="text-text-secondary/35 cursor-grab active:cursor-grabbing p-1">
                        <GripVertical size={14} />
                      </div>

                      {/* Details */}
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text-primary line-clamp-1">{slide.headline}</span>
                        {slide.subText && (
                          <span className="text-[10px] text-text-secondary/70 font-medium line-clamp-1 mt-0.5">{slide.subText}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-accent-primary bg-accent-tint-bg border border-accent-light/30 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
                        Slide {slide.sortOrder}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSlide(slide);
                          setIsSlideModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg border border-border-subtle/30 bg-white hover:bg-slate-50 text-text-secondary hover:text-text-primary cursor-pointer active:scale-90"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (confirm(`Delete slide "${slide.headline}"?`)) {
                            try {
                              const updated = slides.filter(s => s.id !== slide.id);
                              await saveSlides(updated);
                              addToast('Slide deleted.', 'success');
                            } catch (err) {
                              addToast('Failed to delete slide', 'error');
                            }
                          }
                        }}
                        className="p-1.5 rounded-lg border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 cursor-pointer active:scale-90"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

      </div>

      {/* Coupon Modal Dialog */}
      <PromoModal
        isOpen={isPromoModalOpen}
        promo={selectedPromo}
        onClose={() => {
          setIsPromoModalOpen(false);
          setSelectedPromo(undefined);
        }}
        onSave={async (pPayload) => {
          await savePromo(pPayload);
          addToast(`Discount Code "${pPayload.code}" saved successfully!`, 'success');
        }}
      />

      <SlideModal
        isOpen={isSlideModalOpen}
        slide={selectedSlide}
        onClose={() => {
          setIsSlideModalOpen(false);
          setSelectedSlide(undefined);
        }}
        onSave={async (newSlide) => {
          let updated = [...slides];
          const idx = updated.findIndex(s => s.id === newSlide.id);
          if (idx !== -1) {
            updated[idx] = newSlide;
          } else {
            newSlide.sortOrder = updated.length + 1;
            updated.push(newSlide);
          }
          await saveSlides(updated);
          addToast('Slide saved successfully!', 'success');
        }}
      />
    </div>
  );
}
