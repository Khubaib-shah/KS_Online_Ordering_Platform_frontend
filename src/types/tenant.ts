import { RestaurantConfig } from './restaurant';
export type { RestaurantConfig };

export interface FeatureFlags {
  pos: boolean;
  kitchen: boolean;
  delivery: boolean;
  pickup: boolean;
  inventory: boolean;
  staff: boolean;
  reports: boolean;
  analytics: boolean;
  qrOrdering: boolean;
  loyalty: boolean;
  discountEngine: boolean;
  tableManagement: boolean;
  membership: boolean;
  customerDisplay: boolean;
  onlineOrdering: boolean;
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
  gridArea?: string; // e.g., 'col-span-1' | 'col-span-2' | 'col-span-3'
}




export interface Tenant {
  id: string; // e.g. 'indolj-main', 'mamma-mia', 'burger-craft'
  name: string; // e.g. 'Indolj Fine Dining'
  slug: string; // e.g. 'indolj', 'mammamia', 'burgercraft'
  adminEmail: string;
  adminPassword?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerPassword?: string;
  businessType?: 'RESTAURANT' | 'FAST_FOOD' | 'CAFE' | 'ICE_CREAM_PARLOUR' | 'BAKERY' | 'CLOUD_KITCHEN' | 'RETAIL';
  brandColor: string; // e.g. '#156A45'
  darkColor: string;  // e.g. '#0E4D34'
  lightColor: string; // e.g. '#66C18C'
  tintBg: string;     // e.g. '#E8F4EE'
  logoUrl?: string;
  createdAt: string;
  rating?: number;
  status: 'active' | 'suspended';

  // Dynamic business details
  tagline?: string;
  phone?: string;
  address?: string;
  cuisine?: string;
  currency?: string;
  taxRate?: number;
  serviceCharge?: number;
  deliveryFee?: number;
  minOrderValue?: number;
  autoApproveOrders?: boolean;
  deliveryAvailable?: boolean;
  takeawayAvailable?: boolean;
  dineInAvailable?: boolean;
  socials?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  operatingHours?: {
    openTime?: string;
    closeTime?: string;
  };
  subscriptionPlan?: 'starter' | 'premium' | 'enterprise';
  customJsonSnippet?: string; // Raw JSON configuration overrides
  footerText?: string; // Custom footer text for the shop
  customDomain?: string; // Custom domain name for the tenant
  config?: RestaurantConfig; // Advanced dynamic layout and feature setup
}

