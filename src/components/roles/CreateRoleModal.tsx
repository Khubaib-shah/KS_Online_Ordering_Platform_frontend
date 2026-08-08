import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CreateRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (role: any) => Promise<void>;
  initialData?: any;
}

const MODULES = [
  'Orders',
  'Menu',
  'Reports',
  'Settings',
  'Staff',
  'Customers',
  'Branches',
  'POS'
];

const ACTIONS = ['Create', 'Read', 'Update', 'Delete'];

export function CreateRoleModal({ isOpen, onClose, onSave, initialData }: CreateRoleModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  const [permissions, setPermissions] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setDescription(initialData.description || '');
        let initialPerms = initialData.permissions || {};
        if (typeof initialPerms === 'string') {
          try { initialPerms = JSON.parse(initialPerms); } catch (e) { initialPerms = {}; }
        }
        setPermissions(initialPerms);
      } else {
        setName('');
        setDescription('');
        setPermissions({});
      }
    }
  }, [isOpen, initialData]);

  const setPermission = (mod: string, value: string) => {
    setPermissions(prev => ({ ...prev, [mod]: value }));
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        name,
        description,
        permissions
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const permissionOptions: Record<string, { label: string, value: string }[]> = {
    orders: [
      { label: 'None', value: 'none' },
      { label: 'Self Only', value: 'self_only' },
      { label: 'Branch Only', value: 'branch_only' },
      { label: 'All', value: 'all' },
    ],
    menu: [
      { label: 'None', value: 'none' },
      { label: 'Read', value: 'read' },
      { label: 'Manage', value: 'manage' },
    ],
    reports: [
      { label: 'None', value: 'none' },
      { label: 'Self Only', value: 'self_only' },
      { label: 'Branch Only', value: 'branch_only' },
      { label: 'All', value: 'all' },
    ],
    settings: [
      { label: 'None', value: 'none' },
      { label: 'Read', value: 'read' },
      { label: 'Manage', value: 'manage' },
    ],
    staff: [
      { label: 'None', value: 'none' },
      { label: 'Read', value: 'read' },
      { label: 'Manage', value: 'manage' },
    ],
    customers: [
      { label: 'None', value: 'none' },
      { label: 'Branch Only', value: 'branch_only' },
      { label: 'All', value: 'all' },
    ],
    branches: [
      { label: 'None', value: 'none' },
      { label: 'Read', value: 'read' },
      { label: 'Manage', value: 'manage' },
    ],
    pos: [
      { label: 'None', value: 'none' },
      { label: 'Use', value: 'use' },
    ],
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Slide-over Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col border-l border-border-subtle"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border-subtle/50">
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">{initialData ? 'EDIT ROLE' : 'CREATE NEW ROLE'}</h2>
              <p className="text-sm text-text-secondary mt-1">Define a new role and its permissions.</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-slate-100 text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-border-subtle rounded-xl text-sm focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none transition-all shadow-sm text-text-primary placeholder:text-text-tertiary"
                  placeholder="e.g., Regional Manager"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-border-subtle rounded-xl text-sm focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none transition-all shadow-sm text-text-primary placeholder:text-text-tertiary resize-none h-20"
                  placeholder="Briefly describe the responsibilities of this role..."
                />
              </div>
            </div>

            <hr className="border-border-subtle/50" />

            {/* Permissions */}
            <div>
              <h3 className="text-sm font-bold text-text-primary mb-4">Module Permissions</h3>
              
              <div className="space-y-4">
                {Object.entries(permissionOptions).map(([mod, options]) => (
                  <div key={mod} className="border border-border-subtle rounded-xl p-4 shadow-xs bg-white">
                    <div className="text-sm font-semibold text-text-primary mb-2 capitalize">{mod}</div>
                    <div className="flex flex-wrap gap-2">
                      {options.map(opt => {
                        const isSelected = (permissions[mod] || 'none') === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPermission(mod, opt.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                              isSelected 
                                ? 'bg-accent-primary text-white border-accent-primary shadow-sm' 
                                : 'bg-white text-text-secondary border-border-subtle hover:border-accent-primary/50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border-subtle/50 bg-slate-50 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={!name.trim() || isSaving}
            >
              {isSaving ? 'Creating...' : 'Create Role'}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
