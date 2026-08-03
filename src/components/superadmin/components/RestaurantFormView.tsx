import React, { useState, useEffect } from 'react'; import { Button } from '@/components/ui/Button';

import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  ArrowLeft,
  Utensils,
  Globe,
  Mail,
  Lock,
  MapPin,
  Phone,
  Palette,
  Sliders,
  Code,
  DollarSign,
  Clock,
  Check,
  Share2
} from 'lucide-react';
import { Input } from '@components/ui/Input';
import { Tenant } from '@/types/tenant';


interface RestaurantFormViewProps {
  editingTenant: Tenant | null;
  onClose: () => void;
  onSave: (tenant: Tenant) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}


export const RestaurantFormView: React.FC<RestaurantFormViewProps> = ({
  editingTenant,
  onClose,
  onSave,
  addToast
}) => {
  const [activeFormTab, setActiveFormTab] = useState<'visual' | 'json'>('visual');

  // Form states
  const [name, setName] = useState(editingTenant?.name || '');
  const [slug, setSlug] = useState(editingTenant?.slug || '');
  const [adminEmail, setAdminEmail] = useState(editingTenant?.adminEmail || '');
  const [adminPassword, setAdminPassword] = useState(editingTenant?.adminPassword || 'admin');
  const [brandColor, setBrandColor] = useState(editingTenant?.brandColor || '#156A45');
  const [darkColor, setDarkColor] = useState(editingTenant?.darkColor || '#0E4D34');
  const [lightColor, setLightColor] = useState(editingTenant?.lightColor || '#66C18C');
  const [tintBg, setTintBg] = useState(editingTenant?.tintBg || '#E8F4EE');


  // Business Configs
  const [tagline, setTagline] = useState(editingTenant?.tagline || '');
  const [phone, setPhone] = useState(editingTenant?.phone || '');
  const [address, setAddress] = useState(editingTenant?.address || '');
  const [cuisine, setCuisine] = useState(editingTenant?.cuisine || '');
  const [currency, setCurrency] = useState(editingTenant?.currency || 'Rs.');
  const [taxRate, setTaxRate] = useState(editingTenant?.taxRate !== undefined ? editingTenant.taxRate : 13);
  const [serviceCharge, setServiceCharge] = useState(editingTenant?.serviceCharge !== undefined ? editingTenant.serviceCharge : 5);
  const [deliveryFee, setDeliveryFee] = useState(editingTenant?.deliveryFee !== undefined ? editingTenant.deliveryFee : 150);
  const [minOrderValue, setMinOrderValue] = useState(editingTenant?.minOrderValue !== undefined ? editingTenant.minOrderValue : 500);

  const [autoApproveOrders, setAutoApproveOrders] = useState(editingTenant?.autoApproveOrders !== false);
  const [deliveryAvailable, setDeliveryAvailable] = useState(editingTenant?.deliveryAvailable !== false);
  const [takeawayAvailable, setTakeawayAvailable] = useState(editingTenant?.takeawayAvailable !== false);
  const [dineInAvailable, setDineInAvailable] = useState(editingTenant?.dineInAvailable !== false);

  // Socials
  const [socialFacebook, setSocialFacebook] = useState(editingTenant?.socials?.facebook || '');
  const [socialInstagram, setSocialInstagram] = useState(editingTenant?.socials?.instagram || '');
  const [socialTwitter, setSocialTwitter] = useState(editingTenant?.socials?.twitter || '');

  // Operating Hours
  const [openTime, setOpenTime] = useState(editingTenant?.operatingHours?.openTime || '11:00 AM');
  const [closeTime, setCloseTime] = useState(editingTenant?.operatingHours?.closeTime || '11:00 PM');
  const [subscriptionPlan, setSubscriptionPlan] = useState<'starter' | 'premium' | 'enterprise'>(editingTenant?.subscriptionPlan || 'premium');

  // Raw JSON Snippet state
  const [jsonSnippet, setJsonSnippet] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);



  // Initial load for JSON snippet when on JSON tab
  useEffect(() => {
    if (activeFormTab === 'json') {
      syncFormStateToJson();
    }
  }, [activeFormTab]);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]/g, ''));
  };

  const syncFormStateToJson = () => {
    const config = {
      name,
      slug,
      adminEmail,
      brandColor,
      darkColor,
      lightColor,
      tintBg,
      tagline,
      phone,
      address,
      cuisine,
      currency,
      taxRate: Number(taxRate) || 0,
      serviceCharge: Number(serviceCharge) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      minOrderValue: Number(minOrderValue) || 0,
      autoApproveOrders: Boolean(autoApproveOrders),
      deliveryAvailable: Boolean(deliveryAvailable),
      takeawayAvailable: Boolean(takeawayAvailable),
      dineInAvailable: Boolean(dineInAvailable),
      socials: {
        facebook: socialFacebook,
        instagram: socialInstagram,
        twitter: socialTwitter
      },
      operatingHours: {
        openTime,
        closeTime
      },
      subscriptionPlan
    };
    setJsonSnippet(JSON.stringify(config, null, 2));
    setJsonError(null);
  };

  const syncJsonToFormState = (rawJson: string): boolean => {
    try {
      if (!rawJson.trim()) {
        setJsonError('JSON configuration is empty');
        return false;
      }
      const parsed = JSON.parse(rawJson);

      if (!parsed.name) {
        setJsonError('Required field: "name" is missing in JSON');
        return false;
      }

      setName(parsed.name);
      if (parsed.slug) setSlug(parsed.slug.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (parsed.adminEmail) setAdminEmail(parsed.adminEmail);
      if (parsed.brandColor) setBrandColor(parsed.brandColor);
      if (parsed.darkColor) setDarkColor(parsed.darkColor);
      if (parsed.lightColor) setLightColor(parsed.lightColor);
      if (parsed.tintBg) setTintBg(parsed.tintBg);

      setTagline(parsed.tagline || '');
      setPhone(parsed.phone || '');
      setAddress(parsed.address || '');
      setCuisine(parsed.cuisine || '');
      setCurrency(parsed.currency || 'Rs.');
      setTaxRate(parsed.taxRate !== undefined ? Number(parsed.taxRate) : 13);
      setServiceCharge(parsed.serviceCharge !== undefined ? Number(parsed.serviceCharge) : 5);
      setDeliveryFee(parsed.deliveryFee !== undefined ? Number(parsed.deliveryFee) : 150);
      setMinOrderValue(parsed.minOrderValue !== undefined ? Number(parsed.minOrderValue) : 500);

      setAutoApproveOrders(parsed.autoApproveOrders !== undefined ? Boolean(parsed.autoApproveOrders) : true);
      setDeliveryAvailable(parsed.deliveryAvailable !== undefined ? Boolean(parsed.deliveryAvailable) : true);
      setTakeawayAvailable(parsed.takeawayAvailable !== undefined ? Boolean(parsed.takeawayAvailable) : true);
      setDineInAvailable(parsed.dineInAvailable !== undefined ? Boolean(parsed.dineInAvailable) : true);

      if (parsed.socials) {
        setSocialFacebook(parsed.socials.facebook || '');
        setSocialInstagram(parsed.socials.instagram || '');
        setSocialTwitter(parsed.socials.twitter || '');
      } else {
        setSocialFacebook('');
        setSocialInstagram('');
        setSocialTwitter('');
      }

      if (parsed.operatingHours) {
        setOpenTime(parsed.operatingHours.openTime || '11:00 AM');
        setCloseTime(parsed.operatingHours.closeTime || '11:00 PM');
      } else {
        setOpenTime('11:00 AM');
        setCloseTime('11:00 PM');
      }

      if (parsed.subscriptionPlan) {
        setSubscriptionPlan(parsed.subscriptionPlan);
      }

      setJsonError(null);
      return true;
    } catch (e: any) {
      setJsonError(e.message || 'Invalid JSON syntax');
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeFormTab === 'json') {
      const isValid = syncJsonToFormState(jsonSnippet);
      if (!isValid) {
        addToast('Cannot save. The JSON snippet contains errors.', 'error');
        return;
      }
    }

    if (!name || !adminEmail || !adminPassword) {
      addToast('Please fill all required core fields', 'error');
      return;
    }

    const tenantId = editingTenant ? editingTenant.id : `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      id: tenantId,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]/g, ''),
      adminEmail,
      adminPassword,
      brandColor,
      darkColor,
      lightColor,
      tintBg,
      createdAt: editingTenant ? editingTenant.createdAt : new Date().toISOString(),
      status: editingTenant ? editingTenant.status : 'active',
      rating: editingTenant ? editingTenant.rating : 4.8,
      tagline,
      phone,
      address,
      cuisine,
      currency,
      taxRate: Number(taxRate) || 0,
      serviceCharge: Number(serviceCharge) || 0,
      deliveryFee: Number(deliveryFee) || 0,
      minOrderValue: Number(minOrderValue) || 0,
      autoApproveOrders,
      deliveryAvailable,
      takeawayAvailable,
      dineInAvailable,
      socials: {
        facebook: socialFacebook,
        instagram: socialInstagram,
        twitter: socialTwitter
      },
      operatingHours: {
        openTime,
        closeTime
      },
      subscriptionPlan,
      customJsonSnippet: jsonSnippet
    };

    onSave(newTenant);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-2 text-left animate-fade-in select-none">
      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="custom" size="none" onClick={onClose}
            className="p-2 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-widest block leading-none">Super Admin Core</span>
            <h1 className="text-xl font-extrabold text-slate-900 font-poppins mt-1">
              {editingTenant ? `Configure / ${editingTenant.name}` : 'Deploy New Restaurant'}
            </h1>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/50">
          <Button variant="custom" size="none" type="button"
            onClick={() => {
              if (activeFormTab === 'json') {
                syncJsonToFormState(jsonSnippet);
              }
              setActiveFormTab('visual');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeFormTab === 'visual'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200 font-poppins'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Sliders size={13} />
            <span>Visual Setup</span>
          </Button>
          <Button variant="custom" size="none" type="button"
            onClick={() => {
              syncFormStateToJson();
              setActiveFormTab('json');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${activeFormTab === 'json'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200 font-poppins'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Code size={13} />
            <span>JSON Snippet Editor</span>
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <AnimatePresence mode="wait">
          {activeFormTab === 'visual' ? (
            <motion.div
              key="visual-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              {/* Left & Middle: Core details (Spans 2 columns) */}
              <div className="lg:col-span-2 space-y-6">

                {/* Section 1: Identity & Portals */}
                <div className="bg-white border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest block border-b border-indigo-50 pb-2 flex items-center gap-1.5">
                    <Building2 size={14} />
                    <span>1. Core Identity & Portal Credentials</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Restaurant Name</label>
                      <Input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="e.g. Mamma Mia Pizzeria"
                        leftIcon={<Utensils size={14} />}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Subdomain Slug</label>
                      <Input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                        placeholder="e.g. mammamia"
                        leftIcon={<Globe size={14} />}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Admin Email Address</label>
                      <Input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="e.g. admin@mammamia.com"
                        leftIcon={<Mail size={14} />}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Portal Password</label>
                      <Input
                        type="text"
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="admin"
                        leftIcon={<Lock size={14} />}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Contact details & Location */}
                <div className="bg-white border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest block border-b border-indigo-50 pb-2 flex items-center gap-1.5">
                    <MapPin size={14} />
                    <span>2. Slogan, Cuisine & Physical Location</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Brand Tagline / Slogan</label>
                      <Input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="e.g. Authentic Wood-fired Pizzas since 1994"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Cuisine Types</label>
                      <Input
                        type="text"
                        value={cuisine}
                        onChange={(e) => setCuisine(e.target.value)}
                        placeholder="e.g. Italian, Gourmet Pizza, Dessert"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Contact Phone Number</label>
                      <Input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +92 300 1234567"
                        leftIcon={<Phone size={14} />}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Physical Restaurant Address</label>
                      <Input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Plot 42-C, Phase VI DHA, Karachi"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Fees & Financial configs */}
                <div className="bg-white border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest block border-b border-indigo-50 pb-2 flex items-center gap-1.5">
                    <DollarSign size={14} />
                    <span>3. Financial Surcharges & Currency Configuration</span>
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="space-y-1 col-span-2 md:col-span-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Currency</label>
                      <Input
                        type="text"
                        required
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        placeholder="Rs."
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Tax Rate (%)</label>
                      <Input
                        type="number"
                        required
                        min={0}
                        max={100}
                        value={taxRate}
                        onChange={(e) => setTaxRate(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Serv. Charge (%)</label>
                      <Input
                        type="number"
                        required
                        min={0}
                        max={100}
                        value={serviceCharge}
                        onChange={(e) => setServiceCharge(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Delivery Fee</label>
                      <Input
                        type="number"
                        required
                        min={0}
                        value={deliveryFee}
                        onChange={(e) => setDeliveryFee(Number(e.target.value))}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Min. Order ({currency})</label>
                      <Input
                        type="number"
                        required
                        min={0}
                        value={minOrderValue}
                        onChange={(e) => setMinOrderValue(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Operating Channels & Hours */}
                <div className="bg-white border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest block border-b border-indigo-50 pb-2 flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>4. Fulfillment Channels, Operating Hours & Subscription</span>
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Opening Hour</label>
                      <Input
                        type="text"
                        value={openTime}
                        onChange={(e) => setOpenTime(e.target.value)}
                        placeholder="e.g. 11:00 AM"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Closing Hour</label>
                      <Input
                        type="text"
                        value={closeTime}
                        onChange={(e) => setCloseTime(e.target.value)}
                        placeholder="e.g. 11:00 PM"
                      />
                    </div>

                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Subscription Plan</label>
                      <div className="grid grid-cols-3 gap-1 h-11 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                        {(['starter', 'premium', 'enterprise'] as const).map((plan) => (
                          <Button variant="custom" size="none" key={plan}
                            type="button"
                            onClick={() => setSubscriptionPlan(plan)}
                            className={`text-[10px] font-extrabold uppercase rounded-lg transition-all cursor-pointer ${subscriptionPlan === plan
                              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200'
                              : 'text-slate-600 hover:text-slate-950'
                              }`}
                          >
                            {plan}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3.5 bg-slate-50/60 rounded-2xl border border-border-subtle/80 select-none">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoApproveOrders}
                        onChange={(e) => setAutoApproveOrders(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 border-slate-300 cursor-pointer"
                      />
                      <span className="text-[11px] font-extrabold text-slate-800 font-inter">Auto-Approve Orders</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={deliveryAvailable}
                        onChange={(e) => setDeliveryAvailable(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 border-slate-300 cursor-pointer"
                      />
                      <span className="text-[11px] font-extrabold text-slate-800 font-inter">Delivery channel</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={takeawayAvailable}
                        onChange={(e) => setTakeawayAvailable(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 border-slate-300 cursor-pointer"
                      />
                      <span className="text-[11px] font-extrabold text-slate-800 font-inter">Takeaway channel</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={dineInAvailable}
                        onChange={(e) => setDineInAvailable(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 accent-indigo-600 border-slate-300 cursor-pointer"
                      />
                      <span className="text-[11px] font-extrabold text-slate-800 font-inter">Dine-in channel</span>
                    </label>
                  </div>
                </div>

                {/* Section 5: Social Media */}
                <div className="bg-white border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest block border-b border-indigo-50 pb-2 flex items-center gap-1.5">
                    <Share2 size={14} />
                    <span>5. Social Media Presence</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Facebook URL</label>
                      <Input
                        type="text"
                        value={socialFacebook}
                        onChange={(e) => setSocialFacebook(e.target.value)}
                        placeholder="facebook.com/mammamia"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Instagram URL</label>
                      <Input
                        type="text"
                        value={socialInstagram}
                        onChange={(e) => setSocialInstagram(e.target.value)}
                        placeholder="instagram.com/mammamia"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">Twitter (X) URL</label>
                      <Input
                        type="text"
                        value={socialTwitter}
                        onChange={(e) => setSocialTwitter(e.target.value)}
                        placeholder="twitter.com/mammamia"
                      />
                    </div>
                  </div>
                </div>


              </div>

              {/* Right Side Column: Live Corporate Branding Palette and Preset Quick Selector */}
              <div className="space-y-6">

                {/* Visual Theme Card */}
                <div className="bg-white border border-border-subtle rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest block border-b border-indigo-50 pb-2 flex items-center gap-1.5">
                    <Palette size={14} />
                    <span>Corporate Theme Branding</span>
                  </h4>

                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    Set up custom styling hex colors to match the restaurant's visual guidelines. This updates all user interfaces dynamically.
                  </p>

                  {/* Manual Palette Inputs */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Primary Brand</label>
                      <div className="flex gap-1.5 items-center">
                        <Input
                          type="color"
                          value={brandColor}
                          onChange={(e) => { setBrandColor(e.target.value); }}
                        />
                        <Input
                          type="text"
                          value={brandColor}
                          onChange={(e) => { setBrandColor(e.target.value); }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Dark Accent</label>
                      <div className="flex gap-1.5 items-center">
                        <Input
                          type="color"
                          value={darkColor}
                          onChange={(e) => { setDarkColor(e.target.value); }}
                        />
                        <Input
                          type="text"
                          value={darkColor}
                          onChange={(e) => { setDarkColor(e.target.value); }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Light Accent</label>
                      <div className="flex gap-1.5 items-center">
                        <Input
                          type="color"
                          value={lightColor}
                          onChange={(e) => { setLightColor(e.target.value); }}
                        />
                        <Input
                          type="text"
                          value={lightColor}
                          onChange={(e) => { setLightColor(e.target.value); }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Tint Base Bg</label>
                      <div className="flex gap-1.5 items-center">
                        <Input
                          type="color"
                          value={tintBg}
                          onChange={(e) => { setTintBg(e.target.value); }}
                        />
                        <Input
                          type="text"
                          value={tintBg}
                          onChange={(e) => { setTintBg(e.target.value); }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Realtime Live Canvas Preview */}
                <div className="border border-border-subtle rounded-2xl overflow-hidden shadow-sm flex flex-col" style={{ backgroundColor: tintBg }}>
                  <div className="p-3 border-b border-black/5 flex items-center justify-between" style={{ backgroundColor: brandColor }}>
                    <div className="flex items-center gap-1.5 text-white">
                      <Utensils size={13} />
                      <span className="text-xs font-bold truncate">{name || "Live Theme Preview"}</span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase bg-white/20 text-white px-2 py-0.5 rounded leading-none">Live UI View</span>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Welcome box */}
                    <div className="bg-white rounded-xl p-3 border border-black/5 space-y-1.5 shadow-sm">
                      <p className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: darkColor }}>
                        {cuisine || "Fast Food, Bistro"}
                      </p>
                      <h5 className="text-xs font-extrabold text-slate-900 leading-none">
                        {name || "Your Restaurant Name"}
                      </h5>
                      <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                        {tagline || "Your brand tagline or delicious slogan will sit gracefully right here!"}
                      </p>
                    </div>

                    {/* Operational Indicator bar */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 bg-white/60 p-2 rounded-xl border border-black/[0.03]">
                      <span>Open Time:</span>
                      <span className="font-mono" style={{ color: brandColor }}>{openTime} - {closeTime}</span>
                    </div>

                    {/* Buttons styling demo */}
                    <div className="flex gap-2">
                      <div
                        className="flex-1 py-1.5 rounded-lg text-center text-[10px] font-extrabold text-white transition-colors cursor-pointer shadow-xs"
                        style={{ backgroundColor: brandColor }}
                      >
                        Add to Order
                      </div>
                      <div
                        className="px-2.5 py-1.5 rounded-lg text-center text-[10px] font-extrabold cursor-pointer border shadow-inner"
                        style={{ borderColor: brandColor, color: darkColor, backgroundColor: 'white' }}
                      >
                        {currency} 0.00
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ) : (
            /* JSON SNIPPET EDITOR */
            <motion.div
              key="json-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="p-5 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                  <Code size={15} />
                  <span>Dynamic JSON Configuration Schema Code</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                  This unified JSON schema completely defines the restaurant tenant structure. You can paste custom configurations, perform mass edits, configure pricing variables, or export parameters. Click <strong>Validate & Apply JSON</strong> to load edits back into the visual parameters form.
                </p>
              </div>

              <div className="relative">
                <textarea
                  value={jsonSnippet}
                  onChange={(e) => {
                    setJsonSnippet(e.target.value);
                    if (jsonError) setJsonError(null);
                  }}
                  placeholder='{ "name": "Mamma Mia", "tagline": "Authentic wood fired pizza", "phone": "+923001234567" }'
                  className="w-full h-96 p-4 bg-slate-950 text-emerald-400 border border-slate-800 rounded-2xl font-mono text-xs focus:ring-1 focus:ring-indigo-500/50 outline-none leading-relaxed resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-border-subtle">
                <div className="flex gap-2">
                  <Button variant="custom" size="none" type="button"
                    onClick={() => {
                      const success = syncJsonToFormState(jsonSnippet);
                      if (success) {
                        addToast('JSON configuration successfully parsed and applied to form!', 'success');
                      } else {
                        addToast('Failed to apply. Check JSON syntax errors.', 'error');
                      }
                    }}
                    className="h-9 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Validate & Apply JSON
                  </Button>
                  <Button variant="custom" size="none" type="button"
                    onClick={() => {
                      try {
                        if (!jsonSnippet.trim()) return;
                        const obj = JSON.parse(jsonSnippet);
                        setJsonSnippet(JSON.stringify(obj, null, 2));
                        setJsonError(null);
                        addToast('JSON formatted successfully!', 'info');
                      } catch (e: any) {
                        setJsonError(e.message || 'Syntax Error');
                        addToast('Cannot beautify. Syntax error in JSON.', 'error');
                      }
                    }}
                    className="h-9 px-4 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-border-subtle rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Beautify Code
                  </Button>
                </div>

                <Button variant="custom" size="none" type="button"
                  onClick={() => {
                    const template = {
                      name: name || "Burger Palace",
                      slug: slug || "burgerpalace",
                      adminEmail: adminEmail || "admin@burgerpalace.com",
                      brandColor: brandColor || "#DC2626",
                      darkColor: darkColor || "#991B1B",
                      lightColor: lightColor || "#F87171",
                      tintBg: tintBg || "#FEF2F2",
                      tagline: tagline || "The ultimate burger grill",
                      phone: phone || "+92 321 0000000",
                      address: address || "Gushan-e-Iqbal, Karachi",
                      cuisine: cuisine || "Fast Food, Burgers, Steaks",
                      currency: currency || "Rs.",
                      taxRate: Number(taxRate) || 13,
                      serviceCharge: Number(serviceCharge) || 5,
                      deliveryFee: Number(deliveryFee) || 120,
                      minOrderValue: Number(minOrderValue) || 400,
                      autoApproveOrders: true,
                      deliveryAvailable: true,
                      takeawayAvailable: true,
                      dineInAvailable: true,
                      socials: {
                        facebook: socialFacebook || "",
                        instagram: socialInstagram || "",
                        twitter: socialTwitter || ""
                      },
                      operatingHours: {
                        openTime: "12:00 PM",
                        closeTime: "12:00 AM"
                      },
                      subscriptionPlan: "premium"
                    };
                    setJsonSnippet(JSON.stringify(template, null, 2));
                    setJsonError(null);
                    addToast('Default template JSON loaded successfully!', 'success');
                  }}
                  className="h-9 px-4 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  Reset to Template JSON
                </Button>
              </div>

              {jsonError && (
                <div className="p-4 bg-red-50 border border-red-150 rounded-2xl text-red-700 font-mono text-xs select-text">
                  <strong>JSON ERROR:</strong> {jsonError}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bar Footer */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 select-none">
          <Button variant="custom" size="none" type="button"
            onClick={onClose}
            className="h-11 px-5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
          >
            Cancel
          </Button>
          <Button variant="custom" size="none" type="submit"
            className="h-11 px-6 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm cursor-pointer"
          >
            {editingTenant ? 'Save Restaurant' : 'Deploy Restaurant'}
          </Button>
        </div>
      </form>
    </div>
  );
};
