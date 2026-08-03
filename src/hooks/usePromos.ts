import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PromoCode, HeroSlide, AnnouncementBar } from '@/types/promo';
import { promotionsApi } from '@/lib/api/promotions.api';

export function usePromos() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['promos-data'],
    queryFn: async () => {
      const [promos, slides, announcement] = await Promise.all([
        promotionsApi.getPromos(),
        promotionsApi.getHeroSlides(),
        promotionsApi.getAnnouncement()
      ]);
      return { promos, slides, announcement };
    }
  });

  const promos = data?.promos || [];
  const slides = data?.slides || [];
  const announcement = data?.announcement || { text: '', isActive: false };

  const savePromo = async (promo: PromoCode) => {
    try {
      const saved = await promotionsApi.savePromo(promo);
      queryClient.setQueryData(['promos-data'], (old: any) => {
        if (!old) return old;
        const promos = [...old.promos];
        const idx = promos.findIndex(p => p.id === promo.id);
        if (idx !== -1) {
          promos[idx] = saved;
        } else {
          promos.push(saved);
        }
        return { ...old, promos };
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
      queryClient.setQueryData(['promos-data'], (old: any) => {
        if (!old) return old;
        return { ...old, promos: old.promos.filter((p: PromoCode) => p.id !== id) };
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const saveSlides = async (newSlides: HeroSlide[]) => {
    try {
      const saved = await promotionsApi.saveHeroSlides(newSlides);
      queryClient.setQueryData(['promos-data'], (old: any) => 
        old ? { ...old, slides: saved } : old
      );
      return saved;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const saveAnnouncement = async (ann: AnnouncementBar) => {
    try {
      const saved = await promotionsApi.saveAnnouncement(ann);
      queryClient.setQueryData(['promos-data'], (old: any) => 
        old ? { ...old, announcement: saved } : old
      );
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
    refetch,
    savePromo,
    deletePromo,
    saveSlides,
    saveAnnouncement
  };
}
