import React from 'react'; import { Button } from '@/components/ui/Button';

import { useCreateRestaurantForm } from '@/hooks/useCreateRestaurantForm';
import { RestaurantBasicInfoStep } from '@/components/superadmin/components/RestaurantBasicInfoStep';
import { RestaurantBrandingStep } from '@/components/superadmin/components/RestaurantBrandingStep';
import { RestaurantPromoSetupStep } from '@/components/superadmin/components/RestaurantPromoSetupStep';
import { RestaurantDeliveryStep } from '@/components/superadmin/components/RestaurantDeliveryStep';
import { Combobox } from '@/components/ui/Combobox';
import {
  Building2,
  ArrowLeft,
  Globe,
  Mail,
  Lock,
  MapPin,
  Clock,
  Palette,
  Sliders,
  Sparkles,
  FileText,
  Download,
  Upload,
  AlertTriangle,
  Percent,
  Settings,
  Undo2,
  Redo2,
  ChevronDown,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CreateRestaurantPage() {
  const {
    tenants,
    form,
    setForm,
    errors,
    setErrors,
    activeTab,
    showQuickTools,
    setShowQuickTools,
    ownerDetails,
    setOwnerDetails,
    logoInputMode,
    setLogoInputMode,
    logoSvgCode,
    setLogoSvgCode,
    history,
    redoStack,
    dragActive,
    autoSaveStatus,
    mainContentRef,
    getSectionStatus,
    updateForm,
    handleUndo,
    handleRedo,
    handleFieldChange,
    handleColorChange,
    handleClipboardPaste,
    handleDrag,
    handleDrop,
    handleFileSelect,
    handleLogoSvgParse,
    handleResetTheme,
    handleCopyThemeColors,
    handleDuplicateThemeFrom,
    handleAddHeroSlide,
    handleDuplicateHeroSlide,
    handleDeleteHeroSlide,
    handleMoveSlide,
    handleCopyConfigFrom,
    handleImportJson,
    handleExportJson,
    handleResetAll,
    handleSaveDraft,
    handlePublish,
    scrollToSection,
    handleBack
  } = useCreateRestaurantForm();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-left">
      {/* Sticky Header */}
      <header className="sticky top-0 z-[100] bg-white border-b border-slate-200/80 px-4 md:px-8 py-3 shadow-sm select-none">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          {/* Row 1: Title, Badges, and Layout Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Button variant="custom" size="none" onClick={handleBack}
                className="p-2 hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft size={16} />
              </Button>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">Shop Core Creator</span>
                  {autoSaveStatus === 'saving' && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 whitespace-nowrap shrink-0">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                      Auto-saving...
                    </span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-[10px] text-emerald-500 font-medium whitespace-nowrap shrink-0">● Draft Saved</span>
                  )}
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 mt-0.5 truncate max-w-[200px] sm:max-w-xs md:max-w-md lg:max-w-lg" title={form.name || 'Create Shop'}>
                  {form.name || 'Create Shop'}
                </h1>
              </div>
            </div>
          </div>

          {/* Row 2: Action Buttons & Undo/Redo */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 shrink-0">
              <Button variant="custom" size="none" onClick={handleUndo}
                disabled={history.length === 0}
                title="Undo Change (Ctrl+Z)"
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <Undo2 size={15} />
              </Button>
              <Button variant="custom" size="none" onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Redo Change (Ctrl+Y)"
                className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <Redo2 size={15} />
              </Button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="custom" size="none" type="button"
                onClick={handleResetAll}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                Reset All
              </Button>

              {/* Quick Tools Dropdown */}
              <div className="relative">
                <Button variant="custom" size="none" type="button"
                  onClick={() => setShowQuickTools(!showQuickTools)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs border ${showQuickTools
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 hover:text-slate-900 border-slate-200/80 hover:bg-slate-50'
                    }`}
                >
                  <Sparkles size={14} className={showQuickTools ? 'text-amber-400' : 'text-indigo-600'} />
                  <span>Quick Tools</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${showQuickTools ? 'rotate-180' : ''}`} />
                </Button>

                <AnimatePresence>
                  {showQuickTools && (
                    <>
                      <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setShowQuickTools(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-72 bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-xl z-50 space-y-3.5 select-none"
                      >
                        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                          <Sparkles size={14} className="text-amber-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Creator Shortcuts</span>
                        </div>

                        <div className="space-y-2.5 text-left font-sans">
                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold uppercase text-slate-400">Copy Configuration From</label>
                            <Combobox
                              options={tenants.map((t) => ({ value: t.id, label: t.name }))}
                              value=""
                              onChange={(val) => {
                                handleCopyConfigFrom(val);
                                setShowQuickTools(false);
                              }}
                              placeholder="Select Tenant..."
                              searchPlaceholder="Search tenants..."
                              className="w-full h-9 px-2.5 bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-bold text-white outline-none cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-extrabold uppercase text-slate-400">Duplicate Theme From</label>
                            <Combobox
                              options={tenants.map((t) => ({ value: t.id, label: t.name }))}
                              value=""
                              onChange={(val) => {
                                handleDuplicateThemeFrom(val);
                                setShowQuickTools(false);
                              }}
                              placeholder="Select Tenant..."
                              searchPlaceholder="Search tenants..."
                              className="w-full h-9 px-2.5 bg-slate-800 border border-slate-700 rounded-xl text-[11px] font-bold text-white outline-none cursor-pointer"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 border-t border-slate-800 pt-2.5">
                            <Button variant="custom" size="none" type="button"
                              onClick={() => {
                                handleExportJson();
                                setShowQuickTools(false);
                              }}
                              className="h-8.5 text-[10px] font-bold bg-slate-850 hover:bg-slate-800 rounded-xl text-slate-305 border border-slate-800 text-center cursor-pointer flex items-center justify-center gap-1.5 transition-colors active:scale-95 text-slate-300"
                            >
                              <Download size={11} /> Export JSON
                            </Button>
                            <label className="h-8.5 text-[10px] font-bold bg-slate-850 hover:bg-slate-800 rounded-xl text-slate-305 border border-slate-800 text-center cursor-pointer flex items-center justify-center gap-1.5 transition-colors relative active:scale-95 text-slate-300">
                              <Upload size={11} /> Import JSON
                              <input
                                type="file"
                                accept=".json"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      if (ev.target?.result) {
                                        handleImportJson(ev.target.result as string);
                                      }
                                    };
                                    reader.readAsText(file);
                                  }
                                  setShowQuickTools(false);
                                }}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                              />
                            </label>
                          </div>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <Button variant="custom" size="none" type="button"
                onClick={handleSaveDraft}
                className="px-3.5 py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100/80 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                Save Draft
              </Button>

              <Button variant="custom" size="none" type="button"
                onClick={handlePublish}
                className="px-4.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-855 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md"
              >
                <Check size={14} />
                <span>Publish Shop</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-6 lg:px-8 py-6 flex flex-col xl:flex-row gap-6 items-start min-h-0">
        {/* Column 1: Config Sidebar (Left Panel on xl screens) */}
        <aside className="hidden xl:flex flex-col gap-4.5 w-[260px] shrink-0 sticky top-28 select-none z-30">
          <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-sm space-y-1 text-left">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5 px-2">Configuration Tree</p>
            {[
              { id: 'basic', label: 'Basic Info', icon: Building2 },
              { id: 'owner', label: 'Owner Details', icon: Lock },
              { id: 'branding', label: 'Branding', icon: Sliders },
              { id: 'contact', label: 'Contact', icon: Mail },
              { id: 'location', label: 'Location', icon: MapPin },
              { id: 'delivery', label: 'Delivery Config', icon: Clock },
              { id: 'promo', label: 'Promotions', icon: Percent },
              { id: 'theme', label: 'Theme Colors', icon: Palette },
              { id: 'assets', label: 'Assets & Media', icon: Settings },
              { id: 'hero', label: 'Hero Slideshow', icon: Sliders },
              { id: 'seo', label: 'SEO Config', icon: Globe },
              { id: 'legal', label: 'Legal & FAQs', icon: FileText },
              { id: 'json', label: 'JSON Override', icon: FileText }
            ].map((sect) => {
              const Icon = sect.icon;
              const isActive = activeTab === sect.id;
              const status = getSectionStatus(sect.id);
              return (
                <Button variant="custom" size="none" key={sect.id}
                  type="button"
                  onClick={() => scrollToSection(sect.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer border ${isActive
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-50/80'
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon size={14} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                    <span className="truncate">{sect.label}</span>
                  </div>

                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status === 'completed'
                    ? 'bg-emerald-500'
                    : status === 'warning'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-slate-200'
                    }`} />
                </Button>
              );
            })}
          </div>

          {/* SaaS Sidebar Tools Card */}
          <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-sm text-left space-y-4">
            <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sparkles size={14} className="text-indigo-600 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700">Creator Shortcuts</span>
            </div>

            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase text-slate-400">Copy Config From</label>
                <Combobox
                  options={tenants.map((t) => ({ value: t.id, label: t.name }))}
                  value=""
                  onChange={handleCopyConfigFrom}
                  placeholder="Select Tenant..."
                  searchPlaceholder="Search tenants..."
                  className="w-full h-8.5 px-2 bg-slate-55 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-800 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-extrabold uppercase text-slate-400">Duplicate Theme From</label>
                <Combobox
                  options={tenants.map((t) => ({ value: t.id, label: t.name }))}
                  value=""
                  onChange={handleDuplicateThemeFrom}
                  placeholder="Select Tenant..."
                  searchPlaceholder="Search tenants..."
                  className="w-full h-8.5 px-2 bg-slate-55 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-800 outline-none cursor-pointer focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <Button variant="custom" size="none" type="button"
                  onClick={handleResetTheme}
                  className="h-8 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white text-center cursor-pointer transition-colors active:scale-95"
                >
                  Indolj Theme
                </Button>
                <Button variant="custom" size="none" type="button"
                  onClick={handleResetTheme}
                  className="h-8 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 rounded-xl text-white text-center cursor-pointer transition-colors active:scale-95"
                >
                  Reset Theme
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                <Button variant="custom" size="none" type="button"
                  onClick={handleExportJson}
                  className="h-8 text-[10px] font-bold bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 text-center cursor-pointer flex items-center justify-center gap-1 transition-colors active:scale-95"
                >
                  <Download size={10} /> Export JSON
                </Button>
                <label className="h-8 text-[10px] font-bold bg-slate-55 hover:bg-slate-100 rounded-xl text-slate-600 border border-slate-200 text-center cursor-pointer flex items-center justify-center gap-1 transition-colors relative active:scale-95">
                  <Upload size={10} /> Import JSON
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          if (ev.target?.result) {
                            handleImportJson(ev.target.result as string);
                          }
                        };
                        reader.readAsText(file);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Main Forms */}
        <main ref={mainContentRef} className="flex-1 space-y-8 min-w-0 pr-2">
          {/* Sticky Horizontal Tag Navigation of Sections */}
          <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur-md py-3.5 -mx-1 px-1 flex xl:hidden gap-2 overflow-x-auto no-scrollbar border-b border-slate-200/60 select-none">
            {[
              { id: 'basic', label: 'Basic Info', icon: Building2 },
              { id: 'branding', label: 'Branding', icon: Sliders },
              { id: 'contact', label: 'Contact', icon: Mail },
              { id: 'location', label: 'Location', icon: MapPin },
              { id: 'delivery', label: 'Delivery', icon: Clock },
              { id: 'promo', label: 'Promotions', icon: Percent },
              { id: 'theme', label: 'Theme Colors', icon: Palette },
              { id: 'assets', label: 'Assets', icon: Settings },
              { id: 'hero', label: 'Hero Slideshow', icon: Sliders },
              { id: 'seo', label: 'SEO Config', icon: Globe },
              { id: 'legal', label: 'Legal & FAQs', icon: FileText },
              { id: 'json', label: 'JSON Override', icon: FileText }
            ].map(sect => {
              const Icon = sect.icon;
              const isActive = activeTab === sect.id;
              const status = getSectionStatus(sect.id);
              return (
                <Button variant="custom" size="none" key={sect.id}
                  type="button"
                  onClick={() => scrollToSection(sect.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${isActive
                    ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-950/10'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                    }`}
                >
                  <Icon size={13} className={isActive ? 'text-amber-400' : 'text-slate-400'} />
                  <span>{sect.label}</span>

                  <span className={`w-1.5 h-1.5 rounded-full ${status === 'completed'
                    ? 'bg-emerald-500'
                    : status === 'warning'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-slate-200'
                    }`} />
                </Button>
              );
            })}
          </div>

          <RestaurantBasicInfoStep
            form={form}
            errors={errors}
            handleFieldChange={handleFieldChange}
            activeTab={activeTab}
            ownerDetails={ownerDetails}
            setOwnerDetails={setOwnerDetails}
          />

          <RestaurantBrandingStep
            form={form}
            errors={errors}
            handleFieldChange={handleFieldChange}
            activeTab={activeTab}
            logoInputMode={logoInputMode}
            setLogoInputMode={setLogoInputMode}
            logoSvgCode={logoSvgCode}
            setLogoSvgCode={setLogoSvgCode}
            handleLogoSvgParse={handleLogoSvgParse}
            handleDrag={handleDrag}
            handleDrop={handleDrop}
            handleClipboardPaste={handleClipboardPaste}
            handleFileSelect={handleFileSelect}
            dragActive={dragActive}
            handleCopyThemeColors={handleCopyThemeColors}
            handleResetTheme={handleResetTheme}
            handleColorChange={handleColorChange}
            handleAddHeroSlide={handleAddHeroSlide}
            handleMoveSlide={handleMoveSlide}
            handleDuplicateHeroSlide={handleDuplicateHeroSlide}
            handleDeleteHeroSlide={handleDeleteHeroSlide}
          />

          <RestaurantPromoSetupStep
            form={form}
            errors={errors}
            setErrors={setErrors}
            handleFieldChange={handleFieldChange}
            activeTab={activeTab}
            updateForm={updateForm}
            setForm={setForm}
          />

          <RestaurantDeliveryStep
            form={form}
            errors={errors}
            handleFieldChange={handleFieldChange}
            activeTab={activeTab}
          />

          {/* Section 12: JSON Override */}
          <section id="section-json" className={`bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 text-left ${activeTab === 'json' ? '' : 'hidden'}`}>
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <FileText className="text-indigo-600" size={18} />
                <span>12. Raw JSON Configuration Editor</span>
              </h2>
              <p className="text-slate-500 text-xs mt-1">Review the final mapped RestaurantConfig object. Edit directly as JSON for advanced overrides.</p>
            </div>

            <div className="space-y-3 font-sans">
              <textarea
                rows={10}
                value={JSON.stringify(form, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setForm(parsed);
                    setErrors(prev => {
                      const next = { ...prev };
                      delete next.jsonSyntax;
                      return next;
                    });
                  } catch (err: any) {
                    setErrors(prev => ({ ...prev, jsonSyntax: err.message || 'Syntax Error' }));
                  }
                }}
                className={`w-full p-4 bg-slate-900 border text-slate-300 rounded-2xl text-[11px] font-mono leading-relaxed outline-none focus:border-indigo-500 transition-all ${errors.jsonSyntax ? 'border-rose-500' : 'border-slate-800'}`}
              />
              {errors.jsonSyntax && (
                <div className="flex items-center gap-1.5 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 font-bold text-xs select-none">
                  <AlertTriangle size={14} />
                  <span>Syntax Error: {errors.jsonSyntax}</span>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export function usePathname() {
  const [pathname, setPathname] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setPathname(path);
    window.dispatchEvent(new Event('popstate'));
  };

  return [pathname, navigate] as const;
}
