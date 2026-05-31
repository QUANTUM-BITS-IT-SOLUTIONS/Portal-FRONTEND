import { motion } from 'framer-motion';
import {
  Wallet,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  BanknoteIcon,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/currency';
import { toast } from 'sonner';

interface PayoutSectionProps {
  pendingAmount: number;
  paidAmount: number;
  totalEarnings: number;
  delay?: number;
}

const payoutRules = [
  { label: 'Minimum payout amount', value: '₹1,000' },
  { label: 'Processing time', value: '3-5 business days' },
  { label: 'Payout method', value: 'Bank Transfer / UPI' },
  { label: 'Payout cycle', value: '1st & 15th of each month' },
];

import { usePayouts } from '@/hooks/useDashboardData';

export const PayoutSection = ({
  pendingAmount,
  paidAmount,
  totalEarnings,
  delay = 0
}: PayoutSectionProps) => {
  const { data: payouts } = usePayouts();

  const nextPayoutDate = new Date();
  const currentDay = nextPayoutDate.getDate();
  if (currentDay < 15) {
    nextPayoutDate.setDate(15);
  } else {
    nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);
    nextPayoutDate.setDate(1);
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Payout Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-display text-foreground">Payout Summary</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Manage your earnings and payouts</p>
          </div>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
            <Calendar className="w-3 h-3 mr-1" />
            Next: {nextPayoutDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Badge>
        </div>

        {/* Payout Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 rounded-lg bg-warning/5 border border-warning/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-xs text-muted-foreground">Pending Payment</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-warning font-display">
              {formatCurrency(pendingAmount)}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-xs text-muted-foreground">Already Paid</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-success font-display">
              {formatCurrency(paidAmount)}
            </p>
          </div>

          <div className="p-3 sm:p-4 rounded-lg bg-accent/5 border border-accent/20">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Lifetime Earnings</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-accent font-display">
              {formatCurrency(totalEarnings)}
            </p>
          </div>
        </div>

        {/* Request Payout Button */}
        {/* <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <BanknoteIcon className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground text-sm sm:text-base">Request Manual Payout</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {canRequestPayout
                ? 'You have enough balance to request a payout'
                : `Minimum ₹1,000 required. You need ₹${(1000 - pendingAmount).toLocaleString('en-IN')} more.`
              }
            </p>
          </div>
          <Button
            onClick={handleRequestPayout}
            disabled={!canRequestPayout || isRequesting}
            className={`gap-2 ${canRequestPayout ? 'bg-accent hover:bg-accent/90' : ''}`}
          >
            <Wallet className="w-4 h-4" />
            {isRequesting ? 'Requesting...' : 'Request Payout'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div> */}
      </motion.div>

      {/* Payout Rules */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.1, duration: 0.4 }}
        className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-foreground text-sm sm:text-base">Payout Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {payoutRules.map((rule, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <span className="text-xs sm:text-sm text-muted-foreground">{rule.label}</span>
              <span className="text-xs sm:text-sm font-medium text-foreground">{rule.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-warning/5 border border-warning/20 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Note:</span> Commissions are marked as paid once the client completes their payment.
          </p>
        </div>
      </motion.div>

      {/* Recent Payouts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 0.2, duration: 0.4 }}
        className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card"
      >
        <h3 className="font-semibold text-foreground mb-4 text-sm sm:text-base">Recent Payouts</h3>

        <div className="space-y-3">
          {payouts?.length === 0 && (
            <p className="text-sm text-muted-foreground p-4 text-center bg-muted/30 rounded-lg">
              No payouts found.
            </p>
          )}
          {payouts?.map((payout) => (
            <div
              key={payout.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className={`w-4 h-4 ${payout.status === 'completed' ? 'text-success' : 'text-warning'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(Number(payout.amount))}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(payout.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className={`text-xs ${payout.status === 'completed' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                {payout.status}
              </Badge>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
