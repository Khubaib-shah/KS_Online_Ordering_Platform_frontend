import React, { useState } from 'react';
import { Save, Globe } from 'lucide-react';
import { InputField } from '@/components/ui/forms/InputField';
import { RestaurantSettings } from '@/types/settings';
import { ImageUploadField } from '@/components/ui/forms/ImageUploadField';
import { Button } from '@/components/ui/Button';

interface BusinessTabProps {
  settings: RestaurantSettings;
  activeTenant: any;
  saveSettings: (settings: RestaurantSettings) => Promise<any>;
  saveTenant: (tenant: any) => any;
  refetch: () => void;
  addToast: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

export function BusinessTab({
  settings,
  activeTenant,
  saveSettings,
  saveTenant,
  refetch,
  addToast
}: BusinessTabProps) {
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState(settings.name || '');
  const [tagline, setTagline] = useState(settings.tagline || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [email, setEmail] = useState(settings.email || '');
  const [currency, setCurrency] = useState(settings.currency || 'Rs.');
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [facebook, setFacebook] = useState(settings.socials?.facebook || '');
  const [instagram, setInstagram] = useState(settings.socials?.instagram || '');


  // Business & Branding Save
  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    const updatedSettings: RestaurantSettings = {
      ...settings,
      name: name.trim(),
      tagline: tagline.trim() || undefined,
      phone: phone.trim(),
      email: email.trim(),
      currency,
      logoUrl: logoUrl.trim() || undefined,
      socials: {
        facebook: facebook.trim() || undefined,
        instagram: instagram.trim() || undefined
      }
    };

    try {
      await saveSettings(updatedSettings);

      if (activeTenant) {
        await saveTenant({
          ...activeTenant,
          name: name.trim(),
          logoUrl: logoUrl.trim() || undefined
        });
      }

      addToast('Business settings synchronized!', 'success');
      refetch();
    } catch (err) {
      addToast('Failed to save business settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSaveBusiness} className="flex flex-col gap-6.5 animate-fade-in" id="form-business">
      <div className="border-b border-border-subtle/10 pb-3 text-left">
        <h3 className="font-sans font-extrabold text-base text-text-primary">
          Storefront Identity & Setup
        </h3>
        <p className="text-xs text-text-secondary">Manage customer-facing details, hours, and delivery areas.</p>
      </div>

      {/* Sub-section 1: Identity */}
      <div className="space-y-4 text-left">
        <h4 className="text-[11px] font-extrabold uppercase text-accent-primary border-b border-accent-primary/10 pb-1.5 flex items-center gap-1">
          <Globe size={13} />
          <span>1. General Restaurant Identity</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Restaurant Brand Name *"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <InputField
            label="Tagline Slogan"
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Fine Seafood & Gourmet Steaks"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputField
            label="Support Hotline Number *"
            type="text"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <InputField
            label="Contact Email Address *"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <InputField
            label="Currency Code"
            type="text"
            required
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3">
            <ImageUploadField
              label="Logo URL"
              value={logoUrl}
              onChange={setLogoUrl}
              tenantSlug={activeTenant?.slug}
              imageType="Logo"
              placeholder="e.g. https://example.com/logo.jpg"
            />
          </div>

          <InputField
            label="Facebook URL"
            type="text"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
            placeholder="facebook.com/brand"
          />

          <InputField
            label="Instagram URL"
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="instagram.com/brand"
          />
        </div>
      </div>



      <div className="flex justify-end pt-4 border-t border-border-subtle/10 mt-2">
        <Button
          type="submit"
          loading={isSaving}
          icon={<Save size={13} />}
          size="sm"
          className="rounded-full px-5 h-10 text-xs font-bold"
        >
          {isSaving ? 'Saving...' : 'Save storefront'}
        </Button>
      </div>
    </form>
  );
}
