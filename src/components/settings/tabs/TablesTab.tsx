import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { InputField } from '@/components/ui/forms/InputField';
import { useTables } from '@/hooks/useTables';
import { useBranchStore } from '@/store/branchStore';
import { Loader2, Trash2, Plus } from 'lucide-react';

interface TablesTabProps {
  addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function TablesTab({ addToast }: TablesTabProps) {
  const { branches, activeBranchFilterId } = useBranchStore();
  const activeBranchId = activeBranchFilterId !== 'all' ? activeBranchFilterId : branches[0]?.id;

  const { tables, isLoading, createTable, deleteTable, updateTable } = useTables(activeBranchId);
  
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState('2');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBranchId) {
      addToast('No branch selected', 'error');
      return;
    }
    if (!newTableNumber) {
      addToast('Table number is required', 'error');
      return;
    }

    setIsCreating(true);
    try {
      await createTable.mutateAsync({
        branchId: activeBranchId,
        tableNumber: newTableNumber,
        capacity: parseInt(newTableCapacity) || 2,
        isActive: true,
      });
      addToast('Table added successfully', 'success');
      setNewTableNumber('');
      setNewTableCapacity('2');
    } catch (err: any) {
      addToast(err.response?.data?.error || 'Failed to add table', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    setIsDeletingId(id);
    try {
      await deleteTable.mutateAsync(id);
      addToast('Table deleted', 'success');
    } catch (err: any) {
      addToast('Failed to delete table', 'error');
    } finally {
      setIsDeletingId(null);
    }
  };

  const toggleTableStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateTable.mutateAsync({ id, data: { isActive: !currentStatus } });
      addToast('Table status updated', 'success');
    } catch (err: any) {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Table Management</h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage tables for dine-in orders. These tables will be available for selection in the POS.
        </p>
      </div>

      {!activeBranchId ? (
        <div className="text-amber-600 bg-amber-50 p-4 rounded-xl border border-amber-200">
          Please select a specific branch to manage tables.
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">Add New Table</h3>
              <form onSubmit={handleAddTable} className="space-y-4">
                <InputField
                  label="Table Number / Name"
                  type="text"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  placeholder="e.g. 12 or T-1"
                  required
                />
                <InputField
                  label="Capacity (Seats)"
                  type="number"
                  min="1"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  placeholder="e.g. 4"
                  required
                />
                <Button 
                  type="submit" 
                  loading={isCreating}
                  className="w-full justify-center text-xs h-10"
                >
                  <><Plus size={16} className="mr-2" /> Add Table</>
                </Button>
              </form>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h3 className="font-bold text-slate-800">Existing Tables</h3>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-500">
                No tables found for this branch. Add one to get started.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tables.map((table: any) => (
                  <div key={table.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-800 text-lg">{table.tableNumber}</span>
                      <Button
                        variant="custom"
                        size="none"
                        onClick={() => handleDeleteTable(table.id)}
                        loading={isDeletingId === table.id}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                        title="Delete Table"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                    <div className="text-xs text-slate-500 mb-3">Capacity: {table.capacity}</div>
                    
                    <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</span>
                      <button 
                        onClick={() => toggleTableStatus(table.id, table.isActive)}
                        className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${table.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {table.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
