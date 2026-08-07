import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
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
import { Combobox } from '@/components/ui/Combobox';
import { InputField } from '@/components/ui/forms/InputField';

interface BranchStaffTabProps {
  currentUser: any;
  team: any[];
  branches: Branch[];
  isStaffModalOpen: boolean;
  setIsStaffModalOpen: (open: boolean) => void;
  isStaffSubmitting: boolean;
  editingStaffId: string | null;
  staffForm: any;
  setStaffForm: React.Dispatch<React.SetStateAction<any>>;
  isRevokeConfirmOpen: boolean;
  setIsRevokeConfirmOpen: (open: boolean) => void;
  staffToRevoke: any;
  setStaffToRevoke: any;
  handleOpenAddStaff: () => void;
  handleOpenEditStaff: (member: any) => void;
  handleSaveStaffSubmit: (e: React.FormEvent) => void;
  handleRevokeStaff: (id: string, name: string) => void;
  confirmRevokeStaff: () => void;
  customRoles: any[];
  handleCustomRoleChange: (roleId: string) => void;
}

export const BranchStaffTab: React.FC<BranchStaffTabProps> = ({
  currentUser,
  team,
  branches,
  isStaffModalOpen,
  setIsStaffModalOpen,
  isStaffSubmitting,
  editingStaffId,
  staffForm,
  setStaffForm,
  isRevokeConfirmOpen,
  setIsRevokeConfirmOpen,
  staffToRevoke,
  setStaffToRevoke,
  handleOpenAddStaff,
  handleOpenEditStaff,
  handleSaveStaffSubmit,
  handleRevokeStaff,
  confirmRevokeStaff,
  customRoles,
  handleCustomRoleChange
}) => {
  let displayPermissions: { module: string, level: string }[] = [];
  const selectedRole = customRoles.find(r => r.id === staffForm.roleId);

  if (selectedRole) {
    let rolePerms = selectedRole.permissions || {};
    if (typeof rolePerms === 'string') {
      try { rolePerms = JSON.parse(rolePerms); } catch (e) { rolePerms = {}; }
    }
    const ALL_MODULES = ['Orders', 'Menu', 'Reports', 'Settings', 'Staff', 'Customers', 'Branches', 'POS'];
    ALL_MODULES.forEach(mod => {
      const perms = rolePerms[mod] || rolePerms[mod.toLowerCase()] || [];
      if (Array.isArray(perms) && perms.length > 0) {
        const isManage = perms.includes('Manage') || perms.includes('Create') || perms.includes('Update') || perms.includes('Delete');
        const isView = perms.includes('View') || perms.includes('Read');
        if (isManage) {
          displayPermissions.push({ module: mod, level: 'Manage' });
        } else if (isView) {
          displayPermissions.push({ module: mod, level: 'View' });
        }
      }
    });
  } else {
    if (staffForm.permissions.orders !== 'None') displayPermissions.push({ module: 'Orders', level: staffForm.permissions.orders });
    if (staffForm.permissions.menu !== 'None') displayPermissions.push({ module: 'Menu', level: staffForm.permissions.menu });
    if (staffForm.permissions.reports !== 'None') displayPermissions.push({ module: 'Reports', level: staffForm.permissions.reports });
    if (staffForm.permissions.settings !== 'None') displayPermissions.push({ module: 'Settings', level: staffForm.permissions.settings });
  }

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
                          {member.roleName || 'Unassigned Role'}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-text-secondary mb-1.5 whitespace-nowrap">
                      Assign Custom Role <span className="text-red-555">*</span>
                    </label>
                    <Combobox
                      options={customRoles.map(r => ({ label: r.name, value: r.id }))}
                      value={staffForm.roleId || ''}
                      onChange={handleCustomRoleChange}
                      placeholder="Select Role..."
                      className="w-full"
                    />
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
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-text-primary mb-4 font-sans">
                    {displayPermissions.length > 0 ? (
                      displayPermissions.map((perm, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-border-subtle">
                          <span className="text-text-secondary">{perm.module}:</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${perm.level === 'Manage' ? 'bg-emerald-55 text-emerald-755' :
                            perm.level === 'View' ? 'bg-blue-55 text-blue-755' : 'bg-slate-55 text-slate-400'
                            }`}>
                            {perm.level}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center text-text-secondary py-2 border border-border-subtle rounded-lg bg-white">
                        No active permissions assigned.
                      </div>
                    )}
                  </div>


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
                  <Button type="submit" variant="primary" loading={isStaffSubmitting} className="flex-1 h-11 py-0 animate-none">
                    {editingStaffId ? 'Update Assignment' : 'Send Invite'}
                  </Button>
                </div>
              </form>
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
