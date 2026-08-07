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
  
  // Format: { moduleName: ['Create', 'Read'] }
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
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
      setExpandedModules({});
    }
  }, [isOpen, initialData]);

  const toggleModule = (mod: string) => {
    setExpandedModules(prev => ({ ...prev, [mod]: !prev[mod] }));
  };

  const togglePermission = (mod: string, action: string) => {
    setPermissions(prev => {
      const current = prev[mod] || [];
      if (current.includes(action)) {
        return { ...prev, [mod]: current.filter(a => a !== action) };
      } else {
        return { ...prev, [mod]: [...current, action] };
      }
    });
  };

  const toggleAllInModule = (mod: string, checked: boolean) => {
    if (checked) {
      setPermissions(prev => ({ ...prev, [mod]: [...ACTIONS] }));
    } else {
      setPermissions(prev => ({ ...prev, [mod]: [] }));
    }
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
              <h3 className="text-sm font-bold text-text-primary mb-4">Permissions</h3>
              
              <div className="space-y-2">
                {MODULES.map(mod => {
                  const selectedCount = permissions[mod]?.length || 0;
                  const isExpanded = expandedModules[mod];

                  return (
                    <div key={mod} className="border border-border-subtle rounded-xl overflow-hidden shadow-xs bg-white">
                      {/* Accordion Header */}
                      <div 
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => toggleModule(mod)}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? <ChevronDown size={16} className="text-text-tertiary" /> : <ChevronRight size={16} className="text-text-tertiary" />}
                          <span className="text-sm font-semibold text-text-primary">{mod}</span>
                        </div>
                        
                        <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                          <span className="text-xs font-medium text-text-secondary bg-slate-100 px-2 py-0.5 rounded-full">
                            {selectedCount} / 4
                          </span>
                          <div 
                            className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-colors ${selectedCount === 4 ? 'bg-accent-primary border-accent-primary' : selectedCount > 0 ? 'bg-white border-accent-primary' : 'border-border-subtle bg-white hover:border-accent-primary/50'}`}
                            onClick={() => toggleAllInModule(mod, selectedCount !== 4)}
                          >
                            {selectedCount > 0 && <Check size={12} className={selectedCount === 4 ? "text-white" : "text-accent-primary"} />}
                          </div>
                        </div>
                      </div>

                      {/* Accordion Body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-border-subtle/50 bg-slate-50/50"
                          >
                            <div className="p-4 grid grid-cols-2 gap-3">
                              {ACTIONS.map(action => {
                                const isChecked = permissions[mod]?.includes(action);
                                return (
                                  <label key={action} className="flex items-center gap-2 cursor-pointer group" onClick={() => togglePermission(mod, action)}>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-accent-primary border-accent-primary' : 'border-border-subtle bg-white group-hover:border-accent-primary/50'}`}>
                                      {isChecked && <Check size={12} className="text-white" />}
                                    </div>
                                    <span className={`text-sm select-none ${isChecked ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>{action}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
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
