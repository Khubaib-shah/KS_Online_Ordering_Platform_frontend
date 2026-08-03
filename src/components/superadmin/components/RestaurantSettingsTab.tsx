import React from 'react';import { Button } from '@/components/ui/Button';

import { Input } from '@/components/ui/Input';
import {
  Sliders,
  User,
  Utensils,
  Globe,
  Mail,
  Lock,
  MapPin,
  Phone,
  Palette,
  DollarSign,
  Clock,
  Share2
} from 'lucide-react';


interface RestaurantSettingsTabProps {
  handleSaveSettings: (e: React.FormEvent) => void;
  brandColor: string;
  darkColor: string;
  lightColor: string;
  tintBg: string;
  name: string;
  handleNameChange: (val: string) => void;
  slug: string;
  setSlug: (val: string) => void;
  adminEmail: string;
  setAdminEmail: (val: string) => void;
  adminPassword: string;
  setAdminPassword: (val: string) => void;
  tagline: string;
  setTagline: (val: string) => void;
  cuisine: string;
  setCuisine: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  setBrandColor: (val: string) => void;
  setDarkColor: (val: string) => void;
  setLightColor: (val: string) => void;
  setTintBg: (val: string) => void;
  currency: string;
  setCurrency: (val: string) => void;
  taxRate: number;
  setTaxRate: (val: number) => void;
  serviceCharge: number;
  setServiceCharge: (val: number) => void;
  deliveryFee: number;
  setDeliveryFee: (val: number) => void;
  minOrderValue: number;
  setMinOrderValue: (val: number) => void;
  openTime: string;
  setOpenTime: (val: string) => void;
  closeTime: string;
  setCloseTime: (val: string) => void;
  subscriptionPlan: 'starter' | 'premium' | 'enterprise';
  setSubscriptionPlan: (val: 'starter' | 'premium' | 'enterprise') => void;
  autoApproveOrders: boolean;
  setAutoApproveOrders: (val: boolean) => void;
  deliveryAvailable: boolean;
  setDeliveryAvailable: (val: boolean) => void;
  takeawayAvailable: boolean;
  setTakeawayAvailable: (val: boolean) => void;
  dineInAvailable: boolean;
  setDineInAvailable: (val: boolean) => void;
  socialFacebook: string;
  setSocialFacebook: (val: string) => void;
  socialInstagram: string;
  setSocialInstagram: (val: string) => void;
  socialTwitter: string;
  setSocialTwitter: (val: string) => void;
  handleResetForm: () => void;
}

export const RestaurantSettingsTab: React.FC<RestaurantSettingsTabProps> = ({
  handleSaveSettings,
  brandColor,
  darkColor,
  lightColor,
  tintBg,
  name,
  handleNameChange,
  slug,
  setSlug,
  adminEmail,
  setAdminEmail,
  adminPassword,
  setAdminPassword,
  tagline,
  setTagline,
  cuisine,
  setCuisine,
  phone,
  setPhone,
  address,
  setAddress,
  setBrandColor,
  setDarkColor,
  setLightColor,
  setTintBg,
  currency,
  setCurrency,
  taxRate,
  setTaxRate,
  serviceCharge,
  setServiceCharge,
  deliveryFee,
  setDeliveryFee,
  minOrderValue,
  setMinOrderValue,
  openTime,
  setOpenTime,
  closeTime,
  setCloseTime,
  subscriptionPlan,
  setSubscriptionPlan,
  autoApproveOrders,
  setAutoApproveOrders,
  deliveryAvailable,
  setDeliveryAvailable,
  takeawayAvailable,
  setTakeawayAvailable,
  dineInAvailable,
  setDineInAvailable,
  socialFacebook,
  setSocialFacebook,
  socialInstagram,
  setSocialInstagram,
  socialTwitter,
  setSocialTwitter,
  handleResetForm
}) => {
  return (
    <form onSubmit={handleSaveSettings} className="bg-white border border-border-subtle rounded-card p-6 md:p-8 shadow-card space-y-8 text-left font-inter font-sans">
      {/* Form Title bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-subtle pb-4 gap-3 select-none">
        <div>
          <h3 className="text-lg font-semibold text-text-primary font-poppins">Manage Restaurant Settings</h3>
          <p className="text-xs text-text-secondary mt-0.5">Change branding, operating limits, corporate coordinates, and tax variables.</p>
        </div>
        <Button variant="custom" size="none"           type="submit"
          className="px-5 h-10 text-white rounded-xl text-xs font-semibold shadow-button hover:opacity-95 cursor-pointer transition-all active:scale-[0.98]"
          style={{ backgroundColor: brandColor }}
        >
          Save Settings Parameters
        </Button>
      </div>

      {/* Section 1: Core Credentials & identity */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider block border-b border-border-subtle pb-2 flex items-center gap-2" style={{ color: brandColor }}>
          <User size={14} />
          <span>1. Core Identity & Administrative Access</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Restaurant Name</label>
            <Input
              type="text"
              required
              value={name}
              onChange={(e: any) => handleNameChange(e.target.value)}
              placeholder="e.g. Mamma Mia Pizzeria"
              leftIcon={<Utensils size={13} />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Subdomain Slug</label>
            <Input
              type="text"
              required
              value={slug}
              onChange={(e: any) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
              placeholder="e.g. mammamia"
              leftIcon={<Globe size={13} />}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Admin Email Address</label>
            <Input
              type="email"
              required
              value={adminEmail}
              onChange={(e: any) => setAdminEmail(e.target.value)}
              placeholder="e.g. admin@mammamia.com"
              leftIcon={<Mail size={13} />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Portal Password</label>
            <Input
              type="text"
              required
              value={adminPassword}
              onChange={(e: any) => setAdminPassword(e.target.value)}
              placeholder="admin"
              leftIcon={<Lock size={13} />}
            />
          </div>
        </div>
      </div>

      {/* Section 2: Contact, Location & Cuisine */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider block border-b border-border-subtle pb-2 flex items-center gap-2" style={{ color: brandColor }}>
          <MapPin size={14} />
          <span>2. Branding Tagline, Contact & Cuisine specialties</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Brand Tagline / Slogan</label>
            <Input
              type="text"
              value={tagline}
              onChange={(e: any) => setTagline(e.target.value)}
              placeholder="e.g. Authentic Wood-fired Pizzas since 1994"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Cuisine Types</label>
            <Input
              type="text"
              value={cuisine}
              onChange={(e: any) => setCuisine(e.target.value)}
              placeholder="e.g. Italian, Gourmet Pizza, Dessert"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Contact Phone Number</label>
            <Input
              type="text"
              value={phone}
              onChange={(e: any) => setPhone(e.target.value)}
              placeholder="e.g. +92 300 1234567"
              leftIcon={<Phone size={13} />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Physical Restaurant Address</label>
            <Input
              type="text"
              value={address}
              onChange={(e: any) => setAddress(e.target.value)}
              placeholder="e.g. Plot 42-C, Phase VI DHA, Karachi"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Brand Presets & Colors */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider block border-b border-border-subtle pb-2 flex items-center gap-2" style={{ color: brandColor }}>
          <Palette size={14} />
          <span>3. Theme Styling & Color Palette</span>
        </h4>



        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Primary Brand Color</label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={brandColor}
                onChange={(e: any) => { setBrandColor(e.target.value); }}
                className="w-12 h-11 p-0 cursor-pointer shrink-0"
              />
              <Input
                type="text"
                value={brandColor}
                onChange={(e: any) => { setBrandColor(e.target.value); }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Dark Accent Color</label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={darkColor}
                onChange={(e: any) => { setDarkColor(e.target.value); }}
                className="w-12 h-11 p-0 cursor-pointer shrink-0"
              />
              <Input
                type="text"
                value={darkColor}
                onChange={(e: any) => { setDarkColor(e.target.value); }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Light Accent Color</label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={lightColor}
                onChange={(e: any) => { setLightColor(e.target.value); }}
                className="w-12 h-11 p-0 cursor-pointer shrink-0"
              />
              <Input
                type="text"
                value={lightColor}
                onChange={(e: any) => { setLightColor(e.target.value); }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Tint Background Bg</label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={tintBg}
                onChange={(e: any) => { setTintBg(e.target.value); }}
                className="w-12 h-11 p-0 cursor-pointer shrink-0"
              />
              <Input
                type="text"
                value={tintBg}
                onChange={(e: any) => { setTintBg(e.target.value); }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Fees, Currency & Surcharges */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider block border-b border-border-subtle pb-2 flex items-center gap-2" style={{ color: brandColor }}>
          <DollarSign size={14} />
          <span>4. Pricing Currency, Tax rates & Delivery Schedules</span>
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="space-y-1.5 col-span-2 md:col-span-1">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Currency Symbol</label>
            <Input
              type="text"
              required
              value={currency}
              onChange={(e: any) => setCurrency(e.target.value)}
              placeholder="Rs."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Tax Rate (%)</label>
            <Input
              type="number"
              required
              min={0}
              max={100}
              value={taxRate}
              onChange={(e: any) => setTaxRate(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Service Surcharge (%)</label>
            <Input
              type="number"
              required
              min={0}
              max={100}
              value={serviceCharge}
              onChange={(e: any) => setServiceCharge(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Delivery Fee ({currency})</label>
            <Input
              type="number"
              required
              min={0}
              value={deliveryFee}
              onChange={(e: any) => setDeliveryFee(Number(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Min. Order ({currency})</label>
            <Input
              type="number"
              required
              min={0}
              value={minOrderValue}
              onChange={(e: any) => setMinOrderValue(Number(e.target.value))}
            />
          </div>
        </div>
      </div>

      {/* Section 5: Fulfillment channels & Operating Hours */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider block border-b border-border-subtle pb-2 flex items-center gap-2" style={{ color: brandColor }}>
          <Clock size={14} />
          <span>5. Fulfilment Channels, Hours & Subscription Plan</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Opening Time</label>
            <Input
              type="text"
              value={openTime}
              onChange={(e: any) => setOpenTime(e.target.value)}
              placeholder="e.g. 11:00 AM"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Closing Time</label>
            <Input
              type="text"
              value={closeTime}
              onChange={(e: any) => setCloseTime(e.target.value)}
              placeholder="e.g. 11:00 PM"
            />
          </div>

          <div className="space-y-1.5 col-span-1 sm:col-span-2 select-none">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">System Subscription Tier</label>
            <div className="grid grid-cols-3 gap-1 h-11 p-1 bg-surface-muted rounded-xl border border-border-subtle select-none">
              {(['starter', 'premium', 'enterprise'] as const).map((plan) => (
                <Button variant="custom" size="none"                   key={plan}
                  type="button"
                  onClick={() => setSubscriptionPlan(plan)}
                  className={`text-[10px] font-semibold uppercase rounded-lg transition-all duration-200 cursor-pointer border-0 ${subscriptionPlan === plan
                      ? 'text-white shadow-sm'
                      : 'text-text-secondary hover:text-text-primary hover:bg-white/40'
                    }`}
                  style={{
                    backgroundColor: subscriptionPlan === plan ? brandColor : 'transparent',
                  }}
                >
                  {plan}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Fulfilment channels checkboxes styled cleanly */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4.5 bg-surface-muted/70 rounded-2xl border border-border-subtle select-none">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={autoApproveOrders}
              onChange={(e: any) => setAutoApproveOrders(e.target.checked)}
              className="w-4 h-4 rounded text-text-primary focus:ring-text-primary accent-text-primary border-border-subtle cursor-pointer"
              style={{ accentColor: brandColor }}
            />
            <span className="text-xs font-semibold text-text-primary font-inter">Auto-Approve Orders</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={deliveryAvailable}
              onChange={(e: any) => setDeliveryAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-text-primary focus:ring-text-primary accent-text-primary border-border-subtle cursor-pointer"
              style={{ accentColor: brandColor }}
            />
            <span className="text-xs font-semibold text-text-primary font-inter">Delivery Service</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={takeawayAvailable}
              onChange={(e: any) => setTakeawayAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-text-primary focus:ring-text-primary accent-text-primary border-border-subtle cursor-pointer"
              style={{ accentColor: brandColor }}
            />
            <span className="text-xs font-semibold text-text-primary font-inter">Takeaway Orders</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={dineInAvailable}
              onChange={(e: any) => setDineInAvailable(e.target.checked)}
              className="w-4 h-4 rounded text-text-primary focus:ring-text-primary accent-text-primary border-border-subtle cursor-pointer"
              style={{ accentColor: brandColor }}
            />
            <span className="text-xs font-semibold text-text-primary font-inter">Dine-in Support</span>
          </label>
        </div>
      </div>

      {/* Section 6: Social Handles */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider block border-b border-border-subtle pb-2 flex items-center gap-2" style={{ color: brandColor }}>
          <Share2 size={14} />
          <span>6. Social Media & Online Marketing Presences</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Facebook Link</label>
            <Input
              type="text"
              value={socialFacebook}
              onChange={(e: any) => setSocialFacebook(e.target.value)}
              placeholder="facebook.com/mammamia"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Instagram Link</label>
            <Input
              type="text"
              value={socialInstagram}
              onChange={(e: any) => setSocialInstagram(e.target.value)}
              placeholder="instagram.com/mammamia"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">Twitter (X) Link</label>
            <Input
              type="text"
              value={socialTwitter}
              onChange={(e: any) => setSocialTwitter(e.target.value)}
              placeholder="twitter.com/mammamia"
            />
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="flex justify-end pt-5 gap-3 border-t border-border-subtle select-none">
        <Button variant="custom" size="none"           type="button"
          onClick={handleResetForm}
          className="px-5 h-11 border border-border-subtle rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
        >
          Reset Form
        </Button>
        <Button variant="custom" size="none"           type="submit"
          className="px-7 h-11 text-white rounded-xl text-xs font-semibold shadow-button hover:opacity-95 transition-all duration-200 cursor-pointer active:scale-[0.98]"
          style={{ backgroundColor: brandColor }}
        >
          Save Settings Configuration
        </Button>
      </div>
    </form>
  );
};
