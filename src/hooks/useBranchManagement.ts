import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useBranchStore } from '../store/branchStore';
import { useUIStore } from '../store/uiStore';
import { useMenuItems } from './useMenuItems';
import { useTeam } from './useTeam';
import { Branch } from '../types/branch';
import { ROLE_PERMISSION_DEFAULTS } from '../config/rolePermissionDefaults';

export function useBranchManagement() {
  const { currentUser } = useAuthStore();
  const {
    branches,
    inventory,
    stockMovements,
    disabledProducts,
    saveBranch,
    deleteBranch,
    addStockMovement,
    toggleProductBranch
  } = useBranchStore();
  const { addToast } = useUIStore();

  const { items: menuItems, isLoading: isMenuLoading } = useMenuItems();
  const { team, inviteMember, updateTeamMember, revokeAccess } = useTeam();

  const [activeTab, setActiveTab] = useState<'list' | 'catalog' | 'inventory' | 'history' | 'staff'>('list');
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id || '');

  // Staff management states
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff' as 'Staff' | 'Owner',
    designation: 'General Staff' as 'Branch Manager' | 'Rider' | 'Kitchen Staff' | 'Cashier' | 'General Staff',
    assignedBranchId: 'all',
    permissions: {
      orders: 'View' as 'View' | 'Manage' | 'None',
      menu: 'View' as 'View' | 'Manage' | 'None',
      reports: 'View' as 'View' | 'None',
      settings: 'None' as 'Manage' | 'None'
    }
  });

  // Permission Drawer States
  const [rolePermissionsTemplates, setRolePermissionsTemplates] = useState<{
    [key: string]: {
      orders: 'View' | 'Manage' | 'None';
      menu: 'View' | 'Manage' | 'None';
      reports: 'View' | 'None';
      settings: 'Manage' | 'None';
    };
  }>(() => {
    const saved = localStorage.getItem('indolj_role_permissions_templates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return ROLE_PERMISSION_DEFAULTS;
  });

  const [selectedDrawerRole, setSelectedDrawerRole] = useState<'Branch Manager' | 'Rider' | 'Kitchen Staff' | 'Cashier' | 'General Staff'>('Branch Manager');
  const [drawerActiveTab, setDrawerActiveTab] = useState<'roles' | 'staff' | 'form'>('roles');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>('');
  const [syncRoleToStaff, setSyncRoleToStaff] = useState<boolean>(true);
  const [isPermissionDrawerOpen, setIsPermissionDrawerOpen] = useState(false);
  const [drawerTargetType, setDrawerTargetType] = useState<'create_staff' | 'edit_staff'>('create_staff');
  const [drawerStaffId, setDrawerStaffId] = useState<string | null>(null);
  const [drawerStaffName, setDrawerStaffName] = useState<string>('');
  const [drawerPermissions, setDrawerPermissions] = useState({
    orders: 'None' as 'View' | 'Manage' | 'None',
    menu: 'None' as 'View' | 'Manage' | 'None',
    reports: 'None' as 'View' | 'None',
    settings: 'None' as 'Manage' | 'None'
  });

  // Custom Revoke Confirm Modal States
  const [isRevokeConfirmOpen, setIsRevokeConfirmOpen] = useState(false);
  const [staffToRevoke, setStaffToRevoke] = useState<{ id: string; name: string } | null>(null);

  // Branch editing/creation states
  const [isEditing, setIsEditing] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Partial<Branch> | null>(null);

  // Stock movement adjustment states
  const [adjustingItemId, setAdjustingItemId] = useState<string | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  const handleToggleBranchStatus = async (branchId: string) => {
    const branch = branches.find((b) => b.id === branchId);
    if (branch) {
      const newStatus = branch.status === 'active' ? 'inactive' : 'active';
      addToast(`${branch.name} is now ${newStatus === 'active' ? 'Active' : 'Inactive'}`, 'info');
      await saveBranch({ ...branch, status: newStatus as 'active' | 'inactive' });
    }
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch);
    setIsEditing(true);
  };

  const handleAddBranch = () => {
    if (branches.length >= 5) {
      addToast('Maximum limit of 5 branches reached.', 'error');
      return;
    }
    setEditingBranch({
      id: `branch-${Date.now()}`,
      name: '',
      address: '',
      area: '',
      city: 'Karachi',
      phone: '',
      whatsapp: '',
      status: 'active'
    });
    setIsEditing(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch || !editingBranch.name || !editingBranch.area) {
      addToast('Please fill out Name and Area.', 'error');
      return;
    }

    if (!branches.some(b => b.id === editingBranch.id) && branches.length >= 5) {
      addToast('Maximum limit of 5 branches reached.', 'error');
      return;
    }

    await saveBranch(editingBranch as Branch);
    addToast('Branch saved successfully', 'success');

    setIsEditing(false);
    setEditingBranch(null);
  };

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItemId || adjustQty <= 0 || !adjustReason) {
      addToast('Please input a valid quantity and reason.', 'error');
      return;
    }

    const invItem = inventory.find((i) => i.id === adjustingItemId);
    if (!invItem) return;

    addStockMovement(invItem.branchId, invItem.itemName, adjustType, adjustQty, adjustReason);

    // Reset Form
    setAdjustingItemId(null);
    setAdjustQty(0);
    setAdjustReason('');
  };

  const applyDefaultPermissions = (role: 'Staff' | 'Owner', designation: string) => {
    if (role === 'Owner') {
      return {
        orders: 'Manage' as const,
        menu: 'Manage' as const,
        reports: 'View' as const,
        settings: 'Manage' as const
      };
    }
    return rolePermissionsTemplates[designation] || {
      orders: 'View' as const,
      menu: 'View' as const,
      reports: 'None' as const,
      settings: 'None' as const
    };
  };

  const handleRoleChange = (role: 'Staff' | 'Owner') => {
    const updatedPermissions = applyDefaultPermissions(role, staffForm.designation);
    setStaffForm(prev => ({
      ...prev,
      role,
      permissions: updatedPermissions
    }));
  };

  const handleDesignationChange = (designation: 'Branch Manager' | 'Rider' | 'Kitchen Staff' | 'Cashier' | 'General Staff') => {
    const updatedPermissions = applyDefaultPermissions(staffForm.role, designation);
    setStaffForm(prev => ({
      ...prev,
      designation,
      permissions: updatedPermissions
    }));
  };

  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffForm({
      name: '',
      email: '',
      password: '',
      role: 'Staff',
      designation: 'General Staff',
      assignedBranchId: branches[0]?.id || 'all',
      permissions: {
        orders: 'View',
        menu: 'View',
        reports: 'None',
        settings: 'None'
      }
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (member: any) => {
    setEditingStaffId(member.id);
    setStaffForm({
      name: member.name,
      email: member.email,
      password: '',
      role: member.role,
      designation: member.designation || 'General Staff',
      assignedBranchId: member.assignedBranchId || 'all',
      permissions: { ...member.permissions }
    });
    setIsStaffModalOpen(true);
  };

  const handleSaveStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.name || !staffForm.email) {
      addToast('Please fill out Name and Email.', 'error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(staffForm.email)) {
      addToast('Please enter a valid email address.', 'error');
      return;
    }

    if (!editingStaffId) {
      if (!staffForm.password) {
        addToast('Please enter an initial password for the staff member.', 'error');
        return;
      }
      if (staffForm.password.length < 6) {
        addToast('Password must be at least 6 characters long.', 'error');
        return;
      }
    }

    const assignedBranchName = staffForm.assignedBranchId === 'all'
      ? 'All Branches'
      : (branches.find(b => b.id === staffForm.assignedBranchId)?.name || 'Gulshan Branch');

    try {
      if (editingStaffId) {
        await updateTeamMember(editingStaffId, {
          name: staffForm.name,
          email: staffForm.email,
          role: staffForm.role,
          designation: staffForm.designation,
          assignedBranchId: staffForm.assignedBranchId,
          assignedBranchName,
          permissions: staffForm.permissions
        });
        addToast('Staff member updated successfully', 'success');
      } else {
        await inviteMember({
          name: staffForm.name,
          email: staffForm.email,
          password: staffForm.password,
          role: staffForm.role,
          designation: staffForm.designation,
          assignedBranchId: staffForm.assignedBranchId,
          assignedBranchName,
          permissions: staffForm.permissions
        });
        addToast('Staff invited and assigned successfully', 'success');
      }
      setIsStaffModalOpen(false);
    } catch (err) {
      addToast('Failed to save staff member', 'error');
    }
  };

  const handleRevokeStaff = (id: string, name: string) => {
    setStaffToRevoke({ id, name });
    setIsRevokeConfirmOpen(true);
  };

  const confirmRevokeStaff = async () => {
    if (!staffToRevoke) return;
    try {
      await revokeAccess(staffToRevoke.id);
      addToast(`Access revoked for ${staffToRevoke.name}`, 'info');
    } catch (e) {
      addToast('Failed to revoke staff access', 'error');
    } finally {
      setIsRevokeConfirmOpen(false);
      setStaffToRevoke(null);
    }
  };

  const handleDrawerRoleChange = (designation: 'Branch Manager' | 'Rider' | 'Kitchen Staff' | 'Cashier' | 'General Staff') => {
    setSelectedDrawerRole(designation);
    const currentPerms = rolePermissionsTemplates[designation] || {
      orders: 'View' as const,
      menu: 'View' as const,
      reports: 'None' as const,
      settings: 'None' as const
    };
    setDrawerPermissions(currentPerms);
  };

  const handleAssigneeChange = (assigneeId: string) => {
    setSelectedAssigneeId(assigneeId);
    if (!assigneeId) return;
    const member = team.find(m => m.id === assigneeId);
    if (member) {
      setDrawerPermissions({ ...member.permissions });
    }
  };

  const openPermissionDrawerForHub = () => {
    setDrawerActiveTab('roles');
    const currentDesignation = 'Branch Manager';
    setSelectedDrawerRole(currentDesignation);
    setDrawerPermissions({ ...rolePermissionsTemplates[currentDesignation] });

    if (team && team.length > 0) {
      setSelectedAssigneeId(team[0].id);
    } else {
      setSelectedAssigneeId('');
    }

    setIsPermissionDrawerOpen(true);
  };

  const openPermissionDrawerForActiveForm = () => {
    setDrawerActiveTab('form');
    setDrawerPermissions({ ...staffForm.permissions });
    setIsPermissionDrawerOpen(true);
  };

  const openPermissionDrawerForRoster = (member: any) => {
    setDrawerActiveTab('staff');
    setSelectedAssigneeId(member.id);
    setDrawerPermissions({ ...member.permissions });
    setIsPermissionDrawerOpen(true);
  };

  const handleSaveDrawerPermissions = async () => {
    if (drawerActiveTab === 'roles') {
      const updatedTemplates = {
        ...rolePermissionsTemplates,
        [selectedDrawerRole]: { ...drawerPermissions }
      };
      setRolePermissionsTemplates(updatedTemplates);
      localStorage.setItem('indolj_role_permissions_templates', JSON.stringify(updatedTemplates));

      if (staffForm.designation === selectedDrawerRole) {
        setStaffForm(prev => ({
          ...prev,
          permissions: { ...drawerPermissions }
        }));
      }

      let syncCount = 0;
      if (syncRoleToStaff) {
        const membersToUpdate = team.filter(m => m.designation === selectedDrawerRole);
        for (const m of membersToUpdate) {
          try {
            await updateTeamMember(m.id, { permissions: drawerPermissions });
            syncCount++;
          } catch (err) {
            console.error(`Failed to sync permissions for ${m.name}:`, err);
          }
        }
      }

      if (syncCount > 0) {
        addToast(`Default permissions for ${selectedDrawerRole} updated & synced with ${syncCount} staff members.`, 'success');
      } else {
        addToast(`Default permissions for ${selectedDrawerRole} updated successfully.`, 'success');
      }
    } else if (drawerActiveTab === 'form') {
      setStaffForm(prev => ({
        ...prev,
        permissions: { ...drawerPermissions }
      }));
      addToast('Custom granular permissions applied to staff invite form.', 'success');
    } else {
      if (!selectedAssigneeId) {
        addToast('Please select a staff member to assign permissions.', 'error');
        return;
      }
      const member = team.find(m => m.id === selectedAssigneeId);
      if (!member) {
        addToast('Selected staff member not found.', 'error');
        return;
      }
      try {
        await updateTeamMember(selectedAssigneeId, { permissions: drawerPermissions });
        addToast(`Custom permissions assigned to ${member.name} (${member.designation || 'Staff'})`, 'success');
      } catch (err) {
        addToast(`Failed to assign permissions to ${member.name}`, 'error');
      }
    }
    setIsPermissionDrawerOpen(false);
  };

  const currentBranchObj = branches.find((b) => b.id === selectedBranchId) || branches[0];
  const filteredInventory = inventory.filter((i) => i.branchId === selectedBranchId);
  const filteredMovements = stockMovements.filter((m) => m.branchId === selectedBranchId);

  return {
    currentUser,
    branches,
    inventory,
    stockMovements,
    disabledProducts,
    saveBranch,
    deleteBranch,
    addStockMovement,
    toggleProductBranch,
    addToast,
    menuItems,
    isMenuLoading,
    team,
    inviteMember,
    updateTeamMember,
    revokeAccess,
    activeTab,
    setActiveTab,
    selectedBranchId,
    setSelectedBranchId,
    isStaffModalOpen,
    setIsStaffModalOpen,
    editingStaffId,
    setEditingStaffId,
    staffForm,
    setStaffForm,
    rolePermissionsTemplates,
    setRolePermissionsTemplates,
    selectedDrawerRole,
    setSelectedDrawerRole,
    drawerActiveTab,
    setDrawerActiveTab,
    selectedAssigneeId,
    setSelectedAssigneeId,
    syncRoleToStaff,
    setSyncRoleToStaff,
    isPermissionDrawerOpen,
    setIsPermissionDrawerOpen,
    drawerTargetType,
    setDrawerTargetType,
    drawerStaffId,
    setDrawerStaffId,
    drawerStaffName,
    setDrawerStaffName,
    drawerPermissions,
    setDrawerPermissions,
    isRevokeConfirmOpen,
    setIsRevokeConfirmOpen,
    staffToRevoke,
    setStaffToRevoke,
    isEditing,
    setIsEditing,
    editingBranch,
    setEditingBranch,
    adjustingItemId,
    setAdjustingItemId,
    adjustType,
    setAdjustType,
    adjustQty,
    setAdjustQty,
    adjustReason,
    setAdjustReason,
    handleToggleBranchStatus,
    handleEditBranch,
    handleAddBranch,
    handleSaveBranch,
    handleAdjustStockSubmit,
    applyDefaultPermissions,
    handleRoleChange,
    handleDesignationChange,
    handleOpenAddStaff,
    handleOpenEditStaff,
    handleSaveStaffSubmit,
    handleRevokeStaff,
    confirmRevokeStaff,
    handleDrawerRoleChange,
    handleAssigneeChange,
    openPermissionDrawerForHub,
    openPermissionDrawerForActiveForm,
    openPermissionDrawerForRoster,
    handleSaveDrawerPermissions,
    currentBranchObj,
    filteredInventory,
    filteredMovements
  };
}
