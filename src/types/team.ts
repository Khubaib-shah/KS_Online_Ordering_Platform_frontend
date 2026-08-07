export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Staff';
  designation?: 'Branch Manager' | 'Rider' | 'Kitchen Staff' | 'Cashier' | 'General Staff';
  roleId?: string;
  roleName?: string;
  avatarUrl?: string;
  assignedBranchId?: string;
  assignedBranchName?: string;
  permissions: {
    orders: 'View' | 'Manage' | 'None';
    menu: 'View' | 'Manage' | 'None';
    reports: 'View' | 'None';
    settings: 'Manage' | 'None';
  };
  status: 'Active' | 'Pending Invite' | 'Inactive';
  invitedAt: string; // ISO date string
}
