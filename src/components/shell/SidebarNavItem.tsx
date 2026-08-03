
import * as Lucide from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { Tooltip } from '@/components/ui/Tooltip';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface SidebarNavItemProps {
  id: string;
  icon: keyof typeof Lucide;
  label: string;
  active: boolean;
  collapsed: boolean;
  badge?: string;
  onClick: () => void;
  key?: string | number;
}

export function SidebarNavItem({
  id,
  icon,
  label,
  active,
  collapsed,
  badge,
  onClick,
}: SidebarNavItemProps) {
  const IconComponent = Lucide[icon] as Lucide.LucideIcon;

  const content = (
    <Button variant="custom" size="none" onClick={onClick}
      className={cn(
        'relative w-full h-11 px-4 rounded-nav-item flex items-center justify-start gap-3.5 transition-colors cursor-pointer select-none font-inter text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2',
        active
          ? 'text-accent-primary font-semibold bg-white shadow-nav-active'
          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
      )}
    >
      {/* Sliding Active Left Indicator */}
      {active && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-2 bottom-2 w-1.5 bg-accent-primary rounded-r-md"
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        />
      )}

      {IconComponent && (
        <IconComponent
          size={18}
          className={cn(
            'shrink-0 transition-transform duration-200 group-hover:scale-110',
            active ? 'text-accent-primary' : 'text-text-secondary group-hover:text-text-primary'
          )}
        />
      )}

      {!collapsed && (
        <span className="truncate">{label}</span>
      )}

      {!collapsed && badge && (
        <Badge variant="notification" className="ml-auto shrink-0 animate-pulse">
          {badge}
        </Badge>
      )}
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip content={label} position="right">
        <div className="group w-full flex justify-center py-1">
          {content}
        </div>
      </Tooltip>
    );
  }

  return <div className="group w-full py-0.5">{content}</div>;
}
