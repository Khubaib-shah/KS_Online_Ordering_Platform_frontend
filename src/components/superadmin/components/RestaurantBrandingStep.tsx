import React from 'react';import { Button } from '@/components/ui/Button';

import { RestaurantConfig } from '@/types/restaurant';
import { Input } from '@components/ui/Input';

import {
  Building2,
  Sliders,
  Palette,
  Copy,
  RotateCcw,
  Settings,
  Upload,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { getLogo, getBannerImage } from '@/utils/cloudinary';

interface RestaurantBrandingStepProps {
  form: RestaurantConfig;
  errors: Record<string, string>;
  handleFieldChange: (path: string, value: any) => void;
  activeTab: string;
  logoInputMode: 'url' | 'svg_code' | 'file';
  setLogoInputMode: (mode: 'url' | 'svg_code' | 'file') => void;
  logoSvgCode: string;
  setLogoSvgCode: (code: string) => void;
  handleLogoSvgParse: () => void;
  handleDrag: (e: React.DragEvent, id: string) => void;
  handleDrop: (e: React.DragEvent, path: string, id: string) => void;
  handleClipboardPaste: (e: React.ClipboardEvent, path: string) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>, path: string) => void;
  dragActive: Record<string, boolean>;
  handleCopyThemeColors: () => void;
  handleResetTheme: () => void;
  handleColorChange: (category: string, key: string, value: string) => void;
  handleAddHeroSlide: () => void;
  handleMoveSlide: (index: number, direction: 'up' | 'down') => void;
  handleDuplicateHeroSlide: (slideId: string) => void;
  handleDeleteHeroSlide: (slideId: string) => void;
}

export const RestaurantBrandingStep: React.FC<RestaurantBrandingStepProps> = ({
  form,
  errors,
  handleFieldChange,
  activeTab,
  logoInputMode,
  setLogoInputMode,
  logoSvgCode,
  setLogoSvgCode,
  handleLogoSvgParse,
  handleDrag,
  handleDrop,
  handleClipboardPaste,
  handleFileSelect,
  dragActive,
  handleCopyThemeColors,
  handleResetTheme,
  handleColorChange,
  handleAddHeroSlide,
  handleMoveSlide,
  handleDuplicateHeroSlide,
  handleDeleteHeroSlide
}) => {
  return (
    <>
      {/* Section 2: Logo & Branding */}
      <section id="section-branding" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'branding' ? '' : 'hidden'}`}>
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Sliders className="text-indigo-600" size={18} />
            <span>2. Logo & Branding</span>
          </h2>
          <p className="text-slate-550 text-xs mt-1">Configure your primary brand identity. Supports URLs, file uploads, vector SVGs, and clipboard pasting.</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 max-w-sm select-none">
          {(['url', 'svg_code', 'file'] as const).map(mode => (
            <Button variant="custom" size="none"               key={mode}
              type="button"
              onClick={() => setLogoInputMode(mode)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer ${logoInputMode === mode
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              {mode === 'url' ? 'Paste URL' : mode === 'svg_code' ? 'Vector SVG' : 'Upload File'}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-8 space-y-4">
            {logoInputMode === 'url' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Logo Image URL</label>
                <Input
                  type="text"
                  value={typeof form.logo === 'object' ? (form.logo as any)?.secureUrl || '' : form.logo as string}
                  onChange={(e) => handleFieldChange('logo', e.target.value)}
                  placeholder="https://assets.indolj.io/logo.png"
                />
              </div>
            )}

            {logoInputMode === 'svg_code' && (
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Raw SVG Code Block</label>
                <textarea
                  rows={4}
                  value={logoSvgCode}
                  onChange={(e) => setLogoSvgCode(e.target.value)}
                  placeholder={`<svg width="100" height="100">\n  <rect width="100%" height="100%" fill="#1A3C2E"/>\n</svg>`}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 outline-none focus:bg-white focus:border-indigo-500 transition-all"
                />
                <Button variant="custom" size="none"                   type="button"
                  onClick={handleLogoSvgParse}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer active:scale-95 transition-all"
                >
                  Compile SVG logo
                </Button>
              </div>
            )}

            {logoInputMode === 'file' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Logo Drag & Drop Zone</label>
                <div
                  onDragEnter={(e) => handleDrag(e, 'logo')}
                  onDragOver={(e) => handleDrag(e, 'logo')}
                  onDragLeave={(e) => handleDrag(e, 'logo')}
                  onDrop={(e) => handleDrop(e, 'logo', 'logo')}
                  onPaste={(e) => handleClipboardPaste(e, 'logo')}
                  className={`h-36 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-4 transition-all relative ${dragActive['logo']
                    ? 'border-indigo-500 bg-indigo-50/20'
                    : 'border-slate-300 hover:border-indigo-400 bg-slate-55/50'
                    }`}
                >
                  <Building2 size={24} className="text-slate-400" />
                  <p className="text-xs text-slate-500 font-semibold mt-2">
                    Drag & drop logo file here or <span className="text-indigo-600 underline">browse</span>
                  </p>
                  <p className="text-[9px] text-slate-400 mt-1">Supports PNG, JPG, WebP, SVG (or paste directly from Clipboard)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e, 'logo')}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-slate-55 border border-slate-200/80 rounded-2xl select-none">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-3">Live Logo Preview</span>
            <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-slate-200/80 overflow-hidden flex items-center justify-center p-1">
              {form.logo ? (
                <img
                  src={getLogo(form.logo as any)}
                  alt="Restaurant Logo"
                  className="max-w-full max-h-full object-contain rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Building2 className="text-slate-300" size={32} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Theme Configuration */}
      <section id="section-theme" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'theme' ? '' : 'hidden'}`}>
        <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-2 select-none">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Palette className="text-indigo-600" size={18} />
              <span>7. Theme Configuration</span>
            </h2>
            <p className="text-slate-550 text-xs mt-1">Configure complete website colors. Live HEX and color picker mappings with copy tools.</p>
          </div>

          <div className="flex gap-1.5 select-none shrink-0 mt-2 md:mt-0">
            <Button variant="custom" size="none"               type="button"
              onClick={handleCopyThemeColors}
              className="px-2.5 py-1.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
            >
              <Copy size={11} /> Copy Colors
            </Button>
            <Button variant="custom" size="none"               type="button"
              onClick={handleResetTheme}
              className="px-2.5 py-1.5 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/60 rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={11} /> Reset Theme
            </Button>
          </div>
        </div>

        <div className="space-y-6">


          <div className="space-y-3.5">
            <h4 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block">Primary Palette Accents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { path: 'primary', label: 'Primary Brand Theme', val: form.theme.colors.primary },
                { path: 'accent', label: 'Accent Highlight Theme', val: form.theme.colors.accent }
              ].map(item => (
                <div key={item.path} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/60 rounded-xl select-none">
                  <div className="relative w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 cursor-pointer shadow-sm">
                    <input
                      type="color"
                      value={item.val}
                      onChange={(e) => handleColorChange('root', item.path, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: item.val }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1 truncate">{item.label}</span>
                    <Input
                      type="text"
                      value={item.val}
                      onChange={(e) => handleColorChange('root', item.path, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block">Website Canvas Backgrounds</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'page', label: 'Page Background', val: form.theme.colors.background.page },
                { name: 'card', label: 'Item Cards', val: form.theme.colors.background.card },
                { name: 'header', label: 'Navigation Header', val: form.theme.colors.background.header },
                { name: 'categoryBanner', label: 'Category Slider', val: form.theme.colors.background.categoryBanner }
              ].map(item => (
                <div key={item.name} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/60 rounded-xl select-none">
                  <div className="relative w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 cursor-pointer shadow-sm">
                    <input
                      type="color"
                      value={item.val}
                      onChange={(e) => handleColorChange('background', item.name, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: item.val }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1 truncate">{item.label}</span>
                    <Input
                      type="text"
                      value={item.val}
                      onChange={(e) => handleColorChange('background', item.name, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            <h4 className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block">Typography Copy Colors</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { name: 'primary', label: 'Primary Text', val: form.theme.colors.text.primary },
                { name: 'secondary', label: 'Secondary Text', val: form.theme.colors.text.secondary },
                { name: 'muted', label: 'Muted Copy', val: form.theme.colors.text.muted },
                { name: 'inverse', label: 'Inverse White', val: form.theme.colors.text.inverse },
                { name: 'price', label: 'Product Price', val: form.theme.colors.text.price },
                { name: 'originalPrice', label: 'Stripped Price', val: form.theme.colors.text.originalPrice }
              ].map(item => (
                <div key={item.name} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/60 rounded-xl select-none">
                  <div className="relative w-10 h-10 rounded-lg border border-slate-200 overflow-hidden shrink-0 cursor-pointer shadow-sm">
                    <input
                      type="color"
                      value={item.val}
                      onChange={(e) => handleColorChange('text', item.name, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full h-full" style={{ backgroundColor: item.val }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-extrabold text-slate-500 block uppercase mb-1 truncate">{item.label}</span>
                    <Input
                      type="text"
                      value={item.val}
                      onChange={(e) => handleColorChange('text', item.name, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 8: Background Assets */}
      <section id="section-assets" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'assets' ? '' : 'hidden'}`}>
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="text-indigo-600" size={18} />
            <span>8. Store Canvas Background Assets</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">Configure full page wall banners or category listing backdrops.</p>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Canvas Background Image URL</label>
              <Input
                type="text"
                value={typeof form.theme.assets.background.image === 'object' ? (form.theme.assets.background.image as any)?.secureUrl || '' : form.theme.assets.background.image as string}
                onChange={(e) => handleFieldChange('theme.assets.background.image', e.target.value)}
                placeholder="https://assets.indolj.io/background.jpg"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-600 uppercase block">Category Backdrop Image URL</label>
              <Input
                type="text"
                value={typeof form.theme.assets.categoryBackground === 'object' ? (form.theme.assets.categoryBackground as any)?.secureUrl || '' : form.theme.assets.categoryBackground as string}
                onChange={(e) => handleFieldChange('theme.assets.categoryBackground', e.target.value)}
                placeholder="https://res.cloudinary.com/cat-backdrop.jpg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none">
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Category Backdrop Drag & Drop</span>
              <div
                onDragEnter={(e) => handleDrag(e, 'catBg')}
                onDragOver={(e) => handleDrag(e, 'catBg')}
                onDragLeave={(e) => handleDrag(e, 'catBg')}
                onDrop={(e) => handleDrop(e, 'theme.assets.categoryBackground', 'catBg')}
                onPaste={(e) => handleClipboardPaste(e, 'theme.assets.categoryBackground')}
                className={`h-24 border-2 border-dashed rounded-xl flex items-center justify-center p-3 transition-all relative ${dragActive['catBg'] ? 'border-indigo-500 bg-indigo-50/10' : 'border-slate-200 bg-slate-50 hover:border-indigo-400'
                  }`}
              >
                <Upload size={16} className="text-slate-400 shrink-0 mr-2" />
                <span className="text-[11px] text-slate-500 font-semibold">Drop or paste category backdrop image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'theme.assets.categoryBackground')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl select-none shrink-0 items-center justify-center">
              <div className="text-center">
                <span className="text-[9px] font-extrabold text-slate-400 uppercase block">Category backdrop Preview</span>
                {form.theme.assets.categoryBackground ? (
                  <img
                    src={getBannerImage(form.theme.assets.categoryBackground as any) || (form.theme.assets.categoryBackground as any)?.secureUrl || form.theme.assets.categoryBackground as string}
                    alt="Category Preview"
                    className="h-14 w-28 object-cover rounded-lg border border-slate-200 mt-1.5"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-14 w-28 bg-slate-200 rounded-lg mt-1.5 flex items-center justify-center text-slate-400 text-xs">No Asset</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: Hero Slider */}
      <section id="section-hero" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'hero' ? '' : 'hidden'}`}>
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between gap-4 select-none">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="text-indigo-600" size={18} />
              <span>9. Hero Slideshow Images & Accents</span>
            </h2>
            <p className="text-slate-550 text-xs mt-1">Construct sliding promo headlines, subtitles, and vector backdrop frames.</p>
          </div>

          <Button variant="custom" size="none"             type="button"
            onClick={handleAddHeroSlide}
            className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer flex items-center gap-1 active:scale-95 transition-all shrink-0"
          >
            <Plus size={14} /> Add Slide
          </Button>
        </div>

        <div className="space-y-4">
          {form.heroSlides.map((slide, idx) => (
            <div key={slide.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl relative space-y-4">
              <div className="absolute right-3 top-3 flex items-center gap-1 select-none z-10">
                <Button variant="custom" size="none"                   type="button"
                  onClick={() => handleMoveSlide(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 cursor-pointer"
                >
                  <ChevronUp size={12} />
                </Button>
                <Button variant="custom" size="none"                   type="button"
                  onClick={() => handleMoveSlide(idx, 'down')}
                  disabled={idx === form.heroSlides.length - 1}
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md disabled:opacity-40 cursor-pointer"
                >
                  <ChevronDown size={12} />
                </Button>
                <Button variant="custom" size="none"                   type="button"
                  onClick={() => handleDuplicateHeroSlide(slide.id)}
                  title="Duplicate Slide"
                  className="p-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-md cursor-pointer"
                >
                  <Copy size={12} />
                </Button>
                <Button variant="custom" size="none"                   type="button"
                  onClick={() => handleDeleteHeroSlide(slide.id)}
                  title="Delete Slide"
                  className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-md cursor-pointer"
                >
                  <Trash2 size={12} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start pr-24">
                <div className="md:col-span-8 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-505 uppercase">Promo Label / Badge</label>
                      <Input
                        type="text"
                        value={slide.promoLabel || ''}
                        onChange={(e) => {
                          const updated = [...form.heroSlides];
                          updated[idx].promoLabel = e.target.value;
                          handleFieldChange('heroSlides', updated);
                        }}
                        placeholder="DELIVERY SPECIAL"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-505 uppercase">Promo Headline Title</label>
                      <Input
                        type="text"
                        value={slide.promoHeadline || ''}
                        onChange={(e) => {
                          const updated = [...form.heroSlides];
                          updated[idx].promoHeadline = e.target.value;
                          handleFieldChange('heroSlides', updated);
                        }}
                        placeholder="40% OFF"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-505 uppercase">Promo Subtitle</label>
                    <Input
                      type="text"
                      value={slide.promoSub || ''}
                      onChange={(e) => {
                        const updated = [...form.heroSlides];
                        updated[idx].promoSub = e.target.value;
                        handleFieldChange('heroSlides', updated);
                      }}
                      placeholder="ON THE ENTIRE MENU"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-505 uppercase">Slide Backdrop Image</label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        value={typeof slide.imageUrl === 'object' ? (slide.imageUrl as any)?.secureUrl || '' : slide.imageUrl as string}
                        onChange={(e) => {
                          const updated = [...form.heroSlides];
                          updated[idx].imageUrl = e.target.value;
                          handleFieldChange('heroSlides', updated);
                        }}
                        placeholder="Image URL"
                      />
                      <div className="relative overflow-hidden shrink-0 flex items-center justify-center w-9 h-9 bg-slate-100 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors" title="Upload Image">
                        <Upload size={14} className="text-slate-500" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileSelect(e, `heroSlides.${idx}.imageUrl`)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-col items-center justify-center p-2 bg-white border border-slate-200/60 rounded-xl select-none">
                  <span className="text-[8px] font-bold text-slate-400 uppercase mb-1.5">Slide Backdrop</span>
                  {slide.imageUrl ? (
                    <img
                      src={getBannerImage(slide.imageUrl as any) || (slide.imageUrl as any)?.secureUrl || slide.imageUrl as string}
                      alt="Slide backdrop preview"
                      className="h-16 w-full object-cover rounded-lg border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-16 w-full bg-slate-100 rounded-lg flex items-center justify-center text-[10px] text-slate-400 font-semibold">Empty backdrop</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};
