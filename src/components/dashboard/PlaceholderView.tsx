import { motion } from 'motion/react';
import * as Icons from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/uiStore';

interface PlaceholderViewProps {
  title: string;
  description: string;
  iconName: keyof typeof Icons;
}

export function PlaceholderView({ title, description, iconName }: PlaceholderViewProps) {
  const IconComponent = Icons[iconName] as Icons.LucideIcon;
  const { setActiveNavId } = useUIStore();;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col gap-6"
    >
      {/* Page Title */}
      <div>
        <h1 className="font-poppins font-bold text-3xl sm:text-4xl text-text-primary leading-tight">
          {title}
        </h1>
        <p className="font-inter text-sm sm:text-base text-text-secondary mt-1">
          {description}
        </p>
      </div>

      {/* Main Beautiful Card Layout */}
      <Card hoverEffect={false} className="h-[450px] flex flex-col items-center justify-center text-center p-8 bg-white border border-border-subtle shadow-card rounded-card">
        {/* Animated Icon Circle */}
        <div className="w-20 h-20 rounded-3xl bg-accent-tint-bg text-accent-primary flex items-center justify-center border border-accent-light/10 shadow-sm shrink-0 mb-6">
          <IconComponent size={36} className="animate-pulse" style={{ animationDuration: '4s' }} />
        </div>

        {/* Info */}
        <h2 className="font-poppins font-bold text-2xl text-text-primary mb-2">
          {title} Interface
        </h2>
        <p className="font-inter text-sm text-text-secondary max-w-md mb-8 leading-relaxed">
          The {title.toLowerCase()} dashboard module is currently prepared for backend integration. Swapping the static typed data for real API routes from Prompt 2 will immediately go live here.
        </p>

        {/* CTA */}
        <Button
          variant="primary"
          onClick={() => setActiveNavId('dashboard')}
          className="flex items-center gap-2"
        >
          <Icons.ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Button>
      </Card>
    </motion.div>
  );
}
