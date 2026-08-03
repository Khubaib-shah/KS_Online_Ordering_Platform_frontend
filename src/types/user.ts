export type GlobalRole = 'SUPER_ADMIN' | 'TENANT_USER';
export type StaffDesignation = 'OWNER' | 'BRANCH_MANAGER' | 'CASHIER' | 'KITCHEN_STAFF' | 'RIDER' | 'GENERAL_STAFF';
export type PermissionLevel = 'NONE' | 'READ' | 'MANAGE';

export interface StaffProfile {
  id: string;
  branchId?: string;
  designation: StaffDesignation;
  permissionOrders: PermissionLevel;
  permissionMenu: PermissionLevel;
  permissionReports: PermissionLevel;
  permissionSettings: PermissionLevel;
}

export interface AdminUser {
  id: string;
  tenantId?: string;
  name: string;
  email: string;
  avatarUrl?: string;
  globalRole: GlobalRole;
  isActive: boolean;
  staffProfile?: StaffProfile;
  role?: string;
  restaurantId?: string;
}
