import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReportsData } from '../types/report';
import { reportsApi } from '../lib/api/reports.api';
import { useBranchStore } from '../store/branchStore';

export function useReportsData() {
  // Global date range preset state
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'month' | 'custom'>('30d');
  const { activeBranchFilterId } = useBranchStore();

  const { data: reportsData = null, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', activeBranchFilterId, dateRange],
    queryFn: () => reportsApi.getReports(activeBranchFilterId),
  });

  const exportCsv = async (type: 'orders' | 'items' | 'customers' | 'all') => {
    try {
      return await reportsApi.exportToCsv(type);
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
    refetch,
    exportCsv
  };
}
