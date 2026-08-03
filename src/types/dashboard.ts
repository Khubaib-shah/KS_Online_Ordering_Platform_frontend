export interface StatCardData {
  id: string;
  title: string;
  value: number | string;
  format: 'currency' | 'number' | 'percent';
  trend: { direction: 'up' | 'down'; percent: number; label: string };
  variant: 'filled' | 'white';
  urgent?: boolean; // true for "Pending Orders" if value > threshold
}

export interface AnalyticsDataPoint {
  day: string; // 'S' | 'M' | 'T' | 'W' | 'T' | 'F' | 'S'
  value: number; // order count
  fillStyle: 'striped' | 'solid-light' | 'solid-dark';
  highlightBadge?: string; // e.g. "74%" — only on the peak day
}

export interface ProgressData {
  percent: number;
  label: string;
  segments: { label: string; color: string; value: number }[];
}

export interface ActionItem {
  id: string;
  title: string;
  dueLabel: string;
  iconKey: string; // maps to a Lucide icon + tint color pair
}

export interface ReminderData {
  title: string;
  timeRange: string;
  ctaLabel: string;
}
