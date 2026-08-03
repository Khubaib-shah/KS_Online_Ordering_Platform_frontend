import { Tenant } from '../types/tenant';

export function applyTheme(colors: Partial<{ brandColor: string, darkColor: string, lightColor: string, tintBg: string }>): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  
  if (!colors || Object.keys(colors).length === 0) {
    // Clear custom CSS variables to fall back to the index.css defaults (Super Admin theme)
    root.style.removeProperty('--color-accent-primary');
    root.style.removeProperty('--color-accent-dark');
    root.style.removeProperty('--color-accent-light');
    root.style.removeProperty('--color-accent-tint-bg');
    
    root.style.removeProperty('--accent-primary');
    root.style.removeProperty('--accent-dark');
    root.style.removeProperty('--accent-light');
    root.style.removeProperty('--accent-tint-bg');
    
    root.style.removeProperty('--color-status-completed-text');
    root.style.removeProperty('--color-status-completed-bg');
    return;
  }

  const brandColor = colors.brandColor;
  const darkColor = colors.darkColor;
  const lightColor = colors.lightColor;
  const tintBg = colors.tintBg;

  if (brandColor) {
    root.style.setProperty('--color-accent-primary', brandColor);
    root.style.setProperty('--accent-primary', brandColor);
    root.style.setProperty('--color-status-completed-text', brandColor);
  }
  if (darkColor) {
    root.style.setProperty('--color-accent-dark', darkColor);
    root.style.setProperty('--accent-dark', darkColor);
  }
  if (lightColor) {
    root.style.setProperty('--color-accent-light', lightColor);
    root.style.setProperty('--accent-light', lightColor);
  }
  if (tintBg) {
    root.style.setProperty('--color-accent-tint-bg', tintBg);
    root.style.setProperty('--accent-tint-bg', tintBg);
    root.style.setProperty('--color-status-completed-bg', tintBg);
  }
}

export function updateRootTheme(tenant: Tenant | null, isSuperAdmin: boolean): void {
  if (isSuperAdmin || !tenant) {
    // Reset to defaults
    applyTheme({});
    return;
  }

  const themeColors: any = {};
  if (tenant.brandColor) themeColors.brandColor = tenant.brandColor;
  if (tenant.darkColor) themeColors.darkColor = tenant.darkColor;
  if (tenant.lightColor) themeColors.lightColor = tenant.lightColor;
  if (tenant.tintBg) themeColors.tintBg = tenant.tintBg;

  applyTheme(themeColors);
}
