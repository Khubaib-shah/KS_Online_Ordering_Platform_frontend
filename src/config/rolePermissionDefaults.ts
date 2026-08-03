export interface RolePermission {
  orders: 'View' | 'Manage' | 'None';
  menu: 'View' | 'Manage' | 'None';
  reports: 'View' | 'None';
  settings: 'Manage' | 'None';
}

export type StaffRole = 'Branch Manager' | 'Rider' | 'Kitchen Staff' | 'Cashier' | 'General Staff';

export const ROLE_PERMISSION_DEFAULTS: Record<StaffRole, RolePermission> = {
  'Branch Manager': { orders: 'Manage', menu: 'Manage', reports: 'View', settings: 'None' },
  'Rider': { orders: 'View', menu: 'None', reports: 'None', settings: 'None' },
  'Kitchen Staff': { orders: 'Manage', menu: 'None', reports: 'None', settings: 'None' },
  'Cashier': { orders: 'Manage', menu: 'View', reports: 'None', settings: 'None' },
  'General Staff': { orders: 'View', menu: 'View', reports: 'None', settings: 'None' },
};
