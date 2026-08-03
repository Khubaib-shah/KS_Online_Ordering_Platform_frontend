import { Select } from '../../ui/Select';
import React from 'react';
import { Input } from '../../ui/Input';
import { ReusableBarChart } from '../../ui/charts/ReusableBarChart';

interface CategoryContributionChartProps {
  categoryPerformance: Array<{ name: string; value: number }>;
}

export function CategoryContributionChart({ categoryPerformance }: CategoryContributionChartProps) {
  return (
    <ReusableBarChart
      title="Category Performance Contribution"
      description="Gross earnings split among major food groups (karahi, bbq platters, starters)."
      className="lg:col-span-2 flex flex-col justify-between"
      data={categoryPerformance}
      xKey="name"
      yKey="value"
      layout="vertical"
      margin={{ left: 20 }}
      fillColor="#0E4B3E"
      barSize={12}
      radius={[0, 8, 8, 0]}
      xTickFormatter={(v) => `Rs. ${v / 1000}k`}
      tooltipFormatter={(val: any) => [`Rs. ${val.toLocaleString()}`, 'Revenue Contribution']}
    />
  );
}
