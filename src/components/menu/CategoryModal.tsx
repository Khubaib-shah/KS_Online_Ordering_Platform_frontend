import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Category } from '@/types/menu';
import { cn } from '@/lib/cn';
import { getCategoryImage } from '@/utils/cloudinary';
import { InputField } from '@/components/ui/forms/InputField';
import { ImageUploadField } from '@/components/ui/forms/ImageUploadField';
import { TextareaField } from '@/components/ui/forms/TextareaField';
import { SwitchField } from '@/components/ui/forms/SwitchField';
import { ModalHeader } from '@/components/ui/modal/ModalHeader';
import { ModalFooter } from '@/components/ui/modal/ModalFooter';
import { useTenantStore } from '@/store/tenantStore';

interface CategoryModalProps {
  category?: Category;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cat: Category) => Promise<any>;
}

export function CategoryModal({ category, isOpen, onClose, onSave }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { tenants, activeTenantId } = useTenantStore();
  const activeTenant = tenants.find((t) => t.id === activeTenantId);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setDescription(category.description || '');
      setImageUrl(category.imageUrl || '');
      setIsActive(category.isActive);
    } else {
      setName('');
      setDescription('');
      setImageUrl('');
      setIsActive(true);
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isSaving) return;

    setIsSaving(true);
    const catPayload: Category = {
      id: category?.id || `cat-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      icon: 'Utensils',
      imageUrl: (typeof imageUrl === 'object' ? (imageUrl as any)?.secureUrl : imageUrl)?.trim() || undefined,
      isActive,
      sortOrder: category?.sortOrder || 99,
      itemCount: category?.itemCount || 0
    };

    try {
      await onSave(catPayload);
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

      {/* Main Container: Mobile Bottom Sheet, Desktop Centered Card */}
      <div className={cn(
        "relative bg-white w-full flex flex-col overflow-hidden shadow-2xl select-none transition-all duration-300",
        // Mobile / Small Screen: Bottom Sheet Layout
        "fixed bottom-0 left-0 right-0 rounded-t-[20px] rounded-b-none border-t border-slate-200 max-h-[90vh] flex flex-col",
        // Desktop Screen: Centered Modal Card Layout
        "md:relative md:bottom-auto md:left-auto md:right-auto md:my-auto md:max-w-md md:rounded-[20px] md:border md:max-h-[85vh] md:h-auto"
      )}>

        {/* Sticky Modal Header */}
        <ModalHeader
          title={category ? 'Edit Category' : 'Create Category'}
          subtitle="Organize menu listings with beautiful tags."
          icon={<Sparkles size={18} />}
          onClose={onClose}
        />

        {/* Form container */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 flex flex-col gap-4.5 scrollbar-none">
            <InputField
              label="Category Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Peshawari Karahi, Sizzling BBQ"
            />

            <TextareaField
              label="Description Brief"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Savor the delicious variety of our fresh authentic platters..."
              rows={3}
            />

            {/* Background Image Selection */}
            <div className="text-left">
              <ImageUploadField
                label="Category Image"
                value={imageUrl}
                onChange={setImageUrl}
                tenantSlug={activeTenant?.slug}
                imageType="Category"
                placeholder="e.g. https://example.com"
              />

              {imageUrl && (
                <div className="mt-3 relative w-full h-32 rounded-xl border border-border-subtle overflow-hidden bg-surface-muted group">
                  <img
                    src={getCategoryImage(imageUrl as any) || (imageUrl as any)?.secureUrl || imageUrl as string}
                    alt="Category Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Status Switch Active */}
            <SwitchField
              label="Active Website Visibility"
              hint="If disabled, this category and its items will be hidden from customers."
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              containerClassName="py-3 border-t border-border-subtle mt-2"
            />
          </div>

          {/* Sticky Modal Footer */}
          <ModalFooter
            onCancel={onClose}
            isSaving={isSaving}
            saveText="Save Category"
          />

        </form>
      </div>
    </div>
  );
}
