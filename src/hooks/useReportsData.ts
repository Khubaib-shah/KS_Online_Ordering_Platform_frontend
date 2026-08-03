import { useState, useEffect, useCallback } from 'react';
import { ReportsData } from '../types/report';
import { reportsApi } from '../lib/api/reports.api';
import { useBranchStore } from '../store/branchStore';;

export function useReportsData() {
  const [reportsData, setReportsData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Global date range preset state
  const [dateRange, setDateRange] = useState<'today' | '7d' | '30d' | 'month' | 'custom'>('30d');

    const { activeBranchFilterId } = useBranchStore();;

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reportsApi.getReports(activeBranchFilterId);
      setReportsData(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [activeBranchFilterId]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, dateRange, activeBranchFilterId]); // Refetch if date range or branch changes

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
    refetch: fetchReports,
    exportCsv
  };
}
