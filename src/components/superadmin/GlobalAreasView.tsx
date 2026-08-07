import React, { useState, useEffect } from 'react';
import { Plus, Map, Trash2, Check, Search, ChevronRight } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SimplePageHeader } from '@/components/dashboard/SimplePageHeader';
import { locationApi } from '@/lib/api/location.api';
import { motion } from 'motion/react';
import { useConfirmation } from '@/components/ui/confirmation/useConfirmation';

type Tab = 'cities' | 'zones' | 'areas';

export function GlobalAreasView() {
  const { addToast } = useUIStore();
  const confirm = useConfirmation();
  const [activeTab, setActiveTab] = useState<Tab>('cities');

  // Data
  const [cities, setCities] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  // Selections
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forms
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    useUIStore.setState({ activeNavId: 'global-areas' });
    fetchCities();
  }, []);

  useEffect(() => {
    if (activeTab === 'zones' && selectedCityId) fetchZones();
    if (activeTab === 'areas' && selectedZoneId) fetchAreas();
    setSearchQuery('');
    setShowAddForm(false);
  }, [activeTab, selectedCityId, selectedZoneId]);

  const fetchCities = async () => {
    setLoading(true);
    const data = await locationApi.getAllCities();
    setCities(data || []);
    setLoading(false);
  };

  const fetchZones = async () => {
    if (!selectedCityId) return;
    setLoading(true);
    const data = await locationApi.getCityZones(selectedCityId);
    setZones(data || []);
    setLoading(false);
  };

  const fetchAreas = async () => {
    if (!selectedZoneId) return;
    setLoading(true);
    const data = await locationApi.getZoneAreas(selectedZoneId);
    setAreas(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!newName) return addToast('Name is required.', 'error');
    
    setIsSubmitting(true);
    try {
      if (editingId) {
        // Handle Edit
        if (activeTab === 'cities') {
          const res = await locationApi.updateCity(editingId, { name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-') });
          setCities(cities.map(c => c.id === editingId ? res : c));
        } else if (activeTab === 'zones') {
          const res = await locationApi.updateZone(editingId, { name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-') });
          setZones(zones.map(z => z.id === editingId ? res : z));
        } else if (activeTab === 'areas') {
          const res = await locationApi.updateArea(editingId, { name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-') });
          setAreas(areas.map(a => a.id === editingId ? res : a));
        }
        addToast('Updated successfully', 'success');
      } else {
        // Handle Add
        if (activeTab === 'cities') {
          const res = await locationApi.createCity({ name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-') });
          setCities([...cities, res]);
        } else if (activeTab === 'zones') {
          if (!selectedCityId) {
            setIsSubmitting(false);
            return addToast('Select a city first.', 'error');
          }
          const res = await locationApi.createZone(selectedCityId, { name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-') });
          setZones([...zones, res]);
        } else if (activeTab === 'areas') {
          if (!selectedZoneId) {
            setIsSubmitting(false);
            return addToast('Select a zone first.', 'error');
          }
          const res = await locationApi.createArea(selectedZoneId, { name: newName, slug: newName.toLowerCase().replace(/\s+/g, '-') });
          setAreas([...areas, res]);
        }
        addToast('Created successfully', 'success');
      }
      setNewName('');
      setEditingId(null);
      setShowAddForm(false);
    } catch (e) {
      addToast(`Failed to ${editingId ? 'update' : 'create'}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirm({
      title: `Delete ${activeTab === 'cities' ? 'City' : activeTab === 'zones' ? 'Zone' : 'Area'}`,
      description: 'Are you sure you want to delete this item? This action cannot be undone.',
      variant: 'destructive',
      confirmText: 'Delete',
      action: async () => {
        try {
          if (activeTab === 'cities') {
            await locationApi.deleteCity(id);
            setCities(cities.filter(c => c.id !== id));
            if (selectedCityId === id) setSelectedCityId('');
          } else if (activeTab === 'zones') {
            await locationApi.deleteZone(id);
            setZones(zones.filter(z => z.id !== id));
            if (selectedZoneId === id) setSelectedZoneId('');
          } else if (activeTab === 'areas') {
            await locationApi.deleteArea(id);
            setAreas(areas.filter(a => a.id !== id));
          }
          addToast('Deleted successfully', 'success', {
            label: 'Undo',
            onClick: async () => {
              try {
                if (activeTab === 'cities') {
                  const restored = await locationApi.restoreCity(id);
                  setCities(prev => [...prev, restored.data || restored]);
                } else if (activeTab === 'zones') {
                  const restored = await locationApi.restoreZone(id);
                  setZones(prev => [...prev, restored.data || restored]);
                } else if (activeTab === 'areas') {
                  const restored = await locationApi.restoreArea(id);
                  setAreas(prev => [...prev, restored.data || restored]);
                }
                addToast('Restored successfully', 'success');
              } catch (e) {
                addToast('Failed to restore', 'error');
              }
            }
          });
        } catch (e) {
          addToast('Failed to delete', 'error');
          throw e;
        }
      }
    });
  };

  const renderBreadcrumbs = () => {
    const city = cities.find(c => c.id === selectedCityId);
    const zone = zones.find(z => z.id === selectedZoneId);

    return (
      <div className="flex items-center text-sm text-slate-500 font-medium mb-6 bg-white p-3 rounded-xl border border-border-subtle">
        <button onClick={() => setActiveTab('cities')} className={`hover:text-brand-primary ${activeTab === 'cities' ? 'text-brand-primary font-bold' : ''}`}>
          Cities
        </button>
        {city && (
          <>
            <ChevronRight size={16} className="mx-2" />
            <button onClick={() => setActiveTab('zones')} className={`hover:text-brand-primary ${activeTab === 'zones' ? 'text-brand-primary font-bold' : ''}`}>
              {city.name} (Zones)
            </button>
          </>
        )}
        {zone && activeTab === 'areas' && (
          <>
            <ChevronRight size={16} className="mx-2" />
            <span className="text-brand-primary font-bold">{zone.name} (Areas)</span>
          </>
        )}
      </div>
    );
  };

  const currentList = activeTab === 'cities' ? cities : activeTab === 'zones' ? zones : areas;
  const filteredList = currentList.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const canAdd = activeTab === 'cities' || (activeTab === 'zones' && selectedCityId) || (activeTab === 'areas' && selectedZoneId);

  return (
    <div className="flex-1 flex flex-col h-full font-poppins relative">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-24 no-scrollbar">
        <SimplePageHeader
          title="Global Locations"
          description="Manage hierarchical delivery locations: Cities > Zones > Areas."
          icon={Map}
        />

        {renderBreadcrumbs()}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2 mb-6 gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-border-subtle rounded-xl text-sm font-medium focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none transition-all shadow-sm"
            />
          </div>

          <Button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              setNewName('');
            }}
            icon={<Plus size={16} />}
            disabled={!canAdd}
          >
            {showAddForm && !editingId ? 'Cancel' : `Add ${activeTab === 'cities' ? 'City' : activeTab === 'zones' ? 'Zone' : 'Area'}`}
          </Button>
        </div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl border border-border-subtle shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="w-full">
              <label className="block text-xs font-bold text-text-secondary mb-1">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)} Name
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="e.g. Lahore"
                autoFocus
              />
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <Button variant="ghost" className="md:mr-2 w-full md:w-auto mb-2 md:mb-0" onClick={() => { setShowAddForm(false); setEditingId(null); setNewName(''); }}>Cancel</Button>
              <Button onClick={handleAdd} loading={isSubmitting} className="w-full md:w-auto">{editingId ? 'Update' : 'Save'}</Button>
            </div>
          </motion.div>
        )}

        <div className="bg-white border border-border-subtle rounded-[20px] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center text-slate-400">Loading...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-10 flex justify-center text-slate-400">
              No {activeTab} found. {canAdd ? 'Add your first one above.' : `Select a ${activeTab === 'zones' ? 'city' : 'zone'} first.`}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border-subtle/50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Slug</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold text-text-primary">
                {filteredList.map((item) => (
                  <tr key={item.id} className="border-b border-border-subtle/50 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                    onClick={() => {
                      if (activeTab === 'cities') {
                        setSelectedCityId(item.id);
                        setActiveTab('zones');
                      } else if (activeTab === 'zones') {
                        setSelectedZoneId(item.id);
                        setActiveTab('areas');
                      }
                    }}>
                    <td className="py-4 px-6 text-brand-primary">{item.name}</td>
                    <td className="py-4 px-6 text-slate-500 font-normal">{item.slug}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                        <Check size={12} /> Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="none" onClick={() => {
                          setEditingId(item.id);
                          setNewName(item.name);
                          setShowAddForm(true);
                        }}
                        className="text-accent-primary hover:text-accent-dark hover:bg-accent-tint-bg p-2 rounded-lg mr-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                      </Button>
                      <Button variant="ghost" size="none" onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
