export interface VariantOption {
  id?: string;
  name: string;
  price?: number; // additional price (Rs.)
  additionalPrice?: number; // alias used in some components
}

export interface VariantGroup {
  id?: string;
  name: string;
  required: boolean;
  min?: number;
  max?: number;
  options: VariantOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | undefined;
  category: string; // matches Category slug or name
  basePrice: number;
  discountPrice: number;
  image?: any; // local preview object URL or placeholder, or Cloudinary object
  badge?: string; // e.g. "NEW_ARRIVAL" | "BEST_SELLER" | "TRENDING" | "HOT_SELLING" | "None"
  isFeatured: boolean;
  isDealLayout?: boolean; // optional 16:9 vs 1:1 image layout
  servingNote?: string;
  isAvailable: boolean;
  sortOrder: number;
  variants?: VariantGroup[];
  variantGroups?: VariantGroup[];
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  style?: 'Pentagon' | 'Plain';
  icon: string; // emoji or name
  isActive: boolean;
  itemCount?: number;
  description?: string;
  sortOrder?: number;
  imageUrl?: any; // background image URL or Cloudinary object
}
