import { motion } from 'framer-motion';
import { useReferralStats } from '@/hooks/useReferralStats';
import { StatsCard } from './StatsCard';
import { EmptyState } from './EmptyState';
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Wallet,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';

interface ReferralStatsSectionProps {
  delay?: number;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-success/10 text-success border-success/20';
    case 'approved':
      return 'bg-accent/10 text-accent border-accent/20';
    case 'pending':
      return 'bg-warning/10 text-warning border-warning/20';
    case 'cancelled':
      return 'bg-destructive/10 text-destructive border-destructive/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const ReferralStatsSection = ({ delay = 0 }: ReferralStatsSectionProps) => {
  const { stats, referrals, commissions, loading, error } = useReferralStats();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6">
        <p className="text-destructive">Error loading referral statistics: {error}</p>
      </div>
    );
  }





  const handleShareLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/via/your-code`);
    toast.success('Referral link copied! Share it to start earning.');
  };

  // Show empty state if no referrals and no commissions
  if (stats.totalReferrals === 0 && stats.totalCommissions === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay }}
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-foreground">Referral Statistics</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your referrals and commission earnings</p>
        </motion.div>

        <EmptyState
          type="referrals"
          onAction={handleShareLink}
          delay={delay + 0.1}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
      >
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-foreground">Referral Statistics</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Track your referrals and commission earnings</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard
          title="Total Referrals"
          value={stats.totalReferrals}
          icon={UserPlus}
          delay={delay + 0.1}
        />
        <StatsCard
          title="Total Earned"
          value={formatCurrency(stats.totalCommissions)}
          icon={DollarSign}
          variant="success"
          delay={delay + 0.15}
        />
        <StatsCard
          title="Pending Payment"
          value={formatCurrency(stats.pendingCommissions)}
          icon={Clock}
          variant="warning"
          delay={delay + 0.2}
        />
        <StatsCard
          title="Conversion Rate"
          value={`${stats.conversionRate.toFixed(1)}%`}
          icon={TrendingUp}
          variant="accent"
          delay={delay + 0.25}
        />
      </div>

      {/* Earnings Breakdown and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
        {/* Earnings by Type REMOVED */}

        {/* Commission Status Breakdown */}

        {/* Commission Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.35 }}
          className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card"
        >
          <h3 className="text-base sm:text-lg font-bold font-display text-foreground mb-4 sm:mb-6">Commission Status</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-success/5 border border-success/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm sm:text-base">Paid Out</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Already received</p>
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-success">{formatCurrency(stats.paidCommissions)}</p>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-warning/5 border border-warning/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm sm:text-base">Pending</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Awaiting payout</p>
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-warning">{formatCurrency(stats.pendingCommissions)}</p>
            </div>

            <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-accent/5 border border-accent/20">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm sm:text-base">Total Earned</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Lifetime earnings</p>
                </div>
              </div>
              <p className="text-lg sm:text-xl font-bold text-accent">{formatCurrency(stats.totalCommissions)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Referrals Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.4 }}
        className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-border">
          <h3 className="text-base sm:text-lg font-bold font-display text-foreground">Your Referrals</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">Users who signed up with your referral code</p>
        </div>

        {referrals.length === 0 ? (
          <div className="p-8 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-foreground mb-2 text-sm sm:text-base">No referrals yet</h4>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              Share your referral link to start earning commissions when users sign up.
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="md:hidden p-3 space-y-3">
              {referrals.map((referral) => {
                const totalEarned = referral.commissions.reduce((sum, c) =>
                  c.status !== 'cancelled' ? sum + c.amount : sum, 0);

                return (
                  <div key={referral.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                          {referral.referredUser.firstName?.[0] || 'U'}
                          {referral.referredUser.lastName?.[0] || ''}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">
                          {referral.referredUser.firstName} {referral.referredUser.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {referral.referredUser.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Joined {formatDate(referral.createdAt)}</span>
                      <span className="font-semibold text-foreground">{formatCurrency(totalEarned)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Commission Rate</TableHead>
                    <TableHead className="text-right">Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => {
                    const totalEarned = referral.commissions.reduce((sum, c) =>
                      c.status !== 'cancelled' ? sum + c.amount : sum, 0);

                    return (
                      <TableRow key={referral.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {referral.referredUser.firstName?.[0] || 'U'}
                                {referral.referredUser.lastName?.[0] || ''}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">
                                {referral.referredUser.firstName} {referral.referredUser.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {referral.referredUser.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(referral.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                              {referral.commissionRate}%
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          {formatCurrency(totalEarned)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </motion.div>

      {/* Recent Commissions */}
      {commissions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.45 }}
          className="bg-card rounded-xl border border-border shadow-card overflow-hidden"
        >
          <div className="p-4 sm:p-6 border-b border-border">
            <h3 className="text-base sm:text-lg font-bold font-display text-foreground">Recent Commissions</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Your latest commission activity</p>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden p-3 space-y-3">
            {commissions.slice(0, 10).map((commission) => (
              <div key={commission.id} className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="capitalize text-xs">
                    {commission.commission_type.replace('_', '-')}
                  </Badge>
                  <Badge variant="outline" className={`${getStatusColor(commission.status)} text-xs`}>
                    {commission.status}
                  </Badge>
                </div>
                <p className="text-sm text-foreground">{commission.description || 'Commission earned'}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{formatDate(commission.created_at)}</span>
                  <span className="font-semibold text-foreground">{formatCurrency(Number(commission.amount))}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.slice(0, 10).map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="text-muted-foreground">
                      {formatDate(commission.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {commission.commission_type.replace('_', '-')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">
                      {commission.description || 'Commission earned'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(commission.status)}>
                        {commission.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {formatCurrency(Number(commission.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      )}
    </div>
  );
};
