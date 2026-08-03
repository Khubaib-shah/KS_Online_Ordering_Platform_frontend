import { Select } from '../../ui/Select';
import React from 'react';
import { Input } from '../../ui/Input';
import { ReusablePieChart } from '../../ui/charts/ReusablePieChart';

interface ServiceChannelSplitChartProps {
  orderTypeBreakdown: Array<{ name: string; value: number }>;
}

export function ServiceChannelSplitChart({ orderTypeBreakdown }: ServiceChannelSplitChartProps) {
  const deliveryValue = orderTypeBreakdown[0]?.value || 0;
  const collectionValue = orderTypeBreakdown[1]?.value || 0;
  const totalValue = deliveryValue + collectionValue;
  const deliveryPercentage = totalValue > 0 ? Math.round((deliveryValue / totalValue) * 100) : 0;

  return (
    <ReusablePieChart
      title="Service Channel Split"
      description="Comparing total checkout delivery fulfillments with self-collects."
      className="flex flex-col justify-between animate-fade-in"
      data={orderTypeBreakdown}
      dataKey="value"
      nameKey="name"
      centerText="Delivery"
      centerValue={`${deliveryPercentage}%`}
      height={176}
    />
  );
}
