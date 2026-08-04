import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionCard } from '@/components/ui/SectionCard';
import { AnalyticsDataPoint } from '@/types/dashboard';
import { cn } from '@/lib/cn';

interface AnalyticsBarChartProps {
  data: AnalyticsDataPoint[] | null;
  isLoading: boolean;
  title?: string;
  description?: string;
}

export function AnalyticsBarChart({
  data,
  isLoading,
  title = "Weekly Order Volume",
  description = "Analysis of total orders completed day-by-day this week."
}: AnalyticsBarChartProps) {
  if (isLoading || !data) {
    return (
      <SectionCard
        title={title}
        description={description}
        className="lg:col-span-2 h-[340px] flex flex-col justify-between"
      >
        <div className="flex-1 flex items-end justify-between px-2 sm:px-6 h-[180px] mt-2 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center flex-1 h-full justify-end">
              <div className="w-8 sm:w-10 h-32 rounded-full bg-slate-100 animate-pulse border border-slate-200/50" />
              <div className="h-4 w-4 rounded bg-slate-100 mt-3 animate-pulse" />
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  // Find maximum value to scale heights proportionally
  const maxValue = Math.max(...data.map((d) => d.value));

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <SectionCard
      id="weekly-analytics-chart"
      title={title}
      description={description}
      className="lg:col-span-2 h-[340px] flex flex-col justify-between"
    >
      {/* The Visual Chart Area */}
      <div className="flex-1 flex items-end justify-between px-2 sm:px-6 h-[180px] relative mt-2 mb-2">

        {/* Dynamic Bars */}
        {data.map((item, index) => {
          // Calculate proportional height (max 150px)
          const barHeight = maxValue > 0 ? (item.value / maxValue) * 150 : 20;

          return (
            <div
              key={`${item.day}-${index}`}
              className="flex flex-col items-center flex-1 relative h-full justify-end cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Floating Badge (Shown on hover for any bar) */}
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{ bottom: `${barHeight + 10}px` }}
                    className="absolute z-10 bg-accent-dark text-white font-poppins font-semibold text-[10px] px-2 py-0.5 rounded-full shadow-button select-none whitespace-nowrap animate-fade-in"
                  >
                    {item.highlightBadge || `${item.value}`}
                    {/* Small caret */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-[2px] w-1.5 h-1.5 bg-accent-dark rotate-45" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Capsule Bar Container */}
              <div className="w-8 sm:w-10 bg-[#FAFAFA] border border-border-subtle/40 rounded-full h-full flex items-end overflow-hidden shadow-inner">
                {/* Active/Animated Bar Fill */}
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.06, ease: 'easeOut' }}
                  style={{
                    height: `${barHeight}px`,
                    transformOrigin: 'bottom',
                    ...(item.fillStyle === 'striped' ? {
                      backgroundImage: `repeating-linear-gradient(45deg, var(--accent-light) 0px, var(--accent-light) 2px, var(--accent-tint-bg) 2px, var(--accent-tint-bg) 6px)`
                    } : {})
                  }}
                  className={cn(
                    'w-full rounded-full transition-all duration-300',
                    item.fillStyle === 'solid-dark' && 'bg-accent-dark',
                    item.fillStyle === 'solid-light' && 'bg-accent-light',
                    item.fillStyle === 'striped' && 'border border-accent-light/30'
                  )}
                />
              </div>

              {/* X-Axis Label */}
              <span className="font-poppins font-semibold text-xs text-text-secondary mt-3">
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

