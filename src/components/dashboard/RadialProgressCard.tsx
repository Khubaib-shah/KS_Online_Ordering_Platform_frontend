import { motion } from 'motion/react';
import { ProgressData } from '@/types/dashboard';
import { SectionCard } from '@/components/ui/SectionCard';
import { Skeleton } from '@/components/ui/Skeleton';

interface RadialProgressCardProps {
  data: ProgressData | null;
  isLoading: boolean;
}

export function RadialProgressCard({ data, isLoading }: RadialProgressCardProps) {
  if (isLoading || !data) {
    return (
      <SectionCard
        title="Order Channel Share"
        description="Storefront vs POS distribution."
        className="h-[280px] flex flex-col justify-between"
      >
        <div className="flex-1 flex items-center justify-center mt-3">
          <div className="relative w-[180px] h-[90px] overflow-hidden flex items-end justify-center">
            {/* Semicircle skeleton */}
            <div className="absolute top-0 w-[180px] h-[180px] rounded-full border-[14px] border-slate-100 animate-pulse" />
            <div className="absolute top-[14px] w-[152px] h-[152px] rounded-full border-[14px] border-slate-50/60 animate-pulse" />

            <div className="relative z-10 flex flex-col items-center pb-2">
              <Skeleton className="h-6 w-14 rounded animate-pulse mb-1.5" />
              <Skeleton className="h-3 w-16 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </SectionCard>
    );
  }
  const arcLength = 229.34;
  const storefrontOffset = arcLength * (1 - data.percent / 100);
  const totalOffset = 0; // The light green background can represent the total or POS fill

  return (
    <SectionCard
      id="radial-progress-card"
      title="Order Channel Share"
      description="Storefront vs POS distribution."
      className="h-[280px] flex flex-col justify-between"
    >
      <div className="relative flex-1 flex flex-col items-center justify-center -mt-4 px-2">
        <svg viewBox="0 0 170 100" className="w-full max-w-[210px] sm:max-w-[230px] h-auto">
          <path
            d="M 12 85 A 73 73 0 0 1 158 85"
            fill="none"
            stroke="#ECECEC"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Semicircle Track - POS Layer (Light green) */}
          <motion.path
            d="M 12 85 A 73 73 0 0 1 158 85"
            fill="none"
            stroke="var(--color-accent-light)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: totalOffset }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
          />

          {/* Semicircle Track - Storefront Layer (Dark green) */}
          <motion.path
            d="M 12 85 A 73 73 0 0 1 158 85"
            fill="none"
            stroke="var(--color-accent-primary)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset: storefrontOffset }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />

          {/* SVG Text Elements for absolute precision and alignment */}
          <text
            x="85"
            y="56"
            textAnchor="middle"
            fill="#0F172A"
            style={{
              fontFamily: '"Poppins", "Inter", sans-serif',
              fontWeight: 700,
              fontSize: '34px'
            }}
          >
            {data.percent}%
          </text>

          <text
            x="85"
            y="85"
            textAnchor="middle"
            fill="#64748B"
            style={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 800,
              fontSize: '8px',
              letterSpacing: '0.12em'
            }}
          >
            {data.label || 'ORDERS COMPLETED'}
          </text>
        </svg>
      </div>

      {/* Legend below the arc - positioned to stick closely to bottom */}
      <div className="flex items-center justify-center gap-3.5 text-[10px] font-semibold font-inter text-text-secondary shrink-0 pb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-primary shrink-0" />
          <span>Storefront</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-light shrink-0" />
          <span>POS</span>
        </div>
      </div>
    </SectionCard>
  );
}

