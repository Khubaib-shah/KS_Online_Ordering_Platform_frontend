import { AnimatePresence, motion } from 'motion/react';
import {
  Building2,
  Plus,
  UserPlus,
  AlertCircle,
  Layers,
  ClipboardList,
  FileText,
  Users
} from 'lucide-react';

import { BranchListTab } from './BranchListTab';
import { BranchCatalogTab } from './BranchCatalogTab';
import { BranchInventoryTab } from './BranchInventoryTab';
import { BranchHistoryTab } from './BranchHistoryTab';
import { BranchStaffTab } from './BranchStaffTab';
import { Button } from '@components/ui/Button';
import { TabButton } from '@components/ui/TabButton';
import { InputField } from '@/components/ui/forms/InputField';
import { useBranchManagement } from '@/hooks/useBranchManagement';

export function BranchesView() {
  const {
    currentUser,
    branches,
    inventory,
    disabledProducts,
    toggleProductBranch,
    menuItems,
    isMenuLoading,
    team,
    activeTab,
    setActiveTab,
    selectedBranchId,
    setSelectedBranchId,
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
  } = useBranchManagement();

  return (
    <div className="flex flex-col select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 text-left">
        <div>
          <h1 className="font-poppins font-bold text-2xl sm:text-[28px] lg:text-[32px] text-text-primary leading-[1.2] pl-0.5">
            Branch Management
          </h1>
          <p className="font-inter text-[15px] sm:text-base text-text-secondary mt-1 leading-[1.5]">
            Configure multiple outlets, manage centralized catalog availability, and control branch inventory.
          </p>
        </div>

        {activeTab === 'list' && (
          <Button
            variant="primary"
            onClick={handleAddBranch}
            disabled={branches.length >= 5}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-4 shrink-0"
          >
            <Plus size={14} />
            <span>Add Branch</span>
          </Button>
        )}

        {activeTab === 'staff' && (
          <Button
            variant="primary"
            onClick={handleOpenAddStaff}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm px-2.5 sm:px-4 shrink-0"
          >
            <UserPlus size={14} />
            <span>Add Staff Member</span>
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-subtle gap-2 mb-6 overflow-x-auto no-scrollbar select-none">
        <TabButton
          isActive={activeTab === 'list'}
          onClick={() => setActiveTab('list')}
          icon={<Building2 size={16} />}
        >
          Branches List ({branches.length}/5)
        </TabButton>

        <TabButton
          isActive={activeTab === 'catalog'}
          onClick={() => {
            setActiveTab('catalog');
            if (branches.length > 0 && !selectedBranchId) {
              setSelectedBranchId(branches[0].id);
            }
          }}
          icon={<Layers size={16} />}
        >
          Product Availability
        </TabButton>

        <TabButton
          isActive={activeTab === 'inventory'}
          onClick={() => {
            setActiveTab('inventory');
            if (branches.length > 0 && !selectedBranchId) {
              setSelectedBranchId(branches[0].id);
            }
          }}
          icon={<ClipboardList size={16} />}
        >
          Branch Inventory
        </TabButton>

        <TabButton
          isActive={activeTab === 'history'}
          onClick={() => {
            setActiveTab('history');
            if (branches.length > 0 && !selectedBranchId) {
              setSelectedBranchId(branches[0].id);
            }
          }}
          icon={<FileText size={16} />}
        >
          Stock Movements
        </TabButton>

        <TabButton
          isActive={activeTab === 'staff'}
          onClick={() => setActiveTab('staff')}
          icon={<Users size={16} />}
        >
          Staff & Assignments
        </TabButton>
      </div>

      {/* Tabs Content */}
      <div className="min-h-[400px]">
        {activeTab === 'list' && (
          <BranchListTab
            branches={branches}
            handleEditBranch={handleEditBranch}
            handleToggleBranchStatus={handleToggleBranchStatus}
          />
        )}

        {activeTab === 'catalog' && (
          <BranchCatalogTab
            branches={branches}
            selectedBranchId={selectedBranchId}
            setSelectedBranchId={setSelectedBranchId}
            currentBranchObj={currentBranchObj}
            isMenuLoading={isMenuLoading}
            menuItems={menuItems}
            disabledProducts={disabledProducts}
            toggleProductBranch={toggleProductBranch}
          />
        )}

        {activeTab === 'inventory' && (
          <BranchInventoryTab
            branches={branches}
            selectedBranchId={selectedBranchId}
            setSelectedBranchId={setSelectedBranchId}
            currentBranchObj={currentBranchObj}
            filteredInventory={filteredInventory}
            inventory={inventory}
            adjustingItemId={adjustingItemId}
            setAdjustingItemId={setAdjustingItemId}
            adjustType={adjustType}
            setAdjustType={setAdjustType}
            adjustQty={adjustQty}
            setAdjustQty={setAdjustQty}
            adjustReason={adjustReason}
            setAdjustReason={setAdjustReason}
            handleAdjustStockSubmit={handleAdjustStockSubmit}
          />
        )}

        {activeTab === 'history' && (
          <BranchHistoryTab
            branches={branches}
            selectedBranchId={selectedBranchId}
            setSelectedBranchId={setSelectedBranchId}
            currentBranchObj={currentBranchObj}
            filteredMovements={filteredMovements}
          />
        )}

        {activeTab === 'staff' && (
          <BranchStaffTab
            currentUser={currentUser}
            team={team}
            branches={branches}
            isStaffModalOpen={isStaffModalOpen}
            setIsStaffModalOpen={setIsStaffModalOpen}
            editingStaffId={editingStaffId}
            staffForm={staffForm}
            setStaffForm={setStaffForm}
            rolePermissionsTemplates={rolePermissionsTemplates}
            selectedDrawerRole={selectedDrawerRole}
            drawerActiveTab={drawerActiveTab}
            setDrawerActiveTab={setDrawerActiveTab}
            selectedAssigneeId={selectedAssigneeId}
            setSelectedAssigneeId={setSelectedAssigneeId}
            syncRoleToStaff={syncRoleToStaff}
            setSyncRoleToStaff={setSyncRoleToStaff}
            isPermissionDrawerOpen={isPermissionDrawerOpen}
            setIsPermissionDrawerOpen={setIsPermissionDrawerOpen}
            drawerPermissions={drawerPermissions}
            setDrawerPermissions={setDrawerPermissions}
            isRevokeConfirmOpen={isRevokeConfirmOpen}
            setIsRevokeConfirmOpen={setIsRevokeConfirmOpen}
            staffToRevoke={staffToRevoke}
            setStaffToRevoke={setStaffToRevoke}
            handleOpenAddStaff={handleOpenAddStaff}
            handleOpenEditStaff={handleOpenEditStaff}
            handleSaveStaffSubmit={handleSaveStaffSubmit}
            handleRevokeStaff={handleRevokeStaff}
            confirmRevokeStaff={confirmRevokeStaff}
            handleDrawerRoleChange={handleDrawerRoleChange}
            handleAssigneeChange={handleAssigneeChange}
            openPermissionDrawerForHub={openPermissionDrawerForHub}
            openPermissionDrawerForActiveForm={openPermissionDrawerForActiveForm}
            openPermissionDrawerForRoster={openPermissionDrawerForRoster}
            handleSaveDrawerPermissions={handleSaveDrawerPermissions}
            handleRoleChange={handleRoleChange}
            handleDesignationChange={handleDesignationChange}
          />
        )}
      </div>

      {/* Edit/Create Branch Modal */}
      <AnimatePresence>
        {isEditing && editingBranch && (
          <div className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-lg p-6 border shadow-xl flex flex-col text-left font-sans"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-poppins font-bold text-lg text-text-primary">
                  {branches.some((b) => b.id === editingBranch.id) ? 'Edit Branch Details' : 'Configure New Branch'}
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="w-8 h-8 rounded-full border hover:bg-slate-50 flex items-center justify-center font-bold text-text-secondary cursor-pointer"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveBranch} className="space-y-4">
                <InputField
                  label="Branch Name"
                  required
                  type="text"
                  value={editingBranch.name || ''}
                  onChange={(e) => setEditingBranch({ ...editingBranch, name: e.target.value })}
                  placeholder="e.g. DHA Branch"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Service Area Name"
                    required
                    type="text"
                    value={editingBranch.area || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, area: e.target.value })}
                    placeholder="e.g. DHA Phase 6"
                  />
                  <InputField
                    label="City"
                    required
                    type="text"
                    value={editingBranch.city || 'Karachi'}
                    onChange={(e) => setEditingBranch({ ...editingBranch, city: e.target.value })}
                    placeholder="e.g. Karachi"
                  />
                </div>

                <InputField
                  label="Detailed Physical Address"
                  required
                  type="text"
                  value={editingBranch.address || ''}
                  onChange={(e) => setEditingBranch({ ...editingBranch, address: e.target.value })}
                  placeholder="e.g. Plot 12-C, Khayaban-e-Ittehad, Phase 6"
                />

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="Phone Number"
                    type="text"
                    value={editingBranch.phone || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, phone: e.target.value })}
                    placeholder="e.g. 021-35812346"
                  />
                  <InputField
                    label="WhatsApp Number"
                    type="text"
                    value={editingBranch.whatsapp || ''}
                    onChange={(e) => setEditingBranch({ ...editingBranch, whatsapp: e.target.value })}
                    placeholder="e.g. +92 333 5812346"
                  />
                </div>

                <InputField
                  label="Google Maps URL"
                  type="text"
                  value={editingBranch.mapsUrl || ''}
                  onChange={(e) => setEditingBranch({ ...editingBranch, mapsUrl: e.target.value })}
                  placeholder="e.g. https://maps.app.goo.gl/..."
                />

                <div className="flex items-center gap-2 text-xs font-semibold text-accent-dark bg-accent-dark/5 border border-[#8B5CF6]/15 rounded-xl p-3 mt-1.5">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>settings (Logo, Brand Colors, opening hours) are shared across branches.</span>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                    className=" h-11 py-0"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" className="flex-1 h-11 py-0">
                    Save Branch Configuration
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
