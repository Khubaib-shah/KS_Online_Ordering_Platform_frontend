import { apiClient } from '../api-client';

export interface Shift {
  id: string;
  tenantId: string;
  branchId: string | null;
  userId: string;
  startTime: string;
  endTime: string | null;
  status: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export async function getMyActiveShift(): Promise<Shift | null> {
  const res = await apiClient.get('/shifts/me/active');
  return res.data;
}

export async function getMyPreviousShift(): Promise<Shift | null> {
  const res = await apiClient.get('/shifts/me/previous');
  return res.data;
}

export async function getBranchShifts(branchId: string): Promise<Shift[]> {
  const res = await apiClient.get(`/shifts/branch?branchId=${branchId}`);
  return res.data;
}

export async function getBranchShiftHistory(branchId: string, limit: number = 10): Promise<Shift[]> {
  const res = await apiClient.get(`/shifts/branch/history?branchId=${branchId}&limit=${limit}`);
  return res.data;
}
