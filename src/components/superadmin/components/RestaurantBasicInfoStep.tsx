import React, { useState, useEffect } from 'react';
import { RestaurantConfig } from '@/types/restaurant';
import { Input } from '@components/ui/Input';
import { Combobox } from '@components/ui/Combobox';
import { Select } from '@components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import { tenantsApi } from '@/lib/api/tenants.api';
import {
  Building2,
  Lock,
  Mail,
  Phone,
  MapPin,
  Share2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface RestaurantBasicInfoStepProps {
  form: RestaurantConfig;
  errors: Record<string, string>;
  handleFieldChange: (path: string, value: any) => void;
  activeTab: string;
  ownerDetails: any;
  setOwnerDetails: React.Dispatch<React.SetStateAction<any>>;
}

export const RestaurantBasicInfoStep: React.FC<RestaurantBasicInfoStepProps> = ({
  form,
  errors,
  handleFieldChange,
  activeTab,
  ownerDetails,
  setOwnerDetails
}) => {
  const [globalAreas, setGlobalAreas] = useState<any[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  useEffect(() => {
    tenantsApi.getGlobalAreas().then(areas => {
      setGlobalAreas(areas || []);
    }).catch(err => console.error("Failed to fetch global areas", err));
  }, []);

  return (
    <>
      {/* Section 1: Basic Settings */}
      <section id="section-basic" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'basic' ? '' : 'hidden'}`}>
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="text-indigo-600" size={18} />
            <span>1. Basic Settings</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">Configure global store details, URLs, and tax settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Shop Name</label>
            <Input
              type="text"
              required
              value={form.name}
              onChange={(e: any) => handleFieldChange('name', e.target.value)}
              placeholder="e.g. Saffron Table"
              className={`w-full h-11 px-4 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all font-sans ${errors.name ? 'border-rose-500' : 'border-slate-200'}`}
            />
            {errors.name && <p className="text-[10px] text-rose-500 font-bold">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Subdomain Slug (Unique)</label>
            <div className="relative">
              <Input
                type="text"
                required
                value={form.slug}
                onChange={(e: any) => handleFieldChange('slug', e.target.value)}
                placeholder="saffron-table"
                className={`w-full h-11 px-4 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all font-sans ${errors.slug ? 'border-rose-500' : 'border-slate-200'}`}
              />
            </div>
            {errors.slug && <p className="text-[10px] text-rose-500 font-bold">{errors.slug}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Standard Tax Rate (%)</label>
            <div className="relative">
              <Input
                type="number"
                min={0}
                max={100}
                required
                value={form.taxPercent}
                onChange={(e: any) => handleFieldChange('taxPercent', Number(e.target.value))}
                className={`w-full h-11 pr-10 bg-slate-50 border rounded-xl text-xs font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors.taxPercent ? 'border-rose-500' : 'border-slate-200'}`}
              />
              <span className="absolute right-3.5 top-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest pointer-events-none">%</span>
            </div>
            {errors.taxPercent && <p className="text-[10px] text-rose-500 font-bold">{errors.taxPercent}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Receipt Header (POS & Kitchen)</label>
            <textarea
              rows={4}
              value={form.receiptConfig?.headerMessage || ''}
              onChange={(e: any) => handleFieldChange('receiptConfig.headerMessage', e.target.value)}
              placeholder={"e.g. DINEFINE RESTAURANT\n123 CULINARY AVENUE\nPHONE: (555) 123-4567"}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Receipt Footer (POS)</label>
            <textarea
              rows={4}
              value={form.receiptConfig?.footerMessage || ''}
              onChange={(e: any) => handleFieldChange('receiptConfig.footerMessage', e.target.value)}
              placeholder={"e.g. TIP IS NOT INCLUDED.\nTHANK YOU FOR DINING WITH US!"}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all font-sans"
            />
          </div>
        </div>
      </section>

      {/* Section 2: Owner Details */}
      <section id="section-owner" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'owner' ? '' : 'hidden'}`}>
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Lock className="text-indigo-600" size={18} />
            <span>2. Owner Details</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">Configure the main account holder and business classification for this tenant.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Owner Name</label>
            <Input
              type="text"
              required
              value={ownerDetails.ownerName}
              onChange={(e: any) => setOwnerDetails((prev: any) => ({ ...prev, ownerName: e.target.value }))}
              placeholder="e.g. John Doe"
              className="w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Owner Email (Login ID)</label>
            <Input
              type="email"
              required
              value={ownerDetails.ownerEmail}
              onChange={(e: any) => setOwnerDetails((prev: any) => ({ ...prev, ownerEmail: e.target.value }))}
              placeholder="owner@restaurant.com"
              className="w-full h-11 pl-8 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all font-sans"
              leftIcon={<Mail size={14} />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Owner Password</label>
            <Input
              type="password"
              required
              value={ownerDetails.ownerPassword}
              onChange={(e: any) => setOwnerDetails((prev: any) => ({ ...prev, ownerPassword: e.target.value }))}
              placeholder="Required for first login"
              className="w-full h-11 pl-8 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all font-sans"
              leftIcon={<Lock size={14} />}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider block">Business Type</label>
            <Combobox
              options={[
                { value: 'RESTAURANT', label: 'Restaurant' },
                { value: 'FAST_FOOD', label: 'Fast Food' },
                { value: 'CAFE', label: 'Cafe' },
                { value: 'ICE_CREAM_PARLOUR', label: 'Ice Cream Parlour' },
                { value: 'BAKERY', label: 'Bakery' },
                { value: 'CLOUD_KITCHEN', label: 'Cloud Kitchen' },
                { value: 'RETAIL', label: 'Retail' }
              ]}
              value={ownerDetails.businessType}
              onChange={(val: any) => setOwnerDetails((prev: any) => ({ ...prev, businessType: val as any }))}
              placeholder="Select Business Type..."
              searchPlaceholder="Search types..."
              className="w-full h-11 bg-white border border-slate-200 rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Contact */}
      <section id="section-contact" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'contact' ? '' : 'hidden'}`}>
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Mail className="text-indigo-600" size={18} />
            <span>3. Contact Information & Social Handles</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">Setup primary storefront email, phone numbers, and physical venue address.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Phone Number</label>
            <Input
              type="text"
              required
              value={form.contact.phone}
              onChange={(e: any) => handleFieldChange('contact.phone', e.target.value)}
              placeholder="021 111 442 542"
              className={`w-full h-11 pl-10 pr-4 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors['contact.phone'] ? 'border-rose-500' : 'border-slate-200'}`}
              leftIcon={<Phone size={14} />}
            />
            {errors['contact.phone'] && <p className="text-[10px] text-rose-500 font-bold">{errors['contact.phone']}</p>}
          </div>

          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Admin / Feedback Email</label>
            <Input
              type="email"
              required
              value={form.contact.email}
              onChange={(e: any) => handleFieldChange('contact.email', e.target.value)}
              placeholder="feedback@indolj.com.pk"
              className={`w-full h-11 pl-10 pr-4 bg-slate-50 border rounded-xl text-xs font-mono font-bold text-slate-950 outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors['contact.email'] ? 'border-rose-500' : 'border-slate-200'}`}
              leftIcon={<Mail size={14} />}
            />
            {errors['contact.email'] && <p className="text-[10px] text-rose-500 font-bold">{errors['contact.email']}</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Physical Address</label>
          <textarea
            rows={2}
            value={form.contact.address}
            onChange={(e: any) => handleFieldChange('contact.address', e.target.value)}
            placeholder="Rooftop @ Habitt Building On Main, Tipu Sultan Rd, off Shahrah-e-Faisal Road, Karachi"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all font-sans"
          />
        </div>

        {/* Social handles */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h4 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest block flex items-center gap-1">
            <Share2 size={13} />
            <span>Social Handles</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Facebook Profile URL</label>
              <Input
                type="text"
                value={form.social.facebook}
                onChange={(e: any) => handleFieldChange('social.facebook', e.target.value)}
                placeholder="https://facebook.com/indolj"
                className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors['social.facebook'] ? 'border-rose-500' : 'border-slate-200'}`}
              />
              {errors['social.facebook'] && <p className="text-[10px] text-rose-500 font-bold">{errors['social.facebook']}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Instagram Profile URL</label>
              <Input
                type="text"
                value={form.social.instagram}
                onChange={(e: any) => handleFieldChange('social.instagram', e.target.value)}
                placeholder="https://instagram.com/indolj"
                className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors['social.instagram'] ? 'border-rose-500' : 'border-slate-200'}`}
              />
              {errors['social.instagram'] && <p className="text-[10px] text-rose-500 font-bold">{errors['social.instagram']}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Website Domain URL</label>
              <Input
                type="text"
                value={form.social.website}
                onChange={(e: any) => handleFieldChange('social.website', e.target.value)}
                placeholder="https://www.indolj.com"
                className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors['social.website'] ? 'border-rose-500' : 'border-slate-200'}`}
              />
              {errors['social.website'] && <p className="text-[10px] text-rose-500 font-bold">{errors['social.website']}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-600 uppercase block">TikTok Handle URL (Optional)</label>
              <Input
                type="text"
                value={form.social.tiktok}
                onChange={(e: any) => handleFieldChange('social.tiktok', e.target.value)}
                placeholder="https://tiktok.com/@indolj"
                className={`w-full h-10 px-3 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all ${errors['social.tiktok'] ? 'border-rose-500' : 'border-slate-200'}`}
              />
              {errors['social.tiktok'] && <p className="text-[10px] text-rose-500 font-bold">{errors['social.tiktok']}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Location */}
      <section id="section-location" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'location' ? '' : 'hidden'}`}>
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <MapPin className="text-indigo-600" size={18} />
            <span>4. Location Configuration</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">Specify regional parameters. Future-ready for visual GIS map coordinates integration.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5 col-span-2">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase block mb-2">Serving City & Area / Hub</label>
            <div className="w-full bg-white border border-slate-200 rounded-xl p-3 max-h-[350px] overflow-y-auto shadow-sm font-sans select-none">
              {globalAreas.length === 0 ? (
                <div className="text-xs text-slate-500 font-medium p-2">No areas found. Please add global delivery areas first.</div>
              ) : (
                Object.entries(
                  globalAreas.reduce((acc: any, ga: any) => {
                    if (!acc[ga.city]) acc[ga.city] = {};
                    if (!acc[ga.city][ga.region]) acc[ga.city][ga.region] = [];
                    acc[ga.city][ga.region].push(ga);
                    return acc;
                  }, {})
                ).map(([city, regions]: [string, any]) => {
                  const cityKey = `city-${city}`;
                  const isExpanded = expandedNodes[cityKey] ?? true;

                  const allAreasInCity = Object.values(regions).flat().map((a: any) => `${city} - ${a.region} - ${a.name}`);
                  const selectedAreas = form.location.area ? form.location.area.split(', ').filter(Boolean) : [];
                  const selectedInCity = allAreasInCity.filter((a: string) => selectedAreas.includes(a));
                  const cityAllChecked = selectedInCity.length === allAreasInCity.length && allAreasInCity.length > 0;

                  return (
                    <div key={city} className="mb-1">
                      <div className="flex items-center gap-1.5 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors" onClick={() => toggleNode(cityKey)}>
                        <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center h-full pt-0.5">
                          <Checkbox
                            label={""}
                            checked={cityAllChecked}
                            onChange={(e) => {
                              let newAreas = [...selectedAreas];
                              if (e.target.checked) {
                                allAreasInCity.forEach((a: string) => { if (!newAreas.includes(a)) newAreas.push(a); });
                              } else {
                                newAreas = newAreas.filter((a: string) => !allAreasInCity.includes(a));
                              }
                              handleFieldChange('location.area', newAreas.join(', '));
                              handleFieldChange('location.city', Array.from(new Set(newAreas.map(a => a.split(' - ')[0]))).join(', '));
                            }}
                          />
                        </div>
                        <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5 pointer-events-none">
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>
                        <span className="text-sm font-medium text-slate-800">{city}</span>
                      </div>

                      {isExpanded && (
                        <div className="pl-6 space-y-0.5 mt-0.5">
                          {Object.entries(regions).map(([region, areas]: [string, any]) => {
                            const regionKey = `region-${city}-${region}`;
                            const isRegionExpanded = expandedNodes[regionKey] ?? true;

                            const allAreasInRegion = areas.map((a: any) => `${city} - ${region} - ${a.name}`);
                            const selectedInRegion = allAreasInRegion.filter((a: string) => selectedAreas.includes(a));
                            const regionAllChecked = selectedInRegion.length === allAreasInRegion.length && allAreasInRegion.length > 0;

                            return (
                              <div key={region}>
                                <div className="flex items-center gap-1.5 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors" onClick={() => toggleNode(regionKey)}>
                                  <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center h-full pt-0.5">
                                    <Checkbox
                                      label={""}
                                      checked={regionAllChecked}
                                      onChange={(e) => {
                                        let newAreas = [...selectedAreas];
                                        if (e.target.checked) {
                                          allAreasInRegion.forEach((a: string) => { if (!newAreas.includes(a)) newAreas.push(a); });
                                        } else {
                                          newAreas = newAreas.filter((a: string) => !allAreasInRegion.includes(a));
                                        }
                                        handleFieldChange('location.area', newAreas.join(', '));
                                        handleFieldChange('location.city', Array.from(new Set(newAreas.map(a => a.split(' - ')[0]))).join(', '));
                                      }}
                                    />
                                  </div>
                                  <button type="button" className="text-slate-400 hover:text-slate-600 p-0.5 pointer-events-none">
                                    {isRegionExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  </button>
                                  <span className="text-[13px] font-medium text-slate-700">{region}</span>
                                </div>

                                {isRegionExpanded && (
                                  <div className="pl-6 space-y-0.5 mt-0.5">
                                    {areas.map((area: any) => {
                                      const areaKey = `${city} - ${region} - ${area.name}`;
                                      const isAreaChecked = selectedAreas.includes(areaKey);
                                      return (
                                        <div 
                                          key={area.id} 
                                          className="flex items-center gap-1.5 hover:bg-slate-50 p-1.5 rounded-lg cursor-pointer transition-colors"
                                          onClick={() => {
                                            let newAreas = [...selectedAreas];
                                            if (!isAreaChecked) {
                                              if (!newAreas.includes(areaKey)) newAreas.push(areaKey);
                                            } else {
                                              newAreas = newAreas.filter(a => a !== areaKey);
                                            }
                                            handleFieldChange('location.area', newAreas.join(', '));
                                            handleFieldChange('location.city', Array.from(new Set(newAreas.map(a => a.split(' - ')[0]))).join(', '));
                                          }}
                                        >
                                          <div onClick={(e) => e.stopPropagation()} className="flex items-center justify-center h-full pt-0.5">
                                            <Checkbox
                                              checked={isAreaChecked}
                                              label={""}
                                              onChange={(e) => {
                                                let newAreas = [...selectedAreas];
                                                if (e.target.checked) {
                                                  if (!newAreas.includes(areaKey)) newAreas.push(areaKey);
                                                } else {
                                                  newAreas = newAreas.filter(a => a !== areaKey);
                                                }
                                                handleFieldChange('location.area', newAreas.join(', '));
                                                handleFieldChange('location.city', Array.from(new Set(newAreas.map(a => a.split(' - ')[0]))).join(', '));
                                              }}
                                            />
                                          </div>
                                          {/* Ensure proper spacing for visual alignment without caret */}
                                          <div className="w-[10px]"></div>
                                          <span className="text-[13px] text-slate-600">{area.name}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
