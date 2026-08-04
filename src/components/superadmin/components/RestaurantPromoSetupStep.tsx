import React from 'react';import { Button } from '@/components/ui/Button';

import { AnimatePresence, motion } from 'motion/react';
import {
  Percent,
  Globe,
  Chrome,
  FileText,
  Plus,
  Trash2
} from 'lucide-react';
import { RestaurantConfig } from '@/types/restaurant';
import { Input } from '@components/ui/Input';
import { Select } from '@components/ui/Select';

interface RestaurantPromoSetupStepProps {
  form: RestaurantConfig;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleFieldChange: (path: string, value: any) => void;
  activeTab: string;
  updateForm: (updater: (prev: RestaurantConfig) => RestaurantConfig) => void;
  setForm: React.Dispatch<React.SetStateAction<RestaurantConfig>>;
}

export const RestaurantPromoSetupStep: React.FC<RestaurantPromoSetupStepProps> = ({
  form,
  handleFieldChange,
  activeTab,
  updateForm
}) => {
  const handlePromoTypeChange = (type: 'flat_percent' | 'flat_amount' | 'free_delivery' | 'bogo') => {
    updateForm(prev => {
      const currentVal = prev.activePromo?.value || 0;
      let label = '';
      if (type === 'flat_percent') label = `${currentVal}% OFF`;
      else if (type === 'flat_amount') label = `Rs. ${currentVal} OFF`;
      else if (type === 'free_delivery') label = 'FREE DELIVERY';
      else if (type === 'bogo') label = 'BUY 1 GET 1 FREE';

      return {
        ...prev,
        activePromo: { type, value: currentVal, label }
      };
    });
  };

  return (
    <>
      {/* Section 6: Promotions */}
      <section id="section-promo" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'promo' ? '' : 'hidden'}`}>
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Percent className="text-indigo-600" size={18} />
            <span>6. Website Promotion Rules</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">Configure automated active storewide discounts and campaigns.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Campaign Promo Type</label>
            <Select
              value={form.activePromo?.type || 'flat_percent'}
              onChange={(e) => handlePromoTypeChange(e.target.value as any)}
              className="w-full h-11 px-3 bg-slate-55 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="flat_percent">Flat Percentage (%)</option>
              <option value="flat_amount">Flat Fixed Amount (Rs.)</option>
              <option value="free_delivery">Free Store Delivery</option>
              <option value="bogo">Buy One Get One Free (BOGO)</option>
            </Select>
          </div>

          <AnimatePresence mode="wait">
            {(form.activePromo?.type === 'flat_percent' || form.activePromo?.type === 'flat_amount') && (
              <motion.div
                key="promo-value-input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-1.5"
              >
                <label className="text-[10px] font-extrabold text-slate-600 uppercase block">
                  {form.activePromo?.type === 'flat_percent' ? 'Discount Ratio (%)' : 'Discount Amount (Rs.)'}
                </label>
                <Input
                  type="number"
                  min={1}
                  value={form.activePromo?.value || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    updateForm(prev => {
                      const label = prev.activePromo?.type === 'flat_percent'
                        ? `${val}% OFF`
                        : `Rs. ${val} OFF`;
                      return {
                        ...prev,
                        activePromo: { ...prev.activePromo!, value: val, label }
                      };
                    });
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Promotion Banner Text Label</label>
            <Input
              type="text"
              value={form.activePromo?.label || ''}
              onChange={(e) => handleFieldChange('activePromo.label', e.target.value)}
              placeholder="40% OFF STOREWIDE"
            />
          </div>
        </div>
      </section>

      {/* Section 10: SEO */}
      <section id="section-seo" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'seo' ? '' : 'hidden'}`}>
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="text-indigo-600" size={18} />
            <span>10. Search Engine Optimization (SEO) Config</span>
          </h2>
          <p className="text-slate-555 text-xs mt-1">Configure meta tags, title prefixes, description indexing to boost web visibility.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-extrabold text-slate-605 uppercase block">Meta SEO Description</label>
              <span className={`text-[10px] font-bold ${form.seoText && form.seoText.length > 160 ? 'text-rose-505' : 'text-slate-400'}`}>
                {form.seoText ? form.seoText.length : 0} / 160 characters
              </span>
            </div>
            <textarea
              rows={4}
              value={form.seoText}
              onChange={(e) => handleFieldChange('seoText', e.target.value)}
              placeholder="Check out the amazing food variety of Indolj Restaurant - Karachi. We strive to bring the best experience..."
              className="w-full p-3 bg-slate-55 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:bg-white focus:border-indigo-505 transition-all font-sans"
            />
          </div>

          <div className="bg-slate-55 border border-slate-200/60 p-5 rounded-2xl select-none text-left">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider border-b border-slate-200/60 pb-2 mb-3">
              <Chrome size={12} className="text-slate-400" />
              <span>Google Search snippet Preview</span>
            </div>
            <div className="space-y-1 font-sans">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                <span>https://{form.slug || 'your-restaurant'}.indolj.com</span>
                <span className="text-[9px] text-slate-300">▼</span>
              </div>
              <h3 className="text-[15px] text-[#1a0dab] font-semibold hover:underline cursor-pointer leading-tight">
                {form.name || 'Your Restaurant Name'} | Premium Food Delivery Karachi
              </h3>
              <p className="text-xs text-[#4d5156] font-normal leading-relaxed">
                {form.seoText || 'Please type an SEO Description above to preview how your restaurant website appears inside standard Google organic index queries.'}
              </p>
            </div>
          </div>

          <div className="space-y-1.5 pt-4 border-t border-slate-100">
            <label className="text-[10px] font-extrabold text-slate-605 uppercase block">Custom Website Footer Text</label>
            <Input
              type="text"
              value={form.footerText || ''}
              onChange={(e) => handleFieldChange('footerText', e.target.value)}
              placeholder="e.g. © 2026 AZ Food Corner. All rights reserved."
            />
            <p className="text-[10px] text-slate-400 font-medium">This text is dynamically displayed in the footer of your customer website.</p>
          </div>
        </div>
      </section>

      {/* Section 11: Legal & FAQs */}
      <section id="section-legal" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'legal' ? '' : 'hidden'}`}>
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="text-indigo-600" size={18} />
            <span>11. Legal & FAQs</span>
          </h2>
          <p className="text-slate-505 text-xs mt-1">Configure Privacy Policy and Frequently Asked Questions for your website.</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Privacy Policy</h3>
          <div className="space-y-3">
            <Input
              type="text"
              value={form.privacyPolicy?.title || ''}
              onChange={(e) => handleFieldChange('privacyPolicy', { ...(form.privacyPolicy || {}), title: e.target.value })}
              placeholder="Privacy Policy Title"
              className="w-full h-11 px-4 bg-slate-55 border border-slate-200 rounded-xl text-xs font-semibold"
            />
            <textarea
              value={form.privacyPolicy?.intro || ''}
              onChange={(e) => handleFieldChange('privacyPolicy', { ...(form.privacyPolicy || {}), intro: e.target.value })}
              placeholder="Privacy Policy Introduction"
              rows={3}
              className="w-full px-4 py-3 bg-slate-55 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:bg-white focus:border-indigo-505 transition-all font-sans"
            />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Frequently Asked Questions</h3>
            <Button variant="custom" size="none"               type="button"
              onClick={() => {
                const currentFaqs = form.faqs?.items || [];
                handleFieldChange('faqs', {
                  ...(form.faqs || {}),
                  items: [...currentFaqs, { question: '', answer: '' }]
                });
              }}
              className="px-3 py-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={12} />
              Add FAQ
            </Button>
          </div>

          <div className="space-y-3">
            {(form.faqs?.items || []).map((faq, index) => (
              <div key={index} className="flex flex-col gap-2 p-4 border border-slate-200 rounded-xl bg-slate-55 relative">
                <Button variant="custom" size="none"                   type="button"
                  onClick={() => {
                    const newFaqs = [...form.faqs!.items];
                    newFaqs.splice(index, 1);
                    handleFieldChange('faqs', { ...form.faqs, items: newFaqs });
                  }}
                  className="absolute top-3 right-3 text-slate-400 hover:text-rose-505 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </Button>
                <Input
                  type="text"
                  value={faq.question}
                  onChange={(e) => {
                    const newFaqs = [...form.faqs!.items];
                    newFaqs[index].question = e.target.value;
                    handleFieldChange('faqs', { ...form.faqs, items: newFaqs });
                  }}
                  placeholder={`Question ${index + 1}`}
                  className="w-full pr-8 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <textarea
                  value={faq.answer}
                  onChange={(e) => {
                    const newFaqs = [...form.faqs!.items];
                    newFaqs[index].answer = e.target.value;
                    handleFieldChange('faqs', { ...form.faqs, items: newFaqs });
                  }}
                  placeholder={`Answer ${index + 1}`}
                  rows={2}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 outline-none focus:border-indigo-505 transition-all font-sans"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
