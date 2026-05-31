import { motion } from 'framer-motion';
import { Zap, Share2, Mail, TrendingUp, Sparkles, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NextBestActionProps {
  totalReferrals: number;
  hasReferralCode: boolean;
  onShareLink?: () => void;
  onNavigate?: (tab: string) => void;
  delay?: number;
}

type UserStatus = 'new' | 'beginner' | 'active' | 'top';

interface ActionSuggestion {
  title: string;
  description: string;
  tip: string;
  icon: typeof Zap;
  actionText: string;
  actionType: 'share' | 'navigate';
  actionTarget?: string;
  variant: 'accent' | 'success' | 'warning';
}

const getActionByStatus = (status: UserStatus, hasReferralCode: boolean): ActionSuggestion => {
  if (!hasReferralCode) {
    return {
      title: 'Complete Your Profile',
      description: 'Set up your profile to get your unique referral link',
      tip: 'Partners with complete profiles convert 3x more leads',
      icon: Target,
      actionText: 'Go to Settings',
      actionType: 'navigate',
      actionTarget: 'settings',
      variant: 'warning',
    };
  }

  switch (status) {
    case 'new':
      return {
        title: 'Share Your Referral Link',
        description: 'Start earning by sharing your link with potential clients',
        tip: 'Top partners share their link daily on WhatsApp & LinkedIn',
        icon: Share2,
        actionText: 'Share Now',
        actionType: 'share',
        variant: 'accent',
      };
    case 'beginner':
      return {
        title: 'Use Email Template #2',
        description: 'This template has 40% higher response rate',
        tip: 'Follow up within 24 hours for best results',
        icon: Mail,
        actionText: 'View Templates',
        actionType: 'navigate',
        actionTarget: 'resources',
        variant: 'accent',
      };
    case 'active':
      return {
        title: 'Boost Your Conversions',
        description: 'You\'re doing great! Check analytics to optimize',
        tip: 'Top partners analyze their performance weekly',
        icon: TrendingUp,
        actionText: 'View Analytics',
        actionType: 'navigate',
        actionTarget: 'analytics',
        variant: 'success',
      };
    case 'top':
      return {
        title: 'You\'re a Top Performer! 🎉',
        description: 'Keep the momentum going with new strategies',
        tip: 'Share your success story to inspire others',
        icon: Sparkles,
        actionText: 'Explore Resources',
        actionType: 'navigate',
        actionTarget: 'resources',
        variant: 'success',
      };
  }
};

const getUserStatus = (totalReferrals: number): UserStatus => {
  if (totalReferrals === 0) return 'new';
  if (totalReferrals <= 3) return 'beginner';
  if (totalReferrals <= 10) return 'active';
  return 'top';
};

export const NextBestAction = ({
  totalReferrals,
  hasReferralCode,
  onShareLink,
  onNavigate,
  delay = 0,
}: NextBestActionProps) => {
  const status = getUserStatus(totalReferrals);
  const action = getActionByStatus(status, hasReferralCode);
  const Icon = action.icon;

  const handleAction = () => {
    if (action.actionType === 'share' && onShareLink) {
      onShareLink();
    } else if (action.actionType === 'navigate' && onNavigate && action.actionTarget) {
      onNavigate(action.actionTarget);
    }
  };

  const variantStyles = {
    accent: 'border-accent/30 bg-accent/5',
    success: 'border-success/30 bg-success/5',
    warning: 'border-warning/30 bg-warning/5',
  };

  const iconStyles = {
    accent: 'bg-accent/20 text-accent',
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
  };

  const buttonStyles = {
    accent: 'bg-accent hover:bg-accent/90 text-accent-foreground',
    success: 'bg-success hover:bg-success/90 text-success-foreground',
    warning: 'bg-warning hover:bg-warning/90 text-warning-foreground',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        'rounded-xl border p-4 sm:p-5 shadow-card',
        variantStyles[action.variant]
      )}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className={cn('p-2 sm:p-2.5 rounded-lg flex-shrink-0', iconStyles[action.variant])}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3.5 h-3.5 text-warning flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium text-warning uppercase tracking-wide">
              Next Best Action
            </span>
          </div>
          
          <h3 className="font-semibold text-sm sm:text-base text-foreground font-display mb-1">
            {action.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            {action.description}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Button
              onClick={handleAction}
              size="sm"
              className={cn('h-8 sm:h-9 text-xs sm:text-sm', buttonStyles[action.variant])}
            >
              {action.actionText}
            </Button>
            <p className="text-[10px] sm:text-xs text-muted-foreground italic">
              💡 {action.tip}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
