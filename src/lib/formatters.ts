import { useTenantStore } from '../store/tenantStore';

export function formatCurrency(value: number): string {
  const state = useTenantStore.getState();
  const symbol = state.activeTenant?.config?.currencySymbol || state.activeTenant?.currency || 'Rs.';
  return `${symbol} ${value.toLocaleString()}`;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

export function formatCompactNumber(num: number): string {
  const absNum = Math.abs(num);
  let result = '';
  
  if (absNum >= 10000000) { // 10 Million
    const val = absNum / 1000000;
    result = val.toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (absNum >= 1000000) { // 1 Million
    const val = absNum / 1000000;
    result = val.toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (absNum >= 100000) { // 100K
    const val = absNum / 1000;
    result = val.toFixed(0) + 'K';
  } else if (absNum >= 1000) { // 1K
    const val = absNum / 1000;
    result = val.toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    result = absNum.toFixed(1).replace(/\.0$/, '');
  }
  
  return num < 0 ? `-${result}` : result;
}

export function formatCompactStatValue(val: string | number): string {
  if (typeof val === 'number') {
    return formatCompactNumber(val);
  }
  
  const trimmed = val.trim();
  const state = useTenantStore.getState();
  const currentSymbol = state.activeTenant?.config?.currencySymbol || state.activeTenant?.currency || 'Rs.';
  
  // Check if it's a Rs. / active currency string
  const escapedSymbol = currentSymbol.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const currencyRegex = new RegExp(`^(${escapedSymbol}|Rs\\.)\\s*([\\d,.-]+)(.*)$`, 'i');
  
  const rsMatch = trimmed.match(currencyRegex);
  if (rsMatch) {
    const numStr = rsMatch[2].replace(/,/g, '');
    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      const formattedNum = formatCompactNumber(num);
      const suffix = rsMatch[3] ? rsMatch[3].trim() : '';
      return `${currentSymbol} ${formattedNum}${suffix ? ' ' + suffix : ''}`;
    }
  }

  // Check if it's a general currency string (e.g. $, ₹, etc.)
  const currencyMatch = trimmed.match(/^([$₹£€])\s*([\d,.-]+)(.*)$/i);
  if (currencyMatch) {
    const symbol = currencyMatch[1];
    const numStr = currencyMatch[2].replace(/,/g, '');
    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      const formattedNum = formatCompactNumber(num);
      const suffix = currencyMatch[3] ? currencyMatch[3].trim() : '';
      return `${symbol}${formattedNum}${suffix ? ' ' + suffix : ''}`;
    }
  }

  // If it's a number followed by a word/suffix (e.g. "123112 orders", "123112 stores")
  const suffixMatch = trimmed.match(/^([\d,.-]+)\s+(.+)$/);
  if (suffixMatch) {
    const numStr = suffixMatch[1].replace(/,/g, '');
    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      const formattedNum = formatCompactNumber(num);
      const label = suffixMatch[2];
      return `${formattedNum} ${label}`;
    }
  }

  // If it's just a formatted number string like "123,112.95"
  const pureNumMatch = trimmed.match(/^([\d,.-]+)$/);
  if (pureNumMatch) {
    const numStr = pureNumMatch[1].replace(/,/g, '');
    const num = parseFloat(numStr);
    if (!isNaN(num)) {
      return formatCompactNumber(num);
    }
  }

  return val;
}

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
