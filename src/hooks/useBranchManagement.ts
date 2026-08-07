import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useBranchStore } from '../store/branchStore';
import { useUIStore } from '../store/uiStore';
import { useMenuItems } from './useMenuItems';
import { useTeam } from './useTeam';
import { Branch } from '../types/branch';
import { rolesApi, Role } from '../lib/api/roles.api';

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
  const [isStaffSubmitting, setIsStaffSubmitting] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '' as string | undefined,
    assignedBranchId: 'all',
    permissions: {
      orders: 'View' as 'View' | 'Manage' | 'None',
      menu: 'View' as 'View' | 'Manage' | 'None',
      reports: 'View' as 'View' | 'None',
      settings: 'None' as 'Manage' | 'None'
    }
  });

  const [customRoles, setCustomRoles] = useState<Role[]>([]);

  useEffect(() => {
    rolesApi.getRoles().then(setCustomRoles).catch(console.error);
  }, []);



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


  const handleCustomRoleChange = (roleId: string) => {
    const role = customRoles.find(r => r.id === roleId);
    const getPerm = (moduleKey: string): 'Manage' | 'View' | 'None' => {
      let rolePerms: any = role?.permissions || {};
      if (typeof rolePerms === 'string') {
        try {
          rolePerms = JSON.parse(rolePerms);
        } catch (e) {
          rolePerms = {};
        }
      }
      
      const perms = rolePerms[moduleKey] || rolePerms[moduleKey.charAt(0).toUpperCase() + moduleKey.slice(1)] || [];
      if (!Array.isArray(perms)) return 'None';
      if (perms.includes('Create') || perms.includes('Update') || perms.includes('Delete') || perms.includes('Manage')) return 'Manage';
      if (perms.includes('Read') || perms.includes('View')) return 'View';
      return 'None';
    };

    setStaffForm(prev => ({
      ...prev,
      roleId,
      permissions: role?.permissions ? {
        orders: getPerm('orders'),
        menu: getPerm('menu'),
        reports: getPerm('reports') === 'Manage' ? 'View' : (getPerm('reports') as 'View' | 'None'),
        settings: getPerm('settings') === 'View' ? 'None' : (getPerm('settings') as 'Manage' | 'None'),
      } : {
        orders: 'None',
        menu: 'None',
        reports: 'None',
        settings: 'None'
      }
    }));
  };

  const handleOpenAddStaff = () => {
    setEditingStaffId(null);
    setStaffForm({
      name: '',
      email: '',
      password: '',
      roleId: '',
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
      roleId: member.roleId || '',
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

    setIsStaffSubmitting(true);
    try {
      if (editingStaffId) {
        await updateTeamMember(editingStaffId, {
          name: staffForm.name,
          email: staffForm.email,
          roleId: staffForm.roleId,
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
          role: 'Staff', // Default system role
          roleId: staffForm.roleId,
          assignedBranchId: staffForm.assignedBranchId,
          assignedBranchName,
          permissions: staffForm.permissions
        });
        addToast('Staff invited and assigned successfully', 'success');
      }
      setIsStaffModalOpen(false);
    } catch (err) {
      addToast('Failed to save staff member', 'error');
    } finally {
      setIsStaffSubmitting(false);
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
    isStaffSubmitting,
    editingStaffId,
    setEditingStaffId,
    staffForm,
    setStaffForm,
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
    handleOpenAddStaff,
    handleOpenEditStaff,
    handleSaveStaffSubmit,
    handleRevokeStaff,
    confirmRevokeStaff,
    currentBranchObj,
    filteredInventory,
    filteredMovements,
    customRoles,
    handleCustomRoleChange
  };
}
