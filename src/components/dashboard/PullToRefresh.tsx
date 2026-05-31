import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  progress: number;
  shouldRefresh: boolean;
}

export const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  progress,
  shouldRefresh,
}: PullToRefreshIndicatorProps) => {
  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <motion.div
      className="flex items-center justify-center py-4"
      style={{
        height: pullDistance,
        opacity: Math.min(progress * 2, 1),
      }}
      initial={false}
    >
      <motion.div
        animate={{ rotate: isRefreshing ? 360 : progress * 180 }}
        transition={isRefreshing ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0 }}
        className={cn(
          "p-2 rounded-full",
          shouldRefresh || isRefreshing ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <RefreshCw className="w-5 h-5" />
      </motion.div>
      {!isRefreshing && pullDistance > 20 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {shouldRefresh ? 'Release to refresh' : 'Pull to refresh'}
        </span>
      )}
      {isRefreshing && (
        <span className="ml-2 text-sm text-muted-foreground">Refreshing...</span>
      )}
    </motion.div>
  );
};
