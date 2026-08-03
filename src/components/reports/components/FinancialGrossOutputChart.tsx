import { Select } from '../../ui/Select';
import React from 'react';
import { Input } from '../../ui/Input';
import { ReusableLineChart } from '../../ui/charts/ReusableLineChart';

interface FinancialGrossOutputChartProps {
  revenueTrend: Array<{ date: string; value: number }>;
}

export function FinancialGrossOutputChart({ revenueTrend }: FinancialGrossOutputChartProps) {
  return (
    <ReusableLineChart
      title="Financial Gross Output curve"
      description="Gross earnings over the last 30 operational days (calculated dynamically from completed order streams)."
      className="lg:col-span-2 flex flex-col justify-between animate-fade-in"
      data={revenueTrend}
      xKey="date"
      yKey="value"
      yTickFormatter={(val) => `Rs. ${val / 1000}k`}
      tooltipFormatter={(val: any) => [`Rs. ${val.toLocaleString()}`, 'Revenue']}
      strokeColor="#0E4B3E"
    />
  );
}
