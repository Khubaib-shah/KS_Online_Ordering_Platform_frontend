import { Select } from '../Select';
import React from 'react';
import { Input } from '../Input';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { BaseCard } from '../BaseCard';
import { Skeleton } from '../Skeleton';
import { useTenantStore } from '../../../store/tenantStore';;

interface ReusablePieChartProps {
  title?: string;
  description?: string;
  data: any[] | null;
  dataKey: string;
  nameKey?: string;
  colors?: string[];
  innerRadius?: number;
  outerRadius?: number;
  centerText?: string;
  centerValue?: string | number;
  showLegend?: boolean;
  className?: string;
  height?: number;
  isLoading?: boolean;
}

const DEFAULT_PIE_COLORS = ['#0E4B3E', '#CA8A04', '#2563EB', '#4F46E5', '#DC2626'];

export function ReusablePieChart({
  title,
  description,
  data,
  dataKey,
  nameKey = 'name',
  colors = DEFAULT_PIE_COLORS,
  innerRadius = 55,
  outerRadius = 75,
  centerText,
  centerValue,
  showLegend = true,
  className,
  height = 176,
  isLoading = false,
}: ReusablePieChartProps) {
    const { activeTenantId } = useTenantStore();;
  const [pieColors, setPieColors] = React.useState(colors);

  React.useEffect(() => {
    const rootColor = getComputedStyle(document.documentElement).getPropertyValue('--color-accent-primary').trim();
    if (rootColor) {
      const updated = [...colors];
      if (colors === DEFAULT_PIE_COLORS) {
        updated[0] = rootColor;
      }
      setPieColors(updated);
    } else {
      setPieColors(colors);
    }
  }, [colors, activeTenantId]);

  if (isLoading || !data) {
    return (
      <BaseCard
        title={title}
        description={description}
        className={className}
        contentClassName="mt-4 flex flex-col justify-between h-full"
      >
        <div style={{ height: `${height}px` }} className="w-full flex items-center justify-center">
          <Skeleton className="w-full h-full rounded-xl" />
        </div>
      </BaseCard>
    );
  }

  const chartElement = (
    <div className="flex flex-col justify-between h-full">
      <div style={{ height: `${height}px` }} className="w-full relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || pieColors[index % pieColors.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '14px',
                border: 'none',
                color: '#fff',
                fontSize: '11px',
                fontWeight: '700',
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label (if provided) */}
        {(centerText || centerValue !== undefined) && (
          <div className="absolute text-center">
            {centerText && (
              <span className="block text-[10px] uppercase font-bold text-text-secondary">
                {centerText}
              </span>
            )}
            {centerValue !== undefined && (
              <span className="text-xl font-bold font-poppins text-text-primary">
                {centerValue}
              </span>
            )}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold text-text-primary mt-4 select-none">
          {data.map((item, idx) => (
            <div key={item[nameKey]} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: item.color || pieColors[idx % pieColors.length] }}
              />
              <span>
                {item[nameKey]} ({item[dataKey]})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (title) {
    return (
      <BaseCard
        title={title}
        description={description}
        className={className}
        contentClassName="mt-4 flex flex-col justify-between h-full"
      >
        {chartElement}
      </BaseCard>
    );
  }

  return chartElement;
}
