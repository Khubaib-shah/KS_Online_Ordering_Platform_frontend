import { Select } from '../Select';
import React from 'react';
import { Input } from '../Input';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BaseCard } from '../BaseCard';
import { Skeleton } from '../Skeleton';
import { useTenantStore } from '../../../store/tenantStore';;

interface ReusableBarChartProps {
  title?: string;
  description?: string;
  data: any[] | null;
  xKey: string;
  yKey: string;
  layout?: 'horizontal' | 'vertical';
  margin?: { top?: number; right?: number; left?: number; bottom?: number };
  fillColor?: string;
  barSize?: number;
  radius?: [number, number, number, number];
  xTickFormatter?: (val: any) => string;
  yTickFormatter?: (val: any) => string;
  tooltipFormatter?: (val: any) => [string, string] | string;
  className?: string;
  height?: number;
  isLoading?: boolean;
}

export function ReusableBarChart({
  title,
  description,
  data,
  xKey,
  yKey,
  layout = 'horizontal',
  margin,
  fillColor = '#0E4B3E',
  barSize = 12,
  radius,
  xTickFormatter,
  yTickFormatter,
  tooltipFormatter,
  className,
  height = 256,
  isLoading = false,
}: ReusableBarChartProps) {
    const { activeTenantId } = useTenantStore();;
  const [currentColor, setCurrentColor] = React.useState(fillColor);

  React.useEffect(() => {
    const rootColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-primary').trim();
    if (rootColor) {
      setCurrentColor(rootColor);
    } else {
      setCurrentColor(fillColor);
    }
  }, [fillColor, activeTenantId]);

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

  const defaultRadius: [number, number, number, number] = layout === 'vertical' ? [0, 8, 8, 0] : [8, 8, 0, 0];
  const chartMargin = margin || (layout === 'vertical' ? { left: 20 } : { top: 10, right: 10, left: -20, bottom: 0 });

  const chartElement = (
    <div style={{ height: `${height}px` }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={layout} margin={chartMargin}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis
            type={layout === 'vertical' ? 'number' : 'category'}
            dataKey={layout === 'vertical' ? undefined : xKey}
            tickLine={false}
            tickFormatter={xTickFormatter}
            style={{ fontSize: '10px', fill: '#888888', fontWeight: 600 }}
          />
          <YAxis
            type={layout === 'vertical' ? 'category' : 'number'}
            dataKey={layout === 'vertical' ? xKey : undefined}
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
          <Bar
            dataKey={yKey}
            fill={currentColor}
            radius={radius || defaultRadius}
            barSize={barSize}
          />
        </BarChart>
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
