import { useState, useEffect, useRef } from 'react';

import { RestaurantConfig } from '@/types/restaurant';
import { useTenantStore } from '@/store/tenantStore';
import { useUIStore } from '@/store/uiStore';
import { usePathname } from '@/lib/security';
import {
  INITIAL_FORM_STATE,
  INDOLJ_THEME_DEFAULT
} from '@/components/superadmin/components/createRestaurantConstants';
import { Tenant } from '@/types/tenant';

export function useCreateRestaurantForm() {
  const { tenants, saveTenant, setActiveTenantId } = useTenantStore();
  const { addToast, setActiveNavId } = useUIStore();
  const [, navigate] = usePathname();

  // Form State
  const [form, setForm] = useState<RestaurantConfig>(() => {
    const cached = localStorage.getItem('indolj_restaurant_create_draft');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return INITIAL_FORM_STATE;
      }
    }
    return INITIAL_FORM_STATE;
  });

  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'owner' | 'branding' | 'contact' | 'location' | 'delivery' | 'promo' | 'theme' | 'assets' | 'hero' | 'seo' | 'legal' | 'json'>('basic');
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');
  const [workspaceLayout, setWorkspaceLayout] = useState<'split' | 'form' | 'preview'>('split');
  const [previewSubTab, setPreviewSubTab] = useState<'menu' | 'info' | 'reviews'>('menu');
  const [showQuickTools, setShowQuickTools] = useState(false);

  // Owner Details State
  const [ownerDetails, setOwnerDetails] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    businessType: 'RESTAURANT' as any
  });

  // SVG logo options
  const [logoInputMode, setLogoInputMode] = useState<'url' | 'svg_code' | 'file'>('url');
  const [logoSvgCode, setLogoSvgCode] = useState('');

  // Undo / Redo history state
  const [history, setHistory] = useState<RestaurantConfig[]>([]);
  const [redoStack, setRedoStack] = useState<RestaurantConfig[]>([]);

  // Drag over states
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});

  // Auto-save notification state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('saved');

  // Ref for scroll target
  const mainContentRef = useRef<HTMLDivElement>(null);

  const getSectionStatus = (id: string) => {
    switch (id) {
      case 'basic':
        return form.name.trim() && form.slug.trim() ? 'completed' : 'incomplete';
      case 'branding':
        return form.logo && form.logo.length > 100 ? 'completed' : 'incomplete';
      case 'contact':
        return form.contact.phone.trim() && form.contact.email.trim() && form.contact.address.trim() ? 'completed' : 'incomplete';
      case 'location':
        return form.location.city.trim() && form.location.area.trim() ? 'completed' : 'incomplete';
      case 'delivery':
        return form.deliveryInfo.estimatedMinutes > 0 ? 'completed' : 'incomplete';
      case 'promo':
        return form.activePromo?.label ? 'completed' : 'incomplete';
      case 'theme':
        return form.theme.colors.primary && form.theme.colors.accent ? 'completed' : 'incomplete';
      case 'assets':
        return form.theme.assets.categoryBackground || form.theme.assets.background.image ? 'completed' : 'warning';
      case 'hero':
        return form.heroSlides.length > 0 ? 'completed' : 'incomplete';
      case 'seo':
        return form.seoText?.trim() ? 'completed' : 'warning';
      default:
        return 'completed';
    }
  };

  // Undo/Redo tracking helper
  const updateForm = (updater: (prev: RestaurantConfig) => RestaurantConfig) => {
    setForm(prev => {
      const next = updater(prev);

      // Cache history limit 30
      setHistory(h => [...h.slice(-29), prev]);
      setRedoStack([]); // Clear redo stack on manual interaction
      setIsDirty(true);
      setAutoSaveStatus('saving');

      // Save draft
      localStorage.setItem('indolj_restaurant_create_draft', JSON.stringify(next));
      return next;
    });
  };

  // Auto-save timer simulation
  useEffect(() => {
    if (autoSaveStatus === 'saving') {
      const timer = setTimeout(() => {
        setAutoSaveStatus('saved');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [autoSaveStatus]);

  // Unsaved changes alert
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleUndo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setRedoStack(r => [form, ...r]);
      setForm(prev);
      localStorage.setItem('indolj_restaurant_create_draft', JSON.stringify(prev));
      addToast('Undo action applied', 'info');
    } else {
      addToast('Nothing to undo', 'info');
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const next = redoStack[0];
      setRedoStack(r => r.slice(1));
      setHistory(h => [...h, form]);
      setForm(next);
      localStorage.setItem('indolj_restaurant_create_draft', JSON.stringify(next));
      addToast('Redo action applied', 'info');
    } else {
      addToast('Nothing to redo', 'info');
    }
  };

  // Keyboard Shortcuts (Ctrl+S, Ctrl+Shift+P, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier) {
        if (e.key === 's' && !e.shiftKey) {
          e.preventDefault();
          handleSaveDraft();
        }
        if (e.key.toLowerCase() === 'p' && e.shiftKey) {
          e.preventDefault();
          handlePublish();
        }
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        }
        if (e.key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form, history, redoStack, isDirty]);

  // General field handlers
  const handleFieldChange = (path: string, value: any) => {
    updateForm(prev => {
      const next = { ...prev };
      const parts = path.split('.');
      let current: any = next;
      for (let i = 0; i < parts.length - 1; i++) {
        current[parts[i]] = Array.isArray(current[parts[i]])
          ? [...current[parts[i]]]
          : { ...current[parts[i]] };
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return next;
    });
  };

  // Generate slug dynamically
  const generateSlug = (nameStr: string) => {
    return nameStr
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (nameVal: string) => {
    updateForm(prev => ({
      ...prev,
      name: nameVal,
      slug: generateSlug(nameVal)
    }));
  };

  // Color picker helper
  const handleColorChange = (group: string, name: string, color: string) => {
    updateForm(prev => {
      const next = { ...prev };
      const themeColors = { ...next.theme.colors };
      if (group === 'root') {
        (themeColors as any)[name] = color;
      } else {
        (themeColors as any)[group] = {
          ...(themeColors as any)[group],
          [name]: color
        };
      }
      next.theme = { ...next.theme, colors: themeColors };
      return next;
    });
  };

  // Clipboard Paste Support for Images
  const handleClipboardPaste = (e: React.ClipboardEvent, targetField: string) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              handleFieldChange(targetField, event.target.result as string);
              addToast('Image pasted from clipboard!', 'success');
            }
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const uploadFileToServer = async (file: File, targetField: string, imageType: string) => {
    try {
      addToast('Uploading image...', 'info');

      const formData = new FormData();
      formData.append('file', file);
      // Generate a temporary slug if the user hasn't typed a name yet
      const currentSlug = form.slug.trim() || 'temp-draft-store';
      formData.append('tenantSlug', currentSlug);
      formData.append('imageType', imageType);

      const response = await fetch('http://localhost:4000/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      const fileUrl = result.data?.secureUrl || result.data;
      handleFieldChange(targetField, fileUrl);
      addToast('Image uploaded successfully!', 'success');
    } catch (error: any) {
      addToast(`Image upload failed: ${error.message}`, 'error');
    }
  };

  // Drag and Drop File Handlers
  const handleDrag = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(prev => ({ ...prev, [id]: true }));
    } else if (e.type === "dragleave") {
      setDragActive(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDrop = async (e: React.DragEvent, targetField: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [id]: false }));

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageType = targetField === 'logo' ? 'Logo' : targetField.includes('category') ? 'Category' : 'Banner';
      await uploadFileToServer(file, targetField, imageType);
    } else {
      addToast('Invalid file format. Please drop an image.', 'error');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const imageType = targetField === 'logo' ? 'Logo' : targetField.includes('category') ? 'Category' : 'Banner';
      await uploadFileToServer(file, targetField, imageType);
    }
  };

  // SVG Parser Handler
  const handleLogoSvgParse = () => {
    if (!logoSvgCode.trim()) {
      addToast('Please enter some SVG code', 'error');
      return;
    }
    if (!logoSvgCode.includes('<svg') || !logoSvgCode.includes('</svg>')) {
      addToast('Invalid SVG block structure', 'error');
      return;
    }
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(logoSvgCode.trim())}`;
    handleFieldChange('logo', dataUri);
    addToast('SVG logo compiled successfully!', 'success');
  };

  // Social handles validation
  const validateUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Theme Helpers
  const handleResetTheme = () => {
    updateForm(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: JSON.parse(JSON.stringify(INDOLJ_THEME_DEFAULT.colors))
      }
    }));
    addToast('Theme colors reset to default', 'info');
  };

  const handleCopyThemeColors = () => {
    navigator.clipboard.writeText(JSON.stringify(form.theme.colors, null, 2));
    addToast('Theme colors copied to clipboard as JSON!', 'success');
  };

  const handleDuplicateThemeFrom = (otherId: string) => {
    const other = tenants.find(t => t.id === otherId);
    if (!other) return;

    updateForm(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          primary: other.brandColor,
          accent: other.lightColor || other.brandColor,
          background: {
            page: other.tintBg || '#F3F4F6',
            card: '#FFFFFF',
            header: other.brandColor,
            categoryBanner: other.tintBg || '#F3F4F6'
          }
        }
      }
    }));
    addToast(`Duplicated theme from ${other.name}!`, 'success');
  };

  // Hero Slides logic
  const handleAddHeroSlide = () => {
    updateForm(prev => {
      const slides = [...prev.heroSlides];
      const newId = `slide-${Date.now()}`;
      slides.push({
        id: newId,
        imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&auto=format&fit=crop&q=80",
        promoLabel: "NEW ARRIVAL",
        promoHeadline: "GRAND DEALS",
        promoSub: "LIMITED TIME OFFER"
      });
      return { ...prev, heroSlides: slides };
    });
    addToast('Added a new hero slide', 'success');
  };

  const handleDuplicateHeroSlide = (id: string) => {
    updateForm(prev => {
      const idx = prev.heroSlides.findIndex(s => s.id === id);
      if (idx === -1) return prev;
      const original = prev.heroSlides[idx];
      const duplicate = {
        ...original,
        id: `slide-${Date.now()}`
      };
      const slides = [...prev.heroSlides];
      slides.splice(idx + 1, 0, duplicate);
      return { ...prev, heroSlides: slides };
    });
    addToast('Hero slide duplicated', 'success');
  };

  const handleDeleteHeroSlide = (id: string) => {
    if (form.heroSlides.length <= 1) {
      addToast('Must keep at least 1 hero slide', 'error');
      return;
    }
    updateForm(prev => ({
      ...prev,
      heroSlides: prev.heroSlides.filter(s => s.id !== id)
    }));
    addToast('Hero slide removed', 'info');
  };

  const handleMoveSlide = (idx: number, dir: 'up' | 'down') => {
    updateForm(prev => {
      const slides = [...prev.heroSlides];
      const swapWith = dir === 'up' ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= slides.length) return prev;
      const temp = slides[idx];
      slides[idx] = slides[swapWith];
      slides[swapWith] = temp;
      return { ...prev, heroSlides: slides };
    });
  };

  // Copy existing configuration helper
  const handleCopyConfigFrom = (otherId: string) => {
    const other = tenants.find(t => t.id === otherId);
    if (!other) return;

    let parsedConfig: Partial<RestaurantConfig> = {};
    if (other.customJsonSnippet) {
      try {
        parsedConfig = JSON.parse(other.customJsonSnippet);
      } catch {
        // Fallback below
      }
    }

    updateForm(prev => ({
      ...prev,
      name: `Copy of ${other.name}`,
      slug: generateSlug(`Copy of ${other.name}`),
      announcementText: other.tagline || prev.announcementText,
      taxPercent: other.taxRate || prev.taxPercent,
      contact: {
        phone: other.phone || '',
        email: other.adminEmail || '',
        address: other.address || ''
      },
      social: {
        facebook: other.socials?.facebook || '',
        instagram: other.socials?.instagram || '',
        tiktok: (parsedConfig as any)?.social?.tiktok || '',
        website: (parsedConfig as any)?.social?.website || ''
      },
      deliveryInfo: {
        estimatedMinutes: (parsedConfig as any)?.deliveryInfo?.estimatedMinutes || 45,
        fee: other.deliveryFee || 150,
        minOrder: other.minOrderValue || 0
      },
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          primary: other.brandColor,
          accent: other.lightColor || other.brandColor,
          background: {
            page: other.tintBg || '#F5F0E8',
            card: '#FFFFFF',
            header: other.brandColor,
            categoryBanner: other.tintBg || '#F5F0E8'
          }
        }
      }
    }));
    addToast(`Configuration imported from ${other.name}!`, 'success');
  };

  // Import JSON / Export JSON
  const handleImportJson = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.name || !parsed.slug) {
        addToast('Invalid config JSON: "name" and "slug" are required.', 'error');
        return;
      }
      const fullConfig: RestaurantConfig = {
        ...INITIAL_FORM_STATE,
        ...parsed,
        contact: { ...INITIAL_FORM_STATE.contact, ...parsed.contact },
        social: { ...INITIAL_FORM_STATE.social, ...parsed.social },
        location: { ...INITIAL_FORM_STATE.location, ...parsed.location },
        deliveryInfo: { ...INITIAL_FORM_STATE.deliveryInfo, ...parsed.deliveryInfo },
        theme: {
          colors: { ...INITIAL_FORM_STATE.theme.colors, ...parsed.theme?.colors },
          assets: { ...INITIAL_FORM_STATE.theme.assets, ...parsed.theme?.assets },
          cardStyle: parsed.theme?.cardStyle || 'default'
        },
        heroSlides: parsed.heroSlides || INITIAL_FORM_STATE.heroSlides
      };
      updateForm(() => fullConfig);
      addToast('Shop config JSON imported successfully!', 'success');
    } catch (e: any) {
      addToast(`JSON Import failed: ${e.message}`, 'error');
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(form, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${form.slug || 'shop'}-config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Shop configuration exported to JSON!', 'success');
  };

  const handleResetAll = () => {
    if (confirm('Are you sure you want to completely reset all input fields to initial defaults?')) {
      updateForm(() => INITIAL_FORM_STATE);
      setIsDirty(false);
      localStorage.removeItem('indolj_restaurant_create_draft');
      addToast('Reset completed', 'info');
    }
  };

  // Validation
  const runValidation = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = 'Shop / Store Name is required';
    if (!form.slug.trim()) newErrors.slug = 'Slug is required';

    const duplicate = tenants.find(t => t.slug === form.slug.trim());
    if (duplicate) {
      newErrors.slug = 'Slug matches an existing shop. Choose a unique one.';
    }

    if (!form.contact.email.trim()) {
      newErrors['contact.email'] = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.contact.email)) {
      newErrors['contact.email'] = 'Invalid email address';
    }

    if (!form.contact.phone.trim()) {
      newErrors['contact.phone'] = 'Phone is required';
    }

    if (form.taxPercent < 0 || form.taxPercent > 100) {
      newErrors.taxPercent = 'Tax percentage must be between 0% and 100%';
    }

    if (form.deliveryInfo.fee < 0) {
      newErrors['deliveryInfo.fee'] = 'Delivery fee cannot be negative';
    }

    ['social.facebook', 'social.instagram', 'social.website', 'social.tiktok'].forEach(path => {
      const parts = path.split('.');
      const val = (form as any)[parts[0]]?.[parts[1]];
      if (val && !validateUrl(val)) {
        newErrors[path] = 'Invalid URL. Please enter a valid URL (e.g. https://...)';
      }
    });

    // Validate Owner Details
    if (!ownerDetails.ownerName.trim()) {
      newErrors['ownerDetails.ownerName'] = 'Owner Name is required';
    }
    if (!ownerDetails.ownerEmail.trim()) {
      newErrors['ownerDetails.ownerEmail'] = 'Owner Email is required';
    } else if (!/\S+@\S+\.\S+/.test(ownerDetails.ownerEmail)) {
      newErrors['ownerDetails.ownerEmail'] = 'Invalid owner email address';
    }
    if (!ownerDetails.ownerPassword.trim()) {
      newErrors['ownerDetails.ownerPassword'] = 'Owner Password is required';
    } else if (ownerDetails.ownerPassword.length < 6) {
      newErrors['ownerDetails.ownerPassword'] = 'Password must be at least 6 characters long';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrKey = Object.keys(newErrors)[0];
      if (firstErrKey === 'name' || firstErrKey === 'slug' || firstErrKey === 'taxPercent') {
        setActiveTab('basic');
      } else if (firstErrKey.startsWith('ownerDetails')) {
        setActiveTab('owner');
      } else if (firstErrKey.startsWith('contact') || firstErrKey.startsWith('social')) {
        setActiveTab('contact');
      } else if (firstErrKey.startsWith('deliveryInfo')) {
        setActiveTab('delivery');
      }
      return false;
    }

    return true;
  };

  const handleSaveDraft = () => {
    localStorage.setItem('indolj_restaurant_create_draft', JSON.stringify(form));
    setIsDirty(false);
    addToast('Draft saved successfully to local storage (Ctrl+S)', 'success');
  };

  const handlePublish = async () => {
    if (!runValidation()) {
      addToast('Validation errors found. Please correct inline errors.', 'error');
      return;
    }

    const newTenant: Tenant = {
      id: `tenant-${form.slug}`,
      name: form.name,
      slug: form.slug,
      adminEmail: ownerDetails.ownerEmail || form.contact.email,
      adminPassword: ownerDetails.ownerPassword || 'admin',
      ownerName: ownerDetails.ownerName || form.name + ' Owner',
      ownerEmail: ownerDetails.ownerEmail || form.contact.email,
      ownerPassword: ownerDetails.ownerPassword || 'admin',
      businessType: ownerDetails.businessType,
      brandColor: form.theme.colors.primary,
      darkColor: form.theme.colors.primary,
      lightColor: form.theme.colors.accent,
      tintBg: form.theme.colors.background.page,
      logoUrl: form.logo,
      createdAt: new Date().toISOString(),
      status: 'active',
      tagline: form.announcementText,
      phone: form.contact.phone,
      address: `${form.contact.address}, ${form.location.area}, ${form.location.city}`,
      taxRate: form.taxPercent,
      deliveryFee: form.deliveryInfo.fee,
      minOrderValue: form.deliveryInfo.minOrder,

      cuisine: 'General',
      currency: 'Rs.',
      rating: 5.0,
      autoApproveOrders: true,
      deliveryAvailable: true,
      takeawayAvailable: true,
      dineInAvailable: true,
      operatingHours: {
        openTime: '10:00 AM',
        closeTime: '10:00 PM'
      },
      subscriptionPlan: 'premium',

      socials: {
        facebook: form.social.facebook,
        instagram: form.social.instagram,
        twitter: form.social.tiktok
      },
      footerText: form.footerText || '',
      customJsonSnippet: JSON.stringify(form, null, 2)
    };

    try {
      const savedTenant = await saveTenant(newTenant);
      localStorage.removeItem('indolj_restaurant_create_draft');
      setIsDirty(false);
      addToast(`Published Shop ${form.name} successfully (Ctrl+Shift+P)`, 'success');
      setTimeout(() => {
        setActiveTenantId(savedTenant.id);
        setActiveNavId('dashboard');
        navigate(`/restaurant/${savedTenant.id}/dashboard`);
      }, 800);
    } catch (error: any) {
      console.error('Failed to publish shop:', error);
      addToast(error?.response?.data?.message || error?.message || 'Failed to publish shop. Please try again.', 'error');
    }
  };

  const scrollToSection = (id: string) => {
    setActiveTab(id as any);
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleBack = () => {
    navigate('/superadmin');
  };

  return {
    tenants,
    form,
    setForm,
    errors,
    setErrors,
    isDirty,
    setIsDirty,
    activeTab,
    setActiveTab,
    previewTab,
    setPreviewTab,
    workspaceLayout,
    setWorkspaceLayout,
    previewSubTab,
    setPreviewSubTab,
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
    setDragActive,
    autoSaveStatus,
    mainContentRef,
    getSectionStatus,
    updateForm,
    handleUndo,
    handleRedo,
    handleFieldChange,
    handleNameChange,
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
  };
}
