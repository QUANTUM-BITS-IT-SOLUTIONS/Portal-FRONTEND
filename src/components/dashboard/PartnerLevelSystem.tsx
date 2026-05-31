import { motion } from 'framer-motion';
import {
  Crown,
  Medal,
  Award,
  Star,
  TrendingUp,
  Percent,
  Gift,
  Users,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PartnerLevel {
  id: string;
  name: string;
  icon: typeof Crown;
  color: string;
  bgColor: string;
  borderColor: string;
  minEarnings: number;
  maxEarnings: number | null;
  commissionRate: string;
  benefits: string[];
  unlocks: string[];
}

const partnerLevels: PartnerLevel[] = [
  {
    id: 'bronze',
    name: 'Bronze Partner',
    icon: Award,
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-300',
    minEarnings: 0,
    maxEarnings: 50000,
    commissionRate: '5%',
    benefits: [
      '5% commission on all referrals',
      'Access to basic marketing resources',
      'Email support',
      'Basic analytics dashboard',
    ],
    unlocks: [
      'Partner Pitch Deck',
      'Email Templates',
      'Basic Brand Assets',
    ],
  },
  {
    id: 'silver',
    name: 'Silver Partner',
    icon: Medal,
    color: 'text-slate-500',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    minEarnings: 50001,
    maxEarnings: 100000,
    commissionRate: '7.5%',
    benefits: [
      '7.5% commission on all referrals',
      'All Bronze benefits',
      'Priority email & chat support',
      'Monthly performance reports',
    ],
    unlocks: [
      'Premium Sales Deck',
      'Video Testimonials',
      'Custom Landing Page',
      'Lead Tracking Tools',
    ],
  },
  {
    id: 'gold',
    name: 'Gold Partner',
    icon: Crown,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    borderColor: 'border-warning/30',
    minEarnings: 100001,
    maxEarnings: null,
    commissionRate: '10%',
    benefits: [
      '10% commission on all referrals',
      'All Silver benefits',
      'VIP dedicated support',
      'Exclusive partner events',
      'Custom referral materials',
    ],
    unlocks: [
      'White-label Materials',
      'API Access',
      'Custom Integrations',
      'Priority Lead Routing',
      'Quarterly Strategy Sessions',
    ],
  },
];

interface PartnerLevelSystemProps {
  currentEarnings?: number;
  delay?: number;
}

export const PartnerLevelSystem = ({ currentEarnings = 20252, delay = 0 }: PartnerLevelSystemProps) => {
  // Determine current level based on earnings
  const getCurrentLevel = () => {
    for (let i = partnerLevels.length - 1; i >= 0; i--) {
      if (currentEarnings >= partnerLevels[i].minEarnings) {
        return partnerLevels[i];
      }
    }
    return partnerLevels[0];
  };

  const currentLevel = getCurrentLevel();
  const currentLevelIndex = partnerLevels.findIndex(l => l.id === currentLevel.id);
  const nextLevel = currentLevelIndex < partnerLevels.length - 1 ? partnerLevels[currentLevelIndex + 1] : null;

  // Calculate progress to next level
  const progressToNextLevel = nextLevel
    ? ((currentEarnings - currentLevel.minEarnings) / (nextLevel.minEarnings - currentLevel.minEarnings)) * 100
    : 100;

  const amountToNextLevel = nextLevel ? nextLevel.minEarnings - currentEarnings : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Current Level Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className={cn(
          "bg-card rounded-xl border-2 p-4 sm:p-6 shadow-card",
          currentLevel.borderColor
        )}
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 sm:p-3 rounded-xl", currentLevel.bgColor)}>
              <currentLevel.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", currentLevel.color)} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-display text-foreground">{currentLevel.name}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Your current partner status</p>
            </div>
          </div>
          <Badge className={cn("text-sm", currentLevel.bgColor, currentLevel.color)}>
            {currentLevel.commissionRate} Commission
          </Badge>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-xs sm:text-sm font-medium text-foreground">Progress to {nextLevel.name}</span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-accent">
                {formatCurrency(amountToNextLevel)} to go
              </span>
            </div>
            <Progress value={progressToNextLevel} className="h-2 sm:h-3 mb-2" />
            <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
              <span>{formatCurrency(currentLevel.minEarnings)}</span>
              <span>{formatCurrency(nextLevel.minEarnings)}</span>
            </div>
          </div>
        )}

        {/* Current Level Benefits */}
        <div className="mt-4 sm:mt-6">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-muted-foreground" />
            Your Benefits
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {currentLevel.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* All Levels Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.1, duration: 0.4 }}
        className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card"
      >
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Star className="w-5 h-5 text-warning" />
          <h3 className="text-base sm:text-lg font-bold font-display text-foreground">Partner Levels</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {partnerLevels.map((level, index) => {
            const isCurrentLevel = level.id === currentLevel.id;
            const isLocked = index > currentLevelIndex;

            return (
              <motion.div
                key={level.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.15 + index * 0.05 }}
                className={cn(
                  "relative rounded-xl border-2 p-4 transition-all",
                  isCurrentLevel ? level.borderColor : "border-border",
                  isLocked ? "opacity-70" : ""
                )}
              >
                {isCurrentLevel && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-accent text-accent-foreground text-[10px]">Current</Badge>
                  </div>
                )}

                {isLocked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("p-2 rounded-lg", level.bgColor)}>
                    <level.icon className={cn("w-4 h-4", level.color)} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{level.name}</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {level.maxEarnings
                        ? `${formatCurrency(level.minEarnings)} - ${formatCurrency(level.maxEarnings)}`
                        : `${formatCurrency(level.minEarnings)}+`
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-muted/50">
                  <Percent className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">{level.commissionRate} Commission</span>
                </div>

                <div className="space-y-1.5">
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Unlocks</p>
                  {level.unlocks.slice(0, 3).map((unlock, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {isLocked ? (
                        <Lock className="w-3 h-3 flex-shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-success flex-shrink-0" />
                      )}
                      <span className={isLocked ? "line-through opacity-60" : ""}>{unlock}</span>
                    </div>
                  ))}
                  {level.unlocks.length > 3 && (
                    <p className="text-[10px] text-accent">+{level.unlocks.length - 3} more</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Upgrade CTA */}
      {nextLevel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.3, duration: 0.4 }}
          className="p-4 sm:p-6 rounded-xl bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border border-accent/20"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl", nextLevel.bgColor)}>
                <nextLevel.icon className={cn("w-5 h-5", nextLevel.color)} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm sm:text-base">Unlock {nextLevel.name}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Earn {formatCurrency(amountToNextLevel)} more to reach the next level
                </p>
              </div>
            </div>
            <Button className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
              View Benefits
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
