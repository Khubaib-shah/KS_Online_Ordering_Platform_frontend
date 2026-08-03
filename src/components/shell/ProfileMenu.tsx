
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';
import { AdminUser } from '@/types/user';
import { CurrentUser } from '@/lib/security';


interface ProfileMenuProps {
  user: AdminUser | CurrentUser | null;
}

export function ProfileMenu({ user }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { setActiveNavId } = useUIStore();;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-hover animate-pulse" />
        <div className="hidden sm:block flex-col gap-1.5">
          <div className="w-24 h-4 bg-surface-hover rounded animate-pulse" />
          <div className="w-32 h-3 bg-surface-hover rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button variant="custom" size="none" onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1 rounded-full hover:bg-surface-hover transition-colors duration-200 cursor-pointer group"
      >
        <Avatar src={user.avatarUrl} alt={user.name} size="md" />

        <div className="hidden md:flex flex-col items-start text-left select-none">
          <span className="font-poppins font-semibold text-sm text-text-primary leading-none group-hover:text-accent-primary transition-colors">
            {user.name}
          </span>
          <span className="font-inter text-[11px] text-text-secondary mt-0.5 leading-none">
            {user.email}
          </span>
        </div>

        <ChevronDown size={14} className={`text-text-secondary transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-text-primary' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-2xl border border-border-subtle shadow-shell p-1.5 z-50 origin-top-right select-none"
          >
            <div className="px-3 py-2 border-b border-border-subtle mb-1 text-left">
              <span className="block text-xs font-bold font-inter text-accent-primary uppercase tracking-wider">{user.role || ('globalRole' in user ? user.globalRole : 'USER')}</span>
            </div>

            <Button variant="custom" size="none" onClick={() => {
              setActiveNavId('dashboard');
              setIsOpen(false);
            }}
              className="w-full flex items-center justify-start gap-2.5 px-3 py-2 rounded-xl text-sm font-medium font-inter text-text-secondary hover:text-text-primary hover:bg-surface-hover cursor-pointer transition-colors"
            >
              <User size={15} />
              <span>Profile</span>
            </Button>

            <Button variant="custom" size="none" onClick={() => {
              setActiveNavId('settings');
              setIsOpen(false);
            }}
              className="w-full flex items-center justify-start gap-2.5 px-3 py-2 rounded-xl text-sm font-medium font-inter text-text-secondary hover:text-text-primary hover:bg-surface-hover cursor-pointer transition-colors"
            >
              <SettingsIcon size={15} />
              <span>Settings</span>
            </Button>

            <div className="h-px bg-border-subtle my-1" />

            <Button variant="custom" size="none" onClick={() => {
              setActiveNavId('logout');
              setIsOpen(false);
            }}
              className="w-full flex items-center justify-start gap-2.5 px-3 py-2 rounded-xl text-sm font-medium font-inter text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
