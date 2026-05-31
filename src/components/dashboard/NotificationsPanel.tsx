import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, UserPlus, DollarSign, TrendingUp, Award, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currency';
import { useState } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { Skeleton } from '@/components/ui/skeleton';

// Removed interface NotificationsPanelProps since children is no longer needed

export const NotificationsPanel = () => {
  const {
    notifications,
    loading,
    markAsRead,
    markAllAsRead,
    removeNotification
  } = useNotifications();

  const [open, setOpen] = useState(false);
  // Filter valid notifications and count unread
  const validNotifications = notifications || [];

  const unreadCount = validNotifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
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
        return Bell; // system or other
    }
  };

  const getIconStyles = (type: Notification['type']) => {
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 sm:h-10 sm:w-10">
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] sm:text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0"
        align="end"
        sideOffset={8}
      >
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Notifications</h3>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-accent hover:text-accent"
              >
                <Check size={14} className="mr-1" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence>
              {validNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                </div>
              ) : (
                validNotifications.map((notification) => {
                  const Icon = getIcon(notification.type);
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={cn(
                        'flex items-start gap-3 p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer',
                        !notification.read && 'bg-accent/5'
                      )}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className={cn('p-2 rounded-lg shrink-0', getIconStyles(notification.type))}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className={cn(
                              'text-sm text-foreground',
                              !notification.read && 'font-semibold'
                            )}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.description}
                            </p>
                          </div>

                          {/* 
                              Only show delete button if we want to allow removing from view.
                              Since backend doesn't support delete yet, we can keeping it as UI-only 
                              or remove it. Keeping for now as UI remove.
                          */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-muted-foreground">{notification.time}</p>
                          {notification.amount && (
                            <span className="text-xs font-semibold text-success">
                              +{formatCurrency(notification.amount)}
                            </span>
                          )}
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />
                      )}
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          )}
        </div>

        {validNotifications.length > 0 && (
          <div className="border-t border-border p-3">
            <Button
              variant="ghost"
              className="w-full text-accent"
              size="sm"
              onClick={() => {
                markAllAsRead();
                setOpen(false);
              }}
            >
              Mark all as read & Close
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
