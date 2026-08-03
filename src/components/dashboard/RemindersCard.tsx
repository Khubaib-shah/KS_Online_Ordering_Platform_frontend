import { Truck, Check } from 'lucide-react';
import { ReminderData } from '@/types/dashboard';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface RemindersCardProps {
  data: ReminderData | null;
  isLoading: boolean;
}

export function RemindersCard({ data, isLoading }: RemindersCardProps) {
  if (isLoading || !data) {
    return (
      <SectionCard
        title="Reminders"
        description="Important task for today."
        className="h-[340px] flex flex-col justify-between"
      >
        <div className="my-auto py-2 flex flex-col items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200/50 flex items-center justify-center shadow-sm shrink-0 animate-pulse" />
          <div className="flex flex-col gap-2.5 w-full">
            <Skeleton className="h-6 w-3/4 rounded animate-pulse" />
            <Skeleton className="h-4 w-1/2 rounded animate-pulse" />
          </div>
        </div>
        <Skeleton className="w-full h-11 rounded-full shrink-0 mt-2 animate-pulse" />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      id="reminders-card"
      title="Reminders"
      description="Important task for today."
      className="h-[340px] flex flex-col justify-between"
    >
      {/* Main Content Area */}
      <div className="my-auto py-2 flex flex-col items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-accent-tint-bg text-accent-primary border border-accent-light/20 flex items-center justify-center shadow-sm shrink-0">
          <Truck size={22} className="animate-bounce" style={{ animationDuration: '3s' }} />
        </div>

        <div className="flex flex-col gap-1.5">
          <h4 className="font-poppins font-bold text-lg leading-snug text-text-primary">
            {data.title}
          </h4>
          <span className="font-inter text-xs font-semibold text-text-secondary">
            Time: {data.timeRange}
          </span>
        </div>
      </div>

      {/* CTA Button */}
      <Button
        variant="primary"
        className="w-full h-11 flex items-center justify-center gap-2 bg-accent-primary text-white text-sm font-semibold rounded-full hover:bg-accent-dark shadow-button shrink-0 mt-2"
      >
        <Check size={16} />
        <span>{data.ctaLabel}</span>
      </Button>
    </SectionCard>
  );
}

