import { useState, useEffect, useCallback } from 'react';
import { PromoCode, HeroSlide, AnnouncementBar } from '@/types/promo';
import { promotionsApi } from '@/lib/api/promotions.api';

export function usePromos() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [announcement, setAnnouncement] = useState<AnnouncementBar>({ text: '', isActive: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [pData, sData, aData] = await Promise.all([
        promotionsApi.getPromos(),
        promotionsApi.getHeroSlides(),
        promotionsApi.getAnnouncement()
      ]);
      setPromos(pData);
      setSlides(sData);
      setAnnouncement(aData);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const savePromo = async (promo: PromoCode) => {
    try {
      const saved = await promotionsApi.savePromo(promo);
      setPromos(prev => {
        const idx = prev.findIndex(p => p.id === promo.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = saved;
          return updated;
        }
        return [...prev, saved];
      });
      return saved;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const deletePromo = async (id: string) => {
    try {
      await promotionsApi.deletePromo(id);
      setPromos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const saveSlides = async (newSlides: HeroSlide[]) => {
    try {
      const saved = await promotionsApi.saveHeroSlides(newSlides);
      setSlides(saved);
      return saved;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const saveAnnouncement = async (ann: AnnouncementBar) => {
    try {
      const saved = await promotionsApi.saveAnnouncement(ann);
      setAnnouncement(saved);
      return saved;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    promos,
    slides,
    announcement,
    isLoading,
    error,
    refetch: fetchData,
    savePromo,
    deletePromo,
    saveSlides,
    saveAnnouncement
  };
}
