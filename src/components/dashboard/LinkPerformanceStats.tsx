import { motion } from 'framer-motion';
import { MousePointer, UserPlus, TrendingUp, Eye, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

interface LinkPerformanceStatsProps {
  delay?: number;
}

// Mock data - in production this would come from analytics
const mockStats = {
  clicks: 156,
  clicksTrend: 12,
  signups: 28,
  signupsTrend: 8,
  conversionRate: 17.9,
  conversionTrend: -2.1,
  views: 342,
  viewsTrend: 24,
  potentialEarnings: 84000,
};

export const LinkPerformanceStats = ({ delay = 0 }: LinkPerformanceStatsProps) => {
  const stats = [
    {
      label: 'Link Views',
      value: mockStats.views,
      trend: mockStats.viewsTrend,
      icon: Eye,
      color: 'bg-muted text-muted-foreground',
    },
    {
      label: 'Link Clicks',
      value: mockStats.clicks,
      trend: mockStats.clicksTrend,
      icon: MousePointer,
      color: 'bg-accent/10 text-accent',
    },
    {
      label: 'Sign-ups',
      value: mockStats.signups,
      trend: mockStats.signupsTrend,
      icon: UserPlus,
      color: 'bg-success/10 text-success',
    },
    {
      label: 'Conversion Rate',
      value: `${mockStats.conversionRate}%`,
      trend: mockStats.conversionTrend,
      icon: TrendingUp,
      color: 'bg-warning/10 text-warning',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-display text-foreground">Link Performance</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Last 30 days</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.05 * index }}
            className="p-3 sm:p-4 rounded-lg border border-border bg-background"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-1.5 rounded-lg ${stat.color}`}>
                <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-medium ${
                stat.trend >= 0 ? 'text-success' : 'text-destructive'
              }`}>
                {stat.trend >= 0 ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(stat.trend)}%
              </div>
            </div>
            <p className="text-lg sm:text-xl font-bold font-display text-foreground">{stat.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Funnel Visualization */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Conversion Funnel</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-full bg-muted rounded-full h-6 sm:h-8 overflow-hidden relative">
              <div 
                className="h-full bg-muted-foreground/20 rounded-full flex items-center px-3"
                style={{ width: '100%' }}
              >
                <span className="text-[10px] sm:text-xs font-medium text-foreground">Views: {mockStats.views}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-full bg-muted rounded-full h-6 sm:h-8 overflow-hidden relative">
              <div 
                className="h-full bg-accent/30 rounded-full flex items-center px-3"
                style={{ width: `${(mockStats.clicks / mockStats.views) * 100}%` }}
              >
                <span className="text-[10px] sm:text-xs font-medium text-foreground">Clicks: {mockStats.clicks}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-full bg-muted rounded-full h-6 sm:h-8 overflow-hidden relative">
              <div 
                className="h-full bg-success/40 rounded-full flex items-center px-3"
                style={{ width: `${(mockStats.signups / mockStats.views) * 100}%` }}
              >
                <span className="text-[10px] sm:text-xs font-medium text-foreground">Sign-ups: {mockStats.signups}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Potential Earnings */}
      <div className="mt-4 p-3 sm:p-4 rounded-lg bg-success/5 border border-success/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Pipeline Value</p>
            <p className="text-lg sm:text-xl font-bold text-success font-display">{formatCurrency(mockStats.potentialEarnings)}</p>
          </div>
          <p className="text-xs text-muted-foreground max-w-[150px] text-right">
            Estimated commission if all sign-ups convert
          </p>
        </div>
      </div>
    </motion.div>
  );
};
