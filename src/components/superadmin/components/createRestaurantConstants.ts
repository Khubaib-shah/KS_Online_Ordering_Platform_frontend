import { RestaurantConfig } from "@/types/restaurant";

export const INDOLJ_THEME_DEFAULT = {
  colors: {
    primary: "#1A3C2E",
    accent: "#E63946",
    background: {
      page: "#F5F0E8",
      card: "#FFFFFF",
      header: "#1A3C2E",
      categoryBanner: "#F5F0E8"
    },
    text: {
      primary: "#1A1A1A",
      secondary: "#6B7280",
      muted: "#9CA3AF",
      inverse: "#FFFFFF",
      price: "#1A1A1A",
      originalPrice: "#9CA3AF"
    },
    badge: {
      newArrival: "#16A34A",
      bestSeller: "#CA8A04",
      trending: "#EA580C",
      popular: "#CA8A04",
      hotSelling: "#DC2626",
      mostFavourite: "#D97706",
      specialFlavors: "#0891B2",
      chefsSpecial: "#0F766E",
      chefsRecommendation: "#16A34A"
    },
    cart: {
      savingsBackground: "#F0FDF4",
      savingsText: "#16A34A"
    }
  },
  assets: {
    background: {
      mode: "image" as "image" | "color",
      image: "https://assets.indolj.io/upload/1713772718-background-2.jpg"
    },
    categoryBackground: "https://res.cloudinary.com/dvyhnxnpq/image/upload/v1783027111/categoryIMG_rriqvy.jpg"
  },
  cardStyle: "default" as "default" | "compact" | "elegant"
};

export const DEFAULT_HERO_SLIDES = [
  {
    id: "slide-1",
    imageUrl: "",
    promoLabel: "",
    promoHeadline: "",
    promoSub: ""
  },
  {
    id: "slide-2",
    imageUrl: "",
    promoLabel: "",
    promoHeadline: "",
    promoSub: ""
  }
];

export const INITIAL_FORM_STATE: RestaurantConfig = {
  name: '',
  slug: '',
  logo: ``,
  announcementText: '',
  taxPercent: 15,
  contact: {
    phone: '',
    email: '',
    address: ''
  },
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    website: ''
  },
  location: {
    city: 'Karachi',
    area: ''
  },
  deliveryInfo: {
    estimatedMinutes: 45,
    fee: 150,
    minOrder: 0
  },
  activePromo: {
    type: 'flat_percent',
    value: 10,
    label: '10% Off'
  },
  seoText: '',
  footerText: '',
  footer: {
    description: '',
    layoutVariant: 'minimal'
  },
  privacyPolicy: {
    title: 'Privacy Policy',
    lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    intro: '',
    sections: []
  },
  faqs: {
    title: 'Frequently Asked Questions',
    intro: '',
    items: []
  },
  theme: JSON.parse(JSON.stringify(INDOLJ_THEME_DEFAULT)),
  heroSlides: JSON.parse(JSON.stringify(DEFAULT_HERO_SLIDES))
};


