export interface ThemeColors {
  brandColor: string;
  darkColor: string;
  lightColor: string;
  tintBg: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
}

export interface ThemeConfig {
  brandName: string;
  logo: string;
  favicon?: string;
  colors: ThemeColors;
  typography: string;
  borderRadius: string;
  dashboardBranding?: {
    welcomeTitle?: string;
    showSubtitle?: boolean;
    headerStyle?: string;
  };
  sidebarBranding?: {
    logoUrl?: string;
    showTitle?: boolean;
    customFooter?: string;
  };
}
