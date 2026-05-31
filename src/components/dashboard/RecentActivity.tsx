import { motion } from 'framer-motion';
import { Bell, DollarSign, UserPlus, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface Activity {
  id: string;
  type: 'conversion' | 'payment' | 'milestone' | 'achievement';
  title: string;
  description: string;
  time: string;
  amount?: number;
}

interface RecentActivityProps {
  delay?: number;
}

export const RecentActivity = ({ delay = 0 }: RecentActivityProps) => {
  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['recentActivity'],
    queryFn: async () => {
      const { data } = await api.get('/students/me/activity');
      return data as Activity[];
    }
  });

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'conversion':
        return UserPlus;
      case 'payment':
        return DollarSign;
      case 'milestone':
        return TrendingUp;
      case 'achievement':
        return Award;
      default:
        return Bell;
    }
  };

  const getIconStyles = (type: Activity['type']) => {
    switch (type) {
      case 'conversion':
        return 'bg-accent/10 text-accent';
      case 'payment':
        return 'bg-success/10 text-success';
      case 'milestone':
        return 'bg-chart-2/10 text-chart-2';
      case 'achievement':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card h-64 flex items-center justify-center">
        <p className="text-muted-foreground">Loading activity...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card"
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold font-display text-foreground">Recent Activity</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Your latest updates and notifications</p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity found.</p>
        ) : (
          activities.map((activity, index) => {
            const Icon = getIcon(activity.type);
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.1 * index }}
                className="flex items-start gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className={cn('p-1.5 sm:p-2 rounded-lg flex-shrink-0', getIconStyles(activity.type))}>
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm sm:text-base">{activity.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{activity.description}</p>
                  {/* <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{activity.time}</p> */}
                </div>
                {activity.amount && (
                  <div className="text-xs sm:text-sm font-semibold text-success flex-shrink-0">
                    +{formatCurrency(activity.amount)}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
