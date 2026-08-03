import React from 'react';
import { Branch } from '@/types/branch';
import { Button } from '@/components/ui/Button';
import { motion } from 'motion/react';
import { Store, MapPin, Phone, MessageSquare, Edit, Power, Building2 } from 'lucide-react';

interface BranchListTabProps {
  branches: Branch[];
  handleEditBranch: (branch: Branch) => void;
  handleToggleBranchStatus: (branchId: string) => void;
}

export const BranchListTab: React.FC<BranchListTabProps> = ({
  branches,
  handleEditBranch,
  handleToggleBranchStatus
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {branches.map((branch) => {
        const isActive = branch.status === 'active';
        return (
          <motion.div
            key={branch.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${isActive ? 'border-border-subtle' : 'border-slate-200 bg-slate-50/50'
              }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive
                      ? 'bg-accent-tint-bg text-accent-primary'
                      : 'bg-slate-200 text-slate-500'
                      }`}
                  >
                    <Store size={18} />
                  </div>
                  <div>
                    <h3 className="font-poppins font-bold text-base text-text-primary">
                      {branch.name}
                    </h3>
                    <span className="text-xs text-text-secondary font-medium">
                      {branch.area}, {branch.city}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] uppercase font-extrabold tracking-wider px-2.5 py-1 rounded-full ${isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-200 text-slate-600 border border-slate-300'
                    }`}
                >
                  {branch.status}
                </span>
              </div>

              <div className="space-y-2 mt-4 text-xs font-medium text-text-secondary">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-text-secondary shrink-0 mt-0.5" />
                  <span>{branch.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-text-secondary shrink-0" />
                  <span>{branch.phone || 'No phone added'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-text-secondary shrink-0" />
                  <span>{branch.whatsapp || 'No WhatsApp added'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 mt-6 border-t border-border-subtle pt-4">
              <Button
                variant="secondary"
                onClick={() => handleEditBranch(branch)}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs h-9 py-0"
              >
                <Edit size={13} />
                <span>Edit Details</span>
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleToggleBranchStatus(branch.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs h-9 py-0 ${isActive
                  ? 'hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                  : 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                  }`}
              >
                <Power size={13} />
                <span>{isActive ? 'Deactivate' : 'Activate'}</span>
              </Button>
            </div>
          </motion.div>
        );
      })}

      {branches.length === 0 && (
        <div className="col-span-full py-16 text-center">
          <Building2 size={48} className="mx-auto text-text-muted mb-3" />
          <p className="text-sm font-semibold text-text-secondary">No branches configured yet.</p>
          <p className="text-xs text-text-muted mt-1">Add up to 5 branches for your business.</p>
        </div>
      )}
    </div>
  );
};
