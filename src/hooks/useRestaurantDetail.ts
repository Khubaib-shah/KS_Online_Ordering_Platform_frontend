import React, { useState, useEffect, useRef } from 'react';
import { Tenant } from '@/types/tenant';
import { RestaurantConfig } from '@/types/restaurant';
import { useTenantStore } from '@/store/tenantStore';

interface UseRestaurantDetailProps {
  tenant: Tenant;
  onSave: (updated: Tenant) => void;
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function useRestaurantDetail({ tenant, onSave, addToast }: UseRestaurantDetailProps) {
  const { tenants } = useTenantStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'json'>('overview');
  const [activeSettingsSection, setActiveSettingsSection] = useState<'basic' | 'owner' | 'branding' | 'contact' | 'location' | 'delivery' | 'promo' | 'theme' | 'assets' | 'hero' | 'seo' | 'legal'>('basic');
  const [isSaving, setIsSaving] = useState(false);

  // Unified Form State (from customJsonSnippet or mapping primitive properties)
  const [form, setForm] = useState<RestaurantConfig>(() => {
    if (tenant.customJsonSnippet) {
      try {
        const parsed = JSON.parse(tenant.customJsonSnippet);
        if (parsed && typeof parsed === 'object' && parsed.name && parsed.slug) {
          return parsed;
        }
      } catch { }
    }

    return {
      name: tenant.name || '',
      slug: tenant.slug || '',
      logo: tenant.logoUrl || '',
      announcementText: tenant.tagline || '',
      contact: {
        phone: tenant.phone || '',
        email: tenant.adminEmail || '',
        address: tenant.address || '',
      },
      social: {
        facebook: tenant.socials?.facebook || '',
        instagram: tenant.socials?.instagram || '',
        tiktok: tenant.socials?.twitter || '',
        website: '',
      },
      location: {
        city: 'Karachi',
        area: '',
      },
      deliveryInfo: {
        estimatedMinutes: 30,
        fee: tenant.deliveryFee || 0,
        minOrder: tenant.minOrderValue || 0,
      },
      taxPercent: tenant.taxRate || 0,
      theme: {
        colors: {
          primary: tenant.brandColor || '#156A45',
          accent: tenant.lightColor || '#66C18C',
          background: {
            page: tenant.tintBg || '#E8F4EE',
            card: '#ffffff',
            header: '#ffffff',
            categoryBanner: '#f8fafc',
          },
          text: {
            primary: '#0f172a',
            secondary: '#475569',
            muted: '#94a3b8',
            inverse: '#ffffff',
            price: '#0f172a',
            originalPrice: '#94a3b8',
          },
          badge: {
            newArrival: '#4f46e5',
            bestSeller: '#f59e0b',
            trending: '#ec4899',
            popular: '#10b981',
            hotSelling: '#ef4444',
            mostFavourite: '#8b5cf6',
            specialFlavors: '#06b6d4',
            chefsSpecial: '#ec4899',
            chefsRecommendation: '#f59e0b',
          },
          cart: {
            savingsBackground: '#e0f2fe',
            savingsText: '#0369a1',
          }
        },
        assets: {
          background: {
            mode: 'color',
            image: '',
          },
          categoryBackground: '',
        },
        cardStyle: 'default',
      },
      heroSlides: [],
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [logoInputMode, setLogoInputMode] = useState<'url' | 'svg_code' | 'file'>('url');
  const [logoSvgCode, setLogoSvgCode] = useState('');
  const [dragActive, setDragActive] = useState<Record<string, boolean>>({});
  const [workspaceLayout, setWorkspaceLayout] = useState<'split' | 'form' | 'preview'>('split');
  const [previewTab, setPreviewTab] = useState<'desktop' | 'mobile'>('desktop');
  const [previewSubTab, setPreviewSubTab] = useState<'menu' | 'info' | 'reviews'>('menu');
  const [showQuickTools, setShowQuickTools] = useState(false);

  // Undo / Redo history state
  const [history, setHistory] = useState<RestaurantConfig[]>([]);
  const [redoStack, setRedoStack] = useState<RestaurantConfig[]>([]);

  // Owner Details State
  const [ownerDetails, setOwnerDetails] = useState({
    ownerName: tenant.ownerName || tenant.name || '',
    ownerEmail: tenant.adminEmail || '',
    ownerPassword: tenant.adminPassword || 'admin',
    businessType: tenant.businessType || 'RESTAURANT'
  });

  // Keep track of primitive properties as getters mapping to Form
  const brandColor = form.theme.colors.primary;
  const darkColor = form.theme.colors.primary;
  const lightColor = form.theme.colors.accent;
  const tintBg = form.theme.colors.background.page;
  const tagline = form.announcementText || '';
  const phone = form.contact.phone;
  const address = form.contact.address;
  const cuisine = 'General';
  const currency = 'Rs.';
  const taxRate = form.taxPercent;
  const serviceCharge = form.posConfig?.serviceChargeRate || 5;
  const deliveryFee = form.deliveryInfo.fee;
  const minOrderValue = form.deliveryInfo.minOrder;
  const autoApproveOrders = true;
  const deliveryAvailable = true;
  const takeawayAvailable = true;
  const dineInAvailable = true;
  const socialFacebook = form.social.facebook || '';
  const socialInstagram = form.social.instagram || '';
  const socialTwitter = form.social.tiktok || '';
  const openTime = form.businessHours?.openTime || '11:00 AM';
  const closeTime = form.businessHours?.closeTime || '11:00 PM';
  const subscriptionPlan = tenant.subscriptionPlan || 'premium';

  // Raw JSON configuration state
  const [jsonSnippet, setJsonSnippet] = useState(tenant.customJsonSnippet || '');
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Ref for scroll target
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Local calculation of metrics
  const catsKey = `indolj_categories_${tenant.id}`;
  const itemsKey = `indolj_menu_items_${tenant.id}`;
  const ordersKey = `indolj_orders_${tenant.id}`;
  const promosKey = `indolj_promos_${tenant.id}`;

  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [promoCodes, setPromoCodes] = useState<any[]>([]);

  useEffect(() => {
    try {
      setCategories(JSON.parse(localStorage.getItem(catsKey) || '[]'));
      setMenuItems(JSON.parse(localStorage.getItem(itemsKey) || '[]'));
      setOrders(JSON.parse(localStorage.getItem(ordersKey) || '[]'));
      setPromoCodes(JSON.parse(localStorage.getItem(promosKey) || '[]'));
    } catch (e) {
      console.error('Error loading operational keys for detail view:', e);
    }
  }, [tenant.id]);

  // Section completion status calculator
  const getSectionStatus = (id: string) => {
    switch (id) {
      case 'basic':
        return form.name.trim() && form.slug.trim() ? 'completed' : 'incomplete';
      case 'branding':
        return form.logo && form.logo.length > 5 ? 'completed' : 'incomplete';
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

  // State update wrapping with history tracking
  const updateForm = (updater: (prev: RestaurantConfig) => RestaurantConfig) => {
    setForm(prev => {
      const next = updater(prev);
      setHistory(h => [...h.slice(-29), prev]);
      setRedoStack([]);
      setIsDirty(true);
      return next;
    });
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(h => h.slice(0, -1));
      setRedoStack(r => [form, ...r]);
      setForm(prev);
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
      addToast('Redo action applied', 'info');
    } else {
      addToast('Nothing to redo', 'info');
    }
  };

  // General nested path update helper
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

  // Color selection helper
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

  // SVG and File manipulation helpers
  const handleClipboardPaste = (e: React.ClipboardEvent, targetField: string) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const imageType = targetField === 'logo' ? 'Logo' : targetField.includes('category') ? 'Category' : 'Banner';
          uploadFileToServer(file, targetField, imageType);
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
      const currentSlug = form.slug.trim() || tenant.slug || 'temp-draft-store';
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

  // Sync state JSON helpers
  const syncFormStateToJson = () => {
    setJsonSnippet(JSON.stringify(form, null, 2));
    setJsonError(null);
  };

  const syncJsonToFormState = (rawJson: string): boolean => {
    try {
      if (!rawJson.trim()) {
        setJsonError('JSON configuration is empty');
        return false;
      }
      const parsed = JSON.parse(rawJson);

      if (!parsed.name || !parsed.slug) {
        setJsonError('Required fields: "name" and "slug" are missing in JSON');
        return false;
      }

      setForm(parsed);
      setJsonError(null);
      return true;
    } catch (e: any) {
      setJsonError(e.message || 'Invalid JSON syntax');
      return false;
    }
  };

  const handleResetTheme = () => {
    updateForm(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          primary: '#156A45',
          accent: '#66C18C',
          background: {
            page: '#E8F4EE',
            card: '#ffffff',
            header: '#ffffff',
            categoryBanner: '#f8fafc'
          }
        }
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
            page: other.tintBg || '#E8F4EE',
            card: '#FFFFFF',
            header: other.brandColor,
            categoryBanner: other.tintBg || '#E8F4EE'
          }
        }
      }
    }));
    addToast(`Duplicated theme from ${other.name}!`, 'success');
  };

  // Hero slideshow handlers
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

  const handleCopyConfigFrom = (otherId: string) => {
    const other = tenants.find(t => t.id === otherId);
    if (!other) return;

    let parsedConfig: Partial<RestaurantConfig> = {};
    if (other.customJsonSnippet) {
      try {
        parsedConfig = JSON.parse(other.customJsonSnippet);
      } catch { }
    }

    updateForm(prev => ({
      ...prev,
      name: other.name,
      slug: other.slug,
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
        estimatedMinutes: (parsedConfig as any)?.deliveryInfo?.estimatedMinutes || 30,
        fee: other.deliveryFee || 0,
        minOrder: other.minOrderValue || 0
      },
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          primary: other.brandColor,
          accent: other.lightColor || other.brandColor,
          background: {
            page: other.tintBg || '#E8F4EE',
            card: '#FFFFFF',
            header: other.brandColor,
            categoryBanner: other.tintBg || '#E8F4EE'
          }
        }
      }
    }));
    addToast(`Configuration imported from ${other.name}!`, 'success');
  };

  const handleImportJson = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed.name || !parsed.slug) {
        addToast('Invalid config JSON: "name" and "slug" are required.', 'error');
        return;
      }
      updateForm(() => parsed);
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
      handleResetForm();
    }
  };

  // Settings Save Handler
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (activeTab === 'json') {
      const isValid = syncJsonToFormState(jsonSnippet);
      if (!isValid) {
        addToast('Invalid configuration: The JSON script contains schema errors.', 'error');
        return;
      }
    }

    if (!form.name || !form.slug) {
      addToast('Core parameters "Restaurant Name" and "Subdomain Slug" are required.', 'error');
      return;
    }

    setIsSaving(true);
    await new Promise(r => setTimeout(r, 600)); // Simulating network delay for loading state

    try {
      const updatedTenant: Tenant = {
        ...tenant,
        name: form.name,
        slug: form.slug,
        adminEmail: ownerDetails.ownerEmail || form.contact.email,
        adminPassword: ownerDetails.ownerPassword,
        ownerName: ownerDetails.ownerName,
        ownerEmail: ownerDetails.ownerEmail,
        ownerPassword: ownerDetails.ownerPassword,
        businessType: ownerDetails.businessType,
        brandColor: form.theme.colors.primary,
        darkColor: form.theme.colors.primary,
        lightColor: form.theme.colors.accent,
        tintBg: form.theme.colors.background.page,
        logoUrl: form.logo,
        tagline: form.announcementText || '',
        phone: form.contact.phone,
        address: form.contact.address,
        taxRate: form.taxPercent,
        deliveryFee: form.deliveryInfo.fee,
        minOrderValue: form.deliveryInfo.minOrder,
        socials: {
          facebook: form.social.facebook || '',
          instagram: form.social.instagram || '',
          twitter: form.social.tiktok || '',
        },
        operatingHours: {
          openTime: form.businessHours?.openTime || '11:00 AM',
          closeTime: form.businessHours?.closeTime || '11:00 PM',
        },
        config: form,
        customJsonSnippet: JSON.stringify(form, null, 2)
      };

      onSave(updatedTenant);
      setIsDirty(false);
      addToast('Restaurant parameters updated successfully!', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetForm = () => {
    if (tenant.customJsonSnippet) {
      try {
        const parsed = JSON.parse(tenant.customJsonSnippet);
        setForm(parsed);
      } catch { }
    }
    setOwnerDetails({
      ownerName: tenant.ownerName || tenant.name || '',
      ownerEmail: tenant.adminEmail || '',
      ownerPassword: tenant.adminPassword || 'admin',
      businessType: tenant.businessType || 'RESTAURANT'
    });
    setIsDirty(false);
    addToast('Form values reset to current restaurant state.', 'info');
  };

  // Customer Rating Visual Score
  const currentRating = tenant.rating || 4.8;
  const starPct5 = Math.round(currentRating >= 4.7 ? 85 : 70);
  const starPct4 = Math.round(currentRating >= 4.7 ? 12 : 20);
  const starPct3 = Math.round(currentRating >= 4.7 ? 3 : 8);
  const starPct2 = 0;

  // Render revenue chart data
  const chartData = (() => {
    const chartPoints = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime();

      const dayOrders = orders.filter(o => {
        const p = new Date(o.placedAt).getTime();
        return p >= dayStart && p <= dayEnd;
      });
      const rev = dayOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
      chartPoints.push({
        name: dayStr,
        Revenue: rev,
        Orders: dayOrders.length
      });
    }
    return chartPoints;
  })();

  const totalOrdersCount = orders.length;
  const activeOrders = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled');
  const activeOrdersCount = activeOrders.length;

  const now = new Date();
  const oneDay = 24 * 3600000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  const todayOrders = orders.filter((o: any) => {
    const placed = new Date(o.placedAt || Date.now());
    return now.getTime() - placed.getTime() < oneDay;
  });
  const weeklyOrders = orders.filter((o: any) => {
    const placed = new Date(o.placedAt || Date.now());
    return now.getTime() - placed.getTime() < oneWeek;
  });
  const monthlyOrders = orders.filter((o: any) => {
    const placed = new Date(o.placedAt || Date.now());
    return now.getTime() - placed.getTime() < oneMonth;
  });

  const todayRevenue = todayOrders.reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);
  const weeklyRevenue = weeklyOrders.reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);
  const monthlyRevenue = monthlyOrders.reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);

  return {
    activeTab,
    setActiveTab,
    activeSettingsSection,
    setActiveSettingsSection,
    form,
    setForm,
    errors,
    setErrors,
    isDirty,
    setIsDirty,
    logoInputMode,
    setLogoInputMode,
    logoSvgCode,
    setLogoSvgCode,
    dragActive,
    setDragActive,
    workspaceLayout,
    setWorkspaceLayout,
    previewTab,
    setPreviewTab,
    previewSubTab,
    setPreviewSubTab,
    showQuickTools,
    setShowQuickTools,
    history,
    setHistory,
    redoStack,
    setRedoStack,
    ownerDetails,
    setOwnerDetails,
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
    handleSaveSettings,
    isSaving,
    handleResetForm,
    brandColor,
    darkColor,
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
    autoApproveOrders,
    deliveryAvailable,
    takeawayAvailable,
    dineInAvailable,
    socialFacebook,
    socialInstagram,
    socialTwitter,
    openTime,
    closeTime,
    subscriptionPlan,
    jsonSnippet,
    setJsonSnippet,
    jsonError,
    setJsonError,
    categories,
    menuItems,
    orders,
    promoCodes,
    totalOrdersCount,
    activeOrders,
    activeOrdersCount,
    todayOrders,
    weeklyOrders,
    monthlyOrders,
    todayRevenue,
    weeklyRevenue,
    monthlyRevenue,
    currentRating,
    starPct5,
    starPct4,
    starPct3,
    starPct2,
    chartData,
    syncFormStateToJson,
    syncJsonToFormState,
    mainContentRef
  };
}
