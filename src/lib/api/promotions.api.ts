import { PromoCode, HeroSlide, AnnouncementBar } from '@/types/promo';
import { getTenantKey } from '@/lib/security';
import { apiClient } from '@/lib/api-client';
import { PLATFORM_PREFIX } from '@/lib/constants';



const mapBackendPromoToFrontend = (backendPromo: any): PromoCode => {
  return {
    id: backendPromo.id,
    code: backendPromo.code,
    type: backendPromo.discountType === 'PERCENTAGE' ? 'flat_percent' : backendPromo.discountType === 'FIXED_AMOUNT' ? 'flat_amount' : 'free_delivery',
    value: Number(backendPromo.discountValue),
    minOrderValue: backendPromo.minOrderAmount ? Number(backendPromo.minOrderAmount) : undefined,
    maxDiscountCap: backendPromo.maxDiscountCap ? Number(backendPromo.maxDiscountCap) : undefined,
    validFrom: backendPromo.startDate,
    expiresAt: backendPromo.endDate,
    usageLimit: backendPromo.usageLimit,
    usageCount: backendPromo.timesUsed || 0,
    isActive: backendPromo.isActive,
  };
};

export function getStoredHeroSlides(): HeroSlide[] {
  const key = getTenantKey(`${PLATFORM_PREFIX}_hero_slides`);
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify([]));
    return [];
  }
  return JSON.parse(data);
}

export function getStoredAnnouncement(): AnnouncementBar {
  const key = getTenantKey(`${PLATFORM_PREFIX}_announcement`);
  const data = localStorage.getItem(key);
  if (!data) {
    const defaultAnnouncement = { text: '', isActive: false };
    localStorage.setItem(key, JSON.stringify(defaultAnnouncement));
    return defaultAnnouncement;
  }
  return JSON.parse(data);
}

export const promotionsApi = {
  getPromos: async (): Promise<PromoCode[]> => {
    // Backend uses pagination, we fetch a large limit for UI
    const res = await apiClient.get('/promotions?limit=100');
    return Array.isArray(res) ? res.map(mapBackendPromoToFrontend) : [];
  },

  savePromo: async (promo: PromoCode): Promise<PromoCode> => {
    const payload = {
      code: promo.code,
      discountType: promo.type === 'flat_percent' ? 'PERCENTAGE' : promo.type === 'flat_amount' ? 'FIXED_AMOUNT' : 'FREE_DELIVERY',
      discountValue: promo.value,
      minOrderAmount: promo.minOrderValue,
      maxDiscountCap: promo.maxDiscountCap,
      startDate: promo.validFrom,
      endDate: promo.expiresAt,
      usageLimit: promo.usageLimit,
      isActive: promo.isActive,
    };

    let res;
    if (promo.id && !promo.id.startsWith('promo-')) {
      res = await apiClient.put(`/promotions/${promo.id}`, payload);
    } else {
      res = await apiClient.post('/promotions', payload);
    }
    return mapBackendPromoToFrontend(res);
  },

  deletePromo: async (id: string): Promise<void> => {
    await apiClient.delete(`/promotions/${id}`);
  },

  getHeroSlides: async (): Promise<HeroSlide[]> => {
    try {
      const res: any = await apiClient.get('/tenant/current');
      if (res && res.content && res.content.heroSlides) {
        return res.content.heroSlides.map((slide: any, idx: number) => ({
          id: slide.id || `slide-${idx}`,
          image: slide.image_url || slide.image || '',
          label: slide.promo_label || slide.label,
          headline: slide.promo_headline || slide.headline,
          subText: slide.promo_sub || slide.subText,
          sortOrder: slide.sort_order ?? slide.sortOrder ?? idx
        }));
      }
      return [];
    } catch (err) {
      console.error('Failed to get hero slides from backend', err);
      return getStoredHeroSlides();
    }
  },

  saveHeroSlides: async (slides: HeroSlide[]): Promise<HeroSlide[]> => {
    try {
      const payload = slides.map((slide, idx) => ({
        id: slide.id,
        image_url: slide.image,
        promo_label: slide.label,
        promo_headline: slide.headline,
        promo_sub: slide.subText,
        sort_order: slide.sortOrder ?? idx
      }));
      await apiClient.put('/tenant/content', { heroSlides: payload });
      return slides;
    } catch (err) {
      console.error('Failed to save hero slides to backend', err);
      return slides;
    }
  },

  getAnnouncement: async (): Promise<AnnouncementBar> => {
    try {
      const res: any = await apiClient.get('/tenant/current');
      if (res && res.content && res.content.announcementText) {
        return {
          text: res.content.announcementText,
          isActive: true // We can assume active if it's there or we don't have an active flag in backend for this yet
        };
      }
      return getStoredAnnouncement();
    } catch (err) {
      console.error('Failed to get announcement from backend', err);
      return getStoredAnnouncement();
    }
  },

  saveAnnouncement: async (announcement: AnnouncementBar): Promise<AnnouncementBar> => {
    try {
      await apiClient.put('/tenant/content', { announcementText: announcement.text });
      return announcement;
    } catch (err) {
      console.error('Failed to save announcement to backend', err);
      return announcement;
    }
  }
};
