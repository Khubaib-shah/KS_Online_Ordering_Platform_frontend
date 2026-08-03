import { Select } from '../ui/Select';
import React from 'react';
import { Input } from '../ui/Input';
import { motion } from 'motion/react';
import { MessageSquare } from 'lucide-react';
import { useTenantStore } from '../../store/tenantStore';
import { useUIStore } from '../../store/uiStore';;

export function SidebarPromoCard() {
    const { activeTenantId } = useTenantStore();
  const { setActiveNavId } = useUIStore();;

  const handleContactClick = () => {
    setActiveNavId('help');
    window.history.pushState(null, '', `/restaurant/${activeTenantId || 'indolj-main'}/help#contact-form`);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-5 rounded-promo-card text-white relative overflow-hidden bg-gradient-to-br from-accent-dark to-[#0A3826] border border-accent-primary shadow-card mt-auto shrink-0 select-none group"
    >
      {/* Subtle background abstract blobs */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-accent-light opacity-10 blur-xl transition-all duration-300 group-hover:scale-110" />
      <div className="absolute -left-10 -top-10 w-20 h-20 rounded-full bg-white opacity-5 blur-xl" />

      <div className="relative z-10 flex flex-col gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-accent-light border border-white/10 shrink-0">
          <MessageSquare size={16} />
        </div>
        
        <div>
          <h4 className="font-poppins font-semibold text-sm leading-tight">Need help today?</h4>
          <p className="font-inter text-xs text-white/70 mt-1 leading-snug">
            Reach our operations support team anytime.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleContactClick}
          className="w-full h-9 bg-white text-accent-dark rounded-full font-inter font-semibold text-xs transition-colors hover:bg-accent-tint-bg shadow-button cursor-pointer mt-1 flex items-center justify-center gap-1.5"
        >
          <span>Contact Support</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

