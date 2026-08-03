import { Select } from '../Select';
import React from 'react';
import { Input } from '../Input';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BaseCard } from '../BaseCard';
import { Skeleton } from '../Skeleton';
import { useTenantStore } from '../../../store/tenantStore';;

interface ReusableAreaChartProps {
  title?: string;
  description?: string;
  data: any[] | null;
  xKey: string;
  yKey: string;
  gradientId?: string;
  strokeColor?: string;
  yTickFormatter?: (val: any) => string;
  tooltipFormatter?: (val: any) => [string, string] | string;
  className?: string;
  height?: number;
  isLoading?: boolean;
}

export function ReusableAreaChart({
  title,
  description,
  data,
  xKey,
  yKey,
  gradientId = 'colorAreaDefault',
  strokeColor = '#0E4B3E',
  yTickFormatter,
  tooltipFormatter,
  className,
  height = 256,
  isLoading = false,
}: ReusableAreaChartProps) {
  const { activeTenantId } = useTenantStore();;
  const [currentColor, setCurrentColor] = React.useState(strokeColor);

  React.useEffect(() => {
    const rootColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-primary').trim();
    if (rootColor) {
      setCurrentColor(rootColor);
    } else {
      setCurrentColor(strokeColor);
    }
  }, [strokeColor, activeTenantId]);

  if (isLoading || !data) {
    return (
      <BaseCard
        title={title}
        description={description}
        className={className}
        contentClassName="mt-4"
      >
        <div style={{ height: `${height}px` }} className="w-full flex items-center justify-center">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
      </BaseCard>
    );
  }

  const chartElement = (
    <div style={{ height: `${height}px` }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={currentColor} stopOpacity={0.2} />
              <stop offset="95%" stopColor={currentColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            style={{ fontSize: '10px', fill: '#888888', fontWeight: 600 }}
          />
          <YAxis
            tickLine={false}
            tickFormatter={yTickFormatter}
            style={{ fontSize: '10px', fill: '#888888', fontWeight: 600 }}
          />
          <Tooltip
            formatter={tooltipFormatter as any}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              fontSize: '12px',
              fontFamily: 'Inter',
            }}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={currentColor}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#${gradientId})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );

  if (title) {
    return (
      <BaseCard
        title={title}
        description={description}
        className={className}
        contentClassName="mt-4"
      >
        {chartElement}
      </BaseCard>
    );
  }

  return chartElement;
}
