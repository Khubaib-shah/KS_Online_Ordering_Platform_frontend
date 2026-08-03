import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Eye, Bell } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function TimeTrackerCard() {
  const [elapsedTime, setElapsedTime] = useState('0h 00m');

  useEffect(() => {
    const calculateElapsed = () => {
      const now = new Date();
      const openingTime = new Date();
      openingTime.setHours(10, 0, 0, 0); // 10:00 AM of today

      let diffMs = now.getTime() - openingTime.getTime();

      if (diffMs < 0) {
        openingTime.setDate(openingTime.getDate() - 1);
        diffMs = now.getTime() - openingTime.getTime();
      }

      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      const formattedMinutes = diffMinutes < 10 ? `0${diffMinutes}` : diffMinutes;
      return `${diffHours}h ${formattedMinutes}m`;
    };

    setElapsedTime(calculateElapsed());

    const timer = setInterval(() => {
      setElapsedTime(calculateElapsed());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card
      hoverEffect={false}
      className="h-[280px] flex flex-col justify-between p-5.5 select-none rounded-card relative overflow-hidden bg-gradient-to-br from-accent-dark to-[#0A3826] border border-accent-primary shadow-button text-white"
    >
      {/* Decorative Wave Overlay Background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <path
          d="M0,50 Q25,70 50,50 T100,50 L100,100 L0,100 Z"
          fill="rgba(255,255,255,0.4)"
        />
        <path
          d="M0,60 Q20,40 40,60 T100,60 L100,100 L0,100 Z"
          fill="rgba(255,255,255,0.2)"
        />
      </svg>

      {/* Top Section */}
      <div className="relative z-10 flex flex-col gap-1">
        <span className="font-inter text-[12px] text-white/75 font-semibold">
          Restaurant Uptime Today
        </span>

        {/* Stopwatch value */}
        <h3 className="font-poppins font-bold text-3.5xl tracking-tight leading-none text-white my-1">
          {elapsedTime}
        </h3>

        {/* Pulsing live indicator row */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <motion.span
            animate={{ scale: [1, 1.3, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-2 h-2 rounded-full bg-accent-light shrink-0"
          />
          <span className="font-inter text-[11px] text-white/85 font-medium">
            3 active orders in kitchen
          </span>
        </div>
      </div>

      {/* Bottom Section: Dual Action Circle Buttons */}
      <div className="relative z-10 flex items-center justify-center gap-4.5 mb-1">
        {/* Play/Eye/Queue circular button */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          className="w-12 h-12 rounded-full bg-white text-accent-dark border border-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-accent-tint-bg transition-colors duration-200"
          aria-label="View Live Queue"
        >
          <Eye size={18} />
        </motion.button>

        {/* Alarm/Bell Alert circular button */}
        <motion.button
          whileTap={{ scale: 0.93 }}
          className="w-12 h-12 rounded-full bg-amber-500 text-white border border-amber-400 flex items-center justify-center cursor-pointer shadow-lg hover:bg-amber-600 transition-colors duration-200"
          aria-label="Kitchen Alert"
        >
          <Bell size={18} />
        </motion.button>
      </div>
    </Card>
  );
}
