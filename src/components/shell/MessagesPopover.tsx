import React, { useState, useRef, useEffect } from 'react';import { Button } from '@/components/ui/Button';

import { motion, AnimatePresence } from 'motion/react';
import { Mail, MessageSquare, Clock, CheckSquare } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useTenantStore } from '../../store/tenantStore';
import { useUIStore } from '../../store/uiStore';;
import { IconButton } from './IconButton';

interface MessageItem {
  id: string;
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  targetNavId: string;
}

export function MessagesPopover() {
  const { isSuperAdmin } = useAuthStore();
  const { activeTenantId } = useTenantStore();
  const { addToast } = useUIStore();;
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize with realistic mock messages
  const [messages, setMessages] = useState<MessageItem[]>(() => {
    const stored = localStorage.getItem('indolj_portal_messages');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // fallback
      }
    }
    return [
      {
        id: 'msg-1',
        title: 'Support Ticket Escalated',
        description: 'Refund request for incorrect delivery on order #8721 has been marked urgent.',
        time: '12m ago',
        isRead: false,
        targetNavId: 'support-escalations', // resolves to super-escalations or help
      },
      {
        id: 'msg-2',
        title: 'New Customer Feedback',
        description: 'Alice Johnson left a review: "Loved the gluten-free crust, will order again!"',
        time: '1h ago',
        isRead: false,
        targetNavId: 'customers',
      },
      {
        id: 'msg-3',
        title: 'Menu Item Request Approved',
        description: 'Saffron Grilled Sea Bass draft has been approved and published to active menu list.',
        time: '4h ago',
        isRead: true,
        targetNavId: 'menu',
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('indolj_portal_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = messages.filter(m => !m.isRead).length;

  const handleItemClick = (msg: MessageItem) => {
    // Mark as read
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isRead: true } : m));
    setIsOpen(false);

    // Resolve navigation target
    let resolvedId = msg.targetNavId;
    if (msg.targetNavId === 'support-escalations') {
      resolvedId = isSuperAdmin ? 'super-escalations' : 'help';
    }

    addToast(`Navigating to ${msg.title}`, 'info');

    // Route transitions
    if (resolvedId === 'super-escalations') {
      window.history.pushState(null, '', '/super-admin/escalations');
    } else if (resolvedId === 'super-reports') {
      window.history.pushState(null, '', '/super-admin/reports');
    } else if (resolvedId === 'superadmin') {
      window.history.pushState(null, '', '/super-admin/dashboard');
    } else {
      window.history.pushState(null, '', `/restaurant/${activeTenantId}/${resolvedId}`);
    }
    window.dispatchEvent(new Event('popstate'));
  };

  const handleMarkAllRead = () => {
    setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
    addToast('All messages marked as read.', 'success');
  };

  return (
    <div className="relative" ref={containerRef}>
      <IconButton
        aria-label="Inbox communications"
        badgeCount={unreadCount}
        onClick={() => setIsOpen(!isOpen)}
        className={isOpen ? 'border-accent-primary text-accent-primary bg-accent-tint-bg' : ''}
      >
        <Mail size={18} />
      </IconButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-[-110px] xs:right-[-40px] sm:right-0 mt-2.5 w-[280px] xs:w-80 sm:w-96 bg-white rounded-2xl border border-border-subtle shadow-shell overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MessageSquare size={15} className="text-accent-primary shrink-0" />
                  <span className="font-poppins font-bold text-xs sm:text-sm text-text-primary truncate">Inbox Communications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="bg-accent-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                    {unreadCount} new
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
              {messages.length === 0 ? (
                <div className="py-8 px-4 text-center text-text-secondary">
                  <Mail size={24} className="mx-auto text-text-secondary/40 mb-2" />
                  <p className="text-xs font-semibold">Your inbox is clear</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <Button variant="custom" size="none"                     key={msg.id}
                    onClick={() => handleItemClick(msg)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex gap-3 relative cursor-pointer group ${!msg.isRead ? 'bg-[#FAFAFA]' : ''
                      }`}
                  >
                    {!msg.isRead && (
                      <span className="absolute top-4.5 right-4 w-2 h-2 rounded-full bg-accent-primary" />
                    )}

                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
                      <MessageSquare size={14} />
                    </div>

                    <div className="space-y-1 pr-4">
                      <p className={`text-xs font-bold ${!msg.isRead ? 'text-text-primary' : 'text-text-secondary'}`}>
                        {msg.title}
                      </p>
                      <p className="text-[11px] text-text-secondary font-medium leading-normal">
                        {msg.description}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-text-secondary/60 font-bold">
                        <Clock size={10} />
                        <span>{msg.time}</span>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-border-subtle text-center">
              <Button variant="custom" size="none"                 onClick={() => {
                  setIsOpen(false);
                  const targetId = isSuperAdmin ? 'super-escalations' : 'help';
                  if (targetId === 'super-escalations') {
                    window.history.pushState(null, '', '/super-admin/escalations');
                  } else {
                    window.history.pushState(null, '', `/restaurant/${activeTenantId}/help`);
                  }
                  window.dispatchEvent(new Event('popstate'));
                }}
                className="text-[11px] font-bold text-accent-primary hover:text-accent-dark cursor-pointer transition-colors"
              >
                View all support tickets
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
