import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Shield,
  UserPlus,
  Edit,
  Trash2,
  Store,
  AlertCircle,
  X
} from 'lucide-react';
import { isOwner } from '@/lib/security';
import { Branch } from '@/types/branch';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { InputField } from '@/components/ui/forms/InputField';

interface BranchStaffTabProps {
  currentUser: any;
  team: any[];
  branches: Branch[];
  isStaffModalOpen: boolean;
  setIsStaffModalOpen: (open: boolean) => void;
  editingStaffId: string | null;
  staffForm: any;
  setStaffForm: React.Dispatch<React.SetStateAction<any>>;
  rolePermissionsTemplates: any;
  selectedDrawerRole: any;
  drawerActiveTab: any;
  setDrawerActiveTab: any;
  selectedAssigneeId: string;
  setSelectedAssigneeId: any;
  syncRoleToStaff: boolean;
  setSyncRoleToStaff: any;
  isPermissionDrawerOpen: boolean;
  setIsPermissionDrawerOpen: (open: boolean) => void;
  drawerPermissions: any;
  setDrawerPermissions: any;
  isRevokeConfirmOpen: boolean;
  setIsRevokeConfirmOpen: (open: boolean) => void;
  staffToRevoke: any;
  setStaffToRevoke: any;
  handleOpenAddStaff: () => void;
  handleOpenEditStaff: (member: any) => void;
  handleSaveStaffSubmit: (e: React.FormEvent) => void;
  handleRevokeStaff: (id: string, name: string) => void;
  confirmRevokeStaff: () => void;
  handleDrawerRoleChange: (designation: any) => void;
  handleAssigneeChange: (assigneeId: string) => void;
  openPermissionDrawerForHub: () => void;
  openPermissionDrawerForActiveForm: () => void;
  openPermissionDrawerForRoster: (member: any) => void;
  handleSaveDrawerPermissions: () => void;
  handleRoleChange: (role: any) => void;
  handleDesignationChange: (designation: any) => void;
}

export const BranchStaffTab: React.FC<BranchStaffTabProps> = ({
  currentUser,
  team,
  branches,
  isStaffModalOpen,
  setIsStaffModalOpen,
  editingStaffId,
  staffForm,
  setStaffForm,
  rolePermissionsTemplates,
  selectedDrawerRole,
  drawerActiveTab,
  setDrawerActiveTab,
  selectedAssigneeId,
  setSelectedAssigneeId,
  syncRoleToStaff,
  setSyncRoleToStaff,
  isPermissionDrawerOpen,
  setIsPermissionDrawerOpen,
  drawerPermissions,
  setDrawerPermissions,
  isRevokeConfirmOpen,
  setIsRevokeConfirmOpen,
  staffToRevoke,
  setStaffToRevoke,
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
  handleRoleChange,
  handleDesignationChange
}) => {
  return (
    <>
      <div className="bg-white border border-border-subtle rounded-2xl overflow-hidden shadow-xs animate-fade-in text-left">
        <div className="px-5 py-4 border-b border-border-subtle bg-slate-55 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-poppins font-bold text-base text-text-primary">
              Staff Roster & Branch Assignments
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Assign administrative/operations roles and link staff members to specific branches.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              onClick={openPermissionDrawerForHub}
              className="flex items-center gap-1.5 text-xs px-3 h-8 border-accent-primary/20 text-accent-primary hover:bg-accent-tint-bg/55 cursor-pointer animate-none"
            >
              <Shield size={13} />
              <span>Permissions</span>
            </Button>
            <Button
              variant="secondary"
              onClick={handleOpenAddStaff}
              className="flex items-center gap-1.5 text-xs px-3 h-8 cursor-pointer animate-none"
            >
              <UserPlus size={13} />
              <span>Invite New Staff</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans">
            <thead>
              <tr className="border-b border-border-subtle text-[11px] font-extrabold uppercase tracking-wider text-text-secondary bg-slate-55 whitespace-nowrap">
                <th className="py-3 px-5">Staff Member</th>
                <th className="py-3 px-5">Role & Designation</th>
                <th className="py-3 px-5">Assigned Outlet Scope</th>
                <th className="py-3 px-5 text-center">Permissions</th>
                <th className="py-3 px-5 text-center">Status</th>
                <th className="py-3 px-5 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => {
                const isPending = member.status === 'Pending Invite';
                const branchName = member.assignedBranchId === 'all'
                  ? 'All Branches'
                  : member.assignedBranchName || 'Gulshan Branch';

                const countActive = Object.values(member.permissions).filter(p => p !== 'None').length;
                let permissionText = '';
                if (countActive === 4) {
                  permissionText = 'All Permissions';
                } else if (countActive === 0) {
                  permissionText = 'No Permissions';
                } else {
                  permissionText = `${countActive} ${countActive === 1 ? 'Permission' : 'Permissions'}`;
                }

                return (
                  <tr key={member.id} className="border-b border-border-subtle last:border-b-0 hover:bg-slate-55 text-xs font-semibold whitespace-nowrap">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-accent-tint-bg text-accent-primary flex items-center justify-center font-bold text-sm border border-accent-primary/10 shrink-0">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-text-primary whitespace-nowrap overflow-hidden text-ellipsis">{member.name}</div>
                          <div className="text-[11px] text-text-secondary font-medium mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-1 items-start whitespace-nowrap">
                        <span className="text-sm font-bold text-text-primary whitespace-nowrap">
                          {member.designation || 'General Staff'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase font-extrabold tracking-wider border whitespace-nowrap ${isOwner(member)
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-indigo-55 text-indigo-755 border-indigo-200'
                          }`}>
                          System: {member.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border whitespace-nowrap ${member.assignedBranchId === 'all'
                        ? 'bg-amber-55 text-amber-755 border-amber-200'
                        : 'bg-slate-55 text-slate-755 border-slate-200'
                        }`}>
                        <Store size={13} className="shrink-0" />
                        <span>{branchName}</span>
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => openPermissionDrawerForRoster(member)}
                        title="Click to customize permissions"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold whitespace-nowrap border cursor-pointer hover:scale-105 active:scale-95 transition-all ${countActive === 4
                          ? 'bg-emerald-55 text-emerald-755 border-emerald-200'
                          : countActive === 0
                            ? 'bg-slate-55 text-slate-400 border-slate-200'
                            : 'bg-indigo-55 text-indigo-755 border-indigo-200'
                          }`}
                      >
                        <Shield size={11} className="text-accent-primary" />
                        <span>{permissionText}</span>
                      </button>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-extrabold tracking-wider border whitespace-nowrap ${isPending
                        ? 'bg-amber-55 text-amber-755 border border-amber-200'
                        : 'bg-emerald-55 text-emerald-755 border border-emerald-200'
                        }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right pr-6">
                      <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditStaff(member)}
                          className="text-xs font-bold text-accent-primary hover:underline flex items-center gap-1 cursor-pointer whitespace-nowrap"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                        {currentUser?.email !== member.email && (
                          <button
                            onClick={() => handleRevokeStaff(member.id, member.name)}
                            className="text-xs font-bold text-red-655 hover:underline flex items-center gap-1 cursor-pointer pl-2 border-l border-border-subtle whitespace-nowrap text-red-600"
                          >
                            <Trash2 size={12} />
                            <span>Revoke</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isStaffModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg p-6 border shadow-xl flex flex-col text-left font-sans"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-poppins font-bold text-lg text-text-primary">
                  {editingStaffId ? 'Modify Staff Assignment' : 'Invite Staff Member'}
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setIsStaffModalOpen(false)}
                  icon={<X size={16} />}
                  className="w-8 h-8 rounded-full border hover:bg-slate-55 flex items-center justify-center text-text-secondary animate-none min-h-0 px-0"
                />
              </div>

              <form onSubmit={handleSaveStaffSubmit} className="space-y-4 text-left">
                <InputField
                  label="Staff Full Name"
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. Asim Siddiqui"
                />

                <InputField
                  label="Email Address"
                  type="email"
                  required
                  disabled={!!editingStaffId}
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="e.g. asim@indolj.com"
                />

                {!editingStaffId && (
                  <InputField
                    label="Initial Password"
                    type="password"
                    required
                    value={staffForm.password || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                    placeholder="Min 6 characters"
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-1.5 whitespace-nowrap">
                      System Role
                    </label>
                    <Select
                      value={staffForm.role}
                      onChange={(e) => handleRoleChange(e.target.value as 'Staff' | 'Owner')}
                      className="w-full h-11 px-3 bg-white border border-border-subtle rounded-xl text-sm font-semibold text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                    >
                      <option value="Staff">Staff</option>
                      <option value="Owner">Owner</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-1.5 whitespace-nowrap">
                      Job Designation
                    </label>
                    <Select
                      value={staffForm.designation}
                      onChange={(e) => handleDesignationChange(e.target.value as any)}
                      className="w-full h-11 px-3 bg-white border border-border-subtle rounded-xl text-sm font-bold text-accent-primary focus:outline-none focus:border-accent-primary cursor-pointer"
                    >
                      <option value="Branch Manager">Branch Manager</option>
                      <option value="Rider">Rider</option>
                      <option value="Kitchen Staff">Kitchen Staff</option>
                      <option value="Cashier">Cashier</option>
                      <option value="General Staff">General Staff</option>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-1.5 whitespace-nowrap">
                      Assigned Branch <span className="text-red-555">*</span>
                    </label>
                    <Select
                      value={staffForm.assignedBranchId}
                      onChange={(e) => setStaffForm({ ...staffForm, assignedBranchId: e.target.value })}
                      className="w-full h-11 px-3 bg-white border border-border-subtle rounded-xl text-sm font-bold text-[#8B5CF6] focus:outline-none focus:border-accent-primary cursor-pointer"
                    >
                      <option value="all">All Branches (Global)</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="border border-border-subtle rounded-xl p-4 bg-slate-55/50">
                  <div className="flex items-center justify-between mb-3 font-sans">
                    <span className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary">
                      Active Permissions Summary
                    </span>
                    <span className="text-[10px] text-accent-primary font-bold bg-accent-tint-bg px-2 py-0.5 rounded-full">
                      Auto-Assigned Default
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-text-primary mb-4 font-sans">
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-border-subtle">
                      <span className="text-text-secondary">Orders:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${staffForm.permissions.orders === 'Manage' ? 'bg-emerald-55 text-emerald-755' :
                        staffForm.permissions.orders === 'View' ? 'bg-blue-55 text-blue-755' : 'bg-slate-55 text-slate-400'
                        }`}>
                        {staffForm.permissions.orders}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-border-subtle">
                      <span className="text-text-secondary">Menu:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${staffForm.permissions.menu === 'Manage' ? 'bg-emerald-55 text-emerald-755' :
                        staffForm.permissions.menu === 'View' ? 'bg-blue-55 text-blue-755' : 'bg-slate-55 text-slate-400'
                        }`}>
                        {staffForm.permissions.menu}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-border-subtle">
                      <span className="text-text-secondary">Reports:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${staffForm.permissions.reports === 'View' ? 'bg-emerald-55 text-emerald-755' : 'bg-slate-55 text-slate-400'
                        }`}>
                        {staffForm.permissions.reports}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded-lg border border-border-subtle">
                      <span className="text-text-secondary">Settings:</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${staffForm.permissions.settings === 'Manage' ? 'bg-emerald-55 text-emerald-755' : 'bg-slate-55 text-slate-400'
                        }`}>
                        {staffForm.permissions.settings}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={openPermissionDrawerForActiveForm}
                    className="w-full py-2 px-3 border border-dashed border-accent-primary/40 rounded-xl text-xs font-bold text-accent-primary hover:bg-accent-tint-bg/50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Shield size={14} />
                    <span>Customize Granular Permissions...</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsStaffModalOpen(false)}
                    className="flex-1 h-11 py-0 animate-none"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1 h-11 py-0 animate-none">
                    {editingStaffId ? 'Update Assignment' : 'Send Invite'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Separated Granular Permission Customization Drawer */}
        {isPermissionDrawerOpen && (
          <div className="fixed inset-0 z-[100000] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPermissionDrawerOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-border-subtle text-left font-sans"
            >
              <div className="p-6 border-b border-border-subtle bg-slate-55">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Shield className="text-accent-primary animate-none" size={20} />
                    <h3 className="font-poppins font-bold text-lg text-text-primary">
                      Permissions Hub
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPermissionDrawerOpen(false)}
                    className="w-8 h-8 rounded-full border hover:bg-slate-55 flex items-center justify-center font-bold text-text-secondary cursor-pointer animate-none"
                  >
                    ×
                  </button>
                </div>
                <p className="text-xs text-text-secondary font-semibold">
                  Configure default role templates or assign custom privileges to specific staff members.
                </p>

                <div className="flex bg-slate-100 p-1 rounded-xl mt-4 border border-border-subtle">
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerActiveTab('roles');
                      const currentPerms = rolePermissionsTemplates[selectedDrawerRole] || {
                        orders: 'View' as const,
                        menu: 'View' as const,
                        reports: 'None' as const,
                        settings: 'None' as const
                      };
                      setDrawerPermissions(currentPerms);
                    }}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${drawerActiveTab === 'roles'
                      ? 'bg-white text-accent-primary shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                      }`}
                  >
                    1. Role Templates
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDrawerActiveTab('staff');
                      if (team && team.length > 0) {
                        const targetId = selectedAssigneeId || team[0].id;
                        setSelectedAssigneeId(targetId);
                        const member = team.find(m => m.id === targetId);
                        if (member) {
                          setDrawerPermissions({ ...member.permissions });
                        }
                      }
                    }}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${drawerActiveTab === 'staff'
                      ? 'bg-white text-accent-primary shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                      }`}
                  >
                    2. Staff Assigner
                  </button>
                  {(isStaffModalOpen || drawerActiveTab === 'form') && (
                    <button
                      type="button"
                      onClick={() => {
                        setDrawerActiveTab('form');
                        setDrawerPermissions({ ...staffForm.permissions });
                      }}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${drawerActiveTab === 'form'
                        ? 'bg-white text-accent-primary shadow-xs'
                        : 'text-text-secondary hover:text-text-primary'
                        }`}
                    >
                      3. Invite Form
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {drawerActiveTab === 'roles' ? (
                  <div className="space-y-3 bg-slate-55 p-4 rounded-2xl border border-border-subtle">
                    <div className="flex items-center justify-between">
                      <span className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                        Select Role to Edit Defaults
                      </span>
                      <span className="text-[10px] px-2 py-0.5 font-bold text-emerald-700 bg-emerald-50 rounded-full">
                        System Default
                      </span>
                    </div>

                    <div className="relative">
                      <Select
                        value={selectedDrawerRole}
                        onChange={(e) => handleDrawerRoleChange(e.target.value as any)}
                        className="w-full h-11 px-3 bg-white border border-border-subtle rounded-xl text-sm font-bold text-accent-primary focus:outline-none focus:border-accent-primary cursor-pointer shadow-xs"
                      >
                        <option value="Branch Manager">Manager (Branch Manager)</option>
                        <option value="Kitchen Staff">Chef / Cook (Kitchen Staff)</option>
                        <option value="Cashier">Cashier</option>
                        <option value="Rider">Rider</option>
                        <option value="General Staff">Waiter / General Staff</option>
                      </Select>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        { designation: 'Branch Manager', label: 'Manager' },
                        { designation: 'Kitchen Staff', label: 'Chef' },
                        { designation: 'Cashier', label: 'Cashier' },
                        { designation: 'Rider', label: 'Rider' },
                        { designation: 'General Staff', label: 'Waiter' },
                      ].map((roleOption) => {
                        const isActive = selectedDrawerRole === roleOption.designation;
                        return (
                          <button
                            key={roleOption.designation}
                            type="button"
                            onClick={() => handleDrawerRoleChange(roleOption.designation as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isActive
                              ? 'bg-accent-primary text-white shadow-sm'
                              : 'bg-white border border-border-subtle text-text-secondary hover:bg-slate-100 hover:text-text-primary'
                              }`}
                          >
                            {roleOption.label}
                          </button>
                        );
                      })}
                    </div>

                    <label className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2 text-[11px] font-bold text-text-secondary cursor-pointer hover:text-text-primary">
                      <input
                        type="checkbox"
                        checked={syncRoleToStaff}
                        onChange={(e) => setSyncRoleToStaff(e.target.checked)}
                        className="w-4 h-4 rounded text-accent-primary accent-accent-primary cursor-pointer"
                      />
                      <span>Auto-update all active staff with this role</span>
                    </label>
                  </div>
                ) : drawerActiveTab === 'form' ? (
                  <div className="space-y-3 bg-slate-55 p-4 rounded-2xl border border-border-subtle">
                    <div className="flex items-center justify-between">
                      <span className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                        Customizing Active Invite Form
                      </span>
                      <span className="text-[10px] px-2 py-0.5 font-bold text-accent-primary bg-accent-tint-bg/20 rounded-full">
                        Form Customizer
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-text-secondary bg-white p-4 rounded-xl border border-border-subtle space-y-2 font-sans">
                      <div className="flex justify-between">
                        <span className="font-bold text-text-primary">Staff Name:</span>
                        <span>{staffForm.name || '(Not entered yet)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-text-primary">Email:</span>
                        <span>{staffForm.email || '(Not entered yet)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-text-primary">Designation / Role:</span>
                        <span>{staffForm.designation} ({staffForm.role})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-bold text-text-primary">Branch Target:</span>
                        <span>{staffForm.assignedBranchId === 'all' ? 'All Branches' : branches.find(b => b.id === staffForm.assignedBranchId)?.name || staffForm.assignedBranchId}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-text-secondary leading-normal">
                      Adjusting permissions here will override the default templates for this specific invite only.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 bg-slate-55 p-4 rounded-2xl border border-border-subtle">
                    <div className="flex items-center justify-between">
                      <span className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider">
                        Select Staff Member to Customize
                      </span>
                      <span className="text-[10px] px-2 py-0.5 font-bold text-purple-755 bg-purple-50 rounded-full">
                        Individual Assigner
                      </span>
                    </div>

                    {team.length === 0 ? (
                      <div className="text-xs font-semibold text-text-secondary py-3 text-center bg-white rounded-xl border border-dashed border-border-subtle">
                        No staff members invited yet.
                      </div>
                    ) : (
                      <div className="relative">
                        <Select
                          value={selectedAssigneeId}
                          onChange={(e) => handleAssigneeChange(e.target.value)}
                          className="w-full h-11 px-3 bg-white border border-border-subtle rounded-xl text-sm font-bold text-accent-primary focus:outline-none focus:border-accent-primary cursor-pointer shadow-xs"
                        >
                          <option value="">-- Choose an Invited Staff Member --</option>
                          {team.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name} ({m.designation || 'Staff'}) — {m.status}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}

                    {selectedAssigneeId && (() => {
                      const selectedMember = team.find(m => m.id === selectedAssigneeId);
                      if (!selectedMember) return null;
                      return (
                        <div className="text-[11px] text-text-secondary bg-white p-3 rounded-xl border border-border-subtle space-y-1.5 font-sans">
                          <div className="flex justify-between">
                            <span className="font-bold">Email:</span>
                            <span>{selectedMember.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">System Role:</span>
                            <span>{selectedMember.role}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Assigned Branch:</span>
                            <span>{selectedMember.assignedBranchId === 'all' ? 'All Branches' : selectedMember.assignedBranchName || selectedMember.assignedBranchId}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-bold">Status:</span>
                            <span className={`font-bold ${selectedMember.status === 'Active' ? 'text-emerald-600' : 'text-amber-500'}`}>
                              {selectedMember.status}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-2 pt-2 border-t border-slate-100 font-sans">
                  {drawerActiveTab === 'roles' ? (
                    <span>Granular Default Settings for <span className="text-accent-primary font-bold">{selectedDrawerRole}</span></span>
                  ) : drawerActiveTab === 'form' ? (
                    <span>Custom Privileges for <span className="text-accent-primary font-bold">{staffForm.name || 'New Staff'}</span></span>
                  ) : (
                    <span>
                      {selectedAssigneeId ? (
                        <span>Specific Settings for <span className="text-accent-primary font-bold">{team.find(m => m.id === selectedAssigneeId)?.name}</span></span>
                      ) : (
                        <span>Customize Specific Settings</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Orders permissions */}
                <div className="space-y-2 border border-border-subtle rounded-xl p-4 bg-slate-55/20 text-left font-sans">
                  <span className="block text-xs font-extrabold text-text-primary">Orders Module Access</span>
                  <p className="text-[11px] text-text-secondary font-medium leading-relaxed mb-3">
                    Defines order management, receipt printing, status transitions, and cancellation controls.
                  </p>
                  <div className="space-y-2">
                    {[
                      { val: 'Manage', label: 'Manage Privilege (Process & Cancel Orders)' },
                      { val: 'View', label: 'View-Only Privilege (Monitor Active Streams)' },
                      { val: 'None', label: 'No Access Privilege (Restrict Access)' }
                    ].map((opt) => (
                      <label key={opt.val} className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer hover:bg-slate-55 p-1.5 rounded-lg">
                        <input
                          type="radio"
                          name="orders_perm"
                          checked={drawerPermissions.orders === opt.val}
                          onChange={() => setDrawerPermissions({ ...drawerPermissions, orders: opt.val as any })}
                          className="w-4 h-4 text-accent-primary accent-accent-primary cursor-pointer"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Menu permissions */}
                <div className="space-y-2 border border-border-subtle rounded-xl p-4 bg-slate-55/20 text-left font-sans">
                  <span className="block text-xs font-extrabold text-text-primary">Menu Catalog Access</span>
                  <p className="text-[11px] text-text-secondary font-medium leading-relaxed mb-3">
                    Controls addition of new dishes, item pricing modifications, category mapping, and promotions.
                  </p>
                  <div className="space-y-2">
                    {[
                      { val: 'Manage', label: 'Manage Privilege (Add, Edit & Delete Catalog)' },
                      { val: 'View', label: 'View-Only Privilege (Browse Catalogue Items)' },
                      { val: 'None', label: 'No Access Privilege (Restrict Access)' }
                    ].map((opt) => (
                      <label key={opt.val} className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer hover:bg-slate-55 p-1.5 rounded-lg">
                        <input
                          type="radio"
                          name="menu_perm"
                          checked={drawerPermissions.menu === opt.val}
                          onChange={() => setDrawerPermissions({ ...drawerPermissions, menu: opt.val as any })}
                          className="w-4 h-4 text-accent-primary accent-accent-primary cursor-pointer"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reports permissions */}
                <div className="space-y-2 border border-border-subtle rounded-xl p-4 bg-slate-55/20 text-left font-sans">
                  <span className="block text-xs font-extrabold text-text-primary">Reports & Analytics Access</span>
                  <p className="text-[11px] text-text-secondary font-medium leading-relaxed mb-3">
                    Grants view permissions for hourly trends, analytical dashboards, and sales histories.
                  </p>
                  <div className="space-y-2">
                    {[
                      { val: 'View', label: 'View Analytical Reports & Dashboards' },
                      { val: 'None', label: 'No Access Privilege (Restrict Access)' }
                    ].map((opt) => (
                      <label key={opt.val} className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer hover:bg-slate-55 p-1.5 rounded-lg">
                        <input
                          type="radio"
                          name="reports_perm"
                          checked={drawerPermissions.reports === opt.val}
                          onChange={() => setDrawerPermissions({ ...drawerPermissions, reports: opt.val as any })}
                          className="w-4 h-4 text-accent-primary accent-accent-primary cursor-pointer"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Settings permissions */}
                <div className="space-y-2 border border-border-subtle rounded-xl p-4 bg-slate-55/20 text-left font-sans">
                  <span className="block text-xs font-extrabold text-text-primary">Global Store Settings Access</span>
                  <p className="text-[11px] text-text-secondary font-medium leading-relaxed mb-3">
                    Configures branch working hours, store parameters, white-label configurations, and operational limits.
                  </p>
                  <div className="space-y-2">
                    {[
                      { val: 'Manage', label: 'Manage Store Configuration Details' },
                      { val: 'None', label: 'No Access Privilege (Restrict Access)' }
                    ].map((opt) => (
                      <label key={opt.val} className="flex items-center gap-2 text-xs font-semibold text-text-primary cursor-pointer hover:bg-slate-55 p-1.5 rounded-lg">
                        <input
                          type="radio"
                          name="settings_perm"
                          checked={drawerPermissions.settings === opt.val}
                          onChange={() => setDrawerPermissions({ ...drawerPermissions, settings: opt.val as any })}
                          className="w-4 h-4 text-accent-primary accent-accent-primary cursor-pointer"
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border-subtle bg-slate-50/80 flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsPermissionDrawerOpen(false)}
                  className="flex-1 h-11 py-0 font-bold animate-none"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveDrawerPermissions}
                  disabled={drawerActiveTab === 'staff' && !selectedAssigneeId}
                  className="flex-1 h-11 py-0 font-bold animate-none disabled:opacity-50"
                >
                  Apply & Save
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {isRevokeConfirmOpen && staffToRevoke && (
          <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center p-4 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-border-subtle rounded-2xl w-full max-w-md p-6 shadow-2xl flex flex-col text-left overflow-hidden relative"
            >
              <div className="h-1.5 bg-red-655 absolute top-0 left-0 right-0 animate-none bg-red-650" />

              <div className="flex items-start gap-4 mt-2">
                <div className="w-12 h-12 rounded-full bg-red-50 text-red-605 border border-red-200 flex items-center justify-center shrink-0 animate-none text-red-600">
                  <AlertCircle size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-poppins font-bold text-lg text-text-primary mb-1">
                    Revoke System Access?
                  </h3>
                  <p className="text-xs text-text-secondary font-semibold leading-relaxed">
                    You are about to suspend staff privileges and system access for:
                  </p>
                  <p className="text-sm font-bold text-accent-primary mt-1.5 bg-accent-tint-bg py-1.5 px-3 rounded-lg border border-accent-primary/10 inline-block animate-none">
                    {staffToRevoke.name}
                  </p>
                  <p className="text-[11px] text-text-secondary mt-3 font-semibold leading-relaxed">
                    This will immediately restrict their dashboard access, close any active sessions, and terminate permissions across all Indolj branches.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsRevokeConfirmOpen(false);
                    setStaffToRevoke(null);
                  }}
                  className="flex-1 h-11 py-0 text-xs font-bold animate-none"
                >
                  Keep Access
                </Button>
                <Button
                  type="button"
                  onClick={confirmRevokeStaff}
                  className="flex-1 h-11 py-0 text-xs font-bold bg-red-600 hover:bg-red-700 text-white border border-red-600 animate-none"
                >
                  Yes, Revoke Access
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
