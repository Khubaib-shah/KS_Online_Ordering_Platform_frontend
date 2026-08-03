import { Select } from '../ui/Select';import { Button } from '@/components/ui/Button';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/Input';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, ShoppingBag, Flame, AlertTriangle, FileText, Clock, CheckSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { useUIStore } from '../../store/uiStore';;
import { IconButton } from './IconButton';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  type: 'order' | 'kitchen' | 'stock' | 'billing';
  targetNavId: string;
}

export function NotificationsPopover() {
    const { isSuperAdmin } = useAuthStore();
  const { activeTenantId } = useTenantStore();
  const { addToast } = useUIStore();;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize realistic mock notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const stored = localStorage.getItem('indolj_portal_notifications');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'notif-1',
        title: 'New Order #4892 Received',
        description: 'Rs. 1,250 order from Table 4 requires immediate review and status update.',
        time: '3m ago',
        isRead: false,
        type: 'order',
        targetNavId: 'orders',
      },
      {
        id: 'notif-2',
        title: 'Kitchen Delay Alert',
        description: 'Order #4881 has been active in preparation mode for over 25 minutes.',
        time: '18m ago',
        isRead: false,
        type: 'kitchen',
        targetNavId: 'kitchen',
      },
      {
        id: 'notif-3',
        title: 'Low Ingredient Level Warning',
        description: 'Saffron flower extract inventory level dropped below safe threshold (0.5 liter).',
        time: '2h ago',
        isRead: true,
        type: 'stock',
        targetNavId: 'menu',
      },
      {
        id: 'notif-4',
        title: 'SaaS Bill Receipt Ready',
        description: 'Your premium restaurant tenant monthly invoice for July 2026 has been generated.',
        time: '1d ago',
        isRead: true,
        type: 'billing',
        targetNavId: 'billing-reports', // resolves to super-reports or settings
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('indolj_portal_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleItemClick = (notif: NotificationItem) => {
    // Mark as read
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
    setIsOpen(false);

    // Resolve target path
    let resolvedId = notif.targetNavId;
    if (notif.targetNavId === 'billing-reports') {
      resolvedId = isSuperAdmin ? 'super-reports' : 'settings';
    }

    addToast(`Navigating to ${notif.title}`, 'info');

    // Route transitions
    if (resolvedId === 'super-reports') {
      window.history.pushState(null, '', '/super-admin/reports');
    } else if (resolvedId === 'superadmin') {
      window.history.pushState(null, '', '/super-admin/dashboard');
    } else {
      window.history.pushState(null, '', `/restaurant/${activeTenantId}/${resolvedId}`);
    }
    window.dispatchEvent(new Event('popstate'));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    addToast('All notifications marked as read.', 'success');
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return <ShoppingBag size={14} className="text-emerald-600" />;
      case 'kitchen':
        return <Flame size={14} className="text-rose-600" />;
      case 'stock':
        return <AlertTriangle size={14} className="text-amber-600" />;
      case 'billing':
        return <FileText size={14} className="text-indigo-600" />;
    }
  };

  const getBgClass = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return 'bg-emerald-50 border-emerald-100/60';
      case 'kitchen':
        return 'bg-rose-50 border-rose-100/60';
      case 'stock':
        return 'bg-amber-50 border-amber-100/60';
      case 'billing':
        return 'bg-indigo-50 border-indigo-100/60';
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <IconButton 
        aria-label="Alert notification feed" 
        badge={unreadCount > 0} 
        onClick={() => setIsOpen(!isOpen)}
        className={isOpen ? 'border-accent-primary text-accent-primary bg-accent-tint-bg' : ''}
      >
        <Bell size={18} />
      </IconButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-[-60px] xs:right-0 mt-2.5 w-[280px] xs:w-80 sm:w-96 bg-white rounded-2xl border border-border-subtle shadow-shell overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Bell size={15} className="text-accent-primary shrink-0 animate-bounce" />
                  <span className="font-poppins font-bold text-xs sm:text-sm text-text-primary truncate">Notification Center</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-accent-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    {unreadCount} alerts
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <Button variant="custom" size="none"                   onClick={handleMarkAllRead}
                  className="text-[10px] sm:text-[11px] font-bold text-accent-primary hover:text-accent-dark flex items-center gap-1 cursor-pointer transition-colors shrink-0 self-end sm:self-auto"
                >
                  <CheckSquare size={12} />
                  <span>Mark all read</span>
                </Button>
              )}
            </div>

            {/* List */}
            <div className="divide-y divide-border-subtle max-h-80 overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-8 px-4 text-center text-text-secondary">
                  <Bell size={24} className="mx-auto text-text-secondary/40 mb-2" />
                  <p className="text-xs font-semibold">No recent alerts</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <Button variant="custom" size="none"                     key={notif.id}
                    onClick={() => handleItemClick(notif)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex gap-3 relative cursor-pointer group ${
                      !notif.isRead ? 'bg-[#FAFAFA]' : ''
                    }`}
                  >
                    {!notif.isRead && (
                      <span className="absolute top-4.5 right-4 w-2 h-2 rounded-full bg-accent-primary" />
                    )}

                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-200 ${getBgClass(notif.type)}`}>
                      {getIcon(notif.type)}
                    </div>

                    <div className="space-y-1 pr-4">
                      <p className={`text-xs font-bold ${!notif.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {notif.title}
                      </p>
                      <p className="text-[11px] text-text-secondary font-medium leading-normal">
                        {notif.description}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-text-secondary/60 font-bold">
                        <Clock size={10} />
                        <span>{notif.time}</span>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-border-subtle text-center">
              <Button variant="custom" size="none" 
                onClick={() => {
                  setIsOpen(false);
                  window.history.pushState(null, '', `/restaurant/${activeTenantId}/orders`);
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="text-[11px] font-bold text-accent-primary hover:text-accent-dark cursor-pointer transition-colors"
              >
                Go to Live Orders Monitor
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
