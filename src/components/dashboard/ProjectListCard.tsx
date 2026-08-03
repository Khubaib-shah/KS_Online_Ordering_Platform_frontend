
import * as Lucide from 'lucide-react';
import { cn } from '@/lib/cn';
import { ActionItem } from '@/types/dashboard';
import { Skeleton } from '@/components/ui/Skeleton';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';

interface ProjectListCardProps {
  tasks: ActionItem[] | null;
  isLoading: boolean;
  onAddTask?: () => void;
}

export function ProjectListCard({ tasks, isLoading, onAddTask }: ProjectListCardProps) {
  if (isLoading || !tasks) {
    return (
      <SectionCard
        title="Kitchen Checklist"
        description="Daily preparation task trackers."
        className="h-[340px] flex flex-col"
      >
        <div className="flex-1 flex flex-col gap-4 no-scrollbar">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3.5">
              <div className="w-9.5 h-9.5 bg-slate-100 rounded-xl border border-slate-200/50 animate-pulse shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <Skeleton className="h-4 w-3/4 rounded animate-pulse" />
                <Skeleton className="h-3 w-1/4 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  // Define background and icon colors for chips to match the screenshot's variety
  const colorMap: Record<string, { bg: string; text: string }> = {
    Utensils: { bg: 'bg-red-50 border-red-100', text: 'text-red-500' },
    Tag: { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-500' },
    DollarSign: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-500' },
    Calendar: { bg: 'bg-purple-50 border-purple-100', text: 'text-purple-500' },
    ClipboardList: { bg: 'bg-orange-50 border-orange-100', text: 'text-orange-500' },
  };

  const newButton = (
    <Button
      variant="secondary"
      size="sm"
      onClick={onAddTask}
      className="h-8 px-3 rounded-full border border-border-subtle text-xs font-semibold font-inter flex items-center gap-1"
    >
      <Lucide.Plus size={12} />
      <span>New</span>
    </Button>
  );

  return (
    <SectionCard
      id="project-list-card"
      title="Kitchen Checklist"
      description="Daily preparation task trackers."
      action={newButton}
      className="h-[340px] flex flex-col"
    >
      {/* Task List (Clean rows, no heavy border, generous gap) */}
      <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-4 no-scrollbar">
        {tasks.map((task) => {
          const IconComponent = (Lucide[task.iconKey as keyof typeof Lucide] || Lucide.CheckSquare) as Lucide.LucideIcon;
          const colors = colorMap[task.iconKey] || { bg: 'bg-gray-50 border-gray-100', text: 'text-gray-500' };

          return (
            <div key={task.id} className="flex items-center gap-3.5 group cursor-pointer">
              {/* Dynamic Icon Chip */}
              <div
                className={cn(
                  'w-9.5 h-9.5 rounded-xl border flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-sm',
                  colors.bg
                )}
              >
                <IconComponent size={16} className={colors.text} />
              </div>

              {/* Text Meta */}
              <div className="flex-1 min-w-0">
                <h4 className="font-inter font-semibold text-[13.5px] text-text-primary leading-snug truncate group-hover:text-accent-primary transition-colors">
                  {task.title}
                </h4>
                <p className="font-inter text-[11px] text-text-secondary mt-0.5 leading-none">
                  {task.dueLabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}

