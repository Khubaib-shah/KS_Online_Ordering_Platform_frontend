import React, { useState, useEffect, useRef, useMemo } from 'react'; import { Button } from '@/components/ui/Button';

import { Input } from '@/components/ui/Input';
import { useBranchStore } from '@/store/branchStore';
import { useUIStore } from '@/store/uiStore';;
import {
  Search,
  Command,
  ArrowRight,
  Sparkles,
  Sliders,
  ShoppingBag,
  FolderHeart,
  Award,
  LayoutGrid,
  BarChart3,
  Users,
  Settings,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  Building,
  Zap,
  ToggleLeft,
  X
} from 'lucide-react';
import { Order } from '@/types/order';
import { getTenantKey } from '@/lib/security';
import { menuApi } from '@/lib/api/menu.api';
import { PLATFORM_PREFIX } from '@/lib/constants';

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Actions' | 'Navigation' | 'Branch Filters';
  icon: React.ComponentType<{ size: number; className?: string }>;
  action: () => void;
  shortcut?: string;
}

export function CommandPalette() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { branches, activeBranchFilterId, setBranchFilter } = useBranchStore();
  const { commandPaletteOpen, setCommandPaletteOpen, setActiveNavId, setMenuActiveTab, setOpenAddItemTrigger, setOpenAddCategoryTrigger, setOpenAddPromoTrigger, addToast } = useUIStore();;

  // Dynamic + Static Command Generator
  const commands = useMemo((): CommandItem[] => {
    const list: CommandItem[] = [
      // Operations Actions
      {
        id: 'simulate-live-order',
        title: 'Create Sample Customer Order',
        subtitle: 'Add a sample customer order to your active orders list',
        category: 'Actions',
        icon: Zap,
        action: async () => {
          const menuItems = await menuApi.getMenuItems();
          const itemsToUse = menuItems.length > 0 ? menuItems : [];
          if (itemsToUse.length === 0) {
            addToast('No menu items available to simulate order.', 'error');
            return;
          }
          const pakNames = [
            'Faizan Rasheed',
            'Maria Khattak',
            'Danish Qureshi',
            'Sanaullah Khan',
            'Ayesha Siddiqui',
            'Zainab Naqvi',
            'Bilal Farooq',
            'Khurram Shehzad'
          ];
          const pakPhones = [
            '0300-1293812',
            '0321-4829311',
            '0333-7281932',
            '0312-3920192',
            '0345-8910291',
            '0301-4729102'
          ];
          const karachiAreas = [
            'Clifton Block 4',
            'DHA Phase 6',
            'PECHS Block 2',
            'Gulshan-e-Iqbal Block 13D',
            'Bahadurabad Street 5'
          ];
          const streets = [
            'House 42-A, Lane 3',
            'Flat 102, Indolj Heights',
            'Plot 92-C, Commercial Area',
            'House 12, Main Jinnah Rd'
          ];

          const numItems = Math.floor(Math.random() * 2) + 1;
          const itemsList: Order['items'] = [];
          let subtotal = 0;

          for (let i = 0; i < numItems; i++) {
            const randomItem = itemsToUse[Math.floor(Math.random() * itemsToUse.length)];
            const qty = Math.floor(Math.random() * 2) + 1;
            const total = (randomItem.discountPrice || randomItem.basePrice || 0) * qty;
            subtotal += total;

            itemsList.push({
              id: `item-${Date.now()}-${i}`,
              name: randomItem.name,
              qty,
              unitPrice: randomItem.discountPrice || randomItem.basePrice || 0,
              total,
              selectedVariants: []
            });
          }

          const tax = Math.round(subtotal * 0.13);
          const deliveryFee = Math.random() > 0.3 ? 150 : 0;
          const grandTotal = subtotal + tax + deliveryFee;

          const customerName = pakNames[Math.floor(Math.random() * pakNames.length)];
          const customerPhone = pakPhones[Math.floor(Math.random() * pakPhones.length)];
          const orderArea = karachiAreas[Math.floor(Math.random() * karachiAreas.length)];
          const orderStreet = streets[Math.floor(Math.random() * streets.length)];

          const activeBranchId = activeBranchFilterId !== 'all' ? activeBranchFilterId : (branches[0]?.id || 'indolj-gulshan');
          const activeBranchObj = branches.find(b => b.id === activeBranchId) || branches[0];
          const branchName = activeBranchObj ? activeBranchObj.name : 'Main Branch';

          const newSimulatedOrder: Order = {
            orderNumber: `GHL-${Date.now().toString().slice(-6)}-SIM`,
            placedAt: new Date().toISOString(),
            customer: {
              id: `cust-${Date.now()}`,
              name: customerName,
              phone: customerPhone,
              email: `${customerName.toLowerCase().replace(/\s/g, '')}@gmail.com`
            },
            items: itemsList,
            subtotal,
            tax,
            deliveryFee,
            discount: 0,
            grandTotal,
            paymentMethod: Math.random() > 0.5 ? 'CASH' : 'ONLINE',
            paymentStatus: 'UNPAID',
            status: 'PENDING',
            delivery: {
              type: 'DELIVERY',
              area: orderArea,
              address: `${orderStreet}, ${orderArea}, Karachi`
            },
            timeline: [
              {
                status: 'pending',
                timestamp: new Date().toISOString(),
                note: 'Order simulated via live Command Palette.'
              }
            ],
            notes: [],
            branchId: activeBranchId,
            branchName
          };

          const key = getTenantKey(`${PLATFORM_PREFIX}_orders`);
          const existingData = localStorage.getItem(key);
          const ordersArray = existingData ? JSON.parse(existingData) : [];
          ordersArray.unshift(newSimulatedOrder);
          localStorage.setItem(key, JSON.stringify(ordersArray));

          addToast(`Simulated live order from ${customerName} (Rs. ${grandTotal.toLocaleString()})`, 'success');

          // Trigger updates by simulating natural route refresh
          window.dispatchEvent(new Event('popstate'));
        }
      },
      {
        id: 'toggle-store-status',
        title: 'Change Store Status',
        subtitle: 'Switch your shop status between open and closed',
        category: 'Actions',
        icon: ToggleLeft,
        action: () => {
          const key = `${PLATFORM_PREFIX}_store_closed_override`;
          const isClosed = localStorage.getItem(key) === 'true';
          localStorage.setItem(key, isClosed ? 'false' : 'true');
          addToast(
            `Store status set to ${isClosed ? 'Open (Accepting Orders)' : 'Closed (Suspended)'}`,
            isClosed ? 'success' : 'error'
          );
        }
      },
      {
        id: 'add-product',
        title: 'Add New Menu Item',
        subtitle: 'Add a dish or product with prices and options',
        category: 'Actions',
        icon: Sparkles,
        action: () => {
          setActiveNavId('menu');
          setMenuActiveTab('items');
          setTimeout(() => setOpenAddItemTrigger(true), 50);
          addToast('Opening Add Menu Item form', 'info');
        }
      },
      {
        id: 'add-category',
        title: 'Add New Food Category',
        subtitle: 'Add a category to organize your menu',
        category: 'Actions',
        icon: FolderHeart,
        action: () => {
          setActiveNavId('menu');
          setMenuActiveTab('categories');
          setTimeout(() => setOpenAddCategoryTrigger(true), 50);
          addToast('Opening Add Category form', 'info');
        }
      },
      {
        id: 'add-promo',
        title: 'Create Discount Code',
        subtitle: 'Create a discount coupon or free delivery deal',
        category: 'Actions',
        icon: Award,
        action: () => {
          setActiveNavId('menu');
          setMenuActiveTab('promos');
          setTimeout(() => setOpenAddPromoTrigger(true), 50);
          addToast('Opening Create Coupon form', 'info');
        }
      },

      // Branch Switching Dynamic Commands
      {
        id: 'branch-all',
        title: 'Show All Branches',
        subtitle: 'Combine information from all of your shops',
        category: 'Branch Filters',
        icon: Building,
        action: () => {
          setBranchFilter('all');
        }
      },
      ...branches.map((b): CommandItem => ({
        id: `branch-select-${b.id}`,
        title: `Switch to ${b.name}`,
        subtitle: `View only items and orders for this location`,
        category: 'Branch Filters',
        icon: Building,
        action: () => {
          setBranchFilter(b.id);
        }
      })),

      // Navigation
      {
        id: 'nav-dashboard',
        title: 'Go to Dashboard',
        subtitle: 'View sales overview, key numbers, and recent activity',
        category: 'Navigation',
        icon: LayoutGrid,
        action: () => setActiveNavId('dashboard'),
        shortcut: 'Ctrl+1'
      },
      {
        id: 'nav-orders',
        title: 'Go to Orders Feed',
        subtitle: 'View and update orders or print customer receipts',
        category: 'Navigation',
        icon: ShoppingBag,
        action: () => setActiveNavId('orders'),
        shortcut: 'Ctrl+2'
      },
      {
        id: 'nav-menu',
        title: 'Go to Menu',
        subtitle: 'Update food dishes, categories, and active coupons',
        category: 'Navigation',
        icon: Sliders,
        action: () => {
          setActiveNavId('menu');
          setMenuActiveTab('items');
        },
        shortcut: 'Ctrl+3'
      },
      {
        id: 'nav-reports',
        title: 'Go to Business Reports',
        subtitle: 'Check sales trends, performance, and revenue reports',
        category: 'Navigation',
        icon: BarChart3,
        action: () => setActiveNavId('reports'),
        shortcut: 'Ctrl+4'
      },
      {
        id: 'nav-customers',
        title: 'Go to Customer List',
        subtitle: 'View your customers and their order history',
        category: 'Navigation',
        icon: Users,
        action: () => setActiveNavId('customers'),
        shortcut: 'Ctrl+5'
      },
      {
        id: 'nav-settings',
        title: 'Go to Settings',
        subtitle: 'Manage opening hours, branding, and notification settings',
        category: 'Navigation',
        icon: Settings,
        action: () => setActiveNavId('settings'),
        shortcut: 'Ctrl+6'
      },
      {
        id: 'nav-help-shortcuts',
        title: 'View Help & Support Guides',
        subtitle: 'Read simple setup guides, answers to questions, and shortcuts',
        category: 'Navigation',
        icon: HelpCircle,
        action: () => {
          setActiveNavId('help');
          window.location.hash = 'shortcuts-guide';
          addToast('Navigated to Help & Support Guides', 'info');
          setTimeout(() => {
            const el = document.getElementById('shortcuts-guide');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        },
        shortcut: '?'
      }
    ];

    return list;
  }, [branches, activeBranchFilterId, setBranchFilter, setActiveNavId, setMenuActiveTab, setOpenAddItemTrigger, setOpenAddCategoryTrigger, setOpenAddPromoTrigger, addToast]);

  // Keyboard listeners (Ctrl+K or Cmd+K toggling, Ctrl+1 through Ctrl+6 navigation)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
        setSearchQuery('');
        setSelectedIndex(0);
        return;
      }

      if ((e.ctrlKey || e.metaKey) && ['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        e.preventDefault();
        const map: Record<string, string> = {
          '1': 'dashboard',
          '2': 'orders',
          '3': 'menu',
          '4': 'reports',
          '5': 'customers',
          '6': 'settings'
        };
        const navId = map[e.key];
        if (navId) {
          setActiveNavId(navId);
          addToast(`Navigated to ${navId.toUpperCase()}`, 'info');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [commandPaletteOpen, setCommandPaletteOpen, setActiveNavId, addToast]);

  // Focus input and lock body scrolling when open
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 150);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [commandPaletteOpen]);

  // Filter commands by search query
  const filteredCommands = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return commands;
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(query) ||
        cmd.subtitle.toLowerCase().includes(query) ||
        cmd.category.toLowerCase().includes(query)
    );
  }, [commands, searchQuery]);

  // Keyboard navigation within list
  useEffect(() => {
    if (!commandPaletteOpen || filteredCommands.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          setCommandPaletteOpen(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, selectedIndex, filteredCommands, setCommandPaletteOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (commandPaletteOpen) {
      const el = document.getElementById(`cmd-item-${selectedIndex}`);
      if (el) {
        el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex, commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && setCommandPaletteOpen(false)}
      className="fixed inset-0 z-50 bg-[#0F172A]/40 backdrop-blur-sm flex items-start justify-center p-4 md:p-16 animate-fade-in"
    >
      <div className="w-full max-w-2xl bg-white border border-border-subtle rounded-3xl shadow-2xl overflow-hidden mt-8 flex flex-col max-h-[80vh] animate-slide-up select-none">

        {/* Search Header Area */}
        <div className="relative  flex items-center px-6 py-4">
          <Search size={20} className="text-text-secondary shrink-0" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for pages or actions..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="shadow-none !border-transparent focus-visible:!border-transparent focus-visible:!ring-0 bg-transparent"
          />
          <Button variant="custom" size="none" onClick={() => {
            setActiveNavId('help');
            window.location.hash = 'shortcuts-guide';
            setCommandPaletteOpen(false);
            addToast('Navigated to Help & Support Guides', 'info');
          }}
            title="View Keyboard Shortcuts Guide"
            className="text-accent-dark bg-accent-tint-bg hover:opacity-90 border border-accent-light/20 shadow-xs p-2 rounded-xl transition-all mr-2 shrink-0 flex items-center justify-center cursor-pointer"
          >
            <HelpCircle size={15} />
          </Button>
          <Button variant="custom" size="none" onClick={() => setCommandPaletteOpen(false)}
            className="text-[10px] font-bold text-text-secondary bg-white border border-border-subtle shadow-xs hover:bg-slate-50 px-3 py-2 rounded-xl transition-all shrink-0"
          >
            ESC
          </Button>
        </div>

        {/* Content Panel (2/3 List, 1/3 Right Column Helpers) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border-subtle">

          {/* Main List Column */}
          <div className="col-span-2 p-3 overflow-y-auto max-h-[380px] no-scrollbar space-y-4">
            {filteredCommands.length === 0 ? (
              <div className="p-10 text-center text-text-secondary">
                <Command size={28} className="mx-auto mb-2 opacity-50 text-accent-primary" />
                <p className="text-sm font-semibold text-text-primary">No commands match your query</p>
                <p className="text-xs mt-1 text-text-secondary">Try searching &apos;dashboard&apos;, &apos;orders&apos;, or &apos;menu&apos;</p>
              </div>
            ) : (
              <div>
                {/* Categories group layout */}
                {(['Actions', 'Branch Filters', 'Navigation'] as const).map((category) => {
                  const catCmds = filteredCommands.filter((c) => c.category === category);
                  if (catCmds.length === 0) return null;

                  return (
                    <div key={category} className="mb-4 last:mb-0">
                      <h3 className="px-3 py-1 text-[10px] font-bold text-text-secondary uppercase tracking-widest mb-1.5 font-inter">
                        {category}
                      </h3>
                      <div className="space-y-1">
                        {catCmds.map((cmd) => {
                          const globalIdx = filteredCommands.findIndex((fc) => fc.id === cmd.id);
                          const isSelected = globalIdx === selectedIndex;
                          const Icon = cmd.icon;

                          return (
                            <div
                              key={cmd.id}
                              id={`cmd-item-${globalIdx}`}
                              onClick={() => {
                                cmd.action();
                                setCommandPaletteOpen(false);
                              }}
                              onMouseEnter={() => setSelectedIndex(globalIdx)}
                              className={`
                                flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-150
                                ${isSelected
                                  ? 'bg-accent-dark text-white shadow-md'
                                  : 'hover:bg-slate-50 text-text-primary'
                                }
                              `}
                            >
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className={`
                                  w-7.5 h-7.5 rounded-lg flex items-center justify-center border transition-colors shrink-0
                                  ${isSelected
                                    ? 'bg-white/10 border-white/10 text-white'
                                    : 'bg-slate-50 border-border-subtle/40 text-accent-primary'
                                  }
                                `}>
                                  <Icon size={14} />
                                </div>
                                <div className="text-left min-w-0">
                                  <p className="text-xs font-bold leading-tight truncate">{cmd.title}</p>
                                  <p className={`
                                    text-[10px] leading-tight mt-0.5 truncate
                                    ${isSelected ? 'text-white/85' : 'text-text-secondary'}
                                  `}>
                                    {cmd.subtitle}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {cmd.shortcut && (
                                  <kbd className={`
                                    text-[9px] font-mono px-1.5 py-0.5 rounded border shadow-sm select-none transition-colors
                                    ${isSelected
                                      ? 'bg-white/20 border-white/20 text-white'
                                      : 'bg-white border-border-subtle text-text-secondary font-semibold'
                                    }
                                  `}>
                                    {cmd.shortcut}
                                  </kbd>
                                )}
                                <ArrowRight size={13} className={`opacity-60 shrink-0 ${isSelected ? 'translate-x-0.5' : ''} transition-transform`} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Hotkeys & Operational Legend (Right 1/3) */}
          <div className="p-4 bg-slate-50/50 flex flex-col justify-between max-h-[380px] text-xs">
            <div>
              <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Command size={14} className="text-accent-dark" />
                <span>Hotkey Manual</span>
              </h4>
              <div className="space-y-2.5 font-inter">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-medium">Launcher</span>
                  <kbd className="font-mono bg-white border border-border-subtle px-1.5 py-0.5 rounded shadow-2xs font-bold text-text-primary">Ctrl + K</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-medium">Dashboard</span>
                  <kbd className="font-mono bg-white border border-border-subtle px-1.5 py-0.5 rounded shadow-2xs font-bold text-text-primary">Ctrl + 1</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-medium">Orders Feed</span>
                  <kbd className="font-mono bg-white border border-border-subtle px-1.5 py-0.5 rounded shadow-2xs font-bold text-text-primary">Ctrl + 2</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-medium">Menu Catalog</span>
                  <kbd className="font-mono bg-white border border-border-subtle px-1.5 py-0.5 rounded shadow-2xs font-bold text-text-primary">Ctrl + 3</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-medium">Reports</span>
                  <kbd className="font-mono bg-white border border-border-subtle px-1.5 py-0.5 rounded shadow-2xs font-bold text-text-primary">Ctrl + 4</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-medium">Settings</span>
                  <kbd className="font-mono bg-white border border-border-subtle px-1.5 py-0.5 rounded shadow-2xs font-bold text-text-primary">Ctrl + 6</kbd>
                </div>
              </div>
            </div>

            {/* Quick action legend */}
            <div className="border-t border-border-subtle pt-3 text-[10px] text-text-secondary font-medium space-y-1.5">
              <div className="flex items-center gap-1.5">
                <ArrowUp size={12} className="text-accent-dark" />
                <ArrowDown size={12} className="text-accent-dark" />
                <span>to navigate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="font-mono bg-white border border-border-subtle px-1 py-0.2 rounded shadow-2xs text-text-primary font-bold">↵</kbd>
                <span>to execute command</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
