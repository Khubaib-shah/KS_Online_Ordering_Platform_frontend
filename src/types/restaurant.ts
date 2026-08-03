import { FeatureFlags, DashboardWidgetConfig } from './tenant';

export interface RestaurantConfig {
  slug: string;
  name: string;
  logo: string;
  announcementText?: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  social: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
  };
  location: {
    city: string;
    area: string;
  };
  deliveryInfo: {
    estimatedMinutes: number;
    fee: number;
    minOrder: number;
  };
  taxPercent: number;
  activePromo?: {
    type: 'flat_percent' | 'flat_amount' | 'free_delivery' | 'bogo';
    value: number;
    label: string;
  };
  seoText?: string;
  footerText?: string; // Custom footer text for the storefront
  theme: {
    colors: {
      primary: string;
      accent: string;
      background: {
        page: string;
        card: string;
        header: string;
        categoryBanner: string;
      };
      text: {
        primary: string;
        secondary: string;
        muted: string;
        inverse: string;
        price: string;
        originalPrice: string;
      };
      badge: {
        newArrival: string;
        bestSeller: string;
        trending: string;
        popular: string;
        hotSelling: string;
        mostFavourite: string;
        specialFlavors: string;
        chefsSpecial: string;
        chefsRecommendation: string;
      };
      cart: {
        savingsBackground: string;
        savingsText: string;
      };
    };
    assets: {
      background: {
        mode: 'image' | 'color';
        image: string;
      };
      categoryBackground: string;
    };
    cardStyle: 'default' | 'compact' | 'elegant';
  };
  heroSlides: Array<{
    id: string;
    imageUrl: string;
    promoLabel?: string;
    promoHeadline?: string;
    promoSub?: string;
  }>;
  footer?: {
    description: string;
    layoutVariant: 'classic' | 'modern' | 'minimal';
  };
  privacyPolicy?: {
    title: string;
    lastUpdated: string;
    intro: string;
    sections: Array<{
      heading: string;
      body: string;
    }>;
  };
  faqs?: {
    title: string;
    intro: string;
    items: Array<{
      question: string;
      answer: string;
    }>;
  };
  features?: FeatureFlags;
  paymentMethods?: ('cash' | 'card' | 'mobile_pay' | 'loyalty_points')[];
  supportedOrderTypes?: ('dine_in' | 'takeaway' | 'delivery')[];
  timezone?: string;
  language?: string;
  currencySymbol?: string;
  businessHours?: {
    openTime: string;
    closeTime: string;
  };
  posConfig?: {
    enableReceiptPrinting: boolean;
    autoPrintReceipt: boolean;
    allowDiscounts: boolean;
    requireManagerApprovalForVoid: boolean;
    taxRate: number;
    serviceChargeRate: number;
  };
  kitchenConfig?: {
    enableKDS: boolean;
    autoRefreshInterval: number;
    alertThresholdMinutes: number;
  };
  receiptConfig?: {
    headerMessage: string;
    footerMessage: string;
    showTaxId: boolean;
    taxId: string;
  };
  dashboardWidgets?: DashboardWidgetConfig[];
}
