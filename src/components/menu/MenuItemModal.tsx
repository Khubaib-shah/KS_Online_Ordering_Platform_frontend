import React, { useState, useEffect } from 'react';
import {
  Tag,
  Percent,
  Sparkles,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { MenuItem, Category, VariantGroup } from '@/types/menu';
import { VariantGroupEditor } from './components/VariantGroupEditor';
import { useTenantStore } from '@/store/tenantStore';
import { Combobox } from '@/components/ui/Combobox';
import { ImageUploadField } from '@/components/ui/forms/ImageUploadField';
import { InputField } from '@/components/ui/forms/InputField';
import { TextareaField } from '@/components/ui/forms/TextareaField';
import { SelectField } from '@/components/ui/forms/SelectField';
import { SwitchField } from '@/components/ui/forms/SwitchField';
import { FormField } from '@/components/ui/forms/FormField';
import { ModalHeader } from '@/components/ui/modal/ModalHeader';
import { ModalFooter } from '@/components/ui/modal/ModalFooter';
import { FormSection } from '@/components/ui/layout/FormSection';

interface MenuItemModalProps {
  item?: MenuItem;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItem) => Promise<any>;
}

export function MenuItemModal({ item, categories, isOpen, onClose, onSave }: MenuItemModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [badge, setBadge] = useState<string>('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [image, setImage] = useState<any>('');

  const { activeTenant } = useTenantStore();

  useEffect(() => {
    if (item) {
      setName(item.name);
      setDescription(item.description || '');
      setCategory(item.category);
      setBasePrice(item.basePrice);
      setDiscountPrice(item.discountPrice);
      setBadge(item.badge || '');
      setIsFeatured(item.isFeatured);
      setIsAvailable(item.isAvailable);
      setSortOrder(item.sortOrder);
      setVariantGroups(item.variantGroups || item.variants || []);
      setImage(item.image || '');
    } else {
      setName('');
      setDescription('');
      setCategory(categories[0]?.name || '');
      setBasePrice(0);
      setDiscountPrice(0);
      setBadge('');
      setIsFeatured(false);
      setIsAvailable(true);
      setSortOrder(1);
      setVariantGroups([]);
      setImage('');
    }
  }, [item, categories, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category || isSaving) return;

    setIsSaving(true);
    let finalImage: string | undefined = undefined;
    const trimmedImage = typeof image === 'string' ? image.trim() : '';
    if (trimmedImage) {
      finalImage = trimmedImage;
    } else if (activeTenant?.config?.logo) {
      finalImage = activeTenant.config.logo;
    }

    const itemPayload: MenuItem = {
      id: item?.id || `item-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      category,
      basePrice: Number(basePrice),
      discountPrice: Number(discountPrice || basePrice),
      badge: (badge as any) || undefined,
      isFeatured,
      isAvailable,
      sortOrder: Number(sortOrder),
      variantGroups,
      variants: variantGroups,
      image: finalImage
    };

    try {
      await onSave(itemPayload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 animate-fade-in" onClick={onClose} />

      {/* Main Container: Mobile Bottom Sheet, Desktop Centered Card */}
      <div className={cn(
        "relative bg-white w-full flex flex-col overflow-hidden shadow-2xl select-none transition-all duration-300",
        // Mobile / Small Screen: Bottom Sheet Layout
        "fixed bottom-0 left-0 right-0 rounded-t-[20px] rounded-b-none border-t border-slate-200 max-h-[92vh] h-[92vh] flex flex-col",
        // Desktop Screen: Centered Modal Card Layout
        "md:relative md:bottom-auto md:left-auto md:right-auto md:my-auto md:max-w-4xl md:rounded-[20px] md:border md:max-h-[85vh] md:h-[85vh]"
      )}>

        {/* Sticky Modal Header */}
        <ModalHeader
          title={item ? 'Modify Menu Item' : 'Add New Menu Item'}
          subtitle="Configure basic info, placement, and customizable option groups."
          icon={<Sparkles size={18} />}
          onClose={onClose}
        />

        {/* Form elements with full-flex layout to anchor footer sticky */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-8 pt-4 pb-6 scrollbar-none">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

              {/* Left Panel: Item Basic Parameters (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-5">

                <FormSection title="Primary Identity">
                  {/* Title Name */}
                  <InputField
                    label="Item Title"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Classic Fajita Pizza"
                  />

                  {/* Description */}
                  <TextareaField
                    label="Item Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Savor the sizzling richness of traditional hand-chopped masalas..."
                    rows={3}
                  />

                  {/* Category Select Tag */}
                  <FormField label="Category" required>
                    <Combobox
                      options={categories.map((c) => ({ value: c.name, label: c.name }))}
                      value={category}
                      onChange={setCategory}
                      placeholder="Select a category..."
                      searchPlaceholder="Search categories..."
                      className="w-full h-11 bg-white border-border-subtle rounded-xl text-xs font-bold text-text-primary"
                    />
                  </FormField>

                  {/* Image Upload */}
                  <div className="text-left pt-2">
                    <ImageUploadField
                      label="Item Image"
                      value={image}
                      onChange={setImage}
                      tenantSlug={activeTenant?.slug}
                      imageType="Menu Item"
                      placeholder="e.g. https://example.com/item.jpg"
                    />
                    {image && (
                      <div className="mt-2 h-24 w-full overflow-hidden rounded-xl border border-border-subtle bg-slate-50 relative flex items-center justify-center group">
                        <img
                          src={typeof image === 'object' ? (image as any)?.secureUrl || '' : image}
                          alt="Menu Item preview"
                          className="max-h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
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
                </FormSection>

                {/* Switch Toggles */}
                <FormSection>
                  <SwitchField
                    label="Available for Ordering"
                    hint='If disabled, clients see a "Sold Out" tag.'
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                  />

                  <SwitchField
                    label="Feature on Storefront Hero"
                    hint="Promote on top menu grids."
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    containerClassName="pt-3.5 border-t border-border-subtle"
                  />
                </FormSection>
              </div>

              {/* Right Panel: Custom Variant Options & Selection Bounds (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4 lg:border-l lg:border-border-subtle lg:pl-6">
                <FormSection title="Pricing & Placement">
                  {/* Pricing Coordinates */}
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <InputField
                      label={<span className="flex items-center gap-1"><Tag size={12} />Base Price</span>}
                      type="number"
                      required
                      min={0}
                      value={basePrice || ''}
                      onChange={(e) => setBasePrice(Number(e.target.value))}
                      placeholder="e.g. 1500"
                    />
                    <InputField
                      label={<span className="flex items-center gap-1"><Percent size={12} />Discount Price</span>}
                      type="number"
                      min={0}
                      value={discountPrice || ''}
                      onChange={(e) => setDiscountPrice(Number(e.target.value))}
                      placeholder="Same as base"
                    />
                  </div>

                  {/* Badges / Labels */}
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <SelectField
                      label="Promo Badge"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      options={[
                        { label: 'No Badge', value: '' },
                        { label: 'Best Seller', value: 'Best Seller' },
                        { label: 'New Item', value: 'New' },
                        { label: 'Chef Special', value: 'Chef Special' },
                        { label: 'Value Deal', value: 'Deal' },
                        { label: 'Promo', value: 'Promo' }
                      ]}
                    />
                    <InputField
                      label="Sort Rank"
                      type="number"
                      required
                      min={1}
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                    />
                  </div>
                </FormSection>

                <VariantGroupEditor
                  variantGroups={variantGroups}
                  setVariantGroups={setVariantGroups}
                />
              </div>

            </div>
          </div>

          {/* Sticky Modal Footer with border */}
          <ModalFooter
            onCancel={onClose}
            isSaving={isSaving}
            saveText="Save Menu Item"
          />
        </form>
      </div>
    </div>
  );
}
