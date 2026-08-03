import { ReactNode } from 'react';
import {
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  DollarSign,
  ShoppingBag,
  Star,
  Building2,
  Activity,
  Ban,
  Clock
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatCardData } from '@/types/dashboard';
import { cn } from '@/lib/cn';
import { formatCompactStatValue } from '@/lib/formatters';

interface StatCardProps {
  data?: StatCardData;
  isLoading?: boolean;
  onClick?: () => void;
  actionIcon?: ReactNode;
  className?: string;
  key?: string | number;
}

export function StatCard({ data, isLoading = false, onClick, actionIcon, className }: StatCardProps) {
  const isFilled = !isLoading && data?.variant === 'filled';
  const isPositive = !isLoading && data?.trend.direction === 'up';

  // Determine and render subtle background icon
  const renderBgIcon = () => {
    if (isLoading || !data) return null;
    const id = (data.id || '').toLowerCase();
    const title = (data.title || '').toLowerCase();

    let IconComponent = null;

    if (id.includes('revenue') || title.includes('revenue')) {
      IconComponent = DollarSign;
    } else if (id.includes('order') || title.includes('order')) {
      IconComponent = ShoppingBag;
    } else if (id.includes('rating') || title.includes('rating') || title.includes('csat')) {
      IconComponent = Star;
    } else if (id.includes('active') || title.includes('active')) {
      IconComponent = Activity;
    } else if (id.includes('suspended') || title.includes('suspended')) {
      IconComponent = Ban;
    } else if (id.includes('total') || title.includes('store') || id.includes('register')) {
      IconComponent = Building2;
    } else if (id.includes('time') || title.includes('time')) {
      IconComponent = Clock;
    }

    if (!IconComponent) return null;

    return (
      <div className={cn(
        "absolute right-[-10px] bottom-[-15px] pointer-events-none select-none transition-transform duration-300 group-hover:scale-110 z-0",
        isFilled ? "text-white/5" : "text-accent-primary/[0.05]"
      )}>
        <IconComponent size={120} strokeWidth={1} />
      </div>
    );
  };

  return (
    <Card
      id={data ? `stat-${data.id}` : undefined}
      hoverEffect={!isLoading}
      onClick={!isLoading ? onClick : undefined}
      tabIndex={onClick && !isLoading ? 0 : undefined}
      onKeyDown={onClick && !isLoading ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
      className={cn(
        'h-[155px] flex flex-col justify-between select-none p-6 rounded-card relative overflow-hidden group transition-all duration-300 border border-border-subtle shadow-card outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2',
        isFilled
          ? 'bg-accent-primary text-white border-accent-dark shadow-md hover:shadow-lg'
          : 'bg-white hover:bg-surface-hover',
        onClick && !isLoading && 'cursor-pointer active:scale-[0.98]',
        className
      )}
    >
      {renderBgIcon()}

      <div className="relative z-10 flex flex-col justify-between h-full w-full">
        {/* Top Row: Title & Action Circle */}
        <div className="flex items-center justify-between">
          <span
            className={cn(
              'text-[11px] font-sans font-bold uppercase tracking-wider whitespace-nowrap truncate block max-w-[80%]',
              isFilled ? 'text-accent-tint-bg/90' : 'text-text-secondary'
            )}
          >
            {isLoading ? 'Loading Metric...' : data?.title}
          </span>

          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:rotate-12',
              isFilled
                ? 'bg-white/10 text-white border border-white/10'
                : 'bg-surface-muted text-text-secondary border border-border-subtle group-hover:bg-accent-tint-bg group-hover:text-accent-primary group-hover:border-accent-light/30'
            )}
          >
            {actionIcon || <ArrowUpRight size={16} />}
          </div>
        </div>

        {/* Middle Row: Value */}
        <div className="my-1 flex items-baseline">
          {isLoading ? (
            <div className={cn("h-8 w-24 rounded animate-pulse", isFilled ? "bg-white/20" : "bg-slate-200/85")} />
          ) : (
            <h3
              className={cn(
                'font-poppins font-extrabold tracking-tight leading-none text-2xl xl:text-3xl',
                isFilled ? 'text-white' : 'text-text-primary'
              )}
            >
              {data ? formatCompactStatValue(data.value) : ''}
            </h3>
          )}
        </div>

        {/* Bottom Row: Growth Badge & Context */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <>
              <div className={cn("h-5 w-14 rounded-full animate-pulse", isFilled ? "bg-white/20" : "bg-slate-200/85")} />
              <div className={cn("h-3.5 w-20 rounded animate-pulse", isFilled ? "bg-white/10" : "bg-slate-100")} />
            </>
          ) : data?.urgent ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider whitespace-nowrap">
              <AlertCircle size={11} />
              <span>Attention</span>
            </div>
          ) : data ? (
            <>
              <div
                className={cn(
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-extrabold border whitespace-nowrap',
                  isFilled
                    ? 'bg-white/15 text-white border-transparent'
                    : isPositive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-100'
                )}
              >
                {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                <span>
                  {isPositive ? '+' : '-'}
                  {data.trend.percent}%
                </span>
              </div>

              <span
                className={cn(
                  'text-[10px] font-bold whitespace-nowrap truncate max-w-[100px] sm:max-w-[130px] block',
                  isFilled ? 'text-accent-tint-bg/80' : 'text-text-secondary'
                )}
              >
                {data.trend.label}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
