import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Zap, Calculator, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustIndicatorProps {
  variant?: 'live' | 'synced' | 'calculated' | 'secure';
  className?: string;
}

export const TrustIndicator = ({ variant = 'live', className }: TrustIndicatorProps) => {
  const [lastSynced, setLastSynced] = useState(new Date());
  const [timeAgo, setTimeAgo] = useState('Just now');

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - lastSynced.getTime()) / 1000);
      
      if (diff < 60) {
        setTimeAgo('Just now');
      } else if (diff < 120) {
        setTimeAgo('1 min ago');
      } else if (diff < 3600) {
        setTimeAgo(`${Math.floor(diff / 60)} mins ago`);
      } else {
        setTimeAgo(`${Math.floor(diff / 3600)} hrs ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000);
    return () => clearInterval(interval);
  }, [lastSynced]);

  const variants = {
    live: {
      icon: Zap,
      text: 'Live data – updates in real time',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    synced: {
      icon: RefreshCw,
      text: `Last synced ${timeAgo}`,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    calculated: {
      icon: Calculator,
      text: 'Commission calculated automatically',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    secure: {
      icon: Shield,
      text: 'Data encrypted & secure',
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
  };

  const config = variants[variant];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-1.5 text-xs', className)}>
      <div className={cn('p-1 rounded', config.bgColor)}>
        <Icon className={cn('w-3 h-3', config.color)} />
      </div>
      <span className={cn('font-medium', config.color)}>{config.text}</span>
      {variant === 'live' && (
        <motion.span 
          className="w-1.5 h-1.5 rounded-full bg-success"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};

// Compact inline version
export const InlineTrustBadge = ({ 
  text, 
  icon: Icon = Clock, 
  className 
}: { 
  text: string; 
  icon?: React.ElementType; 
  className?: string;
}) => (
  <span className={cn('inline-flex items-center gap-1 text-xs text-muted-foreground', className)}>
    <Icon className="w-3 h-3" />
    {text}
  </span>
);
