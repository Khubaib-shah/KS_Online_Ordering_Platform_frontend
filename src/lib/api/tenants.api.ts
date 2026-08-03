import { apiClient } from '@/lib/api-client';
import { Tenant, RestaurantConfig } from '@/types/tenant';
import { getCurrentUser, isSuperAdmin } from '@/lib/security';

const mapBackendTenantToFrontend = (backendTenant: any): Tenant => {
  const ownerUser = backendTenant.users?.find((u: any) => u.staffProfile?.designation === 'OWNER') || backendTenant.users?.[0];
  const ownerEmail = ownerUser?.email || backendTenant.settings?.email || '';
  const ownerName = ownerUser?.name || backendTenant.name || '';

  const addressParts = (backendTenant.settings?.address || '').split(',').map((s: string) => s.trim());
  let city = 'Karachi';
  let area = '';
  let streetAddress = backendTenant.settings?.address || '';
  if (addressParts.length >= 3) {
    city = addressParts[addressParts.length - 1];
    area = addressParts[addressParts.length - 2];
  } else if (addressParts.length === 2) {
    area = addressParts[0];
    city = addressParts[1];
  }

  const config: RestaurantConfig = {
    name: backendTenant.name || '',
    slug: backendTenant.slug || '',
    logo: backendTenant.theme?.logoUrl || '',
    announcementText: backendTenant.content?.announcementText || '',
    contact: {
      phone: backendTenant.settings?.phone || '',
      email: ownerEmail,
      address: streetAddress,
    },
    social: {
      facebook: backendTenant.content?.copyConfig?.facebook || '',
      instagram: backendTenant.content?.copyConfig?.instagram || '',
      tiktok: backendTenant.content?.copyConfig?.twitter || '',
      website: backendTenant.content?.copyConfig?.website || '',
    },
    location: {
      city: city,
      area: area,
    },
    deliveryInfo: {
      estimatedMinutes: 30,
      fee: Number(backendTenant.settings?.deliveryFee) || 0,
      minOrder: Number(backendTenant.settings?.minOrderValue) || 0,
    },
    taxPercent: Number(backendTenant.settings?.taxRate) || 0,
    theme: {
      colors: {
        primary: backendTenant.theme?.primaryColor || '#156A45',
        accent: backendTenant.theme?.accentColor || '#66C18C',
        background: {
          page: backendTenant.theme?.bgColor || '#E8F4EE',
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
          mode: backendTenant.theme?.backgroundMode || 'color',
          image: backendTenant.theme?.backgroundImage || '',
        },
        categoryBackground: backendTenant.theme?.categoryBackground || '',
      },
      cardStyle: backendTenant.theme?.defaultCardStyle || 'default',
    },
    heroSlides: backendTenant.content?.heroSlides?.map((slide: any, idx: number) => ({
      id: slide.id || `slide-${idx}`,
      imageUrl: slide.image_url || '',
      promoLabel: slide.promo_label || '',
      promoHeadline: slide.promo_headline || '',
      promoSub: slide.promo_sub || '',
    })) || [],
    footer: backendTenant.content?.footerConfig || {
      description: '',
      layoutVariant: 'classic'
    },
    faqs: backendTenant.content?.faqs || {
      title: 'FAQs',
      intro: '',
      items: []
    },
    privacyPolicy: backendTenant.content?.privacyPolicy || {
      title: 'Privacy Policy',
      lastUpdated: new Date().toISOString().split('T')[0],
      intro: '',
      sections: []
    },
    activePromo: backendTenant.content?.activePromo || null
  };

  return {
    id: backendTenant.id,
    name: backendTenant.name,
    slug: backendTenant.slug,
    adminEmail: ownerEmail,
    adminPassword: '••••••••',
    ownerName: ownerName,
    ownerEmail: ownerEmail,
    ownerPassword: '••••••••',
    businessType: backendTenant.businessType,
    brandColor: backendTenant.theme?.primaryColor || '#156A45',
    darkColor: backendTenant.theme?.primaryColor || '#0E4D34',
    lightColor: backendTenant.theme?.accentColor || '#66C18C',
    tintBg: backendTenant.theme?.bgColor || '#E8F4EE',
    logoUrl: backendTenant.theme?.logoUrl,
    createdAt: backendTenant.createdAt,
    status: backendTenant.status?.toLowerCase() === 'active' ? 'active' : 'suspended',
    phone: backendTenant.settings?.phone || '',
    address: backendTenant.settings?.address || '',
    cuisine: backendTenant.settings?.cuisine || 'General',
    currency: backendTenant.settings?.currencySymbol || 'Rs.',
    taxRate: Number(backendTenant.settings?.taxRate) || 0,
    serviceCharge: Number(backendTenant.settings?.serviceFee) || 0,
    deliveryFee: Number(backendTenant.settings?.deliveryFee) || 0,
    minOrderValue: Number(backendTenant.settings?.minOrderValue) || 0,
    autoApproveOrders: backendTenant.settings?.autoApproveOrders !== false,
    deliveryAvailable: backendTenant.settings?.enableDelivery !== false,
    takeawayAvailable: backendTenant.settings?.enableTakeaway !== false,
    dineInAvailable: backendTenant.settings?.enableDineIn !== false,
    socials: {
      facebook: backendTenant.content?.copyConfig?.facebook || '',
      instagram: backendTenant.content?.copyConfig?.instagram || '',
      twitter: backendTenant.content?.copyConfig?.twitter || ''
    },
    operatingHours: {
      openTime: backendTenant.settings?.openTime || '11:00 AM',
      closeTime: backendTenant.settings?.closeTime || '11:00 PM'
    },
    subscriptionPlan: backendTenant.subscriptionPlan || 'premium',
    config,
    customJsonSnippet: JSON.stringify(config, null, 2)
  };
};

export const tenantsApi = {
  getTenants: async (): Promise<Tenant[]> => {
    const user = getCurrentUser();

    if (isSuperAdmin(user)) {
      const res = await apiClient.get<any, any>('/superadmin/tenants');
      const tenantsList = Array.isArray(res) ? res : (res?.tenants || []);
      return tenantsList.map(mapBackendTenantToFrontend);
    } else if (user?.restaurantId) {
      // apiClient intercepts and sends x-tenant-id automatically if set
      const res = await apiClient.get<any, any>('/tenant/current');
      return [mapBackendTenantToFrontend(res)];
    }

    return [];
  },

  getTenantById: async (id: string): Promise<Tenant | undefined> => {
    try {
      const res = await apiClient.get<any, any>(`/superadmin/tenants/${id}`);
      return mapBackendTenantToFrontend(res);
    } catch (e) {
      return undefined;
    }
  },

  saveTenant: async (tenant: Tenant): Promise<Tenant> => {
    // If tenant ID is missing or starts with 'tenant-', it's a new tenant creation request
    const isNew = !tenant.id || tenant.id.startsWith('tenant-');
    if (isNew) {
      const payload = {
        name: tenant.name,
        slug: tenant.slug,
        businessType: tenant.businessType || 'RESTAURANT',
        ownerEmail: tenant.ownerEmail,
        ownerName: tenant.ownerName || tenant.name,
        ownerPassword: tenant.ownerPassword,
        settings: {
          currencySymbol: tenant.currency || 'Rs.',
          taxRate: tenant.taxRate || 0,
          serviceFee: tenant.serviceCharge || 0,
          enableDelivery: tenant.deliveryAvailable ?? true,
          enableTakeaway: tenant.takeawayAvailable ?? true,
          enableDineIn: tenant.dineInAvailable ?? true,
          phone: tenant.phone,
          address: tenant.address,
          deliveryFee: tenant.deliveryFee || 0,
          minOrderValue: tenant.minOrderValue || 0,
          deliveryAreas: (tenant.config as any)?.location?.area,
        },
        theme: {
          primaryColor: tenant.brandColor,
          accentColor: tenant.lightColor,
          bgColor: tenant.tintBg,
          logoUrl: tenant.logoUrl,
          categoryBackground: (tenant.config as any)?.theme.assets.categoryBackground || '',
          backgroundImage: (tenant.config as any)?.theme.assets.background.image || '',
          backgroundMode: (tenant.config as any)?.theme.assets.background.mode || 'color',
          defaultCardStyle: (tenant.config as any)?.theme.cardStyle || 'default',
        },
        content: {
          announcementText: tenant.tagline,
          footerConfig: (tenant.config as any)?.footer,
          heroSlides: (tenant.config as any)?.heroSlides,
          faqs: (tenant.config as any)?.faqs,
          privacyPolicy: (tenant.config as any)?.privacyPolicy,
          seoTitle: tenant.name,
          seoDescription: (tenant.config as any)?.seoText,
          activePromo: (tenant.config as any)?.activePromo || null,
          copyConfig: {
            facebook: tenant.socials?.facebook || '',
            instagram: tenant.socials?.instagram || '',
            twitter: tenant.socials?.twitter || '',
            website: (tenant.config as any)?.social?.website || '',
          }
        }
      };

      try {
        const res = await apiClient.post<any, any>('/superadmin/tenants', payload);
        return mapBackendTenantToFrontend(res.tenant || res);
      } catch (err) {
        console.error('Failed to create tenant via backend:', err);
        throw err;
      }
    }

    // Otherwise, perform regular settings, theme, and content updates
    const user = getCurrentUser();
    if (isSuperAdmin(user)) {
      await apiClient.put(`/superadmin/tenants/${tenant.id}`, {
        name: tenant.name,
        slug: tenant.slug,
        businessType: tenant.businessType,
        ownerName: tenant.ownerName,
        ownerEmail: tenant.ownerEmail,
        ownerPassword: tenant.ownerPassword !== '••••••••' ? tenant.ownerPassword : undefined,
      });
    }

    await apiClient.put('/tenant/settings', {
      currencySymbol: tenant.currency || 'Rs.',
      taxRate: tenant.taxRate || 0,
      serviceFee: tenant.serviceCharge || 0,
      enableDelivery: tenant.deliveryAvailable ?? true,
      enableTakeaway: tenant.takeawayAvailable ?? true,
      enableDineIn: tenant.dineInAvailable ?? true,
      phone: tenant.phone,
      address: tenant.address,
      receiptHeader: tenant.config?.footer?.description || '',
      receiptFooter: '',
      deliveryFee: tenant.deliveryFee || 0,
      minOrderValue: tenant.minOrderValue || 0,
      deliveryAreas: (tenant.config as any)?.location?.area,
    }, {
      headers: { 'x-tenant-id': tenant.id }
    });

    await apiClient.put('/tenant/theme', {
      primaryColor: tenant.brandColor,
      accentColor: tenant.lightColor,
      bgColor: tenant.tintBg,
      logoUrl: tenant.logoUrl,
      categoryBackground: tenant.config?.theme.assets.categoryBackground,
      backgroundImage: tenant.config?.theme.assets.background.image,
      backgroundMode: tenant.config?.theme.assets.background.mode,
      defaultCardStyle: tenant.config?.theme.cardStyle,
    }, {
      headers: { 'x-tenant-id': tenant.id }
    });

    await apiClient.put('/tenant/content', {
      announcementText: tenant.tagline,
      footerConfig: tenant.config?.footer,
      copyConfig: {
        facebook: tenant.socials?.facebook || '',
        instagram: tenant.socials?.instagram || '',
        twitter: tenant.socials?.twitter || '',
        website: tenant.config?.social?.website || '',
      },
      heroSlides: tenant.config?.heroSlides?.map((slide, idx) => ({
        image_url: slide.imageUrl,
        promo_label: slide.promoLabel,
        promo_headline: slide.promoHeadline,
        promo_sub: slide.promoSub,
        sort_order: idx
      })),
      faqs: tenant.config?.faqs,
      privacyPolicy: tenant.config?.privacyPolicy,
      seoTitle: tenant.name,
      seoDescription: tenant.config?.seoText,
      activePromo: tenant.config?.activePromo,
    }, {
      headers: { 'x-tenant-id': tenant.id }
    });

    if (isSuperAdmin(user)) {
      const refreshed = await tenantsApi.getTenantById(tenant.id);
      return refreshed || tenant;
    } else {
      try {
        const res = await apiClient.get<any, any>('/tenant/current');
        return mapBackendTenantToFrontend(res);
      } catch (e) {
        return tenant;
      }
    }
  },

  deleteTenant: async (id: string): Promise<void> => {
    try {
      await apiClient.delete<any>(`/superadmin/tenants/${id}`);
    } catch (e) {
      console.error('Failed to delete tenant', e);
      throw e;
    }
  },

  getSuperAdminStats: async (): Promise<any> => {
    try {
      const res = await apiClient.get<any, any>('/superadmin/stats');
      return res;
    } catch (e) {
      console.error('Failed to fetch superadmin stats', e);
      return null;
    }
  },

  getGlobalAreas: async (): Promise<any[]> => {
    try {
      const res = await apiClient.get<any, any>('/tenant/areas');
      return res || [];
    } catch (e) {
      console.error('Failed to fetch global areas', e);
      return [];
    }
  },

  createGlobalArea: async (data: any): Promise<any> => {
    return await apiClient.post<any, any>('/superadmin/areas', data);
  },

  updateGlobalArea: async (id: string, data: any): Promise<any> => {
    return await apiClient.put<any, any>(`/superadmin/areas/${id}`, data);
  },

  deleteGlobalArea: async (id: string): Promise<void> => {
    await apiClient.delete<any>(`/superadmin/areas/${id}`);
  }
};
