import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  User,
  Mail,
  Building,
  Link2,
  DollarSign,
  Users,
  TrendingUp,
  Copy,
  ExternalLink,
  CheckCircle,
  Clock,
  CreditCard,
  Ban,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/currency';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

// Defined locally to match Prisma response structure
interface Student {
  id: string;
  name: string;
  email: string;
  phoneNumber: string | null;
  universityName: string | null;
  referralCode: string | null;
  panNumber: string | null;
  panVerified: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  createdAt: string;
  partnerTier?: {
    name: string;
    color: string;
    commissionPercentage: number;
  };
}

interface Client {
  businessName: string;
}

interface Lead {
  id: string;
  status: string;
  dealAmount: number | null;
  createdAt: string;
  client: Client;
}

interface Commission {
  id: string;
  amount: number;
  createdAt: string;
}

interface UserDetailPanelProps {
  userId: string;
  onClose: () => void;
}

const UserDetailPanel = ({ userId, onClose }: UserDetailPanelProps) => {
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['user-details', userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}`);
      return res.data as { user: Student; leads: Lead[]; commissions: Commission[] };
    },
    enabled: !!userId,
  });

  if (isLoading || !data) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed inset-y-0 right-0 w-full sm:w-[450px] bg-card border-l border-border shadow-xl z-50 overflow-y-auto p-4 flex items-center justify-center"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </motion.div>
    );
  }

  const { user, leads, commissions } = data;

  // Calculate stats
  const totalReferrals = leads.length;
  // Successful leads: paid, commission_approved, commission_paid, client_pays, work_starts
  const successfulLeads = leads.filter(l =>
    ['paid', 'commission_approved', 'commission_paid', 'client_pays', 'work_starts'].includes(l.status)
  ).length;
  const totalRevenue = leads.reduce((sum, lead) => sum + (Number(lead.dealAmount) || 0), 0);
  const conversionRate = totalReferrals > 0 ? ((successfulLeads / totalReferrals) * 100).toFixed(1) : '0';

  // Commission stats
  // 'commissions' are LedgerEntries of type 'student_commission'. They are already "paid" to the student's ledger.
  const totalCommissionPaid = commissions.reduce((sum, c) => sum + Number(c.amount), 0);

  // Pending commissions would come from Leads that are NOT yet paid but potentially will be.
  // We don't have that calculated easily here without knowing commission logic, 
  // but for now we can assume 'commissions' list contains the recognized earnings.
  // We'll hide "Pending Commissions" or set to 0 if we can't calculate it accurately 
  // without duplicating backend logic.
  // To keep UI consistent, we can just show 0 or calculate potential from open leads?
  // Let's stick to showing realized commissions.
  const pendingCommissions = 0;

  // Tier color mapping for proper display
  const getTierColorClass = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case 'bronze':
        return 'bg-amber-600';
      case 'silver':
        return 'bg-slate-500';
      case 'gold':
        return 'bg-amber-500';
      default:
        return 'bg-primary';
    }
  };

  const partnerInfo = user.partnerTier
    ? {
      level: user.partnerTier.name,
      color: getTierColorClass(user.partnerTier.name),
      commission: user.partnerTier.commissionPercentage || 5
    }
    : { level: 'Bronze', color: 'bg-amber-600', commission: 5 };

  const REFERRAL_BASE_URL = window.location.origin.includes('localhost')
    ? 'http://localhost:5173'
    : window.location.origin;

  const referralLink = user.referralCode
    ? `${REFERRAL_BASE_URL}/student/signup?ref=${user.referralCode}`
    : null;

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied!');
    }
  };

  const handleStatusUpdate = async (newStatus: 'ACTIVE' | 'BANNED') => {
    if (!window.confirm(`Are you sure you want to set this user to ${newStatus}?`)) return;

    setUpdating(true);
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ['user-details', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed inset-y-0 right-0 w-full sm:w-[500px] bg-card border-l border-border shadow-xl z-50 overflow-y-auto"
    >
      <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10 glass-effect">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{user.name}</h2>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.status === 'BANNED' ? (
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50 gap-1 h-8"
              onClick={() => handleStatusUpdate('ACTIVE')}
              disabled={updating}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Unban
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/20 hover:bg-destructive/10 gap-1 h-8"
              onClick={() => handleStatusUpdate('BANNED')}
              disabled={updating}
            >
              <Ban className="h-3.5 w-3.5" />
              Ban Student
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Status and Level */}
        <div className="flex items-center gap-3">
          <Badge
            variant={user.status === 'ACTIVE' ? "default" : "secondary"}
            className={`flex items-center gap-1 ${user.status === 'BANNED' ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}
          >
            {user.status === 'ACTIVE' ? (
              <><CheckCircle className="h-3 w-3" /> Active</>
            ) : user.status === 'BANNED' ? (
              <><Ban className="h-3 w-3" /> Banned</>
            ) : (
              <><Clock className="h-3 w-3" /> {user.status}</>
            )}
          </Badge>
          <Badge className={`${partnerInfo.color} text-white`}>
            {partnerInfo.level} Partner ({partnerInfo.commission}%)
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total Referrals</span>
            </div>
            <p className="text-xl font-bold">{totalReferrals}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Revenue Generated</span>
            </div>
            <p className="text-xl font-bold">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-xs">Total Earnings</span>
            </div>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totalCommissionPaid)}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Conversion Rate</span>
            </div>
            <p className="text-xl font-bold">{conversionRate}%</p>
          </div>
        </div>

        <Separator />

        {/* Referral Link */}
        <div>
          <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Link2 className="h-4 w-4" /> Referral Link
          </h3>
          {referralLink ? (
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-xs truncate font-mono">
                {referralLink}
              </code>
              <Button variant="outline" size="icon" onClick={copyReferralLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No referral code assigned</p>
          )}
        </div>

        <Separator />

        {/* User Info */}
        <div>
          <h3 className="text-sm font-semibold mb-3">User Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            {user.universityName && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.universityName}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {user.createdAt ? (
                <span className="text-sm">
                  Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">Join date unknown</span>
              )}
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.phoneNumber}</span>
              </div>
            )}
            <div className="pt-2 border-t border-border mt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Verification & Taxes</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{user.panNumber || 'No PAN updated'}</span>
                </div>
                {user.panNumber && (
                  <Badge variant={user.panVerified ? "default" : "outline"} className={user.panVerified ? "bg-green-100 text-green-800" : "text-amber-600 border-amber-200"}>
                    {user.panVerified ? 'Verified' : 'Pending Verification'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Recent Clients */}
        <div>
          <h3 className="text-sm font-semibold mb-3">Recent Clients ({leads.length})</h3>
          {leads.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {leads.slice(0, 5).map(lead => (
                <div key={lead.id} className="flex items-center justify-between bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg p-3 border border-border/50">
                  <div>
                    <p className="text-sm font-medium">{lead.client.businessName}</p>
                    <p className="text-xs text-muted-foreground">
                      {lead.createdAt ? format(new Date(lead.createdAt), 'MMM d, yyyy') : 'Date unknown'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(Number(lead.dealAmount) || 0)}</p>
                    <Badge variant="outline" className="text-xs capitalize mt-1">
                      {lead.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
              {leads.length > 5 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{leads.length - 5} more clients
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No clients referred yet</p>
          )}
        </div>

        {/* Payout History / Earnings */}
        <Separator />
        <div>
          <h3 className="text-sm font-semibold mb-3">Recent Earnings</h3>
          {commissions.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {commissions
                .slice(0, 5)
                .map(commission => (
                  <div key={commission.id} className="flex items-center justify-between p-2 rounded-lg border border-border/50">
                    <span className="text-sm text-muted-foreground">
                      {commission.createdAt ? format(new Date(commission.createdAt), 'MMM d, yyyy') : 'Date unknown'}
                    </span>
                    <span className="font-medium text-green-600 text-sm">
                      +{formatCurrency(Number(commission.amount))}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No earnings recorded yet</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default UserDetailPanel;
