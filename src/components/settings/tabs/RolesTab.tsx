import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Shield, Settings2, Trash2, Edit2 } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { rolesApi, Role } from '@/lib/api/roles.api';
import { CreateRoleModal } from '@/components/roles/CreateRoleModal';
import { DataTable } from '@/components/data-table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useConfirmation } from '@/components/ui/confirmation/useConfirmation';

export function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null);
  const { addToast } = useUIStore();
  const confirm = useConfirmation();

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const data = await rolesApi.getRoles();
      setRoles(data);
    } catch (e) {
      addToast('Failed to load roles', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleSaveRole = async (roleData: any) => {
    try {
      if (roleToEdit) {
        await rolesApi.updateRole(roleToEdit.id, roleData);
        addToast('Role updated successfully', 'success');
      } else {
        await rolesApi.createRole(roleData);
        addToast('Role created successfully', 'success');
      }
      fetchRoles();
      setRoleToEdit(null);
    } catch (e: any) {
      addToast(e.response?.data?.error?.message || 'Failed to save role', 'error');
      throw e; // rethrow to keep modal loading state or close it appropriately
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    await confirm({
      title: 'Delete Role',
      description: 'Are you sure you want to delete this role? This action cannot be undone.',
      variant: 'destructive',
      confirmText: 'Delete',
      action: async () => {
        try {
          await rolesApi.deleteRole(roleId);
          addToast('Role deleted successfully', 'success');
          fetchRoles();
        } catch (e: any) {
          addToast(e.response?.data?.error?.message || 'Failed to delete role', 'error');
          throw e;
        }
      }
    });
  };

  const columns = useMemo<ColumnDef<Role>[]>(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-sm shrink-0 bg-slate-100 text-slate-800"
          >
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-bold text-text-primary">{row.original.name}</span>
        </div>
      )
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div className="truncate max-w-[300px]" title={row.original.description || ''}>
          {row.original.description || '-'}
        </div>
      )
    },
    {
      id: 'permissions',
      header: () => <div className="text-center">Permissions</div>,
      cell: ({ row }) => {
        let perms = row.original.permissions || {};
        if (typeof perms === 'string') {
          try { perms = JSON.parse(perms); } catch (e) { perms = {}; }
        }
        const permissionCount = Object.keys(perms).filter(k => (perms as any)[k]?.length > 0).length;
        return (
          <div className="text-center">
            <span className="inline-flex items-center justify-center bg-slate-100 text-text-secondary px-2 py-1 rounded-full text-xs font-bold">
              {permissionCount} Module{permissionCount !== 1 ? 's' : ''}
            </span>
          </div>
        );
      }
    },
    {
      id: 'users',
      header: () => <div className="text-center">Users</div>,
      cell: ({ row }) => (
        <div className="text-center">
          <span className="font-medium text-text-primary">{row.original._count?.staffProfiles || 0}</span>
        </div>
      )
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <button 
            className="p-1.5 text-text-tertiary hover:text-accent-primary hover:bg-accent-primary/10 rounded-md transition-colors"
            title="Edit Role"
            onClick={() => {
              setRoleToEdit(row.original);
              setIsModalOpen(true);
            }}
          >
            <Edit2 size={16} />
          </button>
          <button 
            className="p-1.5 text-text-tertiary hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Role"
            onClick={() => handleDeleteRole(row.original.id)}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ], []);

  return (
    <div className="w-full max-w-4xl animate-fade-in text-left">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
            <Shield className="text-accent-primary" size={24} />
            Roles & Permissions
          </h2>
          <p className="text-[15px] text-text-secondary mt-1">
            Create custom roles and configure access permissions for your staff.
          </p>
        </div>
        <Button variant="primary" onClick={() => {
          setRoleToEdit(null);
          setIsModalOpen(true);
        }} className="gap-2 shadow-sm">
          <Plus size={18} />
          Create Role
        </Button>
      </div>

      <div className="bg-white border border-border-subtle rounded-card shadow-card p-6">
        {isLoading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-accent-primary/20 border-t-accent-primary animate-spin" />
          </div>
        ) : roles.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Shield size={28} className="text-text-tertiary" />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-1">No Custom Roles Yet</h3>
            <p className="text-text-secondary max-w-sm mb-6">
              Create your first role to start customizing staff access across the system.
            </p>
            <Button variant="outline" onClick={() => {
              setRoleToEdit(null);
              setIsModalOpen(true);
            }}>
              Create First Role
            </Button>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={roles} 
            emptyMessage="No custom roles available."
          />
        )}
      </div>

      <CreateRoleModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRoleToEdit(null);
        }}
        onSave={handleSaveRole}
        initialData={roleToEdit}
      />
    </div>
  );
}
