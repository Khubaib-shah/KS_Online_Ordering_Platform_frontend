import { Select } from '../Select';
import React from 'react';
import { Input } from '../Input';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { BaseCard } from '../BaseCard';
import { Skeleton } from '../Skeleton';
import { useTenantStore } from '../../../store/tenantStore';;

interface ReusableLineChartProps {
  title?: string;
  description?: string;
  data: any[] | null;
  xKey: string;
  yKey: string;
  yTickFormatter?: (val: any) => string;
  tooltipFormatter?: (val: any) => [string, string] | string;
  strokeColor?: string;
  className?: string;
  height?: number;
  isLoading?: boolean;
}

export function ReusableLineChart({
  title,
  description,
  data,
  xKey,
  yKey,
  yTickFormatter,
  tooltipFormatter,
  strokeColor = '#0E4B3E',
  className,
  height = 256,
  isLoading = false,
}: ReusableLineChartProps) {
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
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={currentColor}
            strokeWidth={3}
            dot={{ r: 2, fill: currentColor }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
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
