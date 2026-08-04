import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportsData } from '../types/report';
import { reportsApi } from '../lib/api/reports.api';
import { useBranchStore } from '../store/branchStore';

export function useReportsData() {
  // Global date range preset state
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'month' | 'custom'>('30d');
  const { activeBranchFilterId } = useBranchStore();

  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const { data: reportsData = null, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', activeBranchFilterId, dateRange, customStartDate, customEndDate],
    queryFn: () => reportsApi.getReports(activeBranchFilterId, dateRange, customStartDate, customEndDate),
  });

  const exportCsv = async (type: 'orders' | 'items' | 'customers' | 'all') => {
    try {
      return await reportsApi.exportToCsv(type, dateRange, customStartDate, customEndDate);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return {
    reportsData,
    isLoading,
    error,
    dateRange,
    setDateRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    refetch,
    exportCsv
  };
}
