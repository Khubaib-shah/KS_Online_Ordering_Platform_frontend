export interface PromoCode {
  id: string;
  code: string; // e.g., "FLAT40"
  type: 'flat_percent' | 'flat_amount' | 'free_delivery';
  value: number; // e.g., 40 for percent, 200 for amount, 0 for free delivery
  minOrderValue?: number;
  maxDiscountCap?: number;
  usageLimit?: number | null;
  usageCount: number;
  perUserLimit?: number;
  validFrom?: string; // ISO date
  validUntil?: string | null; // ISO date
  expiresAt?: string | null; // alias
  description?: string;
  isActive: boolean;
}

export interface HeroSlide {
  id: string;
  image: string;
  label?: string;
  headline?: string;
  subText?: string;
  sortOrder: number;
}

export interface AnnouncementBar {
  text: string;
  isActive: boolean;
  backgroundColor?: string;
}
