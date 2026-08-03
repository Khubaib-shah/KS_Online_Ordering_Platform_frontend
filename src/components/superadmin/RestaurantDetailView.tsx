import React from 'react'; import { Button } from '@/components/ui/Button';

import { useRestaurantDetail } from '@/hooks/useRestaurantDetail';
import { RestaurantOverviewTab } from '@/components/superadmin/components/RestaurantOverviewTab';
import { RestaurantJsonTab } from '@/components/superadmin/components/RestaurantJsonTab';
import { RestaurantBasicInfoStep } from '@/components/superadmin/components/RestaurantBasicInfoStep';
import { RestaurantBrandingStep } from '@/components/superadmin/components/RestaurantBrandingStep';
import { RestaurantPromoSetupStep } from '@/components/superadmin/components/RestaurantPromoSetupStep';
import { RestaurantDeliveryStep } from '@/components/superadmin/components/RestaurantDeliveryStep';

import { Tenant } from '@/types/tenant';
import {
  ExternalLink,
  Ban,
  UserCheck,
  TrendingUp,
  Sliders,
  Code,
  FileText,
  Undo2,
  Redo2,
  Check,
  Building2,
  Lock,
  Mail,
  MapPin,
  Clock,
  Percent,
  Palette,
  Settings,
  Globe,
  Loader2
} from 'lucide-react';

interface RestaurantDetailViewProps {
  tenant: Tenant;
  onClose: () => void;
  onSave: (updated: Tenant) => void;
  onImpersonate: (tenant: Tenant) => void;
  onToggleSuspend: (tenant: Tenant) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const RestaurantDetailView: React.FC<RestaurantDetailViewProps> = ({
  tenant,
  onClose,
  onSave,
  onImpersonate,
  onToggleSuspend,
  addToast
}) => {
  const {
    activeTab,
    setActiveTab,
    activeSettingsSection,
    setActiveSettingsSection,
    form,
    setForm,
    errors,
    setErrors,
    logoInputMode,
    setLogoInputMode,
    logoSvgCode,
    setLogoSvgCode,
    dragActive,
    workspaceLayout,
    history,
    redoStack,
    ownerDetails,
    setOwnerDetails,
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
    handleAddHeroSlide,
    handleDuplicateHeroSlide,
    handleDeleteHeroSlide,
    handleMoveSlide,
    handleSaveSettings,
    isSaving,
    handleResetForm,
    brandColor,
    lightColor,
    tintBg,
    tagline,
    phone,
    address,
    cuisine,
    currency,
    taxRate,
    serviceCharge,
    deliveryFee,
    minOrderValue,
    categories,
    menuItems,
    promoCodes,
    totalOrdersCount,
    activeOrders,
    activeOrdersCount,
    monthlyRevenue,
    currentRating,
    starPct5,
    starPct4,
    starPct3,
    starPct2,
    chartData,
    syncFormStateToJson,
    syncJsonToFormState,
    jsonSnippet,
    setJsonSnippet,
    jsonError,
    setJsonError,
    mainContentRef
  } = useRestaurantDetail({ tenant, onSave, addToast });

  return (
    <div className="space-y-6 text-left animate-fade-in select-none font-sans">
      {/* Navigation Header bar */}
      <div className="flex justify-between border-b border-border-subtle pb-4.5 gap-4 items-center flex-wrap md:flex-nowrap">
        <Button variant="custom" size="none" onClick={onClose}
          className="text-xs font-bold text-text-secondary hover:text-text-primary px-3 py-1.5 border border-border-subtle rounded-xl cursor-pointer"
        >
          ← Back to Tenants list
        </Button>

        <div className="flex flex-wrap items-center gap-3">
          {/* Undo/Redo tools in settings */}
          {activeTab === 'settings' && (
            <div className="flex items-center bg-slate-105 p-1 rounded-xl border border-slate-200/60 shrink-0">
              <Button variant="custom" size="none" onClick={handleUndo}
                disabled={history.length === 0}
                title="Undo Change"
                className="p-1.5 rounded-lg hover:bg-white text-slate-650 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <Undo2 size={14} />
              </Button>
              <Button variant="custom" size="none" onClick={handleRedo}
                disabled={redoStack.length === 0}
                title="Redo Change"
                className="p-1.5 rounded-lg hover:bg-white text-slate-650 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
              >
                <Redo2 size={14} />
              </Button>
            </div>
          )}

          {/* Settings Save/Reset Buttons */}
          {(activeTab === 'settings' || activeTab === 'json') && (
            <>
              <Button variant="custom" size="none" onClick={handleResetForm}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer active:scale-95 shadow-xs"
              >
                Reset
              </Button>
              <Button variant="custom" size="none" onClick={() => handleSaveSettings()}
                disabled={isSaving}
                className="px-4.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </>
          )}

          <Button variant="custom" size="none" onClick={() => onImpersonate(tenant)}
            className="flex items-center gap-1.5 px-4.5 h-10 text-xs font-semibold text-white rounded-xl shadow-button transition-all duration-200 cursor-pointer hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: brandColor }}
          >
            <ExternalLink size={13} />
            <span className="font-inter">Open Restaurant Admin Dashboard</span>
          </Button>

          <Button variant="custom" size="none" onClick={() => onToggleSuspend(tenant)}
            className={`flex items-center gap-1.5 px-4 h-10 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer active:scale-[0.98] ${tenant.status === 'active'
              ? 'bg-red-50 hover:bg-red-100 border-red-100 text-red-600'
              : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-600'
              }`}
          >
            {tenant.status === 'active' ? <Ban size={13} /> : <UserCheck size={13} />}
            <span>{tenant.status === 'active' ? 'Suspend' : 'Activate'}</span>
          </Button>
        </div>
      </div>

      {/* Tenant Title & Metrics Header card */}
      <div
        className="p-6 rounded-card border relative text-white overflow-hidden shadow-md"
        style={{
          backgroundColor: brandColor,
          borderColor: brandColor,
        }}
      >
        <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/5 blur-xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-36 h-36 rounded-full bg-white/5 blur-lg pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-2.5 py-0.5 rounded-full">
                {tenant.subscriptionPlan || 'premium'} plan
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500/20 text-emerald-350' : 'bg-red-550/20 text-red-300'}`}>
                {tenant.status}
              </span>
            </div>
            <h2 className="text-2xl font-black font-poppins">{tenant.name}</h2>
            <p className="text-xs font-semibold text-white/75 font-inter">Slug: {tenant.slug} | Domain: {tenant.customDomain || 'indolj.io'}</p>
          </div>

          <div className="flex flex-wrap md:flex-nowrap gap-5.5 justify-end w-full md:w-auto">
            <div className="grid grid-cols-4 md:flex gap-6 select-none">
              <div className="border-l border-white/10 pl-4 text-center md:text-left">
                <p className="text-2xl font-bold font-poppins text-white">{categories.length}</p>
                <p className="text-[9px] font-semibold text-white/75 uppercase tracking-wider font-inter">Categories</p>
              </div>
              <div className="border-l border-white/10 pl-4 text-center md:text-left">
                <p className="text-2xl font-bold font-poppins text-white">{menuItems.length}</p>
                <p className="text-[9px] font-semibold text-white/75 uppercase tracking-wider font-inter">Items</p>
              </div>
              <div className="border-l border-white/10 pl-4 text-center md:text-left">
                <p className="text-2xl font-bold font-poppins text-white">{totalOrdersCount}</p>
                <p className="text-[9px] font-semibold text-white/75 uppercase tracking-wider font-inter">Orders</p>
              </div>
              <div className="border-l border-white/10 pl-4 text-center md:text-left">
                <p className="text-2xl font-bold font-poppins text-white">{promoCodes.length}</p>
                <p className="text-[9px] font-semibold text-white/75 uppercase tracking-wider font-inter">Promos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tab Switcher bar */}
      <div className="flex bg-white/80 backdrop-blur-sm p-1.5 rounded-card border border-border-subtle gap-1.5 select-none w-max max-w-full overflow-x-auto no-scrollbar shadow-sm">
        <Button variant="custom" size="none" onClick={() => setActiveTab('overview')}
          className={`px-4.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 border-0 ${activeTab === 'overview'
            ? 'text-white font-poppins shadow-sm font-bold'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover font-bold'
            }`}
          style={{
            backgroundColor: activeTab === 'overview' ? brandColor : 'transparent',
          }}
        >
          <TrendingUp size={14} />
          <span>Overview & Analytics</span>
        </Button>
        <Button variant="custom" size="none" onClick={() => setActiveTab('settings')}
          className={`px-4.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 border-0 ${activeTab === 'settings'
            ? 'text-white font-poppins shadow-sm font-bold'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover font-bold'
            }`}
          style={{
            backgroundColor: activeTab === 'settings' ? brandColor : 'transparent',
          }}
        >
          <Sliders size={14} />
          <span>Branding & Settings</span>
        </Button>
        <Button variant="custom" size="none" onClick={() => {
          syncFormStateToJson();
          setActiveTab('json');
        }}
          className={`px-4.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-2 border-0 ${activeTab === 'json'
            ? 'text-white font-poppins shadow-sm font-bold'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover font-bold'
            }`}
          style={{
            backgroundColor: activeTab === 'json' ? brandColor : 'transparent',
          }}
        >
          <Code size={14} />
          <span>JSON Schema Override</span>
        </Button>
      </div>

      {/* Tab Content rendering */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <RestaurantOverviewTab
            monthlyRevenue={monthlyRevenue}
            currency={currency}
            brandColor={brandColor}
            tintBg={tintBg}
            activeOrdersCount={activeOrdersCount}
            currentRating={currentRating}
            chartData={chartData}
            activeOrders={activeOrders}
            starPct5={starPct5}
            starPct4={starPct4}
            starPct3={starPct3}
            starPct2={starPct2}
            tagline={tagline}
            address={address}
            phone={phone}
            cuisine={cuisine}
            minOrderValue={minOrderValue}
            deliveryFee={deliveryFee}
            taxRate={taxRate}
            serviceCharge={serviceCharge}
          />
        )}

        {activeTab === 'settings' && (
          <div className="flex-1 w-full mx-auto py-2 flex flex-col xl:flex-row gap-6 items-start min-h-0">
            {/* Left Sidebar Config Tree */}
            <aside className={`hidden xl:flex flex-col gap-4.5 w-[240px] shrink-0 sticky top-28 select-none z-30 ${workspaceLayout === 'preview' ? 'hidden xl:hidden' : ''}`}>
              <div className="bg-white border border-slate-200/70 p-4 rounded-2xl shadow-sm space-y-1 text-left w-full">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2.5 px-2">Configuration Steps</p>
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
                  { id: 'legal', label: 'Legal & FAQs', icon: FileText }
                ].map((sect) => {
                  const Icon = sect.icon;
                  const isActive = activeSettingsSection === sect.id;
                  const status = getSectionStatus(sect.id);
                  return (
                    <Button variant="custom" size="none" key={sect.id}
                      type="button"
                      onClick={() => setActiveSettingsSection(sect.id as any)}
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
            </aside>

            {/* Center Canvas with Forms */}
            <main ref={mainContentRef} className={`flex-1 space-y-6 min-w-0 pr-2 ${workspaceLayout === 'preview' ? 'hidden xl:hidden' : ''}`}>
              {/* Sticky Horizontal Tag Navigation of Sections for smaller screens */}
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
                  { id: 'legal', label: 'Legal & FAQs', icon: FileText }
                ].map(sect => {
                  const Icon = sect.icon;
                  const isActive = activeSettingsSection === sect.id;
                  const status = getSectionStatus(sect.id);
                  return (
                    <Button variant="custom" size="none" key={sect.id}
                      type="button"
                      onClick={() => setActiveSettingsSection(sect.id as any)}
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

              {/* Step Forms */}
              <RestaurantBasicInfoStep
                form={form}
                errors={errors}
                handleFieldChange={handleFieldChange}
                activeTab={activeSettingsSection}
                ownerDetails={ownerDetails}
                setOwnerDetails={setOwnerDetails}
              />

              <RestaurantBrandingStep
                form={form}
                errors={errors}
                handleFieldChange={handleFieldChange}
                activeTab={activeSettingsSection}
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
                activeTab={activeSettingsSection}
                updateForm={updateForm}
                setForm={setForm}
              />

              <RestaurantDeliveryStep
                form={form}
                errors={errors}
                handleFieldChange={handleFieldChange}
                activeTab={activeSettingsSection}
              />
            </main>

          </div>
        )}

        {activeTab === 'json' && (
          <RestaurantJsonTab
            jsonSnippet={jsonSnippet}
            setJsonSnippet={setJsonSnippet}
            jsonError={jsonError}
            setJsonError={setJsonError}
            lightColor={lightColor}
            brandColor={brandColor}
            syncJsonToFormState={syncJsonToFormState}
            addToast={addToast}
            handleSaveSettings={handleSaveSettings}
          />
        )}
      </div>
    </div>
  );
};
