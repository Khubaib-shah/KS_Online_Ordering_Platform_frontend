
import React, { useState, useMemo, useEffect } from 'react';
import {
  Building2,
  Search,
  Plus,
  Utensils,
  Star,
  Ban,
  UserCheck,
  Trash2,
  Palette,
  Phone,
  MapPin,
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Mail,
  Info,
  Copy,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTenantStore } from '@/store/tenantStore';
import { useUIStore } from '@/store/uiStore';
import { Tenant } from '@/types/tenant';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { RestaurantDetailView } from './RestaurantDetailView';
import { SimplePageHeader } from '@/components/dashboard/SimplePageHeader';
import { usePathname } from '@/lib/security';
import { Combobox } from '@/components/ui/Combobox';
import { StatCard } from '@/components/dashboard/StatCard';

export function RestaurantsListView() {
  const [, navigate] = usePathname();
  const { tenants, setActiveTenantId, saveTenant, deleteTenant, detailedTenant, setDetailedTenant } = useTenantStore();
  const { addToast, setActiveNavId } = useUIStore();

  // Search, Filter, Sort State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [planFilter, setPlanFilter] = useState<'all' | 'starter' | 'premium' | 'enterprise'>('all');
  const [cuisineFilter, setCuisineFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFetching, setIsFetching] = useState(false);

  // Dynamic cuisines list from existing tenants
  const cuisinesList = useMemo(() => {
    const cuisines = new Set<string>();
    tenants.forEach(t => {
      if (t.cuisine) {
        cuisines.add(t.cuisine.trim());
      }
    });
    return Array.from(cuisines);
  }, [tenants]);

  // Combined Filters and Sort logic
  const filteredAndSortedTenants = useMemo(() => {
    let result = [...tenants];

    // 1. Text Search Filter (name, slug, email, address, cuisine, tagline)
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.adminEmail.toLowerCase().includes(q) ||
        (t.cuisine && t.cuisine.toLowerCase().includes(q)) ||
        (t.address && t.address.toLowerCase().includes(q)) ||
        (t.tagline && t.tagline.toLowerCase().includes(q))
      );
    }

    // 2. Status Filter
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    // 3. Subscription Plan Filter
    if (planFilter !== 'all') {
      result = result.filter(t => (t.subscriptionPlan || 'premium') === planFilter);
    }

    // 4. Cuisine Filter
    if (cuisineFilter !== 'all') {
      result = result.filter(t => t.cuisine && t.cuisine.toLowerCase() === cuisineFilter.toLowerCase());
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'rating_desc':
          return (b.rating || 0) - (a.rating || 0);
        case 'rating_asc':
          return (a.rating || 0) - (b.rating || 0);
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });

    return result;
  }, [tenants, searchQuery, statusFilter, planFilter, cuisineFilter, sortBy]);

  // Simulate network fetching effect whenever parameters change to respect "show only 10 max in first fetch"
  useEffect(() => {
    setIsFetching(true);
    const timer = setTimeout(() => {
      setIsFetching(false);
    }, 450); // 450ms premium loading skeleton delay
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, planFilter, cuisineFilter, sortBy, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, planFilter, cuisineFilter, sortBy]);

  // Paginated Results
  const totalItems = filteredAndSortedTenants.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedTenants = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredAndSortedTenants.slice(startIndex, startIndex + pageSize);
  }, [filteredAndSortedTenants, currentPage, pageSize]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = tenants.length;
    const active = tenants.filter(t => t.status === 'active').length;
    const suspended = total - active;
    const avgRating = tenants.length
      ? (tenants.reduce((acc, t) => acc + (t.rating || 0), 0) / total).toFixed(1)
      : '0.0';
    return { total, active, suspended, avgRating };
  }, [tenants]);

  const handleEditClick = (tenant: Tenant, e: React.MouseEvent) => {
    e.stopPropagation();
    setDetailedTenant(tenant);
  };

  const handleToggleSuspend = (tenant: Tenant, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated: Tenant = {
      ...tenant,
      status: tenant.status === 'active' ? 'suspended' : 'active'
    };
    saveTenant(updated);
    addToast(`${tenant.name} status updated to ${updated.status}!`, 'info');
  };

  const handleImpersonateTenant = (tenant: Tenant, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveTenantId(tenant.id);
    setActiveNavId('dashboard');
    navigate(`/restaurant/${tenant.id}/dashboard`);
    addToast(`Switched context to ${tenant.name}. Live editing mode active.`, 'success');
  };

  const handleCloneTenant = (tenant: Tenant, e: React.MouseEvent) => {
    e.stopPropagation();
    const clonedId = `${tenant.id}-cloned-${Date.now()}`;
    const clonedName = `Copy of ${tenant.name}`;
    const clonedSlug = `${tenant.slug}-copy-${Math.floor(Math.random() * 1000)}`;
    const clonedTenant: Tenant = {
      ...tenant,
      id: clonedId,
      name: clonedName,
      slug: clonedSlug,
      createdAt: new Date().toISOString(),
    };
    saveTenant(clonedTenant);
    addToast(`Cloned "${tenant.name}" successfully!`, 'success');
  };



  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPlanFilter('all');
    setCuisineFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
    addToast('All filters and sorts reset', 'info');
  };

  if (detailedTenant) {
    return (
      <RestaurantDetailView
        tenant={detailedTenant}
        onClose={() => setDetailedTenant(null)}
        onSave={(updated) => saveTenant(updated)}
        onImpersonate={(tenant) => handleImpersonateTenant(tenant)}
        onToggleSuspend={(tenant) => {
          const fakeEvent = { stopPropagation: () => { } } as React.MouseEvent;
          handleToggleSuspend(tenant, fakeEvent);
        }}
        addToast={addToast}
      />
    );
  }

  return (
    <div className="space-y-6 w-full px-4 md:px-6 py-2 text-left font-sans animate-fade-in select-none">

      {/* Header Banner replaced with SimplePageHeader */}
      <SimplePageHeader
        title="Shops & Stores Directory"
        description="A comprehensive, paginated view of all your white-labeled shops and stores on the SaaS platform. Sort by rating or age, filter by plan and categories, and access live dashboards."
        categoryTag="SaaS Multi-Store Engine"
        icon={Building2}
        statusBadge={{
          text: "Shops Directory Live",
          pulseColor: "bg-emerald-500"
        }}
        actions={
          <Button variant="custom" size="none" onClick={() => navigate('/super-admin/restaurants/create')}
            className="flex items-center gap-2 px-4.5 h-10 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
          >
            <Plus size={14} />
            <span>Create Shop</span>
          </Button>
        }
      />

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4.5">
        <StatCard
          data={{
            id: 'dir-total',
            title: 'Registered Stores',
            value: stats.total.toString(),
            format: 'number',
            variant: 'white',
            trend: { direction: 'up', percent: 12, label: 'Growth' }
          }}
          actionIcon={<Building2 size={16} className="text-slate-400" />}
        />
        <StatCard
          data={{
            id: 'dir-active',
            title: 'Active Nodes',
            value: stats.active.toString(),
            format: 'number',
            variant: 'white',
            trend: { direction: 'up', percent: 8, label: 'Stable' }
          }}
          actionIcon={<Activity size={16} className="text-emerald-500" />}
        />
        <StatCard
          data={{
            id: 'dir-suspended',
            title: 'Suspended Nodes',
            value: stats.suspended.toString(),
            format: 'number',
            variant: 'white',
            trend: { direction: 'down', percent: 0, label: 'Under control' }
          }}
          actionIcon={<Ban size={16} className="text-rose-500" />}
        />
        <StatCard
          data={{
            id: 'dir-rating',
            title: 'Platform Avg CSAT',
            value: `${stats.avgRating} / 5.0`,
            format: 'number',
            variant: 'white',
            trend: { direction: 'up', percent: 2, label: 'Excellent' }
          }}
          actionIcon={<Star size={16} className="text-amber-500 fill-amber-500" />}
        />
      </div>

      {/* Filters and Sorting Container */}
      <div className="bg-white border border-slate-200/70 rounded-[2rem] p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <Input
              type="text"
              placeholder="Search by name, email, slug, cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto md:justify-end">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-2xl px-3 h-11">
              <ArrowUpDown size={14} className="text-slate-400" />
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="newest">Created: Newest First</option>
                <option value="oldest">Created: Oldest First</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="rating_desc">Rating: Highest First</option>
                <option value="rating_asc">Rating: Lowest First</option>
              </Select>
            </div>

            {/* Clear button if active */}
            {(searchQuery !== '' || statusFilter !== 'all' || planFilter !== 'all' || cuisineFilter !== 'all') && (
              <Button variant="custom" size="none" onClick={handleClearFilters}
                className="h-11 px-4 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 rounded-2xl transition-all cursor-pointer"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Extended Filter Rails */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Status Select */}
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Store Status</span>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full h-11 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-2xl px-4 focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer transition-all shadow-xs"
            >
              <option value="all">All Statuses (Active & Suspended)</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </Select>
          </div>

          {/* Plan Select */}
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Subscription Tier</span>
            <Select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as any)}
              className="w-full h-11 text-xs font-bold text-indigo-700 bg-indigo-50/20 border border-indigo-150 rounded-2xl px-4 focus:bg-white focus:outline-none focus:border-indigo-600 cursor-pointer transition-all shadow-xs"
            >
              <option value="all">All Plans</option>
              <option value="starter">Starter Plan (Small Store)</option>
              <option value="premium">Premium Plan (Large Standalone)</option>
              <option value="enterprise">Enterprise Plan (Multi-Branch Chain)</option>
            </Select>
          </div>

          {/* Cuisine Select */}
          <div className="space-y-1.5 text-left">
            <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Cuisine Focus</span>
            <Combobox
              options={[
                { value: 'all', label: 'All Cuisines' },
                ...cuisinesList.map((c) => ({ value: c, label: c })),
                ...(cuisinesList.length === 0
                  ? [
                    { value: 'Pizza', label: 'Pizza' },
                    { value: 'Burgers', label: 'Burgers' },
                    { value: 'Fine Dining', label: 'Fine Dining' },
                  ]
                  : []),
              ]}
              value={cuisineFilter}
              onChange={setCuisineFilter}
              placeholder="All Cuisines"
              searchPlaceholder="Search cuisines..."
              className="w-full h-11 text-xs font-bold text-slate-700 bg-slate-50 border-slate-200 rounded-2xl focus:bg-white"
            />
          </div>
        </div>
      </div>

      {/* Grid List & Pagination */}
      <div className="space-y-6">

        {/* Loading Skeletons */}
        {isFetching ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: Math.min(pageSize, 6) }).map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-6.5 space-y-5 shadow-sm animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                  </div>
                </div>
                <div className="space-y-2 pt-3 border-t border-slate-50">
                  <div className="h-3 bg-slate-200 rounded w-5/6" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
                <div className="flex gap-2 justify-between pt-4">
                  <div className="h-8 bg-slate-200 rounded-xl w-24" />
                  <div className="h-8 bg-slate-200 rounded-xl w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedTenants.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200/70 rounded-[2.5rem] py-16 px-4 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Building2 size={28} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-poppins font-bold text-slate-800 text-lg">No stores found</h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                We couldn't find any restaurant stores that match your active filters or query.
              </p>
            </div>
            <Button variant="custom" size="none" onClick={handleClearFilters}
              className="px-5 h-10 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md shadow-indigo-600/10 active:scale-95 transition-all cursor-pointer"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          /* Live Restaurants Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {paginatedTenants.map((tenant) => {
                const plan = tenant.subscriptionPlan || 'premium';

                return (
                  <motion.div
                    key={tenant.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={() => setDetailedTenant(tenant)}
                    className="group bg-white border border-slate-200/80 hover:border-slate-300 rounded-[2rem] p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden"
                  >
                    {/* Top Glow Accent */}
                    <div
                      className="absolute top-0 inset-x-0 h-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: tenant.brandColor }}
                    />

                    {/* Logo & Basic Identity */}
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                          <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm relative font-poppins"
                            style={{ backgroundColor: tenant.brandColor }}
                          >
                            <Utensils size={20} />
                            <span className="absolute -right-1 -bottom-1 w-4 h-4 rounded-full border border-white flex items-center justify-center bg-slate-950 text-[9px] font-extrabold text-white">
                              {tenant.name.charAt(0)}
                            </span>
                          </div>
                          <div className="text-left">
                            <h3 className="font-poppins font-extrabold text-slate-900 text-[15px] group-hover:text-indigo-600 transition-colors leading-snug">
                              {tenant.name}
                            </h3>
                            <span className="text-[10px] font-mono font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded mt-0.5 inline-block border border-slate-100">
                              /{tenant.slug}
                            </span>
                          </div>
                        </div>

                        {/* Status + Plan Badge */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${tenant.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                            <span className={`w-1 h-1 rounded-full ${tenant.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            {tenant.status}
                          </span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${plan === 'starter'
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : plan === 'enterprise'
                              ? 'bg-[#EEF2FF] text-[#3730A3] border border-indigo-100'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                            {plan}
                          </span>
                        </div>
                      </div>

                      {/* Descriptive Segment */}
                      <div className="space-y-3.5 text-left pt-2">
                        {tenant.tagline && (
                          <p className="text-xs text-slate-500 italic font-semibold line-clamp-1">
                            "{tenant.tagline}"
                          </p>
                        )}

                        {/* CSAT and Cuisine focus */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 pt-0.5">
                          <div className="flex items-center gap-1">
                            <Star size={13} className="text-amber-500 fill-amber-500" />
                            <span className="font-mono font-extrabold text-slate-800">{tenant.rating || '4.5'}</span>
                          </div>
                          {tenant.cuisine && (
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-slate-300 rounded-full" />
                              <span className="text-slate-500">{tenant.cuisine}</span>
                            </div>
                          )}
                        </div>

                        {/* Location Details */}
                        <div className="space-y-1.5 text-[11px] font-semibold text-slate-400 border-t border-slate-50 pt-3">
                          <div className="flex items-center gap-2">
                            <Mail size={12} className="text-slate-400 shrink-0" />
                            <span className="truncate text-slate-600 font-mono">{tenant.adminEmail}</span>
                          </div>
                          {tenant.phone && (
                            <div className="flex items-center gap-2">
                              <Phone size={12} className="text-slate-400 shrink-0" />
                              <span className="text-slate-600">{tenant.phone}</span>
                            </div>
                          )}
                          {tenant.address && (
                            <div className="flex items-center gap-2">
                              <MapPin size={12} className="text-slate-400 shrink-0" />
                              <span className="truncate text-slate-600">{tenant.address}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-slate-400 shrink-0" />
                            <span>Provisioned on {new Date(tenant.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Branding colors + Actions */}
                    <div className="flex items-center justify-between gap-4 mt-5 pt-4 border-t border-slate-100 shrink-0">

                      {/* Brand Palette */}
                      <div className="flex items-center gap-1 border border-slate-100 rounded-full p-1 bg-slate-50">
                        <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: tenant.brandColor }} title="Primary Color" />
                        <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: tenant.darkColor }} title="Dark Color" />
                        <span className="w-3 h-3 rounded-full border border-slate-200" style={{ backgroundColor: tenant.lightColor }} title="Light Color" />
                      </div>

                      {/* Card Row Buttons */}
                      <div className="flex items-center gap-2 no-row-click">
                        {/* Shop Details Info */}
                        <Button variant="custom" size="none" onClick={(e) => {
                          e.stopPropagation();
                          setDetailedTenant(tenant);
                        }}
                          title="View Shop Details"
                          className="w-8.5 h-8.5 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-blue-600 border border-slate-200/60 shadow-xs flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <Info size={14} />
                        </Button>

                        {/* Clone Tenant (Modern Circle matching notification/mail styling) */}
                        <Button variant="custom" size="none" onClick={(e) => handleCloneTenant(tenant, e)}
                          title="Clone Restaurant Store"
                          className="w-10.5 h-10.5 rounded-full bg-white border border-border-subtle shadow-button hover:bg-surface-hover hover:border-text-secondary/20 flex items-center justify-center text-text-secondary hover:text-[#10B981] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 shrink-0 animate-fade-in"
                        >
                          <Copy size={15} />
                        </Button>

                        {/* Open Dashboard / Impersonate (Modern Circle matching notification/mail styling) */}
                        <Button variant="custom" size="none" onClick={(e) => handleImpersonateTenant(tenant, e)}
                          title="Open Restaurant Live Dashboard"
                          className="w-10.5 h-10.5 rounded-full bg-white border border-border-subtle shadow-button hover:bg-surface-hover hover:border-text-secondary/20 flex items-center justify-center text-text-secondary hover:text-[#4F46E5] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 shrink-0 animate-fade-in"
                        >
                          <ExternalLink size={15} />
                        </Button>

                        {/* Edit Visuals */}
                        <Button variant="custom" size="none" onClick={(e) => handleEditClick(tenant, e)}
                          title="Edit Branding Parameters"
                          className="w-8.5 h-8.5 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 border border-slate-200/60 shadow-xs flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-400"
                        >
                          <Palette size={14} />
                        </Button>

                        {/* Toggle status */}
                        <Button variant="custom" size="none" onClick={(e) => handleToggleSuspend(tenant, e)}
                          title={tenant.status === 'active' ? 'Suspend Access' : 'Activate Access'}
                          className="w-8.5 h-8.5 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-amber-600 border border-slate-200/60 shadow-xs flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          {tenant.status === 'active' ? <Ban size={14} /> : <UserCheck size={14} />}
                        </Button>

                        {/* Delete */}
                        <Button variant="custom" size="none" onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Permanently de-provision restaurant "${tenant.name}"? All menus, users, and local files will be lost.`)) {
                            deleteTenant(tenant.id);
                          }
                        }}
                          title="De-provision Store"
                          className="w-8.5 h-8.5 rounded-full bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 flex items-center justify-center transition-all duration-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-rose-500"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>

                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Custom Pagination Controls bar */}
        {!isFetching && totalItems > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-1 select-none">
            <span className="text-xs sm:text-sm text-text-secondary font-semibold">
              Showing <span className="font-extrabold text-text-primary">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-extrabold text-text-primary">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
              <span className="font-extrabold text-text-primary">{totalItems}</span> registered stores
            </span>

            <div className="flex items-center gap-4">
              {/* Rows Per Page Select */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-secondary font-semibold whitespace-nowrap">Stores per page</span>
                <Select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="text-xs font-bold text-text-primary bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-indigo-600 cursor-pointer shadow-xs transition-colors"
                >
                  {[6, 10, 15, 20].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Prev / Next Pagination Controls */}
              <div className="flex items-center gap-1">
                <Button variant="custom" size="none" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400 transition-all cursor-pointer shadow-xs"
                >
                  <ChevronLeft size={16} />
                </Button>

                <span className="text-xs font-extrabold text-slate-700 px-3 py-1.5 bg-slate-50 border border-slate-150 rounded-xl">
                  Page {currentPage} of {totalPages}
                </span>

                <Button variant="custom" size="none" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400 transition-all cursor-pointer shadow-xs"
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
