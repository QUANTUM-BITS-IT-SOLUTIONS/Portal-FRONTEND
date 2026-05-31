import { motion } from 'framer-motion';
import { LucideIcon, Users, TrendingUp, BarChart3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/currency';

interface EmptyStateProps {
  type: 'referrals' | 'analytics' | 'clients' | 'earnings';
  onAction?: () => void;
  delay?: number;
}

interface EmptyStateConfig {
  icon: LucideIcon;
  title: string;
  description: string;
  cta: string;
  earningPotential: string;
  illustration: string;
}

const configs: Record<string, EmptyStateConfig> = {
  referrals: {
    icon: Users,
    title: 'No Referrals Yet',
    description: 'Start sharing your link to build your referral network and earn commissions.',
    cta: 'Share Your Link',
    earningPotential: `Earn up to ${formatCurrency(5000)} per referral`,
    illustration: '👥',
  },
  analytics: {
    icon: BarChart3,
    title: 'No Analytics Data',
    description: 'Your performance analytics will appear here once you start getting conversions.',
    cta: 'View Resources',
    earningPotential: 'Track your growth and optimize performance',
    illustration: '📊',
  },
  clients: {
    icon: FileText,
    title: 'No Clients Yet',
    description: 'Converted clients will appear here. Share your referral link to get started!',
    cta: 'Copy Referral Link',
    earningPotential: `Average deal size: ${formatCurrency(15000)}`,
    illustration: '📋',
  },
  earnings: {
    icon: TrendingUp,
    title: 'No Earnings Yet',
    description: 'Your earnings will show up here when your referrals convert.',
    cta: 'Learn How to Earn',
    earningPotential: `Top partners earn ${formatCurrency(40000)}+/month`,
    illustration: '💰',
  },
};

export const EmptyState = ({ type, onAction, delay = 0 }: EmptyStateProps) => {
  const config = configs[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card rounded-xl border border-border p-6 sm:p-8 shadow-card"
    >
      <div className="flex flex-col items-center text-center max-w-sm mx-auto">
        {/* Illustration */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.1, type: 'spring', stiffness: 200 }}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4"
        >
          <span className="text-3xl sm:text-4xl">{config.illustration}</span>
        </motion.div>

        {/* Icon Badge */}
        <div className="p-2 rounded-lg bg-accent/10 mb-3">
          <Icon className="w-5 h-5 text-accent" />
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold font-display text-foreground mb-2">
          {config.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4">
          {config.description}
        </p>

        {/* Earning Potential Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs sm:text-sm font-medium mb-5"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          {config.earningPotential}
        </motion.div>

        {/* CTA Button */}
        <Button
          onClick={onAction}
          className="bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {config.cta}
        </Button>

        {/* Additional Tips */}
        <div className="mt-6 pt-4 border-t border-border w-full">
          <p className="text-xs text-muted-foreground">
            💡 <span className="font-medium">Pro Tip:</span> Partners who share daily earn 5x more on average
          </p>
        </div>
      </div>
    </motion.div>
  );
};
