import React from 'react';
import { ReusablePieChart } from '@/components/ui/charts/ReusablePieChart';

interface SalesChannelChartProps {
  channelBreakdown: Array<{ name: string; value: number }>;
}

export function SalesChannelChart({ channelBreakdown }: SalesChannelChartProps) {
  const onlineValue = channelBreakdown.find(c => c.name === 'Online')?.value || 0;
  const totalValue = channelBreakdown.reduce((sum, item) => sum + item.value, 0);
  const onlinePercentage = totalValue > 0 ? Math.round((onlineValue / totalValue) * 100) : 0;

  return (
    <ReusablePieChart
      title="Sales by Channel"
      description="Comparing revenue generated from Online Storefront vs POS."
      className="flex flex-col justify-between animate-fade-in"
      data={channelBreakdown}
      dataKey="value"
      nameKey="name"
      centerText="Online"
      centerValue={`${onlinePercentage}%`}
      height={176}
    />
  );
}
