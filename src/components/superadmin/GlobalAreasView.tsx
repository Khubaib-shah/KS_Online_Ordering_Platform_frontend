import React, { useState, useEffect } from 'react';
import { Plus, Map, Edit, Trash2, Check, X, Shield, Search } from 'lucide-react';
import { tenantsApi } from '@/lib/api/tenants.api';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SimplePageHeader } from '@/components/dashboard/SimplePageHeader';
import { usePathname } from '@/lib/security';
import { motion } from 'motion/react';

export function GlobalAreasView() {
  const { addToast } = useUIStore();
  const [, navigate] = usePathname();
  const [areas, setAreas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // New Area Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCity, setNewCity] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [newName, setNewName] = useState('');

  // Extract unique cities and regions for autocomplete
  const uniqueCities = Array.from(new Set(areas.map(a => a.city))).filter(Boolean);
  const uniqueRegions = Array.from(new Set(areas.filter(a => !newCity || a.city === newCity).map(a => a.region))).filter(Boolean);

  useEffect(() => {
    useUIStore.setState({ activeNavId: 'global-areas' });
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    setLoading(true);
    const data = await tenantsApi.getGlobalAreas();
    setAreas(data || []);
    setLoading(false);
  };

  const handleAddArea = async () => {
    if (!newCity || !newRegion || !newName) {
      addToast('City, Region, and Name are required.', 'error');
      return;
    }

    try {
      const area = await tenantsApi.createGlobalArea({
        city: newCity,
        region: newRegion,
        name: newName,
        isActive: true,
      });
      setAreas([...areas, area]);
      setNewName('');
      // We purposefully DO NOT clear the city or region or hide the form
      // so the user can easily add multiple areas in the same region!
      addToast('Area created successfully', 'success');
    } catch (e) {
      addToast('Failed to create area', 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddArea();
    }
  };

  const handleDeleteArea = async (id: string) => {
    if (confirm('Are you sure you want to delete this delivery area?')) {
      try {
        await tenantsApi.deleteGlobalArea(id);
        setAreas(areas.filter(a => a.id !== id));
        addToast('Area deleted successfully', 'success');
      } catch (e) {
        addToast('Failed to delete area', 'error');
      }
    }
  };

  const filteredAreas = areas.filter(a =>
    a.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 font-poppins relative">
      <div className="flex-1 overflow-y-auto px-4 md:px-8 pt-6 pb-24 no-scrollbar">
        <SimplePageHeader
          title="Delivery Hubs"
          description="Manage centralized delivery areas and hubs for the platform."
          icon={Map}
        />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-6 mb-6 gap-4">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search areas, regions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-border-subtle rounded-xl text-sm font-medium focus:ring-2 focus:ring-accent-primary focus:border-accent-primary outline-none transition-all shadow-sm"
            />
          </div>

          <Button onClick={() => setShowAddForm(!showAddForm)} icon={<Plus size={16} />}>
            {showAddForm ? 'Cancel' : 'Add New Area'}
          </Button>
        </div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl border border-border-subtle shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-end"
          >
            <div className="w-full">
              <label className="block text-xs font-bold text-text-secondary mb-1">City</label>
              <Input value={newCity} onChange={(e) => setNewCity(e.target.value)} onKeyDown={handleKeyDown} placeholder="e.g. Karachi" list="existing-cities" />
              <datalist id="existing-cities">
                {uniqueCities.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="w-full">
              <label className="block text-xs font-bold text-text-secondary mb-1">Region / Hub</label>
              <Input value={newRegion} onChange={(e) => setNewRegion(e.target.value)} onKeyDown={handleKeyDown} placeholder="e.g. DHA" list="existing-regions" />
              <datalist id="existing-regions">
                {uniqueRegions.map(r => <option key={r} value={r} />)}
              </datalist>
            </div>
            <div className="w-full">
              <label className="block text-xs font-bold text-text-secondary mb-1">Area Name</label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={handleKeyDown} placeholder="e.g. Phase 8" />
            </div>
            <div className="shrink-0 w-full md:w-auto">
              <Button onClick={handleAddArea} className="w-full md:w-auto">Save Area</Button>
            </div>
          </motion.div>
        )}

        <div className="bg-white border border-border-subtle rounded-[20px] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-10 flex justify-center text-slate-400">Loading areas...</div>
          ) : filteredAreas.length === 0 ? (
            <div className="p-10 flex justify-center text-slate-400">No areas found. Add your first delivery area above.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-border-subtle/50 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">City</th>
                  <th className="py-4 px-6">Region</th>
                  <th className="py-4 px-6">Area Name</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-semibold text-text-primary">
                {filteredAreas.map((area) => (
                  <tr key={area.id} className="border-b border-border-subtle/50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">{area.city}</td>
                    <td className="py-4 px-6 text-accent-primary">{area.region}</td>
                    <td className="py-4 px-6">{area.name}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                        <Check size={12} /> Active
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Button variant="ghost" size="none" onClick={() => handleDeleteArea(area.id)}
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
