import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { HeroSlide } from '@/types/promo';
import { useTenantStore } from '@/store/tenantStore';
import Checkbox from '@/components/ui/Checkbox';
import { ImageUploadField } from '@/components/ui/forms/ImageUploadField';
import { InputField } from '@/components/ui/forms/InputField';
import { TextareaField } from '@/components/ui/forms/TextareaField';
import { ModalHeader } from '@/components/ui/modal/ModalHeader';
import { ModalFooter } from '@/components/ui/modal/ModalFooter';

interface SlideModalProps {
  slide?: HeroSlide;
  isOpen: boolean;
  onClose: () => void;
  onSave: (slide: HeroSlide) => Promise<any>;
}

export function SlideModal({ slide, isOpen, onClose, onSave }: SlideModalProps) {
  const [image, setImage] = useState('');
  const [label, setLabel] = useState('');
  const [headline, setHeadline] = useState('');
  const [subText, setSubText] = useState('');
  const [hasText, setHasText] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { activeTenant } = useTenantStore();

  useEffect(() => {
    if (slide) {
      setImage(slide.image);
      setLabel(slide.label || '');
      setHeadline(slide.headline || '');
      setSubText(slide.subText || '');
      setHasText(!!(slide.label || slide.headline || slide.subText));
    } else {
      setImage('');
      setLabel('');
      setHeadline('');
      setSubText('');
      setHasText(false);
    }
  }, [slide, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image.trim() || (hasText && !headline.trim()) || isSaving) return;

    setIsSaving(true);
    const slidePayload: HeroSlide = {
      id: slide?.id || `slide-${Date.now()}`,
      image: image.trim(),
      label: hasText ? label.trim() : undefined,
      headline: hasText ? headline.trim() : undefined,
      subText: hasText ? subText.trim() : undefined,
      sortOrder: slide?.sortOrder || 999, // default to end, caller will handle sorting
    };

    try {
      await onSave(slidePayload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in" onClick={onClose} />

      {/* Main Container */}
      <div className={cn(
        "relative bg-white w-full flex flex-col overflow-hidden shadow-2xl select-none transition-all duration-300",
        "fixed bottom-0 left-0 right-0 rounded-t-[20px] rounded-b-none border-t border-slate-200 max-h-[90vh] flex flex-col",
        "md:relative md:bottom-auto md:left-auto md:right-auto md:my-auto md:max-w-md md:rounded-[20px] md:border md:max-h-[85vh] md:h-auto"
      )}>

        {/* Sticky Modal Header */}
        <ModalHeader
          title={slide ? 'Edit Slide' : 'Add New Slide'}
          icon={<ImageIcon size={18} />}
          onClose={onClose}
        />

        {/* Scrollable Form Body */}
        <form id="slide-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 flex flex-col">

          <div className="text-left">
            <ImageUploadField
              label="Image URL / Base64 *"
              value={image}
              onChange={setImage}
              tenantSlug={activeTenant?.slug}
              imageType="Banner"
              placeholder="e.g. https://example.com/banner.jpg"
            />
            {image && (
              <div className="mt-2 h-24 w-full overflow-hidden rounded-xl border border-border-subtle bg-slate-50 relative flex items-center justify-center group">
                <img
                  src={typeof image === 'object' ? (image as any)?.secureUrl || '' : image}
                  alt="Slide preview"
                  className="max-h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x150?text=Invalid+Image';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="absolute top-2 right-2 p-1.5 bg-white shadow-sm border border-border-subtle rounded-lg text-text-secondary hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-100"
                  title="Clear Image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Checkbox to toggle Text Overlay */}
          <div className="text-left mt-2 border-t border-border-subtle pt-4">
            <Checkbox
              label={<span className="text-[12px] font-bold text-text-primary uppercase tracking-wider">Add Text Overlay</span>}
              checked={hasText}
              onChange={(e) => setHasText(e.target.checked)}
            />
            <p className="text-[10px] text-text-secondary mt-1 ml-6">
              Enable this if your image doesn't already have text baked into it.
            </p>
          </div>

          {hasText && (
            <div className="flex flex-col gap-4 pl-6 border-l-2 border-accent-primary/20 ml-2 mt-2">
              <InputField
                label="Label"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. DELIVERY SPECIAL"
              />

              <InputField
                label="Headline"
                required={hasText}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. 40% OFF ENTIRE MENU"
              />

              <TextareaField
                label="Sub Text"
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                placeholder="e.g. Order now and enjoy hot food delivered to your door"
                rows={2}
              />
            </div>
          )}

        </form>

        {/* Sticky Modal Footer */}
        <ModalFooter
          onCancel={onClose}
          isSaving={isSaving}
          saveText="Save Slide"
          formId="slide-form"
        />
      </div>
    </div>
  );
}
