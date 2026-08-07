import { TeamMember } from '../../types/team';
import { apiClient } from '../api-client';

const mapDesignationToFrontend = (d: string): TeamMember['designation'] => {
  switch (d) {
    case 'OWNER': return 'Owner' as any; // Owner isn't in designation type but role, we just fallback
    case 'BRANCH_MANAGER': return 'Branch Manager';
    case 'CASHIER': return 'Cashier';
    case 'KITCHEN_STAFF': return 'Kitchen Staff';
    case 'RIDER': return 'Rider';
    default: return 'General Staff';
  }
};

const mapDesignationToBackend = (d: string) => {
  switch (d) {
    case 'Branch Manager': return 'BRANCH_MANAGER';
    case 'Cashier': return 'CASHIER';
    case 'Kitchen Staff': return 'KITCHEN_STAFF';
    case 'Rider': return 'RIDER';
    default: return 'GENERAL_STAFF';
  }
};

const formatPermission = (perm: string): 'View' | 'Manage' | 'None' => {
  if (perm === 'READ') return 'View';
  if (perm === 'MANAGE') return 'Manage';
  return 'None';
};

const parsePermission = (perm: 'View' | 'Manage' | 'None'): 'NONE' | 'READ' | 'MANAGE' => {
  if (perm === 'View') return 'READ';
  if (perm === 'Manage') return 'MANAGE';
  return 'NONE';
};

const mapBackendTeamToFrontend = (backendStaff: any): TeamMember => {
  return {
    id: backendStaff.id, // Using staff profile ID as the team member ID for updates
    name: backendStaff.user?.name || '',
    email: backendStaff.user?.email || '',
    role: backendStaff.designation === 'OWNER' ? 'Owner' : 'Staff',
    designation: mapDesignationToFrontend(backendStaff.designation),
    roleId: backendStaff.roleId,
    roleName: backendStaff.role?.name,
    avatarUrl: backendStaff.user?.avatarUrl,
    assignedBranchId: backendStaff.branchId || 'all',
    assignedBranchName: backendStaff.branch?.name,
    permissions: {
      orders: formatPermission(backendStaff.permissionOrders),
      menu: formatPermission(backendStaff.permissionMenu),
      reports: formatPermission(backendStaff.permissionReports) as 'View' | 'None',
      settings: formatPermission(backendStaff.permissionSettings) as 'Manage' | 'None',
    },
    status: backendStaff.user?.isActive ? 'Active' : 'Inactive',
    invitedAt: new Date().toISOString(), // Mocked as backend doesn't track invite date separately yet
    // Store user ID for deactivate endpoint
    _userId: backendStaff.user?.id
  } as TeamMember & { _userId: string };
};

export const teamApi = {
  getTeam: async (): Promise<TeamMember[]> => {
    const res = await apiClient.get('/team?limit=100');
    return Array.isArray(res) ? res.map(mapBackendTeamToFrontend) : [];
  },

  inviteMember: async (member: Omit<TeamMember, 'id' | 'invitedAt' | 'status'> & { password?: string }): Promise<TeamMember> => {
    const payload = {
      email: member.email,
      name: member.name,
      password: member.password || 'TemporaryPassword123!',
      designation: mapDesignationToBackend(member.designation || 'General Staff'),
      roleId: member.roleId,
      branchId: member.assignedBranchId === 'all' ? undefined : member.assignedBranchId,
      permissionOrders: parsePermission(member.permissions.orders),
      permissionMenu: parsePermission(member.permissions.menu),
      permissionReports: parsePermission(member.permissions.reports),
      permissionSettings: parsePermission(member.permissions.settings),
    };

    const res = await apiClient.post<any, { staffProfile: any }>('/team/invite', payload);
    return mapBackendTeamToFrontend(res.staffProfile || res);
  },

  updatePermissions: async (id: string, permissions: TeamMember['permissions']): Promise<TeamMember> => {
    const payload = {
      permissionOrders: parsePermission(permissions.orders),
      permissionMenu: parsePermission(permissions.menu),
      permissionReports: parsePermission(permissions.reports),
      permissionSettings: parsePermission(permissions.settings),
    };
    const res = await apiClient.put(`/team/${id}/permissions`, payload);
    return mapBackendTeamToFrontend(res);
  },

  updateTeamMember: async (id: string, updatedFields: Partial<TeamMember>): Promise<TeamMember> => {
    // Currently backend only supports updating permissions via staff ID.
    // Full user profile update (name, email) isn't exposed in staff routes.
    // We will do a partial update of the permissions and designation.
    const payload: any = {};
    if (updatedFields.designation) payload.designation = mapDesignationToBackend(updatedFields.designation);
    if (updatedFields.roleId !== undefined) payload.roleId = updatedFields.roleId;
    if (updatedFields.assignedBranchId) payload.branchId = updatedFields.assignedBranchId === 'all' ? null : updatedFields.assignedBranchId;
    if (updatedFields.permissions) {
      payload.permissionOrders = parsePermission(updatedFields.permissions.orders);
      payload.permissionMenu = parsePermission(updatedFields.permissions.menu);
      payload.permissionReports = parsePermission(updatedFields.permissions.reports);
      payload.permissionSettings = parsePermission(updatedFields.permissions.settings);
    }

    const res = await apiClient.put(`/team/${id}/permissions`, payload);
    return mapBackendTeamToFrontend(res);
  },

  revokeAccess: async (id: string): Promise<void> => {
    const team = await teamApi.getTeam();
    const member = team.find(m => m.id === id) as any;
    if (!member || !member._userId) {
      throw new Error("User ID is required to revoke access.");
    }
    await apiClient.patch(`/team/${member._userId}/deactivate`);
  }
};
